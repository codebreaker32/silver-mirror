import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const srcDir = join(__dirname, '..', 'src');
const files = readdirSync(srcDir).filter((f) => f.endsWith('.ts'));
const sources = files.map((f) => ({ f, text: readFileSync(join(srcDir, f), 'utf8') }));

describe('no-LLM / no-network boundary (spec §4)', () => {
  it('imports only zod, @skinkey/contracts and its own files', () => {
    for (const { f, text } of sources) {
      for (const m of text.matchAll(/(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)/g)) {
        const spec = m[1] ?? m[2] ?? m[3]!;
        expect([spec.startsWith('./'), spec === 'zod', spec === '@skinkey/contracts'], `${f} imports ${spec}`).toContain(true);
      }
    }
  });

  it('never touches the network, the Anthropic SDK, timers or the clock', () => {
    for (const { f, text } of sources) {
      expect(text, f).not.toMatch(/\bfetch\s*\(|XMLHttpRequest|WebSocket|@anthropic-ai|anthropic|node:|\bprocess\.|setTimeout|Math\.random|Date\.now\(/);
    }
  });

  it('ui_score firewall: no source reads a ui_score field', () => {
    for (const { f, text } of sources) {
      expect(text, f).not.toMatch(/\.ui_score\b|\[['"]ui_score['"]\]/);
    }
  });

  it('package.json depends only on zod and contracts', async () => {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
    expect(Object.keys(pkg.dependencies).sort()).toEqual(['@skinkey/contracts', 'zod']);
  });
});
