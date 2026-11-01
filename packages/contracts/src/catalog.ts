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

export const Shade = z.object({
  name: z.string(),
  swatch_img_url: z.string().optional(),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  hex_sampled_at: z.object({ url: z.string(), x: z.number(), y: z.number() }).optional(),
});
export type Shade = z.infer<typeof Shade>;

export const RowStatus = z.enum(['verified', 'unverified', 'unverifiable']);
export type RowStatus = z.infer<typeof RowStatus>;

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
  fetched_at: z.string(),
  screenshot_path: z.string().optional(),
  verified: z.boolean(),
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
  status: true,
}).extend({ shadeCount: z.number().int() });
export type ProductSummary = z.infer<typeof ProductSummary>;
