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
cut share_1 sm_home 0 4.6
cut share_2 sm_home 18.3 8.1
cut verdict_1 sm_detail 8.4 3.6
cut verdict_2 sm_detail 20 11.8
cut verdict_3 sm_detail 52.8 2.4
cut tryon_1 sm_tryon2 0.5 4.1
cut tryon_2 sm_tryon2 5.5 4.1
cut tryon_3 sm_tryon2 27.5 5.1
cut tour_1 sm_reading 8 3.5
cut tour_2 sm_routine 12 4.1
cut tour_3 sm_shop 23 7.4
for f in public/clips/*.mp4; do echo "$f $(npx remotion ffprobe -v error -show_entries format=duration -of csv=p=0 $f)"; done
