import type { Claim, ClaimType } from '@skinkey/contracts';

const FREE_FROM: [ClaimType, RegExp][] = [
  ['fragrance_free', /\bfragrance[- ]free\b/i],
  ['alcohol_free', /\balcohol[- ]free\b/i],
  ['oil_free', /\boil[- ]free\b/i],
];

const SKIN_TYPE: [ClaimType, RegExp][] = [
  ['for_oily_skin', /\boily\b/i],
  ['for_dry_skin', /\bdry\b/i],
  ['for_combination_skin', /\bcombination\b/i],
  ['for_sensitive_skin', /\bsensitive\b/i],
];

const NEGATED = /\bnot (suitable )?for\b/i;

/**
 * Deterministic phrase match for brand rows that predate X5 claim spans, recorded as claims_source so it is visible.
 * Free-from claims are read from the marketed_for phrases and the product name; skin-type claims need the word "skin"
 * or a bare type word ("oily"), so "dry touch finish" is not a dry-skin claim.
 */
export function claimsFromMarketedFor(phrases: readonly string[], name = ''): Claim[] {
  const out: Claim[] = [];
  const add = (type: ClaimType, quote: string) => {
    if (!out.some((c) => c.type === type)) out.push({ type, quote });
  };
  for (const phrase of phrases) {
    if (NEGATED.test(phrase)) continue;
    for (const [type, re] of FREE_FROM) if (re.test(phrase)) add(type, phrase);
    const bare = /^[a-z]+$/i.test(phrase.trim());
    if (/\ball skin types?\b|\bevery\b.*\bskin type\b|\bany skin type\b/i.test(phrase)) add('for_all_skin_types', phrase);
    else if (/\bskin\b/i.test(phrase) || bare) for (const [type, re] of SKIN_TYPE) if (re.test(phrase)) add(type, phrase);
  }
  for (const [type, re] of FREE_FROM) if (re.test(name)) add(type, name);
  return out;
}
