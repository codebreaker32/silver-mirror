import { describe, expect, it } from 'vitest';
import { MEDICINE_TOKENS, medicineGate, toInciTokens } from '../src';
import fixtures from './fixtures/medicine.json';

describe('medicine gate fixtures', () => {
  it.each(fixtures.gated.map((f) => [f.why, f] as const))('gates: %s', (_, f) => {
    const r = medicineGate(f.inci.length ? toInciTokens(f.inci) : null, f.title);
    expect(r).toMatchObject({ gated: true, token: f.token });
  });

  it.each(fixtures.false_positives.map((f) => [f.why, f] as const))('reviewed false positive stays open: %s', (_, f) => {
    expect(medicineGate(toInciTokens(f.inci), f.title)).toEqual({ gated: false });
  });

  it('covers every token the spec names', () => {
    for (const t of ['adapalene', 'tretinoin', 'benzoyl peroxide', 'clindamycin', 'ketoconazole', 'hydroquinone']) {
      expect(MEDICINE_TOKENS).toContain(t);
    }
  });

  it('INCI hits are reported before title hits', () => {
    expect(medicineGate(toInciTokens(['Aqua', 'Adapalene']), 'Ketoconazole cream')).toMatchObject({ token: 'adapalene', via: 'inci' });
  });

  it('no input means no gate', () => {
    expect(medicineGate(null)).toEqual({ gated: false });
  });
});
