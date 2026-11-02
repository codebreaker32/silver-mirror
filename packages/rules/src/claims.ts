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
    // A phrase made only of type words ("Oily", "Oily/Combination") counts without the word "skin".
    const bare = /^[a-z]+(\s*\/\s*[a-z]+)*$/i.test(phrase.trim());
    if (/\ball skin types?\b|\bevery\b.*\bskin type\b|\bany skin type\b/i.test(phrase)) add('for_all_skin_types', phrase);
    else if (/\bskin\b/i.test(phrase) || bare) for (const [type, re] of SKIN_TYPE) if (re.test(phrase)) add(type, phrase);
  }
  for (const [type, re] of FREE_FROM) if (re.test(name)) add(type, name);
  return out;
}

/** Claim tags the audit counts (audit/METHOD.md). `non_comedogenic` is audit-only: no label rule reads it. */
export type AuditClaimType = Exclude<ClaimType, 'one_shade' | 'universal_tint'> | 'non_comedogenic';
export interface AuditClaim {
  type: AuditClaimType;
  quote: string;
}

export const AUDIT_CLAIM_TYPES: readonly AuditClaimType[] = [
  'fragrance_free',
  'alcohol_free',
  'oil_free',
  'non_comedogenic',
  'for_oily_skin',
  'for_combination_skin',
  'for_dry_skin',
  'for_sensitive_skin',
  'for_all_skin_types',
];

const NON_COMEDOGENIC = /\bnon[- ]?comedogenic\b/i;

/** Brand-page claims for the audit: the shared phrase match plus "non-comedogenic", in AUDIT_CLAIM_TYPES order. */
export function auditClaims(phrases: readonly string[], name = ''): AuditClaim[] {
  const found = new Map<AuditClaimType, string>();
  for (const c of claimsFromMarketedFor(phrases, name)) {
    if (c.type !== 'one_shade' && c.type !== 'universal_tint') found.set(c.type, c.quote ?? '');
  }
  const nc = [...phrases.filter((p) => !NEGATED.test(p)), name].find((p) => NON_COMEDOGENIC.test(p));
  if (nc) found.set('non_comedogenic', nc);
  return AUDIT_CLAIM_TYPES.filter((t) => found.has(t)).map((type) => ({ type, quote: found.get(type)! }));
}
