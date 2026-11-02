import { describe, expect, it } from 'vitest';
import { shortReason } from './select';

describe('shortReason', () => {
  it('keeps one line: the ingredient and the reading it fits', () => {
    const line =
      'Oiliness reading: High (whole face, scan 1 Nov) · Nose pore reading: High. Contains niacinamide, which our rule SUP-2 counts as a fit for oily-looking skin.';
    expect(shortReason(line)).toBe('Niacinamide · fits your oiliness reading');
  });

  it('drops a parenthetical and shouts', () => {
    expect(shortReason('Oiliness reading: High (whole face, sample reading). Contains niacinamide (vitamin B3), which our rule SUP-2 counts as a fit.')).toBe(
      'Niacinamide · fits your oiliness reading',
    );
    expect(shortReason('Oiliness reading: High (whole face, sample reading). Contains NIACINAMIDE, which our rule SUP-2 counts as a fit.')).toBe(
      'Niacinamide · fits your oiliness reading',
    );
  });

  it('falls back to the fact when no ingredient is named', () => {
    expect(shortReason('Moisture reading: Low (whole face, sample reading). No ingredient in our rules flags this.')).toBe(
      'No ingredient in our rules flags this.',
    );
  });
});
