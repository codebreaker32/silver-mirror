import { describe, expect, it, vi } from 'vitest';
import { COPY, DEMO_KEY, type FacetMapping, type KeyProfile, type RankedMatch } from '@skinkey/contracts';
import { PRODUCT, TINTED } from '../check/fixtures';
import { amazonSearchUrl, buyLinks, facetFor, flipkartFacetUrl, flipkartSearchUrl, guessCategory, hasAffiliate, nykaaSearchUrl, opensInCustomTab, storeKeywords, storeLinks, withAffiliate } from './links';
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
    expect(links[0]!.label).toBe("Browse Flipkart's own Oily Skin filter (seller-tagged, not checked by Silver Mirror)");
    expect(links[0]!.destination).toBe('Opens a Flipkart search, filtered to Oily Skin');
    expect(links[1]!.destination).toBe('Opens an Amazon keyword search for "moisturiser for oily skin"');
  });

  it('opens Nykaa in a browser Custom Tab (its app drops keyword search, FINDINGS S1); Flipkart/Amazon via the app', () => {
    const links = storeLinks({ category: 'moisturiser', key: oily, facetMap: MAP, facetLabel: COPY.flipkartFacetLink });
    expect(links.map((l) => [l.id, l.opener])).toEqual([['flipkart_facet', 'app'], ['amazon', 'app'], ['nykaa', 'custom_tab']]);
    expect(links[2]!.destination).toContain('browser tab');
    expect(opensInCustomTab('https://www.nykaa.com/x/p/123')).toBe(true);
    expect(opensInCustomTab('https://www.flipkart.com/search?q=x')).toBe(false);
    expect(opensInCustomTab('https://nykaa.com.evil.io/')).toBe(false);
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
    // The engine's brandless searchUrl is ignored: the search is brand + name.
    expect(out[0]!.url).toBe(flipkartSearchUrl(`${PRODUCT.brand} ${PRODUCT.name}`));
  });

  it('searches the store the product was shared from', () => {
    const rank = vi.fn(() => ranked);
    const nykaa = selectMatches(rank, [PRODUCT, TINTED], oily, 'current', 3, 'nykaa');
    expect(nykaa[0]!.url).toBe(nykaaSearchUrl(`${PRODUCT.brand} ${PRODUCT.name}`));
    expect(nykaa[0]!.destination).toBe('Opens a Nykaa search for this product');
    expect(nykaa[0]!.a11y).toMatch(/Opens a Nykaa search for this product\.$/);
    const amazon = selectMatches(rank, [PRODUCT, TINTED], oily, 'current', 3, 'amazon_in');
    expect(amazon[0]!.url).toBe(amazonSearchUrl(`${PRODUCT.brand} ${PRODUCT.name}`));
    expect(amazon[0]!.destination).toBe('Opens an Amazon search for this product');
    expect(opensInCustomTab(nykaa[0]!.url)).toBe(true);
  });
});

describe('buy links', () => {
  const P = { brand: 'Minimalist', name: 'Sepicalm 3% Moisturizer' };
  const q = encodeURIComponent('Minimalist Sepicalm 3% Moisturizer');

  it('builds brand + name searches on Amazon, Flipkart and Nykaa with no params when none are set', () => {
    const empty = buyLinks(P, { amazonTag: '', flipkartAffid: '', nykaaQuery: '' });
    expect(empty).toEqual(buyLinks(P));
    expect(empty.map((l) => l.store)).toEqual(['Amazon', 'Flipkart', 'Nykaa']);
    expect(empty[0]!.url).toBe(`https://www.amazon.in/s?k=${q}`);
    expect(empty[1]!.url).toBe(flipkartSearchUrl('Minimalist Sepicalm 3% Moisturizer'));
    expect(empty[2]!.url).toBe(`https://www.nykaa.com/search/result/?q=${q}`);
    expect(empty.some((l) => /tag=|affid=/.test(l.url))).toBe(false);
    expect(hasAffiliate({ amazonTag: '', flipkartAffid: ' ', nykaaQuery: '' })).toBe(false);
  });

  it('appends each store param only to its own store when set', () => {
    const aff = { amazonTag: 'silvermirror-21', flipkartAffid: 'smaff', nykaaQuery: '?utm_source=sm&utm_medium=app' };
    const [amazon, flipkart, nykaa] = buyLinks(P, aff);
    expect(amazon!.url).toBe(`https://www.amazon.in/s?k=${q}&tag=silvermirror-21`);
    expect(flipkart!.url).toBe(`${flipkartSearchUrl('Minimalist Sepicalm 3% Moisturizer')}&affid=smaff`);
    expect(nykaa!.url).toBe(`https://www.nykaa.com/search/result/?q=${q}&utm_source=sm&utm_medium=app`);
    expect(hasAffiliate(aff)).toBe(true);
    // Only Amazon set: the others stay untouched.
    const only = buyLinks(P, { amazonTag: 'x-21' });
    expect(only[1]!.url).not.toContain('affid=');
    expect(only[2]!.url).toBe(`https://www.nykaa.com/search/result/?q=${q}`);
  });

  it('tags a match search URL by host and leaves other URLs alone', () => {
    expect(withAffiliate(amazonSearchUrl('a b'), { amazonTag: 't-21' })).toBe('https://www.amazon.in/s?k=a%20b&tag=t-21');
    expect(withAffiliate('https://example.com/p', { amazonTag: 't-21', flipkartAffid: 'f', nykaaQuery: 'a=1' })).toBe('https://example.com/p');
  });
});
