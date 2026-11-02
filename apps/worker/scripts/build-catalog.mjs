// Copies the merged catalogue into src/generated/catalog.json so the Worker bundles it.
// Uses data/catalog/catalog.json when CATALOG has merged it; otherwise adapts brands/*.json rows as unverified.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '../../../data/catalog');
const out = join(here, '../src/generated/catalog.json');

const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
const CATEGORIES = new Set(['moisturiser', 'sunscreen', 'cleanser', 'serum', 'toner', 'tinted_moisturiser', 'tinted_spf', 'lip_tint', 'tinted_lip_balm', 'other']);

const adapt = (r, brandFile) => {
  if (r.id && Array.isArray(r.inci) && r.inci.every((t) => typeof t === 'object')) return r;
  const category = CATEGORIES.has(r.category) ? r.category : r.category === 'moisturizer' ? 'moisturiser' : 'other';
  return {
    id: r.id ?? slug(`${r.brand}-${r.name}`),
    brand: r.brand,
    name: r.name,
    ...(typeof r.size === 'string' && r.size.length < 40 ? { size: r.size } : {}),
    category,
    tinted: Boolean(r.tinted ?? /tint/.test(category)),
    ...(typeof r.spf === 'number' ? { spf: r.spf } : {}),
    inci: (r.inci ?? []).map((token, i) => ({ token: String(token), position: i + 1 })),
    claims: [],
    shades: r.shades ?? [],
    source_url: r.source_url ?? '',
    fetched_at: r.fetched_at ?? new Date(0).toISOString(),
    verified: false,
    status: r.inci_complete === false || !(r.inci ?? []).length ? 'unverifiable' : 'unverified',
    aliases: [r.search_keywords].filter(Boolean),
    _from: brandFile,
  };
};

let rows = [];
let source;
const merged = join(dataDir, 'catalog.json');
if (existsSync(merged)) {
  const json = JSON.parse(readFileSync(merged, 'utf8'));
  rows = Array.isArray(json) ? json : (json.products ?? []);
  source = 'catalog.json';
} else if (existsSync(join(dataDir, 'brands'))) {
  for (const f of readdirSync(join(dataDir, 'brands')).filter((f) => f.endsWith('.json')).sort()) {
    const json = JSON.parse(readFileSync(join(dataDir, 'brands', f), 'utf8'));
    rows.push(...(Array.isArray(json) ? json : (json.products ?? [])).map((r) => adapt(r, f)));
  }
  source = 'brands/*.json (adapted, all unverified)';
}
const seen = new Set();
rows = rows.filter((r) => r && r.id && !seen.has(r.id) && seen.add(r.id));
writeFileSync(out, JSON.stringify(rows) + '\n');
// Usable rows carry their tier from the merge: verified_by 'human' (ticked) or 'brand_page_check' (recorded second read).
// A verified row without a tier is a merge bug; fail rather than ship a row the app can't label honestly.
const untiered = rows.filter((r) => r.verified && r.verified_by !== 'human' && r.verified_by !== 'brand_page_check');
if (untiered.length) throw new Error(`catalog: ${untiered.length} verified rows have no verified_by tier (e.g. ${untiered[0].id}); re-run npm run catalog:merge`);
const by = (t) => rows.filter((r) => r.verified && r.verified_by === t).length;
console.log(`catalog: ${rows.length} rows from ${source ?? 'nothing (empty)'} (${by('human')} human-checked, ${by('brand_page_check')} checked against brand page) -> src/generated/catalog.json`);
