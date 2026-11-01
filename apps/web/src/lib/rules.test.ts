import { RULES } from '@skinkey/rules';
import { describe, expect, it } from 'vitest';
import { bundledRules, lookupIngredient } from './rules';

describe.skipIf(RULES.length === 0)('ingredient lookup on the landing page', () => {
  it('finds the occlusive rule for isopropyl myristate under oily profiles only', () => {
    const r = lookupIngredient('Isopropyl Myristate');
    const occ = r?.hits.find((h) => h.ruleId === 'OCC-2');
    expect(occ).toBeDefined();
    expect(occ!.profiles).toContain('Oily');
    expect(occ!.profiles).not.toContain('Dry');
  });

  it('stops at the medicine gate', () => {
    expect(lookupIngredient('Adapalene')?.medicine).toBeTruthy();
  });

  it('returns nothing for an empty query', () => {
    expect(lookupIngredient('  ')).toBeNull();
  });

  it('exposes the bundled rule set with a hash', () => {
    const data = bundledRules();
    expect(data?.rules.length).toBe(RULES.length);
    expect(data?.hash).toMatch(/^[0-9a-f]+$/);
  });
});
