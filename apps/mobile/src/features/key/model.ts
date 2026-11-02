import { KeyProfile, type Band, type Concern, type PoreRegion } from '@skinkey/contracts';

export const CONCERNS: readonly Concern[] = ['oiliness', 'moisture', 'redness', 'pore'];

export const CONCERN_LABEL: Record<Concern, string> = {
  oiliness: 'Oiliness',
  moisture: 'Moisture',
  redness: 'Redness',
  pore: 'Pores',
};

export const BANDS: readonly Band[] = ['Low', 'Medium', 'High'];

export const SELF_REPORTED_TAG = 'self-reported, not measured';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatScanDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

export function isExpired(key: KeyProfile, now: Date): boolean {
  return new Date(key.expiresAt).getTime() <= now.getTime();
}

export function parseStoredKey(raw: string | null): KeyProfile | null {
  if (!raw) return null;
  try {
    const parsed = KeyProfile.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function applyBandEdit(key: KeyProfile, concern: Concern, level: Band): KeyProfile {
  const current = key.bands[concern];
  const measured = current.selfReported ? current.measuredLevel : current.level;
  const backToMeasured = measured !== undefined && measured === level;
  const reading = backToMeasured
    ? { level, region: current.region, selfReported: false }
    : { level, region: current.region, selfReported: true, ...(measured ? { measuredLevel: measured } : {}) };
  const selfReported = key.selfReported.filter((c) => c !== concern);
  if (!backToMeasured) selfReported.push(concern);
  return { ...key, bands: { ...key.bands, [concern]: reading }, selfReported };
}

export type GlyphZone = 'forehead' | 'nose' | 'leftCheek' | 'rightCheek' | 'chin';
export const GLYPH_ZONES: readonly GlyphZone[] = ['forehead', 'nose', 'leftCheek', 'rightCheek', 'chin'];

export interface GlyphModel {
  title: string;
  zones: Record<GlyphZone, Band | null>;
  lines: string[];
  accessibilityLabel: string;
}

const ZONE_NAME: Record<GlyphZone, string> = {
  forehead: 'forehead',
  nose: 'nose',
  leftCheek: 'left cheek',
  rightCheek: 'right cheek',
  chin: 'chin',
};

const lower = (b: Band) => b.toLowerCase();

/** "scan 1 Nov", or "sample reading" for the Demo reading (never described as a scan). */
export const readingWhen = (key: KeyProfile) => (key.source === 'demo' ? 'sample reading' : `scan ${formatScanDate(key.scanDate)}`);

/** Caption under the zone glyph. The Demo reading says so; a real scan names its date. */
export const zoneCaption = (key: KeyProfile) =>
  key.source === 'demo' ? 'Sample zones · Demo reading · no photo taken' : `Zones from your ${formatScanDate(key.scanDate)} scan · no photo kept`;

export function glyphFromKey(key: KeyProfile): GlyphModel {
  const when = readingWhen(key);
  const pores = key.pores as Partial<Record<PoreRegion, Band>>;
  const hasPoreRegions = Boolean(pores.forehead || pores.nose || pores.cheek);
  const zones: Record<GlyphZone, Band | null> = hasPoreRegions
    ? {
        forehead: pores.forehead ?? null,
        nose: pores.nose ?? null,
        leftCheek: pores.cheek ?? null,
        rightCheek: pores.cheek ?? null,
        chin: null,
      }
    : {
        forehead: key.bands.oiliness.level,
        nose: key.bands.oiliness.level,
        leftCheek: key.bands.oiliness.level,
        rightCheek: key.bands.oiliness.level,
        chin: key.bands.oiliness.level,
      };

  const lines: string[] = [];
  if (key.copySet === 'A' && (key.zones.t_zone || key.zones.u_zone)) {
    if (key.zones.t_zone) lines.push(`T-zone reading: ${key.zones.t_zone} (${when})`);
    if (key.zones.u_zone) lines.push(`U-zone reading: ${key.zones.u_zone} (${when})`);
  } else {
    lines.push(`Oiliness reading: ${key.bands.oiliness.level} (whole face, ${when})`);
  }
  if (pores.nose) lines.push(`Nose pore reading: ${pores.nose}`);
  if (pores.forehead) lines.push(`Forehead pore reading: ${pores.forehead}`);
  if (pores.cheek) lines.push(`Cheek pore reading: ${pores.cheek}`);

  const title = hasPoreRegions ? 'Pore reading by zone' : 'Oiliness reading, whole face';
  const described = GLYPH_ZONES.filter((z) => zones[z] !== null)
    .map((z) => `${ZONE_NAME[z]} ${lower(zones[z] as Band)}`)
    .join(', ');
  return {
    title,
    zones,
    lines,
    accessibilityLabel: `${title}: ${described || 'no zone detail'}. No photo kept.`,
  };
}

export function bandA11yLabel(concern: Concern, key: KeyProfile): string {
  const b = key.bands[concern];
  return `${CONCERN_LABEL[concern]} reading: ${lower(b.level)}${b.selfReported ? `, ${SELF_REPORTED_TAG}` : ''}.`;
}
