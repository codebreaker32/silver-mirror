#!/usr/bin/env bash
# Full emulator walkthrough for one theme (BUILD VM only; run through remote.sh). Assumes emu.sh start + worker-start
# and the local-worker APK installed.
#   ops/vm/qa-full.sh light|dark [fresh]
# fresh: pm clear first, shoot the welcome, tap Get started, shoot the first-run Home, then turn on the Demo reading.
set -uo pipefail
export ANDROID_HOME="${ANDROID_HOME:-$HOME/android-sdk}"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
cd "$(dirname "$0")/../.."
M="${1:?light|dark}"; FRESH="${2:-}"
E=ops/vm/emu.sh; U=ops/vm/ui.sh; PKG=app.skinkey
W="${SHOT_WAIT:-9}"
FAIL=()
fail() { echo "[qa] FAIL: $*" >&2; FAIL+=("$*"); }
shot() { $E shot "${M}_$1" 2>/dev/null; }
home() { $E kill >/dev/null 2>&1; sleep 1; $E launch >/dev/null 2>&1; $U wait "Home, tab 1 of 5" 25 || fail "$1: home did not load"; sleep 2; }

$E theme "$M"
adb reverse tcp:8787 tcp:8787 >/dev/null

if [[ "$FRESH" == fresh ]]; then
  $E kill; adb shell pm clear "$PKG" >/dev/null
  $E launch >/dev/null 2>&1
  $U wait "^Get started$" 25 || fail "first run: no welcome"
  sleep 2; shot 00_welcome
  $U tap "^Get started$" || fail "first run: no 'Get started' button"
  $U wait "Home, tab 1 of 5" 25 || fail "first run: home did not load after the welcome"; sleep 2
  shot 01_home_first_run
  $U scroll; sleep 1; shot 01_home_first_run_2
  $U scroll up; sleep 1
  $U tap "^Use the Demo reading$" || fail "first run: no 'Use the Demo reading' button"
  sleep 3
fi

home home; shot 02_home
$U has "No reading yet" && fail "home: still shows 'No reading yet' after enabling the demo reading"
$U scroll; sleep 1; shot 02_home_2

# Reading tab
$U tap "Reading, tab 4 of 5" || fail "reading tab not found"; sleep 3; shot 10_reading
$U scroll; sleep 1; shot 10_reading_2
$U scroll; sleep 1; shot 10_reading_3

# Scan consent (tab-bar Scan opens the flow)
home scan
$U tap "Scan, tab 3 of 5" || fail "scan tab not found"; sleep 3; shot 11_scan_consent
$U scroll; sleep 1; shot 11_scan_consent_2
$U back; sleep 1

# Settings + How
home settings
$U tap "^Settings$" || fail "settings gear not found"; sleep 3; shot 12_settings
$U scroll; sleep 1; shot 12_settings_2
$U tap "How this was made" || { $U scroll up; sleep 1; $U tap "How this was made"; } || fail "settings: no 'How this was made' row"
sleep 3; shot 13_how
$U scroll; sleep 1; shot 13_how_2
$U scroll; sleep 1; shot 13_how_3

FLIPKART='https://dl.flipkart.com/s/qPYPSuNNNN'
AMAZON=$'Check this out at Amazon\nMinimalist SPF 30 Body Sunscreen, UVA & UVB Protection | Nourishing Lotion | Broad Spectrum PA+++ Sunscreen for All Skin Types | For Men & Women | 150 g https://amzn.in/d/05kxo4QC'
NYKAA=$'Check out Minimalist SPF 50 PA++++ Sunscreen With Niacinamide - Lightweight & No White Cast For All Skin Types on Nykaa\nhttps://www.nykaa.com/minimalist-spf-50-sunscreen/p/1234567?skuId=1234567&se=0'

# After a share: shoot what arrived, confirm the SKU if asked, shoot verdict (top + scrolled), jump to matches.
flow() {
  local tag="$1"
  shot "${tag}_1_arrived"
  if $U has "Nothing to check yet"; then fail "$tag: share ignored (Nothing to check yet)"; return; fi
  if $U has "Something went wrong"; then fail "$tag: error state"; return; fi
  if $U has "^Which product is this\\?$"; then
    $U tap "^Minimalist · SPF 50 Sunscreen · 50g" || $U tap "\\(also " || fail "$tag: could not pick a SKU"
    sleep "$W"
  elif $U has "^Is this the product\\?$"; then
    $U tap "^Yes, this is" || $U tap "^Yes$" || fail "$tag: could not tap Yes"
    sleep "$W"
  fi
  $U wait "^(FITS|CAUTION|UNKNOWN|MEDICINE)$" 20 || fail "$tag: no verdict label visible"
  shot "${tag}_2_verdict"
  $U scroll; sleep 1; shot "${tag}_2_verdict_scrolled"
  if $U tap "^Better matches$"; then sleep 3; shot "${tag}_3_matches"
    # one more step so the first match card is on screen (Amazon stopped at the filter chips before)
    $U scroll; sleep 1; shot "${tag}_3_matches_2"
  else
    $U scroll; sleep 1
    $U has "^Better matches$" && shot "${tag}_3_matches" || fail "$tag: no Better matches section"
  fi
}

for p in flipkart amazon nykaa; do
  case $p in flipkart) text=$FLIPKART ;; amazon) text=$AMAZON ;; nykaa) text=$NYKAA ;; esac
  # cold start: process killed, the share intent launches the app
  $E kill >/dev/null 2>&1; sleep 1
  $E share-text "$text" >/dev/null 2>&1; sleep "$W"
  flow "${p}_cold"
  # warm start: app on Home, the share arrives through onNewIntent
  home "$p warm"
  $E share-text "$text" >/dev/null 2>&1; sleep "$W"
  flow "${p}_warm"
done
# second share while a check is showing (Nykaa result on screen -> Amazon)
$E share-text "$AMAZON" >/dev/null 2>&1; sleep "$W"
shot amazon_after_nykaa
$U has "Shared from Amazon" || fail "second share on top of a check did not replace it"

# medicine gate: a retinoid listing shows MEDICINE (pharmacist icon + line), no reasons, ledger or better matches
$E kill >/dev/null 2>&1; sleep 1
$E share-text $'Check this out at Amazon\nDifferin Adapalene Gel 0.1% 15 g https://amzn.in/d/0medicine01' >/dev/null 2>&1; sleep "$W"
shot medicine_1_arrived
$U has "Better matches" && fail "medicine: Better matches shown on a MEDICINE result"

echo "[qa] $M done; failures: ${#FAIL[@]}"
for f in "${FAIL[@]}"; do echo "[qa]   - $f"; done
exit 0
