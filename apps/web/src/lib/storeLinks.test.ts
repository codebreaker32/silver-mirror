import { COPY } from '@skinkey/contracts';
import { describe, expect, it } from 'vitest';
import { disclosureFor, flipkartFacetSearch, storeLinks } from './storeLinks';

const off = { nykaa: { live: false, query: 'aff=1' }, flipkart: { live: false, query: 'aff=2' } };

describe('store links and affiliate flags', () => {
  it('builds plain keyword searches with no disclosure when every flag is off', () => {
    const links = storeLinks('Foxtale Oil Balancing Moisturizer', off);
    expect(links.map((l) => l.store)).toEqual(['flipkart', 'amazon_in', 'nykaa']);
    expect(links.every((l) => !l.tagged && !l.href.includes('aff='))).toBe(true);
    expect(disclosureFor(links)).toBeNull();
  });

  it('tags Nykaa and shows the disclosure only when its flag is live', () => {
    const links = storeLinks('x', { ...off, nykaa: { live: true, query: 'aff=1' } });
    expect(links.find((l) => l.store === 'nykaa')).toMatchObject({ tagged: true });
    expect(links.find((l) => l.store === 'nykaa')!.href).toContain('&aff=1');
    expect(disclosureFor(links)).toBe(COPY.affiliateDisclosure);
  });

  it('never tags Amazon', () => {
    const links = storeLinks('x', { nykaa: { live: true, query: 'a=1' }, flipkart: { live: true, query: 'b=2' } });
    expect(links.find((l) => l.store === 'amazon_in')).toMatchObject({ tagged: false, href: 'https://www.amazon.in/s?k=x' });
  });

  it('treats a live flag with no tag value as untagged', () => {
    const links = storeLinks('x', { ...off, flipkart: { live: true, query: '' } });
    expect(disclosureFor(links)).toBeNull();
  });

  it('keeps link order and targets identical whatever the flags (ranking firewall)', () => {
    const a = storeLinks('serum', off).map((l) => l.store);
    const b = storeLinks('serum', { nykaa: { live: true, query: 'a=1' }, flipkart: { live: true, query: 'b=2' } }).map((l) => l.store);
    expect(a).toEqual(b);
  });

  it('encodes the Flipkart skin-type facet in the documented pattern', () => {
    expect(flipkartFacetSearch('moisturiser', 'Oily Skin')).toBe(
      'https://www.flipkart.com/search?q=moisturiser&p%5B%5D=facets.skin_type%255B%255D%3DOily%2BSkin',
    );
  });
});
