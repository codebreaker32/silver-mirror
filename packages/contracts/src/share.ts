/**
 * Store share-payload parsers, from the real payloads captured in spikes/FINDINGS.md (S1, 2026-11-01).
 * Pure functions, shared by the phone (instant SKU-confirm title) and the Worker (/v1/resolve).
 *
 * - Flipkart: the payload is only `https://dl.flipkart.com/s/<code>`. The title comes from ONE redirect
 *   header (`Location: https://dl.flipkart.com/dl/<slug>/p/<itm>?pid=<PID>&…`). The page is never loaded.
 * - Amazon.in: `Check this out at Amazon` + newline + `<title> https://amzn.in/d/<code>`.
 * - Nykaa: `Check out <title> on Nykaa` + newline + `https://www.nykaa.com/<slug>/p/<id>?skuId=…`.
 */
import type { Store } from './api';

/** WHATWG URL exists in every runtime we ship to (Workers, Hermes, browsers, Node); contracts stays free of DOM libs. */
declare const URL: new (url: string, base?: string) => {
  hostname: string;
  pathname: string;
  searchParams: { get(name: string): string | null };
};

export interface ParsedSharePayload {
  store: Store;
  /** First URL in the payload, trailing punctuation removed. */
  url: string | null;
  /** Product title when the payload carries one; null for a Flipkart short link until its redirect is resolved. */
  title: string | null;
  /** Store product id when the payload carries one (Nykaa /p/<id>, Flipkart pid, Amazon /dp/<ASIN>). */
  storeProductId: string | null;
  /** True when the only way to a title is the Flipkart short-link redirect header. */
  needsRedirect: boolean;
}

const URL_RE = /https?:\/\/[^\s<>"'()]+/gi;
const AMAZON_PREFIX = /^\s*check\s+this\s+out\s+at\s+amazon(\.in)?\s*[:!.-]?\s*/i;
const NYKAA_TITLE = /^\s*check\s+out\s+([\s\S]+?)\s+on\s+nykaa\s*[!.:]?\s*$/i;
const FLIPKART_SHORT = /^https:\/\/dl\.flipkart\.com\/s\/[A-Za-z0-9_-]{4,40}$/;

const urlsIn = (text: string) => [...text.matchAll(URL_RE)].map((m) => m[0].replace(/[.,;!?]+$/, ''));

const hostOf = (url: string): string | null => {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
};

const hostIs = (host: string | null, ...domains: string[]) => !!host && domains.some((d) => host === d || host.endsWith(`.${d}`));

export const storeOfUrl = (url: string | null): Store => {
  const host = url ? hostOf(url) : null;
  if (hostIs(host, 'flipkart.com', 'fkrt.it', 'fkrt.cc', 'fkrt.co')) return 'flipkart';
  if (hostIs(host, 'amazon.in', 'amzn.in', 'amzn.to', 'amzn.eu')) return 'amazon_in';
  if (hostIs(host, 'nykaa.com', 'nyk.aa')) return 'nykaa';
  return 'other';
};

/** Only this exact shape is ever fetched (SSRF guard): https://dl.flipkart.com/s/<code>. */
export const isFlipkartShortLink = (url: string | null): url is string => !!url && FLIPKART_SHORT.test(url);

const tidy = (s: string) => s.replace(/\s+/g, ' ').replace(/^["'“”‘’\s:–-]+|["'“”‘’\s:–-]+$/g, '').trim();
const withoutUrls = (text: string) => text.replace(URL_RE, ' ');

/** Amazon.in: the title is the text minus "Check this out at Amazon" and the URL. */
export const amazonTitle = (text: string): string | null => {
  const t = tidy(withoutUrls(text).replace(AMAZON_PREFIX, ''));
  return t.length >= 3 ? t : null;
};

/** Nykaa: "Check out <title> on Nykaa". */
export const nykaaTitle = (text: string): string | null => {
  const m = NYKAA_TITLE.exec(withoutUrls(text));
  const t = m?.[1] ? tidy(m[1]) : '';
  return t.length >= 3 ? t : null;
};

const slugWords = (slug: string) => {
  try {
    return decodeURIComponent(slug).replace(/[-_+]+/g, ' ').replace(/\s+/g, ' ').trim();
  } catch {
    return slug.replace(/[-_+]+/g, ' ').trim();
  }
};

/** Nykaa /<slug>/p/<id> → product id. */
export const nykaaProductId = (url: string | null): string | null => {
  if (!url || storeOfUrl(url) !== 'nykaa') return null;
  return /\/p\/(\d+)/.exec(new URL(url).pathname)?.[1] ?? null;
};

const amazonAsin = (url: string | null): string | null => (url ? (/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i.exec(url)?.[1] ?? null) : null);

export interface FlipkartRedirect {
  slug: string;
  title: string;
  pid: string | null;
  itemId: string | null;
}

/** Parses the Location header of the dl.flipkart.com/s/ redirect: /dl/<slug>/p/<itm>?pid=<PID>&lid=… */
export const parseFlipkartLocation = (location: string | null | undefined): FlipkartRedirect | null => {
  if (!location) return null;
  let u: InstanceType<typeof URL>;
  try {
    u = new URL(location, 'https://dl.flipkart.com');
  } catch {
    return null;
  }
  if (!hostIs(u.hostname.toLowerCase(), 'flipkart.com')) return null;
  const parts = u.pathname.split('/').filter(Boolean);
  const at = parts.indexOf('p');
  if (at < 1) return null;
  const slug = parts[at - 1]!;
  if (slug === 'dl' || slug.length < 4) return null;
  const title = slugWords(slug);
  if (title.length < 4) return null;
  return { slug, title, pid: u.searchParams.get('pid'), itemId: parts[at + 1] ?? null };
};

/** Parses a share payload from a store app. Never makes a network call. */
export const parseSharePayload = (text: string, explicitUrl?: string | null): ParsedSharePayload => {
  const urls = urlsIn(text);
  const url = explicitUrl?.trim() || urls[0] || null;
  const urlStore = storeOfUrl(url);
  const store: Store =
    urlStore !== 'other' ? urlStore : AMAZON_PREFIX.test(text) ? 'amazon_in' : NYKAA_TITLE.test(withoutUrls(text)) ? 'nykaa' : 'other';

  if (store === 'amazon_in' && AMAZON_PREFIX.test(text)) {
    return { store, url, title: amazonTitle(text), storeProductId: amazonAsin(url), needsRedirect: false };
  }
  if (store === 'nykaa') {
    const title = nykaaTitle(text);
    if (title) return { store, url, title, storeProductId: nykaaProductId(url), needsRedirect: false };
  }
  if (store === 'flipkart' && isFlipkartShortLink(url) && !tidy(withoutUrls(text))) {
    return { store, url, title: null, storeProductId: null, needsRedirect: true };
  }
  return {
    store,
    url,
    title: null,
    storeProductId: store === 'nykaa' ? nykaaProductId(url) : store === 'amazon_in' ? amazonAsin(url) : null,
    needsRedirect: false,
  };
};

/** Real S1 payloads (spikes/FINDINGS.md), used by tests and the mock resolver. */
export const SHARE_FIXTURES = {
  flipkartShortLink: 'https://dl.flipkart.com/s/qPYPSuNNNN',
  /** Shape of the observed Location header; the slug is the real one, itm/pid/lid values are placeholders (redacted in FINDINGS). */
  flipkartLocation:
    'https://dl.flipkart.com/dl/vaseline-gluta-hya-dewy-radiance/p/itmPLACEHOLDER0001?pid=PLACEHOLDERPID01&lid=PLACEHOLDERLID01',
  amazon:
    'Check this out at Amazon\nMinimalist SPF 30 Body Sunscreen, UVA & UVB Protection | Nourishing Lotion | Broad Spectrum PA+++ Sunscreen for All Skin Types | For Men & Women | 150 g https://amzn.in/d/05kxo4QC',
  amazonTitle:
    'Minimalist SPF 30 Body Sunscreen, UVA & UVB Protection | Nourishing Lotion | Broad Spectrum PA+++ Sunscreen for All Skin Types | For Men & Women | 150 g',
  // lint-claims:allow (verbatim retailer title from the S1 spike, not SkinKey copy)
  nykaaTitle: 'Minimalist SPF 50 PA++++ Sunscreen With Niacinamide - Lightweight & No White Cast For All Skin Types',
  /** FINDINGS gives the URL shape only; slug/id/skuId here are placeholders in that shape. */
  nykaaUrl: 'https://www.nykaa.com/minimalist-spf-50-sunscreen/p/1234567?skuId=1234567&se=0',
} as const;

export const nykaaFixture = () =>
  `Check out ${SHARE_FIXTURES.nykaaTitle} on Nykaa\n${SHARE_FIXTURES.nykaaUrl}`;
