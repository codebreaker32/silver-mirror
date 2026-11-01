import { COPY, type CopySet } from '@skinkey/contracts';

export interface BannedPhrase {
  id: string;
  pattern: RegExp;
  why: string;
}

/** Brief §4.4 plus spec §9 additions. Word-bounded so "safety", "conditioning" or "unfairly" style substrings stay visible to review, not auto-banned. */
export const BANNED_PHRASES: readonly BannedPhrase[] = [
  { id: 'safety', pattern: /\b(un)?safe\b|\bdangerous\b|\bharmful\b|\btoxic\b|\ballerg(y|ic|ies)\b/i, why: 'reads as a safety or medical rating' },
  {
    id: 'drug-claim',
    pattern: /\b(treat(s|ed|ing|ment|ments)?|cure(s|d)?|heal(s|ed|ing)?|fix(es|ed|ing)?|repair(s|ed|ing)?|prevent(s|ed|ing|ion)?|anti-acne|clinical(ly)?|diagnos(e|es|ed|is)|conditions?)\b/i,
    why: 'drug-claim risk',
  },
  { id: 'colourism', pattern: /\b(fair|fairness|whitening|lightening|brightening)\b/i, why: 'colourist reading risk' },
  { id: 'diagnosis-tone', pattern: /\byour skin is\b|\byou have\b/i, why: 'diagnosis tone' },
  {
    id: 'unsupported',
    pattern: /\b(guaranteed|perfect match|no white cast|precise(ly)?|accurate(ly)?|dermatologist[- ]approved|flawless|glow-up)\b/i,
    why: 'unsupported claim',
  },
  { id: 'skin-age', pattern: /\bskin age\b|\b\d{1,3}\s*(\/|out of)\s*100\b/i, why: 'bands only, never scores' },
  {
    id: 'store-claims',
    pattern: /\binside flipkart\b|\bdeep-links? into flipkart\b|\bany store\b|\bany app\b|\bnothing ever leaves your phone\b|\bwe don'?t make any money\b|\bchecks the exact product, every time\b/i,
    why: 'untrue store or privacy claim',
  },
];

/** Copy set B (G1 fail): no zone labels, so "T-zone reading" is banned. */
export const COPY_SET_B_BANNED: readonly BannedPhrase[] = [
  { id: 't-zone-reading', pattern: /\bT-zone reading\b/i, why: 'G1 failed: no t_zone label from YouCam' },
];

export const ALLOWLIST: readonly string[] = [COPY.accuracyNote];

export interface LintViolation {
  id: string;
  match: string;
  why: string;
}

export function lintCopy(text: string, options: { copySet?: CopySet } = {}): LintViolation[] {
  let scrubbed = text;
  for (const allowed of ALLOWLIST) scrubbed = scrubbed.split(allowed).join(' ');
  const list = options.copySet === 'B' ? [...BANNED_PHRASES, ...COPY_SET_B_BANNED] : BANNED_PHRASES;
  const out: LintViolation[] = [];
  for (const b of list) {
    const m = scrubbed.match(b.pattern);
    if (m) out.push({ id: b.id, match: m[0], why: b.why });
  }
  return out;
}
