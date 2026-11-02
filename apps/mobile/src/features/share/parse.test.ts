import { describe, expect, it } from 'vitest';
import { cleanTitle, detectStore, inputFromPaste, inputFromShareIntent, parseShareText, titleFromUrl, toResolveRequest } from './parse';
import { sampleInput } from './sample';
import { nykaaFixture, SHARE_FIXTURES } from '@skinkey/contracts';

describe('detectStore', () => {
  it.each([
    ['https://dl.flipkart.com/s/abc123', 'flipkart'],
    ['https://www.flipkart.com/x/p/itm1', 'flipkart'],
    ['https://amzn.in/d/0aBcD', 'amazon_in'],
    ['https://www.amazon.in/dp/B0ABC', 'amazon_in'],
    ['https://www.nykaa.com/x/p/123', 'nykaa'],
    ['https://example.com/flipkart.com', 'other'],
    [null, 'other'],
  ] as const)('%s → %s', (url, store) => {
    expect(detectStore(url)).toBe(store);
  });
});

describe('parseShareText', () => {
  it('splits a Flipkart-style share into title and URL', () => {
    const p = parseShareText('Check out this product on Flipkart: Foxtale Ultra Matte Sunscreen https://dl.flipkart.com/s/xyz');
    expect(p).toMatchObject({ store: 'flipkart', url: 'https://dl.flipkart.com/s/xyz', title: 'Foxtale Ultra Matte Sunscreen' });
  });

  it('handles an Amazon-style share with the URL first and trailing punctuation', () => {
    const p = parseShareText('https://amzn.in/d/abc. CeraVe Foaming Cleanser');
    expect(p.url).toBe('https://amzn.in/d/abc');
    expect(p.store).toBe('amazon_in');
    expect(p.title).toBe('CeraVe Foaming Cleanser');
  });

  it('falls back to the URL slug when the share is a bare link', () => {
    const p = parseShareText('https://www.flipkart.com/plum-green-tea-moisturiser/p/itm123');
    expect(p.title).toBe('Plum Green Tea Moisturiser');
  });

  it('returns no title for a short-link-only share', () => {
    expect(parseShareText('https://dl.flipkart.com/s/xyz').title).toBeNull();
  });
});

describe('helpers', () => {
  it('cleanTitle strips store boilerplate', () => {
    expect(cleanTitle('Look what I found on Flipkart! Gentle Skin Cleanser')).toBe('Gentle Skin Cleanser');
    expect(cleanTitle('Gentle Skin Cleanser - Flipkart.com')).toBe('Gentle Skin Cleanser');
  });

  it('titleFromUrl ignores short links', () => {
    expect(titleFromUrl('https://amzn.in/d/abc')).toBeNull();
    expect(titleFromUrl('https://www.amazon.in/Neutrogena-Ultra-Sheer/dp/B00')).toBe('Neutrogena Ultra Sheer');
  });
});

describe('inputs', () => {
  it('prefers text over an attached image', () => {
    const input = inputFromShareIntent({
      text: 'Gentle Skin Cleanser https://dl.flipkart.com/s/1',
      files: [{ path: 'file:///s.png', mimeType: 'image/png', width: 1, height: 1 }],
    });
    expect(input?.kind).toBe('text');
  });

  it('uses the image when there is no text (screenshot share)', () => {
    const input = inputFromShareIntent({ text: null, files: [{ path: 'file:///s.png', mimeType: 'image/png', width: 1080, height: 2400 }] });
    expect(input).toEqual({ kind: 'image', uri: 'file:///s.png', width: 1080, height: 2400, mimeType: 'image/png' });
  });

  it('ignores empty pastes and builds a resolve request', () => {
    expect(inputFromPaste('   ')).toBeNull();
    const input = inputFromPaste('Cetaphil Gentle Skin Cleanser');
    expect(input?.kind === 'text' && toResolveRequest(input)).toEqual({ source: 'paste', text: 'Cetaphil Gentle Skin Cleanser', url: undefined });
  });

  it('the sample share parses as a Flipkart listing', () => {
    const input = sampleInput();
    expect(input.kind === 'text' && input.parsed.store).toBe('flipkart');
    expect(input.kind === 'text' && toResolveRequest(input).source).toBe('sample');
  });
});

describe('real S1 share payloads (spikes/FINDINGS.md)', () => {
  it('Amazon: title is the text minus the prefix and URL', () => {
    const p = parseShareText(SHARE_FIXTURES.amazon);
    expect(p).toMatchObject({ store: 'amazon_in', url: 'https://amzn.in/d/05kxo4QC', title: SHARE_FIXTURES.amazonTitle });
  });
  it('Nykaa: title from "Check out <title> on Nykaa"', () => {
    expect(parseShareText(nykaaFixture())).toMatchObject({ store: 'nykaa', title: SHARE_FIXTURES.nykaaTitle });
  });
  it('Flipkart short link: no title on the phone (the Worker reads one redirect header)', () => {
    expect(parseShareText('https://dl.flipkart.com/s/qPYPSuNNNN')).toMatchObject({ store: 'flipkart', title: null });
  });
});
