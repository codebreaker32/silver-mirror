import { useCallback, useReducer, useRef } from 'react';
import type { KeyProfile, ResolveCandidate, ResolveRequest, Store } from '@skinkey/contracts';
import type { CheckInput } from '@/features/share/parse';
import { toResolveRequest } from '@/features/share/parse';
import type { CheckApi } from './api';
import { chipsFromOcr, chipsToInci, type InciChip } from './chips';
import {
  checkReducer,
  evaluateLabel,
  evaluateProduct,
  evaluateTitleOnly,
  stepFromResolve,
  type CheckState,
  type Engine,
} from './flow';

const QUIET = 'Something went wrong. Try again in a moment.';

export function errorMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'body' in e) {
    const code = (e as { body?: { error?: { code?: string } } | null }).body?.error?.code;
    if (code === 'rate_limited') return 'SkinKey is busy right now. Try again in a minute.';
    if (code === 'cap_reached') return 'This install has used its checks for now. The sample share still works.';
    if (code === 'claude_refusal') return "We couldn't read that. Try a clearer photo or paste the product name.";
  }
  return QUIET;
}

export interface CheckFlow {
  state: CheckState;
  start: (input: CheckInput) => void;
  sendCrop: (imageBase64: string) => void;
  confirm: (candidate: ResolveCandidate) => void;
  notThis: () => void;
  retry: () => void;
  readLabel: (imageBase64: string) => void;
  setChips: (chips: InciChip[]) => void;
  cancelLabel: () => void;
  runLabel: (chips: InciChip[]) => void;
  reset: () => void;
}

export function useCheckFlow(api: CheckApi, engine: Engine, key: KeyProfile | null): CheckFlow {
  const [state, dispatch] = useReducer(checkReducer, { phase: 'idle' });
  const last = useRef<{ req: ResolveRequest; title: string | null; store: Store } | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const keyRef = useRef(key);
  keyRef.current = key;

  const resolve = useCallback(
    async (req: ResolveRequest, title: string | null, store: Store) => {
      last.current = { req, title, store };
      dispatch({ type: 'resolving', title, store });
      try {
        const res = await api.resolve(req);
        const step = stepFromResolve(res, engine, title);
        const k = keyRef.current;
        if (step.next === 'medicine') {
          dispatch({ type: 'resolved', resolve: res, step, verdict: evaluateTitleOnly(engine, k, step.title) });
        } else if (step.next === 'unknown') {
          dispatch({ type: 'resolved', resolve: res, step, verdict: evaluateTitleOnly(engine, k, res.extractedTitle ?? title) });
        } else {
          dispatch({ type: 'resolved', resolve: res, step });
        }
      } catch (e) {
        dispatch({ type: 'error', message: errorMessage(e), retry: 'start' });
      }
    },
    [api, engine],
  );

  const start = useCallback(
    (input: CheckInput) => {
      if (input.kind === 'image') {
        dispatch({ type: 'crop', image: { uri: input.uri, width: input.width, height: input.height, mimeType: input.mimeType } });
        return;
      }
      void resolve(toResolveRequest(input), input.parsed.title, input.parsed.store);
    },
    [resolve],
  );

  const sendCrop = useCallback(
    (imageBase64: string) => void resolve({ source: 'screenshot', imageBase64 }, null, 'other'),
    [resolve],
  );

  const confirm = useCallback(
    async (candidate: ResolveCandidate) => {
      dispatch({ type: 'choose', candidate });
      try {
        const { product } = await api.product(candidate.catalogId);
        dispatch({ type: 'product', product, verdict: evaluateProduct(engine, keyRef.current, product) });
      } catch (e) {
        dispatch({ type: 'error', message: errorMessage(e), retry: 'start' });
      }
    },
    [api, engine],
  );

  const notThis = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'confirm') return;
    if (s.mode === 'single' && s.candidates.length > 1) {
      dispatch({ type: 'not_this' });
      return;
    }
    const title = s.resolve.extractedTitle ?? last.current?.title ?? null;
    try {
      dispatch({ type: 'unknown', verdict: evaluateTitleOnly(engine, keyRef.current, title) });
    } catch (e) {
      dispatch({ type: 'error', message: errorMessage(e), retry: 'start' });
    }
  }, [engine]);

  const retry = useCallback(() => {
    if (last.current) void resolve(last.current.req, last.current.title, last.current.store);
  }, [resolve]);

  const readLabel = useCallback(
    async (imageBase64: string) => {
      dispatch({ type: 'label', label: { step: 'reading' } });
      try {
        const res = await api.labelOcr({ imageBase64, mediaType: 'image/jpeg' });
        dispatch({ type: 'label', label: { step: 'review', chips: chipsFromOcr(res.tokens), unreadable: res.unreadableRegions }, ledger: res.ledger });
      } catch (e) {
        dispatch({ type: 'label', label: { step: 'error', message: errorMessage(e) } });
      }
    },
    [api],
  );

  const setChips = useCallback((chips: InciChip[]) => {
    const s = stateRef.current;
    if (s.phase !== 'result' || s.result.label.step !== 'review') return;
    dispatch({ type: 'label', label: { ...s.result.label, chips } });
  }, []);

  const cancelLabel = useCallback(() => dispatch({ type: 'label', label: { step: 'none' } }), []);

  const runLabel = useCallback(
    (chips: InciChip[]) => {
      const s = stateRef.current;
      if (s.phase !== 'result') return;
      const inci = chipsToInci(chips);
      try {
        const verdict = evaluateLabel(engine, keyRef.current, inci, s.result.product, s.result.title);
        dispatch({ type: 'label_verdict', verdict, tokenCount: inci.length });
      } catch (e) {
        dispatch({ type: 'label', label: { step: 'error', message: errorMessage(e) } });
      }
    },
    [engine],
  );

  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  return { state, start, sendCrop, confirm, notThis, retry, readLabel, setChips, cancelLabel, runLabel, reset };
}
