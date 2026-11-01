import type { CopySet, FacetMapping, KeyProfile, ReadingProfile } from '@skinkey/contracts';

/**
 * The six fixed reading profiles for "One tag, six readings" (spec §6), published on /rules. Each is a band vector
 * named after the hd_skin_type class it stands for; zone labels are only used when a Key is on copy set A.
 */
export const READING_PROFILES: readonly ReadingProfile[] = [
  {
    id: 'oily',
    label: 'Oily',
    zones: { whole: 'Oily', t_zone: 'Oily', u_zone: 'Oily' },
    bands: { oiliness: 'High', moisture: 'Medium', redness: 'Low', pore: 'High' },
  },
  {
    id: 'combination',
    label: 'Combination',
    zones: { whole: 'Combination', t_zone: 'Oily', u_zone: 'Dry' },
    bands: { oiliness: 'Medium', moisture: 'Low', redness: 'Low', pore: 'Medium' },
  },
  {
    id: 'oily-redness',
    label: 'Oily & Redness',
    zones: { whole: 'Oily & Redness', t_zone: 'Oily', u_zone: 'Oily' },
    bands: { oiliness: 'High', moisture: 'Medium', redness: 'High', pore: 'High' },
  },
  {
    id: 'combination-redness',
    label: 'Combination & Redness',
    zones: { whole: 'Combination & Redness', t_zone: 'Oily', u_zone: 'Dry' },
    bands: { oiliness: 'Medium', moisture: 'Low', redness: 'High', pore: 'Medium' },
  },
  {
    id: 'normal',
    label: 'Normal',
    zones: { whole: 'Normal', t_zone: 'Normal', u_zone: 'Normal' },
    bands: { oiliness: 'Medium', moisture: 'Medium', redness: 'Low', pore: 'Medium' },
  },
  {
    id: 'dry',
    label: 'Dry',
    zones: { whole: 'Dry', t_zone: 'Dry', u_zone: 'Dry' },
    bands: { oiliness: 'Low', moisture: 'Low', redness: 'Low', pore: 'Low' },
  },
];

/** YouCam class → Flipkart facet (spec §5). Redness classes get keyword search only. */
export const FACET_MAP: readonly FacetMapping[] = [
  { youcamClass: 'Oily', flipkartFacet: 'Oily Skin' },
  { youcamClass: 'Dry', flipkartFacet: 'Dry Skin' },
  { youcamClass: 'Combination', flipkartFacet: 'Combination Skin' },
  { youcamClass: 'Normal', flipkartFacet: 'All Skin Types' },
  { youcamClass: 'Redness', flipkartFacet: null },
  { youcamClass: 'Oily & Redness', flipkartFacet: null },
  { youcamClass: 'Dry & Redness', flipkartFacet: null },
  { youcamClass: 'Combination & Redness', flipkartFacet: null },
];

export function facetFor(key: KeyProfile): string | null {
  const cls = key.zones.whole ?? key.skinType?.value;
  return FACET_MAP.find((f) => f.youcamClass === cls)?.flipkartFacet ?? null;
}

const PROFILE_SCAN_DATE = '2026-11-01T00:00:00.000Z';

/** A Key built from a fixed profile, for the audit and the snapshot matrix. Never shown as a real scan. */
export function profileKey(profile: ReadingProfile, copySet: CopySet = 'B'): KeyProfile {
  const band = (c: keyof ReadingProfile['bands']) => ({ level: profile.bands[c], region: 'whole', selfReported: false });
  return {
    version: 1,
    source: 'demo',
    scanId: `profile:${profile.id}`,
    scanDate: PROFILE_SCAN_DATE,
    expiresAt: '2099-01-01T00:00:00.000Z',
    copySet,
    bands: { oiliness: band('oiliness'), moisture: band('moisture'), redness: band('redness'), pore: band('pore') },
    pores: {},
    zones: copySet === 'A' ? { ...profile.zones } : {},
    skinType: { value: profile.zones.whole ?? 'Normal', derived: copySet === 'B' },
    selfReported: [],
    photoDeleted: true,
  };
}
