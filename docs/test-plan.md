# Test Plan

## Hardware

- `lsusb -d 534d:2109` shows the MacroSilicon device.
- `/dev/tvbox-video` exists and survives unplug/replug.
- `v4l2-ctl --list-formats-ext -d /dev/tvbox-video` shows `MJPG` at the selected resolution and frame rate.
- `arecord -L` contains the configured ALSA capture name.

## Capture Publisher

Run a short host-side capture before Docker:

```bash
ffmpeg -f v4l2 -input_format mjpeg -video_size 1920x1080 -framerate 30 -i /dev/tvbox-video -f alsa -i "$TVBOX_AUDIO_DEVICE" -t 10 -f null -
```

Then run Compose:

```bash
docker compose up --build
```

Confirm `capture-publisher` logs show FFmpeg publishing to `rtsp://mediamtx:8554/tvbox`.

## Streaming

- `http://<server-ip>:8889/tvbox` plays through the MediaMTX direct WebRTC page.
- `http://<server-ip>:8080` plays through the dashboard screen.
- Refresh, mute, and fullscreen controls operate without losing the page.
- Unplugging the capture card moves the dashboard to an offline/error state.
- Replugging and restarting `capture-publisher` returns the status to online.

## Remote UI

- Remote is open by default and can be closed to reveal the bottom-right launcher.
- Power, mute, volume, channel, D-pad, Back, Menu, Info, keypad, drawer, source, guide, and transport buttons all show pressed feedback.
- Every button sends `POST /api/remote/command` and creates a toast.
- No IR hardware action happens in v1.
