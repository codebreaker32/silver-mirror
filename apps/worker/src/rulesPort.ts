import * as rules from '@skinkey/rules';

/** The Worker's view of @skinkey/rules. Injected so route tests do not depend on rule bodies RULES is still writing. */
export type RulesPort = Pick<
  typeof rules,
  | 'buildKeyProfile'
  | 'labelCheck'
  | 'medicineGate'
  | 'verdict'
  | 'rulesetHash'
  | 'RULES'
  | 'BAND_CUTOFFS'
  | 'READING_PROFILES'
  | 'FACET_MAP'
  | 'profileKey'
>;

export const realRules: RulesPort = rules;
