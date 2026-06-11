import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
import { connectWHEP, type PlayerState, type WHEPConnection } from "./webrtc";
import type { CaptureHealth } from "./types";

type LiveScreenProps = {
  screenRef: { current: HTMLDivElement | null };
  on: boolean;
  muted: boolean;
  volume: number;
  capture: CaptureHealth;
  whepUrl: string;
  refreshToken: number;
  onMutedChange: (muted: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onRefresh: () => void;
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
  screenRef,
  on,
  muted,
  volume,
  capture,
  whepUrl,
  refreshToken,
  onMutedChange,
  onVolumeChange,
  onRefresh,
  onFullscreen
}: LiveScreenProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const connectionRef = useRef<WHEPConnection | null>(null);
  const hudTimer = useRef<number | null>(null);
  const [playbackStarted, setPlaybackStarted] = useState(false);
  const [needsPlaybackGesture, setNeedsPlaybackGesture] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [showVolumeHud, setShowVolumeHud] = useState(false);
  const { hh, mm, ss } = useClock();

  function flashVolumeHud() {
    setShowVolumeHud(true);
    if (hudTimer.current) window.clearTimeout(hudTimer.current);
    hudTimer.current = window.setTimeout(() => setShowVolumeHud(false), 900);
  }

  function setLocalVolume(next: number) {
    const clamped = Math.max(0, Math.min(1, next));
    onVolumeChange(clamped);
    if (clamped > 0 && muted) onMutedChange(false);
    flashVolumeHud();
  }

  function toggleLocalMute() {
    onMutedChange(!muted);
    flashVolumeHud();
  }

  function startPlayback() {
    setPlaybackStarted(true);
    setNeedsPlaybackGesture(false);
    if (videoRef.current?.srcObject) {
      videoRef.current.play().catch(() => setNeedsPlaybackGesture(true));
    }
  }

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

    if (!playbackStarted) {
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
            setNeedsPlaybackGesture(true);
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
  }, [on, playbackStarted, whepUrl, refreshToken]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = Math.max(0, Math.min(1, volume));
  }, [volume]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, button, [contenteditable='true']")) return;

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setLocalVolume(volume + 0.05);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setLocalVolume(volume - 0.05);
      } else if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        toggleLocalMute();
      } else if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        onFullscreen();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [muted, onFullscreen, onMutedChange, onVolumeChange, volume]);

  const live = on && playerState === "playing";
  const offline = capture === "offline" || capture === "error";
  const volumePercent = Math.round((muted ? 0 : volume) * 100);
  const showStart = on && playerState !== "error" && (!playbackStarted || needsPlaybackGesture);
  const startStatus = offline ? "Capture offline" : "HDMI capture ready";

  return (
    <div
      ref={(node) => {
        screenRef.current = node;
      }}
      className="screen"
      onDoubleClick={(event) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest("button, input")) return;
        onFullscreen();
      }}
    >
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
      {showStart && (
        <div className="scene scene-start">
          <div className="start-panel">
            <button className="start-button" onClick={startPlayback} type="button">
              <Icon name="play" size={22} />
              <span>Start Live TV</span>
            </button>
            <div className="start-status">
              <span className="live-dot" />
              {startStatus}
            </div>
          </div>
        </div>
      )}
      {on && playerState === "connecting" && (
        <div className="scene scene-striped">
          <span className="ph-label">LIVE CAPTURE · HDMI IN · CONNECTING</span>
        </div>
      )}
      {on && playerState === "error" && (
        <div className="scene scene-standby">
          <div className="standby-mark">
            <Icon name="power" size={40} />
          </div>
          <div className="standby-text">{offline ? "CAPTURE OFFLINE" : "STREAM ERROR"}</div>
          <div className="standby-sub">{message ?? "Refresh the stream when capture is ready"}</div>
          <button
            className="retry-button"
            onClick={() => {
              setPlaybackStarted(true);
              onRefresh();
            }}
            type="button"
          >
            <Icon name="refresh" size={16} />
            <span>Retry Stream</span>
          </button>
        </div>
      )}

      {live && (
        <div className="screen-overlays">
          <div className="ov-top">
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
        </div>
      )}

      <div className="screen-controls">
        <button className="sc-btn" onClick={onRefresh} title="Refresh stream">
          <Icon name="refresh" size={18} />
        </button>
        <button className={`sc-btn${muted ? " is-on" : ""}`} onClick={toggleLocalMute} title="Mute stream">
          <Icon name={muted ? "mute" : "volume"} size={18} />
        </button>
        <input
          className="volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={muted ? 0 : volume}
          onChange={(event) => setLocalVolume(Number(event.target.value))}
          title="Volume"
        />
        <button className="sc-btn" onClick={onFullscreen} title="Fullscreen">
          <Icon name="fullscreen" size={18} />
        </button>
      </div>

      {live && (muted || showVolumeHud) && (
        <div className={`screen-volume-flag${muted ? " is-muted" : ""}`}>
          <Icon name={muted ? "mute" : "volume"} size={16} />
          <span>{muted ? "MUTED" : `${volumePercent}%`}</span>
        </div>
      )}
    </div>
  );
}
