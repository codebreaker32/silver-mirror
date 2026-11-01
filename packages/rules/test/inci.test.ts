import { describe, expect, it } from 'vitest';
import { inciKey, inciVariants, matchesInci, normaliseInci, parseInciList, RULES, toInciTokens } from '../src';

describe('normaliseInci', () => {
  it.each([
    ['Aqua (Water)', 'Aqua'],
    ['Water', 'Aqua'],
    ['WATER/AQUA/EAU', 'Aqua'],
    ['Fragrance (Parfum)', 'Parfum'],
    ['PARFUM / FRAGRANCE', 'Parfum'],
    ['Perfume', 'Parfum'],
    ['Mineral Oil', 'Paraffinum Liquidum'],
    ['Liquid Paraffin', 'Paraffinum Liquidum'],
    ['Microcrystalline Wax', 'Cera Microcristallina'],
    ['glycerine', 'Glycerin'],
    ['Ethanol', 'Alcohol'],
    ['ALCOHOL DENAT', 'Alcohol Denat.'],
    ['Denatured Alcohol', 'Alcohol Denat.'],
    ['Ceramide 3', 'Ceramide NP'],
    ['Nicotinamide', 'Niacinamide'],
    ['Vitamin E (Tocopheryl Acetate)', 'Tocopheryl Acetate'],
    ['Sodium Laureth Sulphate (Sles)', 'Sodium Laureth Sulfate'],
    ['Retinoic Acid', 'Tretinoin'],
    ['Camellia Sinensis (Green Tea) Leaf Extract', 'Camellia Sinensis Leaf Extract'],
  ])('%s → %s', (raw, expected) => {
    expect(normaliseInci(raw)).toBe(expected);
  });

  it('folds case, footnote marks, dashes and percentages', () => {
    expect(inciKey('ISOPROPYL MYRISTATE*')).toBe(inciKey('Isopropyl Myristate'));
    expect(inciKey('Niacinamide 10%')).toBe('niacinamide');
    expect(inciKey('C12–15 Alkyl Benzoate')).toBe('c12-15 alkyl benzoate');
    expect(inciKey('S.D. Alcohol 40-B')).toBe('sd alcohol 40-b');
  });

  it('keeps unknown names readable', () => {
    expect(normaliseInci('  Sodium   Polyacryloyldimethyl Taurate ')).toBe('Sodium Polyacryloyldimethyl Taurate');
  });

  it('only splits slashes when every part is a known synonym', () => {
    expect(inciVariants('Caprylic/Capric Triglyceride')).not.toContain('capric triglyceride');
    expect(inciVariants('Castor Oil/IPDI Copolymer')).not.toContain('castor oil');
    expect(inciVariants('Aqua/Water')).toContain('aqua');
  });
});

describe('parseInciList', () => {
  it('splits on top-level commas only and numbers positions', () => {
    const t = parseInciList('Ingredients: Aqua (Water, Eau), Glycerin, Cetearyl Alcohol (and) Ceteareth-20, Parfum.');
    expect(t.map((x) => x.token)).toEqual(['Aqua (Water, Eau)', 'Glycerin', 'Cetearyl Alcohol (and) Ceteareth-20', 'Parfum']);
    expect(t.map((x) => x.position)).toEqual([1, 2, 3, 4]);
  });

  it('handles newlines, semicolons, bullets and "may contain"', () => {
    const t = parseInciList('Aqua\nGlycerin; Niacinamide • Phenoxyethanol, May contain: CI 77891');
    expect(t.map((x) => x.token)).toEqual(['Aqua', 'Glycerin', 'Niacinamide', 'Phenoxyethanol', 'CI 77891']);
  });

  it('keeps the dot in Alcohol Denat. and drops empty pieces', () => {
    expect(parseInciList('Aqua, , Alcohol Denat., Glycerin.').map((x) => x.token)).toEqual(['Aqua', 'Alcohol Denat.', 'Glycerin']);
  });

  it('toInciTokens wraps catalogue strings', () => {
    expect(toInciTokens(['Aqua', ' Glycerin '])).toEqual([
      { token: 'Aqua', position: 1 },
      { token: 'Glycerin', position: 2 },
    ]);
  });
});

const rule = (id: string) => RULES.find((r) => r.ruleId === id)!.inciSet;

describe('false-positive guards', () => {
  const alcohol = rule('LC-2');
  const oil = rule('LC-3');

  it.each(['Benzyl Alcohol', 'Cetearyl Alcohol', 'Cetyl Alcohol', 'Stearyl Alcohol', 'Behenyl Alcohol', 'Myristyl Alcohol', 'Lanolin Alcohol', 'Phenethyl Alcohol', 'C12-15 Alcohols', 'Cetostearyl Alcohol'])(
    '%s is not flagged as alcohol (LC-2 / ALC-1)',
    (t) => {
      expect(matchesInci(t, alcohol)).toBe(false);
      expect(matchesInci(t, rule('ALC-1'))).toBe(false);
    },
  );

  it.each(['Alcohol', 'ALCOHOL', 'Alcohol Denat.', 'alcohol denat', 'SD Alcohol 40-B', 'S.D. Alcohol 39-C', 'Ethanol', 'Ethyl Alcohol', 'Denatured Alcohol'])('%s is flagged as alcohol', (t) => {
    expect(matchesInci(t, alcohol)).toBe(true);
  });

  it.each([
    'PEG-40 Hydrogenated Castor Oil',
    'PEG-60 Hydrogenated Castor Oil',
    'PEG-35 Castor Oil',
    'PPG-15 Stearyl Ether',
    'Hydrogenated Castor Oil',
    'Polyglyceryl-4 Oleate',
    'Melaleuca Alternifolia (Tea Tree) Leaf Oil',
    'Lavandula Angustifolia (Lavender) Oil',
    'Citrus Aurantium Dulcis (Orange) Peel Oil',
    'Tea Tree Oil',
    'Squalane',
    'Caprylic/Capric Triglyceride',
  ])('%s is not flagged as oil (LC-3)', (t) => {
    expect(matchesInci(t, oil)).toBe(false);
  });

  it.each(['Simmondsia Chinensis (Jojoba) Seed Oil', 'Mineral Oil', 'Paraffinum Liquidum', 'Ricinus Communis (Castor) Seed Oil', 'Castor Oil', 'Argania Spinosa Kernel Oil', 'Rosa Canina Fruit Oil'])(
    '%s is flagged as oil (LC-3)',
    (t) => {
      expect(matchesInci(t, oil)).toBe(true);
    },
  );

  it('essential oils land in LC-1b, not LC-3', () => {
    expect(matchesInci('Melaleuca Alternifolia (Tea Tree) Leaf Oil', rule('LC-1b'))).toBe(true);
    expect(matchesInci('Simmondsia Chinensis (Jojoba) Seed Oil', rule('LC-1b'))).toBe(false);
  });

  it('Benzyl Alcohol is not counted as a fragrance ingredient', () => {
    expect(matchesInci('Benzyl Alcohol', rule('LC-1b'))).toBe(false);
    expect(matchesInci('Benzyl Alcohol', rule('FRG-1'))).toBe(false);
  });

  it('fragrance labels match LC-1a; "fragrance-free" text does not', () => {
    for (const t of ['Parfum', 'Fragrance', 'Fragrance (Parfum)', 'Perfume', 'Aroma', 'Ifra Certified Fragrance', 'Fragrance Oil']) {
      expect(matchesInci(t, rule('LC-1a'))).toBe(true);
    }
    expect(matchesInci('Fragrance-Free', rule('LC-1a'))).toBe(false);
    expect(matchesInci('Limonene', rule('LC-1a'))).toBe(false);
  });
});
