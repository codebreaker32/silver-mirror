import { describe, expect, it } from 'vitest';
import { ROUTINE_STEPS, fillRoutine, parseChoices, setChoice, type RoutineProduct, type StepCategory } from './model';

const prod = (id: string, category: StepCategory, brand = 'Brand'): RoutineProduct => ({
  productId: id,
  brand,
  name: `Name ${id}`,
  category,
  query: `${brand} Name ${id}`,
  reason: 'Niacinamide · fits your oiliness reading',
});

describe('routine model', () => {
  it('has no toner step and drops sunscreen at night', () => {
    expect(ROUTINE_STEPS.am.map((s) => s.category)).toEqual(['cleanser', 'serum', 'moisturiser', 'sunscreen']);
    expect(ROUTINE_STEPS.pm.map((s) => s.category)).toEqual(['cleanser', 'serum', 'moisturiser']);
  });

  it('keeps a stored choice that still fits, else a saved product, else the first fit', () => {
    const fitting = { cleanser: [prod('c1', 'cleanser'), prod('c2', 'cleanser')], serum: [prod('s1', 'serum'), prod('s2', 'serum')] };
    const choices = setChoice(parseChoices(null), 'am', 'cleanser', 'c2');
    const steps = fillRoutine('am', fitting, choices, new Set(['s2']));
    expect(steps[0]?.product?.productId).toBe('c2');
    expect(steps[0]?.alternatives.map((p) => p.productId)).toEqual(['c1']);
    expect(steps[1]?.product?.productId).toBe('s2');
    expect(steps[2]?.product).toBeNull();
  });

  it('ignores a stored choice that no longer fits the reading', () => {
    const choices = setChoice(parseChoices(null), 'pm', 'cleanser', 'gone');
    expect(fillRoutine('pm', { cleanser: [prod('c1', 'cleanser')] }, choices)[0]?.product?.productId).toBe('c1');
  });

  it('prefers a brand not already in the routine when another fit exists', () => {
    const fitting = {
      cleanser: [prod('c1', 'cleanser', 'Beardo'), prod('c2', 'cleanser', 'Minimalist')],
      serum: [prod('s1', 'serum', 'Beardo'), prod('s2', 'serum', 'Minimalist'), prod('s3', 'serum', 'Plum')],
      moisturiser: [prod('m1', 'moisturiser', 'Beardo')],
    };
    const steps = fillRoutine('pm', fitting, parseChoices(null));
    expect(steps.map((s) => s.product?.productId)).toEqual(['c1', 's2', 'm1']);
    expect(steps[1]?.alternatives.map((p) => p.productId)).toEqual(['s1', 's3']);
  });

  it('keeps stored and saved picks even when they repeat a brand, and steers defaults around them', () => {
    const fitting = {
      cleanser: [prod('c1', 'cleanser', 'Beardo'), prod('c2', 'cleanser', 'Plum')],
      serum: [prod('s1', 'serum', 'Plum'), prod('s2', 'serum', 'Beardo')],
      moisturiser: [prod('m1', 'moisturiser', 'Beardo'), prod('m2', 'moisturiser', 'Plum'), prod('m3', 'moisturiser', 'Dot & Key')],
    };
    const choices = setChoice(parseChoices(null), 'pm', 'serum', 's2');
    const steps = fillRoutine('pm', fitting, choices, new Set(['c1']));
    expect(steps.map((s) => s.product?.productId)).toEqual(['c1', 's2', 'm2']);
  });

  it('parses only known categories and string ids', () => {
    expect(parseChoices('{"am":{"cleanser":"a","toner":"b","serum":3},"pm":null}')).toEqual({ am: { cleanser: 'a' }, pm: {} });
    expect(parseChoices('not json')).toEqual({ am: {}, pm: {} });
  });
});
