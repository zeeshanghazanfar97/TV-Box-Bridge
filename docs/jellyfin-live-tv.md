# Jellyfin Live TV

Jellyfin's M3U tuner field accepts a URL. TV Box Bridge serves that playlist for
you, so you do not need to upload an `.m3u` file.

## URL To Paste Into Jellyfin

Use this as the M3U tuner `File or URL` value:

```text
http://<tv-box-bridge-ip>:8080/live-tv/tvbox.m3u
```

Example:

```text
http://10.2.1.101:8080/live-tv/tvbox.m3u
```

That endpoint returns a playlist pointing at the HLS stream:

```text
http://<tv-box-bridge-ip>:8888/tvbox/index.m3u8
```

## Jellyfin Steps

1. Open Jellyfin Dashboard.
2. Go to `Live TV`.
3. Add a tuner device.
4. Choose `M3U Tuner`.
5. Paste `http://<tv-box-bridge-ip>:8080/live-tv/tvbox.m3u` into `File or URL`.
6. Save.

You should then see `TV Box Live` under Jellyfin Live TV.

## Network Ports

Jellyfin must be able to reach:

| Port | Purpose |
|---:|---|
| `8080/tcp` | Generated M3U playlist from TV Box Bridge |
| `8888/tcp` | MediaMTX HLS stream consumed by Jellyfin |

If the firewall is enabled on the TV Box Bridge host:

```bash
sudo ufw allow 8080/tcp
sudo ufw allow 8888/tcp
```

## Optional Overrides

Leave these blank unless Jellyfin cannot reach the automatically generated HLS
URL.

```dotenv
STREAM_HLS_URL=
LIVE_TV_CHANNEL_NAME=TV Box Live
LIVE_TV_CHANNEL_NUMBER=1
LIVE_TV_GROUP_TITLE=Live TV
```

If Jellyfin runs in Docker and needs a different address for MediaMTX, set
`STREAM_HLS_URL` to the URL Jellyfin can reach:

```dotenv
STREAM_HLS_URL=http://<tv-box-bridge-ip>:8888/tvbox/index.m3u8
```

Then restart the dashboard:

```bash
docker compose up --build -d dashboard
```

## Limits

This adds the HDMI feed as a single Jellyfin Live TV channel. Remote control and
channel changes still happen through the TV Box Bridge dashboard or keyboard
shortcuts; Jellyfin's player only consumes the live stream.
