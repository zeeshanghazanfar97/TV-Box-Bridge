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

type RemoteKey = {
  command: string;
  label: string;
  title?: string;
  icon?: IconName;
  className?: string;
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
        window.setTimeout(() => setPressed(false), 160);
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}

function CommandKey({
  item,
  handlers,
  disabled
}: {
  item: RemoteKey;
  handlers: RemoteHandlers;
  disabled?: boolean;
}) {
  return (
    <PressBtn
      className={`remote-key${item.className ? ` ${item.className}` : ""}`}
      title={item.title ?? item.label}
      onClick={() => handlers.adv(item.command, item.title ?? item.label)}
      disabled={disabled}
    >
      {item.icon && <Icon name={item.icon} size={16} />}
      <span>{item.label}</span>
    </PressBtn>
  );
}

function MiniRocker({
  label,
  plusTitle,
  minusTitle,
  onPlus,
  onMinus,
  accent
}: {
  label: string;
  plusTitle: string;
  minusTitle: string;
  onPlus: () => void;
  onMinus: () => void;
  accent?: boolean;
}) {
  return (
    <div className={`mini-rocker${accent ? " mini-rocker-accent" : ""}`}>
      <PressBtn className="mini-rocker-btn" onClick={onPlus} title={plusTitle}>
        <Icon name="plus" size={18} />
      </PressBtn>
      <div className="mini-rocker-label">{label}</div>
      <PressBtn className="mini-rocker-btn" onClick={onMinus} title={minusTitle}>
        <Icon name="minus" size={18} />
      </PressBtn>
    </div>
  );
}

function DPad({ handlers }: { handlers: RemoteHandlers }) {
  return (
    <div className="dpad">
      <PressBtn className="dpad-btn dpad-up" onClick={() => handlers.nav("Up")} title="Up">
        <Icon name="up" size={22} />
      </PressBtn>
      <PressBtn className="dpad-btn dpad-left" onClick={() => handlers.nav("Left")} title="Left">
        <Icon name="left" size={22} />
      </PressBtn>
      <PressBtn className="dpad-ok" onClick={handlers.ok} title="OK / Select">
        OK
      </PressBtn>
      <PressBtn className="dpad-btn dpad-right" onClick={() => handlers.nav("Right")} title="Right">
        <Icon name="right" size={22} />
      </PressBtn>
      <PressBtn className="dpad-btn dpad-down" onClick={() => handlers.nav("Down")} title="Down">
        <Icon name="down" size={22} />
      </PressBtn>
    </div>
  );
}

const topKeys: RemoteKey[] = [
  { command: "red_power_top", label: "STB", title: "Red Power Top", icon: "power", className: "key-danger" },
  { command: "mute_top_right", label: "Mute", title: "Mute Top Right", icon: "mute" },
  { command: "set", label: "SET", title: "SET" },
  { command: "white_power", label: "TV", title: "White Power", icon: "power" },
  { command: "tv", label: "TV", title: "TV" },
  { command: "tv_av", label: "AV", title: "TV/AV" },
  { command: "mute_middle_right", label: "TV Mute", title: "Mute Middle Right", icon: "mute" }
];

const playbackKeys: RemoteKey[] = [
  { command: "red_record", label: "REC", title: "Red Record", icon: "record", className: "key-danger" },
  { command: "rewind", label: "", title: "Rewind", icon: "rewind" },
  { command: "play_pause", label: "", title: "Play/Pause", icon: "play" },
  { command: "stop", label: "", title: "Stop", icon: "stop" },
  { command: "fast_forward", label: "", title: "Fast Forward", icon: "forward" }
];

const serviceKeys: RemoteKey[] = [
  { command: "epg", label: "EPG", title: "EPG", icon: "guide" },
  { command: "fav", label: "FAV", title: "FAV", icon: "star" },
  { command: "red_audio", label: "AUDIO", title: "Red AUDIO", className: "key-red" },
  { command: "yellow_mail", label: "MAIL", title: "Yellow MAIL", className: "key-yellow" },
  { command: "green_sub", label: "SUB", title: "Green SUB", className: "key-green" },
  { command: "blue_media", label: "MEDIA", title: "Blue MEDIA", className: "key-blue" }
];

export function Remote({
  state,
  handlers,
  onClose
}: {
  state: RemoteState;
  handlers: RemoteHandlers;
  onClose: () => void;
}) {
  const full = state.drawerOpen;

  return (
    <aside className={`remote${full ? " is-full" : ""}`} data-off={state.on ? "false" : "true"}>
      <div className="remote-bar">
        <div className="remote-bar-title">
          <span className="remote-grip" />
          TVNation
        </div>
        <button className="remote-mode" onClick={handlers.toggleDrawer} title={full ? "Show quick remote" : "Show all keys"}>
          {full ? "Quick" : "All keys"}
        </button>
        <button className="remote-close" onClick={onClose} title="Close remote">
          <Icon name="exit" size={16} />
        </button>
      </div>

      <div className="remote-body">
        {!full && (
          <div className="remote-quick">
            <div className="quick-top">
              <PressBtn className={`quick-power${state.on ? " is-on" : ""}`} onClick={handlers.power} title="Power">
                <Icon name="power" size={20} />
              </PressBtn>
              <PressBtn className={`quick-mute${state.muted ? " is-on" : ""}`} onClick={handlers.mute} title="Mute">
                <Icon name={state.muted ? "mute" : "volume"} size={19} />
              </PressBtn>
            </div>

            <DPad handlers={handlers} />

            <div className="quick-row">
              <PressBtn className="remote-key" onClick={handlers.back} title="Back">
                <Icon name="back" size={16} />
                <span>Back</span>
              </PressBtn>
              <PressBtn className="remote-key" onClick={handlers.menu} title="Menu / Exit">
                <Icon name="menu" size={16} />
                <span>Menu</span>
              </PressBtn>
              <PressBtn className="remote-key" onClick={handlers.info} title="Info">
                <Icon name="info" size={16} />
                <span>Info</span>
              </PressBtn>
            </div>
          </div>
        )}

        {full && (
          <div className="remote-face">
            <div className="remote-key-grid remote-key-grid-top">
              {topKeys.map((item) => (
                <CommandKey key={item.command} item={item} handlers={handlers} />
              ))}
            </div>

            <div className="remote-tv-strip">
              <MiniRocker label="TV VOL" plusTitle="TV Volume Up" minusTitle="TV Volume Down" onPlus={() => handlers.adv("top_vol_plus", "TV Volume Up")} onMinus={() => handlers.adv("top_vol_minus", "TV Volume Down")} />
              <MiniRocker label="TV CH" plusTitle="TV Channel Up" minusTitle="TV Channel Down" onPlus={() => handlers.adv("top_ch_plus", "TV Channel Up")} onMinus={() => handlers.adv("top_ch_minus", "TV Channel Down")} accent />
            </div>

            <div className="remote-playback">
              {playbackKeys.map((item) => (
                <CommandKey key={item.command} item={item} handlers={handlers} />
              ))}
            </div>

            <div className="remote-center">
              <MiniRocker label="VOL" plusTitle="Volume Up" minusTitle="Volume Down" onPlus={handlers.volUp} onMinus={handlers.volDown} />
              <div className="remote-nav-stack">
                <DPad handlers={handlers} />
                <div className="quick-row">
                  <PressBtn className="remote-key" onClick={handlers.back} title="Back">
                    <Icon name="back" size={16} />
                    <span>Back</span>
                  </PressBtn>
                  <PressBtn className="remote-key" onClick={handlers.menu} title="Menu / Exit">
                    <Icon name="menu" size={16} />
                    <span>Menu</span>
                  </PressBtn>
                  <PressBtn className="remote-key" onClick={handlers.info} title="Info">
                    <Icon name="info" size={16} />
                    <span>Info</span>
                  </PressBtn>
                </div>
              </div>
              <MiniRocker label="CH" plusTitle="Channel Up" minusTitle="Channel Down" onPlus={handlers.chUp} onMinus={handlers.chDown} accent />
            </div>

            <div className="remote-number-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <PressBtn key={digit} className="numkey" onClick={() => handlers.adv(`number_${digit}`, String(digit))}>
                  {digit}
                </PressBtn>
              ))}
              <PressBtn className="numkey numkey-util" onClick={handlers.clearInput} title="Clear channel entry">
                CLR
              </PressBtn>
              <PressBtn className="numkey" onClick={() => handlers.adv("number_0", "0")}>
                0
              </PressBtn>
              <PressBtn className="numkey numkey-go" onClick={handlers.go} disabled={!state.chInput} title="Send typed channel">
                GO
              </PressBtn>
            </div>

            <div className="channel-entry">
              <span>CH</span>
              <input
                inputMode="numeric"
                placeholder="----"
                maxLength={4}
                value={state.chInput}
                onChange={(event) => handlers.setChInput(event.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handlers.go();
                }}
              />
              <PressBtn className="channel-entry-toggle" onClick={handlers.toggleKeypad} title="Append typed digit">
                <Icon name="numpad" size={15} />
              </PressBtn>
            </div>

            {state.keypadOpen && (
              <div className="typed-keypad">
                {"1234567890".split("").map((digit) => (
                  <PressBtn key={digit} className="typed-key" onClick={() => handlers.pressDigit(digit)}>
                    {digit}
                  </PressBtn>
                ))}
              </div>
            )}

            <div className="remote-key-grid remote-service-grid">
              {serviceKeys.map((item) => (
                <CommandKey key={item.command} item={item} handlers={handlers} />
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export type { RemoteHandlers, RemoteState };
