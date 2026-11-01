export { BAND_CUTOFFS, CONCERNS, CONCERN_WORSENS, KEY_LIFETIME_DAYS, applySelfReport, bandFor, buildKeyProfile, deriveSkinType, isKeyExpired } from './bands';
export type { BuildKeyInput } from './bands';
export { inciKey, inciVariants, matchesInci, normaliseInci, parseInciList, toInciTokens } from './inci';
export type { InciMatcher } from './inci';
export {
  CLAIM_PHRASE,
  ESSENTIAL_OIL_PATTERNS,
  EU_LABELLED_FRAGRANCE_SUBSTANCES,
  FRAGRANCE_LIST_EXCLUSIONS,
  MEDICINE_TOKENS,
  RULES,
  RULESET_VERSION,
} from './rules';
export { SOURCES } from './sources';
export { FACET_MAP, READING_PROFILES, facetFor, profileKey } from './profiles';
export { CONCERN_LABEL, ZONE_LABEL, fillTemplate, formatScanDate, readingPhrase } from './phrasing';
export {
  NAME_ONLY_NOTE,
  NO_READINGS_SUBTITLE,
  fitReasons,
  flipkartSearchUrl,
  labelCheck,
  medicineGate,
  rank,
  rulesetHash,
  verdict,
} from './engine';
export type { MedicineGateResult, RankOptions, VerdictBasis, VerdictInput, VerdictResult } from './engine';
export { ALLOWLIST, BANNED_PHRASES, COPY_SET_B_BANNED, lintCopy } from './lint';
export type { BannedPhrase, LintViolation } from './lint';
export { sha256Hex, stableStringify } from './sha256';
export { buildCatalog, catalogId, toCatalogProduct } from './catalog';
export type { BuiltCatalogRow, ClaimsSource } from './catalog';
export { claimsFromMarketedFor } from './claims';
