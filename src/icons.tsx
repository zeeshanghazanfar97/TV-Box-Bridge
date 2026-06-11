import type { SVGProps } from "react";

type IconName =
  | "power"
  | "mute"
  | "volume"
  | "plus"
  | "minus"
  | "up"
  | "down"
  | "left"
  | "right"
  | "back"
  | "menu"
  | "exit"
  | "info"
  | "settings"
  | "fullscreen"
  | "refresh"
  | "record"
  | "play"
  | "stop"
  | "rewind"
  | "forward"
  | "guide"
  | "star"
  | "tvav"
  | "audio"
  | "sub"
  | "media"
  | "signal"
  | "chip"
  | "bolt"
  | "numpad";

const paths: Record<IconName, JSX.Element> = {
  power: (
    <>
      <path d="M12 3v9" />
      <path d="M6.6 6.6a8 8 0 1 0 10.8 0" />
    </>
  ),
  mute: (
    <>
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="m22 9-6 6" />
      <path d="m16 9 6 6" />
    </>
  ),
  volume: (
    <>
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 5a9 9 0 0 1 0 14" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  up: <path d="m6 15 6-6 6 6" />,
  down: <path d="m6 9 6 6 6-6" />,
  left: <path d="m15 6-6 6 6 6" />,
  right: <path d="m9 6 6 6-6 6" />,
  back: (
    <>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h11a6 6 0 0 1 0 12h-1" />
    </>
  ),
  menu: (
    <>
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </>
  ),
  exit: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-5" />
      <path d="M12 8h.01" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
  fullscreen: (
    <>
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </>
  ),
  refresh: (
    <>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </>
  ),
  record: <circle cx="12" cy="12" r="6" />,
  play: <path d="m6 4 14 8-14 8z" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="1.5" />,
  rewind: (
    <>
      <path d="m11 19-9-7 9-7z" />
      <path d="m22 19-9-7 9-7z" />
    </>
  ),
  forward: (
    <>
      <path d="m13 19 9-7-9-7z" />
      <path d="m2 19 9-7-9-7z" />
    </>
  ),
  guide: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 9v11" />
    </>
  ),
  star: <path d="m12 3 2.6 5.6 6 .7-4.4 4.1 1.2 6L12 16.8 6.6 19.4l1.2-6L3.4 9.3l6-.7z" />,
  tvav: (
    <>
      <rect x="2" y="5" width="20" height="13" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 18v3" />
    </>
  ),
  audio: (
    <>
      <path d="M3 10v4" />
      <path d="M7 6v12" />
      <path d="M11 3v18" />
      <path d="M15 7v10" />
      <path d="M19 10v4" />
    </>
  ),
  sub: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 13h3" />
      <path d="M14 13h3" />
    </>
  ),
  media: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m10 9 5 3-5 3z" />
    </>
  ),
  signal: (
    <>
      <path d="M3 18h.01" />
      <path d="M7 18v-3" />
      <path d="M11 18v-6" />
      <path d="M15 18v-9" />
      <path d="M19 18V6" />
    </>
  ),
  chip: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <path d="M9 1v4" />
      <path d="M15 1v4" />
      <path d="M9 19v4" />
      <path d="M15 19v4" />
      <path d="M1 9h4" />
      <path d="M1 15h4" />
      <path d="M19 9h4" />
      <path d="M19 15h4" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  numpad: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <circle cx="8" cy="8" r=".6" />
      <circle cx="12" cy="8" r=".6" />
      <circle cx="16" cy="8" r=".6" />
      <circle cx="8" cy="12" r=".6" />
      <circle cx="12" cy="12" r=".6" />
      <circle cx="16" cy="12" r=".6" />
      <circle cx="12" cy="16" r=".6" />
    </>
  )
};

type IconProps = Omit<SVGProps<SVGSVGElement>, "stroke" | "width" | "height"> & {
  name: IconName;
  size?: number;
  stroke?: number;
};

export function Icon({ name, size = 22, stroke = 2, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

export type { IconName };
