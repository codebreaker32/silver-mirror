#!/usr/bin/env node
// Screenshots of the website (apps/web), light and dark, desktop and phone, for design review.
//
// RUN ON THE BUILD VM, never on the dev machine:
//   scripts/remote.sh --pull design/web-shots/site -- 'node apps/web/scripts/shots.mjs'
//
// 1. vite build with VITE_WORKER_URL pointing at a fake origin (skip with --no-build)
// 2. serves apps/web/dist on 127.0.0.1 with an SPA fallback
// 3. Playwright Chromium renders each page at 1440x900 and 390x844, prefers-color-scheme light and dark
// 4. the Worker is mocked in the browser from data/catalog/catalog.json (no Worker, YouCam or Claude call);
//    every other request except Google Fonts is aborted and listed in report.json
// 5. writes design/web-shots/site/<shot>-<viewport>-<theme>.png and report.json
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const WEB = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = resolve(WEB, '../..');
const DIST = join(WEB, 'dist');
const OUT = join(ROOT, 'design/web-shots/site');
const WORKER = 'http://worker.mock';
const args = new Set(process.argv.slice(2));
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',');

if (!args.has('--no-build')) {
  console.log('shots: vite build');
  const r = spawnSync('npx', ['vite', 'build', '--logLevel', 'warn'], {
    cwd: WEB,
    stdio: 'inherit',
    env: { ...process.env, VITE_WORKER_URL: WORKER },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

// ---------- mock Worker, from the real catalogue ----------
const catalog = JSON.parse(readFileSync(join(ROOT, 'data/catalog/catalog.json'), 'utf8'));
const verified = catalog.filter((p) => p.verified && p.status === 'verified' && p.inci?.length);
const pick =
  verified.find((p) => /foxtale/i.test(p.brand) && /moistur/i.test(p.name)) ?? verified.find((p) => p.category === 'moisturiser') ?? verified[0];
const now = new Date().toISOString();
const summary = (p) => ({ ...p, shadeCount: p.shades?.length ?? 0 });
const ledger = (feature, ms) => ({
  mock: true,
  entries: [{ feature, units: 0, latencyMs: ms, startedAt: now, status: 'ok', model: 'claude-opus-5-5' }],
  files: [],
  totalUnits: 0,
  totalLatencyMs: ms,
});
function mockWorker(url, method) {
  const u = new URL(url);
  if (method === 'POST' && u.pathname === '/v1/resolve')
    return {
      outcome: 'match',
      resolver: 'catalog',
      store: 'flipkart',
      extractedTitle: `${pick.brand} ${pick.name}`,
      isSkincare: true,
      candidates: [{ catalogId: pick.id, confidence: 0.93, why: 'Brand and product name match the catalogue row', product: summary(pick) }],
      catalogCount: verified.length,
      ledger: ledger('claude_resolve', 814),
    };
  if (u.pathname === '/v1/catalog/search') {
    const cat = u.searchParams.get('category');
    return { catalogCount: verified.length, results: catalog.filter((p) => p.category === cat).slice(0, Number(u.searchParams.get('limit') ?? 12)).map(summary) };
  }
  const m = /^\/v1\/catalog\/([^/]+)$/.exec(u.pathname);
  if (m) {
    const product = catalog.find((p) => p.id === decodeURIComponent(m[1]));
    return product ? { product } : null;
  }
  return null;
}

// ---------- static server ----------
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.md': 'text/markdown', '.csv': 'text/csv' };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent((req.url ?? '/').split('?')[0]));
  let file = join(DIST, path);
  if (!file.startsWith(DIST + sep) || !existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html');
  res.setHeader('content-type', TYPES[extname(file)] ?? 'application/octet-stream');
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;
console.log(`shots: serving ${DIST} at ${BASE}`);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const report = { base: BASE, product: pick.id, shots: [], blocked: [], errors: [] };

const VIEWPORTS = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };
const browser = await chromium.launch();

const revealAll = (page) =>
  page.evaluate(() => {
    document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in'));
  });
const settle = (page, ms = 900) => page.waitForTimeout(ms);

async function shoot(page, name, vp, theme, opts = {}) {
  if (only && !only.some((o) => name.startsWith(o))) return;
  const file = `${name}-${vp}-${theme}.png`;
  await page.screenshot({ path: join(OUT, file), fullPage: !!opts.full });
  report.shots.push(file);
}

/** Viewport-sized screenshots down the page, so each one can be read at full size. */
async function pages(page, name, vp, theme, max = 14) {
  if (only && !only.some((o) => name.startsWith(o))) return;
  const h = VIEWPORTS[vp].height;
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const n = Math.min(max, Math.ceil(total / h));
  for (let i = 0; i < n; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * h);
    await settle(page, 450);
    await revealAll(page);
    await settle(page, 350);
    await shoot(page, `${name}-${String(i + 1).padStart(2, '0')}`, vp, theme);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

for (const theme of ['light', 'dark']) {
  for (const [vp, viewport] of Object.entries(VIEWPORTS)) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: vp === 'phone' ? 2 : 1, colorScheme: theme, reducedMotion: 'no-preference' });
    await context.route('**/*', (route) => {
      const url = route.request().url();
      if (url.startsWith(BASE) || /fonts\.(googleapis|gstatic)\.com/.test(url)) return route.continue();
      if (url.startsWith(WORKER)) {
        const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS' };
        if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
        const body = mockWorker(url, route.request().method());
        return body
          ? route.fulfill({ status: 200, headers, contentType: 'application/json', body: JSON.stringify(body) })
          : route.fulfill({ status: 404, headers, body: '{}' });
      }
      report.blocked.push(url);
      return route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', (e) => report.errors.push(`${vp}/${theme}: ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && report.errors.push(`${vp}/${theme} console: ${m.text()}`));

    // Landing: the fold, each stage of the split, then the page in screens.
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await settle(page, 1200);
    await shoot(page, 'landing-fold', vp, theme);
    if (vp === 'desktop')
      for (const s of ['share', 'confirm']) {
        await page.evaluate((id) => {
          const el = document.querySelector(`.stage-step[data-stage="${id}"]`);
          el?.scrollIntoView({ block: 'center' });
        }, s);
        await settle(page, 1400);
        await shoot(page, `landing-stage-${s}`, vp, theme);
      }
    await pages(page, 'landing', vp, theme);

    // /check: the sample share, the confirm step, the verdict, the shared result.
    await page.goto(`${BASE}/check?sample=1`, { waitUntil: 'networkidle' });
    await settle(page);
    await shoot(page, 'check-confirm', vp, theme, { full: true });
    const yes = page.getByRole('button', { name: 'Yes', exact: true });
    if (await yes.count()) {
      await yes.click();
      await page.waitForLoadState('networkidle');
      await settle(page, 1200);
      await shoot(page, 'check-result', vp, theme, { full: true });
      const share = page.getByRole('link', { name: 'Open a shareable result page' });
      if (await share.count()) {
        await share.click();
        await page.waitForLoadState('networkidle');
        await settle(page);
        await shoot(page, 'shared-result', vp, theme, { full: true });
      }
    } else report.errors.push(`${vp}/${theme}: no Yes button on /check?sample=1`);

    for (const [name, path] of [
      ['audit', '/audit'],
      ['rules', '/rules'],
      ['how', '/how'],
    ]) {
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
      await settle(page, 700);
      await pages(page, name, vp, theme, 4);
    }
    await context.close();
  }
}

await browser.close();
server.close();
report.blocked = [...new Set(report.blocked)];
writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2));
console.log(`shots: ${report.shots.length} screenshots in ${OUT}; ${report.errors.length} page errors; ${report.blocked.length} blocked URLs`);
if (report.errors.length) console.log(report.errors.slice(0, 10).join('\n'));
