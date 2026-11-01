import type { InciToken } from '@skinkey/contracts';

/** Canonical CosIng-style name → common label synonyms. Keys of the lookup are lowercase. */
const CANONICAL: Record<string, readonly string[]> = {
  Aqua: ['water', 'purified water', 'deionized water', 'deionised water', 'demineralized water', 'eau', 'aqua/water', 'water/aqua', 'aqua/water/eau', 'water/aqua/eau'],
  Parfum: ['fragrance', 'perfume', 'parfum/fragrance', 'fragrance/parfum'],
  Aroma: ['flavor', 'flavour'],
  Alcohol: ['ethanol', 'ethyl alcohol'],
  'Alcohol Denat.': ['alcohol denat', 'denatured alcohol', 'alcohol denatured'],
  'Paraffinum Liquidum': ['mineral oil', 'liquid paraffin', 'paraffin oil', 'white mineral oil', 'paraffinum liquidum/mineral oil', 'mineral oil/paraffinum liquidum'],
  Petrolatum: ['petroleum jelly', 'white petrolatum', 'white soft paraffin', 'soft paraffin'],
  'Cera Microcristallina': ['microcrystalline wax', 'cera microcristallina/microcrystalline wax'],
  Glycerin: ['glycerine', 'glycerol', 'vegetable glycerin'],
  'Sodium Hyaluronate': [],
  'Hyaluronic Acid': [],
  Niacinamide: ['nicotinamide', 'vitamin b3'],
  'Ceramide NP': ['ceramide 3', 'ceramide iii'],
  'Ceramide AP': ['ceramide 6 ii', 'ceramide 6-ii'],
  'Ceramide EOP': ['ceramide 1', 'ceramide eop'],
  'Isopropyl Myristate': [],
  'Isopropyl Palmitate': [],
  'Benzyl Alcohol': [],
  'Cetyl Alcohol': [],
  'Cetearyl Alcohol': ['cetostearyl alcohol'],
  'Stearyl Alcohol': [],
  'Behenyl Alcohol': [],
  Tretinoin: ['retinoic acid', 'all-trans retinoic acid', 'all trans retinoic acid'],
  'Benzoyl Peroxide': [],
  Limonene: ['d-limonene'],
  Linalool: ['linalol'],
  'Tocopheryl Acetate': ['vitamin e acetate'],
  'Sodium Lauryl Sulfate': ['sls'],
  'Sodium Laureth Sulfate': ['sles'],
};

const SYNONYM_TO_CANONICAL = new Map<string, string>();
for (const [canonical, synonyms] of Object.entries(CANONICAL)) {
  SYNONYM_TO_CANONICAL.set(baseKey(canonical), canonical);
  for (const s of synonyms) SYNONYM_TO_CANONICAL.set(baseKey(s), canonical);
}

function cleanRaw(text: string): string {
  return (typeof text.normalize === 'function' ? text.normalize('NFKC') : text)
    .replace(/[‐-―−]/g, '-')
    .replace(/[*†‡^•·®™¹²³⁴⁵⁶⁷⁸⁹⁰]/g, '')
    .replace(/\[\s*\+\/-\s*\]|\(\s*\+\/-\s*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[,;:]+$/, '')
    .trim();
}

function baseKey(text: string): string {
  return cleanRaw(text)
    .toLowerCase()
    .replace(/sulphate/g, 'sulfate')
    .replace(/\bs\.\s?d\.\s?/g, 'sd ')
    .replace(/\(\s*and\s*\)/g, ' ')
    .replace(/\b\d+(\.\d+)?\s*%/g, ' ')
    .replace(/\(\s*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*-\s*/g, '-')
    .trim()
    .replace(/\.$/, '')
    .trim();
}

/** Lowercase lookup key for one INCI token (case, spelling, footnote marks and percentages folded). */
export function inciKey(token: string): string {
  const k = baseKey(token);
  return SYNONYM_TO_CANONICAL.has(k) ? baseKey(SYNONYM_TO_CANONICAL.get(k)!) : k;
}

/**
 * Every lowercase form a token can match on: the full key, the part outside parentheses, each parenthetical,
 * and slash-separated parts when every part is a known synonym (e.g. "Aqua/Water/Eau").
 */
export function inciVariants(token: string): string[] {
  const k = baseKey(token);
  const out = new Set<string>([k]);
  const outside = k.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  if (outside) out.add(outside);
  for (const m of k.matchAll(/\(([^)]*)\)/g)) {
    const inner = m[1]!.trim();
    if (inner) out.add(inner);
  }
  const flat = k.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
  if (flat) out.add(flat);
  for (const v of [...out]) {
    if (!v.includes('/')) continue;
    const parts = v.split('/').map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1 && parts.every((p) => SYNONYM_TO_CANONICAL.has(p))) parts.forEach((p) => out.add(p));
  }
  for (const v of [...out]) {
    const canonical = SYNONYM_TO_CANONICAL.get(v);
    if (canonical) out.add(baseKey(canonical));
  }
  return [...out];
}

/** Canonical display name: the CosIng-style name when known, otherwise the cleaned token without parentheticals. */
export function normaliseInci(token: string): string {
  for (const v of inciVariants(token)) {
    const canonical = SYNONYM_TO_CANONICAL.get(v);
    if (canonical) return canonical;
  }
  const cleaned = cleanRaw(token).replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned || cleanRaw(token);
}

function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of text) {
    if (ch === '(' || ch === '[') depth++;
    if ((ch === ')' || ch === ']') && depth > 0) depth--;
    if ((ch === ',' || ch === ';') && depth === 0) {
      parts.push(current);
      current = '';
    } else current += ch;
  }
  parts.push(current);
  return parts;
}

/** Splits a printed ingredient list into ordered tokens. Commas inside parentheses do not split. */
export function parseInciList(text: string): InciToken[] {
  const body = text
    .replace(/^\s*(full\s+)?ingredients?(\s+list)?\s*[:\-–]\s*/i, '')
    .replace(/\r?\n|•|·/g, ',');
  const tokens: InciToken[] = [];
  for (const piece of splitTopLevel(body)) {
    let t = cleanRaw(piece)
      .replace(/^(may contain|\+\/-)\s*[:(]?\s*/i, '')
      .replace(/^\[|\]$/g, '')
      .trim();
    if ((t.match(/\(/g)?.length ?? 0) < (t.match(/\)/g)?.length ?? 0)) t = t.replace(/\)+$/, '').trim();
    if ((t.match(/\(/g)?.length ?? 0) > (t.match(/\)/g)?.length ?? 0)) t = t.replace(/\($/, '').trim();
    t = t.replace(/\.$/, (dot) => (/\bdenat$/i.test(t.slice(0, -1)) ? dot : '')).trim();
    if (!t) continue;
    tokens.push({ token: t, position: tokens.length + 1 });
  }
  return tokens;
}

/** Wraps plain strings (catalogue rows, OCR chips) as ordered tokens. */
export function toInciTokens(list: readonly (string | InciToken)[]): InciToken[] {
  return list
    .map((t, i) => (typeof t === 'string' ? { token: cleanRaw(t), position: i + 1 } : t))
    .filter((t) => t.token.length > 0);
}

export interface InciMatcher {
  names: readonly string[];
  patterns?: readonly string[];
  excludes?: readonly string[];
}

const regexCache = new Map<string, RegExp>();
function re(source: string): RegExp {
  let r = regexCache.get(source);
  if (!r) {
    r = new RegExp(source, 'i');
    regexCache.set(source, r);
  }
  return r;
}

export function matchesInci(token: string, set: InciMatcher): boolean {
  const variants = inciVariants(token);
  if (set.excludes?.some((p) => variants.some((v) => re(p).test(v)))) return false;
  const names = set.names.map((n) => inciKey(n));
  return variants.some((v) => names.includes(v) || (set.patterns ?? []).some((p) => re(p).test(v)));
}
