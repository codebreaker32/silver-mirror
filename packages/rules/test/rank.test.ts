import { describe, expect, it } from 'vitest';
import type { CatalogProduct } from '@skinkey/contracts';
import { READING_PROFILES, flipkartSearchUrl, profileKey, rank } from '../src';
import { PRODUCTS } from './fixtures/products';

const oily = profileKey(READING_PROFILES.find((p) => p.id === 'oily')!);

describe('rank() firewall (spec §7)', () => {
  it('signature takes only products, a Key and layout options', () => {
    expect(rank.length).toBe(2);
    const src = rank.toString();
    expect(src).not.toMatch(/\.brand\b|affiliate|commission|billing|sponsor|mrp|price/i);
  });

  it('returns identical output with affiliate flags on and off, and with brand names changed', () => {
    const plain = rank(PRODUCTS, oily);
    const withFlags = PRODUCTS.map((p) => ({ ...p, affiliate: true, affiliateTag: 'tag-21', sponsored: true, mrp_inr: 1 }) as unknown as CatalogProduct);
    const renamed = PRODUCTS.map((p, i) => ({ ...p, brand: `Brand ${PRODUCTS.length - i}` }));
    expect(rank(withFlags, oily)).toEqual(plain);
    expect(rank(renamed, oily)).toEqual(plain);
    expect(rank([...PRODUCTS].reverse(), oily)).toEqual(plain);
  });

  it('lists only verified FITS products, best first, never MEDICINE or UNKNOWN', () => {
    const r = rank(PRODUCTS, oily);
    expect(r.map((m) => m.productId)).toEqual(['fx-gel-niacinamide', 'fx-clean-sunscreen', 'fx-alcohol-toner', 'fx-fragrance-free-lie', 'fx-oil-free-jojoba']);
    expect(r.every((m) => m.label === 'FITS')).toBe(true);
    expect(r.map((m) => m.productId)).not.toContain('fx-bpo-wash');
    expect(r.map((m) => m.productId)).not.toContain('fx-unverified');
    expect(r.map((m) => m.productId)).not.toContain('fx-heavy-cream');
  });

  it('a strict label-check mismatch ranks below an otherwise equal clean listing', () => {
    const r = rank(PRODUCTS, oily);
    const score = (id: string) => r.find((m) => m.productId === id)!.score;
    expect(score('fx-clean-sunscreen')).toBeGreaterThan(score('fx-alcohol-toner'));
  });

  it('honours options', () => {
    expect(rank(PRODUCTS, oily, { limit: 1 })).toHaveLength(1);
    expect(rank(PRODUCTS, oily, { excludeId: 'fx-gel-niacinamide' })[0]!.productId).not.toBe('fx-gel-niacinamide');
    expect(rank(PRODUCTS, oily, { category: 'sunscreen' }).map((m) => m.productId)).toEqual(['fx-clean-sunscreen']);
    expect(rank(PRODUCTS, oily, { includeCaution: true }).at(-1)!.productId).toBe('fx-heavy-cream');
  });

  it('each match has one reason line and a Flipkart keyword search', () => {
    const [top] = rank(PRODUCTS, oily);
    expect(top!.reasonLine).toContain('SUP-2');
    expect(top!.searchUrl).toBe('https://www.flipkart.com/search?q=Fixture+Niacinamide+Gel+Moisturiser');
  });
});

describe('flipkartSearchUrl', () => {
  it('encodes the query', () => {
    expect(flipkartSearchUrl('  Plum Green Tea & Co  ')).toBe('https://www.flipkart.com/search?q=Plum+Green+Tea+%26+Co');
  });
});
