import { constants as fsConstants } from "node:fs";
import { access, open } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function hex(value, width = 0) {
  return `0x${Number(value).toString(16).toUpperCase().padStart(width, "0")}`;
}

class SerialIrBridge {
  constructor({
    enabled = true,
    path = "/dev/ir-pico",
    baudRate = 115200,
    timeoutMs = 1400,
    commandDelayMs = 120
  } = {}) {
    this.enabled = enabled;
    this.path = path;
    this.baudRate = baudRate;
    this.timeoutMs = timeoutMs;
    this.commandDelayMs = commandDelayMs;
    this.handle = null;
    this.pending = Promise.resolve();
    this.readBuffer = "";
    this.lastError = null;
    this.lastCommandAt = null;
  }

  async isAvailable() {
    if (!this.enabled) return false;

    try {
      await access(this.path, fsConstants.R_OK | fsConstants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  async status() {
    return {
      enabled: this.enabled,
      available: await this.isAvailable(),
      device: this.path,
      baudRate: this.baudRate,
      lastError: this.lastError,
      lastCommandAt: this.lastCommandAt
    };
  }

  async configurePort() {
    await execFileAsync(
      "stty",
      [
        "-F",
        this.path,
        String(this.baudRate),
        "raw",
        "-echo",
        "-echoe",
        "-echok",
        "-echoctl",
        "-echoke",
        "-icanon",
        "min",
        "0",
        "time",
        "1"
      ],
      { timeout: 1000 }
    );
  }

  async ensureOpen() {
    if (this.handle) return;

    await this.configurePort();
    this.handle = await open(this.path, "r+");
    this.readBuffer = "";
  }

  async close() {
    const handle = this.handle;
    this.handle = null;
    if (handle) {
      await handle.close().catch(() => undefined);
    }
  }

  async send(code) {
    if (!this.enabled) {
      throw new Error("IR bridge is disabled");
    }

    this.pending = this.pending.then(
      () => this.sendUnlocked(code),
      () => this.sendUnlocked(code)
    );

    return this.pending;
  }

  async sendUnlocked(code) {
    const line = `SEND ${code.protocol} ${hex(code.raw, 8)} 0\n`;

    try {
      await this.ensureOpen();
      await this.handle.write(line);
      const response = await this.readResponse();
      this.lastError = null;
      this.lastCommandAt = new Date().toISOString();
      return {
        request: line.trim(),
        response
      };
    } catch (error) {
      await this.close();
      this.lastError = errorMessage(error);
      throw error;
    }
  }

  async sendSequence(sequence) {
    const results = [];

    for (const code of sequence) {
      results.push(await this.send(code));
      if (this.commandDelayMs > 0 && code !== sequence[sequence.length - 1]) {
        await delay(this.commandDelayMs);
      }
    }

    return results;
  }

  async readResponse() {
    const startedAt = Date.now();
    const chunk = Buffer.alloc(256);

    while (Date.now() - startedAt < this.timeoutMs) {
      const { bytesRead } = await this.handle.read(chunk, 0, chunk.length, null);

      if (bytesRead > 0) {
        this.readBuffer += chunk.toString("utf8", 0, bytesRead);

        let newline = this.readBuffer.search(/\r?\n/);
        while (newline >= 0) {
          const line = this.readBuffer.slice(0, newline).trim();
          this.readBuffer = this.readBuffer.slice(newline + (this.readBuffer[newline] === "\r" ? 2 : 1));

          if (line.startsWith("OK ")) return line;
          if (line.startsWith("ERR ")) throw new Error(line);

          newline = this.readBuffer.search(/\r?\n/);
        }
      } else {
        await delay(20);
      }
    }

    throw new Error(`Timed out waiting for Pico response on ${this.path}`);
  }
}

export { SerialIrBridge };
