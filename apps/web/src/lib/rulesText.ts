import type { Rule, Trigger } from '@skinkey/contracts';

const CONCERN: Record<string, string> = { oiliness: 'Oiliness', moisture: 'Moisture', redness: 'Redness', pore: 'Pore' };
const ZONE: Record<string, string> = { whole: 'Whole-face', t_zone: 'T-zone', u_zone: 'U-zone' };

export const claimText = (claim: string) => claim.replace(/_/g, '-').replace(/^for-/, 'for ').replace(/-skin$/, ' skin').replace(/-types$/, ' types');

export function describeTrigger(t: Trigger): string {
  switch (t.on) {
    case 'band':
      return `${CONCERN[t.concern] ?? t.concern} reading ${t.levels.join(' or ')}`;
    case 'zone':
      return `${ZONE[t.zone] ?? t.zone} reading ${t.classes.join(', ')}`;
    case 'claim':
      return `Listing claims “${claimText(t.claim)}”`;
    case 'any':
      return 'Any reading';
  }
}

export const describeTriggers = (r: Rule) => r.triggers.map(describeTrigger).join(' · ') || 'Any reading';

export const KIND_LABEL: Record<Rule['kind'], string> = {
  FIT_CAUTION: 'Caution',
  FIT_SUPPORT: 'Support',
  LABEL_CHECK: 'Label Check',
  MEDICINE: 'Medicine gate',
};

export const GRADE_LABEL: Record<'R' | 'L' | 'T', string> = {
  R: 'R · regulatory list',
  L: 'L · literature',
  T: 'T · team rule',
};

/** CosIng search for one INCI name (EU Commission ingredient database). */
export const cosingUrl = (name: string) =>
  `https://ec.europa.eu/growth/tools-databases/cosing/results?keyword=${encodeURIComponent(name)}`;
