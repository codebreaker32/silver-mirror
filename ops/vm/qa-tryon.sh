#!/usr/bin/env bash
# Try-on + Flipkart emulator QA for one theme (BUILD VM only; run through remote.sh). Assumes emu.sh start +
# worker-start (MOCK Worker, no units) and the local-worker APK installed. Run qa-full.sh <theme> fresh first (or any
# state with a reading on file); this script turns on the Demo reading itself if Home still offers it.
#
#   scripts/remote.sh --pull design/emulator-shots -- 'ops/vm/qa-tryon.sh light'
#   ops/vm/qa-tryon.sh light|dark [tryon|flipkart|all]     (default all)
#
# tryon:    share a Nykaa-style text for a tinted catalogue row (Foxtale = two shades, Re'equil = one shade),
#           confirm the SKU, find the try-on entry on the verdict, tick consent, take the photo with the emulator
#           camera, use it, and wait for the mock renders. Shots: <theme>_tryon_<row>_<step>.png
#           TRYON_ROWS="foxtale reequil pilgrim" to add the unverified Pilgrim row.
# flipkart: cold share of the Flipkart short link through a logging proxy (adb reverse -> :8788 -> Worker :8787), so
#           the log shows whether the PHONE followed the redirect (resolve body carries a flipkart.com/.../p/ URL) or
#           the Worker had to (body still has dl.flipkart.com/s/...). Times the share until the screen settles.
set -uo pipefail
export ANDROID_HOME="${ANDROID_HOME:-$HOME/android-sdk}"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
cd "$(dirname "$0")/../.."
M="${1:?light|dark}"; WHAT="${2:-all}"
E=ops/vm/emu.sh; U=ops/vm/ui.sh
W="${SHOT_WAIT:-9}"
RUN=/tmp/sm-emu; mkdir -p "$RUN"
FAIL=(); NOTE=()
fail() { echo "[qa-tryon] FAIL: $*" >&2; FAIL+=("$*"); }
note() { echo "[qa-tryon] note: $*" >&2; NOTE+=("$*"); }
shot() { $E shot "${M}_$1" 2>/dev/null; }
home() { $E kill >/dev/null 2>&1; sleep 1; $E launch >/dev/null 2>&1; $U wait "Check, tab 1 of 3" 25 || fail "$1: home did not load"; sleep 2; }
# A force-stop while the camera permission dialog is up leaves a task whose root is the permission controller; a
# "cold" share then starts MainActivity on top of that task and lands on Home instead of the check (see report).
# Clear it so every cold share here starts from no task.
cold() { adb shell am force-stop com.google.android.permissioncontroller >/dev/null 2>&1; $E kill >/dev/null 2>&1; sleep 1; }
now() { date +%s.%N; }
since() { awk -v a="$1" -v b="$(now)" 'BEGIN { printf "%.1f", b - a }'; }

$E theme "$M"
adb reverse tcp:8787 tcp:8787 >/dev/null

# Scroll down until a node matches (or give up after n swipes).
scroll_to() {
  local rx="$1" n="${2:-5}" i
  for ((i = 0; i <= n; i++)); do
    $U has "$rx" && return 0
    $U scroll; sleep 1
  done
  return 1
}

ensure_reading() {
  home reading
  if $U has "^Use the Demo reading$"; then
    $U tap "^Use the Demo reading$"; sleep 3
    note "no reading on file: turned on the Demo reading"
  fi
}

# tryon_row <tag> <nykaa share text> <SKU line regex> <entry label regex> <expected render count>
tryon_row() {
  local tag="tryon_$1" text="$2" sku="$3" entry="$4" renders="$5" t0
  cold
  $E share-text "$text" >/dev/null 2>&1; sleep "$W"
  shot "${tag}_1_arrived"
  if $U has "Nothing to check yet"; then fail "$tag: share ignored"; return; fi
  if $U has "^Which product is this\\?$"; then
    $U tap "$sku" || { fail "$tag: SKU '$sku' not offered in 'Which product is this?'"; return; }
    sleep "$W"
  elif $U has "^Is this the product\\?$"; then
    $U has "Yes, this is ${sku#^}" || fail "$tag: single SKU sheet is not '$sku'"
    $U tap "^Yes, this is" || { fail "$tag: could not tap Yes"; return; }
    sleep "$W"
  else
    fail "$tag: no SKU confirm sheet"
  fi
  $U wait "^(FITS|CAUTION|UNKNOWN|MEDICINE)$" 20 || { fail "$tag: no verdict label"; shot "${tag}_2_verdict"; return; }
  shot "${tag}_2_verdict"
  if ! scroll_to "$entry" 6; then
    fail "$tag: no try-on entry matching /$entry/ on the verdict"; shot "${tag}_2_verdict_no_entry"; return
  fi
  # The verdict keeps a sticky bar (Better matches pill + Back to listing) over the bottom ~450px; a node found there
  # is in the tree but a tap lands on the bar. Lift it into the open part of the screen first.
  local ey
  ey=$($U where "$entry" | awk '{print $2}')
  if [[ -n "$ey" ]] && ((ey > 1750)); then $U nudge; sleep 1; fi
  shot "${tag}_3_entry"
  $U tap "$entry" || { fail "$tag: could not tap the try-on entry"; return; }
  $U wait "^This needs a second photo$" 10 || fail "$tag: try-on consent did not open"
  sleep 1; shot "${tag}_4_consent"
  $U scroll; sleep 1; shot "${tag}_4_consent_2"
  $U tap "^I'm 18 or older" || fail "$tag: no 18+ checkbox"
  sleep 1; shot "${tag}_4_consent_ticked"
  $U tap "^Take photo$" || { fail "$tag: could not tap Take photo on consent"; return; }
  sleep 3
  # First use: the system camera permission prompt (pm clear in qa-full fresh drops the install-time grant).
  if $U has "^While using the app$"; then
    shot "${tag}_5_camera_permission"
    $U tap "^While using the app$"; sleep 2
  fi
  # Camera: the AVD has only an emulated BACK camera (hw.camera.front = none); the guide opens on the front one.
  sleep 3; shot "${tag}_5_capture"
  $U tap "^Take photo$" >/dev/null 2>&1; sleep 4
  if ! $U has "^Use photo$"; then
    note "$tag: front camera gave no photo in 5 s; switching to the back camera"
    $U tap "Switch to back camera" || fail "$tag: no camera switch button"
    sleep 5; shot "${tag}_5_capture_back"
    $U tap "^Take photo$" >/dev/null 2>&1; sleep 4
  fi
  if ! $U has "^Use photo$"; then fail "$tag: camera never produced a photo (no 'Use photo')"; shot "${tag}_5_capture_failed"; return; fi
  shot "${tag}_6_review"
  $U tap "^Use photo$"; t0=$(now); sleep 1
  shot "${tag}_7_running"
  if $U wait "^Close$" 60; then
    note "$tag: mock render done in $(since "$t0") s"
    sleep 2; shot "${tag}_8_result"
    local n
    $U list >"$RUN/${M}_${tag}_result.txt" 2>/dev/null
    n=$(grep -c "Shade: " "$RUN/${M}_${tag}_result.txt" || true)
    [[ "$n" == "$renders" ]] || fail "$tag: expected $renders render(s) with a shade chip, saw $n (dump: $RUN/${M}_${tag}_result.txt)"
    grep "Shade: " "$RUN/${M}_${tag}_result.txt" >&2 || true
    $U scroll; sleep 1; shot "${tag}_8_result_2"
    $U scroll; sleep 1; shot "${tag}_8_result_3"
    $U tap "^Close$" || fail "$tag: no Close"
    sleep 2; shot "${tag}_9_after_close"
    $U has "^(FITS|CAUTION|UNKNOWN|MEDICINE)$" || $U has "$entry" || note "$tag: Close did not land back on the verdict"
  else
    fail "$tag: no result within 60 s of 'Use photo'"; shot "${tag}_8_stuck"
    $U list >"$RUN/${M}_${tag}_stuck.txt" 2>/dev/null
  fi
}

FOXTALE=$'Check out Foxtale SPF 50 Tinted Fluid Sunscreen with Niacinamide on Nykaa\nhttps://www.nykaa.com/foxtale-spf-50-tinted-fluid-sunscreen-with-niacinamide/p/1234567'
REEQUIL=$'Check out Re\'equil Sheer Zinc Tinted Sunscreen on Nykaa\nhttps://www.nykaa.com/re-equil-sheer-zinc-tinted-sunscreen/p/1234568'
PILGRIM=$'Check out Pilgrim Korean White Lotus Tinted Sunscreen SPF 50+ PA++++ on Nykaa\nhttps://www.nykaa.com/pilgrim-korean-white-lotus-tinted-sunscreen-spf-50-pa/p/1234569'

if [[ "$WHAT" == all || "$WHAT" == tryon ]]; then
  ensure_reading
  for r in ${TRYON_ROWS:-foxtale reequil}; do
    case $r in
      foxtale) tryon_row foxtale "$FOXTALE" "^Foxtale · SPF 50 Tinted Fluid" "^Try two shades on me" 2 ;;
      reequil) tryon_row reequil "$REEQUIL" "^Re'equil · Sheer Zinc Tinted" "^Try this shade on me" 1 ;;
      pilgrim) tryon_row pilgrim "$PILGRIM" "^Pilgrim · Korean White Lotus" "^Try this shade on me" 1 ;;
    esac
  done
fi

if [[ "$WHAT" == all || "$WHAT" == flipkart ]]; then
  PLOG="$RUN/${M}_flipkart_proxy.log"; : >"$PLOG"
  # Logging pass-through proxy (VM loopback only): records what the PHONE sends to /v1/resolve.
  setsid nohup python3 - 8788 8787 "$PLOG" >"$RUN/proxy.out" 2>&1 </dev/null <<'PY' &
import http.client, sys, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
port, up, logp = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
class H(BaseHTTPRequestHandler):
    def _go(self):
        n = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(n) if n else None
        with open(logp, "a") as f:
            f.write(f"{time.time():.2f} {self.command} {self.path} {body[:600].decode('utf-8', 'replace') if body and self.path.startswith('/v1/resolve') else ''}\n")
        c = http.client.HTTPConnection("127.0.0.1", up, timeout=60)
        hdrs = {k: v for k, v in self.headers.items() if k.lower() not in ("host", "connection")}
        c.request(self.command, self.path, body=body, headers=hdrs)
        r = c.getresponse(); data = r.read()
        self.send_response(r.status)
        for k, v in r.getheaders():
            if k.lower() not in ("transfer-encoding", "connection", "content-length"): self.send_header(k, v)
        self.send_header("Content-Length", str(len(data))); self.end_headers(); self.wfile.write(data)
    do_GET = do_POST = do_PUT = do_DELETE = do_PATCH = _go
    def log_message(self, *a): pass
ThreadingHTTPServer(("127.0.0.1", port), H).serve_forever()
PY
  PPID_=$!
  sleep 2
  adb reverse tcp:8787 tcp:8788 >/dev/null
  FK='https://dl.flipkart.com/s/qPYPSuNNNN'
  cold
  t0=$(now); echo "$t0 SHARE" >>"$PLOG"
  $E share-text "$FK" >/dev/null 2>&1
  settled=""
  for i in $(seq 1 25); do
    sleep 1
    if $U has "^(Is this the product\\?|Which product is this\\?|FITS|CAUTION|UNKNOWN|MEDICINE|Something went wrong)$"; then settled=$(since "$t0"); break; fi
  done
  shot flipkart_probe_1_settled
  if [[ -z "$settled" ]]; then fail "flipkart: screen did not settle within ~25 s of the share"; else
    note "flipkart: settled ${settled} s after the share (includes app cold start + ui dumps)"
    awk -v s="$settled" 'BEGIN { exit !(s > 10) }' && fail "flipkart: took ${settled} s (> 10 s) to settle"
  fi
  $U list >"$RUN/${M}_flipkart_settled.txt" 2>/dev/null
  sleep 3; shot flipkart_probe_2
  adb reverse tcp:8787 tcp:8787 >/dev/null
  kill "$PPID_" 2>/dev/null; pkill -f "python3 - 8788 8787" 2>/dev/null || true
  echo "[qa-tryon] proxy log:" >&2; cat "$PLOG" >&2
  rl=$(grep ' /v1/resolve' "$PLOG" | head -1)
  if [[ -z "$rl" ]]; then fail "flipkart: no /v1/resolve request reached the Worker"
  elif grep -q 'dl\.flipkart\.com/s/' <<<"$rl"; then note "flipkart: phone follow gave nothing; the Worker got the short link (title, if any, came from the Worker path; mock = fixture)"
  elif grep -q 'flipkart\.com/[^"]*/p/' <<<"$rl"; then note "flipkart: PHONE followed the redirect; the Worker got the listing URL"
  else note "flipkart: resolve body did not show a recognisable url: $rl"; fi
  t_req=$(awk '/ \/v1\/resolve/ { print $1; exit }' "$PLOG")
  [[ -n "$t_req" ]] && note "flipkart: resolve reached the Worker $(awk -v a="$t0" -v b="$t_req" 'BEGIN { printf "%.1f", b - a }') s after the share"
  grep -E "^\[c\]|    " "$RUN/${M}_flipkart_settled.txt" | head -12 >&2
fi

echo "[qa-tryon] $M done; failures: ${#FAIL[@]}"
for f in "${FAIL[@]}"; do echo "[qa-tryon]   - $f"; done
for n in "${NOTE[@]}"; do echo "[qa-tryon]   note: $n"; done
exit 0
