// Build-time overrides on top of app.json. The production default stays the live Worker in app.json.
//
//   WORKER_URL=http://localhost:8787  -> extra.workerUrl points at a local (mock) Worker, e.g. for emulator QA
//                                        with `adb reverse tcp:8787 tcp:8787`. An http:// URL also turns on
//                                        android:usesCleartextTraffic, which release builds otherwise block.
//
// Unset WORKER_URL -> app.json unchanged (https live Worker, no cleartext).
const { withAndroidManifest } = require('expo/config-plugins');

const withCleartext = (config, enabled) =>
  withAndroidManifest(config, (c) => {
    const app = c.modResults.manifest.application?.[0];
    if (app) {
      // Set or remove explicitly so a non-clean prebuild never keeps a stale value from an earlier QA build.
      if (enabled) app.$['android:usesCleartextTraffic'] = 'true';
      else delete app.$['android:usesCleartextTraffic'];
    }
    return c;
  });

module.exports = ({ config }) => {
  const override = (process.env.WORKER_URL || '').trim().replace(/\/+$/, '');
  const workerUrl = override || config.extra?.workerUrl;
  const next = { ...config, extra: { ...config.extra, workerUrl } };
  return withCleartext(next, workerUrl.startsWith('http://'));
};
