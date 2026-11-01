/** Fixed user-facing strings (spec §2, §9; brief §4.3). Use exactly; the claim linter allowlists these. */
export const COPY = {
  subtitle: {
    FITS: 'Matches your readings on the ingredients we know about. Not a guarantee.',
    CAUTION: 'May not suit your readings. A cosmetic fit note, not a health warning.',
    UNKNOWN: "We can't read this listing's ingredients. This doesn't mean it's bad.",
  },
  medicine: (token: string) =>
    `This looks like a medicine (contains ${token}). SkinKey doesn't check medicines. Ask a pharmacist or doctor.`,
  fitsNoFlags: 'No ingredient in our rules flags your readings.',
  catalogCount: (n: number) => `Our catalogue: ${n} verified products.`,
  snapLabel: 'Snap the ingredient list.',
  labelPhotoProvenance: 'Photo of label, confirmed by you.',
  tryonCaption: 'Two shades, same photo. Preview, not a shade guarantee.',
  tryonSingleClaim: 'The listing says one shade suits everyone. Try it on me.',
  tryonMulti: 'Try two shades on me.',
  footer: 'Cosmetic guidance, not medical advice.',
  notAffiliated: 'Not affiliated with Flipkart, Amazon or Nykaa.',
  accuracyNote: 'Skin AI can be less accurate on deeper skin tones and in poor light.',
  privacyLine: 'SkinKey stores no photo; YouCam processes it and we delete it from YouCam right after.',
  privacyQualifier:
    'YouCam (Perfect Corp) processes the photo on its servers. If deletion fails, YouCam removes files automatically within 30 days.',
  orphanUpload: 'Not processed; YouCam removes it automatically within 30 days.',
  deleteFailed: 'Delete failed: auto-removed within 30 days.',
  betterMatchesHeader: 'Ranked by fit to your readings. No paid placements.',
  flipkartFacetLink: (facet: string) =>
    `Browse Flipkart's own ${facet} filter (seller-tagged, not checked by SkinKey)`,
  affiliateDisclosure: 'We may earn a commission if you buy; it never changes the ranking',
  coachMark: 'Find SkinKey in your share menu, then pin it',
  cropWarning: 'Crop out your address or order details',
  rulesBanner: 'Flagged by our published rules, not a measured effect on skin.',
  auditCaption: 'Flagged by our published rules, not a measured effect on skin. Our sample, not the market.',
  captureTooSmall: 'Move closer so your face fills the oval',
  captureDark: 'Face a window or a lamp',
  selfReported: 'self-reported',
  scanSteps: {
    upload: 'Uploading',
    analyse: 'Analysing (HD)',
    read: 'Reading results',
    delete: 'Deleting from YouCam',
  },
  tryonSteps: {
    upload: 'Uploading',
    tone: 'Reading skin tone (YouCam)',
    render: 'Rendering 2 shades (YouCam)',
    delete: 'Deleting from YouCam',
  },
} as const;
