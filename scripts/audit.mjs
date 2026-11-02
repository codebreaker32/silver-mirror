// npm run audit (method brand-claims-1, audit/METHOD.md): data/catalog/brands/*.json → audit/results.csv,
// audit/summary.json and audit/review.md. Runs the TypeScript rules package through Node's type stripping; no build
// step, no network. AUDIT_ROOT overrides the data root (tests).
//   node scripts/audit.mjs            run the audit
//   node scripts/audit.mjs --hash     print the ruleset hash and the SHA-256 of the frozen files (for the freeze)
import { registerHooks } from 'node:module';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

registerHooks({
  resolve(specifier, context, next) {
    if ((specifier.startsWith('.') || specifier.startsWith('/')) && context.parentURL?.endsWith('.ts') && !/\.[cm]?[jt]s$/.test(specifier)) {
      for (const ext of ['.ts', '/index.ts']) {
        const url = new URL(specifier + ext, context.parentURL);
        if (existsSync(fileURLToPath(url))) return next(url.href, context);
      }
    }
    return next(specifier, context);
  },
});

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const root = process.env.AUDIT_ROOT ?? repo;
const args = process.argv.slice(2);

const { runAudit, reviewMarkdown, AUDIT_METHOD } = await import(join(repo, 'packages/rules/src/audit.ts'));
const { rulesetHash, RULES, RULESET_VERSION } = await import(join(repo, 'packages/rules/src/index.ts'));

const readJson = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : fallback);
const sha256 = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

/** The files the rules-frozen record covers (audit/METHOD.md step 2), repo-relative. */
function frozenFiles() {
  const src = 'packages/rules/src';
  const files = readdirSync(join(repo, src))
    .filter((f) => f.endsWith('.ts'))
    .sort()
    .map((f) => `${src}/${f}`);
  return Object.fromEntries([...files, 'scripts/audit.mjs'].map((f) => [f, sha256(join(repo, f))]));
}

if (args.includes('--hash')) {
  console.log(JSON.stringify({ method: AUDIT_METHOD, ruleset_hash: rulesetHash(RULES), ruleset_version: RULESET_VERSION, files: frozenFiles() }, null, 2));
  process.exit(0);
}

const brandDir = join(root, 'data/catalog/brands');
const brandFiles = (existsSync(brandDir) ? readdirSync(brandDir) : [])
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((file) => {
    const data = JSON.parse(readFileSync(join(brandDir, file), 'utf8'));
    return { file, rows: Array.isArray(data) ? data : (data.products ?? []) };
  });

const ticks = readJson(join(root, 'data/catalog/verified.json'), []);
const verifiedIds = (Array.isArray(ticks) ? ticks : (ticks.ids ?? [])).filter((x) => typeof x === 'string');
const frozen = readJson(join(root, 'audit/rules-frozen.json'), null);

const { resultsCsv, summary } = runAudit({
  brandFiles,
  verifiedIds,
  frozen,
  currentFiles: frozenFiles(),
  generatedAt: process.env.AUDIT_GENERATED_AT ?? new Date().toISOString(),
});

const outDir = join(root, 'audit');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'results.csv'), resultsCsv);
writeFileSync(join(outDir, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
writeFileSync(join(outDir, 'review.md'), reviewMarkdown(summary));

const p = summary.population;
console.log(`audit: method ${summary.method} · rules v${summary.ruleset_version} ${summary.ruleset_hash} · frozen ${summary.frozen.status}${summary.headline ? ' (headline)' : ' (not the headline)'}${summary.pilot ? ' · pilot' : ''}`);
console.log(`audit: ${summary.input.rows} rows in ${summary.input.files} brand files; excluded ${JSON.stringify(summary.excluded)}`);
console.log(`audit: brand-page rows ${p.brand_rows} · N=${p.N} with claims · a=${p.a} complete INCI · unverifiable ${p.unverifiable} · medicine ${p.medicine} · checked ${p.checked}`);
console.log(`audit: Label Check c=${summary.label_check.c} d=${summary.label_check.d} ${JSON.stringify(summary.label_check.by_rule)}`);
console.log(`audit: claim vs reading profile e=${summary.claim_profile.e} of b=${summary.claim_profile.b}`);
for (const h of summary.heatmap) console.log(`audit:   ${h.label.padEnd(22)} CAUTION ${h.CAUTION}  FITS ${h.FITS}  (R ${h.by_top_grade.R} / L ${h.by_top_grade.L} / T ${h.by_top_grade.T})`);
for (const m of summary.claim_matrix) console.log(`audit:   claim ${m.label.padEnd(22)} N ${m.N} checked ${m.checked} claim-matched CAUTION ${m.claim_matched_caution ?? 'n/a'}`);
console.log(`audit: review list ${summary.review.items} rows on ${summary.review.products} products (${summary.review.ticked} ticked)`);
for (const n of summary.notes) console.log(`audit: note: ${n}`);
console.log('audit: wrote audit/results.csv, audit/summary.json and audit/review.md');
