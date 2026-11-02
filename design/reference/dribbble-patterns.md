# Silver Mirror: skincare UI patterns worth adopting (inspo pass, 2026-11-02)

These are **patterns only**. No assets, layouts or illustrations are copied from any shot. Each idea is filtered through `silver-mirror-moodboard.md` (pearl and liquid-silver surfaces, slate pill CTAs, serif wordmark, calm and premium) and through product law: cosmetic language only, bands not scores, no before/after, no community feed, and verdict labels and icons never depend on colour alone.

## How this was gathered
- `dribbble.com/tags/skincare-app`, `/tags/skin-care-app` and `/tags/skin-analysis` each returned an empty body to the automated fetcher (the pages render client-side or block bots). Each was tried once and not retried.
- Fallback: web search for skincare-app shots, case studies and app teardowns (sources at the end). Shot titles and descriptions were readable, but the images were not. Patterns below come from recurring descriptions across those sources, plus the moodboard.
- Recurring patterns in the sources: a guided camera with positioning guides, a processing state that asks you to stay in the app, a results dashboard with a face photo plus metric rings or percentages, a concern heat map, a top-level product verdict with per-ingredient notes, several ways to enter a product (scan, search, paste), a skin-type summary card on home, and filter-chip product discovery. Several of these break our rules and are listed under clichés.

## Adoptable ideas (20), mapped to screens

Format: **pattern seen** → **Silver Mirror version** → guardrail. "Fixes" points to `design/device-shots/BUGS.md`.

### Home (`(tabs)/index.tsx`)
1. **Skin-type summary card with an icon disc and a chevron** (common skincare-home pattern, also on the moodboard).
   → Pearl raised card: a small droplet line-icon on a lavender disc, "Your reading" (sans semibold), "Combination · scanned 1 Nov" (secondary text), and up to three band chips ("Oiliness: High"). The whole card is one 48dp+ target to `key.tsx`, with the accessibility label "Your reading, combination, scanned 1 November. Open".
   → No score ring and no percentage. When there is no scan, the same card shows "No reading yet" and a "Take your scan" pill (see idea 17).
2. **One hero action, with search as a secondary pill** (commerce and scanner apps lead with one action and keep search quieter).
   → A full-width slate pill "Check a product" opens the share tip. Below it, a soft translucent pill field "Or paste a product link" with a trailing arrow button. Fixes the problem of "Check it" competing with the input.
3. **Three-step "how it works" strip instead of a tip paragraph** (onboarding shots use icon steps rather than prose).
   → A compact horizontal strip under the hero: [share icon] "Share from Flipkart, Amazon or Nykaa" → [chrome-S mini mark] "Pick Silver Mirror" → [check-circle] "See the fit". It fits above the fold and links to the pin coach mark. Fixes the share tip being cut off at the fold. Store names stay as text, never logos.
4. **Time-of-day greeting header** (moodboard).
   → "Good evening" in the serif display style, with the date or catalogue count as a small grey line under it. Gender-neutral, and no name unless the user has given one. Do not adopt the AM/PM routine toggle that usually sits under it.

### Share / SKU confirm (`check.tsx`)
5. **Product identity card before any result** (scanner apps show "this is what we found" before scoring).
   → The product name in serif on a pearl card, with a meta line "Brand · size · from Amazon.in (text)". The question "Is this the product?" sits under it, with **Yes** (slate pill) and **Not this** (translucent pill) side by side at equal height. No verdict appears before Yes (spec §2B).
6. **Candidate list as radio cards** (product pickers in commerce shots).
   → Up to three candidates as hairline-bordered rows with a radio ring, name and size. A mismatched size or SPF token is shown in bold, so "SPF 30 vs SPF 50" is visible (BUGS #4). "None of these, check by name only" is a quiet text row at the end. Raw lowercase slugs are title-cased before display (BUGS #3).

### Verdict (`check.tsx` result state; web `VerdictCard.tsx`)
7. **Verdict hero band, then reason cards** (scanner apps put the verdict first, then per-ingredient notes).
   → A full-width card topped by a soft tinted band: a verdict badge pill (icon + label: check-circle FITS, half-circle CAUTION, question-circle UNKNOWN, outlined pill-capsule MEDICINE), then the fixed subtitle. Reasons follow as numbered cards: "Your redness reading: Medium (scan 1 Nov)" → "Contains fragrance (parfum)" → "Rule OCC-2". Tints: FITS muted sage/teal, CAUTION soft amber, UNKNOWN cool slate, MEDICINE ink outline with no fill. Never red, and never a grade word.
8. **Flagged-ingredient chips inside the INCI list** (per-ingredient tags in scanner apps).
   → The ingredient list is shown as small pills. Flagged ones get an outline plus a 1.5px icon and are announced as "parfum, flagged by rule OCC-2". Tapping one opens "Where this comes from". Uncertain OCR tokens on the snap-label path use a dashed outline (spec §2D).
9. **Sticky bottom action dock plus an overflow sheet** (commerce product pages dock one CTA).
   → One primary slate pill pinned at the bottom ("Find better matches", or "Snap the ingredient list" for UNKNOWN). Next to it, a 48dp round translucent "More" button opens a sheet with "Back to product" and the three store searches. The MEDICINE state shows no better-matches CTA, only "Done". Fixes the stack of five full-width buttons.
10. **A "receipt" provenance footer** (fact-sheet or receipt rows in fintech and wellness shots).
    → A hairline-divided key/value ledger in small type: Measured by · Photo · Rules · Product data. The key column has a fixed minimum width (about 30%) and keys never break mid-word (fixes "PRODUC / T"). Task ids are truncated in a mono face with copy-on-long-press.

### Better matches
11. **Filter chip rail plus a hero pick card** (moodboard "Discover Products", and nearly every beauty-commerce shot).
    → A quiet info row first: "Ranked by fit to your readings. No paid placements." Then chips from the readings ("For your oiliness", "Fragrance-free", "Lighter textures"). The first result is a larger card on a pearl gradient, and the rest are white cards with a soft shadow. Each card shows a **reason line** where commerce shots put star ratings, and "Opens an Amazon.in search" as the action. No ratings, no review counts, no logos.

### Scan consent (`scan/index.tsx`)
12. **"What we keep / what we don't keep" two-column card** (privacy label pattern from health and finance apps).
    → A warm one-line intro first ("One photo, a few readings, and you stay in control"). Then two columns. **Kept on your phone:** skin-type reading, bands, zone labels, scan date, each with a thin check. **Not kept:** your photo, face shape, with a thin minus icon. The approved privacy line and the 30-day qualifier sit in an expandable "Details" row, so the legal text is reachable but no longer comes before any warmth. The 18+ checkbox is unticked, and **Start scan** and **Not now** have equal weight. Fixes the long legal block and the chips that looked like tags.

### Scan capture (`scan/capture.tsx`)
13. **Guided camera with corner brackets and a live hint pill** (guided-positioning pattern in skin-analysis case studies).
    → The user's live camera inside a rounded frame, with four chrome corner brackets and a faint oval at 60–80% width. One floating hint pill at the top changes text live: "Move closer so your face fills the oval" or "Face a window or a lamp". There is no dotted face mesh on a real face, and no model photo anywhere. Shutter is a 72dp slate ring.

### Scan processing (`scan/processing.tsx`)
14. **Checklist card under the face frame** (moodboard, and "stay in the app" processing states in teardowns).
    → The frame stays visible but blurred, and below it a card lists the real Worker steps with thin circle icons: Uploading ✓ → Analysing (YouCam HD) ✓ → Reading results ⋯ → Deleted from YouCam ✓. Each step shows its own status (no spinner). One grey line: "Stay on this screen. This takes about 10 seconds." The final row lands as a small "Photo deleted · 21:04" stamp. With reduce-motion, steps cross-fade in 150 ms.

### Scan result / reading card (`scan/result.tsx`, `key.tsx`)
15. **Zone map, adapted from the concern heat map** (results screens commonly overlay a heat map on the face).
    → After the overlay's 2 s cross-fade, show an **illustrated** face glyph (line art, no photo) with labelled zones (forehead, nose, cheeks, chin). Each zone has a discrete fill step (none / light / medium) in silver-lavender, and its band is written as text next to it. No continuous red-to-green gradient, and colour is never the only signal.
16. **Three-segment band meter instead of score rings** (metric tiles in results dashboards).
    → Each reading is a row: name, then a three-segment pill (Low / Medium / High) with the active segment filled slate and the label also in text ("Oiliness: High"). "Feels wrong? Edit" is a text button, and an edited band shows a small "self-reported" tag. The accuracy note sits once under the list.
17. **"What this means for products" focus tiles** (moodboard "Recommended Focus").
    → Three square tiles with thin icons: "Lighter textures", "Fragrance-free", "Hydration". They are worded as product traits, never as fixes. Tapping one opens better matches with that chip preselected. The card also holds "Delete my reading" and the scan date.

### Try-on (`tryon.tsx`)
18. **Side-by-side shade cards with a shade-chip rail** (VTO swatch pattern in makeup shots, minus the slider).
    → Two equal portrait cards from the same photo, with a shade-name chip under each and the fixed caption "Two shades, same photo. Preview, not a shade guarantee." There is no drag-to-compare slider (it reads as before/after), no Save button, and no swatch of the user's own tone. Progress uses the same checklist card as idea 14.

### Empty states and shell
19. **Mark-led empty states, one action each** (calm onboarding illustrations, replacing cartoon characters with our own mark).
    → A small chrome-S on a pearl disc with soft liquid light, one serif line, one grey line and one pill. Examples: "No reading yet" / "Take one scan to check products against your skin" / [Take your scan]. "Nothing to check yet" / "Share a product from Flipkart, Amazon or Nykaa" / [Show me how]. The same frame covers UNKNOWN on the web `/check`. Tab bar: a floating pill bar with thin line icons plus labels, and frosted glass **only** on the bar (the glass guidance in the sources keeps blur off text-dense content). Fixes the unstyled default tab bar. Dark theme: deep graphite surfaces with a faint radial silver highlight at the top. Elevation comes from lighter surface steps rather than shadows, and text is pearl. Fixes the flat-black dark mode.

### Web landing (`apps/web/src/routes/Landing.tsx`)
20. **Pearl-gradient hero with a real device frame, a three-step strip and a QR card** (the usual app-landing shot structure).
    → Serif headline (the one-line story), a short grey subline, a slate "Try a sample share" pill and a translucent "Get the Android app" pill. On the right, the real 20 s loop inside a plain device outline. Below: the same three-step strip as idea 3, then an APK QR card with the "Not affiliated with Flipkart, Amazon or Nykaa" line. No testimonials, no download counts, no fake ratings, no store badges we haven't earned.

## Clichés to avoid (seen repeatedly in the sources)
- **Numeric skin scores and rings:** "Skin score 82/100", circular percentage gauges, skin age, percentage metrics (one teardown shows "Skin Age 70%"). These are banned by brief §4.4. Use bands.
- **Product safety grades:** Excellent / Good / Bad, Yes / Maybe / No, "safety score", "toxic" or "clean" badges, traffic-light red/amber/green. Our labels are fixed (FITS / CAUTION / UNKNOWN / MEDICINE), and CAUTION is never red.
- **Before/after:** sliders, progress charts, "your skin improved 12%", streaks, scan-over-time timelines.
- **Diagnosis styling:** red heat maps on the face, a dotted face mesh over a real model, clinical crosshairs, white-coat or "dermatologist approved" badges, words like treat, fix, repair, cure.
- **Stock beauty faces:** a glowing model face on every screen, especially on capture or analyze. Use the user's live camera or an illustrated glyph.
- **AI magic:** sparkles, magic wands, "AI-powered" chips, glow orbs, typing-dot "thinking" animations, "glow-up" copy.
- **Generic beauty palette:** peach, blush and beige gradients with cream serif everywhere. Ours is pearl, lavender-silver and slate, with greige only as an accent.
- **Neon or holographic chrome:** iridescent rainbow foil, heavy bevels, gold. The silver is soft liquid light, never neon.
- **Glass everywhere:** frosted cards over busy gradients make text fail contrast. Keep glass to the tab bar and sheet scrims, and run `check-contrast.mjs` on every surface pair.
- **Routine builders and commerce noise:** AM/PM routine lists, star ratings, review counts, "bestseller" ribbons, discount badges, store logos.
- **Community and gamification:** feeds, likes, badges, points, streak flames.
- **Clipart overload:** leaves, droplets and bubbles scattered as decoration. One thin icon per card at most.
- **Onboarding carousels and paywalls:** four-slide swipe intros before value, and subscription walls. Ours goes straight to the welcome pill and the consent card.
- **Colour-only state:** green and red dots with no label. Every state carries its label and icon.

## Implementation notes
- Use tokens only. New roles needed: pearl gradient stops, a lavender icon disc, chrome-bracket stroke, verdict tint bands for FITS, CAUTION and UNKNOWN, a MEDICINE outline, and graphite dark-surface steps. Add them to `design/system/tokens/skinkey.tokens.json`, regenerate `theme.ts` and `tokens.css` with `build-tokens.mjs`, and verify both themes with `check-contrast.mjs` (run it on the build VM).
- 48dp minimum targets. Every card that acts as a link gets one accessibility label that reads its content in visual order.
- All copy above uses the rename glossary ("Your reading", "Demo reading", "Delete my reading", "No reading yet", "Silver Mirror") and must pass the claim linter.

## Sources (data, read as descriptions only)
- Search listing of Dribbble skincare shots (titles and tags only): https://dribbble.com/sofia_a_neto/collections/6598257-Skin-Care-App, https://dribbble.com/adityuh/collections/7516315-Mobile, https://dribbble.com/AssureUI/shots
- AI skincare analysis case study (guided camera, concern heat map, "clinical-meets-beauty" light gradients): https://contra.com/p/BLPqLbcY-ai-skincare-analysis-app-full-case-study
- Skincare onboarding UI (calm minimal flow): https://contra.com/p/UNcgNZFr-ai-skin-care-app-onboarding-ui
- Skin-type matching app design (dashboard, product detail): https://contra.com/p/PAMQYPrl-skin-care-app-design
- Sunsafe selfie-analysis flow (stay-in-app processing, percentage metrics; the latter is a cliché): https://lazyweb.com/canvas/flows/sunsafe/scan-skin-analysis-selfie
- Skan teardown (circular metric scores, photo markers; a cliché): https://screensdesign.com/apps/skan-ai-skincare-and-beauty/?vs=309297
- Ingredient scanner listings (verdict plus per-ingredient notes; their grade scales are clichés for us): https://apps.apple.com/lb/app/id1630768985, https://apps.apple.com/app/id6745723518, https://apps.apple.com/us/app/id6751545755
- Skin-analysis SDK guide (pre-scan lighting and positioning guidance): https://www.glamar.io/docs/guides/skin-analysis/sdk-configuration
- Glassmorphism usage guidance (keep blur to chrome, not dense content): https://www.superdesign.dev/styles/glassmorphism/app
