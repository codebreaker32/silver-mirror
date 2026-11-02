/**
 * RULES agent: proposed additive contract changes. Not exported from index.ts; @skinkey/rules already returns these
 * shapes (VerdictResult extends Verdict), so adopting them needs no engine change.
 */
import { z } from 'zod';
import { SkinTypeClass, SkinTypeZone } from '../domain';
import { Verdict } from '../verdict';

/** P1. What a verdict rests on. "name_only" is the brief's "based on product name only" state; spec §5 keeps it UNKNOWN. */
export const VerdictBasis = z.enum(['medicine', 'ingredients', 'name_only', 'none', 'no_readings']);
export type VerdictBasis = z.infer<typeof VerdictBasis>;

/** P2. Verdict plus basis and an optional fixed note (COPY.fitsNoFlags, or the name-only note). */
export const VerdictResult = Verdict.extend({
  basis: VerdictBasis,
  note: z.string().optional(),
});
export type VerdictResult = z.infer<typeof VerdictResult>;

/** P3. buildKeyProfile takes hd_skin_type labels separately from raw_score rows; the Worker should send them as this. */
export const SkinTypeZones = z.partialRecord(SkinTypeZone, SkinTypeClass);
export type SkinTypeZones = z.infer<typeof SkinTypeZones>;

/** P4. Two fixed strings the engine uses today as exports of @skinkey/rules; proposed for COPY. */
export const PROPOSED_COPY = {
  noReadingsSubtitle: 'We need your readings to check fit. Scan, or try the Demo reading.',
  nameOnlyNote: "We don't have this product's ingredient list, so this is a weaker check.",
} as const;
