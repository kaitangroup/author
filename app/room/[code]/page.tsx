"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

/* ---------- ICE server config ---------- */
const ICE = { iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] };

/* ---------- Types ---------- */
type PeerInfo = {
  pc: RTCPeerConnection;
  stream: MediaStream;
  name?: string;
};

type RoomPageProps = {
  params: { code: string };
  searchParams: Record<string, string | string[] | undefined>;
};

type Message = { name?: string; from?: string; text: string };

/* ==========================================================
   Zoom‑style, modern UI built on your working logic.
   Signaling/WebRTC flow kept the same; only UI upgraded.
   ========================================================== */
export default function RoomPage({ params, searchParams }: RoomPageProps) {
  const code = decodeURIComponent(params.code);
  const name = (searchParams?.name as string) || "Guest";
  const router = useRouter();

  // --- refs ---
  const socketRef = useRef<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // --- app state ---
  const [participants, setParticipants] = useState<any[]>([]);
  const [peers, setPeers] = useState<Record<string, PeerInfo>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatText, setChatText] = useState("");

  // --- UI state ---
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [stageId, setStageId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [panelTab, setPanelTab] = useState<"people" | "chat">("people");
  const [panelOpen, setPanelOpen] = useState(true);
  const [unreadChat, setUnreadChat] = useState(0);
  const [selfId, setSelfId] = useState<string|null>(null);
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "";
  const nameMap = Object.fromEntries(
    participants.map((p: any) => [p.id, p.name || "Guest"])
  );
  // =========================================================
  // Socket & WebRTC (same mechanics, lightly annotated)
  // =========================================================
  
  useEffect(() => {
    // const socket = io();
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      path: "/socket.io",
      // transports: ["polling", "websocket"], // optional explicit list
      auth: { name },
      timeout: 10000,              // give the proxy enough time
    });
      socketRef.current = socket;
      socket.on("connect", () => setSelfId(socket.id ?? null));
   
    

  

 
    
    // স্টেজ লেবেল
    const resolvedStageLabel = resolvedStageId
      ? (nameMap[resolvedStageId] || resolvedStageId.slice(0,6))
      : "Waiting…";
    
    // PiP ব্যাজ
    <div style={sx.pipBadge}>
      {(selfId && nameMap[selfId]) ? `${nameMap[selfId]} (You)` : `${name} (You)`}
    </div>

    const peerConns = new Map<string, RTCPeerConnection>();
    const audioMonitors = new Map<string, () => void>();

    async function ensurePeer(id: string) {
      if (peerConns.has(id)) return peerConns.get(id)!;
      const pc = new RTCPeerConnection(ICE);
      peerConns.set(id, pc);

      // add local tracks
      if (localStreamRef.current) {
        for (const track of localStreamRef.current.getTracks()) {
          pc.addTrack(track, localStreamRef.current);
        }
      }

      pc.onicecandidate = (ev) => {
        if (ev.candidate) socket.emit("ice-candidate", { to: id, candidate: ev.candidate });
      };

      pc.ontrack = (ev) => {
        const [remoteStream] = ev.streams;
        setPeers((prev) => {
          const copy = { ...prev };
          copy[id] = copy[id] || { pc, stream: remoteStream };
          copy[id].stream = remoteStream;
          return copy;
        });
        startRemoteAudioMonitor(id, remoteStream);
        setStageId((curr) => curr ?? id); // fill stage the first time a remote arrives
      };

      return pc;
    }

    async function initMedia() {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        alert("Use HTTPS (or localhost) with a modern browser for camera/mic.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      socket.emit("join", { room: code, name });
    }

    function startRemoteAudioMonitor(id: string, stream: MediaStream) {
      if (audioMonitors.has(id)) return;
      try {
        const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        const data = new Uint8Array(analyser.frequencyBinCount);
        src.connect(analyser);
        let raf: number;
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
      } catch {}
    }

    // presence & chat
    socket.on("participants", ({ participants: list }) => setParticipants(list));
    socket.on("chat", (m: Message) => {
      setMessages((prev) => [...prev, m]);
      if (!(panelOpen && panelTab === "chat")) setUnreadChat((c) => c + 1);
    });

    // newcomer triggers others to offer
    socket.on("need-offer", async ({ targetId }) => {
      const pc = await ensurePeer(targetId);
      try {
        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
        await pc.setLocalDescription(offer);
        socket.emit("offer", { to: targetId, sdp: offer });
      } catch (e) {
        console.error(e);
      }
    });

    // signaling
    socket.on("offer", async ({ from, sdp }) => {
      const pc = await ensurePeer(from);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { to: from, sdp: answer });
    });

    socket.on("answer", async ({ from, sdp }) => {
      const pc = peerConns.get(from);
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on("ice-candidate", async ({ from, candidate }) => {
      const pc = peerConns.get(from);
      if (!pc) return;
      if (candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error(e);
        }
      }
    });

    socket.on("user-left", ({ id }) => {
      const pc = peerConns.get(id);
      if (pc) {
        pc.getSenders().forEach((s) => s.track && s.track.stop?.());
        pc.close();
      }
      peerConns.delete(id);
      setPeers((prev) => {
        const copy = { ...prev } as any;
        delete copy[id];
        return copy;
      });
       setStageId((current) =>
           current === id ? (Object.keys(peers).find((x) => x !== id) ?? null) : current
         );
    });

    initMedia();

    return () => {
      try {
        socket.disconnect();
      } catch {}
      for (const pc of peerConns.values()) {
        pc.getSenders().forEach((s) => s.track && s.track.stop?.());
        pc.close();
      }
      peerConns.clear();
      for (const stop of audioMonitors.values()) {
        try {
          stop();
        } catch {}
      }
      audioMonitors.clear();
      const ls = localStreamRef.current;
      ls?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, name, pinnedId]);

  // controls
  function sendChat(e: React.FormEvent) {
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
      const senders: RTCRtpSender[] = [];
      Object.values(peers).forEach((p) => {
        p.pc.getSenders().forEach((s) => {
          if (s.track && s.track.kind === "video") senders.push(s);
        });
      });
      const localVideoTrack = localStreamRef.current!.getVideoTracks()[0];
      for (const s of senders) await s.replaceTrack(screenTrack);

      const localStream = localStreamRef.current!;
      localStream.removeTrack(localVideoTrack);
      localStream.addTrack(screenTrack);
      if (localVideoRef.current) localVideoRef.current.srcObject = localStream;

      screenTrack.onended = async () => {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const camTrack = camStream.getVideoTracks()[0];
        for (const s of senders) await s.replaceTrack(camTrack);
        localStream.removeTrack(screenTrack);
        localStream.addTrack(camTrack);
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
      };
    } catch (e) {
      console.error(e);
    }
  }
  function leaveCall() {
    try {
      socketRef.current?.disconnect();
    } catch {}
    const ls = localStreamRef.current;
    ls?.getTracks().forEach((t) => t.stop());
    router.push("/");
  }

  // derived stage
  const firstPeerId = (Object.keys(peers)[0] ?? null) as string | null;
  const resolvedStageId: string | null = pinnedId ?? stageId ?? firstPeerId;
  const resolvedStageLabel = resolvedStageId ? resolvedStageId.slice(0, 6) : "Waiting…";

  // unread clear on open Chat
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

      {/* Main area: Stage + Side Panel */}
      <div style={sx.main}>
        <div style={sx.stageArea}>
          <div style={sx.stageCard}>
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
              <div style={sx.pipBadge}>{name} (You)</div>
            </div>
          </div>

          {/* Filmstrip of remotes */}
          <div style={sx.filmstrip}>
            {Object.keys(peers).length === 0 && (
              <div style={{ color: "#93a2b2", fontSize: 13 }}>Waiting for others to join…</div>
            )}
            {Object.entries(peers).map(([id]) => (
              <RemoteTile
                key={id}
                id={id}
                label={nameMap[id] || id.slice(0,6)}
                peers={peers}
                active={resolvedStageId === id}
                onPin={() => setPinnedId((p) => (p === id ? null : id))}
                onFocus={() => setStageId(id)}
              />
            ))}
          </div>
        </div>

        {/* Right panel */}
        <aside style={{ ...sx.panel, transform: panelOpen ? "translateX(0)" : "translateX(100%)" }}>
          <div style={sx.panelTabs}>
            <button
              onClick={() => setPanelTab("people")}
              style={tabStyle(panelTab === "people")}
            >
              Participants ({participants.length})
            </button>
            <button onClick={() => setPanelTab("chat")} style={tabStyle(panelTab === "chat")}>Chat</button>
            <button onClick={() => setPanelOpen(false)} style={sx.panelClose}>✕</button>
          </div>

          {panelTab === "people" ? (
            <div style={sx.panelBody}>
              {participants.map((p: any) => (
                <div key={p.id} style={sx.personRow}>
                  <div style={sx.avatar}>{(p.name || "?").slice(0, 1).toUpperCase()}</div>
                  <div style={{ display: "grid" }}>
                    <b style={{ color: "#e5e7eb" }}>{p.name || "Guest"}</b>
                    <span style={{ color: "#93a2b2", fontSize: 12 }}>{p.id?.slice(0, 6)}</span>
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

      {/* Bottom controls */}
      <footer style={sx.controlsBar}>
        <Ctrl icon={MicIcon} label={muted ? "Unmute" : "Mute"} onClick={toggleMute} active={muted} />
        <Ctrl icon={CamIcon} label={camOff ? "Camera On" : "Camera Off"} onClick={toggleCam} active={camOff} />
        <Ctrl icon={ScreenIcon} label="Share Screen" onClick={shareScreen} />
        <Ctrl icon={PeopleIcon} label="Participants" onClick={() => { setPanelTab("people"); setPanelOpen(true); }} />
        <Ctrl icon={ChatIcon} label="Chat" onClick={() => { setPanelTab("chat"); setPanelOpen(true); }} badge={unreadChat} />
        <Ctrl icon={EndIcon} label="Leave" onClick={leaveCall} danger />
      </footer>
    </div>
  );
}

/* ---------- Styles ---------- */
const CONTROLS_RESERVED = 120; // space to keep content clear of the floating controls
const sx: Record<string, React.CSSProperties> = {
  page: {
    height: "100dvh", // use dynamic viewport height to avoid mobile browser chrome cutting content
    background: "#0b0f19", // deep black‑slate
    color: "#e5e7eb",
    display: "grid",
    gridTemplateRows: "56px 1fr", // footer becomes fixed overlay
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
    gap: 0,
    height: "100%",
    paddingBottom: CONTROLS_RESERVED, // keep content above floating controls
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
    bottom: 96, // lifted above the floating controls
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
    paddingBottom: CONTROLS_RESERVED, // so chat input stays visible
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
  chatForm: { display: "flex", gap: 8, padding: 10, borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0b1220", position: "sticky", bottom: 0 },
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

/* ---------- Controls button ---------- */
function Ctrl({ icon: Icon, label, onClick, active, danger, badge }: { icon: any; label: string; onClick: () => void; active?: boolean; danger?: boolean; badge?: number; }) {
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
        <span style={{ position: "absolute", top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 999, background: "#2563eb", color: "#fff", fontSize: 11, display: "grid", placeItems: "center", padding: "0 5px" }}>{badge}</span>
      ) : null}
      <Icon />
    </button>
  );
}

function TopBtn({ icon: Icon, label, onClick, active, badge }: { icon: any; label: string; onClick: () => void; active?: boolean; badge?: number; }) {
  return (
    <button onClick={onClick} title={label} style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 10, background: active ? "#162136" : "transparent", color: "#d1d5db", border: "1px solid #1f2b40" }}>
      {badge ? (
        <span style={{ position: "absolute", top: -6, right: -6, minWidth: 18, height: 18, borderRadius: 999, background: "#2563eb", color: "#fff", fontSize: 11, display: "grid", placeItems: "center", padding: "0 5px" }}>{badge}</span>
      ) : null}
      <Icon />
      <span style={{ fontSize: 13 }}>{label}</span>
    </button>
  );
}

/* ---------- Icons ---------- */
function MicIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" stroke="currentColor" strokeWidth="1.6"/><path d="M19 11a7 7 0 0 1-14 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M12 18v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
  );
}
function CamIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M21 8l-4 3v2l4 3V8Z" fill="currentColor"/></svg>
  );
}
function ScreenIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 20h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
  );
}
function EndIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 10c5-3 11-3 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7 16l-3-4M20 12l-3 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  );
}
function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v10H7l-3 3V5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M8 9h8M8 12h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
  );
}
function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.6"/><path d="M15 12a3 3 0 1 0 0-6 3 3 0 0 1 0 6Z" fill="currentColor"/><path d="M3.5 19c.7-3.2 4.1-5 7.5-5s6.8 1.8 7.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
  );
}
function PeopleIcon() { return UsersIcon(); }

/* ---------- Remote filmstrip tile ---------- */
function RemoteTile({
  id, peers, label, active, onPin, onFocus
}: {
  id: string; peers: Record<string, PeerInfo>;
  label: string; active?: boolean;
  onPin: () => void; onFocus: () => void;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const stream = peers[id]?.stream || null;
    (ref.current as any).srcObject = stream;
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
      <button onClick={(e) => { e.stopPropagation(); onPin(); }} title="Pin to stage" style={{ position: "absolute", right: 8, top: 8, background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.18)", color: "#e5e7eb", padding: "4px 8px", borderRadius: 999, fontSize: 11 }}>
        {active ? "Unpin" : "Pin"}
      </button>
      <div style={{ position: "absolute", left: 8, bottom: 8, background: "rgba(0,0,0,0.55)", color: "#fff", padding: "2px 8px", borderRadius: 8, fontSize: 11 }}>{label}</div>
    </div>
  );
}

/* ---------- Stage video (remote big only) ---------- */
function StageVideo({ id, label, peers }: { id: string | null; label: string; peers: Record<string, PeerInfo>; }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const stream = id ? peers[id]?.stream || null : null;
    (ref.current as any).srcObject = stream;
  }, [id, peers]);
  return (
    <>
      <video ref={ref} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover", background: "#000" }} />
      <div style={{ position: "absolute", left: 12, bottom: 12, background: "rgba(0,0,0,0.5)", color: "#fff", padding: "4px 10px", borderRadius: 10, fontSize: 12 }}>{label}</div>
    </>
  );
}
