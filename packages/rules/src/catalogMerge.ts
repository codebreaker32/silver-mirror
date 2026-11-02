import type { SourceKind, VerifiedBy } from '@skinkey/contracts';
import { toCatalogProduct, type BuiltCatalogRow } from './catalog';

/** Hosts that sell or decode products but do not make them. Everything else is treated as the brand's own site. */
const RETAILER_HOSTS = ['apollopharmacy.in', '1mg.com', 'pharmeasy.in', 'nykaa.com', 'amazon.in', 'flipkart.com', 'lookfantastic.com', 'myntra.com', 'purplle.com', 'netmeds.com', 'tirabeauty.com'];
const THIRD_PARTY_HOSTS = ['cureskin.com', 'incidecoder.com', 'skincarisma.com', 'inci.guide'];

const hostOf = (url: string): string | null => {
  const m = /^https:\/\/([^/?#]+)/i.exec(url);
  return m ? m[1]!.toLowerCase() : null;
};
const onHost = (host: string, list: readonly string[]) => list.some((h) => host === h || host.endsWith(`.${h}`));

export function sourceKindOf(url: string): SourceKind | null {
  const host = hostOf(url);
  if (!host) return null;
  if (onHost(host, THIRD_PARTY_HOSTS)) return 'third_party';
  if (onHost(host, RETAILER_HOSTS)) return 'retailer';
  return 'brand_official';
}

// ---- Recorded brand-page check (the two-agent verbatim check) ------------------------------------------------
// The catalogue agent copies INCI from the brand page; a second, independent agent pass re-reads the page (or the
// pack image on it) and records the result in the row's `notes`, e.g. "Independently verified 2026-11-01: 31/31 INCI
// entries match the page in order and spelling." We only read what was recorded; nothing is inferred or re-fetched.

/** A sentence that says a second, independent read happened. */
const CHECK_MARK =
  /\b(independent(ly)?|re-?verified|re-?checked|re-?fetched|re-?read|re-?downloaded|verifier|second fetch|second pass|numbered pass|fetch tool)\b|\bverified\s+(on\s+)?20\d\d-\d\d-\d\d\s*(:|against)/i;
/** ...and that it matched (in the same or the next sentence). */
const CHECK_MATCH = /\b(match(es|ed|ing)?|identical|exact(ly)?|verbatim|word for word|term for term)\b/i;
/** Phrases that already mean "passed" on their own. */
const CHECK_PASSED = /\bre-?verified against\b|\bverified by an independent re-?check\b|\bre-?checked verbatim\b/i;
const CHECK_NEGATED = /\b(not|no|never|cannot|could not|couldn't|doesn't|didn't)\b[^.;]{0,25}\b(match|verified|checked|cross-checked|confirm)/i;
/** Row-level doubts about the list itself: such a row stays unverified until a person checks the pack. */
const LIST_DOUBT = /do not use this|data conflict|data-quality flag|may lag|before relying|conflicts with the (official|brand)/i;

const sentencesOf = (notes: string) =>
  notes
    .split(/(?<=[.!?])\s+(?=[A-Z(])/)
    .map((x) => x.trim())
    .filter(Boolean);

/**
 * Returns the notes sentence that records a passed, independent brand-page check of the INCI, or null.
 * Conservative by design: no record, a negated record, or any doubt about the list → null.
 */
export function recordedBrandPageCheck(notes: unknown): string | null {
  if (typeof notes !== 'string' || !notes.trim() || LIST_DOUBT.test(notes)) return null;
  const ss = sentencesOf(notes);
  for (let i = 0; i < ss.length; i++) {
    const s = ss[i]!;
    if (!CHECK_MARK.test(s) || CHECK_NEGATED.test(s)) continue;
    const next = ss[i + 1] ?? '';
    if (CHECK_PASSED.test(s) || CHECK_MATCH.test(s)) return s;
    if (CHECK_MATCH.test(next) && !CHECK_NEGATED.test(next)) return `${s} ${next}`;
  }
  return null;
}

export type MergedRow = BuiltCatalogRow & { source_kind: SourceKind };
export type DropReason = 'not_a_product_row' | 'inci_incomplete' | 'no_https_source' | 'third_party_source' | 'out_of_scope_category' | 'duplicate_id' | 'duplicate_gtin';
export interface DroppedRow {
  file: string;
  brand: string;
  name: string;
  reason: DropReason;
  detail?: string;
}
export interface MergeResult {
  rows: MergedRow[];
  dropped: DroppedRow[];
  /** Verification ticks that were ignored because the row is not from the brand's own page. */
  ignoredTicks: string[];
  /** brand_official rows kept unverified because their notes record no passed brand-page check. */
  unchecked: string[];
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/**
 * Merges data/catalog/brands/*.json into catalogue rows. Deterministic: same input, same output (files are taken in the
 * order given, first row wins on a duplicate). Drops anything that cannot be checked against a source: incomplete INCI,
 * no https source, third-party decoder pages, and categories the rules do not cover.
 *
 * Tiering (only brand_official rows can be usable for verdicts and better matches):
 * - a human tick (verifiedIds or `verified: true`) → verified, verified_by 'human';
 * - else a passed second-read check recorded in the row's notes → verified, verified_by 'brand_page_check';
 * - else unverified. Retailer rows stay unverified whatever their notes say (they need a pack or brand-page check).
 */
export function mergeCatalog(
  files: readonly { file: string; rows: readonly unknown[] }[],
  opts: { verifiedIds?: ReadonlySet<string>; fetchedAt: string },
): MergeResult {
  const verifiedIds = opts.verifiedIds ?? new Set<string>();
  const rows: MergedRow[] = [];
  const dropped: DroppedRow[] = [];
  const ignoredTicks: string[] = [];
  const unchecked: string[] = [];
  const ids = new Map<string, string>();
  const gtins = new Map<string, string>();

  for (const { file, rows: raw } of files) {
    for (const r of raw) {
      const rec = (r && typeof r === 'object' ? r : {}) as Record<string, unknown>;
      const base = { file, brand: str(rec.brand), name: str(rec.name) };
      const p = toCatalogProduct({ fetched_at: opts.fetchedAt, ...rec, verified: false });
      if (!p) {
        dropped.push({ ...base, reason: 'not_a_product_row' });
        continue;
      }
      const kind = sourceKindOf(p.source_url);
      const drop = (reason: DropReason, detail?: string) => dropped.push({ ...base, reason, ...(detail ? { detail } : {}) });
      if (!kind) drop('no_https_source', p.source_url || undefined);
      else if (kind === 'third_party') drop('third_party_source', hostOf(p.source_url) ?? undefined);
      else if (p.status === 'unverifiable') drop('inci_incomplete');
      else if (p.category === 'other') drop('out_of_scope_category', str(rec.category));
      else if (ids.has(p.id)) drop('duplicate_id', `same id as a row in ${ids.get(p.id)}`);
      else if (str(rec.gtin_barcode) && gtins.has(str(rec.gtin_barcode))) drop('duplicate_gtin', `GTIN ${str(rec.gtin_barcode)} already used by ${gtins.get(str(rec.gtin_barcode))}`);
      else {
        ids.set(p.id, file);
        if (str(rec.gtin_barcode)) gtins.set(str(rec.gtin_barcode), p.id);
        const ticked = verifiedIds.has(p.id) || rec.verified === true;
        const official = kind === 'brand_official';
        if (ticked && !official) ignoredTicks.push(p.id);
        const checkNote = official && !ticked ? recordedBrandPageCheck(rec.notes) : null;
        const by: VerifiedBy | null = official && ticked ? 'human' : checkNote ? 'brand_page_check' : null;
        if (official && !by) unchecked.push(p.id);
        rows.push({
          ...p,
          source_kind: kind,
          verified: by !== null,
          ...(by ? { verified_by: by } : {}),
          ...(checkNote ? { check_note: checkNote.slice(0, 400) } : {}),
          status: by ? 'verified' : 'unverified',
        });
      }
    }
  }
  return { rows, dropped, ignoredTicks, unchecked };
}
