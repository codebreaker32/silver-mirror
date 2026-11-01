import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { lintCopy } from '@skinkey/rules';
import { describe, expect, it } from 'vitest';

const srcDir = join(import.meta.dirname, '..');
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.tsx$/.test(f) ? [p] : [];
  });

/** Visible text only: JSX text nodes and string literals, with code identifiers and imports dropped. */
const visibleText = (source: string) =>
  [...source.matchAll(/>([^<>{}]+)</g), ...source.matchAll(/'([^'\n]{12,})'|"([^"\n]{12,})"|`([^`\n]{12,})`/g)]
    .map((m) => m.slice(1).find(Boolean) ?? '')
    .filter((t) => !/^(\.|@|\/|https?:)/.test(t.trim()))
    .join('\n');

describe('web copy follows the cosmetic-language rules', () => {
  for (const file of files(srcDir)) {
    it(file.slice(srcDir.length + 1), () => {
      expect(lintCopy(visibleText(readFileSync(file, 'utf8')))).toEqual([]);
    });
  }
});
