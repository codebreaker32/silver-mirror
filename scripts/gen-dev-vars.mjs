import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');
const outPath = join(root, 'apps/worker/.dev.vars');

const parse = (text) =>
  Object.fromEntries(
    text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
      }),
  );

const env = existsSync(envPath) ? parse(readFileSync(envPath, 'utf8')) : {};
const existing = existsSync(outPath) ? parse(readFileSync(outPath, 'utf8')) : {};
const vars = {
  YOUCAM_API_KEY: env.YOUCAM_API_KEY ?? '',
  YOUCAM_SECRET_KEY: env.YOUCAM_SECRET_KEY ?? '',
  ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY ?? '',
  INSTALL_HMAC_SECRET: existing.INSTALL_HMAC_SECRET || randomBytes(32).toString('hex'),
  MOCK_YOUCAM: existing.MOCK_YOUCAM ?? '1',
};
writeFileSync(outPath, Object.entries(vars).map(([k, v]) => `${k}=${v}`).join('\n') + '\n', { mode: 0o600 });
console.log(`wrote ${outPath} (${Object.keys(vars).join(', ')}; values not shown)`);
