import { describe, expect, it } from 'vitest';
import { COPY, DEMO_KEY } from '@skinkey/contracts';
import { FACET_MAP, medicineGate, rank, verdict } from '@skinkey/rules';
import { storeLinks } from '../matches/links';
import { selectMatches } from '../matches/select';
import { PRODUCT, SCANNED_KEY } from './fixtures';
import { evaluateLabel, evaluateProduct, evaluateTitleOnly, stepFromResolve, type Engine } from './flow';
import { presentVerdict } from './present';
import { resolveResponse } from './fixtures';

const engine: Engine = { verdict, medicineGate };

describe('with the real @skinkey/rules engine', () => {
  it('sample-like product + Demo Key → CAUTION, label check first, reading split from fact', () => {
    const v = presentVerdict(evaluateProduct(engine, DEMO_KEY, PRODUCT), { key: DEMO_KEY, product: PRODUCT, catalogCount: 10 });
    expect(v.label).toBe('CAUTION');
    expect(v.subtitle).toBe(COPY.subtitle.CAUTION);
    expect(v.reasons[0]!.kindNote).toBe('Label check');
    expect(v.reasons[0]!.reading).toBe("Listing says 'fragrance-free'.");
    expect(v.reasons[0]!.fact.replace(/\u2060/g, '')).toMatch(/^Its ingredient list has Parfum \(rule LC-1a\)\.$/);
    const occ = v.reasons.find((r) => r.ruleTag.replace(/\u2060/g, '').startsWith('Rule OCC-2'))!;
    expect(occ.reading).toMatch(/^Oiliness reading: High \(whole face/);
    expect(occ.fact).toMatch(/^Contains .*isopropyl myristate/i);
    expect(v.provenanceLine).toMatch(/Demo reading/);
  });

  it('no Key + verified INCI → UNKNOWN for readings, not for ingredients', () => {
    const v = presentVerdict(evaluateProduct(engine, null, PRODUCT), { key: null, product: PRODUCT, catalogCount: 10 });
    expect(v.label).toBe('UNKNOWN');
    expect(v.unknownKind).toBe('readings');
  });

  it('name only → UNKNOWN with the fixed subtitle and the label-photo path', () => {
    const v = presentVerdict(evaluateTitleOnly(engine, SCANNED_KEY, 'Some Obscure Cream'), { key: SCANNED_KEY, product: null, catalogCount: 10 });
    expect(v.subtitle).toBe(COPY.subtitle.UNKNOWN);
    expect(v.unknownKind).toBe('ingredients');
  });

  it('label chips → verdict with label provenance', () => {
    const v = presentVerdict(
      evaluateLabel(engine, SCANNED_KEY, [{ token: 'Aqua', position: 1 }, { token: 'Isopropyl Myristate', position: 2 }], null, 'x'),
      { key: SCANNED_KEY, product: null, catalogCount: 10, labelTokenCount: 2 },
    );
    expect(v.label).toBe('CAUTION');
    expect(v.ledger[1]!.value).toBe(COPY.labelPhotoProvenance);
  });

  it('medicine title gates before SKU confirmation', () => {
    const res = resolveResponse({ extractedTitle: 'Adapalene Gel 0.1% w/w' });
    const step = stepFromResolve(res, engine, null);
    expect(step.next).toBe('medicine');
    const v = presentVerdict(evaluateTitleOnly(engine, SCANNED_KEY, 'Adapalene Gel 0.1% w/w'), { key: SCANNED_KEY, product: null, catalogCount: 1 });
    expect(v.subtitle).toBe(COPY.medicine('adapalene'));
    expect(v.showMatches).toBe(false);
  });

  it('better matches exclude CAUTION products and the Demo Key gets the Oily Skin facet', () => {
    const gentle = { ...PRODUCT, id: 'gentle', name: 'Gentle Gel', claims: [], inci: [{ token: 'Aqua', position: 1 }, { token: 'Glycerin', position: 2 }] };
    const out = selectMatches(rank, [PRODUCT, gentle], DEMO_KEY);
    expect(out.map((m) => m.productId)).toEqual(['gentle']);
    const links = storeLinks({ category: 'sunscreen', key: DEMO_KEY, facetMap: FACET_MAP, facetLabel: COPY.flipkartFacetLink });
    expect(links[0]!.label).toBe(COPY.flipkartFacetLink('Oily Skin'));
  });
});
