# Silver Mirror: design system of record

Version 2.0 · 2 Nov 2026 · tokens `2.0.0` (`design/system/tokens/skinkey.tokens.json`)

Silver Mirror is the user-facing name of the app formerly called SkinKey. This file owns the durable visual decisions. Product truth lives in `PRODUCT.md` and `research/skinkey_v2_spec.md`; copy rules and banned words in `design/research/00_research_summary_and_design_brief.md` §4. Where the moodboard and product law disagree, **product law wins** (the conflicts are listed in §11).

| Source | Role |
|---|---|
| `design/reference/silver-mirror-moodboard.md` | The visual direction (Aman's reference). Look and feel only; its Do-NOT-adopt list is binding. |
| `design/reference/critique-current.md` | Screen-by-screen fix list for the current build. |
| `design/reference/dribbble-patterns.md` | 20 adopted patterns and the clichés to refuse. |
| `design/system/tokens/` | Token source → `theme.ts` (RN) and `tokens.css` (web); `check-contrast.mjs` gates 332 pairs + 31 lints. |
| `apps/mobile/src/brand/` | Mark, wordmark, sheen, face frame (vector, tokens only). |
| `design/redesign-screens.md` | Implementation checklist per screen, with owner groups. |

---

## 1. Principles

The product is a **mirror that shows its working**: you hold a product up to your own reading and see, plainly, why it fits or not. The look is calm, premium and clean: pearl light, liquid silver, one deep slate action. It is never clinical, never glam, never "AI magic".

1. **Reasons before verdicts.** The verdict card frames the reasons; it never replaces them. Reasons are set larger than the verdict label (18dp vs 15dp). The verdict sits directly under the product title, before any prompt or CTA.
2. **One action per screen state.** One filled slate pill (pearl in dark). Everything else is a tonal pill or a text action. Outlined boxes are retired.
3. **Privacy you can see.** "What stays on this phone" is shown before the camera opens. "Deleted from YouCam" is its own checklist step with a time stamp. Delete is one tap from the reading.
4. **Honest UNKNOWN.** UNKNOWN is a designed neutral state with a next step and the real catalogue count, never an error, never a slate fill that could read as a button.
5. **Fit, not safety.** CAUTION is soft amber, never red, never a triangle, never fills the screen. MEDICINE is ink only: one line, the pharmacist icon, no box.
6. **Bands, never numbers.** Readings are Low / Medium / High chips and three-segment meters. No score, ring, percentage, skin age, progress chart or before/after.
7. **Colour is never alone.** Every state carries a label and a unique icon silhouette; selection carries weight, stroke and a pill.
8. **Both themes are designed.** The app follows the phone. Light is pearl daylight; dark is graphite with a silver sheen, not flat black.

**Physical scene.** A shopper in a Mumbai metro or on a sofa at night, phone in one hand, the store app open in the other task, deciding in under a minute. Light mode carries daytime glare; dark mode is common at night and is the theme most device shots were taken in, so dark is a first-class design, not an inversion.

---

## 2. Colour

Restrained strategy: cool neutrals with a faint lavender cast, one deep slate accent, greige as warmth, and four verdict roles. All values below are generated from the token file; never type a hex in UI code (use `theme.colors.*` / `var(--sk-color-*)`).

### 2.1 Neutrals and accent

| Role (token) | Light | Dark | Notes |
|---|---|---|---|
| `color.bg` | pearl.50 `#F6F5F8` | graphite.950 `#121319` | Screen |
| `color.bg-sunken` | pearl.100 `#EFEEF3` | graphite.975 `#0E0F14` | Chips, track, sunken wells |
| `color.surface` | pearl.25 `#FCFBFD` | graphite.900 `#1A1B23` | Plain cards, skin map |
| `color.surface-raised` | white `#FFFFFF` | graphite.850 `#20212A` | Raised cards, sheets, tab bar, fields |
| `color.text` | graphite.900 `#1A1B23` | pearl.100 `#EFEEF3` | 13.8:1+ |
| `color.text-muted` | silver.700 `#4B4958` | pearl.300 `#C6C3CF` | 7.3:1 / 9.2:1 |
| `color.text-subtle` | silver.600 `#636070` | silver.400 `#A8A5B3` | ≥4.5:1 on every surface |
| `color.border` | pearl.200 `#DCDAE3` | graphite.750 `#30313C` | Decorative hairline |
| `color.border-strong` | silver.500 `#7E7B8B` | silver.500 `#7E7B8B` | Meaningful edges, ≥3:1 |
| `color.accent` (primary pill, active tab) | slate.700 `#3B3F52` | pearl.50 `#F6F5F8` | Dark is inverted |
| `color.on-accent` | pearl.50 `#F6F5F8` | slate.800 `#2F3243` | 9.6:1 / 10.9:1 |
| `color.accent-pressed` | slate.600 `#50576F` | pearl.300 `#C6C3CF` | |
| `color.accent-subtle` / `on-accent-subtle` | slate.100 `#E1E4EE` / slate.800 | slate.800 `#2F3243` / slate.100 | Selected segment |
| `color.secondary-bg` / `on-secondary` | pearl.150 `#E7E5EC` / graphite.900 | graphite.750 `#30313C` / pearl.100 | Tonal pill |
| `color.accent-warm` / `on-accent-warm` | greige.300 `#CFC4BB` / greige.800 `#4A4038` | greige.800 / greige.200 `#E4DCD5` | Demo badge, focus tiles. Greige is a fill, never text on pearl (1.6:1) |
| `color.icon-disc` / `on-icon-disc` | lavender.100 `#ECE9F5` / slate.700 | lavender.800 `#34304F` / lavender.200 `#DDD8EE` | The moodboard droplet disc |
| `color.link` | slate.600 `#50576F` | slate.200 `#C7CCDB` | |
| `color.focus-ring` | slate.500 `#666E88` | lavender.300 `#BEB6DE` | 2dp ring, 2dp offset |
| `color.bracket` | slate.500 | slate.300 `#A6ADC2` | Face-frame brackets on plates |
| `color.sheen.start / lavender / silver / end` | `#FDFCFE` `#ECE8F4` `#E4E3EA` `#F6F5F8` | `#262733` `#24222F` `#1C1D25` `#121319` | Hero gradient; text gated on every stop |
| `color.sheen-edge` | transparent | `rgba(239,238,243,0.07)` | 1dp top highlight on raised dark cards and sheets |
| `color.overlay-camera` | `rgba(14,15,20,0.62)` | same | Over live camera; white text ≥5.4:1 on a white frame |
| `color.inverse-surface` / `inverse-text` | graphite.850 / pearl.100 | pearl.150 / graphite.900 | Snackbar |

### 2.2 Verdict roles

| State | Light bg / fg / border / icon | Dark bg / fg / border / icon | Edge | Icon |
|---|---|---|---|---|
| **FITS** (muted sage) | `#E2EEE8` / `#2B5145` / `#568676` / `#3D6B5C` | `#1A2A25` / `#C4DDD2` / `#568676` / `#97C0B0` | 1dp solid | seal-check (only non-circular silhouette) |
| **CAUTION** (soft amber, hue 37–39°) | `#F5EAD6` / `#66460C` / `#A57A2F` / `#8A6118` | `#2A2317` / `#EDD6AE` / `#A57A2F` / `#D4A65A` | 1dp solid | half-filled circle (never a triangle or "!") |
| **UNKNOWN** (neutral, slate ink) | `#EFEEF3` / `#2F3243` / `#666E88` / `#50576F` | `#20212A` / `#C7CCDB` / `#848CA5` / `#A6ADC2` | 1dp **dashed** | dashed circle + centre dot |
| **MEDICINE** (ink outline) | screen bg / `#1A1B23` text, no box | screen bg / `#EFEEF3`, no box | none | pharmacist at a counter, 32dp |

Rules (lint-enforced): CAUTION hue stays 25–65° in every role and mode; no verdict colour equals the accent; the UNKNOWN fill is ≥3:1 away from the primary pill and always dashed; verdict tint never leaves the head; "based on product name only" is the FITS/CAUTION head with a dashed edge plus the qualifier.

### 2.3 Brand gradients

- **Chrome S:** `theme.colors.mark.*` (chrome stops from `#EEEDF3` through lavender `#CBC5E0` to `#4F4D5E`, brighter set in dark). Banded along the stroke top-left → bottom-right, two thin glints inside the bowls, a soft offset under-stroke for depth. No SVG filters (unreliable on Android).
- **Tile:** white → pearl.150 in light, graphite.750 → graphite.900 in dark, one radial highlight top-left (0.7 / 0.12 opacity).
- **Sheen:** 135° pearl → lavender (40%) → silver (72%) → bg, plus one soft highlight. Static. Allowed only on: splash, welcome, Home hero band, empty-state plates, the reading-card header strip, the face frame. Never behind reasons, the ledger, forms or the verdict head.

---

## 3. Brand

| Asset | Where | Notes |
|---|---|---|
| Chrome-S mark | `apps/mobile/src/brand/SilverMark.tsx` | `size` ≥24dp, `tile` on/off. Decorative next to the wordmark; pass `accessibilityLabel` only when it stands alone. |
| Wordmark | `Wordmark.tsx` + generated `wordmarkPaths.ts` | "Silver Mirror" in Noto Serif Display 400, outlined to paths with the font's kerning and +0.018em tracking, so it never falls back. Sized by cap height (`brand.wordmarkHeader` 15dp, `brand.wordmarkWelcome` 24dp). TalkBack reads it as text "Silver Mirror". |
| Lockup | `BrandLockup.tsx` | `header`: 36dp tile + wordmark in a row, gap 12. `welcome`: stacked, 96dp tile, wordmark, optional tagline in `type.bodySm` muted. |
| Launcher icon, adaptive layers, monochrome, splash (light + dark), favicon | `apps/mobile/assets/images/*.png` | Rendered from `geometry.ts` by `scripts/brand/build-brand.mjs` on the VM. Previews: `design/brand/png/brand-sheet.png`, `lockup-light.png`, `lockup-dark.png`. SVG sources in `design/brand/`. |

Clear space around the tile = 25% of its size. The mark never sits on the verdict head or over the camera. No tagline that makes a claim; the welcome line is "Check a product against your skin reading before you buy."

---

## 4. Typography

Two faces, both from `@expo-google-fonts`, both containing **₹ (U+20B9)** (verified with fontTools on the build VM):

- **Noto Serif Display** (high-contrast, Didone-like hairlines): wordmark, display, title, the product name on /check, the verdict sentence. **Never below 20dp** (lint).
- **Geist** (clean grotesk, tabular figures): every control, label, section head, reason, body line and number.

Rejected: Newsreader + Commissioner (Clay & Ink), Inter-only and Playfair + Inter (taste bans), Bodoni Moda / Gilda / Prata / Kalnia / Italiana (no ₹).

| Token | Face | Size / line (dp) | Tracking | Use |
|---|---|---|---|---|
| `type.display` | Noto Serif Display 400 | 34 / 40 | −0.6 | Home greeting, welcome, empty-state headline |
| `type.title` | Noto Serif Display 400 | 26 / 32 | −0.3 | Screen titles, product title, medicine line |
| `type.verdictLine` | Noto Serif Display 400 | 20 / 27 | 0 | Verdict sentence |
| `type.figure` | Noto Serif Display 400, tabular | 26 / 32 | −0.3 | Catalogue count, QR countdown |
| `type.headline` | Geist 600 | 20 / 26 | −0.2 | Card heads, sheet titles |
| `type.section` | Geist 600 | 17 / 24 | −0.1 | Sentence-case section heads |
| `type.reason` | Geist 500 | 18 / 26 | −0.1 | Reason reading line (> verdict label) |
| `type.verdictLabel` | Geist 600 caps | 15 / 20 | +1.2 | FITS / CAUTION / UNKNOWN (the only caps line) |
| `type.body` / `bodyStrong` | Geist 400 / 600 | 16 / 24 | 0 | Body, product fact, band value |
| `type.bodySm` | Geist 400 | 14 / 20 | +0.1 | Ledger values, supporting lines |
| `type.label` | Geist 600 | 14 / 20 | +0.1 | Chips, field labels |
| `type.labelSm` / `labelSmRegular` | Geist 600 / 400 | 13 / 16 | +0.2 | Tab labels (selected / not) |
| `type.button` | Geist 600 | 16 / 20 | +0.1 | All buttons |
| `type.overline` | Geist 600 | 13 / 18 | +0.1 | Ledger keys, **sentence case** (no tracked caps, no eyebrows) |
| `type.caption` | Geist 400 | 13 / 18 | +0.1 | Destination lines, timestamps, meter labels |
| `type.fine` | Geist 400 | 12 / 16 | +0.2 | Data credits only (the 12dp floor) |

Rules: sp scaling on, `maxFontSizeMultiplier` 2.0; buttons stack at 1.3×, ledger keys stack and the dock goes inline at 1.5×. No kicker or eyebrow above any heading. Prices, dates, SPF and counts use tabular figures. Product names from listings are title-cased before display.

---

## 5. Space, radius, elevation

- **Spacing:** 4dp base (`space.1`…`space.20`). Gutter 20. Card inset 20. Sheet inset 24. Section gap 32. More space above a heading than below it.
- **Radius:** xs 2 (meter segments) · sm 8 (tags) · md 14 (focus tiles, thumbnails, snackbar) · **lg 20 (cards, verdict head, ledger, reading card, checklist)** · xl 24 (camera and face frames) · sheet 28 · **full (every button, chip, field, tab indicator)**.
- **Elevation, light:** tone stack bg-sunken < bg < surface < white, plus one soft slate-tinted offset shadow (`0 8px 24px -10px rgba(42,45,64,0.14)` + 1px contact). Hairline **or** shadow carries the edge, never both heavy. Level 2 casts upward (dock, tab bar). Level 3 for sheets.
- **Elevation, dark:** no shadows. Surfaces step lighter (#121319 → #1A1B23 → #20212A), with a hairline and the 1dp `sheen-edge` on the top edge of raised cards, sheets and the tab bar. That top highlight is the "silver sheen" that keeps dark from reading flat.
- **Glass:** only on the tab bar's backdrop if the platform supports it cheaply; never on content, never over text.

---

## 6. Motion

Personality: **mirror settling**: light glides across and comes to rest. Decelerating curves, no springs, no overshoot, nothing loops.

| Token | Value | Use |
|---|---|---|
| `motion.duration.press` | 100ms | Press state, scale 0.98 transform only |
| `state` / `base` / `enter` | 160 / 220 / 300ms | State changes, entrances |
| `verdictReveal` | 320ms, ease decelerate | Verdict head opacity + 0.98→1, one light haptic |
| `reasonStagger` | 60ms ×3 max | Reasons rise 6dp |
| `bracketResolve` | 420ms, ease **glide** `cubic-bezier(0.16,1,0.3,1)` | **The one authored moment**: on each completed scan step the face-frame brackets close in 4dp; after "Deleted from YouCam" they rest closed |
| `sheetEnter` / `sheetExit` | 300 / 220ms | Sheets |
| `crossfade` | 120ms | Everything under reduce motion |

Reduce motion: every transition becomes a 120ms crossfade; brackets jump to their end state; ticks appear without drawing. Forbidden: spring, bounce, loops, pulsing, shimmer sweeps on the mark or text, auto-rotating content.

---

## 7. Iconography

- **Custom SVG line icons** (react-native-svg), 24dp grid, **1.5 stroke**, round caps and joins, no fills (except the CAUTION half-circle and the selected-tab stroke at 2.0). Sizes 16 / 20 / 24 / 32.
- One icon system across the app: merge `features/check/ui/Icon.tsx` and `features/scan/ui/Icon.tsx` into one set with one name scheme (kebab-case).
- Set: chevron-left (the only back affordance), chevron-right, arrow-right, arrow-up-right (leaves the app), arrow-down-left (shared from), share, paste, search, check, check-circle, minus-circle, circle, circle-dot, circle-dashed-dot, seal-check, circle-half, pharmacist-counter, droplet, face-frame, tag-check, phone-lock, trash, info, close, camera, flip, torch, cloud-off, gear, more-horizontal.
- Tabs: **tag-check** (Check), **face-frame** (Scan), **droplet** (Reading).
- Icon in a disc (`component.iconDisc`): 40dp lavender disc, 20dp icon; 56dp / 24dp for empty states. One per card. Decorative icons are hidden from TalkBack; icon-only controls carry a label.
- Banned: shield, warning triangle, exclamation mark, medical cross/plus, pill, mortar and pestle, eye, sparkles, magic wand, store logos, unicode ✓ / ⋯ as icons.

---

## 8. Components

Token paths in `theme.components.*` (RN) and `--sk-<component>-*` (web). Anatomy, states and TalkBack rules carry over from `design/system/components.md`; this section is what changes.

### 8.1 Buttons (`component.button`)
| Variant | Look | Rules |
|---|---|---|
| `primary` | Slate pill (pearl in dark), 52dp, label + optional trailing arrow | **At most one per screen state.** Pressed = accent-pressed + 0.98. Disabled = disabled-bg with a ≥4.5:1 label. |
| `secondary` | Tonal pill (`secondary-bg`), 48dp, no outline | Second choice ("Try a sample share", "Use the Demo reading"). |
| `tertiary` | Text + chevron, 48dp box | Dismiss, "See all", "Got it". |
| `destructiveNeutral` | Text-style pill with leading trash icon, no box, no red | Always followed by a confirmation sheet. |
| `consentPair` | Two identical tonal pills with a 1dp strong edge | **Equal visual weight** (spec §2) for Start scan / Not now. |
Every button is a pill. Outlined boxes are gone.

### 8.2 Fields and chips
- **Paste field** (`component.field`): white pill (graphite-850 in dark), 56dp, 1dp `border-strong` edge (≥3:1), placeholder in text-subtle, an inline trailing **Check** pill inside the field (48dp target). Focus = 2dp focus-ring edge. Error = 2dp text-colour edge + info icon + message below. Label above.
- **Chip** (`component.chip`): 36dp visual pill in a 48dp target. Selected = slate fill + check icon + weight. Reading chips are static and read with their card.
- **Segmented** (`component.segmented`): sunken track, the selected segment is a white raised pill with a check. Used for the Flipkart / Amazon / Nykaa share-path switch.

### 8.3 Cards
- **Reading card** (`component.readingCard`): icon disc (droplet) · "Your reading" (section) · "Skin-type reading: Combination" (headline) · "Scan 2 Nov · photo deleted" (caption) · chevron; up to three band chips below. One target, one label in visual order ("Your reading, combination, scanned 2 November. Open"). Empty: "No reading yet" · "Scan once, about a minute" · slate pill **Start scan** · tonal **Use the Demo reading**.
- **Product card** (`component.productMatchCard`): white, soft shadow, 56dp sunken thumbnail tile (category glyph when there is no image), name in bodyStrong, one reason line where commerce puts stars, verdict tag (icon + label), arrow-up-right link-out mark. In Better matches every card looks the same (no featured first card) and the store is named once above the list (§9.5); TalkBack still hears it on each card. No ratings, review counts, ribbons or logos.
- **Focus tile** (`component.focusTile`): square greige tile, 24dp line icon, label. Three across. From the published facet map only.
- **Checklist card** (`component.checklistCard` + `processingStepper`): rows of 48–56dp; done = drawn circle-check, current = ring + centre dot, pending = empty ring; never a spinner; the delete step gets a stamp.
- No nested cards. No row of same-size icon + heading + text cards as page structure.

### 8.4 Verdict head (`component.verdictCard.head`)
Radius 20, padding 20. A 40dp white disc (`iconDisc`) holds the 24dp verdict icon; next to it the caps label in the verdict fg; below, the verdict sentence in `type.verdictLine` (serif) in full text colour. 1dp edge (dashed for UNKNOWN and name-only). No leading stripe (the old 3px left border is a craft-floor refusal). A small greige **Demo reading** badge (`demoBadge`) sits in the head when the Demo reading is in use. MEDICINE: no box, no label, the 32dp pharmacist icon over one serif title line, about a third down the content.

### 8.5 Reasons (`component.reasonRow`)
Section head "Why · 2 reasons" (sans). Each reason is a quiet surface row: reading line (`type.reason`, 18/500) → product fact (`type.body`) → rule tag (caption, muted) and the band chip. No decorative 01/02 numerals.

### 8.6 Provenance ledger (`component.provenanceLedger`)
"Where this comes from" as a receipt card: rounded surface card, hairline dividers, keys **Reading · Product · Rules · Limits** in sentence case, key column 96dp (sized to the longest key, never breaks mid-word), values in bodySm; task ids in a short muted form ("Published rules (version b7cbc69)"). Below 360dp or at 1.5× the key stacks above the value. Links are sibling nodes after the row text.

### 8.7 Sheets, dock, snackbar
- **Bottom sheet:** radius 28 top corners, 36×4 handle in a 48dp target, a Close button always, sheen-edge on top in dark, scrim `color.overlay`. Focus to the title on open, back to the trigger on close.
- **Action dock** (`component.actionBar`): ONE primary pill naming its destination ("Back to Nykaa listing") + a 48dp round tonal **More** button opening the store-search sheet. A secondary "Better matches" pill shows only while that section is off screen. Border and elevation 2 only while content scrolls under it.
- **Snackbar:** inverse surface, radius 14, action in inverse-link.

### 8.8 Tab bar (`component.bottomNav`)
Three tabs: **Check · Scan · Reading**. 72dp bar on `surface-raised` with a hairline (and sheen-edge in dark), never the stock white bar. Active = 56×32 slate pill (pearl in dark) behind a 2.0-stroke icon in on-accent, label Geist 600; inactive = 1.5-stroke muted icon, label Geist 400. `role="tablist"`, each tab `role="tab"` with `selected` state. Hidden on pushed details (/check result, better matches, try-on). Settings is a 48dp gear icon button in the Home top bar. Theme the Android navigation bar to `color.bg` (edge-to-edge).

### 8.9 Face frame (`component.faceFrame`, `brand/FaceFrame.tsx`)
Rounded 24dp plate on the sheen, four corner brackets in `color.bracket` (2dp, 24dp long), a faint oval, an optional sparse dot grid at 30%. **No face, no photo, no mesh over a person.** Over the live camera the same brackets use `on-overlay` white (`captureGuide.bracket*`).

### 8.10 States
Empty and error states: a face-frame or mark plate on the sheen, one serif display line, one muted line, **one** pill action (optional tonal second). Left-aligned text. Neutral, never red. Offline actions are disabled, not hidden. Errors name the problem and the recovery.

---

## 9. Screens

File paths, owners and the step-by-step checklist live in `design/redesign-screens.md`. Specs:

### 9.1 Splash and first launch
Splash: the chrome S centred on pearl `#F6F5F8` (light) or graphite `#121319` (dark), 120dp. No full-bleed liquid photo. Optional first-run welcome only if it adds no step before a share can be checked: sheen backdrop, `BrandLockup variant="welcome"` with "Check a product against your skin reading before you buy.", slate pill **Get started**, tonal **Try a sample share**. No carousel.

### 9.2 Home = Check tab (`(tabs)/index.tsx`, `features/home/*`)
Top to bottom, fitting a 6.5" phone above the fold:
1. Top bar: `BrandLockup variant="header"` left, 48dp gear icon button right (Settings).
2. Greeting in `type.display` ("Good evening"), with one muted line under it ("Our catalogue: 180 products, 125 checked against the brand page"). No name field.
3. **Reading card** (§8.3), full width, on the sheen-lit hero band.
4. Section head "Check a product". The **paste field** with the inline **Check** pill. One primary path; no competing full-width "Check it" box.
5. **Compact share tip** (`shareTeachingCard`): a mini share-sheet strip of three generic tiles where the highlighted tile is the real chrome-S labelled "Silver Mirror"; a Flipkart / Amazon / Nykaa segmented control showing one path line at a time (`COPY.sharePaths`); tertiary "Got it".
6. Tonal pill **Try a sample share** with its caption.
7. Footer captions: "Cosmetic guidance, not medical advice." · "Not affiliated with Flipkart, Amazon or Nykaa."

### 9.3 SKU confirm sheet (`features/check/components/SkuConfirmSheet.tsx`)
Bottom sheet, title "Which product is this?". Candidate rows are 20dp-radius surface cards: a sunken category-glyph tile, name in bodyStrong, size line muted ("50 g · also 30 g, 100 g"); mismatched tokens (SPF 30 vs SPF 50, "Body") in bold. Radio ring + check circle on selection. A full-width tonal pill **None of these: check by name only**. Keep the line "We check nothing until you pick." No verdict before a pick.

### 9.4 Verdict (`app/check.tsx`, `features/check/*`)
Reading order: app bar (chevron-left, store source chip "Flipkart") → product title (serif `type.title`, title-cased) + meta → **verdict head** → reasons → next step → provenance ledger → better matches. When there is no reading, a compact inline card under the verdict: "No reading yet" + slate pill **Start scan** + text **Use the Demo reading** (never above the verdict).
- **FITS:** sage head, seal-check, `COPY.subtitle.FITS`; reasons or "No ingredient in our rules flags your readings."
- **CAUTION:** amber head, half circle, `COPY.subtitle.CAUTION`; reason first, e.g. "Your redness reading: Medium (scan 1 Nov)" → "Contains fragrance (parfum)" → "Rule OCC-2".
- **Name only:** FITS/CAUTION head, dashed edge, qualifier "based on product name only", `COPY.nameOnlyNote`.
- **UNKNOWN:** neutral dashed head, `COPY.subtitle.UNKNOWN`; next steps as one primary inside the content, **Snap the ingredient list**, plus the real catalogue count; never "0 verified" under a known product.
- **MEDICINE:** no head box; pharmacist icon + `COPY.medicine(token)`; one action, Back to product; no reasons, ledger or matches.
- **Dock:** one primary "Back to {store} listing" + round **More** (store searches) + "Better matches" pill only while that section is off screen.

### 9.5 Better matches (`features/matches/BetterMatches.tsx`)
Section head "Better matches", then the honesty line as caption-size muted text with a 1dp rule: "Ranked by fit to your readings. No paid placements." Filter chips from the readings ("For your oiliness", "Fragrance-free", "Lighter textures"). One destination line above the cards ("Each card opens a Flipkart search for that product."), then the product cards (§8.3), all alike. Store searches as one row of three chips (Flipkart / Amazon.in / Nykaa) with a single shared destination line ("Opens a keyword search for 'sunscreen' in the store app (Nykaa: browser)"). Affiliate line when relevant. `COPY.noMatches` as a calm empty state.

### 9.6 Scan consent (`app/scan/index.tsx`, `features/scan/ConsentScreen.tsx`)
Warm and short. A pearl hero with the **face frame** illustration, serif title "Before your scan". Three icon-disc rows: "One photo, analysed by YouCam" · "Deleted from YouCam right after" · "Only bands kept, on this phone". A **What stays on this phone** card as a checklist: kept (check-circle) skin-type reading, Low/Medium/High bands, zone labels, scan date; not kept (minus-circle) your photo, face shape. Then `COPY.privacyLine` as body (one TalkBack block), the qualifier behind a "Details" row, and `COPY.accuracyNote`. Sticky footer: the unticked **18+ checkbox row directly above** the equal-weight **Start scan / Not now** pair.

### 9.7 Capture (`app/scan/capture.tsx`, `features/scan/CaptureScreen.tsx`, `CaptureGuide.tsx`)
The user's live camera in a 24dp-radius frame, four white corner brackets (3dp, 28dp long), a faint 1.5dp oval at 72% width. One hint pill at a time at the top (`COPY.captureTooSmall`, `COPY.captureDark`). 72dp white shutter ring; flip and tips as 48dp icon buttons on the camera overlay. No mesh, no model face.

### 9.8 Processing (`app/scan/processing.tsx`, `features/scan/ProcessingScreen.tsx`)
`FaceFrame` (dots on) on top; the brackets close in on each completed step (`bracketResolve`, the signature moment). Below it the **checklist card**: Uploading → Analysing (YouCam HD) → Reading results → **Deleted from YouCam**, each with its own state and the done label from `COPY.scanStepsDone`; the last row lands as a stamp "Photo deleted · 21:04". One muted line: "Stay on this screen. This takes about 10 seconds." Hidden polite live region announces steps. Title "Making your reading".

### 9.9 Result (`app/scan/result.tsx`, `features/scan/ResultScreen.tsx`)
Serif title "Your reading is ready". **Skin-type card**: droplet disc, "Skin-type reading: Combination", one plain cosmetic line. Reading chips (bands as Low / Medium / High, never numbers) or the band list with three-segment meters; "Feels wrong? Edit" text action; edited bands get a "self-reported" tag. **What this means for products**: three focus tiles from the facet map (e.g. Lighter textures · Hydration · Fragrance-free; never "repair"). Accuracy note once. Then the share coach mark using the same share-strip art (chrome-S tile), and a slate pill **Check a product**.

### 9.10 Your reading = Reading tab (`app/key.tsx`, `features/key/KeyScreen.tsx`, `KeyCard.tsx`, `KeyPanel.tsx`)
Reading card expanded: skin type, band list, zone glyph, scan date, stamp "Photo deleted · bands only", Demo-reading badge when applicable. At the bottom, `destructiveNeutral` **Delete my reading** (trash, confirmation sheet). Empty: face-frame plate on the sheen, serif "No reading yet", one line, slate **Start scan**, tonal **Use the Demo reading**. Left-aligned.

### 9.11 Try-on (`app/tryon.tsx`, `features/tryon/*`)
Consent reuses §9.6's pattern with `COPY.privacyLine`. Progress reuses the checklist card (`COPY.tryonSteps`). Result: two equal portrait cards from the same photo, a shade-name chip under each, the fixed caption `COPY.tryonCaption` on the plain surface below, always visible. No drag slider, no Save button, no swatch of the user's own tone.

### 9.12 Settings (`app/settings.tsx`, `features/key/SettingsScreen.tsx`)
Reached from the Home gear. Grouped rounded inset cards with sans-semibold group heads: **Your data** (Delete my reading, Withdraw consent with a *leading* trash icon, What stays on this phone) and **About** (How this was made, Published rules, Credits). Rows ≥56dp, leading line icon, trailing chevron. Credits list one per line, fixed strings verbatim, including "Fonts: Noto Serif Display and Geist (SIL Open Font License)". Roadmap line last.

### 9.13 How this was made (`app/how.tsx`, `features/scan/HowScreen.tsx`, `features/check/components/HowThisWasMadeSheet.tsx`)
`COPY.howMadeBoundary` as the serif lead ("Claude reads. Our rules decide."). Delete steps as the same checklist card as processing. "Photos on this phone" as a status card with a drawn check-circle and a small tonal **Check again**. Each recorded call as a compact card: service, short task id (muted), units, time, delete-status chip. No unicode ticks, no arrow-chain sentences.

### 9.14 Empty and error states
Nothing to check yet (Check, warm share with no payload): share-strip illustration, serif "Nothing to check yet", `COPY.shareTo`, slate **Paste a link**. Offline: list-row banner with cloud-off, actions disabled. Scan failed: checklist card with the failed row (text-colour bar, no red), the recovery line, slate **Try again**, tonal **Use the Demo reading**. Cap reached: worker message verbatim ("Try the Demo reading."), tonal **Use the Demo reading**.

### 9.15 Web (`apps/web`)
Same tokens via `tokens.css` (fonts load from Google Fonts in `index.html`). Landing: sheen hero, serif one-line story, slate **Try a sample share**, tonal **Get the Android app**, the real device loop in a plain outline, the three-step strip, an APK QR card with the not-affiliated line. `/check` and shared results reuse the verdict head and ledger specs. No testimonials, counts, ratings or store badges.

---

## 10. Rename glossary (user-facing only)

| Old | New | Constant |
|---|---|---|
| SkinKey | **Silver Mirror** | `COPY.appName`, `app.json expo.name` |
| Your Key | **Your reading** | `COPY.reading.yours` |
| Demo Key | **Demo reading** (button: "Use the Demo reading") | `COPY.reading.demo`, `.useDemo` |
| Delete Key | **Delete my reading** | `COPY.reading.delete` |
| No Key yet | **No reading yet** | `COPY.reading.none` |
| Making your Key | **Making your reading** | `COPY.reading.making` |
| Your Key is ready | **Your reading is ready** | `COPY.reading.ready` |
| Score bands only | **Photo deleted · bands only** | `COPY.reading.photoDeletedStamp` |

Unchanged on purpose: `android.package app.skinkey`, the slug and URL scheme, the worker URL, every code identifier (`KeyProfile`, `useSkinKeyTheme`, `@skinkey/*`), `--sk-*` CSS variables, and the "SkinKey team rule" citation inside the published rules (it is part of the hashed ruleset).

---

## 11. Moodboard vs product law (resolved)

| Moodboard | Decision | Why |
|---|---|---|
| UNKNOWN = cool slate | Neutral pearl/graphite fill, dashed slate edge, slate icon | The slate fill is the primary pill; UNKNOWN must never read as a button (lint). |
| "Barrier repair" focus tile | Lighter textures · Hydration · Fragrance-free | "repair" is banned (brief §4.4). |
| Greige accent | Fill only | 1.6:1 on pearl. |
| 5-tab bar | 3 tabs: Check · Scan · Reading | We have no routine, products or community tab to fill. |
| Analyze face photo with mesh | Live camera with brackets; illustration elsewhere | No real face in shipped art; no mesh over a person. |
| Numeric skin score, before/after, AM/PM routine, community feed, sparkles | Not adopted | Do-NOT-adopt list and brief §4.4. |
| Slate primary + soft secondary for every pair | Consent keeps equal-weight pills | Spec §2: Start scan and Not now at equal visual weight. |

---

## 12. Verifying a change

Run on the build VM only (`scripts/remote.sh -- '<cmd>'`):

```sh
cd design/system/tokens && node build-tokens.mjs && node check-contrast.mjs --md contrast-report.md   # 0 failures
PYTHONPATH=/tmp/ftlib/lib python3 scripts/brand/wordmark_outline.py && node scripts/brand/build-brand.mjs
npm run typecheck && npx vitest run && npm run test:rn -w @skinkey/mobile && npm run lint:claims
npm run shots:web          # 14 screens x light/dark into design/web-shots/ (gitignored)
npm run emu -- qa dark && npm run emu -- qa light   # emulator shots, both themes
```

Every screen ships with a light and a dark capture. Check at font scale 1.0, 1.3 and 2.0 (`adb shell settings put system font_scale 1.3`).
