#!/usr/bin/env bash
# Build web-ready JPEG frames for the canvas scroll scrub.
#
# Why downscale at all: the 1920x1080 q80 export was 212 MB across 578 frames
# (~375 KB/frame). Every frame is preloaded before the hero becomes interactive,
# so that is not shippable. Measured alternatives at 578 frames:
#
#   1920x1080 q6   171 KB/frame    97 MB
#   1600x900  q5   152 KB/frame    85 MB
#   1280x720  q5   112 KB/frame    53 MB   <- current
#
# Source frames live OUTSIDE public/ on purpose. Anything under public/ is
# served, so keeping the 212 MB master there would ship it to browsers.
#
# If a sequence ever has real transparency, JPEG is wrong — check with:
#   ffmpeg -i frame.png -vf "alphaextract,signalstats,metadata=print" -f null -
# YMIN < 255 anywhere means genuine alpha; use WebP (-c:v libwebp) instead.
#
# After running, update FRAME_START / FRAME_COUNT in
# src/components/HeroScrollExperience.tsx to match the reported values.
#
# Usage: ./scripts/encode-hero-frames.sh <src-dir> <start-number> [ext] [width] [quality]
#   ./scripts/encode-hero-frames.sh "video/Hero section image" 1000 jpg 1280 5

set -euo pipefail

if [ $# -lt 2 ]; then
  echo "usage: $0 <src-dir> <start-number> [ext=jpg] [width=1280] [quality=5]" >&2
  exit 1
fi

SRC="$1"
START="$2"
EXT="${3:-jpg}"
WIDTH="${4:-1280}"
Q="${5:-5}"
OUT="public/video/frames"

if [ ! -d "$SRC" ]; then
  echo "error: source directory not found: $SRC" >&2
  exit 1
fi

rm -rf "$OUT"
mkdir -p "$OUT"

# -2 keeps height even and preserves aspect; lanczos holds detail on downscale.
ffmpeg -y -v error \
  -start_number "$START" -i "$SRC/%05d.$EXT" \
  -vf "scale=${WIDTH}:-2:flags=lanczos" \
  -q:v "$Q" \
  -start_number "$START" "$OUT/%05d.jpg"

COUNT=$(find "$OUT" -name '*.jpg' | wc -l | tr -d ' ')
SIZE=$(du -sh "$OUT" | cut -f1)
LAST=$((START + COUNT - 1))

echo "frames:     $COUNT  ($START … $LAST)"
echo "resolution: ${WIDTH}px wide, quality $Q"
echo "total size: $SIZE"
echo
echo "Set in src/components/HeroScrollExperience.tsx:"
echo "  const FRAME_START = $START;"
echo "  const FRAME_COUNT = $COUNT;"
