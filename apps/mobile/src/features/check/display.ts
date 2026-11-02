import type { ProductCategory } from '@skinkey/contracts';
import type { IconName } from '@/components/Icon';

const SMALL = new Set(['a', 'an', 'and', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);

/**
 * Listing titles are title-cased before display (DESIGN.md §4). Only titles that arrive all lowercase (a Flipkart
 * slug: "vaseline gluta hya dewy radiance") are changed, so "SPF 50", "PA++++" and brand casing stay as written.
 */
export function displayTitle(title: string): string {
  if (title !== title.toLowerCase()) return title;
  return title
    .split(/(\s+)/)
    .map((w, i) => {
      if (!/[a-z]/.test(w)) return w;
      if (i > 0 && SMALL.has(w)) return w;
      if (/^spf\d*\+?$/.test(w) || /^pa\++$/.test(w)) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join('');
}

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/**
 * Header title for a raw marketplace listing (DESIGN.md §4, §9.4): keep the product name, drop the SEO tail after the
 * first " | ", ", " or " - " ("Minimalist SPF 30 Body Sunscreen, UVA & UVB Protection | Nourishing Lotion | …" →
 * "Minimalist SPF 30 Body Sunscreen"), then title-case. The full title stays in the ledger's Product row.
 */
export function shortListingTitle(title: string): string {
  let head = title.trim().split(/\s*\|\s*/)[0] ?? title;
  for (const sep of [/,\s+/, /\s+[-–—]\s+/]) {
    const first = head.split(sep)[0] ?? head;
    if (first !== head && words(first) >= 2) head = first;
  }
  return displayTitle(head.trim() || title.trim());
}

/** Pack size for the muted meta line, without the "(also 30 g, 100 g on brand site)" note the SKU sheet uses. */
export const sizeMeta = (size: string | null | undefined): string | null => {
  const s = size?.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  return s ? s : null;
};

const GLYPH: Record<ProductCategory, IconName> = {
  sunscreen: 'sun',
  tinted_spf: 'sun',
  moisturiser: 'jar',
  tinted_moisturiser: 'jar',
  cleanser: 'tube',
  serum: 'bottle',
  toner: 'bottle',
  lip_tint: 'tube',
  tinted_lip_balm: 'tube',
  other: 'bottle',
};

/** Category glyph for the sunken thumbnail tile (SKU rows, match cards). Never a product photo we do not have. */
export const categoryGlyph = (c: ProductCategory | null | undefined): IconName => GLYPH[c ?? 'other'] ?? 'bottle';

/** Tokens that make two SKUs different products: SPF number, pack size, "Body". */
const DISTINGUISHING = /\bspf\s*\d+\+?|\b\d+(?:\.\d+)?\s?(?:ml|gm|g)\b|\bbody\b/gi;
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '').replace(/gm$/, 'g');
const kind = (token: string) => (/^spf/.test(token) ? 'spf' : token === 'body' ? 'body' : 'size');

export interface TitlePart {
  text: string;
  /** Disagrees with the shared listing title: set in bold. */
  mismatch: boolean;
}

/**
 * Splits a candidate name so tokens that disagree with the shared title (SPF 30 vs SPF 50, a size the listing does
 * not name, "Body") can be set in bold (DESIGN.md §9.3). An SPF or size only counts when the listing names one of its
 * own. With no shared title nothing is marked.
 */
export function markMismatches(candidate: string, sharedTitle: string | null | undefined): TitlePart[] {
  if (!sharedTitle) return [{ text: candidate, mismatch: false }];
  const shared = (sharedTitle.match(DISTINGUISHING) ?? []).map(norm);
  const kinds = new Set(shared.map(kind));
  const differs = (token: string) => {
    const k = kind(token);
    if (shared.includes(token)) return false;
    return k === 'body' || kinds.has(k);
  };
  const parts: TitlePart[] = [];
  let last = 0;
  for (const m of candidate.matchAll(DISTINGUISHING)) {
    const at = m.index ?? 0;
    if (!differs(norm(m[0]))) continue;
    if (at > last) parts.push({ text: candidate.slice(last, at), mismatch: false });
    parts.push({ text: m[0], mismatch: true });
    last = at + m[0].length;
  }
  if (last < candidate.length) parts.push({ text: candidate.slice(last), mismatch: false });
  return parts.length ? parts : [{ text: candidate, mismatch: false }];
}
