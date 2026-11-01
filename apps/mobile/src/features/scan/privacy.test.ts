import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');
const OWNED = ['scan', 'tryon', 'key'].map((d) => join(ROOT, d));

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return files(p);
    return /\.tsx?$/.test(name) && !name.endsWith('.test.ts') ? [p] : [];
  });
}

const sources = OWNED.flatMap(files).map((p) => ({ p, text: readFileSync(p, 'utf8') }));
const code = (text: string) =>
  text
    .split('\n')
    .filter((l) => !/^\s*(import|export .* from)/.test(l))
    .join('\n');

const BANNED = [
  /\bsafe\b/i,
  /\bunsafe\b/i,
  /\b(treat|cure|heal|fix|prevent)s?\b/i,
  /\bfair(ness)?\b/i,
  /\bwhitening\b/i,
  /your skin is/i,
  /\bguaranteed\b/i,
  /perfect (match|shade)/i,
  /\bprecise\b/i,
  /\baccurate\b/i,
  /skin age/i,
  /inside Flipkart/i,
  /any (store|app)\b/i,
  /no white cast/i,
  /nothing (ever )?leaves your phone/i,
];

describe('privacy and copy guardrails (APP-SCAN code)', () => {
  it('renders every expo-image Image with cachePolicy="none"', () => {
    for (const { p, text } of sources) {
      for (const m of text.matchAll(/<Image\b[^>]*>/gs)) {
        expect(m[0], p).toContain('cachePolicy="none"');
      }
    }
  });

  it('never writes photos to the gallery, AsyncStorage or the legacy file API', () => {
    for (const { p, text } of sources) {
      expect(text, p).not.toMatch(/expo-media-library|AsyncStorage|expo-file-system\/legacy|writeAsStringAsync/);
    }
  });

  it('only stores the Key, consent, flags and ledger in SecureStore', () => {
    const keyIndex = sources.find((s) => s.p.endsWith(join('key', 'index.ts')))!;
    expect(keyIndex.text).toMatch(/expo-secure-store/);
    const withSecure = sources.filter((s) => s.text.includes('SecureStore.'));
    expect(withSecure.map((s) => s.p)).toEqual([keyIndex.p]);
  });

  it('uses no banned claim words in its own strings', () => {
    for (const { p, text } of sources) {
      const body = code(text);
      for (const re of BANNED) expect(body, `${p} ${re}`).not.toMatch(re);
    }
  });

  it('never shows numeric scores or the tone hex', () => {
    for (const { p, text } of sources) {
      expect(text, p).not.toMatch(/raw_score|ui_score|skin_color|\/100/);
    }
  });
});
