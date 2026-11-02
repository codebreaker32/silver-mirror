import { CatalogProduct, titleCaseSlug, type ProductSummary, type Store } from '@skinkey/contracts';
import generated from '../generated/catalog.json';

export interface Catalog {
  products: CatalogProduct[];
  byId: Map<string, CatalogProduct>;
  verifiedCount: number;
  rejected: number;
}

export const loadCatalog = (rows: readonly unknown[]): Catalog => {
  const products: CatalogProduct[] = [];
  let rejected = 0;
  for (const row of rows) {
    const p = CatalogProduct.safeParse(row);
    if (p.success) products.push(p.data);
    else rejected += 1;
  }
  return {
    products,
    byId: new Map(products.map((p) => [p.id, p])),
    verifiedCount: products.filter((p) => p.verified && p.status === 'verified').length,
    rejected,
  };
};

let cached: Catalog | null = null;
export const bundledCatalog = () => (cached ??= loadCatalog(generated as unknown[]));

export const toSummary = (p: CatalogProduct): ProductSummary => ({
  id: p.id,
  brand: p.brand,
  name: p.name,
  ...(p.size ? { size: p.size } : {}),
  category: p.category,
  tinted: p.tinted,
  verified: p.verified,
  ...(p.verified && p.verified_by ? { verified_by: p.verified_by } : {}),
  status: p.status,
  shadeCount: p.shades.length,
});

const STOP = new Set([
  'for', 'with', 'the', 'and', 'of', 'a', 'an', 'in', 'to', 'by', 'on', 'at', 'from', 'pack', 'buy', 'online', 'best', 'price',
  'check', 'out', 'this', 'product', 'flipkart', 'amazon', 'nykaa', 'india', 'free', 'shipping', 'new', 'off', 'offer',
]);

const stem = (t: string) =>
  t
    .replace(/iz(e|er|ing|ed)/g, 'is$1')
    .replace(/(?<=[a-z]{3})(es|s)$/, '');

export const normaliseText = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/(\d+(?:\.\d+)?)\s*(ml|g|gm|gms|grams?|l|oz)\b/g, (_, n: string, u: string) => ` ${n}${u.startsWith('g') ? 'g' : u} `)
    .replace(/spf\s*(\d+)/g, ' spf$1 ')
    .replace(/[^a-z0-9.]+/g, ' ')
    .trim();

export const tokens = (s: string) => new Set(normaliseText(s).split(' ').filter((t) => t && !STOP.has(t)).map(stem));

const SIZE = /^\d+(?:\.\d+)?(ml|g|l|oz)$/;

const indexOf = (p: CatalogProduct) => ({
  p,
  brand: tokens(p.brand),
  all: tokens([p.brand, p.name, p.size ?? '', ...(p.aliases ?? [])].join(' ')),
  name: tokens(`${p.brand} ${p.name}`),
});

const indexCache = new WeakMap<Catalog, ReturnType<typeof indexOf>[]>();
const indexFor = (c: Catalog) => {
  let idx = indexCache.get(c);
  if (!idx) indexCache.set(c, (idx = c.products.map(indexOf)));
  return idx;
};

/** Dice overlap of title tokens with the product's own name tokens, with brand and size adjustments. 0..1. */
export const scoreTitle = (q: Set<string>, entry: ReturnType<typeof indexOf>) => {
  const qWords = [...q].filter((t) => !SIZE.test(t));
  if (qWords.length === 0) return 0;
  const hit = qWords.filter((t) => entry.all.has(t)).length;
  const nameWords = [...entry.name].filter((t) => !SIZE.test(t));
  const nameHit = nameWords.filter((t) => q.has(t)).length;
  const dice = (2 * nameHit) / (nameWords.length + qWords.length);
  const recall = hit / qWords.length;
  let score = 0.6 * dice + 0.4 * recall;
  const brandHit = [...entry.brand].every((t) => q.has(t));
  score = brandHit ? Math.min(1, score + 0.15) : score * 0.6;
  const qSizes = [...q].filter((t) => SIZE.test(t));
  const pSizes = [...entry.all].filter((t) => SIZE.test(t));
  if (qSizes.length && pSizes.length) score += qSizes.some((s) => pSizes.includes(s)) ? 0.05 : -0.05;
  return Math.max(0, Math.min(1, score));
};

export interface ScoredProduct {
  product: CatalogProduct;
  score: number;
}

export const searchCatalog = (
  catalog: Catalog,
  query: string,
  filter: { category?: string; tinted?: boolean; limit?: number } = {},
): ScoredProduct[] => {
  const q = tokens(query);
  return indexFor(catalog)
    .filter((e) => (filter.category ? e.p.category === filter.category : true) && (filter.tinted === undefined || e.p.tinted === filter.tinted))
    .map((e) => ({ product: e.p, score: q.size ? scoreTitle(q, e) : 0 }))
    .filter((s) => !q.size || s.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.product.verified) - Number(a.product.verified) || a.product.id.localeCompare(b.product.id))
    .slice(0, filter.limit ?? 20);
};

export const MATCH = { match: 0.85, gap: 0.1, candidate: 0.45 } as const;

// ---- SKU disqualifiers (BUGS.md #4) --------------------------------------------------------------------------
// A name overlap is not enough: "Minimalist SPF 30 Body Sunscreen" must never be offered "Minimalist SPF 50 Sunscreen".
// These checks are deterministic and only ever remove candidates; with none left, the check runs on the name only.

type SkuType = 'sun' | 'cleanser' | 'serum' | 'toner' | 'moisturiser' | 'lip';
const TYPE_WORDS: ReadonlyArray<[SkuType, RegExp]> = [
  ['sun', /\b(sunscreen|sunblock|sun ?screen|sun (cream|lotion|gel|fluid|serum|spray|stick|milk)|uv (fluid|gel|serum|essence))\b/],
  ['cleanser', /\b(face ?wash|cleanser|cleansing|wash)\b/],
  ['serum', /\bserum\b/],
  ['toner', /\btoner\b/],
  ['moisturiser', /\b(moisturi[sz]er|moisturi[sz]ing (cream|lotion|gel)|day cream|night cream|gel cream|face cream)\b/],
  ['lip', /\blips?\b/],
];
const CATEGORY_TYPE: Partial<Record<CatalogProduct['category'], SkuType>> = {
  sunscreen: 'sun',
  tinted_spf: 'sun',
  moisturiser: 'moisturiser',
  tinted_moisturiser: 'moisturiser',
  cleanser: 'cleanser',
  serum: 'serum',
  toner: 'toner',
  lip_tint: 'lip',
  tinted_lip_balm: 'lip',
};
const typesIn = (norm: string) => new Set(TYPE_WORDS.filter(([, re]) => re.test(norm)).map(([t]) => t));
const spfsIn = (norm: string) => new Set([...norm.matchAll(/\bspf ?(\d+)\b/g)].map((m) => Number(m[1])));
const has = (norm: string, word: RegExp) => word.test(norm);

/**
 * Why `product` cannot be the listing titled `title`, or null if nothing rules it out:
 * - SPF: both name an SPF and they differ (SPF 30 vs SPF 50/60);
 * - body vs face: the listing is a body product and the row is not (or the other way round);
 * - product type: the listing names a type (sunscreen, face wash, serum, toner, moisturiser, lip) the row is not.
 */
export const skuConflict = (title: string, product: CatalogProduct): string | null => {
  const q = normaliseText(title);
  const name = normaliseText(`${product.brand} ${product.name} ${product.size ?? ''}`);
  const qSpf = spfsIn(q);
  const pSpf = spfsIn(name);
  if (typeof product.spf === 'number') pSpf.add(Math.round(product.spf));
  if (qSpf.size && pSpf.size && ![...qSpf].some((n) => pSpf.has(n))) return `SPF ${[...qSpf].join('/')} vs SPF ${[...pSpf].join('/')}`;
  const qBody = has(q, /\bbody\b/);
  const pBody = has(name, /\bbody\b/);
  if (qBody && !pBody && !has(q, /\bface\b/)) return 'body product vs face product';
  if (pBody && !qBody) return 'face product vs body product';
  const qTypes = typesIn(q);
  if (qTypes.size) {
    const pTypes = typesIn(name);
    const cat = CATEGORY_TYPE[product.category];
    if (cat) pTypes.add(cat);
    if (typeof product.spf === 'number') pTypes.add('sun');
    if (![...qTypes].some((t) => pTypes.has(t))) return `${[...qTypes].join('/')} vs ${[...pTypes].join('/') || product.category}`;
  }
  return null;
};

export interface SkuMatch {
  /** Hits that survived the disqualifiers, best first. */
  hits: ScoredProduct[];
  /** Hits at or above the candidate threshold that a disqualifier removed. */
  ruledOut: Array<ScoredProduct & { why: string }>;
}

/** Catalogue search for a shared title with the SKU disqualifiers applied. */
export const matchSku = (catalog: Catalog, title: string, limit = 5): SkuMatch => {
  const hits: ScoredProduct[] = [];
  const ruledOut: SkuMatch['ruledOut'] = [];
  for (const h of searchCatalog(catalog, title, { limit: 20 })) {
    const why = skuConflict(title, h.product);
    if (why) {
      if (h.score >= MATCH.candidate) ruledOut.push({ ...h, why });
    } else if (hits.length < limit) hits.push(h);
  }
  return { hits, ruledOut };
};

export const detectStore = (text = '', url = ''): Store => {
  const s = `${url} ${text}`.toLowerCase();
  if (/flipkart\.com|fkrt\.it|\bflipkart\b/.test(s)) return 'flipkart';
  if (/amazon\.in|amzn\.in|amzn\.to|\bamazon\b/.test(s)) return 'amazon_in';
  if (/nykaa\.com|\bnykaa\b/.test(s)) return 'nykaa';
  return 'other';
};

const URL_RE = /https?:\/\/\S+/gi;

/** Title from a store URL slug, e.g. flipkart.com/<slug>/p/itm… or amazon.in/<slug>/dp/… Short links carry no slug and are never fetched. */
export const titleFromUrl = (url: string): string | null => {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    const at = parts.findIndex((p) => p === 'p' || p === 'dp');
    const slug = at > 0 ? parts[at - 1] : u.hostname.includes('nykaa') ? parts[0] : undefined;
    if (!slug || slug.length < 6) return null;
    return titleCaseSlug(decodeURIComponent(slug).replace(/[-_]+/g, ' ').trim());
  } catch {
    return null;
  }
};

/** Strips share boilerplate and links from a share payload. Never invents a title. */
export const extractTitle = (text?: string, url?: string): string | null => {
  const urls = [...(text ?? '').matchAll(URL_RE)].map((m) => m[0]);
  const fromText = (text ?? '')
    .replace(URL_RE, ' ')
    .replace(/\b(check out|look at|i found|have a look at|sharing|shop now|buy now|available on|at flipkart|on flipkart|on amazon(\.in)?|on nykaa)\b[!:.]*/gi, ' ')
    .replace(/[|•]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (fromText.length >= 4) return fromText.slice(0, 300);
  for (const u of [url, ...urls].filter((x): x is string => Boolean(x))) {
    const t = titleFromUrl(u);
    if (t) return t;
  }
  return null;
};

/** Every distinct INCI name in the catalogue: vocabulary for label OCR normalisation. */
export const inciVocabulary = (catalog: Catalog) =>
  [...new Set(catalog.products.flatMap((p) => p.inci.map((t) => t.token.trim())).filter(Boolean))].sort((a, b) => a.localeCompare(b));
