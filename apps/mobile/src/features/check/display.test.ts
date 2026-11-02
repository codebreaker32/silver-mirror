import { describe, expect, it } from 'vitest';
import { categoryGlyph, displayTitle, markMismatches } from './display';

describe('displayTitle', () => {
  it('title-cases an all-lowercase slug and leaves written casing alone', () => {
    expect(displayTitle('vaseline gluta hya dewy radiance')).toBe('Vaseline Gluta Hya Dewy Radiance');
    expect(displayTitle('minimalist spf50 sunscreen for oily skin')).toBe('Minimalist SPF50 Sunscreen for Oily Skin');
    expect(displayTitle('Garnier · Super UV Invisible Serum Sunscreen · 30 ml')).toBe('Garnier · Super UV Invisible Serum Sunscreen · 30 ml');
  });
});

describe('markMismatches', () => {
  const bold = (c: string, s: string | null) => markMismatches(c, s).filter((p) => p.mismatch).map((p) => p.text);

  it('bolds an SPF and "Body" that disagree with the shared listing', () => {
    expect(bold('Minimalist SPF 50 Sunscreen · 50 g', 'Minimalist SPF 30 Body Sunscreen 50g')).toEqual(['SPF 50']);
    expect(bold('Minimalist SPF 30 Body Lotion', 'Minimalist SPF 30 Sunscreen')).toEqual(['Body']);
  });

  it('keeps the text intact and marks nothing without a shared title or a same-kind token', () => {
    const parts = markMismatches('Minimalist SPF 50 Sunscreen · 50 g', 'Minimalist SPF 30 Sunscreen');
    expect(parts.map((p) => p.text).join('')).toBe('Minimalist SPF 50 Sunscreen · 50 g');
    expect(parts.filter((p) => p.mismatch).map((p) => p.text)).toEqual(['SPF 50']);
    expect(bold('Minimalist SPF 50 Sunscreen', null)).toEqual([]);
  });
});

describe('categoryGlyph', () => {
  it('maps categories to line glyphs', () => {
    expect(categoryGlyph('sunscreen')).toBe('sun');
    expect(categoryGlyph(null)).toBe('bottle');
  });
});
