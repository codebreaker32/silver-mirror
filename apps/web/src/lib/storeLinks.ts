import { COPY } from '@skinkey/contracts';
import type { AffiliateConfig } from '../config';

export type StoreId = 'flipkart' | 'amazon_in' | 'nykaa';

export interface StoreLink {
  store: StoreId;
  label: string;
  destination: string;
  href: string;
  tagged: boolean;
}

const enc = encodeURIComponent;

export const flipkartSearch = (q: string) => `https://www.flipkart.com/search?q=${enc(q)}`;

/** Flipkart's own skin-type facet (seller-tagged). Pattern from research/skinkey_report.md (VERIFIED on the web). */
export const flipkartFacetSearch = (q: string, facet: string) =>
  `${flipkartSearch(q)}&p%5B%5D=facets.skin_type%255B%255D%3D${enc(facet).replace(/%20/g, '%2B')}`;

const withQuery = (url: string, query: string) => (query ? `${url}${url.includes('?') ? '&' : '?'}${query}` : url);

/**
 * Keyword-search links for one product. Built after ranking, so affiliate tags can never reorder anything.
 * Amazon is untagged everywhere (Associates India policy rule 7).
 */
export function storeLinks(query: string, affiliate: AffiliateConfig): StoreLink[] {
  const fk = affiliate.flipkart.live && affiliate.flipkart.query !== '';
  const ny = affiliate.nykaa.live && affiliate.nykaa.query !== '';
  return [
    {
      store: 'flipkart',
      label: 'Flipkart',
      destination: 'Opens a Flipkart keyword search',
      href: fk ? withQuery(flipkartSearch(query), affiliate.flipkart.query) : flipkartSearch(query),
      tagged: fk,
    },
    {
      store: 'amazon_in',
      label: 'Amazon.in',
      destination: 'Opens an Amazon.in keyword search',
      href: `https://www.amazon.in/s?k=${enc(query)}`,
      tagged: false,
    },
    {
      store: 'nykaa',
      label: 'Nykaa',
      destination: 'Opens a Nykaa keyword search',
      href: ny ? withQuery(`https://www.nykaa.com/search/result/?q=${enc(query)}`, affiliate.nykaa.query) : `https://www.nykaa.com/search/result/?q=${enc(query)}`,
      tagged: ny,
    },
  ];
}

/** The commission line, shown only when at least one rendered link carries a live tag. */
export const disclosureFor = (links: readonly StoreLink[]): string | null =>
  links.some((l) => l.tagged) ? COPY.affiliateDisclosure : null;
