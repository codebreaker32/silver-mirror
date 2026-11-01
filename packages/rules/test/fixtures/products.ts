import type { CatalogProduct, Claim } from '@skinkey/contracts';
import { toInciTokens } from '../../src';

const row = (
  id: string,
  name: string,
  category: CatalogProduct['category'],
  inci: string[],
  claims: Claim['type'][] = [],
  extra: Partial<CatalogProduct> = {},
): CatalogProduct => ({
  id,
  brand: 'Fixture',
  name,
  category,
  tinted: false,
  inci: toInciTokens(inci),
  claims: claims.map((type) => ({ type })),
  shades: [],
  source_url: `https://example.test/${id}`,
  fetched_at: '2026-11-01T00:00:00.000Z',
  verified: true,
  status: 'verified',
  ...extra,
});

/** Synthetic SKUs for the snapshot matrix (not real products). */
export const PRODUCTS: CatalogProduct[] = [
  row('fx-gel-niacinamide', 'Fixture Niacinamide Gel Moisturiser', 'moisturiser', ['Aqua', 'Glycerin', 'Niacinamide', 'Carbomer', 'Phenoxyethanol'], ['oil_free', 'for_oily_skin']),
  row('fx-heavy-cream', 'Fixture Rich Cream', 'moisturiser', ['Aqua', 'Petrolatum', 'Isopropyl Myristate', 'Glycerin', 'Cetearyl Alcohol', 'Parfum'], ['for_oily_skin']),
  row('fx-alcohol-toner', 'Fixture Mattifying Toner', 'toner', ['Aqua', 'Alcohol Denat.', 'Witch Hazel Extract', 'Menthol'], ['alcohol_free']),
  row('fx-fragrance-free-lie', 'Fixture Calm Lotion', 'moisturiser', ['Aqua', 'Glycerin', 'Fragrance (Parfum)', 'Limonene'], ['fragrance_free']),
  row('fx-oil-free-jojoba', 'Fixture Oil-Free Lotion', 'moisturiser', ['Aqua', 'Simmondsia Chinensis (Jojoba) Seed Oil', 'PEG-40 Hydrogenated Castor Oil', 'Glycerin'], ['oil_free']),
  row('fx-clean-sunscreen', 'Fixture Fluid SPF 50', 'sunscreen', ['Aqua', 'Ethylhexyl Salicylate', 'Glycerin', 'Cetyl Alcohol', 'Benzyl Alcohol', 'Sodium Hyaluronate'], ['fragrance_free', 'alcohol_free', 'oil_free']),
  row('fx-bpo-wash', 'Fixture BPO Wash', 'cleanser', ['Aqua', 'Benzoyl Peroxide', 'Glycerin']),
  row('fx-unverified', 'Fixture Unverified Cream', 'moisturiser', ['Aqua', 'Isopropyl Palmitate'], [], { verified: false, status: 'unverified' }),
];

export const byId = (id: string): CatalogProduct => {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) throw new Error(`no fixture ${id}`);
  return p;
};
