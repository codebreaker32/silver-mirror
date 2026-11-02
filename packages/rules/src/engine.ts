import {
  COPY,
  type CatalogProduct,
  type Claim,
  type InciSource,
  type InciToken,
  type KeyProfile,
  type LabelCheckHit,
  type ProductCategory,
  type RankedMatch,
  type Reason,
  type ReasonReading,
  type Rule,
  type Verdict,
  type VerdictLabel,
  type VerdictBasis,
  type VerdictResult,
} from '@skinkey/contracts';
import { BAND_CUTOFFS } from './bands';
import { inciVariants, matchesInci } from './inci';
import { formatScanDate, fillTemplate, readingPhrase } from './phrasing';
import { FACET_MAP, READING_PROFILES } from './profiles';
import { CLAIM_PHRASE, MEDICINE_TOKENS, RULES, RULESET_VERSION, gradeRank } from './rules';
import { sha256Hex, stableStringify } from './sha256';

export function rulesetHash(rules: readonly Rule[] = RULES): string {
  const payload = {
    version: RULESET_VERSION,
    rules,
    bandCutoffs: BAND_CUTOFFS,
    profiles: READING_PROFILES,
    facetMap: FACET_MAP,
    medicineTokens: MEDICINE_TOKENS,
  };
  return sha256Hex(stableStringify(payload)).slice(0, 12);
}

export interface MedicineGateResult {
  gated: boolean;
  token?: string;
  via?: 'inci' | 'title';
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function titleMentions(title: string, token: string): boolean {
  const lower = title.toLowerCase().replace(/[‐-―]/g, '-');
  const re = new RegExp(`\\b${escapeRe(token)}\\b`, 'g');
  for (const m of lower.matchAll(re)) {
    const before = lower.slice(0, m.index);
    const after = lower.slice(m.index + m[0].length);
    if (/^\s*-?\s*free\b/.test(after)) continue;
    if (/\b(no|non|without|free from|free of)\s*-?\s*$/.test(before)) continue;
    return true;
  }
  return false;
}

/** MEDICINE gate (spec §2E): a gated token in the INCI or the title means no verdict and no better matches. */
export function medicineGate(inci: readonly InciToken[] | null, title?: string): MedicineGateResult {
  for (const t of [...(inci ?? [])].sort((a, b) => a.position - b.position)) {
    const variants = inciVariants(t.token);
    const hit = MEDICINE_TOKENS.find((m) => variants.some((v) => new RegExp(`^${escapeRe(m)}\\b`).test(v)));
    if (hit) return { gated: true, token: hit, via: 'inci' };
  }
  if (title) {
    const hit = MEDICINE_TOKENS.find((m) => titleMentions(title, m));
    if (hit) return { gated: true, token: hit, via: 'title' };
  }
  return { gated: false };
}

const sourceUrlOf = (rule: Rule) => rule.sources.find((s) => s.url)?.url;

function firstMatch(rule: Rule, inci: readonly InciToken[]): InciToken | undefined {
  return [...inci]
    .sort((a, b) => a.position - b.position)
    .find((t) => (rule.positionLimit === undefined || t.position <= rule.positionLimit) && matchesInci(t.token, rule.inciSet));
}

export function labelCheck(claims: readonly Claim[], inci: readonly InciToken[], rules: readonly Rule[] = RULES): LabelCheckHit[] {
  const hits: LabelCheckHit[] = [];
  for (const rule of rules) {
    if (rule.kind !== 'LABEL_CHECK') continue;
    for (const trigger of rule.triggers) {
      if (trigger.on !== 'claim') continue;
      const claim = claims.find((c) => c.type === trigger.claim);
      if (!claim) continue;
      const token = firstMatch(rule, inci);
      if (!token) continue;
      const phrase = CLAIM_PHRASE[claim.type] ?? claim.type;
      hits.push({
        ruleId: rule.ruleId,
        claim: phrase,
        ...(claim.quote ? { quote: claim.quote } : {}),
        matchedToken: token.token,
        position: token.position,
        grade: rule.grade,
        counted: rule.counted,
        contested: rule.contested,
        plain: fillTemplate(rule.template, { claim: phrase, ingredient: token.token }),
      });
      break;
    }
  }
  return hits.sort((a, b) => Number(b.counted) - Number(a.counted));
}

function triggerReading(rule: Rule, key: KeyProfile): ReasonReading | null {
  const zoneFirst = key.copySet === 'A';
  const ordered = [...rule.triggers].sort((a, b) => {
    const rank = (t: Rule['triggers'][number]) => (t.on === 'zone' ? (zoneFirst ? 0 : 2) : 1);
    return rank(a) - rank(b);
  });
  for (const t of ordered) {
    if (t.on === 'band') {
      const b = key.bands[t.concern];
      if (t.levels.includes(b.level)) {
        return { on: 'band', concern: t.concern, level: b.level, region: b.region, selfReported: b.selfReported };
      }
    } else if (t.on === 'zone' && key.copySet === 'A') {
      const value = key.zones[t.zone];
      if (value && t.classes.includes(value)) return { on: 'zone', zone: t.zone, value };
    }
  }
  return null;
}

/** The token as listed, in the spec's casing ("Contains isopropyl myristate"). Acronyms such as NP or PEG stay upper case. */
function ingredientDisplay(token: string): string {
  return token
    .trim()
    .split(' ')
    .map((w) => (/^[A-Z0-9-]{2,}$/.test(w) ? w : w.toLowerCase()))
    .join(' ');
}

function fitReason(rule: Rule, key: KeyProfile, reading: ReasonReading, token: InciToken, inciSourceUrl?: string): Reason {
  const nosePores = reading.on === 'band' && reading.concern === 'oiliness' && key.pores.nose === 'High';
  const lead = readingPhrase(key, reading) + (nosePores ? ' · Nose pore reading: High' : '');
  const glyphZone = reading.on === 'zone' ? reading.zone : nosePores ? 'nose' : reading.on === 'band' ? reading.region : undefined;
  const sourceUrl = sourceUrlOf(rule);
  return {
    ruleId: rule.ruleId,
    kind: rule.kind,
    grade: rule.grade,
    reading,
    ingredient: token.token,
    plain: `${lead}. ${fillTemplate(rule.template, { ingredient: ingredientDisplay(token.token) })}`,
    ...(sourceUrl ? { sourceUrl } : {}),
    ...(inciSourceUrl ? { inciSourceUrl } : {}),
    counted: rule.counted,
    ...(glyphZone ? { glyphZone } : {}),
  };
}

export function fitReasons(
  kind: 'FIT_CAUTION' | 'FIT_SUPPORT',
  key: KeyProfile,
  inci: readonly InciToken[],
  rules: readonly Rule[] = RULES,
  inciSourceUrl?: string,
): Reason[] {
  const out: { reason: Reason; order: number; position: number }[] = [];
  rules.forEach((rule, order) => {
    if (rule.kind !== kind) return;
    const reading = triggerReading(rule, key);
    if (!reading) return;
    const token = firstMatch(rule, inci);
    if (!token) return;
    out.push({ reason: fitReason(rule, key, reading, token, inciSourceUrl), order, position: token.position });
  });
  return out
    .sort((a, b) => gradeRank(a.reason.grade) - gradeRank(b.reason.grade) || a.order - b.order || a.position - b.position)
    .map((x) => x.reason);
}

export interface VerdictInput {
  key: KeyProfile | null;
  inci: readonly InciToken[] | null;
  inciSource: InciSource | null;
  inciSourceUrl?: string;
  claims: readonly Claim[];
  title?: string;
  rules?: readonly Rule[];
}

export type { VerdictBasis, VerdictResult };

export const NO_READINGS_SUBTITLE = COPY.noReadingsSubtitle;
export const NAME_ONLY_NOTE = COPY.nameOnlyNote;

function provenanceLine(key: KeyProfile | null, inciSource: InciSource | null, hash: string): string {
  const parts: string[] = [];
  if (!key) parts.push('No readings');
  else if (key.source === 'demo') parts.push('Sample readings (Demo reading)');
  else {
    parts.push(`Measured by YouCam Skin Analysis HD, ${formatScanDate(key.scanDate)}`);
    parts.push(key.photoDeleted ? 'photo deleted' : 'photo delete pending');
  }
  if (inciSource === 'label_photo_confirmed') parts.push(COPY.labelPhotoProvenance.replace(/\.$/, ''));
  parts.push(`rules v${hash}`);
  return parts.join(' · ');
}

/** Pure, deterministic. Never takes ui_score, network or LLM input (spec §4). */
export function verdict(input: VerdictInput): VerdictResult {
  const rules = input.rules ?? RULES;
  const hash = rulesetHash(rules);
  const { key } = input;
  const hasInci = !!input.inci && input.inci.length > 0 && input.inciSource !== null;
  const inci = hasInci ? input.inci! : [];
  const provenance = {
    readingSource: key?.source ?? null,
    scanDate: key?.scanDate ?? null,
    photoDeleted: key?.photoDeleted ?? false,
    inciSource: hasInci ? input.inciSource : null,
    ...(hasInci && input.inciSourceUrl ? { inciSourceUrl: input.inciSourceUrl } : {}),
    rulesetHash: hash,
    line: provenanceLine(key, hasInci ? input.inciSource : null, hash),
  };
  const result = (label: VerdictLabel, subtitle: string, basis: VerdictBasis, extra: Partial<VerdictResult> = {}): VerdictResult => ({
    label,
    subtitle,
    reasons: [],
    labelChecks: [],
    provenance,
    basis,
    ...extra,
  });

  const gate = medicineGate(input.inci, input.title);
  if (gate.gated) return result('MEDICINE', COPY.medicine(gate.token!), 'medicine', { medicineToken: gate.token! });

  if (!hasInci) {
    return result('UNKNOWN', COPY.subtitle.UNKNOWN, input.title ? 'name_only' : 'none', input.title ? { note: NAME_ONLY_NOTE } : {});
  }

  const labelChecks: Reason[] = labelCheck(input.claims, inci, rules).map((hit) => {
    const rule = rules.find((r) => r.ruleId === hit.ruleId)!;
    const sourceUrl = sourceUrlOf(rule);
    return {
      ruleId: hit.ruleId,
      kind: 'LABEL_CHECK',
      grade: hit.grade,
      reading: { on: 'claim', claim: hit.claim, ...(hit.quote ? { quote: hit.quote } : {}) },
      ingredient: hit.matchedToken,
      plain: hit.plain,
      ...(sourceUrl ? { sourceUrl } : {}),
      ...(input.inciSourceUrl ? { inciSourceUrl: input.inciSourceUrl } : {}),
      counted: hit.counted,
    };
  });

  if (!key) return result('UNKNOWN', NO_READINGS_SUBTITLE, 'no_readings', { labelChecks });

  const cautions = fitReasons('FIT_CAUTION', key, inci, rules, input.inciSourceUrl);
  if (cautions.length) return result('CAUTION', COPY.subtitle.CAUTION, 'ingredients', { reasons: cautions, labelChecks });

  const supports = fitReasons('FIT_SUPPORT', key, inci, rules, input.inciSourceUrl);
  return result('FITS', COPY.subtitle.FITS, 'ingredients', {
    reasons: supports,
    labelChecks,
    ...(supports.length ? {} : { note: COPY.fitsNoFlags }),
  });
}

export interface RankOptions {
  limit?: number;
  excludeId?: string;
  category?: ProductCategory;
  includeCaution?: boolean;
}

/** The only product fields ranking may read. Brand, price, billing and affiliate fields are dropped here (spec §7 firewall). */
type RankInput = Pick<CatalogProduct, 'id' | 'name' | 'category' | 'inci' | 'claims' | 'verified' | 'status' | 'source_url'>;

const toRankInput = (p: CatalogProduct): RankInput => ({
  id: p.id,
  name: p.name,
  category: p.category,
  inci: p.inci,
  claims: p.claims,
  verified: p.verified,
  status: p.status,
  source_url: p.source_url,
});

/** Takes no brand, billing or affiliate input (spec §7 firewall). Ties break on catalogue id. */
export function rank(products: readonly CatalogProduct[], key: KeyProfile, options: RankOptions = {}): RankedMatch[] {
  const ranked: RankedMatch[] = [];
  for (const p of products.map(toRankInput)) {
    if (p.id === options.excludeId) continue;
    if (options.category && p.category !== options.category) continue;
    if (!p.verified || p.status !== 'verified' || p.inci.length === 0) continue;
    const v = verdict({ key, inci: p.inci, inciSource: 'catalog_verified', inciSourceUrl: p.source_url, claims: p.claims, title: p.name });
    if (v.label !== 'FITS' && !(v.label === 'CAUTION' && options.includeCaution)) continue;
    const strictMismatches = v.labelChecks.filter((r) => r.counted).length;
    const score = (v.label === 'FITS' ? 100 + 10 * v.reasons.length : -10 * v.reasons.length) - 5 * strictMismatches;
    ranked.push({
      productId: p.id,
      label: v.label,
      score,
      reasonLine: v.reasons[0]?.plain ?? v.note ?? COPY.fitsNoFlags,
      searchUrl: flipkartSearchUrl(p.name),
    });
  }
  ranked.sort((a, b) => b.score - a.score || (a.productId < b.productId ? -1 : a.productId > b.productId ? 1 : 0));
  return options.limit === undefined ? ranked : ranked.slice(0, options.limit);
}

/** Flipkart keyword search for a product name ("opens a Flipkart search"). */
export function flipkartSearchUrl(query: string): string {
  return `https://www.flipkart.com/search?q=${encodeURIComponent(query.trim().replace(/\s+/g, ' ')).replace(/%20/g, '+')}`;
}
