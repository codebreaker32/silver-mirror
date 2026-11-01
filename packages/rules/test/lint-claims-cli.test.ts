import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const repo = resolve(__dirname, '../../..');
const bundle = join(repo, 'node_modules/.cache/skinkey/lint-claims.mjs');
const run = (root: string) => spawnSync('node', [bundle], { cwd: repo, env: { ...process.env, SKINKEY_ROOT: root }, encoding: 'utf8' });

describe('scripts/lint-claims.ts (claim linter CLI)', () => {
  beforeAll(() => {
    execFileSync(join(repo, 'node_modules/.bin/esbuild'), ['scripts/lint-claims.ts', '--bundle', '--platform=node', '--format=esm', '--external:typescript', `--outfile=${bundle}`, '--log-level=warning'], { cwd: repo });
  }, 60_000);

  it('the real app, web, contracts copy and README are clean', () => {
    const r = run(repo);
    expect(r.stdout).toMatch(/0 violation\(s\)/);
    expect(r.status).toBe(0);
  });

  it('flags user-facing copy, ignores code strings, honours lint-claims:allow', () => {
    const root = mkdtempSync(join(tmpdir(), 'lint-claims-'));
    mkdirSync(join(root, 'apps/web/src'), { recursive: true });
    writeFileSync(
      join(root, 'apps/web/src/Bad.tsx'),
      [
        "import safe from './safe';",
        "type Kind = 'safe' | 'fix';",
        "const key = 'treatment';",
        "if (key === 'cure') {}",
        'export const A = () => <p aria-label="Totally safe pick">This cream treats acne</p>;',
        "export const B = `Your skin is ${key}`;",
        '// lint-claims:allow (retailer title)',
        "export const T = 'Lightweight & No White Cast';",
        'export const C = () => <a data-kind="whitening" title="opens a Flipkart search">x</a>;',
      ].join('\n'),
    );
    writeFileSync(join(root, 'README.md'), '# X\nGuaranteed perfect match.\n`safe` in code is fine\n```\nfix\n```\n');
    const r = run(root);
    expect(r.status).toBe(1);
    const lines = r.stdout.trim().split('\n');
    const ids = lines.slice(0, -1).map((l) => l.match(/\[([a-z-]+)\]/)?.[1]);
    expect(ids.sort()).toEqual(['diagnosis-tone', 'drug-claim', 'safety', 'unsupported']);
    expect(r.stdout).toMatch(/Bad\.tsx:5 .*\[safety\]/);
    expect(r.stdout).toMatch(/README\.md:2 .*\[unsupported\]/);
    expect(r.stdout).not.toMatch(/No White Cast|whitening/);
  });
});
