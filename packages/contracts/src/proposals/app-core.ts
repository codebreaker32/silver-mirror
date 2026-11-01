/**
 * Contract proposals from APP-CORE. Nothing here is exported from the package index; owners decide.
 * Each block names the owner and what the app does today in its place.
 */
import type { CatalogProduct, SkinTypeClass } from '../index';

/**
 * P1 (scaffold, demo.ts): share the sample listing between the app and web /check.
 * Today: apps/mobile/src/features/share/sample.ts holds this exact string.
 */
export const SAMPLE_SHARE_TEXT =
  'Garnier Super UV Invisible Serum Sunscreen SPF 50+ PA++++ 30ml https://www.flipkart.com/garnier-super-uv-invisible-serum-sunscreen/p/skinkey-sample';

/**
 * P2 (scaffold demo.ts, optional): DEMO_KEY has no zones or skinType. The app now derives the class with
 * @skinkey/rules `deriveSkinType` (Demo Key → Oily → "Oily Skin" facet). Adding
 * `skinType: { value: 'Oily', derived: true }` to DEMO_KEY would make the web /check agree without that call.
 */
export interface DemoKeySkinTypeProposal {
  skinType: { value: SkinTypeClass; derived: true };
}

/**
 * P3 (WORKER, api.ts): rank() needs full CatalogProduct rows. Today the app calls catalogSearch and then
 * catalogProduct once per id (up to 12, cached in memory). Proposed batch route:
 *   GET /v1/catalog/products?ids=a,b,c  →  { catalogCount, products: CatalogProduct[] }
 */
export interface CatalogProductsResponseProposal {
  catalogCount: number;
  products: CatalogProduct[];
}

/**
 * P4 (scaffold, apps/mobile/src/lib/api.ts): read `process.env.EXPO_PUBLIC_WORKER_URL` before
 * `Constants.expoConfig.extra.workerUrl`, so a device build can point at a deployed Worker without editing app.json.
 */
export const WORKER_URL_ENV = 'EXPO_PUBLIC_WORKER_URL';

/**
 * P5 (RULES): the app uses rules' flipkartSearchUrl. Proposed: also export the facet, Amazon and Nykaa builders
 * (today in apps/mobile/src/features/matches/links.ts) so web /check and /r/:token build identical links.
 * Facet pattern (research/skinkey_report.md): `&p%5B%5D=facets.skin_type%255B%255D%3DOily%2BSkin`.
 */
export type StoreUrlBuilders = {
  flipkartFacetUrl(q: string, facet: string): string;
  amazonSearchUrl(q: string): string;
  nykaaSearchUrl(q: string): string;
};

/**
 * P6 (scaffold, copy.ts): app strings that should join COPY so the claim linter allowlists them.
 * Destination lines follow the brief §4.3 / components.md §14 patterns.
 */
export const COPY_ADDITIONS = {
  productKicker: 'Is this the product?',
  skuConfirm: (line: string) => `We think this is ${line}.`,
  skuChoose: 'Which product is this?',
  linkOutFacet: (facet: string) => `Opens a Flipkart search, filtered to ${facet}`,
  linkOutKeyword: (store: 'Flipkart' | 'Amazon' | 'Nykaa', q: string) => `Opens a${store === 'Amazon' ? 'n' : ''} ${store} keyword search for "${q}"`,
  linkOutMatch: 'Opens a Flipkart search for this product',
  backToListing: (store: string) => `Returns to the ${store} listing`,
  shareTipTitle: 'In Flipkart, tap Share → SkinKey',
  noKeyPrompt: 'Scan for reasons based on your readings.',
  noMatches: 'No better matches in our catalogue yet',
  howMadeBoundary: 'Claude reads. Our rules decide.',
} as const;

/**
 * P7 (DESIGN): theme.components.rankingDisclosure.copy[0] reads "Ranked by fit to your skin. No paid placements."
 * The spec / COPY.betterMatchesHeader says "Ranked by fit to your readings. No paid placements." The app uses COPY.
 */
export const RANKING_COPY_MISMATCH = true;

/**
 * P8 (APP-SCAN, informational): the app opens /tryon with params { productId, mode, productName },
 * which TryonScreen already reads.
 */
export type TryonRouteParams = { productId: string; mode: 'multi' | 'single'; productName?: string };
