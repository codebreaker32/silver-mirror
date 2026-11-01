/**
 * MOCK smoke test over real HTTP against `wrangler dev` (YOUCAM_MODE=mock, CLAUDE_MODE=mock).
 * No units, no Anthropic calls, no network beyond localhost.
 *
 *   npm run smoke:mock -w @skinkey/worker              starts wrangler dev on a free port, runs, stops it
 *   npm run smoke:mock -w @skinkey/worker -- --url http://localhost:8787   uses a Worker you already started
 *
 * Refuses to continue unless /health reports mode "mock". Never reads .env or .dev.vars.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { z } from 'zod';
import { INSTALL_HEADER, SHARE_FIXTURES, routes, type RouteName } from '@skinkey/contracts';

const workerDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const urlArg = (() => {
  const i = args.indexOf('--url');
  return i >= 0 ? args[i + 1] : undefined;
})();
const port = Number(process.env.SMOKE_PORT ?? 8797);
const base = (urlArg ?? `http://127.0.0.1:${port}`).replace(/\/$/, '');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let child: ChildProcess | undefined;
const stop = () => {
  // npx → wrangler → workerd: signal the whole process group so nothing keeps the port.
  if (child?.pid && child.exitCode === null) {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      child.kill('SIGTERM');
    }
  }
};
process.on('exit', stop);
process.on('SIGINT', () => process.exit(130));

const results: { name: string; ok: boolean; detail: string }[] = [];
const check = (name: string, ok: boolean, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};

let token: string | undefined;
const raw = async (method: string, path: string, body?: unknown) => {
  const r = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { [INSTALL_HEADER]: token } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON */
  }
  return { status: r.status, json };
};
const call = async <N extends RouteName>(name: N, body?: unknown, params: Record<string, string> = {}, query?: Record<string, string>) => {
  const route = routes[name];
  let path = route.path.replace(/:(\w+)/g, (_, k: string) => encodeURIComponent(params[k] ?? ''));
  if (query) path += `?${new URLSearchParams(query)}`;
  const r = await raw(route.method, path, body);
  if (r.status >= 400) throw new Error(`${name} → HTTP ${r.status} ${JSON.stringify(r.json).slice(0, 300)}`);
  return route.res.parse(r.json) as z.infer<(typeof routes)[N]['res']>;
};

const startWorker = async () => {
  if (urlArg) return;
  child = spawn(
    'npx',
    ['wrangler', 'dev', '--port', String(port), '--ip', '127.0.0.1', '--var', 'YOUCAM_MODE:mock', '--var', 'CLAUDE_MODE:mock', '--show-interactive-dev-session=false'],
    { cwd: workerDir, env: { ...process.env, CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false', ANTHROPIC_API_KEY: '', YOUCAM_API_KEY: '' }, stdio: ['ignore', 'pipe', 'pipe'], detached: true },
  );
  let log = '';
  child.stdout!.on('data', (d) => (log += d));
  child.stderr!.on('data', (d) => (log += d));
  for (let i = 0; i < 90; i++) {
    if (child.exitCode !== null) throw new Error(`wrangler dev exited (${child.exitCode}):\n${log.slice(-2000)}`);
    try {
      if ((await fetch(`${base}/health`)).ok) return;
    } catch {
      /* not up yet */
    }
    await sleep(1000);
  }
  throw new Error(`wrangler dev did not become ready:\n${log.slice(-2000)}`);
};

const consent = { version: 'scan-v1', adult: true as const, acceptedAt: new Date().toISOString() };
/** Body matches the declared file size, because the slot's Content-Length header must be honoured. */
const put = async (upload: { url: string; headers: Record<string, string> }) => {
  const size = Number(upload.headers['Content-Length'] ?? 4);
  const body = new Uint8Array(size);
  body.set([0xff, 0xd8]);
  body.set([0xff, 0xd9], size - 2);
  const headers = Object.fromEntries(Object.entries(upload.headers).filter(([k]) => k.toLowerCase() !== 'content-length'));
  const r = await fetch(upload.url, { method: 'PUT', headers, body });
  return r.status;
};

const main = async () => {
  await startWorker();
  console.log(`Worker: ${base}`);

  // 1. Health: must be mock.
  const health = (await raw('GET', '/health')).json as { mode?: string; catalog?: { rows: number } };
  const isMock = health?.mode === 'mock';
  check('health reports mock mode', isMock, `mode=${health?.mode}, catalog rows=${health?.catalog?.rows}`);
  if (!isMock) throw new Error('Worker is not in mock mode; refusing to continue (would spend units).');

  // 2. Install token.
  const inst = await call('install');
  token = inst.installToken;
  check('install token issued', !!token);

  // 3. Scan: start → PUT → submit → poll → Key → delete confirmed.
  const start = await call('scanStart', { image: { contentType: 'image/jpeg', fileSize: 400_000, width: 1080, height: 1440 }, consent });
  check('scan upload slot points at local mock', start.upload.url.startsWith(`${base}/mock-youcam/`), start.upload.url.replace(/\/upload\/.*/, '/upload/…'));
  const putStatus = await put(start.upload);
  check('scan selfie PUT accepted', putStatus < 300, `HTTP ${putStatus}`);
  let scan = await call('scanSubmit', { scanId: start.scanId });
  const t0 = Date.now();
  const settled = (d: string) => d === 'deleted' || d === 'delete_failed' || d === 'orphan';
  while (scan.status !== 'failed' && !(scan.status === 'done' && settled(scan.deleteState))) {
    if (Date.now() - t0 > 90_000) break;
    await sleep(1000);
    scan = await call('scanStatus', undefined, { id: start.scanId });
  }
  check('scan finished', scan.status === 'done', `status=${scan.status}${scan.error ? ` ${scan.error.code}` : ''} in ${Math.round((Date.now() - t0) / 1000)}s`);
  const key = scan.key;
  check('Key has inverted bands (Low on the airbrushed sample face)', key?.bands.oiliness.level === 'Low', `oiliness=${key?.bands.oiliness.level}, pore=${key?.bands.pore.level}`);
  check('Key carries no raw numbers', !!key && !/raw_score|ui_score|skin_age/.test(JSON.stringify(key)));
  check('scan photo delete confirmed', scan.deleteState === 'deleted' && key?.photoDeleted === true, `deleteState=${scan.deleteState}`);
  check('scan ledger is marked mock', scan.ledger.mock === true, `${scan.ledger.entries.length} entries`);

  // 4. Share → resolve (sample text, no Claude) → product → verdict inputs.
  const sample = 'Garnier Super UV Invisible Serum Sunscreen SPF 50+ PA++++ 30ml https://www.flipkart.com/garnier-super-uv-invisible-serum-sunscreen/p/skinkey-sample';
  const res = await call('resolve', { source: 'sample', text: sample, url: sample.split(' ').pop() });
  const top = res.candidates[0];
  check('sample share resolves to the Garnier SKU', top?.catalogId === 'garnier-garnier-super-uv-invisible-serum-sunscreen', top?.catalogId ?? 'none');
  check('sample share did not call Claude', !res.ledger.entries.some((e) => e.feature.startsWith('claude')));
  if (top?.catalogId) {
    const { product } = await call('catalogProduct', undefined, { id: top.catalogId });
    check('catalogue product has INCI', product.inci.length > 0, `${product.inci.length} tokens`);
    const search = await call('catalogSearch', undefined, {}, { category: product.category, limit: '20' });
    check('better-matches category search returns rows', search.results.length > 0, `${search.results.length} rows, ${search.catalogCount} verified`);
  }

  // 5. Flipkart short link: resolved from ONE redirect header (mock fixture), page never loaded.
  const fk = await call('resolve', { source: 'share_text', url: SHARE_FIXTURES.flipkartShortLink });
  check('Flipkart dl.flipkart.com/s/ short link resolves to the slug title', /vaseline/i.test(fk.extractedTitle ?? ''), fk.extractedTitle ?? 'no title');

  // 6. Designed UNKNOWN → label photo OCR (mock Claude) → label check.
  const ocr = await call('labelOcr', { imageBase64: Buffer.from('label-photo').toString('base64'), mediaType: 'image/jpeg' });
  check('label OCR returns chips with uncertain flags', ocr.tokens.length > 3 && ocr.tokens.some((t) => t.uncertain), `${ocr.tokens.length} tokens`);
  check('label OCR ledger is mock Claude', ocr.ledger.mock === true && ocr.ledger.entries.some((e) => e.feature === 'claude_label_ocr'));

  // 7. Medicine gate.
  const med = await call('labelCheck', { items: [{ id: 'm1', title: 'Adapalene Gel 0.1%', claims: [], inci: ['Adapalene', 'Carbomer', 'Aqua'] }] });
  check('medicine gate flags adapalene', med.results[0]?.medicineToken === 'adapalene', med.results[0]?.medicineToken ?? 'none');

  // 8. Try-on: real tinted rows have no shade colours yet, so the Worker must refuse rather than guess.
  const tinted = await call('catalogSearch', undefined, {}, { category: 'tinted_spf', limit: '1' });
  const tintedId = tinted.results[0]?.id;
  if (tintedId) {
    const r = await raw('POST', routes.tryonStart.path, {
      productId: tintedId,
      mode: 'multi',
      image: { contentType: 'image/jpeg', fileSize: 150_000, width: 768, height: 1024 },
      consent,
    });
    check('try-on refused on a tinted row with no shade colour on file', r.status >= 400 && r.status < 500, `HTTP ${r.status}`);
  }

  // 9. Rules + ledger endpoints.
  const rules = await call('rules');
  check('rules endpoint lists rules', JSON.stringify(rules).length > 100);
  const ledger = await call('ledger');
  check('How-this-was-made ledger mode is mock', JSON.stringify(ledger).includes('mock'));
};

main()
  .catch((e: unknown) => check('smoke run', false, e instanceof Error ? e.message : String(e)))
  .finally(() => {
    const failed = results.filter((r) => !r.ok);
    console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
    stop();
    process.exit(failed.length ? 1 : 0);
  });
