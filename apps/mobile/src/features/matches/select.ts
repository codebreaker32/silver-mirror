import type { CatalogProduct, KeyProfile, RankedMatch } from '@skinkey/contracts';
import { productTitle } from '../check/flow';
import { flipkartSearchUrl } from './links';

export type Rank = (products: readonly CatalogProduct[], key: KeyProfile, options?: { limit?: number; excludeId?: string }) => RankedMatch[];

export interface MatchView {
  productId: string;
  index: string;
  name: string;
  meta: string | null;
  reasonLine: string;
  url: string;
  a11y: string;
}

/** Ranked catalogue SKUs, FITS only (never show a CAUTION item as a better match). */
export function selectMatches(rank: Rank, products: readonly CatalogProduct[], key: KeyProfile, excludeId?: string, limit = 3): MatchView[] {
  const verified = products.filter((p) => p.verified && p.status === 'verified');
  const byId = new Map(verified.map((p) => [p.id, p]));
  return rank(verified, key, { limit: limit * 2, excludeId })
    .filter((m) => m.label === 'FITS' && byId.has(m.productId) && m.productId !== excludeId)
    .slice(0, limit)
    .map((m, i) => {
      const p = byId.get(m.productId)!;
      const name = productTitle(p);
      const url = m.searchUrl || flipkartSearchUrl(`${p.brand} ${p.name}`);
      return {
        productId: p.id,
        index: String(i + 1).padStart(2, '0'),
        name,
        meta: p.size ?? null,
        reasonLine: m.reasonLine,
        url,
        a11y: `Match ${i + 1}. ${name}. Fits. ${m.reasonLine} Opens a Flipkart search for this product.`,
      };
    });
}
