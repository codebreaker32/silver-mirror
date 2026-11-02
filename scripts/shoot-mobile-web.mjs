#!/usr/bin/env node
// Web screenshots of the mobile app, light and dark, for design review.
//
// RUN ON THE BUILD VM, never on the dev machine:
//   scripts/remote.sh --pull design/web-shots -- 'npm run shots:web'
// One-time VM setup: npx playwright install --with-deps chromium
//
// 1. expo export --platform web (apps/mobile -> apps/mobile/dist-web)   skip with --no-export
// 2. serves dist-web on 127.0.0.1 with an SPA fallback
// 3. Playwright Chromium at 390x844 @2x renders each route with ?demo= (mock data, see apps/mobile/src/demo),
//    once with prefers-color-scheme: light and once with dark
// 4. writes design/web-shots/<shot>-<theme>.png, sheet-<theme>.png and report.json
//
// Every request that is not to the local server is aborted and listed in report.json: no Worker, YouCam or Claude calls.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MOBILE = join(ROOT, 'apps/mobile');
const DIST = join(MOBILE, 'dist-web');
const OUT = join(ROOT, 'design/web-shots');
const VIEWPORT = { width: 390, height: 844 };
const THEMES = ['light', 'dark'];
const args = new Set(process.argv.slice(2));

// ---------- 1. export ----------
if (!args.has('--no-export')) {
  console.log('shots: expo export --platform web');
  rmSync(DIST, { recursive: true, force: true });
  const r = spawnSync('npx', ['expo', 'export', '--platform', 'web', '--output-dir', 'dist-web'], {
    cwd: MOBILE,
    stdio: 'inherit',
    env: { ...process.env, CI: '1', EXPO_NO_TELEMETRY: '1' },
  });
  if (r.status !== 0) {
    console.error(`shots: expo export failed (exit ${r.status})`);
    process.exit(r.status ?? 1);
  }
}
if (!existsSync(join(DIST, 'index.html'))) {
  console.error(`shots: ${DIST}/index.html missing. Run without --no-export.`);
  process.exit(1);
}

// ---------- 2. static server ----------
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.map': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  let file = normalize(join(DIST, path));
  if (!file.startsWith(DIST + sep) && file !== DIST) {
    res.writeHead(403).end();
    return;
  }
  if (!existsSync(file) || statSync(file).isDirectory()) {
    const html = join(file, 'index.html');
    if (existsSync(html)) file = html;
    else if (!extname(path)) file = join(DIST, 'index.html'); // SPA fallback (web.output: single)
    else {
      res.writeHead(404).end();
      return;
    }
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream', 'cache-control': 'no-store' });
  res.end(readFileSync(file));
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const BASE = `http://127.0.0.1:${server.address().port}`;
console.log(`shots: serving ${DIST} at ${BASE}`);

// ---------- 3. shots ----------
const CATALOG = (() => {
  try {
    return JSON.parse(readFileSync(join(ROOT, 'apps/worker/src/generated/catalog.json'), 'utf8'));
  } catch {
    return [];
  }
})();
const verified = CATALOG.filter((p) => p.verified && p.status === 'verified');
const lineOf = (p) => (p.name.toLowerCase().startsWith(p.brand.toLowerCase()) ? p.name : `${p.brand} ${p.name}`);

/** Try-on target: a tinted product, preferring one with two coloured shades (the demo labels renders Shade A/B otherwise). */
function tintedForTryon() {
  const tinted = verified.filter((p) => p.tinted);
  const p = tinted.find((x) => (x.shades ?? []).filter((s) => s.hex).length >= 2) ?? tinted.find((x) => x.category?.startsWith('lip')) ?? tinted[0];
  return p ? { id: p.id, name: lineOf(p) } : { id: 'demo-tinted', name: 'Tinted product' };
}
const tinted = tintedForTryon();

/** Pasted-name check of a verified, untinted sunscreen: shows a verdict with reasons (the sample listing may be UNKNOWN). */
function pasteQuery() {
  const p = verified.find((x) => x.category === 'sunscreen' && !x.tinted && x.inci?.length) ?? verified.find((x) => x.inci?.length);
  return p ? lineOf(p) : 'Sunscreen SPF 50';
}
const pasted = pasteQuery();
const q = (o) => `?${new URLSearchParams({ demo: 'reading', ...o })}`;

async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.waitForTimeout(900);
}

async function waitForVerdict(page) {
  const back = page.getByRole('button', { name: /Back to product/ }).first();
  const yes = page.getByTestId('sku-yes');
  const option = page.getByTestId('sku-option-0');
  await Promise.race([back.waitFor({ timeout: 30_000 }), yes.waitFor({ timeout: 30_000 }), option.waitFor({ timeout: 30_000 })]);
  if (await yes.isVisible().catch(() => false)) await yes.click();
  else if (await option.isVisible().catch(() => false)) await option.click();
  await back.waitFor({ timeout: 30_000 });
}

/** Each shot: [name, path, optional steps after load]. Steps run on the page left by the previous step of the same group. */
const GROUPS = [
  [['home', `/${q()}`]],
  [
    ['check-sample', `/check${q({ sample: '1' })}`, waitForVerdict],
    [
      'check-matches',
      null,
      async (page) => {
        await page.getByRole('button', { name: /Find better matches/ }).first().click();
        await page.getByTestId('better-matches').waitFor({ timeout: 15_000 });
        await page
          .getByTestId('match-0')
          .waitFor({ timeout: 15_000 })
          .catch(() => {});
      },
    ],
  ],
  [['check-paste', `/check${q({ q: pasted })}`, waitForVerdict]],
  [['scan-consent', `/scan${q()}`]],
  [['scan-processing', `/scan/processing${q()}`]],
  [['scan-result', `/scan/result${q()}`]],
  [['key', `/key${q()}`]],
  [
    ['tryon-consent', `/tryon${q({ productId: tinted.id, mode: 'multi', productName: tinted.name })}`],
    [
      'tryon-result',
      null,
      async (page) => {
        await page.getByRole('checkbox').first().click();
        await page.getByRole('button', { name: /Take photo/ }).first().click();
        await page.getByText(/Not saved/).first().waitFor({ timeout: 15_000 });
      },
    ],
  ],
  [['settings', `/settings${q()}`]],
  [['how', `/how${q()}`]],
  [['home-empty', `/?demo=none`]],
  [['key-empty', `/key?demo=none`]],
];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const report = { base: BASE, viewport: VIEWPORT, scale: 2, tryonProduct: tinted, pasteQuery: pasted, shots: [], blocked: [] };
let failures = 0;

for (const theme of THEMES) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: theme,
    reducedMotion: 'reduce',
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
  });
  await context.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(BASE)) return route.continue();
    report.blocked.push(url);
    return route.abort();
  });
  for (const group of GROUPS) {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
    for (const [name, path, step] of group) {
      const file = `${name}-${theme}.png`;
      const entry = { name, theme, file, path, ok: true };
      try {
        if (path) await page.goto(BASE + path, { waitUntil: 'load' });
        await settle(page);
        if (step) {
          await step(page);
          await settle(page);
        }
      } catch (e) {
        entry.ok = false;
        entry.error = String(e?.message ?? e).split('\n')[0];
        failures += 1;
      }
      await page.screenshot({ path: join(OUT, file) });
      entry.errors = [...errors];
      errors.length = 0;
      report.shots.push(entry);
      console.log(`shots: ${entry.ok ? 'ok  ' : 'FAIL'} ${file}${entry.error ? `  (${entry.error})` : ''}`);
    }
    await page.close();
  }
  await context.close();
}

// ---------- 4. contact sheets ----------
for (const theme of THEMES) {
  const shots = report.shots.filter((s) => s.theme === theme);
  const bg = theme === 'dark' ? '#0d0d0f' : '#ececee';
  const fg = theme === 'dark' ? '#d8d8dc' : '#2a2a2e';
  const cells = shots
    .map((s) => {
      const b64 = readFileSync(join(OUT, s.file)).toString('base64');
      return `<figure><img src="data:image/png;base64,${b64}"><figcaption>${s.name}${s.ok ? '' : ' (failed)'}</figcaption></figure>`;
    })
    .join('');
  const html = `<!doctype html><html><head><style>
    body{margin:0;padding:24px;background:${bg};color:${fg};font:14px/1.4 system-ui,sans-serif}
    h1{font-size:16px;margin:0 0 16px;font-weight:600}
    main{display:grid;grid-template-columns:repeat(4,260px);gap:24px}
    figure{margin:0}img{width:260px;height:auto;display:block;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.25)}
    figcaption{margin-top:6px;font-size:13px}
  </style></head><body><h1>Silver Mirror web shots · ${theme} · 390x844 · ${new Date().toISOString().slice(0, 16)}Z</h1><main>${cells}</main></body></html>`;
  const page = await browser.newPage({ viewport: { width: 4 * 260 + 3 * 24 + 48, height: 800 }, deviceScaleFactor: 1, colorScheme: theme });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: join(OUT, `sheet-${theme}.png`), fullPage: true });
  await page.close();
  console.log(`shots: sheet-${theme}.png`);
}

await browser.close();
server.close();
report.blocked = [...new Set(report.blocked)];
writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`shots: ${report.shots.length - failures}/${report.shots.length} ok, ${report.blocked.length} outside request(s) blocked -> design/web-shots/`);
process.exit(failures ? 1 : 0);
