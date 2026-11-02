#!/usr/bin/env bash
# probe-frames.sh <clip> <t1> <t2> ... : full-res frames to out/probe/<clip>_<t>.png
set -euo pipefail
cd "$(dirname "$0")/.."
c=$1; shift; mkdir -p out/probe
for t in "$@"; do npx remotion ffmpeg -y -loglevel error -ss "$t" -i "../design/device-shots/live/rec/$c.mp4" -frames:v 1 "out/probe/${c}_$t.png"; done
