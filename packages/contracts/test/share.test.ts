import { describe, expect, it } from 'vitest';
import {
  amazonTitle,
  COPY,
  isFlipkartShortLink,
  nykaaFixture,
  nykaaTitle,
  parseFlipkartLocation,
  parseSharePayload,
  SHARE_FIXTURES,
  titleCaseSlug,
} from '../src';

// Exact payloads from spikes/FINDINGS.md S1 (Samsung SM-A276B, 2026-11-01).
const AMAZON =
  'Check this out at Amazon\nMinimalist SPF 30 Body Sunscreen, UVA & UVB Protection | Nourishing Lotion | Broad Spectrum PA+++ Sunscreen for All Skin Types | For Men & Women | 150 g https://amzn.in/d/05kxo4QC';
const AMAZON_TITLE =
  'Minimalist SPF 30 Body Sunscreen, UVA & UVB Protection | Nourishing Lotion | Broad Spectrum PA+++ Sunscreen for All Skin Types | For Men & Women | 150 g';
const NYKAA_TITLE = 'Minimalist SPF 50 PA++++ Sunscreen With Niacinamide - Lightweight & No White Cast For All Skin Types';
const FLIPKART = 'https://dl.flipkart.com/s/qPYPSuNNNN';

describe('Flipkart short link', () => {
  it('needs exactly one redirect lookup and carries no title', () => {
    expect(parseSharePayload(FLIPKART)).toEqual({ store: 'flipkart', url: FLIPKART, title: null, storeProductId: null, needsRedirect: true });
  });

  it('reads slug and pid from the Location header only', () => {
    const r = parseFlipkartLocation('https://dl.flipkart.com/dl/vaseline-gluta-hya-dewy-radiance/p/itmabc123?pid=MSCGZ9HYQ&lid=LSTX');
    expect(r).toEqual({ slug: 'vaseline-gluta-hya-dewy-radiance', title: 'Vaseline Gluta Hya Dewy Radiance', pid: 'MSCGZ9HYQ', itemId: 'itmabc123' });
    expect(parseFlipkartLocation(SHARE_FIXTURES.flipkartLocation)?.slug).toBe('vaseline-gluta-hya-dewy-radiance');
  });

  it('rejects non-Flipkart or malformed redirects', () => {
    expect(parseFlipkartLocation(null)).toBeNull();
    expect(parseFlipkartLocation('https://evil.example/dl/some-product/p/itm1?pid=X')).toBeNull();
    expect(parseFlipkartLocation('https://www.flipkart.com/')).toBeNull();
  });

  it('only ever fetches the exact dl.flipkart.com/s/<code> shape (SSRF guard)', () => {
    expect(isFlipkartShortLink(FLIPKART)).toBe(true);
    expect(isFlipkartShortLink('http://dl.flipkart.com/s/qPYPSuNNNN')).toBe(false);
    expect(isFlipkartShortLink('https://dl.flipkart.com.evil.io/s/qPYPSuNNNN')).toBe(false);
    expect(isFlipkartShortLink('https://dl.flipkart.com/s/../admin')).toBe(false);
    expect(isFlipkartShortLink('https://www.flipkart.com/x/p/itm1')).toBe(false);
  });
});

describe('Amazon.in share', () => {
  it('title is the text minus "Check this out at Amazon" and the URL', () => {
    const p = parseSharePayload(AMAZON);
    expect(p).toMatchObject({ store: 'amazon_in', url: 'https://amzn.in/d/05kxo4QC', title: AMAZON_TITLE, needsRedirect: false });
    expect(amazonTitle(AMAZON)).toBe(AMAZON_TITLE);
    expect(SHARE_FIXTURES.amazon).toBe(AMAZON);
  });
});

describe('Nykaa share', () => {
  it('title from "Check out <title> on Nykaa" and product id from /p/<id>', () => {
    const text = `Check out ${NYKAA_TITLE} on Nykaa\nhttps://www.nykaa.com/minimalist-spf-50-sunscreen/p/1234567?skuId=1234567&se=0`;
    const p = parseSharePayload(text);
    expect(p).toMatchObject({ store: 'nykaa', title: NYKAA_TITLE, storeProductId: '1234567', needsRedirect: false });
    expect(nykaaTitle(nykaaFixture())).toBe(NYKAA_TITLE);
  });
});

describe('titleCaseSlug (BUGS.md #3: raw lowercase Flipkart slug)', () => {
  it('title-cases the real S1 slug and keeps SPF/PA shorthands and sizes', () => {
    expect(parseFlipkartLocation(SHARE_FIXTURES.flipkartLocation)?.title).toBe('Vaseline Gluta Hya Dewy Radiance');
    expect(titleCaseSlug('minimalist spf 50 pa sunscreen with niacinamide 50 g')).toBe('Minimalist SPF 50 PA Sunscreen with Niacinamide 50 g');
    expect(titleCaseSlug('foxtale spf50 ultra matte 50ml')).toBe('Foxtale SPF50 Ultra Matte 50ml');
    expect(titleCaseSlug('the derma co 1 percent vitamin c serum')).toBe('The Derma Co 1 Percent Vitamin C Serum');
    expect(titleCaseSlug('CeraVe Moisturising Cream')).toBe('CeraVe Moisturising Cream');
  });
});

describe('other payloads', () => {
  it('falls back to no title and no redirect', () => {
    expect(parseSharePayload('hello https://example.com/x')).toMatchObject({ store: 'other', title: null, needsRedirect: false });
  });
});

describe('share coach marks (FINDINGS S1)', () => {
  it('teaches the Amazon More step', () => {
    expect(COPY.amazonCoachMark).toBe('Amazon: Share → More → Silver Mirror');
    expect(COPY.sharePaths).toContain('Amazon: Share → More → Silver Mirror');
  });
});
