import type { RemoteCommandPayload, RemoteLogEntry, StatusResponse } from "./types";

const jsonHeaders = { "Content-Type": "application/json" };

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchStatus(): Promise<StatusResponse> {
  return parseJson<StatusResponse>(await fetch("/api/status", { cache: "no-store" }));
}

export async function fetchRemoteLog(): Promise<RemoteLogEntry[]> {
  const data = await parseJson<{ entries: RemoteLogEntry[] }>(
    await fetch("/api/remote/log", { cache: "no-store" })
  );
  return data.entries;
}

export async function sendRemoteCommand(payload: RemoteCommandPayload): Promise<RemoteLogEntry> {
  const data = await parseJson<{ accepted: true; stub: true; entry: RemoteLogEntry }>(
    await fetch("/api/remote/command", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(payload)
    })
  );
  return data.entry;
}
