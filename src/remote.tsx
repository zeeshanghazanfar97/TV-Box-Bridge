import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "./icons";

type RemoteState = {
  on: boolean;
  muted: boolean;
  chInput: string;
  keypadOpen: boolean;
  drawerOpen: boolean;
};

type RemoteHandlers = {
  power: () => void;
  mute: () => void;
  volUp: () => void;
  volDown: () => void;
  chUp: () => void;
  chDown: () => void;
  nav: (direction: string) => void;
  ok: () => void;
  back: () => void;
  menu: () => void;
  info: () => void;
  setChInput: (value: string) => void;
  pressDigit: (digit: string) => void;
  clearInput: () => void;
  toggleKeypad: () => void;
  toggleDrawer: () => void;
  go: () => void;
  adv: (command: string, label?: string) => void;
};

type PressBtnProps = {
  className?: string;
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
  children: ReactNode;
};

function PressBtn({ className = "", onClick, title, disabled, children }: PressBtnProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      className={`${className}${pressed ? " pressed" : ""}`}
      title={title}
      disabled={disabled}
      onClick={() => {
        setPressed(true);
        window.setTimeout(() => setPressed(false), 240);
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}

function Rocker({
  label,
  icon,
  plusTitle,
  minusTitle,
  onPlus,
  onMinus,
  accent,
  disabled
}: {
  label: string;
  icon: IconName;
  plusTitle: string;
  minusTitle: string;
  onPlus: () => void;
  onMinus: () => void;
  accent?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className={`rocker${accent ? " rocker-accent" : ""}`}>
      <PressBtn className="rocker-btn rocker-plus" onClick={onPlus} title={plusTitle} disabled={disabled}>
        <Icon name="plus" size={24} stroke={2.4} />
      </PressBtn>
      <div className="rocker-readout">
        <Icon name={icon} size={19} className="rocker-ic" />
        <div className="rocker-label">{label}</div>
      </div>
      <PressBtn className="rocker-btn rocker-minus" onClick={onMinus} title={minusTitle} disabled={disabled}>
        <Icon name="minus" size={24} stroke={2.4} />
      </PressBtn>
    </div>
  );
}

export function Remote({
  state,
  handlers,
  onClose
}: {
  state: RemoteState;
  handlers: RemoteHandlers;
  onClose: () => void;
}) {
  const off = !state.on;

  return (
    <aside className="remote" data-off={off ? "true" : "false"}>
      <div className="remote-bar">
        <div className="remote-bar-title">
          <span className="remote-grip" />
          Remote
        </div>
        <span className="remote-bar-hint">IR · one-way</span>
        <button className="remote-close" onClick={onClose} title="Close remote">
          <Icon name="exit" size={16} />
        </button>
      </div>

      <div className="remote-body">
        <div className="r-toprow">
          <PressBtn className={`btn-power${state.on ? " is-on" : ""}`} onClick={handlers.power} title="Power">
            <Icon name="power" size={24} stroke={2.4} />
            <span>{state.on ? "On" : "Off"}</span>
          </PressBtn>
          <PressBtn
            className={`btn-mute${state.muted ? " is-on" : ""}`}
            onClick={handlers.mute}
            title="Mute"
            disabled={off}
          >
            <Icon name={state.muted ? "mute" : "volume"} size={22} />
            <span>{state.muted ? "Muted" : "Mute"}</span>
          </PressBtn>
        </div>

        <div className="r-primary">
          <Rocker
            label="VOL"
            icon="volume"
            plusTitle="Volume Up"
            minusTitle="Volume Down"
            onPlus={handlers.volUp}
            onMinus={handlers.volDown}
            disabled={off}
          />
          <Rocker
            label="CH"
            icon="tvav"
            accent
            plusTitle="Channel Up"
            minusTitle="Channel Down"
            onPlus={handlers.chUp}
            onMinus={handlers.chDown}
            disabled={off}
          />
        </div>

        <div className="r-section">
          <div className="r-head">
            <span>Navigate</span>
          </div>
          <div className="dpad">
            <PressBtn className="dpad-btn dpad-up" onClick={() => handlers.nav("Up")} title="Up" disabled={off}>
              <Icon name="up" size={22} />
            </PressBtn>
            <PressBtn className="dpad-btn dpad-left" onClick={() => handlers.nav("Left")} title="Left" disabled={off}>
              <Icon name="left" size={22} />
            </PressBtn>
            <PressBtn className="dpad-ok" onClick={handlers.ok} title="OK / Select" disabled={off}>
              OK
            </PressBtn>
            <PressBtn className="dpad-btn dpad-right" onClick={() => handlers.nav("Right")} title="Right" disabled={off}>
              <Icon name="right" size={22} />
            </PressBtn>
            <PressBtn className="dpad-btn dpad-down" onClick={() => handlers.nav("Down")} title="Down" disabled={off}>
              <Icon name="down" size={22} />
            </PressBtn>
          </div>
          <div className="r-trio">
            <PressBtn className="btn-ghost" onClick={handlers.back} title="Back" disabled={off}>
              <Icon name="back" size={18} />
              <span>Back</span>
            </PressBtn>
            <PressBtn className="btn-ghost" onClick={handlers.menu} title="Menu / Exit" disabled={off}>
              <Icon name="menu" size={18} />
              <span>Menu</span>
            </PressBtn>
            <PressBtn className="btn-ghost" onClick={handlers.info} title="Info" disabled={off}>
              <Icon name="info" size={18} />
              <span>Info</span>
            </PressBtn>
          </div>
        </div>

        <div className="r-section">
          <div className="r-head">
            <span>Go to channel</span>
            <button className={`head-toggle${state.keypadOpen ? " is-on" : ""}`} onClick={handlers.toggleKeypad}>
              <Icon name="numpad" size={15} /> Keypad
            </button>
          </div>
          <div className="gotorow">
            <div className="goto-input">
              <span className="goto-pre">CH</span>
              <input
                inputMode="numeric"
                placeholder="-"
                maxLength={4}
                value={state.chInput}
                disabled={off}
                onChange={(event) => handlers.setChInput(event.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handlers.go();
                }}
              />
            </div>
            <PressBtn className="btn-accent goto-btn" onClick={handlers.go} title="Go" disabled={off || !state.chInput}>
              Go
            </PressBtn>
          </div>
          <div className={`keypad${state.keypadOpen ? " open" : ""}`}>
            <div className="keypad-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <PressBtn
                  key={digit}
                  className="numkey"
                  onClick={() => handlers.pressDigit(String(digit))}
                  disabled={off}
                >
                  {digit}
                </PressBtn>
              ))}
              <PressBtn className="numkey numkey-util" onClick={handlers.clearInput} disabled={off} title="Clear">
                ⌫
              </PressBtn>
              <PressBtn className="numkey" onClick={() => handlers.pressDigit("0")} disabled={off}>
                0
              </PressBtn>
              <PressBtn className="numkey numkey-go" onClick={handlers.go} disabled={off || !state.chInput} title="Go">
                Go
              </PressBtn>
            </div>
          </div>
        </div>

        <div className="r-section r-drawer-sec">
          <button className={`drawer-toggle${state.drawerOpen ? " is-open" : ""}`} onClick={handlers.toggleDrawer}>
            <span>
              <Icon name="bolt" size={16} /> More controls
            </span>
            <Icon name={state.drawerOpen ? "up" : "down"} size={18} />
          </button>
          <div className={`drawer${state.drawerOpen ? " open" : ""}`}>
            <div className="drawer-inner">
              <div className="drawer-sublabel">Sources &amp; guide</div>
              <div className="drawer-grid">
                {[
                  ["guide", "Guide", "EPG"],
                  ["star", "Favorites", "FAV"],
                  ["tvav", "TV / AV", "TV/AV"],
                  ["audio", "Audio", "Audio"],
                  ["sub", "Subtitles", "SUB"],
                  ["media", "Media", "MEDIA"]
                ].map(([icon, label, command]) => (
                  <PressBtn key={command} className="advkey" onClick={() => handlers.adv(command, label)} disabled={off}>
                    <Icon name={icon as IconName} size={20} />
                    <span>{label}</span>
                  </PressBtn>
                ))}
              </div>
              <div className="drawer-sublabel">Playback</div>
              <div className="transport">
                <PressBtn className="tpkey" onClick={() => handlers.adv("Rewind", "Rewind")} disabled={off} title="Rewind">
                  <Icon name="rewind" size={18} />
                </PressBtn>
                <PressBtn
                  className="tpkey"
                  onClick={() => handlers.adv("Play/Pause", "Play / Pause")}
                  disabled={off}
                  title="Play / Pause"
                >
                  <Icon name="play" size={18} />
                </PressBtn>
                <PressBtn className="tpkey" onClick={() => handlers.adv("Stop", "Stop")} disabled={off} title="Stop">
                  <Icon name="stop" size={18} />
                </PressBtn>
                <PressBtn
                  className="tpkey"
                  onClick={() => handlers.adv("Forward", "Fast forward")}
                  disabled={off}
                  title="Fast forward"
                >
                  <Icon name="forward" size={18} />
                </PressBtn>
                <PressBtn className="tpkey tpkey-rec" onClick={() => handlers.adv("Record", "Record")} disabled={off} title="Record">
                  <Icon name="record" size={16} />
                </PressBtn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export type { RemoteHandlers, RemoteState };
