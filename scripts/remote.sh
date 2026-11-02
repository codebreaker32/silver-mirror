#!/usr/bin/env bash
# Run heavy commands on the build VM instead of this (memory-limited) WSL machine.
#
#   scripts/remote.sh [--pull <repo-relative-path>]... -- <command...>
#
# 1. rsyncs the working tree to the VM (/srv/sm) — no .git, no secrets, no build outputs
# 2. runs <command> there from the repo root (login shell: Node 24, Java 17, Android SDK on PATH)
# 3. rsyncs each --pull path back (e.g. design/web-shots, dist-apk, audit)
# Runs are serialised with a local lock so parallel callers don't trample each other.
set -euo pipefail
HOST="${SM_HOST:-<build-vm>}"
REMOTE=/srv/sm
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PULLS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --pull) PULLS+=("$2"); shift 2 ;;
    --) shift; break ;;
    *) break ;;
  esac
done
[[ $# -gt 0 ]] || { echo "usage: scripts/remote.sh [--pull path]... -- <command>" >&2; exit 2; }
CMD="$*"
SSH="ssh -o BatchMode=yes -o ConnectTimeout=20 -o ServerAliveInterval=30"

exec 9>"$ROOT/.git/remote.lock"
flock 9

rsync -az --delete -e "$SSH" \
  --exclude '.git/' --exclude 'node_modules/' --exclude '.env' --exclude '.env.*' --exclude '.dev.vars' \
  --exclude 'apps/mobile/android/' --exclude 'apps/mobile/ios/' --exclude 'apps/mobile/dist-web/' \
  --exclude 'apps/web/dist/' --exclude '.wrangler/' --exclude 'dist-apk/' --exclude '.expo/' \
  --exclude 'design/web-shots/' --exclude 'node_modules/.cache/' \
  "$ROOT/" "$HOST:$REMOTE/"

set +e
$SSH "$HOST" "cd $REMOTE && bash -lc $(printf '%q' "$CMD")"
status=$?
set -e

for p in "${PULLS[@]}"; do
  mkdir -p "$ROOT/$(dirname "$p")"
  rsync -az -e "$SSH" "$HOST:$REMOTE/$p" "$ROOT/$(dirname "$p")/" || echo "remote.sh: could not pull $p" >&2
done
exit $status
