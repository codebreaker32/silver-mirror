#!/usr/bin/env bash
# VM only: cut footage, sync durations, render the film, check it, and grab review stills.
set -euo pipefail
cd "$(dirname "$0")/.."
npm install --no-audit --no-fund --loglevel=error
bash scripts/cut-clips.sh
node scripts/sync-durations.mjs
npx tsc --noEmit -p . || true
npx remotion render src/Root.tsx MainVideo out/silver-mirror-demo.mp4 --concurrency=16 --crf=20 --log=error
npx remotion ffprobe -v error -show_entries format=duration,size:stream=codec_type,codec_name,width,height -of compact out/silver-mirror-demo.mp4
rm -rf out/review && mkdir -p out/review
for t in ${STILLS:-3 12 24 33 42 50 58 66 75 85 95 103}; do
  npx remotion ffmpeg -y -loglevel error -ss "$t" -i out/silver-mirror-demo.mp4 -frames:v 1 -vf scale=960:-2 "out/review/t$t.png"
done
