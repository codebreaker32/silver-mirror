import { useCallback, useEffect, useRef, useState } from 'react';
import type { CatalogProduct, KeyProfile, ProductSummary, VerdictLabel } from '@skinkey/contracts';
import { medicineGate, verdict } from '@skinkey/rules';
import { demo } from '@/demo';
import { workerCheckApi, type CheckApi } from '@/features/check/api';
import { evaluateProduct, type Engine } from '@/features/check/flow';

/** Web `?demo=` answers from the bundled catalogue offline; native asks the Worker, as Picks and Better matches do. */
const API: CheckApi = demo?.checkApi ?? workerCheckApi;
const ENGINE: Engine = { verdict, medicineGate };

/** The search endpoint caps a page at 50 and has no offset: one full page per category. */
export const PAGE = 50;

export type ShopCategory = 'all' | 'serum' | 'moisturiser' | 'cleanser' | 'sunscreen' | 'tinted_spf' | 'saved';

export const CATEGORIES: readonly { id: ShopCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'serum', label: 'Serums' },
  { id: 'moisturiser', label: 'Moisturisers' },
  { id: 'cleanser', label: 'Cleansers' },
  { id: 'sunscreen', label: 'Sunscreen' },
  { id: 'tinted_spf', label: 'Tinted SPF' },
  { id: 'saved', label: 'Saved' },
];

export interface ShopItem {
  id: string;
  brand: string;
  /** Catalogue name without a repeated brand prefix. */
  name: string;
  category: string;
}

export interface ShopState {
  status: 'loading' | 'ready' | 'error';
  items: ShopItem[];
  /** Verified products in the whole catalogue (the endpoint's catalogCount). */
  catalogCount: number | null;
  retry: () => void;
}

const products = new Map<string, CatalogProduct>();
const inflight = new Map<string, Promise<CatalogProduct>>();

/** One full product, cached for the session (the card verdicts and the Saved list share it). */
export function fetchProduct(id: string, signal?: AbortSignal): Promise<CatalogProduct> {
  const hit = products.get(id);
  if (hit) return Promise.resolve(hit);
  let p = inflight.get(id);
  if (!p) {
    p = API.product(id, signal).then(({ product }) => {
      products.set(id, product);
      inflight.delete(id);
      return product;
    });
    p.catch(() => inflight.delete(id));
    inflight.set(id, p);
  }
  return p;
}

const toItem = (p: Pick<ProductSummary, 'id' | 'brand' | 'name' | 'category'>): ShopItem => {
  const lower = p.name.toLowerCase();
  const name = lower.startsWith(p.brand.toLowerCase()) ? p.name.slice(p.brand.length).trim() || p.name : p.name;
  return { id: p.id, brand: p.brand, name, category: p.category };
};

/** Brand/name filter for the Saved list (the server search does this for the catalogue). */
const matchesQuery = (it: ShopItem, q: string) => {
  const needle = q.trim().toLowerCase();
  return !needle || `${it.brand} ${it.name}`.toLowerCase().includes(needle);
};

/**
 * The Shop grid: verified catalogue products for the chosen category and search text (debounced 250ms), or the
 * products saved on this phone. Keeps the last list on screen while the next one loads, so the grid never blanks.
 */
export function useShop(query: string, category: ShopCategory, saved: readonly string[]): ShopState {
  const [state, setState] = useState<Omit<ShopState, 'retry'>>({ status: 'loading', items: [], catalogCount: null });
  const [attempt, setAttempt] = useState(0);
  const [q, setQ] = useState(query);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = setTimeout(() => setQ(query), 250);
    return () => clearTimeout(id);
  }, [query]);

  const savedKey = category === 'saved' ? saved.join('|') : '';

  useEffect(() => {
    const ctl = new AbortController();
    setState((s) => ({ ...s, status: 'loading' }));
    (async () => {
      if (category === 'saved') {
        const ids = savedKey ? savedKey.split('|') : [];
        const list = await Promise.all(ids.map((id) => fetchProduct(id, ctl.signal).catch(() => null)));
        const items = list.filter((p): p is CatalogProduct => !!p).map(toItem).filter((it) => matchesQuery(it, q));
        if (!ctl.signal.aborted) setState((s) => ({ status: 'ready', items, catalogCount: s.catalogCount }));
        return;
      }
      const res = await API.search({ q: q.trim() || undefined, category: category === 'all' ? undefined : category, limit: PAGE }, ctl.signal);
      const items = res.results.filter((r) => r.verified && r.status === 'verified').map(toItem);
      if (!ctl.signal.aborted) setState({ status: 'ready', items, catalogCount: res.catalogCount });
    })().catch(() => {
      if (!ctl.signal.aborted) setState((s) => ({ ...s, status: 'error' }));
    });
    return () => ctl.abort();
  }, [q, category, savedKey, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}

/**
 * The card's verdict for the reading on this phone, computed lazily when the card mounts (the grid is virtualised, so
 * only visible cards ask). Same rules and inputs as a check of that product. Null while loading, without a reading, or
 * when the product cannot be fetched: the card simply shows no verdict line.
 */
export function useCardVerdict(id: string, key: KeyProfile | null): VerdictLabel | null {
  const [label, setLabel] = useState<VerdictLabel | null>(() => {
    const p = products.get(id);
    return p && key ? evaluateProduct(ENGINE, key, p).label : null;
  });
  useEffect(() => {
    if (!key) {
      setLabel(null);
      return;
    }
    let alive = true;
    fetchProduct(id)
      .then((p) => alive && setLabel(evaluateProduct(ENGINE, key, p).label))
      .catch(() => alive && setLabel(null));
    return () => {
      alive = false;
    };
  }, [id, key]);
  return label;
}
