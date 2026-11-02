#!/usr/bin/env bash
# Contact sheets of the phone recordings: one frame every 2s, 10 per row, 20 per sheet.
set -euo pipefail
cd "$(dirname "$0")/.."
FF=$(command -v ffmpeg || echo "npx remotion ffmpeg")
FP=$(command -v ffprobe || echo "npx remotion ffprobe")
SRC=../design/device-shots/live/rec
mkdir -p out/sheets
for f in sm_scan_take2 sm_scan_take3 sm_home sm_shop sm_detail sm_reading sm_routine sm_tryon sm_tryon2; do
  $FP -v error -show_entries format=duration -of csv=p=0 "$SRC/$f.mp4" | sed "s/^/$f /"
  $FF -y -loglevel error -i "$SRC/$f.mp4" -vf "scale=180:-2" -r 0.5 "out/sheets/${f}_%03d.png"
done
ls out/sheets
