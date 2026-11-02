#!/usr/bin/env bash
# Build VM bootstrap (no Claude, no secrets). Node 24, Java 17, rsync, Chromium deps, Android SDK + emulator.
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -qq
sudo apt-get install -y -qq git curl unzip rsync python3 openjdk-17-jdk-headless qemu-kvm cpu-checker libpulse0 libgl1 libnss3 libxcomposite1 libxcursor1 libxi6 libxtst6 libasound2t64 >/dev/null
sudo usermod -aG kvm "$USER" || true
sudo chmod 666 /dev/kvm || true
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash - >/dev/null 2>&1
sudo apt-get install -y -qq nodejs >/dev/null
sudo mkdir -p /srv/sm && sudo chown "$USER" /srv/sm
# Android SDK
export ANDROID_HOME=$HOME/android-sdk
mkdir -p $ANDROID_HOME/cmdline-tools
cd /tmp && curl -fsSLo clt.zip https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip
unzip -q -o clt.zip -d $ANDROID_HOME/cmdline-tools && rm -rf $ANDROID_HOME/cmdline-tools/latest && mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest
SDKM=$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager
yes | $SDKM --licenses >/dev/null 2>&1 || true
$SDKM "platform-tools" "platforms;android-36" "build-tools;36.0.0" "emulator" "system-images;android-35;google_apis_playstore;x86_64" >/dev/null
echo no | $ANDROID_HOME/cmdline-tools/latest/bin/avdmanager create avd -n sm35 -k "system-images;android-35;google_apis_playstore;x86_64" -d pixel_7 --force >/dev/null
cat >> ~/.bashrc <<'RC'
export ANDROID_HOME=$HOME/android-sdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH
RC
kvm-ok || true
node -v; java -version 2>&1 | head -1; ls $ANDROID_HOME
