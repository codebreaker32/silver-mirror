#!/usr/bin/env bash
# Cut the phone recordings (design/device-shots/live/rec, VFR 720x1560) into constant-30fps
# H.264 segments in public/clips/<scene>_<n>.mp4. Runs on the VM only (Remotion's bundled ffmpeg).
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=../design/device-shots/live/rec
FF="npx remotion ffmpeg"
rm -f public/clips/*.mp4 public/clips/*.png
cut() { # name source start duration
  $FF -y -loglevel error -i "$SRC/$2.mp4" -ss "$3" -t "$4" -frames:v "$(awk "BEGIN{print int($4*30)}")" -an -r 30 -vsync cfr -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -movflags +faststart "public/clips/$1.mp4"
}
cut scan_1 sm_scan_take2 29.3 4.1
cut scan_2 sm_scan_take2 71 7.6
cut scan_3 sm_scan_take2 174 5.3
cut scan_4 sm_scan_take3 0 4.6
# v2 build (new app layout): Home, a product from "Chosen for you", Reading, Routine, Shop.
cut share_1 v2_home 1.5 12.6
cut verdict_1 v2_detail 0 15.1
# v2_detail is shorter than the scene: hold its last frame (footage.ts `hold`).
$FF -y -loglevel error -sseof -0.2 -i "$SRC/v2_detail.mp4" -frames:v 1 public/clips/verdict_hold.png
cut tryon_1 sm_tryon2 0.5 4.1
cut tryon_2 sm_tryon2 5.5 4.1
cut tryon_3 sm_tryon2 27.5 5.1
cut tour_1 v2_reading 7.5 4.6
cut tour_2 v2_routine 9 3.95
cut tour_3 v2_shop 7.5 6.5
for f in public/clips/*.mp4; do echo "$f $(npx remotion ffprobe -v error -show_entries format=duration -of csv=p=0 $f)"; done
