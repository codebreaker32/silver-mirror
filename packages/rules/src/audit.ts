import { COPY, type Claim, type CopySet, type VerdictLabel } from '@skinkey/contracts';
import { BAND_CUTOFFS } from './bands';
import { toCatalogProduct, type BuiltCatalogRow } from './catalog';
import { sourceKindOf } from './catalogMerge';
import { AUDIT_CLAIM_TYPES, auditClaims, type AuditClaim, type AuditClaimType } from './claims';
import { labelCheck, medicineGate, rulesetHash, verdict } from './engine';
import { READING_PROFILES, profileKey } from './profiles';
import { CLAIM_PHRASE, RULES, RULESET_VERSION } from './rules';

/**
 * The pre-registered audit, method `brand-claims-1` (audit/METHOD.md): claims on a brand's own page checked against the
 * ingredient list on that page with the published rules. Pure and deterministic; scripts/audit.mjs does the file I/O.
 */
export const AUDIT_METHOD = 'brand-claims-1';

export { AUDIT_CLAIM_TYPES, auditClaims, claimsFromMarketedFor } from './claims';
export type { AuditClaim, AuditClaimType } from './claims';

export interface BrandFile {
  file: string;
  rows: readonly unknown[];
}

/** audit/rules-frozen.json, written at the rules-frozen tag. */
export interface FrozenRecord {
  method: string;
  ruleset_hash: string;
  ruleset_version: string;
  files: Record<string, string>;
}

export interface AuditInput {
  brandFiles: readonly BrandFile[];
  generatedAt: string;
  /** Human ticks from data/catalog/verified.json. They set review status only; they don't gate the counts. */
  verifiedIds?: readonly string[];
  frozen?: FrozenRecord | null;
  /** SHA-256 of the frozen files as they are now, keyed like FrozenRecord.files. */
  currentFiles?: Record<string, string>;
  copySet?: CopySet;
}

export type ExcludeReason =
  | 'not_a_product_row'
  | 'no_https_source'
  | 'retailer_source'
  | 'third_party_source'
  | 'out_of_scope_category'
  | 'duplicate_id'
  | 'duplicate_gtin';

/** Brand-page claim → the reading profiles it points to (audit/METHOD.md). Free-from claims go to the Label Check. */
export const CLAIM_PROFILES: Partial<Record<AuditClaimType, readonly string[]>> = {
  for_oily_skin: ['oily', 'oily-redness'],
  for_combination_skin: ['combination', 'combination-redness'],
  for_dry_skin: ['dry'],
  for_sensitive_skin: ['oily-redness', 'combination-redness'],
  non_comedogenic: ['oily', 'oily-redness'],
  for_all_skin_types: READING_PROFILES.map((p) => p.id),
};

export const claimLabel = (t: AuditClaimType): string => (t === 'non_comedogenic' ? 'non-comedogenic' : (CLAIM_PHRASE[t] ?? t));

export const PILOT_BELOW = 25;

export const RESULTS_HEADER = [
  'catalog_id',
  'brand',
  'product_name',
  'category',
  'rule_id',
  'kind',
  'grade',
  'counted',
  'contested',
  'profile_ids',
  'claim_matched_profiles',
  'matched_token',
  'position',
  'claim_type',
  'claim_quote',
  'source_url',
  'review_status',
  'ruleset_hash',
] as const;

export interface HeatmapCell {
  profile_id: string;
  label: string;
  CAUTION: number;
  FITS: number;
  by_top_grade: { R: number; L: number; T: number };
  rule_ids: Record<string, number>;
}

export interface ClaimMatrixRow {
  claim: AuditClaimType;
  label: string;
  /** Rows in N with this claim. */
  N: number;
  /** Checked rows with this claim. */
  checked: number;
  profiles_matched: string[];
  caution: Record<string, number>;
  /** Checked rows with this claim flagged CAUTION for a profile the claim points to (null: the claim maps to none). */
  claim_matched_caution: number | null;
}

export type ReviewStatus = 'ticked' | 'pending';

export interface ReviewItem {
  catalog_id: string;
  brand: string;
  product_name: string;
  kind: 'LABEL_CHECK' | 'CLAIM_PROFILE';
  rule_id: string;
  grade: string;
  counted: boolean;
  contested: boolean;
  claim_type: string;
  claim_quote: string;
  matched_token: string;
  position: number | null;
  profile_ids: string[];
  source_url: string;
  review_status: ReviewStatus;
}

export interface AuditProduct {
  file: string;
  catalog_id: string | null;
  brand: string;
  name: string;
  category: string;
  source_url: string;
  excluded: ExcludeReason | null;
  excluded_detail?: string;
  claims: AuditClaim[];
  inci_complete: boolean;
  in_N: boolean;
  in_a: boolean;
  checked: boolean;
  medicine_token: string | null;
  verdicts: Record<string, VerdictLabel>;
  label_hits: string[];
  claim_matched_profiles: string[];
}

export interface AuditSummary {
  schema: 2;
  method: string;
  generated_at: string;
  ruleset_hash: string;
  ruleset_version: string;
  band_cutoffs: typeof BAND_CUTOFFS;
  copy_set: CopySet;
  frozen: { status: 'match' | 'mismatch' | 'missing'; ruleset_hash: string | null; changed_files: string[] };
  headline: boolean;
  pilot: boolean;
  input: { files: number; rows: number };
  excluded: Partial<Record<ExcludeReason, number>>;
  population: { brand_rows: number; N: number; a: number; unverifiable: number; medicine: number; checked: number };
  label_check: { c: number; d: number; by_rule: Record<string, number> };
  heatmap: HeatmapCell[];
  claim_matrix: ClaimMatrixRow[];
  claim_profile: { b: number; e: number };
  review: { items: number; products: number; ticked: number; pending: number; list: ReviewItem[] };
  text: { coverage: string; label_check: string | null; claim_profile: string | null; six_readings: string | null; caption: string };
  notes: string[];
  products: AuditProduct[];
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

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/** Brand rows carry marketed_for. Already-built CatalogProduct rows (test fixtures) carry contract claims instead. */
function claimsOf(raw: Record<string, unknown>, row: BuiltCatalogRow): AuditClaim[] {
  if (Array.isArray(raw.marketed_for)) {
    return auditClaims(
      raw.marketed_for.filter((x): x is string => typeof x === 'string'),
      row.name,
    );
  }
  return AUDIT_CLAIM_TYPES.flatMap((type) => {
    const c = row.claims.find((x) => x.type === type);
    return c ? [{ type, quote: c.quote ?? claimLabel(type) }] : [];
  });
}

const toContractClaims = (claims: readonly AuditClaim[]): Claim[] =>
  claims.flatMap((c) => (c.type === 'non_comedogenic' ? [] : [{ type: c.type, quote: c.quote }]));

const profileLabel = (pid: string) => READING_PROFILES.find((p) => p.id === pid)?.label ?? pid;

export function runAudit(input: AuditInput): { resultsCsv: string; summary: AuditSummary } {
  const copySet = input.copySet ?? 'B';
  const ticked = new Set(input.verifiedIds ?? []);
  const hash = rulesetHash(RULES);
  const notes: string[] = [];
  const reviewOf = (id: string): ReviewStatus => (ticked.has(id) ? 'ticked' : 'pending');

  // 1. Population: every brand row, with the exclusions of audit/METHOD.md applied in order.
  const products: AuditProduct[] = [];
  const built = new Map<AuditProduct, BuiltCatalogRow>();
  const excluded: Partial<Record<ExcludeReason, number>> = {};
  const ids = new Map<string, string>();
  const gtins = new Map<string, string>();
  let inputRows = 0;
  for (const { file, rows } of input.brandFiles) {
    for (const raw of rows) {
      inputRows++;
      const rec = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
      const p = toCatalogProduct(raw);
      const product: AuditProduct = {
        file,
        catalog_id: p?.id ?? null,
        brand: p?.brand ?? str(rec.brand),
        name: p?.name ?? str(rec.name),
        category: p?.category ?? str(rec.category),
        source_url: p?.source_url ?? str(rec.source_url),
        excluded: null,
        claims: p ? claimsOf(rec, p) : [],
        inci_complete: !!p && p.status !== 'unverifiable' && p.inci.length > 0,
        in_N: false,
        in_a: false,
        checked: false,
        medicine_token: null,
        verdicts: {},
        label_hits: [],
        claim_matched_profiles: [],
      };
      products.push(product);
      const exclude = (reason: ExcludeReason, detail?: string) => {
        product.excluded = reason;
        if (detail) product.excluded_detail = detail;
        excluded[reason] = (excluded[reason] ?? 0) + 1;
      };
      if (!p) {
        exclude('not_a_product_row');
        continue;
      }
      built.set(product, p);
      const kind = sourceKindOf(p.source_url);
      const gtin = str(rec.gtin_barcode);
      if (!kind) exclude('no_https_source', p.source_url || undefined);
      else if (kind === 'retailer') exclude('retailer_source', p.source_url);
      else if (kind === 'third_party') exclude('third_party_source', p.source_url);
      else if (p.category === 'other') exclude('out_of_scope_category', str(rec.category));
      else if (ids.has(p.id)) exclude('duplicate_id', `same id as a row in ${ids.get(p.id)}`);
      else if (gtin && gtins.has(gtin)) exclude('duplicate_gtin', `GTIN ${gtin} already used by ${gtins.get(gtin)}`);
      if (product.excluded) continue;
      ids.set(p.id, file);
      if (gtin) gtins.set(gtin, p.id);
    }
  }

  const kept = products.filter((x) => !x.excluded);
  const inN = kept.filter((x) => x.claims.length > 0);
  for (const x of inN) x.in_N = true;
  const inA = inN.filter((x) => x.inci_complete);
  for (const x of inA) x.in_a = true;

  // 2. Rules over every row in a: medicine gate, Label Check, then the six reading profiles.
  const heatmap: HeatmapCell[] = READING_PROFILES.map((p) => ({
    profile_id: p.id,
    label: p.label,
    CAUTION: 0,
    FITS: 0,
    by_top_grade: { R: 0, L: 0, T: 0 },
    rule_ids: {},
  }));
  const keys = READING_PROFILES.map((p) => profileKey(p, copySet));
  const byRule: Record<string, number> = {};
  const results: Record<string, unknown>[] = [];
  const review: ReviewItem[] = [];
  let c = 0;
  let d = 0;
  let medicine = 0;
  let b = 0;
  let e = 0;

  for (const prod of inA) {
    const row = built.get(prod)!;
    const base = {
      catalog_id: row.id,
      brand: row.brand,
      product_name: row.name,
      category: row.category,
      source_url: row.source_url,
      review_status: reviewOf(row.id),
      ruleset_hash: hash,
    };
    const gate = medicineGate(row.inci, row.name);
    if (gate.gated) {
      medicine++;
      prod.medicine_token = gate.token!;
      results.push({ ...base, rule_id: 'MED-1', kind: 'MEDICINE', counted: false, contested: false, matched_token: gate.token });
      continue;
    }
    prod.checked = true;
    const claims = toContractClaims(prod.claims);

    const hits = labelCheck(claims, row.inci, RULES);
    prod.label_hits = hits.map((h) => h.ruleId);
    if (hits.some((h) => h.counted)) c++;
    else if (hits.some((h) => h.ruleId === 'LC-1b')) d++;
    for (const h of hits) {
      byRule[h.ruleId] = (byRule[h.ruleId] ?? 0) + 1;
      const trigger = RULES.find((r) => r.ruleId === h.ruleId)?.triggers.find((t) => t.on === 'claim');
      const claimType = trigger?.on === 'claim' ? trigger.claim : '';
      const quote = prod.claims.find((x) => x.type === claimType)?.quote ?? h.quote ?? '';
      const item = {
        rule_id: h.ruleId,
        grade: h.grade ?? '',
        counted: h.counted,
        contested: h.contested,
        matched_token: h.matchedToken,
        claim_type: claimType,
        claim_quote: quote,
      };
      results.push({ ...base, ...item, kind: 'LABEL_CHECK', position: h.position ?? '' });
      review.push({ ...base, ...item, kind: 'LABEL_CHECK', position: h.position ?? null, profile_ids: [] });
    }

    const matchedProfiles = new Set(prod.claims.flatMap((x) => CLAIM_PROFILES[x.type] ?? []));
    if (matchedProfiles.size) b++;
    const fired = new Map<string, { profiles: string[]; token: string; position: number | null; grade: string }>();
    keys.forEach((key, i) => {
      const profile = READING_PROFILES[i]!;
      const v = verdict({ key, inci: row.inci, inciSource: 'catalog_verified', inciSourceUrl: row.source_url, claims, title: row.name });
      prod.verdicts[profile.id] = v.label;
      const cell = heatmap[i]!;
      if (v.label === 'FITS') cell.FITS++;
      if (v.label !== 'CAUTION') return;
      cell.CAUTION++;
      const top = v.reasons[0]?.grade;
      if (top) cell.by_top_grade[top]++;
      if (matchedProfiles.has(profile.id)) prod.claim_matched_profiles.push(profile.id);
      for (const r of v.reasons) {
        cell.rule_ids[r.ruleId] = (cell.rule_ids[r.ruleId] ?? 0) + 1;
        const position = row.inci.find((t) => t.token === r.ingredient)?.position ?? null;
        const entry = fired.get(r.ruleId) ?? { profiles: [], token: r.ingredient ?? '', position, grade: r.grade ?? '' };
        entry.profiles.push(profile.id);
        fired.set(r.ruleId, entry);
      }
    });
    if (prod.claim_matched_profiles.length) e++;

    for (const [ruleId, f] of [...fired].sort(([x], [y]) => (x < y ? -1 : 1))) {
      const rule = RULES.find((r) => r.ruleId === ruleId)!;
      const matched = f.profiles.filter((pid) => matchedProfiles.has(pid));
      const claimsHere = prod.claims.filter((x) => (CLAIM_PROFILES[x.type] ?? []).some((pid) => matched.includes(pid)));
      const item = {
        rule_id: ruleId,
        grade: f.grade,
        contested: rule.contested,
        matched_token: f.token,
        claim_type: claimsHere.map((x) => x.type).join(';'),
        claim_quote: claimsHere.map((x) => x.quote).join(' | '),
      };
      results.push({
        ...base,
        ...item,
        kind: 'FIT_CAUTION',
        counted: rule.counted,
        profile_ids: f.profiles.join(';'),
        claim_matched_profiles: matched.join(';'),
        position: f.position ?? '',
      });
      if (matched.length) review.push({ ...base, ...item, kind: 'CLAIM_PROFILE', counted: false, position: f.position, profile_ids: matched });
    }
  }

  // 3. Counts and the pre-registered sentences.
  const checkedRows = inA.filter((x) => x.checked);
  const checked = checkedRows.length;
  const claimMatrix: ClaimMatrixRow[] = AUDIT_CLAIM_TYPES.map((claim) => {
    const withClaim = checkedRows.filter((x) => x.claims.some((k) => k.type === claim));
    const mapped = [...(CLAIM_PROFILES[claim] ?? [])];
    return {
      claim,
      label: claimLabel(claim),
      N: inN.filter((x) => x.claims.some((k) => k.type === claim)).length,
      checked: withClaim.length,
      profiles_matched: mapped,
      caution: Object.fromEntries(READING_PROFILES.map((p) => [p.id, withClaim.filter((x) => x.verdicts[p.id] === 'CAUTION').length])),
      claim_matched_caution: mapped.length ? withClaim.filter((x) => mapped.some((pid) => x.verdicts[pid] === 'CAUTION')).length : null,
    };
  });

  const frozen = input.frozen ?? null;
  const frozenStatus: AuditSummary['frozen']['status'] = !frozen ? 'missing' : frozen.ruleset_hash === hash ? 'match' : 'mismatch';
  const current = input.currentFiles;
  const changedFiles =
    frozen && current
      ? [...new Set([...Object.keys(frozen.files), ...Object.keys(current)])].filter((f) => frozen.files[f] !== current[f]).sort()
      : [];
  if (frozenStatus === 'missing') notes.push('No audit/rules-frozen.json: the rules were not frozen before this run, so it is not the headline.');
  if (frozenStatus === 'mismatch') notes.push(`Ruleset hash ${hash} differs from the frozen ${frozen!.ruleset_hash}, so this run is not the headline.`);
  if (changedFiles.length) notes.push(`Files that differ from the rules-frozen record: ${changedFiles.join(', ')}.`);
  const pilot = checked < PILOT_BELOW;
  if (pilot) notes.push(`Pilot: ${checked} products checked (fewer than ${PILOT_BELOW}). Same method, reported as a pilot.`);
  if (medicine) notes.push(`${medicine} of the ${inA.length} products stopped at the medicine gate (MED-1) and get no further counts.`);
  const tickedItems = review.filter((r) => r.review_status === 'ticked').length;
  notes.push(
    `Ingredient lists were copied from brand pages by the catalogue workflow. A person has reviewed ${tickedItems} of the ${review.length} flagged rows so far; the rest are pending (audit/review.md).`,
  );

  const text: AuditSummary['text'] = {
    coverage: `${inN.length} products in our brand-page catalogue make a skin-type or free-from claim on their own brand page. ${inA.length} of them have a complete ingredient list there.`,
    label_check: checked
      ? `${c} of ${checked} make a claim their own ingredient list doesn't match (strict rules LC-1a / LC-2 / LC-3), plus ${d} more list a fragrance substance or essential oil under a 'fragrance-free' claim (LC-1b, informational).`
      : null,
    claim_profile: b
      ? `${e} of ${b} products that name a skin type or 'non-comedogenic' on their brand page are flagged CAUTION by our published rules for a reading profile their own claim points to.`
      : null,
    six_readings: checked
      ? `Across the ${checked} checked products, the number flagged CAUTION is ${heatmap.map((h) => `${h.CAUTION} for a YouCam '${profileLabel(h.profile_id)}' reading profile`).join(', ')}.`
      : null,
    caption: COPY.auditCaption,
  };

  const summary: AuditSummary = {
    schema: 2,
    method: AUDIT_METHOD,
    generated_at: input.generatedAt,
    ruleset_hash: hash,
    ruleset_version: RULESET_VERSION,
    band_cutoffs: BAND_CUTOFFS,
    copy_set: copySet,
    frozen: { status: frozenStatus, ruleset_hash: frozen?.ruleset_hash ?? null, changed_files: changedFiles },
    headline: frozenStatus === 'match',
    pilot,
    input: { files: input.brandFiles.length, rows: inputRows },
    excluded,
    population: { brand_rows: kept.length, N: inN.length, a: inA.length, unverifiable: inN.length - inA.length, medicine, checked },
    label_check: { c, d, by_rule: byRule },
    heatmap,
    claim_matrix: claimMatrix,
    claim_profile: { b, e },
    review: {
      items: review.length,
      products: new Set(review.map((r) => r.catalog_id)).size,
      ticked: tickedItems,
      pending: review.length - tickedItems,
      list: review,
    },
    text,
    notes,
    products,
  };
  return { resultsCsv: toCsv(RESULTS_HEADER, results), summary };
}

const mdCell = (s: string) => s.replace(/\|/g, '/').replace(/\s+/g, ' ').trim();

/** audit/review.md: every flagged row, for a person to check against the brand page. */
export function reviewMarkdown(summary: AuditSummary): string {
  const r = summary.review;
  const lines = [
    '# Audit review list',
    '',
    `Generated by \`npm run audit\` (method ${summary.method}, ruleset ${summary.ruleset_hash}, ${summary.generated_at}). Do not hand-edit. To tick a product, add its id to \`data/catalog/verified.json\` and run the audit again.`,
    '',
    `${r.items} flagged rows on ${r.products} products. Reviewed by a person: ${r.ticked}. Pending: ${r.pending}.`,
    '',
    'For each row, open the brand page and check three things: the claim quote is on the page, the ingredient is in the ingredient list on the page, and its position is right.',
    '',
  ];
  if (!r.list.length) return [...lines, 'Nothing was flagged.', ''].join('\n');
  const kind = (x: ReviewItem) =>
    x.kind === 'LABEL_CHECK'
      ? `Label Check${x.counted ? ', strict' : ', informational'}${x.contested ? ', contested definition' : ''}`
      : 'Claim vs reading profile';
  lines.push(
    '| Status | Product | Kind | Rule | Claim quote | Ingredient (position) | Profiles | Brand page |',
    '|---|---|---|---|---|---|---|---|',
    ...r.list.map(
      (x) =>
        `| ${x.review_status === 'ticked' ? '[x]' : '[ ]'} ${x.review_status} | ${mdCell(`${x.brand}: ${x.product_name}`)} (\`${x.catalog_id}\`) | ${kind(x)} | ${x.rule_id} (${x.grade || 'n/a'}) | "${mdCell(x.claim_quote)}" | ${mdCell(x.matched_token)}${x.position ? ` (${x.position})` : ''} | ${x.profile_ids.map(profileLabel).join(', ') || 'n/a'} | ${x.source_url} |`,
    ),
    '',
  );
  return lines.join('\n');
}
