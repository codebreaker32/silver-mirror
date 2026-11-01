import type { SourceKind } from '@skinkey/contracts';
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
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/**
 * Merges data/catalog/brands/*.json into catalogue rows. Deterministic: same input, same output (files are taken in the
 * order given, first row wins on a duplicate). Drops anything that cannot be checked against a source: incomplete INCI,
 * no https source, third-party decoder pages, and categories the rules do not cover. A human tick (verifiedIds) only
 * counts on a brand_official row.
 */
export function mergeCatalog(
  files: readonly { file: string; rows: readonly unknown[] }[],
  opts: { verifiedIds?: ReadonlySet<string>; fetchedAt: string },
): MergeResult {
  const verifiedIds = opts.verifiedIds ?? new Set<string>();
  const rows: MergedRow[] = [];
  const dropped: DroppedRow[] = [];
  const ignoredTicks: string[] = [];
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
        const verified = ticked && kind === 'brand_official';
        if (ticked && !verified) ignoredTicks.push(p.id);
        rows.push({ ...p, source_kind: kind, verified, status: verified ? 'verified' : 'unverified' });
      }
    }
  }
  return { rows, dropped, ignoredTicks };
}
