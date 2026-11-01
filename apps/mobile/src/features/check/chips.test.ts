import { describe, expect, it } from 'vitest';
import { addChip, chipsFromOcr, chipsToInci, editChip, removeChip, uncertainCount } from './chips';

const ocr = [
  { raw: 'AQUA', cosingName: 'Aqua', confidence: 0.99, uncertain: false },
  { raw: 'Glycerine', cosingName: 'Glycerin', confidence: 0.9, uncertain: false },
  { raw: 'Isopropy1 Myrstate', cosingName: null, confidence: 0.4, uncertain: true },
  { raw: '  ', cosingName: null, confidence: 0.1, uncertain: true },
];

describe('INCI chips', () => {
  it('prefers CosIng names, outlines uncertain tokens and drops blanks', () => {
    const chips = chipsFromOcr(ocr);
    expect(chips.map((c) => c.text)).toEqual(['Aqua', 'Glycerin', 'Isopropy1 Myrstate']);
    expect(uncertainCount(chips)).toBe(1);
  });

  it('editing clears the uncertain outline; an empty edit removes the chip', () => {
    const chips = chipsFromOcr(ocr);
    const corrected = editChip(chips, chips[2]!.id, 'Isopropyl Myristate');
    expect(corrected[2]).toMatchObject({ text: 'Isopropyl Myristate', uncertain: false, edited: true });
    expect(editChip(chips, chips[0]!.id, ' ')).toHaveLength(2);
  });

  it('keeps label order as INCI position', () => {
    let chips = chipsFromOcr(ocr);
    chips = removeChip(chips, chips[0]!.id);
    chips = addChip(chips, 'Parfum');
    expect(chipsToInci(chips)).toEqual([
      { token: 'Glycerin', position: 1 },
      { token: 'Isopropy1 Myrstate', position: 2 },
      { token: 'Parfum', position: 3 },
    ]);
  });
});
