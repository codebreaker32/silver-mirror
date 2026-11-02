import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CatalogProduct, KeyProfile } from '@skinkey/contracts';
import { rank } from '@skinkey/rules';
import { demo } from '@/demo';
import { workerCheckApi, type CheckApi } from '@/features/check/api';
import { productTitle } from '@/features/check/flow';
import { selectMatches } from '@/features/matches/select';
import {
  EMPTY_CHOICES,
  ROUTINE_CATEGORIES,
  fillRoutine,
  setChoice,
  type FilledStep,
  type RoutineChoices,
  type RoutineProduct,
  type RoutineTime,
  type StepCategory,
} from './model';
import { loadChoices, saveChoices } from './store';

/** Web `?demo=` answers from the bundled catalogue offline; native asks the Worker, as Picks and Better matches do. */
const API: CheckApi = demo?.checkApi ?? workerCheckApi;

/** Candidates read per category, and fitting products kept per step (the first fills it, the rest are swaps). */
const CANDIDATES = 24;
const KEEP = 8;
const products = new Map<string, CatalogProduct>();

type Fitting = Partial<Record<StepCategory, RoutineProduct[]>>;

export type RoutineState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; steps: Record<RoutineTime, FilledStep[]> };

const stripBrand = (p: CatalogProduct) =>
  p.name.toLowerCase().startsWith(p.brand.toLowerCase()) ? p.name.slice(p.brand.length).trim() || p.name : p.name;

async function fittingIn(category: StepCategory, key: KeyProfile, signal: AbortSignal): Promise<RoutineProduct[]> {
  const search = await API.search({ category, limit: 50 }, signal);
  const ids = search.results
    .filter((r) => r.verified && r.status === 'verified')
    .slice(0, CANDIDATES)
    .map((r) => r.id);
  const list = await Promise.all(
    ids.map(async (id) => {
      const hit = products.get(id);
      if (hit) return hit;
      const { product } = await API.product(id, signal);
      products.set(id, product);
      return product;
    }),
  );
  const byId = new Map(list.map((p) => [p.id, p]));
  // The same published rules and FITS-only filter as Picks and Better matches; category is re-checked on the product.
  return selectMatches(rank, list.filter((p) => p.category === category), key, undefined, KEEP).flatMap((m) => {
    const p = byId.get(m.productId);
    return p ? [{ productId: p.id, brand: p.brand, name: stripBrand(p), category, query: productTitle(p), reason: m.shortReason }] : [];
  });
}

/**
 * The routine for the reading on this phone: each step filled with a catalogue product the rules rank FITS, the
 * shopper's own swaps kept on the phone. `swap` stores a new choice; `retry` reloads after a network error.
 */
export function useRoutine(key: KeyProfile | null, savedIds?: ReadonlySet<string>) {
  const [fitting, setFitting] = useState<Fitting | null>(null);
  const [failed, setFailed] = useState(false);
  const [choices, setChoices] = useState<RoutineChoices>(EMPTY_CHOICES);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    void loadChoices().then(setChoices);
  }, []);

  useEffect(() => {
    setFitting(null);
    setFailed(false);
    if (!key) return;
    const ctl = new AbortController();
    (async () => {
      const lists = await Promise.all(ROUTINE_CATEGORIES.map((c) => fittingIn(c, key, ctl.signal)));
      if (ctl.signal.aborted) return;
      setFitting(Object.fromEntries(ROUTINE_CATEGORIES.map((c, i) => [c, lists[i]])) as Fitting);
    })().catch(() => {
      if (!ctl.signal.aborted) setFailed(true);
    });
    return () => ctl.abort();
  }, [key, attempt]);

  const state: RoutineState = useMemo(() => {
    if (!key) return { status: 'idle' };
    if (failed) return { status: 'error' };
    if (!fitting) return { status: 'loading' };
    return { status: 'ready', steps: { am: fillRoutine('am', fitting, choices, savedIds), pm: fillRoutine('pm', fitting, choices, savedIds) } };
  }, [key, failed, fitting, choices, savedIds]);

  const swap = useCallback((time: RoutineTime, category: StepCategory, productId: string) => {
    setChoices((prev) => {
      const next = setChoice(prev, time, category, productId);
      void saveChoices(next);
      return next;
    });
  }, []);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { state, swap, retry };
}
