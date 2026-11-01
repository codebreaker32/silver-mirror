import { z } from 'zod';
import { Band, Concern, InciSource, KeySource, SkinTypeClass } from './domain';
import { Grade, RuleKind } from './rules';

export const VerdictLabel = z.enum(['FITS', 'CAUTION', 'UNKNOWN', 'MEDICINE']);
export type VerdictLabel = z.infer<typeof VerdictLabel>;

export const ReasonReading = z.discriminatedUnion('on', [
  z.object({ on: z.literal('band'), concern: Concern, level: Band, region: z.string(), selfReported: z.boolean() }),
  z.object({ on: z.literal('zone'), zone: z.string(), value: SkinTypeClass }),
  z.object({ on: z.literal('claim'), claim: z.string(), quote: z.string().optional() }),
]);
export type ReasonReading = z.infer<typeof ReasonReading>;

export const Reason = z.object({
  ruleId: z.string(),
  kind: RuleKind,
  grade: Grade.nullable(),
  reading: ReasonReading.nullable(),
  ingredient: z.string().nullable(),
  plain: z.string(),
  sourceUrl: z.string().optional(),
  inciSourceUrl: z.string().optional(),
  counted: z.boolean().default(true),
  glyphZone: z.string().optional(),
});
export type Reason = z.infer<typeof Reason>;

export const Provenance = z.object({
  readingSource: KeySource.nullable(),
  scanDate: z.iso.datetime().nullable(),
  photoDeleted: z.boolean(),
  inciSource: InciSource.nullable(),
  inciSourceUrl: z.string().optional(),
  rulesetHash: z.string(),
  line: z.string(),
});
export type Provenance = z.infer<typeof Provenance>;

export const Verdict = z.object({
  label: VerdictLabel,
  subtitle: z.string(),
  reasons: z.array(Reason),
  labelChecks: z.array(Reason),
  medicineToken: z.string().optional(),
  provenance: Provenance,
});
export type Verdict = z.infer<typeof Verdict>;

export const LabelCheckHit = z.object({
  ruleId: z.string(),
  claim: z.string(),
  quote: z.string().optional(),
  matchedToken: z.string(),
  position: z.number().int().optional(),
  grade: Grade.nullable(),
  counted: z.boolean(),
  contested: z.boolean(),
  plain: z.string(),
});
export type LabelCheckHit = z.infer<typeof LabelCheckHit>;

export const RankedMatch = z.object({
  productId: z.string(),
  label: VerdictLabel,
  score: z.number(),
  reasonLine: z.string(),
  searchUrl: z.string(),
});
export type RankedMatch = z.infer<typeof RankedMatch>;
