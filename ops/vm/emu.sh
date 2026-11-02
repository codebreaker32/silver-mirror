#!/usr/bin/env bash
# Android emulator driver for the BUILD VM (never run it on the WSL machine). Run it through remote.sh:
#
#   scripts/remote.sh --pull design/emulator-shots -- 'ops/vm/emu.sh start dark && ops/vm/emu.sh shot home'
#   (or: npm run emu -- <subcommand> ...)
#
# Subcommands
#   start [dark|light]      boot AVD sm35 headless (detached, survives the ssh session), wait for boot, no animations
#   theme dark|light        switch the system night mode (the app follows the phone setting)
#   install <apk>           adb install -r -g
#   launch                  open the app's launcher activity
#   kill                    force-stop the app (next share is a cold start)
#   shot <name>             screenshot -> design/emulator-shots/<name>.png
#   share-text <text>       send an ACTION_SEND text/plain intent straight to app.skinkey/.MainActivity
#   open <deeplink>         ACTION_VIEW a deep link (e.g. skinkey://check) in the app
#   worker-start            local MOCK Worker on :8787 (YOUCAM_MODE=mock, CLAUDE_MODE=mock) + adb reverse tcp:8787
#   worker-stop             stop the mock Worker
#   qa [dark|light]         the three real S1 share payloads (spikes/FINDINGS.md), cold + warm start, with shots
#   status                  emulator / boot / worker state
#   stop                    stop the mock Worker and the emulator
#
# Env: AVD (default sm35), EMU_MEMORY (MB, default 4096), SHOT_WAIT (s after an intent, default 10).
set -euo pipefail

export ANDROID_HOME="${ANDROID_HOME:-$HOME/android-sdk}"
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-17-openjdk-amd64}"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
AVD="${AVD:-sm35}"
PKG=app.skinkey
ACTIVITY="$PKG/.MainActivity"
SHOTS="$ROOT/design/emulator-shots"
RUN=/tmp/sm-emu
mkdir -p "$RUN"
SHOT_WAIT="${SHOT_WAIT:-10}"

log() { printf '[emu] %s\n' "$*" >&2; }
die() { log "error: $*"; exit 1; }
# Quote one argument for the device shell (adb shell joins argv into a single sh -c string).
q() { printf "'%s'" "$(printf '%s' "$1" | sed "s/'/'\\\\''/g")"; }

booted() { [[ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" == 1 ]]; }

theme() {
  case "${1:-}" in
    dark) adb shell cmd uimode night yes >/dev/null ;;
    light) adb shell cmd uimode night no >/dev/null ;;
    *) die "theme dark|light" ;;
  esac
  log "theme: $1"
}

start() {
  local mode="${1:-light}"
  if adb devices | grep -q '^emulator-'; then
    log "emulator already running"
  else
    [[ -w /dev/kvm ]] || die "/dev/kvm not writable"
    log "booting $AVD (headless)"
    # setsid + nohup + all fds redirected: the emulator outlives this ssh session.
    setsid nohup emulator -avd "$AVD" -no-window -no-audio -no-snapshot-save -gpu swiftshader_indirect \
      -no-boot-anim -memory "${EMU_MEMORY:-4096}" >"$RUN/emulator.log" 2>&1 </dev/null &
    echo $! >"$RUN/emulator.pid"
  fi
  adb wait-for-device
  local t=0
  until booted; do
    sleep 3; t=$((t + 3))
    ((t < 420)) || { tail -20 "$RUN/emulator.log" >&2; die "boot timed out"; }
  done
  log "boot completed (${t}s)"
  for k in window_animation_scale transition_animation_scale animator_duration_scale; do
    adb shell settings put global "$k" 0
  done
  adb shell settings put system screen_off_timeout 2147483647
  adb shell svc power stayon true
  adb shell input keyevent KEYCODE_WAKEUP
  adb shell wm dismiss-keyguard >/dev/null 2>&1 || true
  theme "$mode"
}

install() {
  [[ -f "${1:-}" ]] || die "install <apk>"
  adb install -r -g "$1" >&2
  log "installed $1"
}

launch() { adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1; log "launched"; }
kill_app() { adb shell am force-stop "$PKG"; log "force-stopped $PKG"; }

shot() {
  [[ -n "${1:-}" ]] || die "shot <name>"
  mkdir -p "$SHOTS"
  adb exec-out screencap -p >"$SHOTS/$1.png"
  [[ -s "$SHOTS/$1.png" ]] || die "empty screenshot"
  log "shot design/emulator-shots/$1.png"
}

share_text() {
  [[ -n "${1:-}" ]] || die "share-text <text>"
  adb shell "am start -a android.intent.action.SEND -t text/plain -n $ACTIVITY --es android.intent.extra.TEXT $(q "$1")" >&2
}

open_link() {
  [[ -n "${1:-}" ]] || die "open <deeplink>"
  adb shell "am start -a android.intent.action.VIEW -d $(q "$1") $PKG" >&2
}

worker_up() { curl -fsS -m 3 http://127.0.0.1:8787/health >/dev/null 2>&1; }

worker_start() {
  if worker_up; then
    log "worker already up on :8787"
  else
    log "starting local MOCK worker on :8787 (no YouCam, no Claude calls)"
    # A simple command (not a list or subshell) in the background, so no bash parent keeps the ssh channel's
    # stdout open and remote.sh can return.
    cd "$ROOT"
    WRANGLER_SEND_METRICS=false CI=1 setsid nohup npm run dev -w @skinkey/worker -- \
      --port 8787 --ip 127.0.0.1 --var YOUCAM_MODE:mock --var CLAUDE_MODE:mock --var MOCK_YOUCAM:1 \
      >"$RUN/worker.log" 2>&1 </dev/null &
    local t=0
    until worker_up; do
      sleep 2; t=$((t + 2))
      ((t < 120)) || { tail -30 "$RUN/worker.log" >&2; die "worker did not come up"; }
    done
  fi
  curl -fsS http://127.0.0.1:8787/health >&2; echo >&2
  if adb devices | grep -q '^emulator-'; then adb reverse tcp:8787 tcp:8787 >/dev/null && log "adb reverse tcp:8787"; fi
}

worker_stop() {
  pkill -f 'wrangler.*dev.*8787' 2>/dev/null || true
  pkill -f workerd 2>/dev/null || true
  log "worker stopped"
}

stop() {
  worker_stop
  adb emu kill >/dev/null 2>&1 || true
  sleep 3
  pkill -f "qemu-system.*$AVD" 2>/dev/null || true
  rm -f "$RUN/emulator.pid"
  log "emulator stopped"
}

status() {
  adb devices
  booted && echo "boot_completed=1" || echo "boot_completed=0"
  echo "night: $(adb shell cmd uimode night 2>/dev/null | tr -d '\r' || true)"
  worker_up && echo "worker: up" || echo "worker: down"
}

# The three real S1 payloads (spikes/FINDINGS.md; same strings as SHARE_FIXTURES in packages/contracts/src/share.ts).
FLIPKART='https://dl.flipkart.com/s/qPYPSuNNNN'
AMAZON=$'Check this out at Amazon\nMinimalist SPF 30 Body Sunscreen, UVA & UVB Protection | Nourishing Lotion | Broad Spectrum PA+++ Sunscreen for All Skin Types | For Men & Women | 150 g https://amzn.in/d/05kxo4QC'
NYKAA=$'Check out Minimalist SPF 50 PA++++ Sunscreen With Niacinamide - Lightweight & No White Cast For All Skin Types on Nykaa\nhttps://www.nykaa.com/minimalist-spf-50-sunscreen/p/1234567?skuId=1234567&se=0'

qa() {
  local mode="${1:-light}" p
  theme "$mode"
  adb reverse tcp:8787 tcp:8787 >/dev/null
  worker_up || log "warning: mock worker is not up (run worker-start)"
  kill_app; launch; sleep "$SHOT_WAIT"; shot "${mode}_00_home"
  for p in flipkart amazon nykaa; do
    local text
    case $p in flipkart) text=$FLIPKART ;; amazon) text=$AMAZON ;; nykaa) text=$NYKAA ;; esac
    # cold start: process killed, the share intent launches the app
    kill_app; sleep 1
    share_text "$text"; sleep "$SHOT_WAIT"; shot "${mode}_${p}_cold"
    # warm start: app already running on Home, the share arrives through onNewIntent (BUGS.md #1)
    kill_app; launch; sleep "$SHOT_WAIT"
    share_text "$text"; sleep "$SHOT_WAIT"; shot "${mode}_${p}_warm"
  done
  # warm start on top of a previous check (second share while /check is showing)
  share_text "$AMAZON"; sleep "$SHOT_WAIT"; shot "${mode}_amazon_after_nykaa"
}

cmd="${1:-}"; shift || true
case "$cmd" in
  start) start "$@" ;;
  theme) theme "$@" ;;
  install) install "$@" ;;
  launch) launch ;;
  kill) kill_app ;;
  shot) shot "$@" ;;
  share-text) share_text "$@" ;;
  open) open_link "$@" ;;
  worker-start) worker_start ;;
  worker-stop) worker_stop ;;
  qa) qa "$@" ;;
  status) status ;;
  stop) stop ;;
  *) sed -n '2,25p' "$0" >&2; exit 2 ;;
esac
