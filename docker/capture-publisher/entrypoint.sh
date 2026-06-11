#!/bin/sh
set -eu

: "${TVBOX_VIDEO_DEVICE:=/dev/tvbox-video}"
: "${TVBOX_AUDIO_DEVICE:=plughw:CARD=<capture-card-id>,DEV=0}"
: "${TVBOX_VIDEO_SIZE:=1920x1080}"
: "${TVBOX_FRAMERATE:=30}"
: "${TVBOX_INPUT_FORMAT:=mjpeg}"
: "${TVBOX_VIDEO_BITRATE:=4500k}"
: "${TVBOX_AUDIO_ENABLED:=true}"
: "${MEDIAMTX_RTSP_URL:=rtsp://mediamtx:8554/tvbox}"

run_ffmpeg() {
  input_format="$1"
  echo "Starting capture: video=${TVBOX_VIDEO_DEVICE} format=${input_format} size=${TVBOX_VIDEO_SIZE} fps=${TVBOX_FRAMERATE} audio=${TVBOX_AUDIO_DEVICE}"

  if [ "$TVBOX_AUDIO_ENABLED" = "true" ]; then
    ffmpeg -hide_banner -loglevel info \
      -thread_queue_size 512 -f v4l2 -input_format "$input_format" -video_size "$TVBOX_VIDEO_SIZE" -framerate "$TVBOX_FRAMERATE" -i "$TVBOX_VIDEO_DEVICE" \
      -thread_queue_size 512 -f alsa -i "$TVBOX_AUDIO_DEVICE" \
      -map 0:v:0 -map 1:a:0 \
      -c:v libx264 -preset veryfast -tune zerolatency -profile:v baseline -pix_fmt yuv420p \
      -b:v "$TVBOX_VIDEO_BITRATE" -maxrate "$TVBOX_VIDEO_BITRATE" -bufsize "$TVBOX_VIDEO_BITRATE" -g "$((TVBOX_FRAMERATE * 2))" \
      -c:a libopus -ar 48000 -ac 2 -b:a 128k \
      -f rtsp -rtsp_transport tcp "$MEDIAMTX_RTSP_URL"
    return $?
  fi

  ffmpeg -hide_banner -loglevel info \
    -thread_queue_size 512 -f v4l2 -input_format "$input_format" -video_size "$TVBOX_VIDEO_SIZE" -framerate "$TVBOX_FRAMERATE" -i "$TVBOX_VIDEO_DEVICE" \
    -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 \
    -map 0:v:0 -map 1:a:0 \
    -c:v libx264 -preset veryfast -tune zerolatency -profile:v baseline -pix_fmt yuv420p \
    -b:v "$TVBOX_VIDEO_BITRATE" -maxrate "$TVBOX_VIDEO_BITRATE" -bufsize "$TVBOX_VIDEO_BITRATE" -g "$((TVBOX_FRAMERATE * 2))" \
    -c:a libopus -ar 48000 -ac 2 -b:a 96k \
    -f rtsp -rtsp_transport tcp "$MEDIAMTX_RTSP_URL"
}

if [ ! -e "$TVBOX_VIDEO_DEVICE" ]; then
  echo "Video device is missing: $TVBOX_VIDEO_DEVICE" >&2
  sleep 5
fi

while true; do
  if run_ffmpeg "$TVBOX_INPUT_FORMAT"; then
    exit 0
  fi

  if [ "$TVBOX_INPUT_FORMAT" = "mjpeg" ]; then
    echo "MJPEG capture failed, retrying with yuyv422" >&2
    if run_ffmpeg "yuyv422"; then
      exit 0
    fi
  fi

  echo "Capture pipeline stopped, retrying in 3 seconds" >&2
  sleep 3
done
