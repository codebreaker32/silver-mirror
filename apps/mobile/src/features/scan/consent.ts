import { ConsentRecord } from '@skinkey/contracts';

export const SCAN_CONSENT_VERSION = 'scan-v1';
export const TRYON_CONSENT_VERSION = 'tryon-v1';

export const KEEP_CHIPS = [
  'Skin-type reading',
  'Oiliness band',
  'Moisture band',
  'Redness band',
  'Pore band',
  'Zone labels',
  'Scan date',
] as const;

/** "What stays on this phone" (DESIGN.md §9.6): kept rows get the check-circle, not-kept rows the minus-circle. */
export const KEPT_ON_PHONE = ['Skin-type reading', 'Low / Medium / High bands', 'Zone labels', 'Scan date'] as const;
export const NOT_KEPT = ['Your photo', 'Face shape'] as const;

export const ADULT_LABEL = "I'm 18 or older";
export const ADULT_HELPER = "Tick to confirm you're 18 or older.";

export function makeConsent(version: string, adultTicked: boolean, now: Date = new Date()): ConsentRecord {
  if (!adultTicked) throw new Error('18+ confirmation is required');
  return ConsentRecord.parse({ version, adult: true, acceptedAt: now.toISOString() });
}
