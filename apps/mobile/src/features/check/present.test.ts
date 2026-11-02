import { describe, expect, it } from 'vitest';
import { COPY, DEMO_KEY } from '@skinkey/contracts';
import { CAUTION_VERDICT, FITS_VERDICT, LABEL_VERDICT, MEDICINE_VERDICT, PRODUCT, SCANNED_KEY, UNKNOWN_VERDICT } from './fixtures';
import { presentVerdict, reasonsHeading } from './present';

const ctx = { key: SCANNED_KEY, product: PRODUCT, catalogCount: 42 };

describe('presentVerdict', () => {
  it('CAUTION: fixed subtitle, strict label check first, info label check last', () => {
    const v = presentVerdict(CAUTION_VERDICT, ctx);
    expect(v.labelText).toBe('CAUTION');
    expect(v.subtitle).toBe(COPY.subtitle.CAUTION);
    expect(v.headA11y).toBe(`Caution. ${COPY.subtitle.CAUTION}`);
    expect(v.reasons.map((r) => [r.index, r.kindNote])).toEqual([
      ['01', 'Label check'],
      ['02', null],
      ['03', 'Label check · for information'],
    ]);
    expect(v.reasons[0]!.reading).toBe("Listing says 'fragrance-free'.");
    expect(v.reasons[0]!.fact).toBe('Its ingredient list has Parfum (rule LC-1a).');
    expect(v.reasons[1]!.reading).toBe('Oiliness reading: High (whole face, scan 1 Nov).');
    expect(v.reasons[1]!.chip).toEqual({ concern: 'oiliness', level: 'High', selfReported: false });
    expect(v.reasons[1]!.a11y).toMatch(/^Reason 2 of 3\. Oiliness reading: High/);
    expect(v.showMatches).toBe(true);
  });

  it('carries a provenance line, ledger rows and the fixed lines', () => {
    const v = presentVerdict(CAUTION_VERDICT, ctx);
    expect(v.provenanceLine).toBe('Measured by YouCam Skin Analysis HD, 1 Nov · photo deleted · rules va1b2c3d');
    expect(v.ledger.map((r) => r.key)).toEqual(['SKIN', 'PRODUCT', 'RULES', 'LIMITS']);
    expect(v.ledger[1]!.links).toEqual([{ label: 'Ingredient list source', url: PRODUCT.source_url }]);
    expect(v.ledger[2]!.sub).toBe('LC-1a (R) · OCC-2 (L) · LC-1b (R)');
    expect(v.ledger[2]!.links[0]).toEqual({ label: 'OCC-2 source', url: 'https://example.org/fulton-1989' });
    expect(v.ledger[3]!.value).toBe(COPY.accuracyNote);
    expect(v.fixedLines).toEqual([COPY.footer, COPY.notAffiliated]);
  });

  it('labels the catalogue tier honestly: human tick vs brand-page check vs untiered', () => {
    const sub = (product: typeof PRODUCT) => presentVerdict(CAUTION_VERDICT, { ...ctx, product }).ledger[1]!;
    expect(sub({ ...PRODUCT, verified_by: 'human' }).sub).toBe(COPY.catalogHumanChecked);
    const checked = sub({ ...PRODUCT, verified_by: 'brand_page_check' });
    expect(checked.value).toBe(COPY.catalogSource);
    expect(checked.sub).toBe(COPY.catalogBrandPageChecked);
    expect(checked.sub).not.toMatch(/human|by hand|person/i);
    expect(sub(PRODUCT).sub).not.toMatch(/human|by hand|person|checked/i);
  });

  it('uses the rules engine provenance line when one is given', () => {
    const v = presentVerdict({ ...CAUTION_VERDICT, provenance: { ...CAUTION_VERDICT.provenance, line: 'From rules' } }, ctx);
    expect(v.provenanceLine).toBe('From rules');
  });

  it('FITS with no flags says so', () => {
    const v = presentVerdict(FITS_VERDICT, ctx);
    expect(v.subtitle).toBe(COPY.subtitle.FITS);
    expect(v.reasons).toEqual([]);
    expect(v.emptyReasonsNote).toBe(COPY.fitsNoFlags);
  });

  it('UNKNOWN: fixed subtitle, product row shows the catalogue count, no reasons heading', () => {
    const v = presentVerdict(UNKNOWN_VERDICT, { key: SCANNED_KEY, product: null, catalogCount: 42 });
    expect(v.subtitle).toBe(COPY.subtitle.UNKNOWN);
    expect(v.showReasons).toBe(false);
    expect(v.ledger[1]).toMatchObject({ value: 'Product name only', sub: COPY.catalogCount(42) });
  });

  it('MEDICINE: one fixed line, no label, reasons, ledger or matches', () => {
    const v = presentVerdict(MEDICINE_VERDICT, ctx);
    expect(v.labelText).toBeNull();
    expect(v.subtitle).toBe(COPY.medicine('adapalene'));
    expect(v.reasons).toEqual([]);
    expect(v.ledger).toEqual([]);
    expect(v.showMatches).toBe(false);
  });

  it('label photo verdicts say the label was confirmed by the user', () => {
    const v = presentVerdict(LABEL_VERDICT, { key: SCANNED_KEY, product: null, catalogCount: 42, labelTokenCount: 12 });
    expect(v.ledger[1]).toMatchObject({ value: COPY.labelPhotoProvenance, sub: '12 ingredients' });
    expect(v.provenanceLine).toContain('Photo of label, confirmed by you');
  });

  it('labels the Demo Key and never dates it as a scan', () => {
    const v = presentVerdict(CAUTION_VERDICT, { key: DEMO_KEY, product: PRODUCT, catalogCount: 1 });
    expect(v.ledger[0]!.value).toMatch(/^Demo Key/);
    expect(v.reasons[1]!.reading).toBe('Oiliness reading: High (whole face).');
  });

  it('heading pluralises', () => {
    expect(reasonsHeading(1)).toBe('Why · 1 reason');
    expect(reasonsHeading(3)).toBe('Why · 3 reasons');
  });
});

describe('litZones', () => {
  it('lights the zone of the first reading-based reason', async () => {
    const { litZones } = await import('./present');
    expect(litZones(CAUTION_VERDICT)).toEqual(['forehead', 'nose', 'leftCheek', 'rightCheek', 'chin']);
    const nose = { ...CAUTION_VERDICT, reasons: [{ ...CAUTION_VERDICT.reasons[0]!, reading: { on: 'band' as const, concern: 'pore' as const, level: 'High' as const, region: 'nose', selfReported: false } }] };
    expect(litZones(nose)).toEqual(['nose']);
    expect(litZones(FITS_VERDICT)).toEqual([]);
  });
});
