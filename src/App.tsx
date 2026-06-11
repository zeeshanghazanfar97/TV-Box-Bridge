import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchStatus, sendRemoteCommand } from "./api";
import { Icon } from "./icons";
import type { IconName } from "./icons";
import { Remote, type RemoteHandlers, type RemoteState } from "./remote";
import type { CaptureHealth, Channel, RemoteLogEntry, StatusResponse } from "./types";
import { LiveScreen } from "./video";

const CHANNELS: Channel[] = [
  { num: "204", name: "CINEMAX HD", genre: "MOVIES", program: "The Long Afternoon", next: "Night Shift · 22:00", progress: 62 },
  { num: "101", name: "NEWS NOW", genre: "NEWS", program: "World at Ten", next: "Market Watch · 22:30", progress: 38 },
  { num: "312", name: "SPORTS 1 HD", genre: "SPORTS", program: "Premier Live: Derby", next: "Post-Match · 22:15", progress: 74 },
  { num: "508", name: "NAT GEO WILD", genre: "NATURE", program: "Coasts of Patagonia", next: "Deep Blue · 22:05", progress: 24 },
  { num: "622", name: "FOOD NETWORK", genre: "LIFESTYLE", program: "Fire & Smoke", next: "Bakeoff · 22:00", progress: 50 },
  { num: "077", name: "RETRO TOONS", genre: "KIDS", program: "Cosmic Cadets", next: "Robo Rangers · 21:45", progress: 88 }
];

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
    whepUrl: import.meta.env.VITE_STREAM_WHEP_URL || "http://localhost:8889/tvbox/whep",
    ready: false,
    viewers: 0
  },
  remote: {
    stub: true,
    recent: 0
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
  const [on, setOn] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(24);
  const [channelIndex, setChannelIndex] = useState(0);
  const [customChannel, setCustomChannel] = useState<Channel | null>(null);
  const [channelInput, setChannelInput] = useState("");
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [remoteOpen, setRemoteOpen] = useState(true);
  const [toast, setToast] = useState<RemoteLogEntry | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const toastTimer = useRef<number | null>(null);

  const channel = useMemo(() => {
    return channelIndex >= 0 ? CHANNELS[channelIndex] : customChannel ?? CHANNELS[0];
  }, [channelIndex, customChannel]);

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
      } catch {
        pushToast({
          id: Date.now(),
          command,
          label: `${label} queued`,
          value,
          receivedAt: new Date().toISOString(),
          stub: true
        });
      }
    },
    [pushToast]
  );

  const handlers: RemoteHandlers = useMemo(
    () => ({
      power: () => {
        setOn((current) => {
          const next = !current;
          void send(next ? "power_on" : "power_off", next ? "Power On" : "Power Off", next);
          return next;
        });
      },
      mute: () => {
        if (!on) return;
        setMuted((current) => {
          const next = !current;
          void send(next ? "mute" : "unmute", next ? "Mute" : "Unmute", next);
          return next;
        });
      },
      volUp: () => {
        setMuted(false);
        setVolume((current) => Math.min(100, current + 2));
        void send("volume_up", "Volume Up", volume + 2);
      },
      volDown: () => {
        setVolume((current) => Math.max(0, current - 2));
        void send("volume_down", "Volume Down", volume - 2);
      },
      chUp: () => {
        setChannelIndex((current) => {
          const base = current < 0 ? 0 : current;
          return (base + 1) % CHANNELS.length;
        });
        setCustomChannel(null);
        void send("channel_up", "Channel Up");
      },
      chDown: () => {
        setChannelIndex((current) => {
          const base = current < 0 ? 0 : current;
          return (base - 1 + CHANNELS.length) % CHANNELS.length;
        });
        setCustomChannel(null);
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
        const padded = raw.padStart(3, "0");
        const index = CHANNELS.findIndex((item) => item.num === raw || item.num === padded);
        if (index >= 0) {
          setChannelIndex(index);
          setCustomChannel(null);
        } else {
          setChannelIndex(-1);
          setCustomChannel({
            num: padded,
            name: "DIRECT TUNE",
            genre: "LIVE",
            program: "Tuning channel...",
            next: "-",
            progress: 8
          });
        }
        void send("go_to_channel", `Going to channel ${raw}`, raw);
        setChannelInput("");
        setKeypadOpen(false);
      },
      adv: (command, label) => void send(command.toLowerCase().replace(/[^a-z0-9]+/g, "_"), label ?? command)
    }),
    [channelInput, on, send, volume]
  );

  const remoteState: RemoteState = {
    on,
    muted,
    chInput: channelInput,
    keypadOpen,
    drawerOpen
  };

  const captureOk = status.stream.ready || status.capture.state === "online";
  const captureValue = statusLabel(status.capture.state, status.stream.ready);
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
            <StatusChip icon="bolt" label="IR Bridge" value="Stub" ok />
          </div>
          <div className="top-actions">
            <button className="iconbtn" title="Fullscreen" onClick={() => document.documentElement.requestFullscreen?.()}>
              <Icon name="fullscreen" size={18} />
            </button>
            <button className="iconbtn" title="Settings" onClick={() => void send("settings", "Open Settings")}>
              <Icon name="settings" size={18} />
            </button>
          </div>
        </header>

        <main className="main">
          <section className="stage-screen">
            <LiveScreen
              channel={channel}
              on={on}
              muted={muted}
              capture={status.capture.state}
              whepUrl={whepUrl}
              refreshToken={refreshToken}
              onRefresh={() => {
                setRefreshToken((current) => current + 1);
                void send("refresh_stream", "Refresh stream");
              }}
              onMuteStream={handlers.mute}
              onFullscreen={() => document.documentElement.requestFullscreen?.()}
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
