import { describe, expect, it } from 'vitest';
import { applyReadingFilter, readingFilters, readingsIn } from './filters';

const line = 'Oiliness reading: High (whole face, scan 1 Nov) · Nose pore reading: High. Contains niacinamide, which our rule SUP-2 counts as a fit for oily-looking skin.';

describe('reading filters', () => {
  it('reads the reading names from a ranked reason line', () => {
    expect(readingsIn(line)).toEqual(['Oiliness', 'Nose pore']);
    expect(readingsIn('Has glycerin; nothing in our rules flags your readings.')).toEqual([]);
  });

  it('offers the most common readings as chips and only narrows the ranked list', () => {
    const matches = [
      { id: 'a', readings: ['Oiliness', 'Nose pore'] },
      { id: 'b', readings: ['Oiliness'] },
      { id: 'c', readings: [] },
    ];
    expect(readingFilters(matches).map((f) => f.label)).toEqual(['For your oiliness', 'For your nose pores']);
    expect(applyReadingFilter(matches, 'Nose pore').map((m) => m.id)).toEqual(['a']);
    expect(applyReadingFilter(matches, null).map((m) => m.id)).toEqual(['a', 'b', 'c']);
  });
});
