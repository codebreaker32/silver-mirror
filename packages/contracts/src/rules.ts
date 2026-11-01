import { z } from 'zod';
import { Band, ClaimType, Concern, SkinTypeClass, SkinTypeZone } from './domain';

export const RuleKind = z.enum(['FIT_CAUTION', 'FIT_SUPPORT', 'LABEL_CHECK', 'MEDICINE']);
export type RuleKind = z.infer<typeof RuleKind>;

export const Grade = z.enum(['R', 'L', 'T']);
export type Grade = z.infer<typeof Grade>;

export const Trigger = z.discriminatedUnion('on', [
  z.object({ on: z.literal('band'), concern: Concern, levels: z.array(Band) }),
  z.object({ on: z.literal('zone'), zone: SkinTypeZone, classes: z.array(SkinTypeClass) }),
  z.object({ on: z.literal('claim'), claim: ClaimType }),
  z.object({ on: z.literal('any') }),
]);
export type Trigger = z.infer<typeof Trigger>;

export const Source = z.object({ citation: z.string(), url: z.string().optional() });
export type Source = z.infer<typeof Source>;

export const Rule = z.object({
  ruleId: z.string(),
  kind: RuleKind,
  grade: Grade.nullable(),
  triggers: z.array(Trigger),
  inciSet: z.object({
    names: z.array(z.string()),
    patterns: z.array(z.string()).default([]),
    excludes: z.array(z.string()).default([]),
  }),
  positionLimit: z.number().int().positive().optional(),
  counted: z.boolean().default(true),
  contested: z.boolean().default(false),
  template: z.string(),
  sources: z.array(Source),
  counterSources: z.array(Source).default([]),
});
export type Rule = z.infer<typeof Rule>;

export const ReadingProfile = z.object({
  id: z.string(),
  label: z.string(),
  zones: z.partialRecord(SkinTypeZone, SkinTypeClass),
  bands: z.record(Concern, Band),
});
export type ReadingProfile = z.infer<typeof ReadingProfile>;

export const FacetMapping = z.object({
  youcamClass: SkinTypeClass,
  flipkartFacet: z.string().nullable(),
});
export type FacetMapping = z.infer<typeof FacetMapping>;
