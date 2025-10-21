"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

/* ---------- Types ---------- */
type PeerInfo = { pc: RTCPeerConnection; stream: MediaStream; name?: string };
type Message = { name?: string; from?: string; text: string };
type Participant = { id: string; name?: string };

type RoomPageProps = {
  params: { code: string };
  searchParams: Record<string, string | string[] | undefined>;
};

const ICE: RTCConfiguration = { iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] };

export default function RoomPage({ params, searchParams }: RoomPageProps) {
  const code = decodeURIComponent(params.code!);
  const rawName = searchParams?.name;
  const name = (Array.isArray(rawName) ? rawName[0] : rawName) ?? "Guest";
  const router = useRouter();

  // Env
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "";
  const WP_ENDPOINT = process.env.NEXT_PUBLIC_WP_ENDPOINT || "";
  const WP_TOKEN = process.env.NEXT_PUBLIC_WP_TOKEN || "";

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // State
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [peers, setPeers] = useState<Record<string, PeerInfo>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatText, setChatText] = useState("");
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [panelTab, setPanelTab] = useState<"people" | "chat">("people");
  const [panelOpen, setPanelOpen] = useState(true);
  const [unreadChat, setUnreadChat] = useState(0);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [stageId, setStageId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  // Timer state
  const [durationMin, setDurationMin] = useState<30 | 60>(30);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(0);
  const [warned5m, setWarned5m] = useState(false);
  const endPostedRef = useRef(false);

  /* ==========================================================
     Socket + WebRTC
     ========================================================== */
  useEffect(() => {
    const socket = io(SOCKET_URL || (typeof window !== "undefined" ? window.location.origin : ""), {
      // let Socket.IO choose polling → upgrade for best compatibility behind proxies
      auth: { name },
      path: "/socket.io",
      timeout: 10000,
    });
    socketRef.current = socket;

    setSelfId(null);
    socket.on("connect", () => setSelfId(socket.id ?? null));

    const peerConns = new Map<string, RTCPeerConnection>();
    const audioMonitors = new Map<string, () => void>();

    async function ensurePeer(id: string): Promise<RTCPeerConnection> {
      const existing = peerConns.get(id);
      if (existing) return existing;

      const pc = new RTCPeerConnection(ICE);
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
        // First remote goes to stage by default
        setStageId((curr) => curr ?? id);
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
          if (!pinnedId && avg > 16) setStageId((prev) => (prev !== id ? id : prev));
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
      if (localVideoRef.current) {
        (localVideoRef.current as HTMLVideoElement & { srcObject?: MediaStream }).srcObject = stream;
      }
      socket.emit("join", { room: code, name });
    }

    // Presence + Chat
    socket.on("participants", ({ participants: list }: { participants: Participant[] }) => {
      setParticipants(list);
    });
     socket.on("chat", (m: Message) => {
         setMessages((prev) => [...prev, m]);
         if (!(panelOpen && panelTab === "chat")) {
           setUnreadChat((c) => c + 1);
           // Optionally auto-open on first incoming message
           // setPanelTab("chat"); setPanelOpen(true);
         }
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
    });

    socket.on("answer", async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
      const pc = peerConns.get(from);
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on("ice-candidate", async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConns.get(from);
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error(e);
        }
      }
    });

    socket.on("user-left", ({ id }: { id: string }) => {
      const pc = peerConns.get(id);
      if (pc) {
        pc.getSenders().forEach((s) => s.track && s.track.stop?.());
        pc.close();
      }
      peerConns.delete(id);
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
  }, [code, name, pinnedId, SOCKET_URL, panelOpen, panelTab]);

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

      const senders: RTCRtpSender[] = [];
      Object.values(peers).forEach((p) => {
        p.pc.getSenders().forEach((s) => {
          if (s.track && s.track.kind === "video") senders.push(s);
        });
      });

      const localStream = localStreamRef.current;
      const localVideoTrack = localStream?.getVideoTracks()[0];
      if (!localStream || !localVideoTrack) return;

      await Promise.all(senders.map((s) => s.replaceTrack(screenTrack)));

      localStream.removeTrack(localVideoTrack);
      localStream.addTrack(screenTrack);
      if (localVideoRef.current) {
        (localVideoRef.current as HTMLVideoElement & { srcObject?: MediaStream }).srcObject = localStream;
      }

      screenTrack.onended = async () => {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const camTrack = camStream.getVideoTracks()[0];
        if (!camTrack) return;
        await Promise.all(senders.map((s) => s.replaceTrack(camTrack)));
        localStream.removeTrack(screenTrack);
        localStream.addTrack(camTrack);
        if (localVideoRef.current) {
          (localVideoRef.current as HTMLVideoElement & { srcObject?: MediaStream }).srcObject = localStream;
        }
      };
    } catch (e) {
      console.error(e);
    }
  }
  function leaveCall() {
    // If timer started and we haven't posted, store as "left"
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

  return (
    <div style={sx.page}>
      {/* Top bar */}
      <header style={sx.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={chip()}>{code.toUpperCase()}</div>
          <span style={{ fontSize: 12, color: "#9aa4b2" }}>{participants.length} participants</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Timer / duration selector */}
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
                style={{ background: "#0f172a", color: "#e5e7eb", border: "1px solid #1f2b40", padding: "6px 10px", borderRadius: 10 }}
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
      <div style={sx.main}>
        <div style={sx.stageArea}>
          <div style={sx.stageCard}>
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

            <StageVideo id={resolvedStageId} label={resolvedStageLabel} peers={peers} />

            {/* Self PiP */}
            <div style={sx.pip}>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10, background: "#000" }}
              />
              <div style={sx.pipBadge}>
                {(selfId && nameMap[selfId]) ? `${nameMap[selfId]} (You)` : `${name} (You)`}
              </div>
            </div>
          </div>

          {/* Filmstrip */}
          <div style={sx.filmstrip}>
            {Object.keys(peers).length === 0 && (
              <div style={{ color: "#93a2b2", fontSize: 13 }}>Waiting for others to join…</div>
            )}
            {Object.entries(peers).map(([id]) => (
              <RemoteTile
                key={id}
                id={id}
                peers={peers}
                active={resolvedStageId === id}
                label={nameMap[id] ?? id.slice(0, 6)}
                onPin={() => setPinnedId((p) => (p === id ? null : id))}
                onFocus={() => setStageId(id)}
              />
            ))}
          </div>
        </div>

        {/* Right panel */}
        <aside style={{ ...sx.panel, transform: panelOpen ? "translateX(0)" : "translateX(100%)" }}>
          <div style={sx.panelTabs}>
            <button onClick={() => setPanelTab("people")} style={tabStyle(panelTab === "people")}>
              Participants ({participants.length})
            </button>
            <button onClick={() => setPanelTab("chat")} style={tabStyle(panelTab === "chat")}>
              Chat
            </button>
            <button onClick={() => setPanelOpen(false)} style={sx.panelClose}>✕</button>
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
                    <div style={{ color: "#cbd5e1" }}>{m.text}</div>
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
                <button type="submit" style={sx.sendBtn}>Send</button>
              </form>
            </div>
          )}
        </aside>
      </div>

      {/* Controls */}
      <footer style={sx.controlsBar}>
        <Ctrl icon={MicIcon} label={muted ? "Unmute" : "Mute"} onClick={toggleMute} active={muted} />
        <Ctrl icon={CamIcon} label={camOff ? "Camera On" : "Camera Off"} onClick={toggleCam} active={camOff} />
        <Ctrl icon={ScreenIcon} label="Share Screen" onClick={shareScreen} />
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
  stageArea: {
    display: "grid",
    gridTemplateRows: "1fr 120px",
    padding: 16,
  },
  stageCard: {
    position: "relative",
    background: "#000",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,.35)",
    minHeight: 360,
  },
  filmstrip: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    overflowX: "auto",
    padding: "10px 4px",
  },
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
  panelBody: {
    overflow: "auto",
    height: "calc(100% - 50px)",
    padding: 10,
  },
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
  sendBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 600,
  },
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

/* ---------- Small UI bits ---------- */
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
        width: 180,
        height: 110,
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

function StageVideo({
  id,
  label,
  peers,
}: {
  id: string | null;
  label: string;
  peers: Record<string, PeerInfo>;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (ref.current) {
      const stream = id ? peers[id]?.stream ?? null : null;
      (ref.current as HTMLVideoElement & { srcObject?: MediaStream | null }).srcObject = stream;
    }
  }, [id, peers]);
  return (
    <>
      <video ref={ref} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover", background: "#000" }} />
      <div style={{ position: "absolute", left: 12, bottom: 12, background: "rgba(0,0,0,0.5)", color: "#fff", padding: "4px 10px", borderRadius: 10, fontSize: 12 }}>{label}</div>
    </>
  );
}
