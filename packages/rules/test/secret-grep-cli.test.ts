import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repo = resolve(__dirname, '../../..');
const run = (root: string) => spawnSync('node', [join(repo, 'scripts/secret-grep.mjs')], { cwd: repo, env: { ...process.env, SKINKEY_ROOT: root }, encoding: 'utf8' });

describe('scripts/secret-grep.mjs', () => {
  it('flags key patterns and .env values in a built bundle without printing the value', () => {
    const root = mkdtempSync(join(tmpdir(), 'secret-grep-'));
    mkdirSync(join(root, 'apps/web/dist/assets'), { recursive: true });
    const fakeValue = 'zz-test-only-not-a-real-secret-0123456789';
    writeFileSync(join(root, '.env'), `MY_SERVICE_TOKEN=${fakeValue}\nPUBLIC_URL=https://example.test/long/path\n`);
    writeFileSync(join(root, 'apps/web/dist/assets/a.js'), `const k="sk-ant-${'x'.repeat(20)}";const t="${fakeValue}";`);
    writeFileSync(join(root, 'apps/web/dist/assets/b.js'), 'console.log("clean")');
    const r = run(root);
    expect(r.status).toBe(1);
    expect(r.stdout).toMatch(/HIT anthropic-key in apps\/web\/dist\/assets\/a\.js/);
    expect(r.stdout).toMatch(/HIT value of MY_SERVICE_TOKEN in apps\/web\/dist\/assets\/a\.js/);
    expect(r.stdout).not.toContain(fakeValue);
    expect(r.stdout).not.toMatch(/b\.js|PUBLIC_URL/);
  });

  it('passes on a clean build', () => {
    const root = mkdtempSync(join(tmpdir(), 'secret-grep-'));
    mkdirSync(join(root, 'apps/web/dist'), { recursive: true });
    writeFileSync(join(root, 'apps/web/dist/index.js'), 'fetch("http://localhost:8787/health")');
    const r = run(root);
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/1 files scanned, 0 env secret values checked, 0 hit/);
  });
});
