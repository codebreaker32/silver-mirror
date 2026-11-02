/** Fixed user-facing strings (spec §2, §9; brief §4.3). Use exactly; the claim linter allowlists these. */
export const COPY = {
  subtitle: {
    FITS: 'Matches your readings on the ingredients we know about. Not a guarantee.',
    CAUTION: 'May not suit your readings. A cosmetic fit note, not a health warning.',
    UNKNOWN: "We can't read this listing's ingredients. This doesn't mean it's bad.",
  },
  medicine: (token: string) =>
    `This looks like a medicine (contains ${token}). Silver Mirror doesn't check medicines. Ask a pharmacist or doctor.`,
  noReadingsSubtitle: 'We need your readings to check fit. Scan, or try the Demo reading.',
  nameOnlyNote: "We don't have this product's ingredient list, so this is a weaker check.",
  productKicker: 'Is this the product?',
  skuConfirm: (line: string) => `We think this is ${line}.`,
  skuChoose: 'Which product is this?',
  linkOutFacet: (facet: string) => `Opens a Flipkart search, filtered to ${facet}`,
  linkOutKeyword: (store: 'Flipkart' | 'Amazon' | 'Nykaa', q: string) =>
    `Opens a${store === 'Amazon' ? 'n' : ''} ${store} keyword search for "${q}"`,
  /** Better-match card destination: the store the product was shared from (Flipkart when unknown). */
  linkOutMatch: (store: 'Flipkart' | 'Amazon' | 'Nykaa') => `Opens a${store === 'Amazon' ? 'n' : ''} ${store} search for this product`,
  backToListing: (store: string) => `Returns to the ${store} listing`,
  shareTipTitle: 'In Flipkart, tap Share → Silver Mirror',
  /** Per-store share paths from spikes/FINDINGS.md S1: Amazon's own panel hides Silver Mirror behind More. */
  sharePaths: [
    'Flipkart: Share → Silver Mirror',
    'Amazon: Share → More → Silver Mirror',
    'Nykaa: Share → Silver Mirror',
  ] as const,
  amazonCoachMark: 'Amazon: Share → More → Silver Mirror',
  noKeyPrompt: 'Scan for reasons based on your readings.',
  noMatches: 'No better matches in our catalogue yet',
  howMadeBoundary: 'Claude reads. Our rules decide.',
  mockReading: 'Mock YouCam reading (test fixture, not your skin)',
  fitsNoFlags: 'No ingredient in our rules flags your readings.',
  catalogCount: (n: number) => `Our catalogue: ${n} verified products.`,
  /** Catalogue provenance tiers (data/catalog: verified_by). Never call a brand-page check human. */
  catalogSource: 'Ingredient list from our catalogue',
  catalogHumanChecked: 'Human-checked against the brand page',
  catalogBrandPageChecked: 'Checked against the brand page: a second read matched it word for word',
  snapLabel: 'Snap the ingredient list.',
  labelPhotoProvenance: 'Photo of label, confirmed by you.',
  tryonCaption: 'Two shades, same photo. Preview, not a shade guarantee.',
  /** Only when the listing itself claims one shade for everyone (claim one_shade / universal_tint). Button label: no full stop. */
  tryonSingleClaim: 'The listing says one shade suits everyone. Try it on me',
  /** A single shade colour on file, no such claim: never put words in the seller's mouth. */
  tryonSingle: 'Try this shade on me',
  tryonMulti: 'Try two shades on me',
  footer: 'Cosmetic guidance, not medical advice.',
  notAffiliated: 'Not affiliated with Flipkart, Amazon or Nykaa.',
  accuracyNote: 'Skin AI can be less accurate on deeper skin tones and in poor light.',
  privacyLine: 'Silver Mirror stores no photo; YouCam processes it and we delete it from YouCam right after.',
  privacyQualifier:
    'YouCam (Perfect Corp) processes the photo on its servers. If deletion fails, YouCam removes files automatically within 30 days.',
  orphanUpload: 'Not processed; YouCam removes it automatically within 30 days.',
  deleteFailed: 'Delete failed: auto-removed within 30 days.',
  betterMatchesHeader: 'Ranked by fit to your readings. No paid placements.',
  flipkartFacetLink: (facet: string) =>
    `Browse Flipkart's own ${facet} filter (seller-tagged, not checked by Silver Mirror)`,
  affiliateDisclosure: 'We may earn a commission if you buy; it never changes the ranking',
  coachMark: 'Find Silver Mirror in your share menu, then pin it',
  cropWarning: 'Crop out your address or order details',
  rulesBanner: 'Flagged by our published rules, not a measured effect on skin.',
  auditCaption: 'Flagged by our published rules, not a measured effect on skin. Our sample, not the market.',
  captureTooSmall: 'Move closer so your face fills the oval',
  captureDark: 'Face a window or a lamp',
  selfReported: 'self-reported',
  /** Product name and the reading glossary (DESIGN.md §10). User-facing only: code keeps Key / skinkey identifiers. */
  appName: 'Silver Mirror',
  reading: {
    yours: 'Your reading',
    demo: 'Demo reading',
    useDemo: 'Use the Demo reading',
    none: 'No reading yet',
    delete: 'Delete my reading',
    making: 'Making your reading',
    ready: 'Your reading is ready',
    photoDeletedStamp: 'Photo deleted · bands only',
    /** Skin-type card label (Home compact card, Reading/Result hero card). */
    skinType: 'Your skin type',
    /** Section head over the band chips on the Reading tab and Result. */
    keyReadings: 'Key readings',
  },
  /** First-run welcome (app/welcome.tsx). The tagline is the brand line; it makes no claim. */
  welcome: {
    tagline: 'Check a product against your skin reading before you buy.',
    start: 'Get started',
  },
  /** Home share steps: three thumb-tile rows per store. COPY.sharePaths stays as the one-line accessibility summary. */
  shareSteps: (store: 'Flipkart' | 'Amazon' | 'Nykaa') =>
    [
      { title: 'Tap Share', supporting: `On the product page in ${store}` },
      { title: 'Pick Silver Mirror', supporting: store === 'Amazon' ? 'Tap More first, then Silver Mirror' : 'Pin it so it stays first' },
      { title: 'See if it fits', supporting: 'Your check opens here, with the reasons' },
    ] as const,
  /** Title of the gradient banner inside Better matches (the section head already says "Better matches"; showcase "Top Picks for …"). */
  matchesBanner: (skinType: string) => `Picks for ${skinType.toLowerCase()} skin`,
  shareTo: 'In Flipkart, Amazon or Nykaa, tap Share → Silver Mirror.',
  scanSteps: {
    upload: 'Uploading',
    analyse: 'Analysing (HD)',
    read: 'Reading results',
    delete: 'Deleting from YouCam',
  },
  /** Checklist-card labels once a step has finished (DESIGN.md §8.8); shown with the drawn circle-check icon, never a unicode tick. */
  scanStepsDone: {
    upload: 'Uploaded',
    analyse: 'Analysed (YouCam HD)',
    read: 'Results read',
    delete: 'Deleted from YouCam',
  },
  tryonSteps: {
    upload: 'Uploading',
    tone: 'Reading skin tone (YouCam)',
    render: 'Rendering 2 shades (YouCam)',
    delete: 'Deleting from YouCam',
  },
} as const;
