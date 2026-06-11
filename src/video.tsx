import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
import { connectWHEP, type PlayerState, type WHEPConnection } from "./webrtc";
import type { CaptureHealth, Channel } from "./types";

type LiveScreenProps = {
  channel: Channel;
  on: boolean;
  muted: boolean;
  capture: CaptureHealth;
  whepUrl: string;
  refreshToken: number;
  onRefresh: () => void;
  onMuteStream: () => void;
  onFullscreen: () => void;
};

function StandbyScene({ message, detail }: { message: string; detail: string }) {
  return (
    <div className="scene scene-standby">
      <div className="standby-mark">
        <Icon name="power" size={40} />
      </div>
      <div className="standby-text">{message}</div>
      <div className="standby-sub">{detail}</div>
    </div>
  );
}

function BroadcastFallback() {
  return (
    <div className="scene scene-broadcast">
      <div className="bc-sky" />
      <div className="bc-glow" />
      <div className="bc-horizon" />
      <div className="bc-vignette" />
    </div>
  );
}

function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return {
    hh: String(now.getHours()).padStart(2, "0"),
    mm: String(now.getMinutes()).padStart(2, "0"),
    ss: String(now.getSeconds()).padStart(2, "0")
  };
}

export function LiveScreen({
  channel,
  on,
  muted,
  capture,
  whepUrl,
  refreshToken,
  onRefresh,
  onMuteStream,
  onFullscreen
}: LiveScreenProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const connectionRef = useRef<WHEPConnection | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const { hh, mm, ss } = useClock();

  useEffect(() => {
    connectionRef.current?.close();
    connectionRef.current = null;

    const video = videoRef.current;
    if (!video) return;
    video.srcObject = null;

    if (!on) {
      setPlayerState("idle");
      setMessage(null);
      return;
    }

    let cancelled = false;

    connectWHEP(whepUrl, {
      onState: (state, nextMessage) => {
        if (!cancelled) {
          setPlayerState(state);
          setMessage(nextMessage ?? null);
        }
      },
      onStream: (stream) => {
        if (!cancelled && videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {
            setMessage("Click the screen to start playback");
          });
        }
      }
    })
      .then((connection) => {
        if (cancelled) {
          connection.close();
          return;
        }
        connectionRef.current = connection;
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setPlayerState("error");
          setMessage(error instanceof Error ? error.message : "Unable to connect to stream");
        }
      });

    return () => {
      cancelled = true;
      connectionRef.current?.close();
      connectionRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [on, whepUrl, refreshToken]);

  const live = on && playerState === "playing";
  const offline = capture === "offline" || capture === "error";

  return (
    <div className="screen">
      <BroadcastFallback />
      <video
        ref={videoRef}
        className={`video-el${live ? " is-live" : ""}`}
        autoPlay
        playsInline
        muted={muted}
        onClick={() => videoRef.current?.play().catch(() => undefined)}
      />

      {!on && <StandbyScene message="STANDBY" detail="Box is powered off, press Power to wake" />}
      {on && playerState === "connecting" && (
        <div className="scene scene-striped">
          <span className="ph-label">LIVE CAPTURE · HDMI IN · CONNECTING</span>
        </div>
      )}
      {on && playerState === "error" && (
        <StandbyScene message={offline ? "CAPTURE OFFLINE" : "STREAM ERROR"} detail={message ?? "Refresh the stream when capture is ready"} />
      )}

      {live && (
        <div className="screen-overlays">
          <div className="ov-top">
            <div className="bug">
              <span className="bug-num">{channel.num}</span>
              <span className="bug-name">{channel.name}</span>
              <span className="bug-hd">HD</span>
            </div>
            <div className="ov-top-right">
              <div className="live-badge">
                <span className="live-dot" />
                LIVE
              </div>
              <div className="clock">
                {hh}:{mm}
                <span className="clock-s">:{ss}</span>
              </div>
            </div>
          </div>

          <div className="ov-bottom">
            <div className="lowerthird">
              <div className="lt-bar" />
              <div className="lt-body">
                <div className="lt-kicker">{channel.genre} · NOW</div>
                <div className="lt-title">{channel.program}</div>
                <div className="lt-next">Next: {channel.next}</div>
              </div>
              <div className="lt-prog">
                <div className="lt-prog-fill" style={{ width: `${channel.progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="screen-controls">
        <button className="sc-btn" onClick={onRefresh} title="Refresh stream">
          <Icon name="refresh" size={18} />
        </button>
        <button className={`sc-btn${muted ? " is-on" : ""}`} onClick={onMuteStream} title="Mute stream">
          <Icon name={muted ? "mute" : "volume"} size={18} />
        </button>
        <button className="sc-btn" onClick={onFullscreen} title="Fullscreen">
          <Icon name="fullscreen" size={18} />
        </button>
      </div>

      {live && muted && (
        <div className="screen-mute-flag">
          <Icon name="mute" size={16} /> MUTED
        </div>
      )}
    </div>
  );
}
