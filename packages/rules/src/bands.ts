import type {
  Band,
  BandCutoffs,
  BandReading,
  Concern,
  KeyProfile,
  KeySource,
  PoreRegion,
  RawScoreReading,
  SkinTypeClass,
  SkinTypeZone,
} from '@skinkey/contracts';

/**
 * Published before the audit runs and never tuned to it (spec §5). ASSUMPTION placeholders: Low <40, Medium 40-69,
 * High >=70 on the band's own quantity. YouCam documents raw_score as "higher = healthier-looking", so oiliness,
 * redness and pore bands invert raw_score while moisture follows it. Gate G1 confirms the direction.
 */
export const BAND_CUTOFFS: BandCutoffs = {
  lowBelow: 40,
  highFrom: 70,
  direction: {
    oiliness: 'higher_is_less_visible',
    moisture: 'higher_is_more_visible',
    redness: 'higher_is_less_visible',
    pore: 'higher_is_less_visible',
  },
};

export const CONCERNS: readonly Concern[] = ['oiliness', 'moisture', 'redness', 'pore'];

/** Direction in which each band means "more of the cosmetic concern" (used by the monotonicity tests). */
export const CONCERN_WORSENS: Record<Concern, readonly Band[]> = {
  oiliness: ['Low', 'Medium', 'High'],
  moisture: ['High', 'Medium', 'Low'],
  redness: ['Low', 'Medium', 'High'],
  pore: ['Low', 'Medium', 'High'],
};

export const KEY_LIFETIME_DAYS = 30;

export function bandFor(rawScore: number, concern: Concern, cutoffs: BandCutoffs = BAND_CUTOFFS): Band {
  if (!Number.isFinite(rawScore)) throw new Error(`raw_score must be a finite number (got ${rawScore})`);
  const clamped = Math.min(100, Math.max(0, rawScore));
  const oriented = cutoffs.direction[concern] === 'higher_is_more_visible' ? clamped : 100 - clamped;
  if (oriented < cutoffs.lowBelow) return 'Low';
  if (oriented >= cutoffs.highFrom) return 'High';
  return 'Medium';
}

const TYPE_TO_CONCERN: Record<string, Concern> = {
  hd_oiliness: 'oiliness',
  hd_moisture: 'moisture',
  hd_redness: 'redness',
  hd_pore: 'pore',
  oiliness: 'oiliness',
  moisture: 'moisture',
  redness: 'redness',
  pore: 'pore',
};

const PORE_REGIONS: readonly PoreRegion[] = ['whole', 'forehead', 'nose', 'cheek'];

/** Published rule for a skin type when YouCam returns no hd_skin_type label (copy set B). */
export function deriveSkinType(bands: Record<Concern, Band>): SkinTypeClass {
  const oily = bands.oiliness === 'High';
  const dry = bands.moisture === 'Low';
  const base = oily && dry ? 'Combination' : oily ? 'Oily' : dry ? 'Dry' : 'Normal';
  if (bands.redness !== 'High') return base;
  return base === 'Normal' ? 'Redness' : (`${base} & Redness` as SkinTypeClass);
}

export interface BuildKeyInput {
  readings: readonly RawScoreReading[];
  scanDate: string;
  source: KeySource;
  scanId?: string;
  photoDeleted: boolean;
  /** hd_skin_type labels per zone, only when gate G1 shows YouCam returns them. */
  zones?: Partial<Record<SkinTypeZone, SkinTypeClass>>;
  cutoffs?: BandCutoffs;
}

function assertNoUiScore(reading: unknown): void {
  if (reading && typeof reading === 'object' && 'ui_score' in reading) {
    throw new Error('ui_score reached @skinkey/rules; bands come from raw_score only (spec §5)');
  }
}

/** Builds the on-phone Key from raw_score readings only. Rejects any ui_score input. */
export function buildKeyProfile(input: BuildKeyInput): KeyProfile {
  const cutoffs = input.cutoffs ?? BAND_CUTOFFS;
  const whole: Partial<Record<Concern, Band>> = {};
  const pores: Partial<Record<PoreRegion, Band>> = {};

  for (const reading of input.readings) {
    assertNoUiScore(reading);
    const concern = TYPE_TO_CONCERN[reading.type];
    if (!concern) continue;
    const region = reading.region ?? 'whole';
    const band = bandFor(reading.raw_score, concern, cutoffs);
    if (concern === 'pore') {
      if ((PORE_REGIONS as readonly string[]).includes(region)) pores[region as PoreRegion] = band;
      if (region === 'whole') whole.pore = band;
    } else if (region === 'whole') whole[concern] = band;
  }
  if (!whole.pore && Object.keys(pores).length > 0) {
    whole.pore = (['High', 'Medium', 'Low'] as const).find((b) => Object.values(pores).includes(b));
  }

  const missing = CONCERNS.filter((c) => !whole[c]);
  if (missing.length) throw new Error(`Missing readings for: ${missing.join(', ')}`);
  const levels = whole as Record<Concern, Band>;

  const zones = { ...(input.zones ?? {}) };
  const scan = new Date(input.scanDate);
  if (Number.isNaN(scan.getTime())) throw new Error(`Invalid scanDate: ${input.scanDate}`);
  const reading = (c: Concern): BandReading => ({ level: levels[c], region: 'whole', selfReported: false });

  return {
    version: 1,
    source: input.source,
    ...(input.scanId ? { scanId: input.scanId } : {}),
    scanDate: scan.toISOString(),
    expiresAt: new Date(scan.getTime() + KEY_LIFETIME_DAYS * 86_400_000).toISOString(),
    copySet: zones.whole || zones.t_zone ? 'A' : 'B',
    bands: { oiliness: reading('oiliness'), moisture: reading('moisture'), redness: reading('redness'), pore: reading('pore') },
    pores,
    zones,
    skinType: zones.whole ? { value: zones.whole, derived: false } : { value: deriveSkinType(levels), derived: true },
    selfReported: [],
    photoDeleted: input.photoDeleted,
  };
}

/** "Feels wrong? Edit": marks the band self-reported and keeps the measured level for provenance. */
export function applySelfReport(key: KeyProfile, concern: Concern, level: Band): KeyProfile {
  const current = key.bands[concern];
  const measured = current.selfReported ? current.measuredLevel : current.level;
  const backToMeasured = measured !== undefined && measured === level;
  const next: BandReading = backToMeasured
    ? { level, region: current.region, selfReported: false }
    : { level, region: current.region, selfReported: true, ...(measured ? { measuredLevel: measured } : {}) };
  const bands = { ...key.bands, [concern]: next };
  const selfReported = backToMeasured
    ? key.selfReported.filter((c) => c !== concern)
    : [...new Set([...key.selfReported, concern])];
  const skinType =
    key.skinType && !key.skinType.derived
      ? key.skinType
      : {
          value: deriveSkinType({
            oiliness: bands.oiliness.level,
            moisture: bands.moisture.level,
            redness: bands.redness.level,
            pore: bands.pore.level,
          }),
          derived: true,
        };
  return { ...key, bands, selfReported, skinType };
}

export function isKeyExpired(key: KeyProfile, now: Date = new Date()): boolean {
  return new Date(key.expiresAt).getTime() <= now.getTime();
}
