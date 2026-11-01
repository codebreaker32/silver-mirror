#!/usr/bin/env node
/**
 * Copies the real YouCam spike JSON (spikes/g5_*.json) into the Worker mock fixtures with every signed S3 URL
 * replaced by a mock asset placeholder. Re-run after a new spike: `node scripts/redact-spike-fixtures.mjs`.
 * G1 (skin-analysis-hd.json) was redacted the same way; the worker test checks it still matches spikes/g1_result.json.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'apps/worker/src/mock/fixtures');

/** <uuid>_hd_redness_output.jpg → hd_redness_output.jpg; a bare <uuid>.jpg render → render.jpg. */
const assetName = (file) => (/^[0-9a-f-]{36}\.(jpe?g|png)$/i.test(file) ? 'render.jpg' : file.replace(/^[0-9a-f-]{36}_/i, ''));

/** Any amazonaws URL (signed or not) → {{assets}}/<file name>. Public sample-image URLs are kept. */
export const redact = (value) => {
  if (typeof value === 'string')
    return value.replace(/https?:\/\/[^\s"]*amazonaws\.com\/[^\s"?]*?([^/\s"?]+\.(?:jpg|jpeg|png))(\?[^\s"]*)?/gi, (_m, file) => `{{assets}}/${assetName(file)}`);
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, redact(v)]));
  return value;
};

for (const [src, dest] of [
  ['g5_foundation_deep.json', 'spike-g5-foundation.json'],
  ['g5_lip_sheer.json', 'spike-g5-lip.json'],
]) {
  const raw = JSON.parse(readFileSync(join(root, 'spikes', src), 'utf8'));
  const fixture = { _source: `spikes/${src} (real makeup-vto run on Perfect Corp's docs sample face, 2026-11-01). Signed S3 URLs redacted.`, ...redact(raw) };
  const text = JSON.stringify(fixture, null, 1) + '\n';
  if (/X-Amz-|amazonaws\.com/i.test(text)) throw new Error(`redaction failed for ${src}`);
  writeFileSync(join(out, dest), text);
  console.log(`wrote ${dest}`);
}
