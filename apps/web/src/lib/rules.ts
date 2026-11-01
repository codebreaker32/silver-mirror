import { BAND_CUTOFFS, FACET_MAP, MEDICINE_TOKENS, READING_PROFILES, RULES, profileKey, rulesetHash, verdict } from '@skinkey/rules';
import type { Claim, ReadingProfile, Rule, RulesResponse, VerdictLabel } from '@skinkey/contracts';

const attempt = <T>(fn: () => T): T | null => {
  try {
    return fn();
  } catch {
    return null;
  }
};

export interface RulesData {
  source: 'package' | 'worker';
  rules: readonly Rule[];
  bandCutoffs: RulesResponse['bandCutoffs'];
  profiles: readonly ReadingProfile[];
  facetMap: readonly RulesResponse['facetMap'][number][];
  hash: string | null;
}

/** The rules package as bundled at build time. `null` while the package has no rules yet. */
export function bundledRules(): RulesData | null {
  if (!RULES.length) return null;
  return {
    source: 'package',
    rules: RULES,
    bandCutoffs: BAND_CUTOFFS,
    profiles: READING_PROFILES,
    facetMap: FACET_MAP,
    hash: attempt(() => rulesetHash(RULES)),
  };
}

export const fromWorker = (r: RulesResponse): RulesData => ({
  source: 'worker',
  rules: r.rules,
  bandCutoffs: r.bandCutoffs,
  profiles: r.profiles,
  facetMap: r.facetMap,
  hash: r.rulesetHash,
});

export { profileKey };

export const safeVerdict = (input: Parameters<typeof verdict>[0]): ReturnType<typeof verdict> | null => attempt(() => verdict(input));

const LOOKUP_CLAIMS: Claim[] = [{ type: 'fragrance_free' }, { type: 'alcohol_free' }, { type: 'oil_free' }];

export interface IngredientHit {
  ruleId: string;
  rule: Rule | undefined;
  profiles: string[];
  viaClaim: boolean;
}

export interface IngredientLookup {
  token: string;
  medicine: string | null;
  hits: IngredientHit[];
  byProfile: { profile: ReadingProfile; label: VerdictLabel }[];
}

/**
 * Which published rules read one ingredient, run through the real verdict() for every reading profile.
 * The ingredient is treated as a one-line, user-confirmed label with every label claim present.
 */
export function lookupIngredient(token: string): IngredientLookup | null {
  const t = token.trim();
  if (!t || !RULES.length || !READING_PROFILES.length) return null;
  const hits = new Map<string, IngredientHit>();
  const byProfile: IngredientLookup['byProfile'] = [];
  let medicine: string | null = null;
  for (const profile of READING_PROFILES) {
    const v = safeVerdict({
      key: profileKey(profile),
      inci: [{ token: t, position: 1 }],
      inciSource: 'label_photo_confirmed',
      claims: LOOKUP_CLAIMS,
    });
    if (!v) return null;
    byProfile.push({ profile, label: v.label });
    if (v.medicineToken) medicine = v.medicineToken;
    for (const r of [...v.reasons, ...v.labelChecks]) {
      if (!r.ingredient) continue;
      const hit = hits.get(r.ruleId) ?? { ruleId: r.ruleId, rule: RULES.find((x) => x.ruleId === r.ruleId), profiles: [], viaClaim: r.kind === 'LABEL_CHECK' };
      if (r.kind !== 'LABEL_CHECK') hit.profiles.push(profile.label);
      hits.set(r.ruleId, hit);
    }
  }
  return { token: t, medicine, hits: [...hits.values()], byProfile };
}

export const medicineTokenCount = () => MEDICINE_TOKENS.length;
