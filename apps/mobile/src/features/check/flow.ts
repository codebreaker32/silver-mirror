import type {
  CatalogProduct,
  HowThisWasMade,
  InciToken,
  KeyProfile,
  ResolveCandidate,
  ResolveResponse,
  Store,
  TryonMode,
  Verdict,
} from '@skinkey/contracts';
import { COPY } from '@skinkey/contracts';
import type { MedicineGateResult, VerdictInput } from '@skinkey/rules';
import type { InciChip } from './chips';

/** The deterministic engine from @skinkey/rules. Claude never reaches it (spec §4). */
export interface Engine {
  verdict(input: VerdictInput): Verdict;
  medicineGate(inci: readonly InciToken[] | null, title?: string): MedicineGateResult;
}

export interface ImageInput {
  uri: string;
  width: number | null;
  height: number | null;
  mimeType: string;
}

export type LabelState =
  | { step: 'none' }
  | { step: 'reading' }
  | { step: 'review'; chips: InciChip[]; unreadable: number }
  | { step: 'error'; message: string };

export interface CheckResult {
  verdict: Verdict;
  product: CatalogProduct | null;
  title: string | null;
  store: Store;
  catalogCount: number | null;
  ledgers: HowThisWasMade[];
  label: LabelState;
  labelTokenCount?: number;
  labelInci?: InciToken[];
  /** True once a label-photo verdict replaced an UNKNOWN (the card "morphs"). */
  morphed: boolean;
}

export type CheckState =
  | { phase: 'idle' }
  | { phase: 'crop'; image: ImageInput }
  | { phase: 'resolving'; title: string | null; store: Store }
  | { phase: 'confirm'; resolve: ResolveResponse; candidates: ResolveCandidate[]; mode: 'single' | 'choose' }
  | { phase: 'loading'; resolve: ResolveResponse; candidate: ResolveCandidate }
  | { phase: 'not_skincare'; resolve: ResolveResponse }
  | { phase: 'result'; result: CheckResult; resolve: ResolveResponse | null }
  | { phase: 'error'; message: string; retry: 'start' | 'product' };

export type ResolveStep =
  | { next: 'medicine'; title: string | null }
  | { next: 'confirm'; candidates: ResolveCandidate[]; mode: 'single' | 'choose' }
  | { next: 'unknown' }
  | { next: 'not_skincare' };

export type CheckAction =
  | { type: 'reset' }
  | { type: 'crop'; image: ImageInput }
  | { type: 'resolving'; title: string | null; store: Store }
  | { type: 'resolved'; resolve: ResolveResponse; step: ResolveStep; verdict?: Verdict }
  | { type: 'not_this' }
  | { type: 'choose'; candidate: ResolveCandidate }
  | { type: 'product'; product: CatalogProduct; verdict: Verdict }
  /** A catalogue product opened by id (Shop, Home picks, Routine): no resolve and no confirm sheet. */
  | { type: 'catalog'; product: CatalogProduct; verdict: Verdict }
  | { type: 'unknown'; verdict: Verdict }
  | { type: 'label'; label: LabelState; ledger?: HowThisWasMade }
  | { type: 'label_verdict'; verdict: Verdict; inci: InciToken[] }
  | { type: 'reverdict'; verdict: Verdict }
  | { type: 'error'; message: string; retry: 'start' | 'product' };

export function stepFromResolve(res: ResolveResponse, engine: Engine, titleHint: string | null): ResolveStep {
  const title = res.extractedTitle ?? titleHint;
  if (title && engine.medicineGate(null, title).gated) return { next: 'medicine', title };
  if (res.outcome === 'not_skincare') return { next: 'not_skincare' };
  const candidates = res.candidates.slice(0, 3);
  if (res.outcome === 'match' && candidates[0]) {
    return { next: 'confirm', candidates, mode: 'single' };
  }
  if (candidates.length) return { next: 'confirm', candidates, mode: 'choose' };
  return { next: 'unknown' };
}

const usableInci = (p: CatalogProduct) => p.verified && p.status === 'verified' && p.inci.length > 0;

export const productTitle = (p: Pick<CatalogProduct, 'brand' | 'name'>) =>
  p.name.toLowerCase().startsWith(p.brand.toLowerCase()) ? p.name : `${p.brand} ${p.name}`;

export function evaluateProduct(engine: Engine, key: KeyProfile | null, product: CatalogProduct): Verdict {
  const ok = usableInci(product);
  return engine.verdict({
    key,
    inci: ok ? product.inci : null,
    inciSource: ok ? 'catalog_verified' : null,
    inciSourceUrl: ok ? product.source_url : undefined,
    claims: ok ? product.claims : [],
    title: productTitle(product),
  });
}

export function evaluateTitleOnly(engine: Engine, key: KeyProfile | null, title: string | null): Verdict {
  return engine.verdict({ key, inci: null, inciSource: null, claims: [], title: title ?? undefined });
}

export function evaluateLabel(
  engine: Engine,
  key: KeyProfile | null,
  inci: readonly InciToken[],
  product: CatalogProduct | null,
  title: string | null,
): Verdict {
  return engine.verdict({
    key,
    inci,
    inciSource: 'label_photo_confirmed',
    claims: product && usableInci(product) ? product.claims : [],
    title: title ?? undefined,
  });
}

/** Re-run the same inputs when the Key changes (for example the user switches to the Demo reading). */
export function reevaluate(engine: Engine, key: KeyProfile | null, r: CheckResult): Verdict {
  if (r.verdict.label === 'MEDICINE') return r.verdict;
  if (r.labelInci) return evaluateLabel(engine, key, r.labelInci, r.product, r.title);
  if (r.product) return evaluateProduct(engine, key, r.product);
  return evaluateTitleOnly(engine, key, r.title);
}

export function tryonEntry(product: CatalogProduct | null): { mode: TryonMode; label: string } | null {
  if (!product?.tinted) return null;
  // The Worker can only render shades with a colour on file; without one, the try-on would be rejected.
  const coloured = product.shades.filter((s) => s.hex).length;
  if (coloured === 0) return null;
  const shadeClaim = product.claims.some((c) => c.type === 'one_shade' || c.type === 'universal_tint');
  const mode: TryonMode = coloured >= 2 ? 'multi' : 'single';
  // Only quote the listing when it actually makes the one-shade claim; a single colour on file is not a claim.
  if (shadeClaim) return { mode, label: COPY.tryonSingleClaim };
  return { mode, label: mode === 'single' ? COPY.tryonSingle : COPY.tryonMulti };
}

export const productLine = (p: { brand: string; name: string; size?: string | undefined }) =>
  [p.brand, p.name.replace(new RegExp(`^${p.brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`, 'i'), ''), p.size]
    .filter(Boolean)
    .join(' · ');

function result(
  verdict: Verdict,
  resolve: ResolveResponse | null,
  extra: Partial<CheckResult> & { title: string | null; store: Store },
): CheckState {
  return {
    phase: 'result',
    resolve,
    result: {
      verdict,
      product: null,
      catalogCount: resolve?.catalogCount ?? null,
      ledgers: resolve ? [resolve.ledger] : [],
      label: { step: 'none' },
      morphed: false,
      ...extra,
    },
  };
}

export function checkReducer(state: CheckState, action: CheckAction): CheckState {
  switch (action.type) {
    case 'reset':
      return { phase: 'idle' };
    case 'crop':
      return { phase: 'crop', image: action.image };
    case 'resolving':
      return { phase: 'resolving', title: action.title, store: action.store };
    case 'resolved': {
      const { resolve, step } = action;
      if (step.next === 'medicine' && action.verdict) {
        return result(action.verdict, resolve, { title: step.title, store: resolve.store });
      }
      if (step.next === 'confirm') return { phase: 'confirm', resolve, candidates: step.candidates, mode: step.mode };
      if (step.next === 'not_skincare') return { phase: 'not_skincare', resolve };
      if (action.verdict) return result(action.verdict, resolve, { title: resolve.extractedTitle, store: resolve.store });
      return state;
    }
    case 'not_this': {
      if (state.phase !== 'confirm') return state;
      if (state.mode === 'single' && state.candidates.length > 1) {
        return { ...state, candidates: state.candidates.slice(1), mode: 'choose' };
      }
      return state;
    }
    case 'choose': {
      if (state.phase !== 'confirm') return state;
      return { phase: 'loading', resolve: state.resolve, candidate: action.candidate };
    }
    case 'product': {
      if (state.phase !== 'loading') return state;
      return result(action.verdict, state.resolve, {
        product: action.product,
        title: productTitle(action.product),
        store: state.resolve.store,
      });
    }
    case 'catalog': {
      if (state.phase !== 'resolving') return state;
      return result(action.verdict, null, { product: action.product, title: productTitle(action.product), store: 'other' });
    }
    case 'unknown': {
      const resolve = state.phase === 'confirm' || state.phase === 'loading' || state.phase === 'not_skincare' ? state.resolve : null;
      const product = state.phase === 'result' ? state.result.product : null;
      return result(action.verdict, resolve, {
        product,
        title: resolve?.extractedTitle ?? null,
        store: resolve?.store ?? 'other',
      });
    }
    case 'label': {
      if (state.phase !== 'result') return state;
      const ledgers = action.ledger ? [...state.result.ledgers, action.ledger] : state.result.ledgers;
      return { ...state, result: { ...state.result, label: action.label, ledgers } };
    }
    case 'label_verdict': {
      if (state.phase !== 'result') return state;
      return {
        ...state,
        result: {
          ...state.result,
          verdict: action.verdict,
          label: { step: 'none' },
          labelInci: action.inci,
          labelTokenCount: action.inci.length,
          morphed: true,
        },
      };
    }
    case 'reverdict':
      return state.phase === 'result' ? { ...state, result: { ...state.result, verdict: action.verdict } } : state;
    case 'error':
      return { phase: 'error', message: action.message, retry: action.retry };
  }
}
