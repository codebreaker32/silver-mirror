import type { CatalogProduct, KeyProfile, ProductCategory, RankedMatch } from '@skinkey/contracts';
import { productTitle } from '../check/flow';
import { readingsIn } from './filters';
import { flipkartSearchUrl } from './links';

export type Rank = (products: readonly CatalogProduct[], key: KeyProfile, options?: { limit?: number; excludeId?: string }) => RankedMatch[];

export interface MatchView {
  productId: string;
  index: string;
  name: string;
  meta: string | null;
  category: ProductCategory | null;
  /** Readings the reason line names ("Oiliness", "Nose pore"), for the reading filter chips. */
  readings: string[];
  reasonLine: string;
  /** One line where commerce puts stars (DESIGN.md §8.3): "Niacinamide · fits your oiliness". */
  shortReason: string;
  url: string;
  a11y: string;
}

/** "… Contains niacinamide, which our rule SUP-2 counts …" + "Oiliness reading" → "Niacinamide · fits your oiliness". */
export function shortReason(reasonLine: string): string {
  const raw = /\bContains (.+?)(?:, which| which|\.\s|\.$)/.exec(reasonLine)?.[1] ?? '';
  // "niacinamide (vitamin B3)" → "niacinamide"; "NIACINAMIDE" → "niacinamide" (the catalogue keeps label casing).
  let ingredient = raw.replace(/\s*\(.*$/, '').split(/,\s*/)[0]?.trim() ?? '';
  if (ingredient && ingredient === ingredient.toUpperCase()) ingredient = ingredient.toLowerCase();
  const reading = readingsIn(reasonLine)[0];
  const fact = reasonLine.replace(/^.*?reading: [^.]*\.\s*/s, '').trim();
  if (!ingredient) return fact || reasonLine;
  const head = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
  if (!reading) return head;
  const what = reading.toLowerCase().replace(/ pore$/, ' pores').replace(/^pore$/, 'pores');
  return `${head} · fits your ${what} reading`;
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
        category: p.category ?? null,
        readings: readingsIn(m.reasonLine),
        reasonLine: m.reasonLine,
        shortReason: shortReason(m.reasonLine),
        url,
        a11y: `Match ${i + 1}. ${name}. Fits. ${m.reasonLine} Opens a Flipkart search for this product.`,
      };
    });
}
