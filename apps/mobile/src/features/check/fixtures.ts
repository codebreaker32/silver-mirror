import { COPY, DEMO_KEY, type CatalogProduct, type HowThisWasMade, type KeyProfile, type ProductSummary, type ResolveResponse, type Verdict } from '@skinkey/contracts';

/** Test and storybook fixtures only. Shapes follow @skinkey/contracts; values are illustrative. */
export const HASH = 'a1b2c3d4e5f6';

export const SCANNED_KEY: KeyProfile = {
  ...DEMO_KEY,
  source: 'youcam_hd',
  scanId: 'scan_1',
  scanDate: '2026-11-01T09:30:00.000Z',
  expiresAt: '2026-12-01T09:30:00.000Z',
};

export const EMPTY_LEDGER: HowThisWasMade = { mock: true, entries: [], files: [], totalUnits: 0, totalLatencyMs: 0 };

export const PRODUCT: CatalogProduct = {
  id: 'garnier-super-uv-serum',
  brand: 'Garnier',
  name: 'Super UV Invisible Serum Sunscreen',
  size: '30 ml',
  category: 'sunscreen',
  tinted: false,
  inci: [
    { token: 'Aqua', position: 1 },
    { token: 'Alcohol Denat.', position: 2 },
    { token: 'Isopropyl Myristate', position: 3 },
    { token: 'Parfum', position: 9 },
  ],
  claims: [{ type: 'fragrance_free', quote: 'fragrance-free' }],
  shades: [],
  source_url: 'https://www.garnier.in/example',
  fetched_at: '2026-11-01T10:00:00.000Z',
  verified: true,
  status: 'verified',
};

export const TINTED: CatalogProduct = {
  ...PRODUCT,
  id: 'lip-tint',
  name: 'Sheer Lip Tint',
  category: 'lip_tint',
  tinted: true,
  shades: [{ name: 'Rose', hex: '#C46A6F' }, { name: 'Berry', hex: '#8E3B4F' }],
  claims: [],
};

export const summary = (p: CatalogProduct): ProductSummary => ({
  id: p.id,
  brand: p.brand,
  name: p.name,
  size: p.size,
  category: p.category,
  tinted: p.tinted,
  verified: p.verified,
  status: p.status,
  shadeCount: p.shades.length,
});

export const resolveResponse = (over: Partial<ResolveResponse> = {}): ResolveResponse => ({
  outcome: 'match',
  resolver: 'catalog',
  store: 'flipkart',
  extractedTitle: 'Garnier Super UV Invisible Serum Sunscreen',
  isSkincare: true,
  candidates: [{ catalogId: PRODUCT.id, confidence: 0.95, why: 'name match', product: summary(PRODUCT) }],
  catalogCount: 42,
  ledger: EMPTY_LEDGER,
  ...over,
});

const provenance = (over: Partial<Verdict['provenance']> = {}): Verdict['provenance'] => ({
  readingSource: 'youcam_hd',
  scanDate: SCANNED_KEY.scanDate,
  photoDeleted: true,
  inciSource: 'catalog_verified',
  inciSourceUrl: PRODUCT.source_url,
  rulesetHash: HASH,
  line: '',
  ...over,
});

export const CAUTION_VERDICT: Verdict = {
  label: 'CAUTION',
  subtitle: COPY.subtitle.CAUTION,
  reasons: [
    {
      ruleId: 'OCC-2',
      kind: 'FIT_CAUTION',
      grade: 'L',
      reading: { on: 'band', concern: 'oiliness', level: 'High', region: 'whole', selfReported: false },
      ingredient: 'Isopropyl Myristate',
      plain: 'Contains isopropyl myristate, which our rule OCC-2 flags as heavy for oily-looking skin.',
      sourceUrl: 'https://example.org/fulton-1989',
      counted: true,
    },
  ],
  labelChecks: [
    {
      ruleId: 'LC-1a',
      kind: 'LABEL_CHECK',
      grade: 'R',
      reading: { on: 'claim', claim: 'fragrance_free', quote: 'fragrance-free' },
      ingredient: 'Parfum',
      plain: 'Its ingredient list has Parfum (rule LC-1a).',
      counted: true,
    },
    {
      ruleId: 'LC-1b',
      kind: 'LABEL_CHECK',
      grade: 'R',
      reading: null,
      ingredient: 'Limonene',
      plain: 'Lists Limonene, a labelled fragrance allergen that may come from an extract (rule LC-1b).',
      counted: false,
    },
  ],
  provenance: provenance(),
};

export const FITS_VERDICT: Verdict = {
  label: 'FITS',
  subtitle: COPY.subtitle.FITS,
  reasons: [],
  labelChecks: [],
  provenance: provenance(),
};

export const UNKNOWN_VERDICT: Verdict = {
  label: 'UNKNOWN',
  subtitle: COPY.subtitle.UNKNOWN,
  reasons: [],
  labelChecks: [],
  provenance: provenance({ inciSource: null, inciSourceUrl: undefined }),
};

export const MEDICINE_VERDICT: Verdict = {
  label: 'MEDICINE',
  subtitle: COPY.medicine('adapalene'),
  reasons: [],
  labelChecks: [],
  medicineToken: 'adapalene',
  provenance: provenance({ inciSource: null }),
};

export const LABEL_VERDICT: Verdict = {
  ...CAUTION_VERDICT,
  labelChecks: [],
  provenance: provenance({ inciSource: 'label_photo_confirmed', inciSourceUrl: undefined }),
};
