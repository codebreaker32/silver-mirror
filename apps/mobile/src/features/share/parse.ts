import { parseSharePayload, type ResolveRequest, type Store } from '@skinkey/contracts';

export interface ParsedShare {
  store: Store;
  url: string | null;
  title: string | null;
  text: string;
}

export type CheckInput =
  | { kind: 'text'; source: 'share_text' | 'paste' | 'sample'; parsed: ParsedShare }
  | { kind: 'image'; uri: string; width: number | null; height: number | null; mimeType: string };

const URL_RE = /https?:\/\/[^\s<>"'()]+/i;
const HOST_RE = /^https?:\/\/([^/?#:]+)/i;

const STORE_HOSTS: ReadonlyArray<[Store, RegExp]> = [
  ['flipkart', /(^|\.)(flipkart\.com|fkrt\.it|fkrt\.cc|fkrt\.co)$/],
  ['amazon_in', /(^|\.)(amazon\.in|amzn\.in|amzn\.to|amzn\.eu)$/],
  ['nykaa', /(^|\.)(nykaa\.com|nykaafashion\.com|nyk\.aa)$/],
];

const BOILERPLATE: readonly RegExp[] = [
  /^(hey[,!]?\s*)?(check\s+(this\s+)?out\s*(this\s+(product|item|deal))?\s*(on\s+\w+)?\s*[:!-]?)/i,
  /^(look\s+what\s+i\s+found\s+on\s+\w+[!:.]?)/i,
  /^(i\s+found\s+(this\s+)?(on\s+)?\w+[!:.]?)/i,
  /^(found\s+this\s+on\s+\w+[!:.]?)/i,
  /\s*(on|at|via)\s+(flipkart|amazon(\.in)?|nykaa)\s*[!:.]*$/i,
  /\s*[-|:]\s*(flipkart|amazon(\.in)?|nykaa)(\.com)?\s*$/i,
];

export function firstUrl(text: string): string | null {
  const m = URL_RE.exec(text);
  return m ? m[0].replace(/[.,;!?]+$/, '') : null;
}

export function detectStore(url: string | null): Store {
  if (!url) return 'other';
  const host = HOST_RE.exec(url)?.[1]?.toLowerCase();
  if (!host) return 'other';
  return STORE_HOSTS.find(([, re]) => re.test(host))?.[0] ?? 'other';
}

/** Product slug from a long listing URL, e.g. flipkart.com/<slug>/p/itm… or amazon.in/<slug>/dp/… */
export function titleFromUrl(url: string | null): string | null {
  if (!url) return null;
  const m = /^https?:\/\/[^/]+\/([^/?#]+)\/(p|dp)\//i.exec(url);
  const slug = m?.[1];
  if (!slug || slug.length < 4) return null;
  const words = decodeURIComponent(slug).replace(/[-_+]+/g, ' ').trim();
  return words.length >= 4 ? words : null;
}

export function cleanTitle(raw: string): string | null {
  let t = raw.replace(URL_RE, ' ').replace(/\s+/g, ' ').trim();
  for (let pass = 0; pass < 2; pass++) {
    for (const re of BOILERPLATE) t = t.replace(re, '').trim();
  }
  t = t.replace(/^["'“”‘’\s:–-]+|["'“”‘’\s:–-]+$/g, '').trim();
  return t.length >= 3 ? t : null;
}

export function parseShareText(text: string, webUrl?: string | null, metaTitle?: string | null): ParsedShare {
  const url = webUrl?.trim() || firstUrl(text);
  // Store-specific parsers from the real S1 payloads (Amazon/Nykaa titles in the text; Flipkart short link resolved by the Worker).
  const store = parseSharePayload(text, url);
  const title = (metaTitle && cleanTitle(metaTitle)) || store.title || (store.needsRedirect ? null : cleanTitle(text) || titleFromUrl(url));
  return { store: store.store !== 'other' ? store.store : detectStore(url), url, title, text: text.trim() };
}

export function toResolveRequest(input: Extract<CheckInput, { kind: 'text' }>): ResolveRequest {
  const { parsed, source } = input;
  return {
    source,
    text: (parsed.text || parsed.title || '').slice(0, 4000) || undefined,
    url: parsed.url ?? undefined,
  };
}

interface ShareIntentLike {
  text?: string | null;
  webUrl?: string | null;
  meta?: { title?: string } | null;
  files?: ReadonlyArray<{ path: string; mimeType: string; width: number | null; height: number | null }> | null;
}

export function inputFromShareIntent(intent: ShareIntentLike): CheckInput | null {
  const image = intent.files?.find((f) => f.mimeType.startsWith('image/'));
  const text = intent.text?.trim() ?? '';
  if (text || intent.webUrl) {
    return { kind: 'text', source: 'share_text', parsed: parseShareText(text || intent.webUrl || '', intent.webUrl, intent.meta?.title) };
  }
  if (image) return { kind: 'image', uri: image.path, width: image.width, height: image.height, mimeType: image.mimeType };
  return null;
}

export function inputFromPaste(value: string): CheckInput | null {
  const text = value.trim();
  if (!text) return null;
  return { kind: 'text', source: 'paste', parsed: parseShareText(text) };
}
