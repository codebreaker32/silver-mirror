#!/usr/bin/env bash
# Reproducible Android debug build (iteration 7). No network calls to YouCam/Anthropic.
# Needs: Java 17 and the Android SDK at $ANDROID_HOME (default ~/android-sdk; see BUILD_NOTES.md).
set -euo pipefail
export ANDROID_HOME="${ANDROID_HOME:-$HOME/android-sdk}"
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-17-openjdk-amd64}"
ARCHS="${ARCHS:-arm64-v8a}"
cd "$(dirname "$0")/../apps/mobile"
CI=1 npx expo prebuild --platform android --no-install
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
cd android
./gradlew assembleDebug --no-daemon -PreactNativeArchitectures="$ARCHS"
ls -la app/build/outputs/apk/debug/app-debug.apk
