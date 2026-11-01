import type { Concern, ReasonReading } from '@skinkey/contracts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

/** "1 Nov" (brief §4.3 date style), read in UTC so a scan date never shifts by timezone. */
export function shortDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

export const CONCERN_LABEL: Record<Concern, string> = {
  oiliness: 'Oiliness',
  moisture: 'Moisture',
  redness: 'Redness',
  pore: 'Pore',
};

const ZONE_LABEL: Record<string, string> = { t_zone: 'T-zone', u_zone: 'U-zone', whole: 'Whole-face' };
const REGION_LABEL: Record<string, string> = { forehead: 'Forehead', nose: 'Nose', cheek: 'Cheek' };

const CLAIM_LABEL: Record<string, string> = {
  fragrance_free: 'fragrance-free',
  alcohol_free: 'alcohol-free',
  oil_free: 'oil-free',
  for_oily_skin: 'for oily skin',
  for_dry_skin: 'for dry skin',
  for_combination_skin: 'for combination skin',
  for_sensitive_skin: 'for sensitive skin',
  for_all_skin_types: 'for all skin types',
  one_shade: 'one shade',
  universal_tint: 'universal tint',
};

export const claimLabel = (claim: string) => CLAIM_LABEL[claim] ?? claim.replace(/_/g, ' ');

/** The reading half of a reason, phrased about the reading, never the person (brief §4.1). */
export function readingLine(reading: ReasonReading | null, scanDate: string | null): string | null {
  if (!reading) return null;
  const when = scanDate ? `scan ${shortDate(scanDate)}` : null;
  switch (reading.on) {
    case 'zone': {
      const zone = ZONE_LABEL[reading.zone] ?? reading.zone;
      return `${zone} reading: ${reading.value}${when ? ` (${when})` : ''}.`;
    }
    case 'band': {
      const region = REGION_LABEL[reading.region];
      const head =
        reading.concern === 'pore' && region
          ? `${region} pore reading: ${reading.level}`
          : `${CONCERN_LABEL[reading.concern]} reading: ${reading.level}`;
      const where = region ? null : 'whole face';
      const bits = [where, reading.selfReported ? 'self-reported' : when].filter(Boolean);
      return `${head}${bits.length ? ` (${bits.join(', ')})` : ''}.`;
    }
    case 'claim':
      return `Listing says '${reading.quote ?? claimLabel(reading.claim)}'.`;
  }
}

export const twoDigit = (n: number) => String(n).padStart(2, '0');
