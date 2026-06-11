# Hardware Setup

This app reads the HDMI capture stick through Linux media devices. The USB ID
`534d:2109` identifies the MacroSilicon bridge, but streaming uses V4L2 video
and ALSA audio.

## 1. Inspect the capture card

Run these on the Ubuntu server:

```bash
lsusb -d 534d:2109
v4l2-ctl --list-devices
v4l2-ctl --list-formats-ext -d /dev/video0
arecord -L
getent group video
getent group audio
```

Use the output to fill `.env` from `.env.example`.

## 2. Persistent video path

First check whether udev already created a stable symlink:

```bash
ls -lah /dev/v4l/by-id/
```

If a MacroSilicon capture symlink exists and points to the capture-capable node,
use that path as `TVBOX_VIDEO_DEVICE`.

If not, create `/etc/udev/rules.d/99-tvbox-capture.rules`:

```udev
SUBSYSTEM=="video4linux", ATTRS{idVendor}=="534d", ATTRS{idProduct}=="2109", ATTR{index}=="0", SYMLINK+="tvbox-video", GROUP="video", MODE="0660"
```

Reload and trigger:

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
ls -lah /dev/tvbox-video
```

If your card exposes multiple capture nodes, confirm the correct one with:

```bash
v4l2-ctl --device=/dev/tvbox-video --all
```

## 3. Audio path

Pick the stable ALSA card name from:

```bash
arecord -L
```

Set it in `.env`, for example:

```dotenv
TVBOX_AUDIO_DEVICE=plughw:CARD=MS2109,DEV=0
```

If audio discovery is still uncertain, set `TVBOX_AUDIO_ENABLED=false` to publish
silent Opus audio while validating the video stream.

## 4. Start services

```bash
cp .env.example .env
docker compose up --build
```

For another device on your LAN, set these before starting Compose:

```dotenv
STREAM_WHEP_URL=http://<ubuntu-server-ip>:8889/tvbox/whep
WEBRTC_ADDITIONAL_HOSTS=<ubuntu-server-ip>
```

Open the dashboard on the LAN:

```text
http://<ubuntu-server-ip>:8080
```

MediaMTX also exposes a direct WebRTC test page:

```text
http://<ubuntu-server-ip>:8889/tvbox
```
