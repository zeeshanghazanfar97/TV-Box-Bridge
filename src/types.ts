export type CaptureHealth = "online" | "offline" | "connecting" | "error" | "unknown";

export type RemoteLogEntry = {
  id: number;
  command: string;
  label: string;
  value: string | number | boolean | null;
  receivedAt: string;
  stub: boolean;
  sent: boolean;
  sequence?: Array<{
    key: string;
    label: string;
    protocol: string;
    address: string;
    command: string;
    raw: string;
    bits: number;
  }>;
  bridgeResponses?: Array<{
    request: string;
    response: string;
  }>;
  error?: string | null;
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
    stub: boolean;
    enabled: boolean;
    available: boolean;
    device: string;
    baudRate: number;
    recent: number;
    lastError: string | null;
    lastCommandAt: string | null;
  };
};

export type RemoteCommandPayload = {
  command: string;
  label?: string;
  value?: string | number | boolean | null;
};
