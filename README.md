# TV Box Bridge

LAN dashboard for watching an HDMI cable box capture stream in the browser. The
UI is productized from `ltv.zip` and includes a compact virtual remote backed by
a Raspberry Pi Pico USB serial IR bridge.

## What Runs

- React/Vite dashboard served by a small Node API.
- MediaMTX receives the capture stream and exposes WebRTC/WHEP.
- FFmpeg capture publisher reads V4L2 video plus ALSA audio and publishes to
  MediaMTX over RTSP.
- Raspberry Pi Pico receives serial commands from the backend and sends NEC or
  Samsung IR through the transmitter.

## Quick Start

```bash
cp .env.example .env
docker compose up --build
```

Open:

```text
http://localhost:8080
```

For real hardware setup, see [docs/hardware-setup.md](docs/hardware-setup.md),
[docs/ir-bridge.md](docs/ir-bridge.md), and
[docs/jellyfin-live-tv.md](docs/jellyfin-live-tv.md).

## API

- `GET /api/status`
- `POST /api/remote/command`
- `GET /api/remote/log`
- `GET /live-tv/tvbox.m3u`

Remote commands resolve dashboard keys to the recorded IR codes and send them to
the Pico over the configured serial device.
