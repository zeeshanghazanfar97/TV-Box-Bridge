# Test Plan

## Hardware

- `lsusb -d 534d:2109` shows the MacroSilicon device.
- `lsusb -d 2e8a:000a` shows the Raspberry Pi Pico.
- `/dev/tvbox-video` exists and survives unplug/replug.
- `/dev/ir-pico` exists and survives unplug/replug after installing the udev rule.
- `v4l2-ctl --list-formats-ext -d /dev/tvbox-video` shows `MJPG` at the selected resolution and frame rate.
- `arecord -L` contains the configured ALSA capture name.
- Arduino Serial Monitor at `115200` shows `READY TVBOX_IR_BRIDGE manual-raw v2` after uploading `ir_bridge_serial.ino`.

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
- The default remote shows compact Power, Mute, D-pad, Back, Menu, and Info controls.
- `All keys` reveals the compact physical-remote layout with TV controls, playback, side volume/channel rockers, numbers, guide/favorite, and color keys.
- Every remote button sends `POST /api/remote/command`, creates a toast, and logs an entry in `GET /api/remote/log`.
- With `IR_BRIDGE_ENABLED=true`, API responses include `sent: true`, an IR code sequence with `raw` values, and Pico `OK ...` responses.
- With the IR LED pointed at the device, `ok`, navigation, volume/channel, digit, and color-key commands affect the TV box or TV.
- With `IR_BRIDGE_ENABLED=false`, the status chip shows `IR Bridge Stub` and commands are accepted without serial writes.
