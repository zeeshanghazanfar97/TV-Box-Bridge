# TV Box Bridge

LAN dashboard for watching an HDMI cable box capture stream in the browser. The
UI is productized from `ltv.zip` and keeps the mockup's full virtual remote,
while remote actions are stubbed until the custom IR bridge is ready.

## What Runs

- React/Vite dashboard served by a small Node API.
- MediaMTX receives the capture stream and exposes WebRTC/WHEP.
- FFmpeg capture publisher reads V4L2 video plus ALSA audio and publishes to
  MediaMTX over RTSP.

## Quick Start

```bash
cp .env.example .env
docker compose up --build
```

Open:

```text
http://localhost:8080
```

For real hardware setup, see [docs/hardware-setup.md](docs/hardware-setup.md).

## API

- `GET /api/status`
- `POST /api/remote/command`
- `GET /api/remote/log`

Remote commands return `{ accepted: true, stub: true }` in v1.
