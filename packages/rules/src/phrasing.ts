import type { Concern, KeyProfile, ReasonReading, SkinTypeZone } from '@skinkey/contracts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const IST_OFFSET_MS = 330 * 60_000;

/** "1 Nov", in India Standard Time (fixed offset, no DST), so phone, Worker and web agree. */
export function formatScanDate(iso: string): string {
  const d = new Date(new Date(iso).getTime() + IST_OFFSET_MS);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

export const CONCERN_LABEL: Record<Concern, string> = {
  oiliness: 'Oiliness',
  moisture: 'Moisture',
  redness: 'Redness',
  pore: 'Pore',
};

export const ZONE_LABEL: Record<SkinTypeZone, string> = {
  whole: 'Skin type',
  t_zone: 'T-zone',
  u_zone: 'U-zone',
};

const REGION_LABEL: Record<string, string> = {
  whole: 'whole face',
  nose: 'nose',
  forehead: 'forehead',
  cheek: 'cheeks',
};

const regionLabel = (region: string) => REGION_LABEL[region] ?? region;

function dateBit(key: KeyProfile, selfReported = false): string {
  if (selfReported) return 'self-reported';
  if (key.source === 'demo') return 'sample reading';
  return `scan ${formatScanDate(key.scanDate)}`;
}

/** "Oiliness reading: High (whole face, scan 1 Nov)" or, on copy set A, "T-zone reading: Oily (scan 1 Nov)". */
export function readingPhrase(key: KeyProfile, reading: ReasonReading): string {
  if (reading.on === 'band') {
    return `${CONCERN_LABEL[reading.concern]} reading: ${reading.level} (${regionLabel(reading.region)}, ${dateBit(key, reading.selfReported)})`;
  }
  if (reading.on === 'zone') {
    return `${ZONE_LABEL[reading.zone as SkinTypeZone] ?? reading.zone} reading: ${reading.value} (${dateBit(key)})`;
  }
  return `Listing says '${reading.claim}'`;
}

export function fillTemplate(template: string, values: { ingredient?: string; claim?: string }): string {
  return template.replace(/\{(ingredient|claim)\}/g, (_, k: 'ingredient' | 'claim') => values[k] ?? '');
}

export const TEMPLATE_PLACEHOLDERS = ['{ingredient}', '{claim}'] as const;
