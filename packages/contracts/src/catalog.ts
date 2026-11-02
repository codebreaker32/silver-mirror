import { z } from 'zod';
import { Claim, InciToken } from './domain';

export const ProductCategory = z.enum([
  'moisturiser',
  'sunscreen',
  'cleanser',
  'serum',
  'toner',
  'tinted_moisturiser',
  'tinted_spf',
  'lip_tint',
  'tinted_lip_balm',
  'other',
]);
export type ProductCategory = z.infer<typeof ProductCategory>;

/**
 * Where a shade's `hex` came from. Never guessed, never from a retailer:
 * - `brand_swatch_colour`: a colour the brand itself publishes for that shade (variant swatch, CSS swatch fill).
 * - `brand_image_median`: per-channel median of a crop of the brand's own swatch or texture image of that shade
 *   (transparent pixels ignored), `crop` being the pixel box [x0, y0, x1, y1] in the image as served at `url`.
 */
export const ShadeHexSource = z.object({
  kind: z.enum(['brand_swatch_colour', 'brand_image_median']),
  /** The brand page that publishes the colour, or the brand image that was sampled. */
  url: z.string(),
  crop: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
  /** ISO date the colour was read. */
  read_at: z.string(),
  note: z.string().optional(),
});
export type ShadeHexSource = z.infer<typeof ShadeHexSource>;

export const Shade = z.object({
  name: z.string(),
  swatch_img_url: z.string().optional(),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  hex_sampled_at: z.object({ url: z.string(), x: z.number(), y: z.number() }).optional(),
  hex_source: ShadeHexSource.optional(),
  /** Why a shade the brand sells has no `hex` (no brand-published swatch or texture image for it). */
  no_hex_reason: z.string().optional(),
});
export type Shade = z.infer<typeof Shade>;

/** Where the INCI list was copied from. Only brand_official rows are eligible for a human verification tick. */
export const SourceKind = z.enum(['brand_official', 'retailer', 'third_party']);
export type SourceKind = z.infer<typeof SourceKind>;

export const RowStatus = z.enum(['verified', 'unverified', 'unverifiable']);
export type RowStatus = z.infer<typeof RowStatus>;

/**
 * How a usable (verified) brand_official row was checked. Honest tiering, never inferred from a title:
 * - `human`: a person ticked it in data/catalog/verified.json (or the row carries `verified: true`).
 * - `brand_page_check`: the row's own notes record a second, independent read of the brand page (or its pack image)
 *   that matched the copied INCI verbatim. Shown as "Checked against the brand page", never as human-checked.
 * Retailer and third-party rows never get either.
 */
export const VerifiedBy = z.enum(['human', 'brand_page_check']);
export type VerifiedBy = z.infer<typeof VerifiedBy>;

/** On-disk catalogue row (data/catalog/catalog.json and brands/*.json). Snake case follows X1. */
export const CatalogProduct = z.object({
  id: z.string(),
  brand: z.string(),
  name: z.string(),
  size: z.string().optional(),
  category: ProductCategory,
  tinted: z.boolean(),
  spf: z.number().optional(),
  finish: z.string().optional(),
  inci: z.array(InciToken),
  claims: z.array(Claim),
  shades: z.array(Shade).default([]),
  source_url: z.string(),
  source_kind: SourceKind.optional(),
  fetched_at: z.string(),
  screenshot_path: z.string().optional(),
  verified: z.boolean(),
  verified_by: VerifiedBy.optional(),
  /** The sentence in the row's notes that records the brand-page check (brand_page_check rows only). */
  check_note: z.string().optional(),
  status: RowStatus,
  in_frame: z.boolean().optional(),
  aliases: z.array(z.string()).optional(),
});
export type CatalogProduct = z.infer<typeof CatalogProduct>;

export const ProductSummary = CatalogProduct.pick({
  id: true,
  brand: true,
  name: true,
  size: true,
  category: true,
  tinted: true,
  verified: true,
  verified_by: true,
  status: true,
}).extend({ shadeCount: z.number().int() });
export type ProductSummary = z.infer<typeof ProductSummary>;
