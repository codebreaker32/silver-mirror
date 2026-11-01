// Greps built artefacts for secrets. Never prints a secret value: only the pattern or env var NAME and the file.
// Targets: apps/web/dist, the Android release/debug JS bundle (unzipped from the APK), the Worker dry-run bundle if present.
// Also checks that no VALUE from .env / .dev.vars (keys, tokens, secrets) appears in any target.
// Run: npm run secrets:grep   (exit 1 on any hit)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';

const root = process.env.SKINKEY_ROOT ?? process.cwd();
const PATTERNS = [
  ['anthropic-key', /sk-ant-[A-Za-z0-9_-]{8,}/],
  ['aws-access-key', /\bAKIA[0-9A-Z]{16}\b/],
  ['aws-presigned', /X-Amz-(Signature|Credential)=/],
  ['private-key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['env-name:ANTHROPIC_API_KEY', /ANTHROPIC_API_KEY/],
  ['env-name:YOUCAM_API_KEY', /YOUCAM_(API_KEY|SECRET)/],
  ['env-name:CLOUDFLARE_API_TOKEN', /CLOUDFLARE_API_TOKEN/],
];
const SECRETISH = /KEY|TOKEN|SECRET|PASSWORD|PRIVATE/i;

function envValues() {
  const out = [];
  for (const f of ['.env', '.dev.vars', 'apps/worker/.dev.vars']) {
    const p = join(root, f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*["']?([^"'\s#]+)/);
      if (m && SECRETISH.test(m[1]) && m[2].length >= 12) out.push([m[1], m[2]]);
    }
  }
  return out;
}

const walk = (d) => (existsSync(d) ? readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; }) : []);
const TEXT = /\.(js|mjs|cjs|css|html|json|map|txt|bundle|xml|svg)$/;

export function targets() {
  const files = [];
  for (const d of ['apps/web/dist', 'apps/worker/dist', 'apps/worker/.wrangler/dryrun']) files.push(...walk(join(root, d)).filter((f) => TEXT.test(f)));
  const tmps = [];
  for (const apk of ['release/app-release.apk', 'debug/app-debug.apk']) {
    const p = join(root, 'apps/mobile/android/app/build/outputs/apk', apk);
    if (!existsSync(p)) continue;
    const t = mkdtempSync(join(tmpdir(), 'apk-'));
    tmps.push(t);
    try { execFileSync('unzip', ['-q', '-o', p, 'assets/*', 'res/raw/*', '-d', t], { stdio: 'ignore' }); } catch { /* unzip exits 11 when a glob matches nothing */ }
    files.push(...walk(t).map((f) => Object.assign(new String(f), { label: `${apk}!${relative(t, f)}` })));
  }
  return { files, cleanup: () => tmps.forEach((t) => rmSync(t, { recursive: true, force: true })) };
}

const { files, cleanup } = targets();
const secrets = envValues();
let hits = 0;
for (const f of files) {
  const label = f.label ?? relative(root, String(f));
  const body = readFileSync(String(f)).toString('latin1');
  for (const [name, re] of PATTERNS) if (re.test(body)) { hits++; console.log(`HIT ${name} in ${label}`); }
  for (const [name, value] of secrets) if (body.includes(value)) { hits++; console.log(`HIT value of ${name} in ${label}`); }
}
cleanup();
console.log(`secret-grep: ${files.length} files scanned, ${secrets.length} env secret values checked, ${hits} hit(s)`);
if (files.length === 0) console.log('secret-grep: nothing built yet (run the web build / Android build first)');
process.exit(hits ? 1 : 0);
