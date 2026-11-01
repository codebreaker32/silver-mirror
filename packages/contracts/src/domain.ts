import { z } from 'zod';

export const Band = z.enum(['Low', 'Medium', 'High']);
export type Band = z.infer<typeof Band>;

export const Concern = z.enum(['oiliness', 'moisture', 'redness', 'pore']);
export type Concern = z.infer<typeof Concern>;

export const YOUCAM_HD_CONCERNS = ['hd_skin_type', 'hd_oiliness', 'hd_moisture', 'hd_redness', 'hd_pore'] as const;
export const YouCamHdConcern = z.enum(YOUCAM_HD_CONCERNS);
export type YouCamHdConcern = z.infer<typeof YouCamHdConcern>;

export const SkinTypeZone = z.enum(['whole', 't_zone', 'u_zone']);
export type SkinTypeZone = z.infer<typeof SkinTypeZone>;

export const PoreRegion = z.enum(['whole', 'forehead', 'nose', 'cheek']);
export type PoreRegion = z.infer<typeof PoreRegion>;

export const SkinTypeClass = z.enum([
  'Normal',
  'Oily',
  'Dry',
  'Combination',
  'Redness',
  'Oily & Redness',
  'Dry & Redness',
  'Combination & Redness',
]);
export type SkinTypeClass = z.infer<typeof SkinTypeClass>;

/** One YouCam output row after the Worker boundary: ui_score is stripped and must never be added back. */
export const RawScoreReading = z
  .object({
    type: z.string(),
    region: z.string().optional(),
    raw_score: z.number(),
  })
  .strict();
export type RawScoreReading = z.infer<typeof RawScoreReading>;

export const BandDirection = z.enum(['higher_is_more_visible', 'higher_is_less_visible']);
export type BandDirection = z.infer<typeof BandDirection>;

export const BandCutoffs = z.object({
  lowBelow: z.number(),
  highFrom: z.number(),
  direction: z.record(Concern, BandDirection),
});
export type BandCutoffs = z.infer<typeof BandCutoffs>;

export const BandReading = z.object({
  level: Band,
  region: z.string().default('whole'),
  selfReported: z.boolean().default(false),
  measuredLevel: Band.optional(),
});
export type BandReading = z.infer<typeof BandReading>;

export const CopySet = z.enum(['A', 'B']);
export type CopySet = z.infer<typeof CopySet>;

export const KeySource = z.enum(['youcam_hd', 'demo']);
export type KeySource = z.infer<typeof KeySource>;

export const KeyProfile = z.object({
  version: z.literal(1),
  source: KeySource,
  scanId: z.string().optional(),
  scanDate: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
  copySet: CopySet,
  bands: z.object({
    oiliness: BandReading,
    moisture: BandReading,
    redness: BandReading,
    pore: BandReading,
  }),
  pores: z.partialRecord(PoreRegion, Band).default({}),
  zones: z.partialRecord(SkinTypeZone, SkinTypeClass).default({}),
  skinType: z.object({ value: SkinTypeClass, derived: z.boolean() }).optional(),
  selfReported: z.array(Concern).default([]),
  photoDeleted: z.boolean(),
});
export type KeyProfile = z.infer<typeof KeyProfile>;

export const ClaimType = z.enum([
  'fragrance_free',
  'alcohol_free',
  'oil_free',
  'for_oily_skin',
  'for_dry_skin',
  'for_combination_skin',
  'for_sensitive_skin',
  'for_all_skin_types',
  'one_shade',
  'universal_tint',
]);
export type ClaimType = z.infer<typeof ClaimType>;

export const Claim = z.object({
  type: ClaimType,
  quote: z.string().optional(),
  char_span: z.tuple([z.number().int(), z.number().int()]).optional(),
});
export type Claim = z.infer<typeof Claim>;

export const InciToken = z.object({
  token: z.string(),
  position: z.number().int().positive(),
});
export type InciToken = z.infer<typeof InciToken>;

export const InciSource = z.enum(['catalog_verified', 'label_photo_confirmed']);
export type InciSource = z.infer<typeof InciSource>;
