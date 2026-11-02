import { useEffect, useState } from 'react';
import type { CatalogProduct, KeyProfile, ProductCategory } from '@skinkey/contracts';
import { rank } from '@skinkey/rules';
import { demo } from '@/demo';
import { workerCheckApi, type CheckApi } from '@/features/check/api';
import { productTitle } from '@/features/check/flow';
import { selectMatches } from '@/features/matches/select';

/** One Home pick: a verified catalogue product the published rules rank FITS for the reading on this phone. */
export interface HomePick {
  productId: string;
  brand: string;
  name: string;
  category: ProductCategory | null;
  /** What /check is opened with: brand + name, as a pasted name would be. */
  query: string;
  a11y: string;
}

const SHOW = 6;
const FETCH = 16;
const products = new Map<string, CatalogProduct>();

/** Web `?demo=` answers from the bundled catalogue offline; native asks the Worker, as Better matches does. */
const API: CheckApi = demo?.checkApi ?? workerCheckApi;

/** Round-robin across groups (brand, category) so the rail is not six of one kind in a row. Keeps order inside a group. */
export function spreadBy<T>(items: readonly T[], group: (it: T) => string, limit: number): T[] {
  const groups = new Map<string, T[]>();
  for (const it of items) {
    const k = group(it);
    groups.set(k, [...(groups.get(k) ?? []), it]);
  }
  const out: T[] = [];
  const queues = [...groups.values()];
  while (out.length < limit && queues.some((q) => q.length)) {
    for (const q of queues) {
      const next = q.shift();
      if (next && out.length < limit) out.push(next);
    }
  }
  return out;
}

export const spreadByCategory = <T extends { category: ProductCategory | null }>(items: readonly T[], limit: number): T[] =>
  spreadBy(items, (it) => it.category ?? 'other', limit);

/**
 * "Picks for you" on Home: verified catalogue products that FIT the current reading (the same rules and FITS-only
 * filter as Better matches). Empty while loading, on error and without a reading: the section hides then.
 */
export function usePicks(key: KeyProfile | null): HomePick[] {
  const [picks, setPicks] = useState<HomePick[]>([]);

  useEffect(() => {
    if (!key) {
      setPicks([]);
      return;
    }
    const ctl = new AbortController();
    (async () => {
      const search = await API.search({ limit: 50 }, ctl.signal);
      // The catalogue lists by id, so one brand can fill the first page: take the candidates brand by brand.
      const ids = spreadBy(
        search.results.filter((r) => r.verified && r.status === 'verified'),
        (r) => r.brand.toLowerCase(),
        FETCH,
      ).map((r) => r.id);
      const list = await Promise.all(
        ids.map(async (id) => {
          const hit = products.get(id);
          if (hit) return hit;
          const { product } = await API.product(id, ctl.signal);
          products.set(id, product);
          return product;
        }),
      );
      if (ctl.signal.aborted) return;
      const byId = new Map(list.map((p) => [p.id, p]));
      const fits = selectMatches(rank, list, key, undefined, FETCH)
        .map((m) => byId.get(m.productId))
        .filter((p): p is CatalogProduct => !!p)
        .map((p) => ({ ...p, category: p.category ?? null }));
      setPicks(
        spreadByCategory(fits, SHOW).map((p) => {
          const query = productTitle(p);
          const name = p.name.toLowerCase().startsWith(p.brand.toLowerCase()) ? p.name.slice(p.brand.length).trim() || p.name : p.name;
          return { productId: p.id, brand: p.brand, name, category: p.category, query, a11y: `${query}. Fits your reading. Opens a check for this product.` };
        }),
      );
    })().catch(() => {
      if (!ctl.signal.aborted) setPicks([]);
    });
    return () => ctl.abort();
  }, [key]);

  return picks;
}
