# Silver Mirror: visual reference from Aman (2026-11-02)

Aman shared a moodboard image titled "Silver Mirror: Your Personal Skincare Companion". It supersedes the Clay & Ink look as the visual direction. Keep Clay & Ink's structure, accessibility work and verdict semantics, but re-skin everything to this reference. Treat it as **look and feel only**: several of its features conflict with our product rules (see "Do NOT adopt").

## What the reference looks like
- **Brand mark:** a liquid-silver chrome "S" swirl on a soft pearlescent tile, like an iOS app icon with a metallic, mirror-like sheen. Wordmark "Silver Mirror" in a high-contrast elegant serif, near-black. Tagline under it in a light sans.
- **Palette** (swatches shown on the board: "Clean · Modern · Trustworthy"):
  - liquid silver / chrome gradient (pearl, lavender-grey highlights)
  - near-white pearl (#F6F5F8-ish)
  - deep slate navy (#3B3F52-ish), used for primary buttons and the active tab
  - warm greige/taupe (#CFC4BB-ish)
  - Surfaces are cool off-white with a faint lavender cast. Hero and backgrounds use a soft pearlescent silver gradient with gentle liquid/water-droplet light, never neon.
- **Splash/welcome:** full-bleed pearlescent silver liquid background, the chrome S, the serif "Silver Mirror", a subtitle, a dark slate pill primary "Get Started →", and a soft translucent secondary pill.
- **Home:** greeting ("Good morning, Aman"), a skin-type summary card with a small droplet icon in a lavender circle and a chevron, AM/PM segmented control, a numbered routine list with product thumbnails, a 5-tab bottom bar with thin line icons and labels.
- **Analyze screen:** large face photo in a rounded frame with corner bracket guides and a subtle dotted face-mesh, plus a checklist card below ("Analyzing texture… ✓", "Checking oil balance… ✓", "Detecting concerns… ⋯") with thin circle-check icons.
- **Report:** skin-type card (droplet icon, "Combination", a one-line plain description), "Key Concerns" as soft grey pill chips, "Recommended Focus" as three square icon tiles (Oil control, Hydration, Barrier repair), and a full-width dark slate pill CTA.
- **Products:** "Discover Products" with filter chips (For You, Cleanser, Serum, Moisturizer), a hero card "Top Picks for Combination Skin" with a product photo on a pearl gradient, and product cards on white with soft shadow.
- **Type and layout:** generous whitespace, 16–20 px rounded cards, hairline borders or very soft shadows, thin 1.5 px line icons, small grey secondary text, clear section headers in sans semibold. Calm and premium.

## Adopt (mapped to our screens)
- Brand: chrome-S mark (draw as SVG with a gradient, no raster stock), serif wordmark, pearl/lavender-silver surfaces, deep slate primary pills, greige accent.
- **Home** → greeting + "Your reading" summary card (skin-type reading + chevron) + share-first "Check a product" entry + paste field. A compact share tip.
- **Scan processing** → the face-frame with corner brackets and the checklist card. Our real steps: Uploading ✓ → Analysing (YouCam HD) ✓ → Reading results ✓ → Deleted from YouCam ✓.
- **Reading/result** → skin-type card + reading chips + "what this means for products" focus tiles (e.g. "Lighter textures", "Hydration", "Fragrance-free"), worded cosmetically.
- **Better matches** → filter chips + product cards. Keep our honesty lines (ranked by fit, no paid placement).
- **Verdict sheet:** apply the same card language. Verdict states stay distinguishable by label and icon. In this palette: FITS = muted sage/teal, CAUTION = soft amber (never red), UNKNOWN = cool slate, MEDICINE = ink outline.
- **Dark mode** (required, follows the phone): deep slate/graphite with a subtle silver sheen and pearl text. A designed dark, not flat black.

## Do NOT adopt (product rules)
- **No numeric skin score** ("82/100"), no progress charts implying improvement, no "before/after" photos, no community feed. These conflict with the cosmetic-only, no-score rules in the brief §4.4 and the spec.
- No routine-building feature (out of scope).
- No sparkle emoji. No "AI" magic language.
- Don't put a real person's face on the analyze screen in shipped UI. Use an illustrated or blurred placeholder, or the user's own live camera.
