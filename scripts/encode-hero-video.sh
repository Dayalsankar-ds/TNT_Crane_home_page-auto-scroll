#!/usr/bin/env bash
# Encode a video for scroll-scrubbing, plus extract its poster frame.
#
# Why this is required: seeking to an arbitrary currentTime decodes forward from
# the nearest preceding keyframe. A normally-encoded clip has a keyframe every
# 2-10 seconds, so scrubbing re-decodes hundreds of frames per seek and stutters
# badly. Encoding all-intra (-g 1) makes every frame a keyframe, so any seek is
# a single decode. This is the technique behind Apple's scroll-driven videos.
#
# Cost is modest at hero resolutions — the source clips here grew ~15%.
#
# Usage: ./scripts/encode-hero-video.sh <input> <output-basename>
#   ./scripts/encode-hero-video.sh "video/hero banner 01.mp4" hero-banner-01

set -euo pipefail

if [ $# -ne 2 ]; then
  echo "usage: $0 <input> <output-basename>" >&2
  exit 1
fi

IN="$1"
BASE="$2"
OUT_DIR="public/video"
mkdir -p "$OUT_DIR"

ffmpeg -y -v error -i "$IN" \
  -an \
  -c:v libx264 -crf 23 -preset slow \
  -g 1 -keyint_min 1 -sc_threshold 0 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  "$OUT_DIR/$BASE.mp4"

ffmpeg -y -v error -i "$IN" -vf "select=eq(n\,0)" -vframes 1 -q:v 3 \
  "$OUT_DIR/$BASE-poster.jpg"

TOTAL=$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames \
  -of csv=p=0 "$OUT_DIR/$BASE.mp4")
KEY=$(ffprobe -v error -select_streams v:0 -show_entries frame=key_frame \
  -of csv=p=0 "$OUT_DIR/$BASE.mp4" | grep -c '^1$')

echo "$BASE.mp4: $KEY keyframes / $TOTAL frames"
if [ "$KEY" -lt $((TOTAL - 2)) ]; then
  echo "WARNING: not all-intra — scrubbing will stutter." >&2
fi
