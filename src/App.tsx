import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchStatus, sendRemoteCommand } from "./api";
import { Icon } from "./icons";
import type { IconName } from "./icons";
import { Remote, type RemoteHandlers, type RemoteState } from "./remote";
import type { CaptureHealth, RemoteLogEntry, StatusResponse } from "./types";
import { LiveScreen } from "./video";

function defaultWhepUrl() {
  if (typeof window === "undefined") return "http://localhost:8889/tvbox/whep";

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const hostname = window.location.hostname || "localhost";
  return `${protocol}//${hostname}:8889/tvbox/whep`;
}

const DEFAULT_STATUS: StatusResponse = {
  serverTime: new Date().toISOString(),
  capture: {
    state: "unknown",
    device: "/dev/tvbox-video",
    audioDevice: "plughw:CARD=<capture-card-id>,DEV=0",
    publisher: "unknown",
    lastError: null
  },
  stream: {
    path: "tvbox",
    whepUrl: import.meta.env.VITE_STREAM_WHEP_URL || defaultWhepUrl(),
    ready: false,
    viewers: 0
  },
  remote: {
    stub: false,
    enabled: true,
    available: false,
    device: "/dev/ir-pico",
    baudRate: 115200,
    recent: 0,
    lastError: null,
    lastCommandAt: null
  }
};

function commandIcon(label: string): IconName {
  const lower = label.toLowerCase();
  if (lower.includes("volume")) return "volume";
  if (lower.includes("mute")) return "mute";
  if (lower.includes("channel up")) return "up";
  if (lower.includes("channel down")) return "down";
  if (lower.includes("going to") || lower.includes("tune")) return "numpad";
  if (lower.includes("power")) return "power";
  if (lower.includes("up")) return "up";
  if (lower.includes("down")) return "down";
  if (lower.includes("left")) return "left";
  if (lower.includes("right")) return "right";
  if (lower.includes("ok")) return "media";
  if (lower.includes("back")) return "back";
  if (lower.includes("menu")) return "menu";
  if (lower.includes("info")) return "info";
  if (lower.includes("guide") || lower.includes("epg")) return "guide";
  if (lower.includes("fav")) return "star";
  if (lower.includes("tv/av")) return "tvav";
  if (lower.includes("audio")) return "audio";
  if (lower.includes("subtitle")) return "sub";
  if (lower.includes("media")) return "media";
  if (lower.includes("record")) return "record";
  if (lower.includes("play")) return "play";
  if (lower.includes("stop")) return "stop";
  if (lower.includes("rewind")) return "rewind";
  if (lower.includes("forward")) return "forward";
  return "bolt";
}

function StatusChip({
  icon,
  label,
  value,
  ok
}: {
  icon: "chip" | "bolt";
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className={`chip${ok ? " chip-ok" : " chip-bad"}`}>
      <Icon name={icon} size={15} />
      <span className="chip-label">{label}</span>
      <span className="chip-dot" />
      <span className="chip-val">{value}</span>
    </div>
  );
}

function statusLabel(state: CaptureHealth, ready: boolean) {
  if (ready || state === "online") return "Online";
  if (state === "connecting") return "Connecting";
  if (state === "error") return "Error";
  if (state === "offline") return "Offline";
  return "Unknown";
}

function useStatus() {
  const [status, setStatus] = useState<StatusResponse>(DEFAULT_STATUS);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await fetchStatus();
        if (!cancelled) setStatus(next);
      } catch {
        if (!cancelled) {
          setStatus((current) => ({
            ...current,
            capture: {
              ...current.capture,
              state: "unknown",
              publisher: "unknown",
              lastError: "Dashboard API is not reachable"
            },
            stream: {
              ...current.stream,
              ready: false
            }
          }));
        }
      }
    }

    load();
    const interval = window.setInterval(load, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return status;
}

export function App() {
  const status = useStatus();
  const videoSurfaceRef = useRef<HTMLDivElement | null>(null);
  const [on, setOn] = useState(true);
  const [remoteMuted, setRemoteMuted] = useState(false);
  const [streamMuted, setStreamMuted] = useState(false);
  const [streamVolume, setStreamVolume] = useState(0.8);
  const [channelInput, setChannelInput] = useState("");
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [remoteOpen, setRemoteOpen] = useState(true);
  const [toast, setToast] = useState<RemoteLogEntry | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const toastTimer = useRef<number | null>(null);

  const pushToast = useCallback((entry: RemoteLogEntry) => {
    setToast(entry);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1700);
  }, []);

  const send = useCallback(
    async (command: string, label = command, value: string | number | boolean | null = null) => {
      try {
        const entry = await sendRemoteCommand({ command, label, value });
        pushToast(entry);
      } catch (error) {
        pushToast({
          id: Date.now(),
          command,
          label: error instanceof Error ? error.message : `${label} failed`,
          value,
          receivedAt: new Date().toISOString(),
          stub: false,
          sent: false,
          error: error instanceof Error ? error.message : "Remote command failed"
        });
      }
    },
    [pushToast]
  );

  const toggleVideoFullscreen = useCallback(() => {
    const screen = videoSurfaceRef.current;
    if (!screen) return;

    if (document.fullscreenElement === screen) {
      void document.exitFullscreen?.();
      return;
    }

    if (document.fullscreenElement) {
      void document.exitFullscreen?.().then(() => screen.requestFullscreen?.()).catch(() => undefined);
      return;
    }

    void screen.requestFullscreen?.();
  }, []);

  const handlers: RemoteHandlers = useMemo(
    () => ({
      power: () => {
        setOn((current) => {
          const next = !current;
          void send("red_power_top", next ? "Power On" : "Power Off", next);
          return next;
        });
      },
      mute: () => {
        setRemoteMuted((current) => {
          const next = !current;
          void send(next ? "mute" : "unmute", next ? "Mute" : "Unmute", next);
          return next;
        });
      },
      volUp: () => {
        void send("volume_up", "Volume Up");
      },
      volDown: () => {
        void send("volume_down", "Volume Down");
      },
      chUp: () => {
        void send("channel_up", "Channel Up");
      },
      chDown: () => {
        void send("channel_down", "Channel Down");
      },
      nav: (direction) => void send(`navigate_${direction.toLowerCase()}`, `Navigate ${direction}`),
      ok: () => void send("ok", "OK / Select"),
      back: () => void send("back", "Back"),
      menu: () => void send("menu", "Menu / Exit"),
      info: () => void send("info", "Info"),
      setChInput: (value) => setChannelInput(value.slice(0, 4)),
      pressDigit: (digit) => setChannelInput((current) => (current + digit).slice(0, 4)),
      clearInput: () => setChannelInput((current) => current.slice(0, -1)),
      toggleKeypad: () => setKeypadOpen((current) => !current),
      toggleDrawer: () => setDrawerOpen((current) => !current),
      go: () => {
        const raw = channelInput.trim();
        if (!raw) return;
        void send("go_to_channel", `Going to channel ${raw}`, raw);
        setChannelInput("");
        setKeypadOpen(false);
      },
      adv: (command, label) => void send(command, label ?? command)
    }),
    [channelInput, send]
  );

  const remoteState: RemoteState = {
    on,
    muted: remoteMuted,
    chInput: channelInput,
    keypadOpen,
    drawerOpen
  };

  const captureOk = status.stream.ready || status.capture.state === "online";
  const captureValue = statusLabel(status.capture.state, status.stream.ready);
  const remoteOk = status.remote.enabled ? status.remote.available : true;
  const remoteValue = status.remote.enabled ? (status.remote.available ? "Ready" : "Missing") : "Stub";
  const whepUrl = status.stream.whepUrl || DEFAULT_STATUS.stream.whepUrl;

  return (
    <div className="stage">
      <div className="stage-inner" data-rstyle="subtle" data-size="regular">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">
              <Icon name="signal" size={18} />
            </div>
            <div className="brand-txt">
              <div className="brand-title">TV Box Control</div>
              <div className="brand-sub">HD Capture · IR Bridge</div>
            </div>
          </div>
          <div className="status-row">
            <StatusChip icon="chip" label="Capture" value={captureValue} ok={captureOk} />
            <StatusChip icon="bolt" label="IR Bridge" value={remoteValue} ok={remoteOk} />
          </div>
          <div className="top-actions">
            <button className="iconbtn" title="Fullscreen" onClick={toggleVideoFullscreen}>
              <Icon name="fullscreen" size={18} />
            </button>
          </div>
        </header>

        <main className="main">
          <section className="stage-screen">
            <LiveScreen
              screenRef={videoSurfaceRef}
              on={on}
              muted={streamMuted}
              volume={streamVolume}
              capture={status.capture.state}
              whepUrl={whepUrl}
              refreshToken={refreshToken}
              onMutedChange={setStreamMuted}
              onVolumeChange={setStreamVolume}
              onRefresh={() => {
                setRefreshToken((current) => current + 1);
              }}
              onFullscreen={toggleVideoFullscreen}
            />
            {toast && (
              <div className="toast" key={toast.id}>
                <Icon name={commandIcon(toast.label)} size={16} />
                <span>{toast.label}</span>
              </div>
            )}
          </section>

          {remoteOpen ? (
            <Remote state={remoteState} handlers={handlers} onClose={() => setRemoteOpen(false)} />
          ) : (
            <button className="remote-launcher" onClick={() => setRemoteOpen(true)} title="Open remote">
              <Icon name="chip" size={18} />
              <span>Remote</span>
            </button>
          )}
        </main>
      </div>
    </div>
  );
}
