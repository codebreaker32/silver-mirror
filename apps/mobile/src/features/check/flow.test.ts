import { describe, expect, it, vi } from 'vitest';
import { COPY } from '@skinkey/contracts';
import { checkReducer, evaluateLabel, evaluateProduct, productLine, stepFromResolve, tryonEntry, type CheckState, type Engine } from './flow';
import { CAUTION_VERDICT, MEDICINE_VERDICT, PRODUCT, SCANNED_KEY, TINTED, UNKNOWN_VERDICT, resolveResponse, summary } from './fixtures';

const engine = (gated = false): Engine => ({
  verdict: vi.fn(() => CAUTION_VERDICT),
  medicineGate: vi.fn(() => (gated ? { gated: true, token: 'adapalene' } : { gated: false })),
});

describe('stepFromResolve', () => {
  it('a confident catalogue match asks Yes / Not this', () => {
    expect(stepFromResolve(resolveResponse(), engine(), null)).toMatchObject({ next: 'confirm', mode: 'single' });
  });

  it('Claude candidates become a choice of up to 3', () => {
    const res = resolveResponse({ outcome: 'candidates', resolver: 'claude' });
    expect(stepFromResolve(res, engine(), null)).toMatchObject({ next: 'confirm', mode: 'choose' });
  });

  it('nothing above threshold goes to UNKNOWN', () => {
    expect(stepFromResolve(resolveResponse({ outcome: 'unknown', candidates: [] }), engine(), null)).toEqual({ next: 'unknown' });
  });

  it('a medicine token in the title gates before any SKU step', () => {
    const res = resolveResponse({ extractedTitle: 'Adapalene Gel 0.1%' });
    expect(stepFromResolve(res, engine(true), null)).toEqual({ next: 'medicine', title: 'Adapalene Gel 0.1%' });
  });

  it('not skincare is its own state', () => {
    expect(stepFromResolve(resolveResponse({ outcome: 'not_skincare', candidates: [] }), engine(), null)).toEqual({ next: 'not_skincare' });
  });
});

describe('evaluate*', () => {
  it('passes verified catalogue INCI and claims to the engine', () => {
    const e = engine();
    evaluateProduct(e, SCANNED_KEY, PRODUCT);
    expect(e.verdict).toHaveBeenCalledWith(
      expect.objectContaining({ inci: PRODUCT.inci, inciSource: 'catalog_verified', claims: PRODUCT.claims, key: SCANNED_KEY }),
    );
  });

  it('unverified rows reach the engine with no INCI (they show as UNKNOWN)', () => {
    const e = engine();
    evaluateProduct(e, SCANNED_KEY, { ...PRODUCT, verified: false, status: 'unverified' });
    expect(e.verdict).toHaveBeenCalledWith(expect.objectContaining({ inci: null, inciSource: null, claims: [] }));
  });

  it('label chips are marked as confirmed by the user', () => {
    const e = engine();
    evaluateLabel(e, SCANNED_KEY, [{ token: 'Aqua', position: 1 }], null, 'x');
    expect(e.verdict).toHaveBeenCalledWith(expect.objectContaining({ inciSource: 'label_photo_confirmed', claims: [] }));
  });
});

describe('checkReducer', () => {
  const confirm = (): CheckState => checkReducer({ phase: 'idle' }, { type: 'resolved', resolve: resolveResponse(), step: stepFromResolve(resolveResponse(), engine(), null) });

  it('no verdict before Yes', () => {
    const s = confirm();
    expect(s.phase).toBe('confirm');
    const loading = checkReducer(s, { type: 'choose', candidate: resolveResponse().candidates[0]! });
    expect(loading.phase).toBe('loading');
    const done = checkReducer(loading, { type: 'product', product: PRODUCT, verdict: CAUTION_VERDICT });
    expect(done.phase === 'result' && done.result).toMatchObject({ verdict: CAUTION_VERDICT, product: PRODUCT, catalogCount: 42 });
  });

  it('Not this on a single match reveals the other candidates', () => {
    const other = { catalogId: TINTED.id, confidence: 0.6, why: 'x', product: summary(TINTED) };
    const res = resolveResponse({ candidates: [resolveResponse().candidates[0]!, other] });
    const s = checkReducer({ phase: 'idle' }, { type: 'resolved', resolve: res, step: stepFromResolve(res, engine(), null) });
    const next = checkReducer(s, { type: 'not_this' });
    expect(next).toMatchObject({ phase: 'confirm', mode: 'choose', candidates: [other] });
  });

  it('medicine skips confirmation', () => {
    const res = resolveResponse({ extractedTitle: 'Adapalene Gel' });
    const s = checkReducer({ phase: 'idle' }, { type: 'resolved', resolve: res, step: { next: 'medicine', title: 'Adapalene Gel' }, verdict: MEDICINE_VERDICT });
    expect(s.phase === 'result' && s.result.verdict.label).toBe('MEDICINE');
  });

  it('UNKNOWN → label photo → chips → verdict morph, ledgers accumulate', () => {
    let s = checkReducer(confirm(), { type: 'unknown', verdict: UNKNOWN_VERDICT });
    expect(s.phase === 'result' && s.result.verdict.label).toBe('UNKNOWN');
    s = checkReducer(s, { type: 'label', label: { step: 'reading' } });
    s = checkReducer(s, { type: 'label', label: { step: 'review', chips: [], unreadable: 0 }, ledger: resolveResponse().ledger });
    s = checkReducer(s, { type: 'label_verdict', verdict: CAUTION_VERDICT, inci: [{ token: 'Aqua', position: 1 }, { token: 'Parfum', position: 2 }, { token: 'Glycerin', position: 3 }, { token: 'Niacinamide', position: 4 }] });
    expect(s.phase === 'result' && s.result).toMatchObject({ morphed: true, labelTokenCount: 4, label: { step: 'none' } });
    expect(s.phase === 'result' && s.result.ledgers).toHaveLength(2);
  });
});

describe('helpers', () => {
  it('tinted products get the try-on entry with the fixed copy', () => {
    expect(tryonEntry(PRODUCT)).toBeNull();
    expect(tryonEntry(TINTED)).toEqual({ mode: 'multi', label: COPY.tryonMulti });
    expect(tryonEntry({ ...TINTED, claims: [{ type: 'universal_tint' }] })?.label).toBe(COPY.tryonSingleClaim);
    expect(tryonEntry({ ...TINTED, shades: [{ name: 'Only', hex: '#C8A27E' }] })).toEqual({ mode: 'single', label: COPY.tryonSingle });
    expect(tryonEntry({ ...TINTED, shades: [{ name: 'Only', hex: '#C8A27E' }], claims: [{ type: 'one_shade' }] })).toEqual({ mode: 'single', label: COPY.tryonSingleClaim });
    // No colour on file → no try-on button (the Worker would reject it).
    expect(tryonEntry({ ...TINTED, shades: [{ name: 'Only' }] })).toBeNull();
    expect(tryonEntry({ ...TINTED, shades: [] })).toBeNull();
  });

  it('productLine reads brand · name · size', () => {
    expect(productLine(PRODUCT)).toBe('Garnier · Super UV Invisible Serum Sunscreen · 30 ml');
    expect(productLine({ brand: 'Plum', name: 'Plum Green Tea Gel' })).toBe('Plum · Green Tea Gel');
  });
});

describe('reevaluate', () => {
  it('re-runs the label chips, then the product, then the title', async () => {
    const { reevaluate } = await import('./flow');
    const e = engine();
    const base = { verdict: UNKNOWN_VERDICT, product: null, title: 'x', store: 'other' as const, catalogCount: 1, ledgers: [], label: { step: 'none' as const }, morphed: false };
    reevaluate(e, SCANNED_KEY, { ...base, labelInci: [{ token: 'Aqua', position: 1 }] });
    expect(e.verdict).toHaveBeenLastCalledWith(expect.objectContaining({ inciSource: 'label_photo_confirmed' }));
    reevaluate(e, SCANNED_KEY, { ...base, product: PRODUCT });
    expect(e.verdict).toHaveBeenLastCalledWith(expect.objectContaining({ inciSource: 'catalog_verified' }));
    expect(reevaluate(e, SCANNED_KEY, { ...base, verdict: MEDICINE_VERDICT })).toBe(MEDICINE_VERDICT);
  });
});
