import type { Band, Concern, FacetMapping, KeyProfile, ProductCategory, SkinTypeClass } from '@skinkey/contracts';
import { deriveSkinType, flipkartSearchUrl } from '@skinkey/rules';

export { flipkartSearchUrl };

/** Facet pattern from research/skinkey_report.md: p[]=facets.skin_type[]=<Facet>, value double-encoded. */
export const flipkartFacetUrl = (q: string, facet: string) =>
  `${flipkartSearchUrl(q)}&p%5B%5D=${encodeURIComponent(`facets.skin_type%5B%5D=${facet.replace(/ /g, '+')}`)}`;

export const amazonSearchUrl = (q: string) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`;

export const nykaaSearchUrl = (q: string) => `https://www.nykaa.com/search/result/?q=${encodeURIComponent(q)}`;

const CATEGORY_WORD: Record<ProductCategory, string> = {
  moisturiser: 'moisturiser',
  sunscreen: 'sunscreen',
  cleanser: 'face wash',
  serum: 'face serum',
  toner: 'toner',
  tinted_moisturiser: 'tinted moisturiser',
  tinted_spf: 'tinted sunscreen',
  lip_tint: 'lip tint',
  tinted_lip_balm: 'tinted lip balm',
  other: 'skincare',
};

const GUESS: ReadonlyArray<[ProductCategory, RegExp]> = [
  ['tinted_lip_balm', /tinted\s+lip\s+balm/i],
  ['lip_tint', /lip\s+(and\s+cheek\s+)?tint/i],
  ['tinted_spf', /tinted\s+(sunscreen|spf)/i],
  ['tinted_moisturiser', /tinted\s+moisturi[sz]er/i],
  ['sunscreen', /sunscreen|sun\s*screen|spf|sunblock/i],
  ['moisturiser', /moisturi[sz]er|moisturi[sz]ing\s+(cream|lotion|gel)|face\s+cream|gel\s+cream/i],
  ['cleanser', /cleanser|face\s*wash|cleansing/i],
  ['serum', /serum/i],
  ['toner', /toner/i],
];

export function guessCategory(title: string | null | undefined): ProductCategory | null {
  if (!title) return null;
  return GUESS.find(([, re]) => re.test(title))?.[0] ?? null;
}

export const categoryWord = (c: ProductCategory | null) => CATEGORY_WORD[c ?? 'other'];

/** The Key's YouCam class: the whole-face label if G1 gave one, else the published band-derived class. */
export function keyClass(key: KeyProfile | null): SkinTypeClass | null {
  if (!key) return null;
  const levels = Object.fromEntries(Object.entries(key.bands).map(([c, b]) => [c, b.level])) as Record<Concern, Band>;
  return key.zones.whole ?? key.skinType?.value ?? deriveSkinType(levels);
}

export function facetFor(key: KeyProfile | null, map: readonly FacetMapping[]): string | null {
  const cls = keyClass(key);
  if (!cls) return null;
  return map.find((m) => m.youcamClass === cls)?.flipkartFacet ?? null;
}

/** Keywords for store searches: a category word plus the reading class in plain words, never a claim. */
export function storeKeywords(category: ProductCategory | null, key: KeyProfile | null): string {
  const cls = keyClass(key);
  const word = categoryWord(category);
  if (!cls || cls === 'Normal' || cls.includes('&') || cls === 'Redness') return word;
  return `${word} for ${cls.toLowerCase()} skin`;
}

export interface StoreLink {
  id: 'flipkart_facet' | 'flipkart' | 'amazon' | 'nykaa';
  label: string;
  destination: string;
  url: string;
  /**
   * How the link opens. Nykaa keyword search deep-links to the Nykaa app's home screen, not the results
   * (spikes/FINDINGS.md S1), so Nykaa opens in a browser Custom Tab.
   */
  opener: 'app' | 'custom_tab';
}

export function storeLinks(opts: { category: ProductCategory | null; key: KeyProfile | null; facetMap: readonly FacetMapping[]; facetLabel: (facet: string) => string }): StoreLink[] {
  const q = storeKeywords(opts.category, opts.key);
  const facet = facetFor(opts.key, opts.facetMap);
  const word = categoryWord(opts.category);
  const links: StoreLink[] = [];
  if (facet) {
    links.push({ id: 'flipkart_facet', label: opts.facetLabel(facet), destination: `Opens a Flipkart search, filtered to ${facet}`, url: flipkartFacetUrl(word, facet), opener: 'app' });
  } else {
    links.push({ id: 'flipkart', label: 'Search Flipkart', destination: `Opens a Flipkart keyword search for "${q}"`, url: flipkartSearchUrl(q), opener: 'app' });
  }
  links.push({ id: 'amazon', label: 'Search Amazon.in', destination: `Opens an Amazon keyword search for "${q}"`, url: amazonSearchUrl(q), opener: 'app' });
  links.push({ id: 'nykaa', label: 'Search Nykaa', destination: `Opens a Nykaa keyword search for "${q}" in a browser tab`, url: nykaaSearchUrl(q), opener: 'custom_tab' });
  return links;
}

/** Store URLs that must open in a Custom Tab rather than the store app (Nykaa: app deep links drop the search). */
export const opensInCustomTab = (url: string): boolean => {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === 'nykaa.com' || host.endsWith('.nykaa.com');
  } catch {
    return false;
  }
};

/** Optional affiliate params (app.json expo.extra.affiliate). Empty strings mean "not set". */
export interface AffiliateParams {
  amazonTag?: string;
  flipkartAffid?: string;
  nykaaQuery?: string;
}

const hostOf = (url: string): string => {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
};
const onHost = (host: string, domain: string) => host === domain || host.endsWith(`.${domain}`);
const join = (url: string, qs: string) => `${url}${url.includes('?') ? '&' : '?'}${qs}`;

export const hasAffiliate = (aff: AffiliateParams): boolean =>
  !!(aff.amazonTag?.trim() || aff.flipkartAffid?.trim() || aff.nykaaQuery?.trim().replace(/^[?&]+/, ''));

/**
 * Appends the store's affiliate param to a store URL, only when that param is set. Applied to links built after
 * ranking, so it never changes which products are shown or their order.
 */
export function withAffiliate(url: string, aff: AffiliateParams): string {
  const host = hostOf(url);
  const amazon = aff.amazonTag?.trim();
  const flipkart = aff.flipkartAffid?.trim();
  const nykaa = aff.nykaaQuery?.trim().replace(/^[?&]+/, '');
  if (amazon && onHost(host, 'amazon.in')) return join(url, `tag=${encodeURIComponent(amazon)}`);
  if (flipkart && onHost(host, 'flipkart.com')) return join(url, `affid=${encodeURIComponent(flipkart)}`);
  if (nykaa && onHost(host, 'nykaa.com')) return join(url, nykaa);
  return url;
}

export interface BuyLink {
  store: 'Amazon' | 'Flipkart' | 'Nykaa';
  url: string;
}

/** Where to buy a catalogue product: a '<brand> <name>' search on each store, affiliate params added when set. */
export function buyLinks(product: { brand: string; name: string }, aff: AffiliateParams = {}): BuyLink[] {
  const q = `${product.brand} ${product.name}`.trim();
  return [
    { store: 'Amazon', url: withAffiliate(amazonSearchUrl(q), aff) },
    { store: 'Flipkart', url: withAffiliate(flipkartSearchUrl(q), aff) },
    { store: 'Nykaa', url: withAffiliate(nykaaSearchUrl(q), aff) },
  ];
}
