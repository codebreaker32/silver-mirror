import { COPY, CatalogProduct, type Claim, type ClaimType, type CopySet, type InciToken, type RowStatus, type VerdictLabel } from '@skinkey/contracts';
import { BAND_CUTOFFS } from './bands';
import { labelCheck, medicineGate, rulesetHash, verdict } from './engine';
import { toInciTokens } from './inci';
import { READING_PROFILES, profileKey } from './profiles';
import { RULES, RULESET_VERSION } from './rules';

export interface FrameInput {
  dir: string;
  namesCsv: string | null;
  files: readonly string[];
}

export interface AuditInput {
  frames: readonly FrameInput[];
  catalogRows: readonly unknown[];
  catalogSource: string;
  generatedAt: string;
  includeUnverified?: boolean;
  copySet?: CopySet;
}

export interface AuditRow {
  id: string;
  brand: string;
  name: string;
  category: string;
  inci: InciToken[];
  claims: Claim[];
  source_url: string;
  screenshot_path?: string;
  verified: boolean;
  status: RowStatus;
  aliases: string[];
  claims_source: 'catalog' | 'marketed_for_phrase_match';
}

const FREE_FROM: [ClaimType, RegExp][] = [
  ['fragrance_free', /\bfragrance[- ]free\b/i],
  ['alcohol_free', /\balcohol[- ]free\b/i],
  ['oil_free', /\boil[- ]free\b/i],
];

const SKIN_TYPE: [ClaimType, RegExp][] = [
  ['for_oily_skin', /\boily\b/i],
  ['for_dry_skin', /\bdry\b/i],
  ['for_combination_skin', /\bcombination\b/i],
  ['for_sensitive_skin', /\bsensitive\b/i],
];

const NEGATED = /\bnot (suitable )?for\b/i;

/**
 * Deterministic phrase match for brand rows that predate X5 claim spans, recorded as claims_source so it is visible.
 * Free-from claims are read from the marketed_for phrases and the product name; skin-type claims need the word "skin"
 * or a bare type word ("oily"), so "dry touch finish" is not a dry-skin claim.
 */
export function claimsFromMarketedFor(phrases: readonly string[], name = ''): Claim[] {
  const out: Claim[] = [];
  const add = (type: ClaimType, quote: string) => {
    if (!out.some((c) => c.type === type)) out.push({ type, quote });
  };
  for (const phrase of phrases) {
    if (NEGATED.test(phrase)) continue;
    for (const [type, re] of FREE_FROM) if (re.test(phrase)) add(type, phrase);
    const bare = /^[a-z]+$/i.test(phrase.trim());
    if (/\ball skin types?\b|\bevery\b.*\bskin type\b|\bany skin type\b/i.test(phrase)) add('for_all_skin_types', phrase);
    else if (/\bskin\b/i.test(phrase) || bare) for (const [type, re] of SKIN_TYPE) if (re.test(phrase)) add(type, phrase);
  }
  for (const [type, re] of FREE_FROM) if (re.test(name)) add(type, name);
  return out;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Accepts CatalogProduct rows (catalog.json) and the raw brand rows in data/catalog/brands/*.json. */
export function adaptRow(raw: unknown): AuditRow | null {
  const parsed = CatalogProduct.safeParse(raw);
  if (parsed.success) {
    const p = parsed.data;
    return {
      id: p.id,
      brand: p.brand,
      name: p.name,
      category: p.category,
      inci: p.inci,
      claims: p.claims,
      source_url: p.source_url,
      ...(p.screenshot_path ? { screenshot_path: p.screenshot_path } : {}),
      verified: p.verified,
      status: p.status,
      aliases: p.aliases ?? [],
      claims_source: 'catalog',
    };
  }
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.name !== 'string' || typeof r.brand !== 'string') return null;
  const inci = Array.isArray(r.inci) ? toInciTokens(r.inci.filter((t): t is string => typeof t === 'string')) : [];
  const complete = r.inci_complete !== false && inci.length > 0;
  const verified = r.verified === true && complete;
  return {
    id: typeof r.id === 'string' ? r.id : slug(`${r.brand} ${r.name}`),
    brand: r.brand,
    name: r.name,
    category: typeof r.category === 'string' ? r.category : 'other',
    inci,
    claims: claimsFromMarketedFor(
      Array.isArray(r.marketed_for) ? r.marketed_for.filter((x): x is string => typeof x === 'string') : [],
      r.name,
    ),
    source_url: typeof r.source_url === 'string' ? r.source_url : '',
    ...(typeof r.screenshot_path === 'string' ? { screenshot_path: r.screenshot_path } : {}),
    verified,
    status: !complete ? 'unverifiable' : verified ? 'verified' : 'unverified',
    aliases: [typeof r.search_keywords === 'string' ? r.search_keywords : ''].filter(Boolean),
    claims_source: 'marketed_for_phrase_match',
  };
}

export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]!;
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += ch;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const nonEmpty = rows.filter((r) => r.some((c) => c.trim()));
  const [header, ...body] = nonEmpty;
  if (!header) return [];
  const keys = header.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()])));
}

export function toCsv(header: readonly string[], rows: readonly Record<string, unknown>[]): string {
  const cell = (v: unknown) => {
    const s = v === undefined || v === null ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [header.join(','), ...rows.map((r) => header.map((h) => cell(r[h])).join(','))].join('\n') + '\n';
}

const nameKey = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const words = (s: string) => new Set(nameKey(s).split(' ').filter((w) => w.length > 1));

function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}

/** Pre-registered matching: catalog_id column, then exact normalised name or alias, then word overlap ≥ 0.75. */
export const FUZZY_MATCH_THRESHOLD = 0.75;

export function matchFrameRow(
  frameRow: Record<string, string>,
  rows: readonly AuditRow[],
): { row: AuditRow | null; method: 'catalog_id' | 'exact_name' | 'word_overlap' | 'none'; score?: number } {
  const id = frameRow.catalog_id;
  if (id) {
    const row = rows.find((r) => r.id === id);
    if (row) return { row, method: 'catalog_id' };
  }
  const name = frameRow.name ?? frameRow.product_name ?? '';
  const k = nameKey(name);
  if (!k) return { row: null, method: 'none' };
  const exact = rows.find((r) => nameKey(r.name) === k || r.aliases.some((a) => nameKey(a) === k));
  if (exact) return { row: exact, method: 'exact_name' };
  const target = words(name);
  let best: { row: AuditRow; score: number } | null = null;
  for (const r of rows) {
    const score = Math.max(jaccard(target, words(r.name)), ...r.aliases.map((a) => jaccard(target, words(a))));
    if (score >= FUZZY_MATCH_THRESHOLD && (!best || score > best.score || (score === best.score && r.id < best.row.id))) best = { row: r, score };
  }
  return best ? { row: best.row, method: 'word_overlap', score: Number(best.score.toFixed(3)) } : { row: null, method: 'none' };
}

export const RESULTS_HEADER = [
  'population',
  'frame_dir',
  'frame_rank',
  'product_name',
  'catalog_id',
  'row_status',
  'rule_id',
  'kind',
  'grade',
  'counted',
  'contested',
  'profile_ids',
  'matched_token',
  'position',
  'claim_type',
  'claim_quote',
  'claim_url',
  'claims_source',
  'screenshot_path',
  'ruleset_hash',
] as const;

export type FrameStatus = 'missing' | 'empty' | 'partial' | 'complete';

export interface HeatmapCell {
  profile_id: string;
  label: string;
  CAUTION: number;
  FITS: number;
  by_top_grade: { R: number; L: number; T: number };
  rule_ids: Record<string, number>;
}

export interface AuditProduct {
  frame_dir: string | null;
  frame_rank: string | null;
  name: string;
  catalog_id: string | null;
  row_status: RowStatus | 'no_row';
  match_method: string;
  checked: boolean;
  medicine_token: string | null;
  verdicts: Record<string, VerdictLabel>;
  label_hits: string[];
}

export interface AuditSummary {
  schema: 1;
  generated_at: string;
  ruleset_hash: string;
  ruleset_version: string;
  band_cutoffs: typeof BAND_CUTOFFS;
  copy_set: CopySet;
  include_unverified: boolean;
  mode: 'frame' | 'catalog_preview';
  headline: boolean;
  catalog: { source: string; rows: number; verified: number; unverified: number; unverifiable: number };
  frame: {
    status: FrameStatus;
    dirs: { dir: string; names_csv: boolean; rows: number; screenshots: number; sha256_manifest: boolean }[];
    N: number;
    matched: number;
    a: number;
    unverified: number;
    unverifiable: number;
    no_row: number;
    pilot: boolean;
  };
  population: { checked: number; medicine: number };
  heatmap: HeatmapCell[];
  label_check: { c: number; d: number; by_rule: Record<string, number> };
  text: { coverage: string | null; lead: string | null; label_check: string | null; caption: string };
  notes: string[];
  products: AuditProduct[];
}

const PILOT_BELOW = 25;

function claimTypeOf(ruleId: string): ClaimType | undefined {
  for (const t of RULES.find((r) => r.ruleId === ruleId)?.triggers ?? []) if (t.on === 'claim') return t.claim;
  return undefined;
}
const IMAGE_RE = /\.(png|jpe?g|webp)$/i;

function frameDate(dir: string): string | null {
  const m = dir.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${Number(m[3])} ${months[Number(m[2]) - 1]}`;
}

export function runAudit(input: AuditInput): { resultsCsv: string; summary: AuditSummary } {
  const copySet = input.copySet ?? 'B';
  const includeUnverified = input.includeUnverified ?? false;
  const hash = rulesetHash(RULES);
  const notes: string[] = [];

  const rows: AuditRow[] = [];
  const seen = new Set<string>();
  for (const raw of input.catalogRows) {
    const row = adaptRow(raw);
    if (!row) continue;
    if (seen.has(row.id)) {
      notes.push(`Duplicate catalogue id skipped: ${row.id}`);
      continue;
    }
    seen.add(row.id);
    rows.push(row);
  }
  if (rows.some((r) => r.claims_source === 'marketed_for_phrase_match')) {
    notes.push('Some rows have no X5 claim spans yet; their claims come from a deterministic phrase match on marketed_for (claims_source column).');
  }

  const frameDirs = input.frames.map((f) => {
    const parsed = f.namesCsv ? parseCsv(f.namesCsv) : [];
    return {
      dir: f.dir,
      rows: parsed.filter((r) => (r.name ?? r.product_name ?? '').trim()),
      names_csv: f.namesCsv !== null,
      screenshots: f.files.filter((x) => IMAGE_RE.test(x)).length,
      sha256_manifest: f.files.some((x) => /sha256/i.test(x)),
    };
  });
  const frameRows = frameDirs.flatMap((d) =>
    d.rows.map((r, i) => ({ dir: d.dir, rank: r.rank ?? r.position ?? String(i + 1), screenshot: r.screenshot ?? r.screenshot_path ?? '', csv: r })),
  );

  const mode: AuditSummary['mode'] = frameRows.length ? 'frame' : 'catalog_preview';
  if (input.frames.length === 0) notes.push('No frame found under data/frame/*/names.csv. This run is a catalogue preview, not the headline.');
  else if (!frameRows.length) notes.push('Frame directories exist but names.csv has no rows yet. This run is a catalogue preview, not the headline.');
  for (const d of frameDirs) {
    if (!d.names_csv) notes.push(`${d.dir}: names.csv missing.`);
    if (d.names_csv && !d.sha256_manifest) notes.push(`${d.dir}: no SHA-256 manifest for the screenshots yet.`);
  }

  const population = mode === 'frame'
    ? frameRows.map((f) => {
        const m = matchFrameRow(f.csv, rows);
        return { frame: f, row: m.row, method: m.method };
      })
    : rows.map((row) => ({ frame: null, row, method: 'catalog' }));

  const checkable = (r: AuditRow | null): r is AuditRow =>
    !!r && r.inci.length > 0 && (r.status === 'verified' || (includeUnverified && r.status === 'unverified'));

  const keys = READING_PROFILES.map((p) => ({ profile: p, key: profileKey(p, copySet) }));
  const heatmap: HeatmapCell[] = READING_PROFILES.map((p) => ({
    profile_id: p.id,
    label: p.label,
    CAUTION: 0,
    FITS: 0,
    by_top_grade: { R: 0, L: 0, T: 0 },
    rule_ids: {},
  }));
  const byRule: Record<string, number> = {};
  let c = 0;
  let d = 0;
  let medicine = 0;
  const results: Record<string, unknown>[] = [];
  const products: AuditProduct[] = [];

  for (const item of population) {
    const { row, frame } = item;
    const base = {
      population: mode,
      frame_dir: frame?.dir ?? '',
      frame_rank: frame?.rank ?? '',
      product_name: frame?.csv.name ?? frame?.csv.product_name ?? row?.name ?? '',
      catalog_id: row?.id ?? '',
      row_status: row?.status ?? 'no_row',
      claims_source: row?.claims_source ?? '',
      screenshot_path: frame?.screenshot || row?.screenshot_path || '',
      claim_url: row?.source_url ?? '',
      ruleset_hash: hash,
    };
    const product: AuditProduct = {
      frame_dir: frame?.dir ?? null,
      frame_rank: frame?.rank ?? null,
      name: base.product_name,
      catalog_id: row?.id ?? null,
      row_status: row?.status ?? 'no_row',
      match_method: item.method,
      checked: false,
      medicine_token: null,
      verdicts: {},
      label_hits: [],
    };
    products.push(product);
    if (!checkable(row)) continue;
    product.checked = true;

    const gate = medicineGate(row.inci, row.name);
    if (gate.gated) {
      medicine++;
      product.medicine_token = gate.token!;
      results.push({ ...base, rule_id: 'MED-1', kind: 'MEDICINE', grade: '', counted: false, contested: false, matched_token: gate.token, position: '' });
      continue;
    }

    const hits = labelCheck(row.claims, row.inci, RULES);
    product.label_hits = hits.map((h) => h.ruleId);
    const strict = hits.filter((h) => h.counted);
    if (strict.length) c++;
    else if (hits.some((h) => h.ruleId === 'LC-1b')) d++;
    for (const h of hits) {
      byRule[h.ruleId] = (byRule[h.ruleId] ?? 0) + 1;
      const claimType = claimTypeOf(h.ruleId);
      results.push({
        ...base,
        rule_id: h.ruleId,
        kind: 'LABEL_CHECK',
        grade: h.grade ?? '',
        counted: h.counted,
        contested: h.contested,
        profile_ids: '',
        matched_token: h.matchedToken,
        position: h.position ?? '',
        claim_type: claimType ?? '',
        claim_quote: h.quote ?? '',
      });
    }

    const fired = new Map<string, { profiles: string[]; token: string; position: number; grade: string }>();
    keys.forEach(({ profile, key }, i) => {
      const v = verdict({ key, inci: row.inci, inciSource: 'catalog_verified', inciSourceUrl: row.source_url, claims: row.claims, title: row.name });
      product.verdicts[profile.id] = v.label;
      const cell = heatmap[i]!;
      if (v.label === 'FITS') cell.FITS++;
      if (v.label !== 'CAUTION') return;
      cell.CAUTION++;
      const top = v.reasons[0]?.grade;
      if (top) cell.by_top_grade[top]++;
      for (const r of v.reasons) {
        cell.rule_ids[r.ruleId] = (cell.rule_ids[r.ruleId] ?? 0) + 1;
        const tokenPos = row.inci.find((t) => t.token === r.ingredient)?.position ?? 0;
        const entry = fired.get(r.ruleId) ?? { profiles: [], token: r.ingredient ?? '', position: tokenPos, grade: r.grade ?? '' };
        entry.profiles.push(profile.id);
        fired.set(r.ruleId, entry);
      }
    });
    for (const [ruleId, e] of [...fired].sort(([a], [b]) => (a < b ? -1 : 1))) {
      const rule = RULES.find((r) => r.ruleId === ruleId)!;
      results.push({
        ...base,
        rule_id: ruleId,
        kind: 'FIT_CAUTION',
        grade: e.grade,
        counted: rule.counted,
        contested: rule.contested,
        profile_ids: e.profiles.join(';'),
        matched_token: e.token,
        position: e.position || '',
        claim_type: '',
        claim_quote: '',
      });
    }
  }

  const N = mode === 'frame' ? population.length : 0;
  const a = mode === 'frame' ? population.filter((p) => checkable(p.row)).length : 0;
  const checked = population.filter((p) => checkable(p.row)).length;
  const frameStatus: FrameStatus =
    input.frames.length === 0 ? 'missing' : !frameRows.length ? 'empty' : a < N || frameDirs.some((x) => !x.names_csv) ? 'partial' : 'complete';
  const pilot = mode === 'frame' && a < PILOT_BELOW;
  if (checked === 0 && rows.length) notes.push('No catalogue row is human-verified yet, so nothing was checked. --include-unverified gives a preview.');
  if (pilot) notes.push(`Pilot: ${a} of ${N} frame products verified (fewer than ${PILOT_BELOW}). Same method, reported as a pilot.`);
  if (includeUnverified) notes.push('include_unverified is on: rows not yet ticked by a human are counted. Not for the headline.');
  if (copySet === 'A') notes.push('Copy set A: zone labels from the profiles are used as triggers (only valid if gate G1 passed).');

  const date = frameDirs.map((x) => frameDate(x.dir)).find(Boolean) ?? null;
  const headline = mode === 'frame' && !includeUnverified;
  const text = {
    coverage: headline
      ? `Flipkart's 'Oily Skin' filter showed us ${N} moisturisers and sunscreens${date ? ` on ${date}` : ''}. We could verify full ingredient lists from brand pages for ${a} of them.${pilot ? ` (pilot: ${a} of ${N} verified)` : ''}`
      : null,
    lead: headline
      ? `Flipkart shows the same ${a} products to everyone who picks 'Oily Skin'. Under our published rules, the number flagged CAUTION is ${heatmap
          .map((h) => `${h.CAUTION} for a YouCam '${h.label}' reading profile`)
          .join(', ')}.`
      : null,
    label_check: headline
      ? `${c} of ${a} make a claim their own ingredient list doesn't match (strict rules LC-1a / LC-2 / LC-3), plus ${d} more have a listed allergen under a 'fragrance-free' claim (LC-1b, informational).`
      : null,
    caption: COPY.auditCaption,
  };

  const summary: AuditSummary = {
    schema: 1,
    generated_at: input.generatedAt,
    ruleset_hash: hash,
    ruleset_version: RULESET_VERSION,
    band_cutoffs: BAND_CUTOFFS,
    copy_set: copySet,
    include_unverified: includeUnverified,
    mode,
    headline,
    catalog: {
      source: input.catalogSource,
      rows: rows.length,
      verified: rows.filter((r) => r.status === 'verified').length,
      unverified: rows.filter((r) => r.status === 'unverified').length,
      unverifiable: rows.filter((r) => r.status === 'unverifiable').length,
    },
    frame: {
      status: frameStatus,
      dirs: frameDirs.map((x) => ({ dir: x.dir, names_csv: x.names_csv, rows: x.rows.length, screenshots: x.screenshots, sha256_manifest: x.sha256_manifest })),
      N,
      matched: mode === 'frame' ? population.filter((p) => p.row).length : 0,
      a,
      unverified: mode === 'frame' ? population.filter((p) => p.row?.status === 'unverified').length : 0,
      unverifiable: mode === 'frame' ? population.filter((p) => p.row?.status === 'unverifiable').length : 0,
      no_row: mode === 'frame' ? population.filter((p) => !p.row).length : 0,
      pilot,
    },
    population: { checked, medicine },
    heatmap,
    label_check: { c, d, by_rule: byRule },
    text,
    notes,
    products,
  };
  return { resultsCsv: toCsv(RESULTS_HEADER, results), summary };
}

