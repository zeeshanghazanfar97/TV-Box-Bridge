import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveRemoteSequence, summarizeCode } from "./remote-codes.js";
import { SerialIrBridge } from "./serial-ir-bridge.js";

const root = join(fileURLToPath(new URL("..", import.meta.url)), "dist");
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";
const remoteLog = [];
let nextRemoteId = 1;

const config = {
  streamPath: process.env.STREAM_PATH || "tvbox",
  whepUrl: process.env.STREAM_WHEP_URL || process.env.VITE_STREAM_WHEP_URL || "",
  mediamtxApiUrl: process.env.MEDIAMTX_API_URL || "http://localhost:9997",
  videoDevice: process.env.TVBOX_VIDEO_DEVICE || "/dev/tvbox-video",
  audioDevice: process.env.TVBOX_AUDIO_DEVICE || "plughw:CARD=<capture-card-id>,DEV=0",
  remote: {
    enabled: process.env.IR_BRIDGE_ENABLED !== "false",
    serialPath: process.env.IR_SERIAL_PATH || process.env.IR_SERIAL_DEVICE || "/dev/ir-pico",
    serialBaud: Number(process.env.IR_SERIAL_BAUD || 115200),
    serialTimeoutMs: Number(process.env.IR_SERIAL_TIMEOUT_MS || 1400),
    serialOpenDelayMs: Number(process.env.IR_SERIAL_OPEN_DELAY_MS || 1800),
    commandDelayMs: Number(process.env.IR_COMMAND_DELAY_MS || 120),
    channelConfirmCommand: process.env.IR_CHANNEL_CONFIRM_COMMAND || ""
  }
};

const irBridge = new SerialIrBridge({
  enabled: config.remote.enabled,
  path: config.remote.serialPath,
  baudRate: config.remote.serialBaud,
  timeoutMs: config.remote.serialTimeoutMs,
  openDelayMs: config.remote.serialOpenDelayMs,
  commandDelayMs: config.remote.commandDelayMs
});

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function sendJson(response, status, data) {
  const body = JSON.stringify(data);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  response.end(body);
}

function notFound(response) {
  sendJson(response, 404, { error: "Not found" });
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 64 * 1024) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function normalizePath(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.(\/|\\|$))+/, "");
  if (clean === "/" || clean === ".") return "/index.html";
  return clean.startsWith("/") ? clean : `/${clean}`;
}

function findPathRecord(pathsPayload) {
  const candidates = [];

  if (Array.isArray(pathsPayload?.items)) candidates.push(...pathsPayload.items);
  if (Array.isArray(pathsPayload)) candidates.push(...pathsPayload);

  return candidates.find((item) => item?.name === config.streamPath || item?.confName === config.streamPath) || null;
}

async function queryMediaMTX() {
  const url = `${config.mediamtxApiUrl.replace(/\/$/, "")}/v3/paths/list`;
  const response = await fetch(url, { signal: AbortSignal.timeout(1200) });
  if (!response.ok) throw new Error(`MediaMTX API ${response.status}`);
  const payload = await response.json();
  const path = findPathRecord(payload);

  if (!path) {
    return {
      ready: false,
      publisher: "offline",
      viewers: 0,
      lastError: "MediaMTX path is not published yet"
    };
  }

  const readers = Number(path.readerCount ?? path.readers?.length ?? path.bytesReceived ?? 0);
  const ready = Boolean(path.ready ?? path.sourceReady ?? path.source);

  return {
    ready,
    publisher: ready ? "online" : "offline",
    viewers: Number.isFinite(readers) ? readers : 0,
    lastError: ready ? null : "MediaMTX path exists but has no active publisher"
  };
}

function getWhepUrl(request) {
  if (config.whepUrl) return config.whepUrl;

  const host = request.headers.host || "localhost:8080";
  const hostname = host.includes(":") ? host.split(":")[0] : host;
  return `http://${hostname}:8889/${config.streamPath}/whep`;
}

async function handleStatus(request, response) {
  let media = {
    ready: false,
    publisher: "unknown",
    viewers: 0,
    lastError: "MediaMTX API is not reachable"
  };

  try {
    media = await queryMediaMTX();
  } catch (error) {
    media.lastError = error instanceof Error ? error.message : "MediaMTX API is not reachable";
  }

  const remoteStatus = await irBridge.status();

  sendJson(response, 200, {
    serverTime: new Date().toISOString(),
    capture: {
      state: media.ready ? "online" : media.publisher,
      device: config.videoDevice,
      audioDevice: config.audioDevice,
      publisher: media.publisher,
      lastError: media.lastError
    },
    stream: {
      path: config.streamPath,
      whepUrl: getWhepUrl(request),
      ready: media.ready,
      viewers: media.viewers
    },
    remote: {
      stub: !remoteStatus.enabled,
      enabled: remoteStatus.enabled,
      available: remoteStatus.available,
      device: remoteStatus.device,
      baudRate: remoteStatus.baudRate,
      recent: remoteLog.length,
      lastError: remoteStatus.lastError,
      lastCommandAt: remoteStatus.lastCommandAt
    }
  });
}

async function handleRemoteCommand(request, response) {
  let entry = null;

  try {
    const raw = await readBody(request);
    const payload = raw ? JSON.parse(raw) : {};
    const command = String(payload.command || "").trim();
    const sequence = resolveRemoteSequence(payload, {
      channelConfirmCommand: config.remote.channelConfirmCommand
    });

    entry = {
      id: nextRemoteId++,
      command,
      label: String(payload.label || command),
      value: payload.value ?? null,
      receivedAt: new Date().toISOString(),
      stub: !config.remote.enabled,
      sent: false,
      sequence: sequence.map(summarizeCode),
      bridgeResponses: [],
      error: null
    };

    if (config.remote.enabled) {
      entry.bridgeResponses = await irBridge.sendSequence(sequence);
      entry.sent = true;
    }

    remoteLog.unshift(entry);
    remoteLog.splice(24);

    sendJson(response, 200, { accepted: true, stub: entry.stub, entry });
  } catch (error) {
    const statusCode = error?.statusCode || (entry ? 503 : 400);
    const message = error instanceof Error ? error.message : "Invalid request";

    if (entry) {
      entry.error = message;
      remoteLog.unshift(entry);
      remoteLog.splice(24);
    }

    sendJson(response, statusCode, {
      accepted: false,
      error: message,
      entry
    });
  }
}

async function handleStatic(request, response) {
  const requestedPath = normalizePath(new URL(request.url, "http://localhost").pathname);
  const diskPath = join(root, requestedPath);

  if (!diskPath.startsWith(root)) {
    notFound(response);
    return;
  }

  try {
    const info = await stat(diskPath);
    if (!info.isFile()) throw new Error("Not a file");
    const data = await readFile(diskPath);
    const type = mimeTypes[extname(diskPath)] || "application/octet-stream";
    response.writeHead(200, {
      "Content-Type": type,
      "Content-Length": data.byteLength,
      "Cache-Control": requestedPath === "/index.html" ? "no-store" : "public, max-age=31536000, immutable"
    });
    response.end(data);
  } catch {
    try {
      const data = await readFile(join(root, "index.html"));
      response.writeHead(200, {
        "Content-Type": mimeTypes[".html"],
        "Content-Length": data.byteLength,
        "Cache-Control": "no-store"
      });
      response.end(data);
    } catch {
      sendJson(response, 503, { error: "Dashboard build not found. Run npm run build first." });
    }
  }
}

const server = createServer(async (request, response) => {
  const method = request.method || "GET";
  const pathname = new URL(request.url || "/", "http://localhost").pathname;

  if (method === "GET" && pathname === "/api/status") {
    await handleStatus(request, response);
    return;
  }

  if (method === "GET" && pathname === "/api/remote/log") {
    sendJson(response, 200, { entries: remoteLog });
    return;
  }

  if (method === "POST" && pathname === "/api/remote/command") {
    await handleRemoteCommand(request, response);
    return;
  }

  if (pathname.startsWith("/api/")) {
    notFound(response);
    return;
  }

  if (method !== "GET" && method !== "HEAD") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  await handleStatic(request, response);
});

server.listen(port, host, () => {
  console.log(`TV Box Bridge dashboard listening on ${host}:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    irBridge.close().finally(() => process.exit(0));
  });
}
