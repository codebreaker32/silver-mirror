import { describe, expect, it, vi } from 'vitest';
import { COPY, DEMO_KEY, type FacetMapping, type KeyProfile, type RankedMatch } from '@skinkey/contracts';
import { PRODUCT, TINTED } from '../check/fixtures';
import { amazonSearchUrl, facetFor, flipkartFacetUrl, flipkartSearchUrl, guessCategory, nykaaSearchUrl, storeKeywords, storeLinks } from './links';
import { selectMatches } from './select';

const MAP: FacetMapping[] = [
  { youcamClass: 'Oily', flipkartFacet: 'Oily Skin' },
  { youcamClass: 'Combination', flipkartFacet: 'Combination Skin' },
  { youcamClass: 'Oily & Redness', flipkartFacet: null },
];
const oily: KeyProfile = { ...DEMO_KEY, zones: { whole: 'Oily' } };

describe('store links', () => {
  it('builds the Flipkart facet URL in the documented pattern', () => {
    expect(flipkartFacetUrl('moisturiser', 'Oily Skin')).toBe(
      'https://www.flipkart.com/search?q=moisturiser&p%5B%5D=facets.skin_type%255B%255D%3DOily%2BSkin',
    );
  });

  it('keyword URLs for Amazon and Nykaa', () => {
    expect(flipkartSearchUrl('face wash')).toBe('https://www.flipkart.com/search?q=face+wash');
    expect(amazonSearchUrl('face wash')).toBe('https://www.amazon.in/s?k=face%20wash');
    expect(nykaaSearchUrl('face wash')).toBe('https://www.nykaa.com/search/result/?q=face%20wash');
  });

  it('maps the Key class to a facet, and redness classes to no facet', () => {
    expect(facetFor(oily, MAP)).toBe('Oily Skin');
    expect(facetFor({ ...DEMO_KEY, zones: { whole: 'Oily & Redness' } }, MAP)).toBeNull();
    expect(facetFor(DEMO_KEY, MAP)).toBe('Oily Skin');
    expect(facetFor({ ...DEMO_KEY, bands: { ...DEMO_KEY.bands, oiliness: { level: 'Low', region: 'whole', selfReported: false } } }, MAP)).toBeNull();
  });

  it('facet link uses the exact disclosure string and destination line', () => {
    const links = storeLinks({ category: 'moisturiser', key: oily, facetMap: MAP, facetLabel: COPY.flipkartFacetLink });
    expect(links.map((l) => l.id)).toEqual(['flipkart_facet', 'amazon', 'nykaa']);
    expect(links[0]!.label).toBe("Browse Flipkart's own Oily Skin filter (seller-tagged, not checked by SkinKey)");
    expect(links[0]!.destination).toBe('Opens a Flipkart search, filtered to Oily Skin');
    expect(links[1]!.destination).toBe('Opens an Amazon keyword search for "moisturiser for oily skin"');
  });

  it('falls back to a Flipkart keyword search with no facet', () => {
    const links = storeLinks({ category: null, key: null, facetMap: MAP, facetLabel: COPY.flipkartFacetLink });
    expect(links[0]).toMatchObject({ id: 'flipkart', url: 'https://www.flipkart.com/search?q=skincare' });
  });

  it('guesses a category from a title and keeps keywords claim-free', () => {
    expect(guessCategory('Foxtale Ultra Matte Sunscreen SPF 50')).toBe('sunscreen');
    expect(guessCategory('Some Lip and Cheek Tint')).toBe('lip_tint');
    expect(guessCategory('Mystery Jar')).toBeNull();
    expect(storeKeywords('cleanser', { ...DEMO_KEY, zones: { whole: 'Normal' } })).toBe('face wash');
  });
});

describe('selectMatches', () => {
  const ranked: RankedMatch[] = [
    { productId: TINTED.id, label: 'CAUTION', score: 0.9, reasonLine: 'x', searchUrl: 'u1' },
    { productId: PRODUCT.id, label: 'FITS', score: 0.8, reasonLine: 'Has glycerin; nothing in our rules flags your readings.', searchUrl: 'https://www.flipkart.com/search?q=garnier' },
  ];

  it('keeps FITS only, numbers them and builds one TalkBack node each', () => {
    const rank = vi.fn(() => ranked);
    const out = selectMatches(rank, [PRODUCT, TINTED, { ...PRODUCT, id: 'unverified', verified: false, status: 'unverified' }], oily, 'current');
    expect(rank).toHaveBeenCalledWith([PRODUCT, TINTED], oily, { limit: 6, excludeId: 'current' });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ index: '01', name: 'Garnier Super UV Invisible Serum Sunscreen', meta: '30 ml' });
    expect(out[0]!.a11y).toMatch(/^Match 1\. .* Fits\. .* Opens a Flipkart search for this product\.$/);
  });
});
