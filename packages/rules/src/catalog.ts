import { CatalogProduct, type ProductCategory } from '@skinkey/contracts';
import { claimsFromMarketedFor } from './claims';
import { toInciTokens } from './inci';

export type ClaimsSource = 'catalog' | 'marketed_for_phrase_match';
export type BuiltCatalogRow = CatalogProduct & { claims_source: ClaimsSource };

export const catalogId = (brand: string, name: string) =>
  `${brand}-${name}`
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
    .replace(/-$/, '');

const CATEGORY_ALIASES: Record<string, ProductCategory> = {
  moisturizer: 'moisturiser',
  tinted_sunscreen: 'tinted_spf',
  tinted_moisturizer: 'tinted_moisturiser',
};

const toCategory = (raw: unknown): ProductCategory => {
  const s = typeof raw === 'string' ? raw : '';
  const parsed = CatalogProduct.shape.category.safeParse(CATEGORY_ALIASES[s] ?? s);
  return parsed.success ? parsed.data : 'other';
};

const toSpf = (raw: unknown): number | undefined => {
  if (typeof raw === 'number') return raw;
  const m = typeof raw === 'string' ? /spf\s*(\d+)/i.exec(raw) : null;
  return m ? Number(m[1]) : undefined;
};

const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

/**
 * One adapter for every consumer (Worker bundle, audit, web): CatalogProduct rows pass through; raw brand rows
 * (data/catalog/brands/*.json) become CatalogProduct with a stable id. Only a human tick makes a row verified:
 * `verified: true` on the row, or its id in data/catalog/verified.json. A row without a complete INCI list never is.
 */
export function toCatalogProduct(raw: unknown, verifiedIds: ReadonlySet<string> = new Set()): BuiltCatalogRow | null {
  const parsed = CatalogProduct.safeParse(raw);
  if (parsed.success) {
    const p = parsed.data;
    const verified = (p.verified || verifiedIds.has(p.id)) && p.status !== 'unverifiable' && p.inci.length > 0;
    return { ...p, verified, status: verified ? 'verified' : p.status === 'verified' ? 'unverified' : p.status, claims_source: 'catalog' };
  }
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.name !== 'string' || typeof r.brand !== 'string') return null;
  const id = typeof r.id === 'string' ? r.id : catalogId(r.brand, r.name);
  const inci = toInciTokens(strings(r.inci));
  const complete = r.inci_complete !== false && inci.length > 0;
  const verified = complete && (r.verified === true || verifiedIds.has(id));
  const category = toCategory(r.category);
  const spf = toSpf(r.spf);
  return {
    id,
    brand: r.brand,
    name: r.name,
    ...(typeof r.size === 'string' && r.size.length < 40 ? { size: r.size } : {}),
    category,
    tinted: typeof r.tinted === 'boolean' ? r.tinted : /tint/.test(category),
    ...(spf !== undefined ? { spf } : {}),
    inci,
    claims: claimsFromMarketedFor(strings(r.marketed_for), r.name),
    shades: Array.isArray(r.shades) ? (r.shades as CatalogProduct['shades']) : [],
    source_url: typeof r.source_url === 'string' ? r.source_url : '',
    fetched_at: typeof r.fetched_at === 'string' ? r.fetched_at : new Date(0).toISOString(),
    ...(typeof r.screenshot_path === 'string' ? { screenshot_path: r.screenshot_path } : {}),
    verified,
    status: !complete ? 'unverifiable' : verified ? 'verified' : 'unverified',
    aliases: strings([r.search_keywords]),
    claims_source: 'marketed_for_phrase_match',
  };
}

/** Builds the catalogue from raw rows: adapt, drop invalid rows and duplicate ids (first wins). */
export function buildCatalog(rows: readonly unknown[], verifiedIds: ReadonlySet<string> = new Set()): BuiltCatalogRow[] {
  const seen = new Set<string>();
  const out: BuiltCatalogRow[] = [];
  for (const raw of rows) {
    const p = toCatalogProduct(raw, verifiedIds);
    if (!p || seen.has(p.id) || !CatalogProduct.safeParse(p).success) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
}
