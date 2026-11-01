// npm run audit (spec §6): data/frame/*/names.csv + catalogue rows → audit/results.csv + audit/summary.json.
// Runs the TypeScript rules package directly through Node's type stripping; no build step, no network.
// AUDIT_ROOT overrides the data root (tests). Flags: --include-unverified (preview only, never the headline), --copy-set=A (only if gate G1 passed).
import { registerHooks } from 'node:module';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
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
const includeUnverified = args.includes('--include-unverified');
const copySet = args.find((a) => a.startsWith('--copy-set='))?.split('=')[1] === 'A' ? 'A' : 'B';

const { runAudit } = await import(join(repo, 'packages/rules/src/audit.ts'));

const listDir = (dir) => (existsSync(dir) ? readdirSync(dir) : []);
const frameRoot = join(root, 'data/frame');
const frames = listDir(frameRoot)
  .filter((d) => statSync(join(frameRoot, d)).isDirectory())
  .sort()
  .map((d) => {
    const dir = join(frameRoot, d);
    const csvPath = join(dir, 'names.csv');
    const files = [];
    const walk = (p) => {
      for (const f of listDir(p)) {
        const full = join(p, f);
        if (statSync(full).isDirectory()) walk(full);
        else files.push(relative(dir, full));
      }
    };
    walk(dir);
    return { dir: relative(root, dir), namesCsv: existsSync(csvPath) ? readFileSync(csvPath, 'utf8') : null, files };
  });

const catalogPath = join(root, 'data/catalog/catalog.json');
let catalogRows = [];
let catalogSource;
if (existsSync(catalogPath)) {
  const data = JSON.parse(readFileSync(catalogPath, 'utf8'));
  catalogRows = Array.isArray(data) ? data : (data.products ?? data.rows ?? []);
  catalogSource = 'data/catalog/catalog.json';
} else {
  const brandDir = join(root, 'data/catalog/brands');
  const files = listDir(brandDir).filter((f) => f.endsWith('.json')).sort();
  for (const f of files) {
    try {
      const data = JSON.parse(readFileSync(join(brandDir, f), 'utf8'));
      catalogRows.push(...(Array.isArray(data) ? data : (data.products ?? [])));
    } catch (err) {
      console.warn(`audit: skipped ${f} (${err.message})`);
    }
  }
  catalogSource = `data/catalog/brands/*.json (${files.length} files; catalog.json not merged yet)`;
}

const { resultsCsv, summary } = runAudit({
  frames,
  catalogRows,
  catalogSource,
  generatedAt: process.env.AUDIT_GENERATED_AT ?? new Date().toISOString(),
  includeUnverified,
  copySet,
});

const outDir = join(root, 'audit');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'results.csv'), resultsCsv);
writeFileSync(join(outDir, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');

const f = summary.frame;
console.log(`audit: rules v${summary.ruleset_hash} · copy set ${summary.copy_set} · mode ${summary.mode}${summary.headline ? ' (headline)' : ' (not the headline)'}`);
console.log(`audit: catalogue ${summary.catalog.rows} rows (${summary.catalog.verified} verified, ${summary.catalog.unverified} unverified, ${summary.catalog.unverifiable} unverifiable) from ${summary.catalog.source}`);
console.log(`audit: frame ${f.status}: N=${f.N}, matched=${f.matched}, a=${f.a}, no_row=${f.no_row}${f.pilot ? ' (pilot)' : ''}`);
console.log(`audit: checked ${summary.population.checked}, medicine ${summary.population.medicine}, label check c=${summary.label_check.c} d=${summary.label_check.d}`);
for (const h of summary.heatmap) console.log(`audit:   ${h.label.padEnd(22)} CAUTION ${h.CAUTION}  FITS ${h.FITS}  (R ${h.by_top_grade.R} / L ${h.by_top_grade.L} / T ${h.by_top_grade.T})`);
for (const n of summary.notes) console.log(`audit: note: ${n}`);
console.log('audit: wrote audit/results.csv and audit/summary.json');
