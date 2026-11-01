import { useEffect, useState } from 'react';
import type { CatalogProduct, KeyProfile, ProductCategory } from '@skinkey/contracts';
import type { CheckApi } from '@/features/check/api';
import { selectMatches, type MatchView, type Rank } from './select';

const MAX_FETCH = 12;
const cache = new Map<string, CatalogProduct>();

export type MatchesState =
  | { status: 'idle' | 'loading' }
  | { status: 'ready'; matches: MatchView[]; catalogCount: number }
  | { status: 'error' };

async function loadProducts(api: CheckApi, ids: string[], signal: AbortSignal): Promise<CatalogProduct[]> {
  const out = await Promise.all(
    ids.map(async (id) => {
      const hit = cache.get(id);
      if (hit) return hit;
      const { product } = await api.product(id, signal);
      cache.set(id, product);
      return product;
    }),
  );
  return out;
}

export function useBetterMatches(opts: {
  api: CheckApi;
  rank: Rank;
  key: KeyProfile | null;
  category: ProductCategory | null;
  title: string | null;
  excludeId?: string;
  enabled: boolean;
}): MatchesState {
  const { api, rank, key, category, title, excludeId, enabled } = opts;
  const [state, setState] = useState<MatchesState>({ status: 'idle' });

  useEffect(() => {
    if (!enabled || !key) {
      setState({ status: 'idle' });
      return;
    }
    const ctl = new AbortController();
    setState({ status: 'loading' });
    (async () => {
      const search = await api.search(category ? { category, limit: 20 } : { q: title ?? undefined, limit: 20 }, ctl.signal);
      const ids = search.results
        .filter((r) => r.verified && r.status === 'verified' && r.id !== excludeId)
        .slice(0, MAX_FETCH)
        .map((r) => r.id);
      const products = await loadProducts(api, ids, ctl.signal);
      if (!ctl.signal.aborted) setState({ status: 'ready', matches: selectMatches(rank, products, key, excludeId), catalogCount: search.catalogCount });
    })().catch(() => {
      if (!ctl.signal.aborted) setState({ status: 'error' });
    });
    return () => ctl.abort();
  }, [api, rank, key, category, title, excludeId, enabled]);

  return state;
}
