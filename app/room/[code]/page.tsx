"use client";

import React, { useEffect, useMemo, useRef, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";  

/* ---------- Types ---------- */
type PeerInfo = { pc: RTCPeerConnection; stream: MediaStream; name?: string };
type Message = { name?: string; from?: string; text?: string; attachment?: Attachment };
type Participant = { id: string; name?: string };
type Attachment = { url: string; name: string; type: string; size: number };

type RoomPageProps = {
  params: Promise<{ code: string }>;   // ← FIX
};


const ICE: RTCConfiguration = { iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] };

export default function RoomPage({ params }: RoomPageProps) {
  const { data: session, status } = useSession();  
  const isMobile = useIsMobile();
  const search = useSearchParams(); // 🔍 get query params from hook
  const resolvedParams = use(params);  // ← FIX
  const code = decodeURIComponent(resolvedParams.code);  // ← FIX
  const appointmentId = search.get("appointmentid") ?? "";
  const appointmentToken = search.get("token") ?? "";

  const rawName = search.get("name");
  const nameFromQuery = rawName ?? "";
  const router = useRouter();
  const [selfStream, setSelfStream] = useState<MediaStream | null>(null);

  const HIDE_REMOTE_TILES = true;
  // Resolved display name
  const [displayName, setDisplayName] = useState<string>("");

  // Env
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "";
  const WP_ENDPOINT = process.env.NEXT_PUBLIC_WP_ENDPOINT || "";
  const WP_TOKEN = process.env.NEXT_PUBLIC_WP_TOKEN || "";
  const WP_BOOKLY_VALIDATE = process.env.NEXT_PUBLIC_WP_BOOKLY_VALIDATE || "";

  const [validationStatus, setValidationStatus] = useState<"checking" | "ok" | "failed">("checking");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Recording refs
  const stageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageVideoRef = useRef<HTMLVideoElement | null>(null); // big stage <video>
  const drawRafRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // State
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [peers, setPeers] = useState<Record<string, PeerInfo>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatText, setChatText] = useState("");
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [panelTab, setPanelTab] = useState<"people" | "chat">("people");
  const [panelOpen, setPanelOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;            // SSR: default open
    return !window.matchMedia("(max-width:768px)").matches;    // mobile → closed, desktop → open
  });



 

  
  const [unreadChat, setUnreadChat] = useState(0);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [stageId, setStageId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  // Timer state
  const [durationMin, setDurationMin] = useState<30 | 60>(60);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(0);
  const [warned5m, setWarned5m] = useState(false);
  const endPostedRef = useRef(false);

  const pinnedIdRef = useRef<string | null>(null);
  useEffect(() => { pinnedIdRef.current = pinnedId; }, [pinnedId]);

  // Recording UI state
  const [recording, setRecording] = useState(false);

  function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
      const mql = window.matchMedia(`(max-width:${breakpoint}px)`);
      const onChange = () => setIsMobile(mql.matches);
      onChange();
      mql.addEventListener?.("change", onChange);
      return () => mql.removeEventListener?.("change", onChange);
    }, [breakpoint]);
    return isMobile;
  }

  useEffect(() => {
  setPanelOpen(!isMobile);   // auto-close on mobile, auto-open on desktop
}, [isMobile]);

  // Derive once session/LS are available
useEffect(() => {
  // 1) from session
  const fromSession = session?.user?.name?.trim();

  // 2) from localStorage
  let fromLocal: string | null = null;
  if (typeof window !== "undefined") {
    // if NextAuth added/updated token, persist it too (optional)
    if ((session as any)?.wpToken) localStorage.setItem("wpToken", (session as any).wpToken);
    if (session?.user?.name) localStorage.setItem("wpUser", session.user.name);

    fromLocal = localStorage.getItem("wpUser");
  }

  // 3) from query
  const fromQuery = nameFromQuery?.trim() || null;

  // 4) ultimate fallback (short random suffix to avoid pure "Guest")
  const fallback = `Guest-${Math.random().toString(36).slice(2, 6)}`;

  const finalName = fromSession || fromLocal || fromQuery || fallback;
  setDisplayName(finalName);

  // if we didn’t have a stored name, persist the resolved one
  if (typeof window !== "undefined" && !fromLocal) {
    localStorage.setItem("wpUser", finalName);
  }
}, [session, status, nameFromQuery]);

  // ==========================================================
  // Bookly appointment validation (arg 2 = appointmentId, arg 3 = token)
  // ==========================================================
  useEffect(() => {
    async function validateAppointment() {
      // Basic presence checks

      console.log("Validating appointment:", { appointmentId, appointmentToken, code });
      if (!appointmentId || !appointmentToken) {
        setValidationStatus("failed");
        setValidationError("Missing appointment information in the link.");
        return;
      }

      if (!WP_BOOKLY_VALIDATE) {
        setValidationStatus("failed");
        setValidationError("Validation endpoint is not configured.");
        return;
      }

      setValidationStatus("checking");
      setValidationError(null);

      try {
        const res = await fetch(WP_BOOKLY_VALIDATE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointment_id: appointmentId,
            token: appointmentToken,
            room: code,
          }),
        });

        const json = await res.json().catch(() => null);

         // Expect your WP REST API to return { valid: true/false, message?: string }
        if (!res.ok || !json?.valid) {
          setValidationStatus("failed");
          setValidationError(
            json?.message || "Your appointment link is invalid or expired."
          );
          return;
        }

        // If backend has already verified Bookly startdate + customer token → we’re good
        setValidationStatus("ok");
      } catch (err) {
        console.error("Appointment validation failed:", err);
        setValidationStatus("ok"); // TEMP OVERRIDE
        setValidationError("Could not verify your appointment. Please try again.");
      }
    }

    validateAppointment();
  }, [WP_BOOKLY_VALIDATE, appointmentId, appointmentToken, code]);


  /* ==========================================================
     Socket + WebRTC
     ========================================================== */
  useEffect(() => {
    if (!displayName || validationStatus !== "ok") return;
    const socket = io(SOCKET_URL || (typeof window !== "undefined" ? window.location.origin : ""), {
      auth: { name: displayName }, 
      path: "/socket.io",
      timeout: 10000,
      // default transports (polling -> upgrade) are most robust behind proxies
    });
    socketRef.current = socket;

    setSelfId(null);
    socket.on("connect", () => setSelfId(socket.id ?? null));

    const peerConns = new Map<string, RTCPeerConnection>();
    const audioMonitors = new Map<string, () => void>();
    const pendingIce = new Map<string, RTCIceCandidateInit[]>();

    async function flushPendingIce(id: string) {
      const pc = peerConns.get(id);
      if (!pc || !pc.remoteDescription) return;
      const queue = pendingIce.get(id) ?? [];
      while (queue.length) {
        const cand = queue.shift()!;
        try {
          // Some servers send “null”/end-of-candidates markers: ignore gracefully
          if (cand && (cand.candidate ?? "") !== "") {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          }
        } catch (e) {
          console.warn("addIceCandidate failed for", id, e);
        }
      }
    }
    

    async function ensurePeer(id: string): Promise<RTCPeerConnection> {
      const existing = peerConns.get(id);
      if (existing) return existing;


      const pc = new RTCPeerConnection(ICE);
      if (!pendingIce.has(id)) pendingIce.set(id, []);
      peerConns.set(id, pc);

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current as MediaStream);
        });
      }

      pc.onicecandidate = (ev) => {
        if (ev.candidate) socket.emit("ice-candidate", { to: id, candidate: ev.candidate });
      };

      pc.ontrack = (ev) => {
        const [remoteStream] = ev.streams;
        if (!remoteStream) return;
        setPeers((prev) => {
          const copy: Record<string, PeerInfo> = { ...prev };
          copy[id] = copy[id] || { pc, stream: remoteStream };
          copy[id].stream = remoteStream;
          return copy;
        });
        setStageId((curr) => curr ?? id); // first remote to stage
        startRemoteAudioMonitor(id, remoteStream);
      };

      return pc;
    }

    function startRemoteAudioMonitor(id: string, stream: MediaStream) {
      if (audioMonitors.has(id)) return;
      try {
        const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new AC();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        const data = new Uint8Array(analyser.frequencyBinCount);
        src.connect(analyser);
        let raf = 0;
        const tick = () => {
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          if (!pinnedIdRef.current && avg > 16) {
            setStageId((prev) => (prev !== id ? id : prev));
          }
          raf = requestAnimationFrame(tick);
        };
        tick();
        audioMonitors.set(id, () => {
          cancelAnimationFrame(raf);
          try {
            src.disconnect();
            analyser.disconnect();
            ctx.close();
          } catch {}
        });
      } catch {
        /* ignore if AudioContext not available */
      }
    }

    async function initMedia() {
      if (!navigator?.mediaDevices?.getUserMedia) {
        alert("Camera/mic requires HTTPS (or localhost) in a modern browser.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      localStreamRef.current = stream;
      setSelfStream(stream);
      if (localVideoRef.current) {
        (localVideoRef.current as HTMLVideoElement & { srcObject?: MediaStream }).srcObject = stream;
      }
      socket.emit("join", { room: code, displayName });
    }

    // Presence + Chat
    socket.on("participants", ({ participants: list }: { participants: Participant[] }) => {
      setParticipants(list);
    });

    socket.on("chat", (m: Message) => {
      setMessages((prev) => [...prev, m]);
      if (!(panelOpen && panelTab === "chat")) setUnreadChat((c) => c + 1);
    });

    // Signaling
    socket.on("need-offer", async ({ targetId }: { targetId: string }) => {
      const pc = await ensurePeer(targetId);
      try {
        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
        await pc.setLocalDescription(offer);
        socket.emit("offer", { to: targetId, sdp: offer });
      } catch (e) {
        console.error(e);
      }
    });

    socket.on("offer", async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
      const pc = await ensurePeer(from);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { to: from, sdp: answer });
    
      await flushPendingIce(from); // <— NEW
    });
    

    socket.on("answer", async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
      const pc = peerConns.get(from);
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      await flushPendingIce(from); // <— NEW
    });
    
    socket.on("ice-candidate", async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit | null }) => {
      const pc = peerConns.get(from);
      if (!pc) return;
    
      // Handle “end of candidates” / nulls without throwing
      if (!candidate || (candidate.candidate ?? "") === "") return;
    
      if (!pc.remoteDescription) {
        // Remote description not set yet → queue it
        (pendingIce.get(from) ?? []).push(candidate);
        pendingIce.set(from, pendingIce.get(from)!); // ensure map updated
        return;
      }
    
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("addIceCandidate failed (live)", e);
      }
    });
    

    socket.on("user-left", ({ id }: { id: string }) => {
      const pc = peerConns.get(id);
      if (pc) {
        pc.getSenders().forEach((s) => s.track && s.track.stop?.());
        pc.close();
      }
      peerConns.delete(id);
      pendingIce.delete(id);
      setPeers((prev) => {
        const copy: Record<string, PeerInfo> = { ...prev };
        delete copy[id];
        return copy;
      });
      setStageId((current) => (current === id ? (Object.keys(peers)[0] ?? null) : current));
    });

    void initMedia();

    return () => {
      try {
        socket.disconnect();
      } catch {}
      peerConns.forEach((pc) => {
        pc.getSenders().forEach((s) => s.track && s.track.stop?.());
        pc.close();
      });
      peerConns.clear();
      audioMonitors.forEach((stop) => {
        try {
          stop();
        } catch {}
      });
      audioMonitors.clear();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, displayName, SOCKET_URL]);

  /* ==========================================================
     Timer: start when ≥2 participants, warn at T-5m, end at 0
     ========================================================== */
  useEffect(() => {
    const liveCount = participants.length;
    if (startedAt == null && liveCount >= 2) {
      const start = Date.now();
      const end = start + durationMin * 60 * 1000;
      setStartedAt(start);
      setEndsAt(end);
      setWarned5m(false);
      socketRef.current?.emit("chat", {
        room: code,
        text: `⏱ Timer started for ${durationMin} min. Ends at ${new Date(end).toLocaleTimeString()}.`,
      });
    }
  }, [participants, startedAt, durationMin, code]);

  useEffect(() => {
    if (!startedAt || !endsAt) return;
    const id = window.setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, Math.floor((endsAt - now) / 1000));
      setTimeLeftSec(left);
      if (left === 5 * 60 && !warned5m) {
        setWarned5m(true);
        socketRef.current?.emit("chat", { room: code, text: "⏰ 5 minutes remaining." });
      }
      if (left === 0) {
        void endMeeting("timeout");
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [startedAt, endsAt, warned5m, code]);

  function fmtClock(totalSec: number): string {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  async function postToWordPress(outcome: "timeout" | "left") {
    if (!WP_ENDPOINT || endPostedRef.current) return;
    endPostedRef.current = true;

    const endTs = Date.now();
    const startedTs = startedAt ?? endTs;

    const payload = {
      room: code,
      startedAt: new Date(startedTs).toISOString(),
      endedAt: new Date(endTs).toISOString(),
      outcome, // "timeout" | "left"
      durationSec: Math.max(0, Math.floor((endTs - startedTs) / 1000)),
      participants: participants.map((p) => ({ id: p.id, name: p.name ?? "Guest" })),
    };

    try {
      await fetch(WP_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(WP_TOKEN ? { Authorization: `Bearer ${WP_TOKEN}` } : {}),
        },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error("WP post failed:", e);
    }
  }

  async function endMeeting(outcome: "timeout" | "left") {
    await postToWordPress(outcome);
    leaveCall();
  }

  /* ==========================================================
     Recording helpers
     ========================================================== */
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function buildComposedStream(): MediaStream | null {
    const stageVideo = stageVideoRef.current;
    const pipVideo = localVideoRef.current;
    if (!stageVideo) return null;

    // Canvas
    const canvas = stageCanvasRef.current ?? document.createElement("canvas");
    stageCanvasRef.current = canvas;

    // Use the stage element size as a hint
    const rect = stageVideo.getBoundingClientRect();
    const W = Math.max(640, Math.floor(rect.width) || 1280);
    const H = Math.max(360, Math.floor(rect.height) || 720);
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const draw = () => {
      try {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);
        if (stageVideo.readyState >= 2) ctx.drawImage(stageVideo, 0, 0, W, H);
        if (pipVideo && pipVideo.readyState >= 2) {
          const pipW = Math.floor(W * 0.25);
          const pipH = Math.floor(pipW / (16 / 9));
          const pad = 16;
          const x = W - pipW - pad;
          const y = H - pipH - pad;

          ctx.save();
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = "#000";
          roundRect(ctx, x - 2, y - 2, pipW + 4, pipH + 4, 12);
          ctx.fill();
          ctx.restore();

          ctx.save();
          roundRect(ctx, x, y, pipW, pipH, 10);
          ctx.clip();
          ctx.drawImage(pipVideo, x, y, pipW, pipH);
          ctx.restore();
        }
      } catch {}
      drawRafRef.current = requestAnimationFrame(draw);
    };
    if (drawRafRef.current) cancelAnimationFrame(drawRafRef.current);
    drawRafRef.current = requestAnimationFrame(draw);

    const canvasStream = canvas.captureStream(30);

    // Audio mix (local + all remote)
    const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AC();
    audioCtxRef.current = audioCtx;
    const dest = audioCtx.createMediaStreamDestination();

    // local mic
    const local = localStreamRef.current;
    if (local) {
      local.getAudioTracks().forEach((t) => {
        const s = new MediaStream([t]);
        const src = audioCtx.createMediaStreamSource(s);
        src.connect(dest);
      });
    }

    // remotes
    Object.values(peers).forEach((p) => {
      p.stream.getAudioTracks().forEach((t) => {
        const s = new MediaStream([t]);
        const src = audioCtx.createMediaStreamSource(s);
        src.connect(dest);
      });
    });

    dest.stream.getAudioTracks().forEach((a) => canvasStream.addTrack(a));
    return canvasStream;
  }

  async function startRecording() {
    if (recording) return;
    const composed = buildComposedStream();
    if (!composed) {
      alert("Unable to start recorder.");
      return;
    }
    recordedChunksRef.current = [];

    let mime = "video/webm;codecs=vp9,opus";
    if (!MediaRecorder.isTypeSupported(mime)) mime = "video/webm;codecs=vp8,opus";
    if (!MediaRecorder.isTypeSupported(mime)) mime = "video/webm";

    const mr = new MediaRecorder(composed, { mimeType: mime });
    recorderRef.current = mr;
    mr.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) recordedChunksRef.current.push(ev.data);
    };
    mr.onstop = () => {
      if (drawRafRef.current) cancelAnimationFrame(drawRafRef.current);
      drawRafRef.current = null;
      try { audioCtxRef.current?.close(); } catch {}

      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${code}-${new Date().toISOString().replace(/[:.]/g, "-")}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    };
    mr.start(1000);
    setRecording(true);
  }

  function stopRecording() {
    if (!recording) return;
    try { recorderRef.current?.stop(); } catch {}
    setRecording(false);
  }

  /* ==========================================================
     Controls
     ========================================================== */
  function sendChat(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = chatText.trim();
    if (!text) return;
    socketRef.current?.emit("chat", { room: code, text });
    setChatText("");
  }
  function toggleMute() {
    const s = localStreamRef.current;
    s?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMuted((m) => !m);
  }
  function toggleCam() {
    const s = localStreamRef.current;
    s?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCamOff((c) => !c);
  }
  async function shareScreen() {
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const screenTrack = display.getVideoTracks()[0];
      if (!screenTrack) return;
  
      // Collect only active video senders
      const senders: RTCRtpSender[] = [];
      Object.values(peers).forEach(({ pc }) => {
        const pcClosed =
          pc.connectionState === "closed" ||
          pc.signalingState === "closed" ||
          pc.iceConnectionState === "closed";
        if (pcClosed) return; // skip dead PCs
        pc.getSenders().forEach((s) => {
          if (s.track && s.track.kind === "video") senders.push(s);
        });
      });
  
      // Swap out outgoing tracks (ignore failures from stale senders)
      await Promise.all(
        senders.map((s) =>
          s.replaceTrack(screenTrack).catch(() => {
            /* ignore invalid state on stale sender */
          })
        )
      );
  
      // Update local preview stream
      const localStream = localStreamRef.current;
      const oldLocalVideo = localStream?.getVideoTracks()[0] || null;
      if (localStream) {
        if (oldLocalVideo) localStream.removeTrack(oldLocalVideo);
        localStream.addTrack(screenTrack);
        if (localVideoRef.current) {
          (localVideoRef.current as HTMLVideoElement & { srcObject?: MediaStream }).srcObject = localStream;
        }
      }
  
      // When user stops sharing, restore camera safely
      screenTrack.onended = async () => {
        try {
          const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
          const camTrack = camStream.getVideoTracks()[0];
          if (!camTrack) return;
  
          // Replace on active senders only
          const activeSenders: RTCRtpSender[] = [];
          Object.values(peers).forEach(({ pc }) => {
            const pcClosed =
              pc.connectionState === "closed" ||
              pc.signalingState === "closed" ||
              pc.iceConnectionState === "closed";
            if (pcClosed) return;
            pc.getSenders().forEach((s) => {
              if (s.track && s.track.kind === "video") activeSenders.push(s);
            });
          });
  
          await Promise.all(
            activeSenders.map((s) => s.replaceTrack(camTrack).catch(() => {}))
          );
  
          // Swap back in local preview
          if (localStreamRef.current) {
            const ls = localStreamRef.current;
            ls.getVideoTracks().forEach((t) => ls.removeTrack(t));
            ls.addTrack(camTrack);
            if (localVideoRef.current) {
              (localVideoRef.current as HTMLVideoElement & { srcObject?: MediaStream }).srcObject = ls;
            }
          }
        } catch (e) {
          console.error("Failed to restore camera after screenshare:", e);
        }
      };
    } catch (e) {
      console.error(e);
    }
  }
  
  function leaveCall() {
    if (startedAt && !endPostedRef.current) void postToWordPress("left");
    try {
      socketRef.current?.disconnect();
    } catch {}
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    router.push("/");
  }

  // Derived stage + labels
  const nameMap = useMemo(
    () => Object.fromEntries(participants.map((p) => [p.id, p.name ?? "Guest"])),
    [participants]
  );
  const firstPeerId = (Object.keys(peers)[0] ?? null) as string | null;
  const resolvedStageId: string | null = pinnedId ?? stageId ?? firstPeerId;
  const resolvedStageLabel = resolvedStageId ? nameMap[resolvedStageId] ?? resolvedStageId.slice(0, 6) : "Waiting…";

  // Clear unread on open chat
  useEffect(() => {
    if (panelOpen && panelTab === "chat" && unreadChat) setUnreadChat(0);
  }, [panelOpen, panelTab, unreadChat]);

  if (validationStatus === "checking") {
    return (
      <div style={sx.page}>
        <div
          style={{
            display: "grid",
            placeItems: "center",
            height: "100%",
          }}
        >
          <div
            style={{
              background: "#0f172a",
              borderRadius: 14,
              padding: 24,
              border: "1px solid #1f2937",
              textAlign: "center",
              maxWidth: 420,
            }}
          >
            <h1 style={{ fontSize: 18, marginBottom: 8 }}>Validating appointment…</h1>
            <p style={{ fontSize: 14, color: "#9ca3af" }}>
              Please wait while we verify your Bookly appointment details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (validationStatus === "failed") {
    return (
      <div style={sx.page}>
        <div
          style={{
            display: "grid",
            placeItems: "center",
            height: "100%",
          }}
        >
          <div
            style={{
              background: "#0f172a",
              borderRadius: 14,
              padding: 24,
              border: "1px solid #1f2937",
              textAlign: "center",
              maxWidth: 420,
            }}
          >
            <h1 style={{ fontSize: 18, marginBottom: 8 }}>Unable to join meeting</h1>
            <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 16 }}>
              {validationError || "We could not verify your appointment."}
            </p>
            <button
              onClick={() => router.push("/")}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: "none",
                background: "#2563eb",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div style={sx.page}>
      {/* Top bar */}
      <header
        style={{
          ...sx.topbar,
          padding: isMobile ? "0 10px" : "0 16px",
          gap: isMobile ? 6 : 12,
          height: 56,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={chip()}>{code.toUpperCase()}</div>
          <span style={{ fontSize: 12, color: "#9aa4b2" }}>{participants.length} participants</span>
        </div>
  
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Timer / duration */}
          {startedAt ? (
            <div
              title="Time remaining"
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontWeight: 700,
                color: timeLeftSec <= 300 ? "#fbbf24" : "#e5e7eb",
                background: "#0f172a",
                border: "1px solid #1f2b40",
                padding: "6px 10px",
                borderRadius: 10,
              }}
            >
              ⏱ {fmtClock(timeLeftSec)}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 12, color: "#9aa4b2" }}>Duration</label>
              <select
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value) as 30 | 60)}
                style={{
                  background: "#0f172a",
                  color: "#e5e7eb",
                  border: "1px solid #1f2b40",
                  padding: "6px 10px",
                  borderRadius: 10,
                }}
              >
                <option value={30}>30 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
          )}
  
          <TopBtn
            icon={UsersIcon}
            label="Participants"
            active={panelOpen && panelTab === "people"}
            onClick={() => {
              setPanelTab("people");
              setPanelOpen((v) => !v || panelTab !== "people");
            }}
          />
          <TopBtn
            icon={ChatIcon}
            label="Chat"
            badge={unreadChat}
            active={panelOpen && panelTab === "chat"}
            onClick={() => {
              setPanelTab("chat");
              setPanelOpen((v) => !v || panelTab !== "chat");
            }}
          />
        </div>
      </header>
  
      {/* Main */}
      <div
        style={{
          ...sx.main,
          gridTemplateColumns: isMobile ? "1fr" : "1fr 360px",
          paddingBottom: isMobile ? 88 : CONTROLS_RESERVED,
        }}
      >
        {/* LEFT: Stage + Filmstrip */}
        <div
          style={{
            ...sx.stageArea,
            // force a visible second row for the strip
            gridTemplateRows: isMobile ? "1fr 96px" : "1fr 130px",
            padding: isMobile ? 8 : 16,
            paddingBottom: isMobile ? 88 : CONTROLS_RESERVED,
          }}
        >
          <div style={{ ...sx.stageCard, minHeight: isMobile ? 240 : 360 }}>
            {/* 5-min banner */}
            {startedAt && timeLeftSec <= 300 && timeLeftSec > 0 ? (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  zIndex: 50,
                  background: "rgba(251,191,36,0.15)",
                  border: "1px solid rgba(251,191,36,0.45)",
                  color: "#fde68a",
                  padding: "6px 10px",
                  borderRadius: 10,
                  fontSize: 12,
                  backdropFilter: "blur(2px)",
                }}
              >
                ⏰ Meeting ends in {Math.ceil(timeLeftSec / 60)} min
              </div>
            ) : null}
  
            <StageVideo
              id={resolvedStageId}
              label={resolvedStageLabel}
              peers={peers}
              videoRef={stageVideoRef}
            />
  
            {/* Self PiP → MOBILE ONLY */}
            {isMobile && (
              <div
                style={{
                  ...sx.pip,
                  width: 120,
                  height: 72,
                  bottom: 80,
                  right: 8,
                  outline: "2px solid rgba(255,255,255,0.18)",
                }}
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 10,
                    background: "#000",
                  }}
                />
                <div style={{ ...sx.pipBadge, fontSize: 10 }}>
                  {(selfId && nameMap[selfId]) ? `${nameMap[selfId]} (You)` : `${displayName} (You)`}
                </div>
              </div>
            )}
          </div>
  
          {/* Filmstrip */}
          <div
            style={{
              ...sx.filmstrip,
              padding: isMobile ? "6px 2px" : "10px 6px",
              gap: isMobile ? 8 : 10,
              height: "100%",       // ⬅️ fill the reserved row
              minHeight: 0,         // ⬅️ avoid grid overflow clipping
              position: "fixed",
              zIndex: 45,           // ⬅️ stay above content behind
             
            }}
          >
            {/* Self tile → DESKTOP ONLY */}
            {!isMobile && (
  <SelfTile
  stream={selfStream ?? localStreamRef.current ?? null}
    label={(selfId && nameMap[selfId]) ? `${nameMap[selfId]} (You)` : `${displayName} (You)`}
    active={resolvedStageId === selfId}
    onPin={() => setPinnedId((p) => (p === (selfId ?? "") ? null : (selfId ?? null)))}
    onFocus={() => selfId && setStageId(selfId)}
  />
)}
  
         {/* Remote tiles (hidden) */}
{!HIDE_REMOTE_TILES &&
  Object.entries(peers).map(([id]) => (
    <RemoteTile
      key={id}
      id={id}
      peers={peers}
      active={resolvedStageId === id}
      label={nameMap[id] ?? id.slice(0, 6)}
      onPin={() => setPinnedId((p) => (p === id ? null : id))}
      onFocus={() => setStageId(id)}
    />
  ))
}
          </div>
        </div>
  
        {/* RIGHT: slide-in panel */}
        <aside
          style={{
            ...sx.panel,
            position: isMobile ? "fixed" : "relative",
            right: 0,
            top: isMobile ? 56 : 0,
            width: isMobile ? "100%" : 360,
            height: isMobile ? "calc(100dvh - 56px)" : "auto",
            zIndex: 60,
            transform: panelOpen ? "translateX(0)" : "translateX(100%)",
            paddingBottom: isMobile ? 88 : CONTROLS_RESERVED,
            borderLeft: isMobile ? "none" : sx.panel.borderLeft,
            borderTop: isMobile ? "1px solid rgba(255,255,255,0.06)" : "none",
            background: "#0b1220",
            willChange: "transform",
          }}
        >
          <div style={sx.panelTabs}>
            <button onClick={() => setPanelTab("people")} style={tabStyle(panelTab === "people")}>
              Participants ({participants.length})
            </button>
            <button onClick={() => setPanelTab("chat")} style={tabStyle(panelTab === "chat")}>
              Chat
            </button>
            <button onClick={() => setPanelOpen(false)} style={sx.panelClose}>
              ✕
            </button>
          </div>
  
          {panelTab === "people" ? (
            <div style={sx.panelBody}>
              {participants.map((p) => (
                <div key={p.id} style={sx.personRow}>
                  <div style={sx.avatar}>{(p.name ?? "G").slice(0, 1).toUpperCase()}</div>
                  <div style={{ display: "grid" }}>
                    <b style={{ color: "#e5e7eb" }}>{p.name ?? "Guest"}</b>
                    <span style={{ color: "#93a2b2", fontSize: 12 }}>{p.id.slice(0, 6)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateRows: "1fr auto", height: "100%" }}>
              <div style={sx.chatBody}>
                {messages.map((m, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <b style={{ color: "#e2e8f0" }}>{m.name || m.from || "Anon"}</b>
                    {m.text ? (
                      <div style={{ color: "#cbd5e1", wordBreak: "break-word" }}>{m.text}</div>
                    ) : null}
                    {m.attachment ? (
                      <div style={{ marginTop: 6 }}>
                        {m.attachment.type.startsWith("image/") ? (
                          <a href={m.attachment.url} target="_blank" rel="noreferrer" style={{ display: "inline-block" }}>
                            <img
                              src={m.attachment.url}
                              alt={m.attachment.name}
                              style={{ maxWidth: 220, maxHeight: 160, borderRadius: 8, border: "1px solid #243145" }}
                            />
                          </a>
                        ) : (
                          <a href={m.attachment.url} target="_blank" rel="noreferrer" style={{ color: "#93c5fd" }}>
                            ⬇️ {m.attachment.name} ({Math.ceil(m.attachment.size / 1024)} KB)
                          </a>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              <form onSubmit={sendChat} style={sx.chatForm}>
                <input
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder="Type a message"
                  style={sx.chatInput}
                />
                <button type="submit" style={sx.sendBtn}>
                  Send
                </button>
              </form>
            </div>
          )}
        </aside>
      </div>
  
      {/* Controls */}
      <footer
        style={{
          ...sx.controlsBar,
          left: 0,
          transform: "none",
          width: "100%",
          borderRadius: 16,
          padding: 8,
          display: "flex",
          gap: 10,
          justifyContent: "center",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        <Ctrl icon={MicIcon} label={muted ? "Unmute" : "Mute"} onClick={toggleMute} active={muted} />
        <Ctrl icon={CamIcon} label={camOff ? "Camera On" : "Camera Off"} onClick={toggleCam} active={camOff} />
        <Ctrl icon={ScreenIcon} label="Share Screen" onClick={shareScreen} />
        <Ctrl
          icon={recording ? StopIcon : RecordIcon}
          label={recording ? "Stop" : "Record"}
          onClick={() => (recording ? stopRecording() : startRecording())}
          active={recording}
          danger={recording}
        />
        <Ctrl icon={PeopleIcon} label="Participants" onClick={() => { setPanelTab("people"); setPanelOpen(true); }} />
        <Ctrl icon={ChatIcon} label="Chat" onClick={() => { setPanelTab("chat"); setPanelOpen(true); }} badge={unreadChat} />
        <Ctrl icon={EndIcon} label="Leave" onClick={() => endMeeting("left")} danger />
      </footer>
    </div>
  );
  
}

/* ---------- Styles ---------- */
const CONTROLS_RESERVED = 120;
const sx: Record<string, React.CSSProperties> = {
  page: {
    height: "100dvh",
    background: "#0b0f19",
    color: "#e5e7eb",
    display: "grid",
    gridTemplateRows: "56px 1fr",
    overflow: "hidden",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    background: "#0e1626",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  main: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1fr 360px",
    height: "100%",
    paddingBottom: CONTROLS_RESERVED,
  },
  stageArea: { display: "grid", gridTemplateRows: "1fr 120px", padding: 16 },
  stageCard: {
    position: "relative",
    background: "#000",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,.35)",
    minHeight: 360,
  },
  filmstrip: { display: "flex", alignItems: "center", gap: 10, overflowX: "auto", padding: "10px 4px" },
  pip: {
    position: "absolute",
    right: 16,
    bottom: 96,
    width: 200,
    height: 122,
    borderRadius: 12,
    overflow: "hidden",
    outline: "2px solid rgba(255,255,255,0.2)",
    background: "#000",
    zIndex: 40,
  },
  pipBadge: {
    position: "absolute",
    left: 8,
    bottom: 8,
    background: "rgba(0,0,0,0.55)",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: 8,
    fontSize: 11,
  },
  panel: {
    position: "relative",
    background: "#0b1220",
    borderLeft: "1px solid rgba(255,255,255,0.06)",
    transition: "transform .25s ease",
    paddingBottom: CONTROLS_RESERVED,
  },
  panelTabs: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  panelClose: {
    marginLeft: "auto",
    background: "transparent",
    color: "#94a3b8",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
  },
  panelBody: { overflow: "auto", height: "calc(100% - 50px)", padding: 10 },
  personRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 10,
    background: "#0f172a",
    border: "1px solid #1f2b40",
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#1f2b40",
    display: "grid",
    placeItems: "center",
    color: "#c7d2fe",
    fontWeight: 700,
  },
  chatBody: { overflow: "auto", padding: 12 },
  chatForm: {
    display: "flex",
    gap: 8,
    padding: 10,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    background: "#0b1220",
    position: "sticky",
    bottom: 0,
  },
  chatInput: {
    flex: 1,
    background: "#0f172a",
    border: "1px solid #243145",
    color: "#e2e8f0",
    padding: "10px 12px",
    borderRadius: 10,
    outline: "none",
  },
  sendBtn: { background: "#2563eb", color: "#fff", border: "none", padding: "10px 14px", borderRadius: 10, fontWeight: 600 },
  controlsBar: {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "calc(16px + env(safe-area-inset-bottom))",
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    background: "#0e1626cc",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 999,
    padding: 8,
  },
};

function chip(): React.CSSProperties {
  return {
    fontSize: 12,
    letterSpacing: 0.5,
    padding: "6px 10px",
    borderRadius: 999,
    color: "#cbd5e1",
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.08)",
  };
}
function tabStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? "#162136" : "transparent",
    color: active ? "#e5e7eb" : "#9aa4b2",
    border: "1px solid #1f2b40",
    padding: "8px 10px",
    borderRadius: 10,
    cursor: "pointer",
  };
}

/* ---------- Buttons ---------- */
function Ctrl({
  icon: Icon,
  label,
  onClick,
  active,
  danger,
  badge,
}: {
  icon: React.FC;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        position: "relative",
        width: 48,
        height: 48,
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.08)",
        background: danger ? "#ef4444" : active ? "#1f2937" : "#0b1220",
       
        boxShadow: danger && active ? "0 0 0 6px rgba(239,68,68,0.15)" : "none",
        color: "#e5e7eb",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
      }}
    >
      {badge ? (
        <span
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            minWidth: 18,
            height: 18,
            borderRadius: 999,
            background: "#2563eb",
            color: "#fff",
            fontSize: 11,
            display: "grid",
            placeItems: "center",
            padding: "0 5px",
          }}
        >
          {badge}
        </span>
      ) : null}
      <Icon />
    </button>
  );
}
function TopBtn({
  icon: Icon,
  label,
  onClick,
  active,
  badge,
}: {
  icon: React.FC;
  label: string;
  onClick: () => void;
  active?: boolean;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 10,
        background: active ? "#162136" : "transparent",
        color: "#d1d5db",
        border: "1px solid #1f2b40",
      }}
    >
      {badge ? (
        <span
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            minWidth: 18,
            height: 18,
            borderRadius: 999,
            background: "#2563eb",
            color: "#fff",
            fontSize: 11,
            display: "grid",
            placeItems: "center",
            padding: "0 5px",
          }}
        >
          {badge}
        </span>
      ) : null}
      <Icon />
      <span style={{ fontSize: 13 }}>{label}</span>
    </button>
  );
}

/* ---------- Icons ---------- */
function MicIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" stroke="currentColor" strokeWidth="1.6"/><path d="M19 11a7 7 0 0 1-14 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M12 18v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>); }
function CamIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M21 8l-4 3v2l4 3V8Z" fill="currentColor"/></svg>); }
function ScreenIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 20h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>); }
function EndIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 10c5-3 11-3 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7 16l-3-4M20 12l-3 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>); }
function ChatIcon() { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v10H7l-3 3V5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M8 9h8M8 12h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>); }
function UsersIcon() { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.6"/><path d="M15 12a3 3 0 1 0 0-6 3 3 0 0 1 0 6Z" fill="currentColor"/><path d="M3.5 19c.7-3.2 4.1-5 7.5-5s6.8 1.8 7.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>); }
function PeopleIcon() { return UsersIcon(); }
function RecordIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="12" cy="12" r="4" fill="currentColor"/>
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor"/>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

/* ---------- Filmstrip & Stage ---------- */
function RemoteTile({
  id,
  peers,
  active,
  label,
  onPin,
  onFocus,
}: {
  id: string;
  peers: Record<string, PeerInfo>;
  active?: boolean;
  label: string;
  onPin: () => void;
  onFocus: () => void;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const isNarrow = typeof window !== "undefined" ? window.matchMedia("(max-width:768px)").matches : false;
  useEffect(() => {
    if (ref.current) {
      (ref.current as HTMLVideoElement & { srcObject?: MediaStream | null }).srcObject =
        peers[id]?.stream ?? null;
    }
  }, [id, peers]);
  return (
    <div
    onClick={onFocus}
    style={{
      position: "relative",
      flex: "0 0 auto",  
      width: isNarrow ? 140 : 180,
      height: isNarrow ? 86 : 110,
      borderRadius: 12,
      overflow: "hidden",
      background: "#000",
      outline: active ? "2px solid #2563eb" : "1px solid rgba(255,255,255,0.12)",
      cursor: "pointer",
    }}
    >
      <video ref={ref} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <button
        onClick={(e) => { e.stopPropagation(); onPin(); }}
        title="Pin to stage"
        style={{ position: "absolute", right: 8, top: 8, background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.18)", color: "#e5e7eb", padding: "4px 8px", borderRadius: 999, fontSize: 11 }}
      >
        {active ? "Unpin" : "Pin"}
      </button>
      <div style={{ position: "absolute", left: 8, bottom: 8, background: "rgba(0,0,0,0.55)", color: "#fff", padding: "2px 8px", borderRadius: 8, fontSize: 11 }}>{label}</div>
    </div>
  );
}


function SelfTile({
  stream,
  label,
  active,
  onPin,
  onFocus,
}: {
  stream: MediaStream | null;
  label: string;
  active?: boolean;
  onPin: () => void;
  onFocus: () => void;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const isNarrow = typeof window !== "undefined"
    ? window.matchMedia("(max-width:768px)").matches
    : false;

  useEffect(() => {
    if (ref.current) {
      (ref.current as HTMLVideoElement & { srcObject?: MediaStream | null }).srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      onClick={onFocus}
      style={{
        position: "relative",
        flex: "0 0 auto",  
        width: isNarrow ? 140 : 180,
        height: isNarrow ? 86 : 110,
        borderRadius: 12,
        overflow: "hidden",
        background: "#000",
        outline: active ? "2px solid #2563eb" : "1px solid rgba(255,255,255,0.12)",
        cursor: "pointer",
      }}
    >
      <video ref={ref} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <button
        onClick={(e) => { e.stopPropagation(); onPin(); }}
        title="Pin to stage"
        style={{
          position: "absolute",
          right: 8,
          top: 8,
          background: "rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "#e5e7eb",
          padding: "4px 8px",
          borderRadius: 999,
          fontSize: 11,
        }}
      >
        {active ? "Unpin" : "Pin"}
      </button>
      <div
        style={{
          position: "absolute",
          left: 8,
          bottom: 8,
          background: "rgba(0,0,0,0.55)",
          color: "#fff",
          padding: "2px 8px",
          borderRadius: 8,
          fontSize: 11,
        }}
      >
        {label}
      </div>
    </div>
  );
}


function StageVideo({
  id,
  label,
  peers,
  videoRef,
}: {
  id: string | null;
  label: string;
  peers: Record<string, PeerInfo>;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}) {
  const innerRef = useRef<HTMLVideoElement>(null);
  const ref = videoRef as React.RefObject<HTMLVideoElement> ?? innerRef;

  useEffect(() => {
    if (ref.current) {
      const stream = id ? peers[id]?.stream ?? null : null;
      (ref.current as HTMLVideoElement & { srcObject?: MediaStream | null }).srcObject = stream;
    }
  }, [id, peers, ref]);

  return (
    <>
      <video ref={ref} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover", background: "#000" }} />
      <div style={{ position: "absolute", left: 12, bottom: 12, background: "rgba(0,0,0,0.5)", color: "#fff", padding: "4px 10px", borderRadius: 10, fontSize: 12 }}>{label}</div>
    </>
  );
}
