/**
 * LIVE smoke test against the real YouCam API. Spends units. A human runs it explicitly; tests and CI never do.
 *
 *   npm run smoke:live -w @skinkey/worker -- --yes-spend-units [--image test-assets/selfie.jpg]
 *     one HD scan (16 units): file → PUT → task → poll → raw JSON → delete → confirm (G0/G1)
 *   add --tryon test-assets/selfie_768x1024.jpg [--kind foundation|lip_color] [--shades "#A8774F,#8E5B3E"]
 *     tone (20) + 2 × makeup VTO (2) on one file id (G2, G7), all terminal before any delete (G3)
 *
 * Reads YOUCAM_API_KEY from the repo .env and never prints it. Raw responses go to /home/aman/youcam/spikes/.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { systemClock } from '../src/lib/clock';
import { memoryPacerStore, Pacer } from '../src/lib/limiter';
import { makeupVtoBody, skinAnalysisBody, skinToneBody, type VtoKind } from '../src/youcam/bodies';
import { YouCamClient, type TaskPoll } from '../src/youcam/client';
import { overlayUrl, rawScoreReadings, zoneLabels } from '../src/youcam/parse';
import type { SkinAnalysisResults, TaskKind } from '../src/youcam/types';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const spikes = join(root, 'spikes');
const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const opt = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

if (!flag('--yes-spend-units')) {
  console.error('Refusing to run: this spends real YouCam units. Re-run with --yes-spend-units.');
  process.exit(2);
}

const readEnvKey = (name: string) => {
  const envPath = join(root, '.env');
  if (process.env[name]) return process.env[name]!;
  if (!existsSync(envPath)) return undefined;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && m[1] === name) return m[2]!.replace(/^["']|["']$/g, '');
  }
  return undefined;
};

const apiKey = readEnvKey('YOUCAM_API_KEY');
if (!apiKey) {
  console.error('YOUCAM_API_KEY not found in the environment or .env');
  process.exit(2);
}

/** Width and height from a baseline/progressive JPEG SOF marker. */
const jpegSize = (b: Uint8Array): { width: number; height: number } | null => {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null;
    const marker = b[i + 1]!;
    const len = (b[i + 2]! << 8) | b[i + 3]!;
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
      return { height: (b[i + 5]! << 8) | b[i + 6]!, width: (b[i + 7]! << 8) | b[i + 8]! };
    i += 2 + len;
  }
  return null;
};

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
mkdirSync(spikes, { recursive: true });
const save = (name: string, data: unknown) => {
  const p = join(spikes, `live-smoke-${stamp}-${name}.json`);
  writeFileSync(p, JSON.stringify(data, null, 1));
  console.log(`  saved ${p}`);
};

const yc = new YouCamClient({
  baseUrl: 'https://yce-api-01.makeupar.com',
  apiKey,
  fetch: (input, init) => fetch(input, init),
  pacer: new Pacer(memoryPacerStore(), systemClock),
  clock: systemClock,
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const upload = async (path: string, label: string) => {
  const bytes = new Uint8Array(readFileSync(path));
  const size = jpegSize(bytes);
  console.log(`${label}: ${path} (${bytes.length} bytes, ${size ? `${size.width}x${size.height}` : 'size unknown'})`);
  const { fileId, upload } = await yc.createFile({ fileName: `skinkey-${label}.jpg`, contentType: 'image/jpg', fileSize: bytes.length });
  const put = await fetch(upload.url, { method: 'PUT', headers: upload.headers, body: bytes });
  console.log(`  file ${fileId.slice(0, 12)}… PUT ${put.status}`);
  if (!put.ok) throw new Error(`upload failed ${put.status}`);
  return { fileId, size };
};

const pollUntilTerminal = async <R>(kind: TaskKind, taskId: string): Promise<{ poll: TaskPoll<R>; latencyS: number; polls: number }> => {
  const t0 = Date.now();
  for (let polls = 1; ; polls++) {
    await sleep(3000);
    const poll = await yc.getTask<R>(kind, taskId);
    const latencyS = Math.round((Date.now() - t0) / 100) / 10;
    console.log(`  poll ${kind} #${polls}: ${poll.kind} (${latencyS}s)`);
    if (poll.kind !== 'running' || latencyS > 180) return { poll, latencyS, polls };
  }
};

const deleteAndConfirm = async (kind: TaskKind, taskId: string) => {
  const log: unknown[] = [];
  try {
    await yc.deleteTask(taskId);
    log.push({ delete: 'ok' });
  } catch (e) {
    log.push({ delete: 'error', error: (e as Error).message });
    return { confirmed: false, log };
  }
  for (let i = 1; i <= 3; i++) {
    await sleep(2000);
    const poll = await yc.getTask(kind, taskId);
    log.push({ confirm: i, result: poll.kind });
    if (poll.kind === 'gone') return { confirmed: true, log };
  }
  return { confirmed: false, log };
};

const totalCredit = async () => {
  const c = await yc.credit();
  return { raw: c, total: c.results.reduce((n, r) => n + r.amount, 0) };
};

const main = async () => {
  const before = await totalCredit();
  console.log(`credit before: ${before.total}`);
  save('credit-before', before.raw);

  const image = resolve(root, opt('--image') ?? 'test-assets/selfie.jpg');
  if (!existsSync(image)) throw new Error(`missing ${image}: add a consented selfie (short side ≥ 1080 px)`);
  const scan = await upload(image, 'scan');
  if (scan.size && Math.min(scan.size.width, scan.size.height) < 1080) console.warn('  warning: short side < 1080 px; HD may reject it');
  const body = skinAnalysisBody(scan.fileId);
  const taskId = await yc.createTask('skin_analysis', body);
  console.log(`  HD task ${taskId.slice(0, 12)}…`);
  const hd = await pollUntilTerminal<SkinAnalysisResults>('skin_analysis', taskId);
  save('hd-result', { request: body, ...hd });
  if (hd.poll.kind === 'success') {
    const rows = hd.poll.results.output ?? [];
    console.log('  readings (raw_score only):', rawScoreReadings(rows));
    console.log('  zone labels:', zoneLabels(rows));
    console.log('  overlay row chosen:', overlayUrl(rows) ? 'yes' : 'none');
  }
  const del = await deleteAndConfirm('skin_analysis', taskId);
  console.log(`  delete confirmed: ${del.confirmed}`);
  save('hd-delete', del);

  const tryonImage = opt('--tryon');
  if (tryonImage) {
    const kind = (opt('--kind') ?? 'foundation') as VtoKind;
    const shades = (opt('--shades') ?? '#A8774F,#8E5B3E').split(',').map((hex, i) => ({ name: `shade-${i + 1}`, hex: hex.trim() }));
    const t = await upload(resolve(root, tryonImage), 'tryon');
    const toneId = await yc.createTask('skin_tone', skinToneBody(t.fileId));
    const tone = await pollUntilTerminal('skin_tone', toneId);
    save('tone-result', tone);
    const vtoIds: string[] = [];
    for (const s of shades.slice(0, 2)) vtoIds.push(await yc.createTask('makeup_vto', makeupVtoBody(t.fileId, kind, s)));
    const vtos = [];
    for (const id of vtoIds) vtos.push(await pollUntilTerminal('makeup_vto', id));
    save('vto-results', { kind, shades, vtos });
    const deletes = [await deleteAndConfirm('skin_tone', toneId)];
    for (const id of vtoIds) deletes.push(await deleteAndConfirm('makeup_vto', id));
    console.log(`  try-on deletes confirmed: ${deletes.filter((d) => d.confirmed).length}/${deletes.length}`);
    save('tryon-deletes', deletes);
  }

  const after = await totalCredit();
  console.log(`credit after: ${after.total} (spent ${before.total - after.total})`);
  save('credit-after', after.raw);
};

main().catch((e) => {
  console.error('live smoke failed:', e instanceof Error ? e.message : e);
  process.exit(1);
});
