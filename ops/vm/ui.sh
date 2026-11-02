#!/usr/bin/env bash
# UI-automator helpers for emulator QA on the BUILD VM (never on the WSL machine). Run through remote.sh.
#
#   ui.sh list                 print visible nodes: [clickable] text | content-desc | bounds
#   ui.sh tap <regex>          tap the first node whose text or content-desc matches <regex> (case-insensitive)
#   ui.sh has <regex>          exit 0 if a node matches
#   ui.sh wait <regex> [s]     wait up to s seconds (default 20) for a matching node
#   ui.sh scroll [up|down]     swipe the screen
#   ui.sh back                 press Back
set -euo pipefail
export ANDROID_HOME="${ANDROID_HOME:-$HOME/android-sdk}"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

dump() {
  adb shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1 || true
  adb exec-out cat /sdcard/ui.xml
}

py() {
  python3 -c '
import re, sys, xml.etree.ElementTree as ET
mode, pat = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else "")
data = sys.stdin.read()
try:
    root = ET.fromstring(data[data.find("<"):])
except Exception as e:
    print("parse error", e, file=sys.stderr); sys.exit(3)
rx = re.compile(pat, re.I) if pat else None
for n in root.iter("node"):
    t, d, b = n.get("text", ""), n.get("content-desc", ""), n.get("bounds", "")
    if mode == "list":
        if t or d:
            print(("[c] " if n.get("clickable") == "true" else "    ") + t.replace("\n", " ") + " | " + d.replace("\n", " ") + " | " + b)
        continue
    if rx and (rx.search(t) or rx.search(d)):
        m = re.findall(r"\d+", b)
        x1, y1, x2, y2 = map(int, m)
        print((x1 + x2) // 2, (y1 + y2) // 2, t or d)
        sys.exit(0)
sys.exit(0 if mode == "list" else 1)
' "$@"
}

cmd="${1:-}"; shift || true
case "$cmd" in
  list) dump | py list ;;
  has) dump | py find "$1" >/dev/null ;;
  tap)
    hit="$(dump | py find "$1")" || { echo "[ui] no node matches: $1" >&2; exit 1; }
    read -r x y rest <<<"$hit"
    adb shell input tap "$x" "$y"
    echo "[ui] tap ($x,$y) $rest" >&2 ;;
  wait)
    t=0; lim="${2:-20}"
    until dump | py find "$1" >/dev/null; do
      sleep 1; t=$((t + 1)); ((t < lim)) || { echo "[ui] timeout waiting for: $1" >&2; exit 1; }
    done ;;
  scroll)
    if [[ "${1:-down}" == up ]]; then adb shell input swipe 540 700 540 1900 400; else adb shell input swipe 540 1900 540 700 400; fi ;;
  back) adb shell input keyevent KEYCODE_BACK ;;
  *) sed -n '2,10p' "$0" >&2; exit 2 ;;
esac
