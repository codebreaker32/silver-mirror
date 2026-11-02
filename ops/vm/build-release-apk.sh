#!/usr/bin/env bash
# Standalone release APK (embedded JS bundle, debug-signed) on the BUILD VM. Never run it on the WSL machine.
#
#   scripts/remote.sh --pull dist-apk -- 'ops/vm/build-release-apk.sh'
#       -> dist-apk/silver-mirror-release.apk  (production: live Worker from app.json)
#   scripts/remote.sh --pull dist-apk -- 'WORKER_URL=http://localhost:8787 ops/vm/build-release-apk.sh silver-mirror-release-localworker.apk'
#       -> emulator/phone QA against a local mock Worker (needs adb reverse tcp:8787 tcp:8787; enables cleartext)
#
# ARCHS defaults to x86_64,arm64-v8a so one APK runs on the x86_64 emulator and on real phones.
set -euo pipefail
export ANDROID_HOME="${ANDROID_HOME:-$HOME/android-sdk}"
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-17-openjdk-amd64}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${1:-silver-mirror-release.apk}"
ARCHS="${ARCHS:-x86_64,arm64-v8a}"
# WORKER_URL (if set) must be visible to BOTH prebuild (manifest) and gradle (embedded app config).
export WORKER_URL="${WORKER_URL:-}"
echo "[build] $OUT  archs=$ARCHS  worker=${WORKER_URL:-<app.json default>}" >&2
cd "$ROOT/apps/mobile"
CI=1 npx expo prebuild --platform android --no-install
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
cd android
./gradlew assembleRelease --no-daemon -PreactNativeArchitectures="$ARCHS"
mkdir -p "$ROOT/dist-apk"
cp app/build/outputs/apk/release/app-release.apk "$ROOT/dist-apk/$OUT"
ls -la "$ROOT/dist-apk/$OUT"
