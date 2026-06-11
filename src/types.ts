export type CaptureHealth = "online" | "offline" | "connecting" | "error" | "unknown";

export type Channel = {
  num: string;
  name: string;
  genre: string;
  program: string;
  next: string;
  progress: number;
};

export type RemoteLogEntry = {
  id: number;
  command: string;
  label: string;
  value: string | number | boolean | null;
  receivedAt: string;
  stub: true;
};

export type StatusResponse = {
  serverTime: string;
  capture: {
    state: CaptureHealth;
    device: string;
    audioDevice: string;
    publisher: CaptureHealth;
    lastError: string | null;
  };
  stream: {
    path: string;
    whepUrl: string;
    ready: boolean;
    viewers: number;
  };
  remote: {
    stub: true;
    recent: number;
  };
};

export type RemoteCommandPayload = {
  command: string;
  label?: string;
  value?: string | number | boolean | null;
};
