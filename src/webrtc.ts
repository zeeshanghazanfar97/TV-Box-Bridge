type PlayerState = "idle" | "connecting" | "playing" | "error";

export type WHEPConnection = {
  close: () => void;
};

export type WHEPHandlers = {
  onState: (state: PlayerState, message?: string) => void;
  onStream: (stream: MediaStream) => void;
};

function waitForIceGathering(peer: RTCPeerConnection): Promise<void> {
  if (peer.iceGatheringState === "complete") return Promise.resolve();

  return new Promise((resolve) => {
    const timeout = window.setTimeout(done, 2500);

    function done() {
      window.clearTimeout(timeout);
      peer.removeEventListener("icegatheringstatechange", onChange);
      resolve();
    }

    function onChange() {
      if (peer.iceGatheringState === "complete") done();
    }

    peer.addEventListener("icegatheringstatechange", onChange);
  });
}

export async function connectWHEP(url: string, handlers: WHEPHandlers): Promise<WHEPConnection> {
  if (!url) throw new Error("Missing WHEP URL");

  handlers.onState("connecting");

  const peer = new RTCPeerConnection({ iceServers: [] });
  let closed = false;
  let resourceUrl: string | null = null;

  peer.addTransceiver("video", { direction: "recvonly" });
  peer.addTransceiver("audio", { direction: "recvonly" });

  peer.ontrack = (event) => {
    const [stream] = event.streams;
    if (stream) {
      handlers.onStream(stream);
      handlers.onState("playing");
    }
  };

  peer.onconnectionstatechange = () => {
    if (closed) return;
    if (peer.connectionState === "failed" || peer.connectionState === "disconnected") {
      handlers.onState("error", `WebRTC ${peer.connectionState}`);
    }
  };

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  await waitForIceGathering(peer);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/sdp" },
    body: peer.localDescription?.sdp ?? offer.sdp ?? ""
  });

  if (!response.ok) {
    peer.close();
    throw new Error(`WHEP offer failed: ${response.status} ${response.statusText}`);
  }

  const location = response.headers.get("Location");
  if (location) resourceUrl = new URL(location, url).href;

  const answer = await response.text();
  await peer.setRemoteDescription({ type: "answer", sdp: answer });

  return {
    close: () => {
      closed = true;
      peer.close();
      if (resourceUrl) {
        fetch(resourceUrl, { method: "DELETE" }).catch(() => undefined);
      }
    }
  };
}

export type { PlayerState };
