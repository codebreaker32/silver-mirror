# Silver Mirror: design system of record

Version 2.1 · 2 Nov 2026 · tokens `2.1.0` (`design/system/tokens/skinkey.tokens.json`) · 2.1 = the showcase delta (`design/reference/showcase-delta.md`): the app now follows Aman's showcase (`design/reference/silver-mirror-showcase.png`)

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

Restrained strategy, tuned to the showcase: a lavender-grey **mist** page, clean white cards, one deep slate accent, lavender icon discs, one soft lavender gradient (skin-type card only), and four verdict roles. All values below are generated from the token file; never type a hex in UI code (use `theme.colors.*` / `var(--sk-color-*)`). `check-contrast.mjs` gates 370 pairs + 31 lints, 0 failures.

### 2.1 Neutrals and accent

| Role (token) | Light | Dark | Notes |
|---|---|---|---|
| `color.bg` | mist.100 `#EFECF2` | graphite.950 `#121319` | Page (showcase `#EFEBF1`) |
| `color.bg-sunken` | mist.150 `#E7E3EC` | graphite.975 `#0E0F14` | Wells, meter track |
| `color.surface` | white `#FFFFFF` | graphite.900 `#1A1B23` | Plain cards are white now |
| `color.surface-raised` | white `#FFFFFF` | graphite.850 `#20212A` | Raised cards, sheets, tab bar, fields |
| `color.text` | graphite.900 `#1A1B23` | pearl.100 `#EFEEF3` | 13.8:1+ |
| `color.text-muted` | silver.700 `#4B4958` | pearl.300 `#C6C3CF` | |
| `color.text-subtle` | silver.650 `#5E5B6B` | silver.400 `#A8A5B3` | ≥4.5:1 on every surface incl. mist wells |
| `color.border` | mist.250 `#E3DFE9` | graphite.750 `#30313C` | Card hairline (decorative) |
| `color.border-strong` | silver.500 `#7E7B8B` | silver.500 | Meaningful edges, ≥3:1 |
| `color.accent` (primary pill) | slate.700 `#3B3F52` | pearl.50 `#F6F5F8` | Dark is inverted; showcase CTA `#3D3C51` |
| `color.on-accent` | pearl.50 | slate.800 `#2F3243` | ≥7:1 both modes (lint) |
| `color.secondary-bg` / `on-secondary` | mist.150 `#E7E3EC` / graphite.900 | graphite.750 / pearl.100 | Tonal pill, chips |
| `color.secondary-translucent` / `-edge` | `rgba(255,255,255,0.55)` / `rgba(255,255,255,0.70)` | `rgba(239,238,243,0.10)` / sheen-edge | Welcome secondary pill over the backdrop |
| `color.icon-disc` / `on-icon-disc` | lavender.150 `#E6E2F4` / iris.600 `#5A5B9F` | lavender.800 `#34304F` / lavender.300 `#BEB6DE` | The showcase droplet disc, 4.8:1 / 6.5:1 |
| `color.thumb-tile` | mist.50 `#F5F3F8` | graphite.800 `#272832` | Soft square tile in list rows and product cards |
| `color.segment-track` / `segment-thumb` | mist.200 `#DDD9E3` / white | graphite.800 / graphite.700 `#3A3B47` | Segmented control |
| `color.tab-active` / `tab-inactive` / `tab-inactive-label` | graphite.900 / silver.500 / text-subtle | pearl.100 / silver.400 / silver.400 | Filled active glyph; outline inactive |
| `color.shadow` | `#3A3360` (violet) | transparent | The one light shadow tint |
| `color.accent-warm` / `on-accent-warm` | greige.300 / greige.800 | greige.850 / greige.200 | Demo-reading badge only (focus tiles left greige in 2.1) |
| `color.link` | slate.600 `#50576F` | slate.200 `#C7CCDB` | |
| `color.focus-ring` | slate.500 `#666E88` | lavender.300 | 2dp ring, 2dp offset |
| `color.bracket` | slate.500 | slate.300 | Face-frame brackets |
| `color.sheen.start / lavender / silver / end` | `#FDFCFE` `#ECE8F4` `#E4E3EA` mist.100 | `#262733` `#24222F` `#1C1D25` `#121319` | Hero sheen; the end stop meets the page |
| `color.sheen-edge` | transparent | `rgba(239,238,243,0.07)` | 1dp top highlight on raised dark surfaces |
| `color.overlay-camera`, `inverse-*` | unchanged | unchanged | |

### 2.2 Verdict roles

| State | Light bg / fg / border / icon | Dark bg / fg / border / icon | Edge | Icon |
|---|---|---|---|---|
| **FITS** (muted sage) | `#E2EEE8` / `#2B5145` / `#568676` / `#3D6B5C` | `#1A2A25` / `#C4DDD2` / `#568676` / `#97C0B0` | 1dp solid | seal-check (only non-circular silhouette) |
| **CAUTION** (soft amber, hue 37–39°) | `#F5EAD6` / `#66460C` / `#A57A2F` / `#8A6118` | `#2A2317` / `#EDD6AE` / `#A57A2F` / `#D4A65A` | 1dp solid | half-filled circle (never a triangle or "!") |
| **UNKNOWN** (neutral, slate ink) | `#EFEEF3` / `#2F3243` / `#666E88` / `#50576F` | `#20212A` / `#C7CCDB` / `#848CA5` / `#A6ADC2` | 1dp **dashed** | dashed circle + centre dot |
| **MEDICINE** (ink outline) | screen bg / `#1A1B23` text, no box | screen bg / `#EFEEF3`, no box | none | pharmacist at a counter, 32dp |

Rules (lint-enforced): CAUTION hue stays 25–65° in every role and mode; no verdict colour equals the accent; the UNKNOWN fill is ≥3:1 away from the primary pill and always dashed; verdict tint never leaves the head; "based on product name only" is the FITS/CAUTION head with a dashed edge plus the qualifier.

### 2.3 Brand gradients

- **Chrome S:** `theme.colors.mark.*` (chrome stops from `#EEEDF3` through lavender `#CBC5E0` to `#4F4D5E`, brighter set in dark). No SVG filters (unreliable on Android).
- **Tile:** white → pearl.150 in light, graphite.750 → graphite.900 in dark, one radial highlight top-left.
- **Sheen:** 135° pearl → lavender (40%) → silver (72%) → page, plus one soft highlight. Static. Splash, welcome, empty-state plates, the face frame.
- **Skin gradient** (`color.skin-gradient`, 2.1): 120°, `#E2DBF3` → `#EEEAF6` (55%) → `#F8F6FB` in light; `#2C2942` → `#24232F` → `#20212A` in dark; edge `rgba(255,255,255,0.6)` / sheen-edge; hero disc fill `rgba(255,255,255,0.55)` / lavender.800. `Card variant="gradient"` and the hero `SkinTypeCard` only, plus the better-matches banner. Never behind reasons, the ledger, forms or the verdict head.
- **Liquid** (`color.liquid`, 2.1): the welcome `LiquidBackdrop` ribbons (lavender → silver → white at 60%, graphite → lavender-800 at 50% in dark), a bright crest line, droplets with a white rim. Drawn, static, decorative.

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

Two faces, both from `@expo-google-fonts`, both containing **₹ (U+20B9)**. Since 2.1 (showcase) **Geist carries every line you read**, headings included; **Noto Serif Display appears only as the outlined `Wordmark` paths** (so it never falls back). The serif stays in `fontAssets`; no type style uses it.

| Token | Face | Size / line (dp) | Tracking | Use |
|---|---|---|---|---|
| `type.display` | Geist 600 | 26 / 32 | −0.5 | Home greeting, empty-state headline |
| `type.title` | Geist 600 | 22 / 28 | −0.4 | Product title on /check, in-body page heads, medicine line |
| `type.appBarTitle` | Geist 600 | 18 / 24 | −0.2 | Centred app-bar title (new) |
| `type.value` | Geist 600 | 24 / 30 | −0.4 | "Combination" in the skin-type card (new) |
| `type.headline` | Geist 600 | 20 / 26 | −0.2 | Card heads, sheet titles, matches banner |
| `type.verdictLine` | Geist 600 | 18 / 26 | −0.1 | Verdict sentence |
| `type.figure` | Geist 600, tabular | 24 / 30 | −0.3 | Catalogue count, QR countdown |
| `type.section` | Geist 600 | 18 / 24 | −0.2 | "Check a product", "Key readings", "Better matches" |
| `type.reason` | Geist 500 | 18 / 26 | −0.1 | Reason reading line (> verdict label) |
| `type.verdictLabel` | Geist 600 caps | 15 / 20 | +1.2 | FITS / CAUTION / UNKNOWN (the only caps line) |
| `type.body` / `bodyStrong` | Geist 400 / 600 | 16 / 24 · 16 / 22 | 0 | Body; list-row and product-card titles |
| `type.bodySm` | Geist 400 | 14 / 20 | +0.1 | Supporting lines, skin-type label |
| `type.label` | Geist 600 | 14 / 20 | +0.1 | Chips, field labels, focus-tile labels |
| `type.labelSm` / `labelSmRegular` | Geist 600 / 500 | 13 / 16 | +0.2 | Tab labels (selected / not) |
| `type.button` | Geist 600 | 16 / 20 | +0.1 | All buttons |
| `type.overline` | Geist 600 | 13 / 18 | +0.1 | Ledger keys, **sentence case** |
| `type.caption` | Geist 400 | 13 / 18 | +0.1 | Destination lines, timestamps |
| `type.fine` | Geist 400 | 12 / 16 | +0.2 | Data credits only (the 12dp floor) |

Rules: sp scaling on, `maxFontSizeMultiplier` 2.0; buttons stack at 1.3×. No kicker or eyebrow above any heading. A screen shows at most five sizes. Prices, dates, SPF and counts use tabular figures. The welcome tagline is Geist 400 16/22 muted.

---

## 5. Space, radius, elevation

- **Spacing:** 4dp base. Gutter 20. Card inset 20. Sheet inset 24. **Section gap 28**. More space above a heading than below it.
- **Radius:** xs 2 · sm 8 · **md 16** (thumb tiles, snackbar, band tiles) · **lg 24 (every card: skin-type, product, reason, ledger, checklist, verdict head, settings groups)** · **tile 20** (focus tiles) · **xl 28** (face and camera frames) · sheet 28 · full (every button, chip, field).
- **Elevation, light (level 1):** white card + 1dp `color.border` hairline + one soft **violet** offset shadow. RN: `shadowColor #3A3360`, opacity 0.10, radius 18, offsetY 6, Android elevation 3. CSS: `0 1px 2px rgba(58,51,96,0.05), 0 8px 22px -8px rgba(58,51,96,0.16)`. Level 2 (tab bar, dock) is **flat**: a 1dp top hairline only. Level 3 for sheets.
- **Elevation, dark:** no shadows. Tone steps (#121319 → #1A1B23 → #20212A) with a hairline and the 1dp `sheen-edge` on the top edge of raised cards, sheets and the tab bar.
- **Glass:** only the welcome's translucent pill over the drawn backdrop; never on content.

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

- **Custom SVG line icons** (react-native-svg), 24dp grid, **1.5 stroke**, round caps and joins. Sizes 16 / 20 / 24 / 32.
- One icon system across the app (`components/Icon.tsx`), kebab-case names.
- Set: **arrow-left (the back affordance, 2.1)**, chevron-left, chevron-right, arrow-right, arrow-up-right (leaves the app), arrow-down-left (shared from), share, paste, search, check, check-circle, minus-circle, circle, circle-dot, circle-dashed-dot, seal-check, circle-half, pharmacist-counter, droplet, face-frame, tag-check, phone-lock, trash, info, close, camera, flip, torch, cloud-off, gear, more-horizontal, plus product glyphs (bottle, tube, jar) and facet glyphs (waves, sun, leaf, spray-off).
- **Filled variants** (`<Icon filled />`, selected tab only): droplet = solid drop with a knocked-out highlight; tag-check = solid tag, check knocked out in the bar colour; face-frame = heavier brackets around a solid oval (the solid-square version read as a key cap).
- Tabs: **tag-check** (Check), **face-frame** (Scan), **droplet** (Reading).
- Icon in a disc (`component.iconDisc`): **48dp** lavender disc with a 24dp iris icon; 56dp (`large` / `size="lg"`); 72dp with a 28dp icon (`size="xl"`, hero skin-type card). One per card. Decorative icons are hidden from TalkBack; icon-only controls carry a label. Plain icon buttons (gear) stay 48dp with no disc, as the showcase bell.
- Banned: shield, warning triangle, exclamation mark, medical cross/plus, pill, mortar and pestle, eye, sparkles, magic wand, store logos, unicode ✓ / ⋯ as icons.

---

## 8. Components

Token paths in `theme.components.*` (RN) and `--sk-<component>-*` (web). Every change in 2.1 is additive: existing exports and props still work.

### 8.1 Buttons (`component.button`)
| Variant | Look | Rules |
|---|---|---|
| `primary` | Slate pill (pearl in dark), **56dp**, label + trailing `arrow-right` when it moves forward | **At most one per screen state.** Pressed = accent-pressed + 0.98. |
| `secondary` | Tonal mist pill, **52dp**, no outline | Second choice ("Use the Demo reading", "Try a sample share"). |
| `translucent` (new) | White-glass pill + 1dp light edge (sheen edge in dark), 52dp | Welcome only, over `LiquidBackdrop`. |
| `tertiary` | Text + optional chevron, 48dp box | Dismiss, "See all", "Got it" (`SectionHeader action.chevron: false`). |
| `destructiveNeutral` | Text pill with leading trash icon, no red | Always followed by a confirmation sheet. |
| `consentPair` | Two identical tonal pills with a 1dp strong edge, 52dp | **Equal visual weight** (spec §2). |

### 8.2 Fields, chips, segmented
- **Paste field** (`component.field`): white pill, 56dp, 1dp `border-strong`, inline trailing **Check** pill. Unchanged.
- **Chip** (`component.chip`): light grey pill (`secondary-bg`: mist.150 / graphite.750), 36dp visual in a 48dp target, label 14/20 600. Selected = slate fill + check + weight. `ChipRail` = one horizontally scrolling row with the gutter as content inset (showcase 06_discover). Static reading chips ("Oiliness · High") read as "Oiliness, High".
- **Segmented** (`components/Segmented.tsx`, `component.segmented`): lavender-grey 48dp track (`segment-track`), 4dp inset; the selected segment is a white pill with its own soft violet shadow (graphite-700 + sheen edge in dark), a 16dp check and a 600 label; unselected labels 500 muted. tablist / tab + selected. `components/home/Segmented.tsx` becomes a re-export (P1).

### 8.3 Cards
- **Card** (`Card.tsx`): `raised` (default) = white, radius 24, hairline + violet shadow (graphite-850 + sheen edge in dark). `gradient` (new) = the skin gradient via react-native-svg, light edge, no shadow (skin-type card, matches banner only). `surface`, `sunken`, `hero` unchanged in API. No nested cards.
- **Skin-type card** (`SkinTypeCard.tsx`, `component.readingCard`): `size="compact"` (Home): raised, padding 20, ≥96dp, 56dp disc, "Your skin type" (bodySm muted) over the value (`type.value`), caption, trailing 24dp arrow-right; one target, one label in visual order. Empty: `icon="face-frame"`, `label="No reading yet"`, `quiet` value "Scan once, about a minute", children = the actions (card stops being one target). `size="hero"` (Reading / Result): gradient, padding 24, 72dp disc on white glass, label, value, one cosmetic `line`, no arrow. Strings come in as props.
- **List rows with a thumb** (`ListRow thumb={{ icon | mark | glyph }}`): 56dp soft square tile (`thumb-tile`, radius 16) with an iris icon, the chrome S or a product glyph; title bodyStrong 16/22, supporting bodySm muted; row ≥72dp. `ListGroup thumbs` insets dividers to the text column (gutter + 56 + 16) and is a raised white card. `ThumbTile` is exported for custom rows.
- **Product card** (`component.productMatchCard`): raised white, radius 24, padding 16, 64dp thumb tile (radius 16), name bodyStrong (2 lines), one reason line where commerce puts stars, verdict tag, trailing arrow-up-right. All cards alike; store named once above the list. **No hearts, stars, ratings or review counts.**
- **Focus tile** (`component.focusTile`, showcase "Recommended Focus"): white tiles three across, 12dp gaps, radius 20, hairline + shadow (graphite-850 + sheen edge in dark), a 48dp lavender disc with a 24dp iris icon at the top, label 14/20 600 centred, two lines max. Fewer than three keep the one-third width and sit left. Facet words only (Lighter textures · Hydration · Fragrance-free).
- **Checklist card** (`component.checklistCard`): raised card radius 24, rows ≥52dp with dividers; leading state icon (check-circle / circle-dot / circle), label (current 600), **trailing mark**: done = 20dp check in `verdict.fits.icon`, current = muted three dots, pending = nothing. Never a spinner; the delete row keeps its stamp.
- No row of same-size icon + heading + text cards as page structure.

### 8.4 Verdict head (`component.verdictCard.head`)
Radius **24**, padding 20. A 40dp white disc holds the 24dp verdict icon; next to it the caps label in the verdict fg; below, the verdict sentence in `type.verdictLine` (**Geist 600 18/26**) in full text colour. 1dp edge (dashed for UNKNOWN and name-only). No leading stripe. Greige **Demo reading** badge when the Demo reading is in use. MEDICINE: no box, no label, the 32dp pharmacist icon over one `type.title` line.

### 8.5 Reasons (`component.reasonRow`)
Section head "Why · 2 reasons" (sans). Each reason is a quiet surface row: reading line (`type.reason`, 18/500) → product fact (`type.body`) → rule tag and band chip. No decorative numerals.

### 8.6 Provenance ledger (`component.provenanceLedger`)
"Where this comes from" as a receipt card (radius 24): keys **Reading · Product · Rules · Limits** in sentence case, key column 96dp, values in bodySm. Below 360dp or at 1.5× the key stacks.

### 8.7 Sheets, dock, snackbar
- **Bottom sheet:** radius 28 top corners, handle in a 48dp target, a Close button always, sheen-edge on top in dark.
- **Action dock** (`component.actionBar`): ONE primary pill naming its destination + a 48dp round tonal **More** button. Flat with a top hairline.
- **Snackbar:** inverse surface, radius 16.

### 8.8 Tab bar (`component.bottomNav`)
Three tabs: **Check · Scan · Reading** (testIDs `tab-check` / `tab-scan` / `tab-reading`, labels "Check, tab 1 of 3" etc.). **White 64dp bar** (graphite-850 in dark) with a 1dp top hairline (sheen-edge in dark), **no shadow, no pill**. Inactive = 24dp outline glyph (1.5) in `tab-inactive`, label Geist 500 in `tab-inactive-label`. Active = the **filled glyph** in `tab-active`, label Geist 600 in `tab-active`. Selection = fill + weight + colour + `selected` state (lint). Borderless ripple radius 28. Hidden on pushed details. Settings is the gear on Home.

### 8.9 App bar (`AppBar` in `Screen.tsx`, `component.appBar`)
56dp. Leading 48dp `arrow-left` icon button labelled "Back"; title **centred** in `type.appBarTitle`, one line; a 48dp spacer mirrors the missing side so the title is optically centred (also in tab scenes with no back). New `center` prop (and `Screen appBarCenter`) puts a node in the title slot (the /check source chip). No hairline at rest.

### 8.10 Face frame (`component.faceFrame`, `brand/FaceFrame.tsx`)
Rounded **28dp** plate on the sheen, four corner brackets in `color.bracket`, a faint oval, optional sparse dot grid. **No face, no photo, no mesh over a person.**

### 8.11 Welcome backdrop (`brand/LiquidBackdrop.tsx`)
Full-bleed sheen, two wide liquid ribbons (top-right, bottom-left) with a bright crest, a large and two small droplets with a white rim; drawn in a 390×844 box and scaled to cover. Static, decorative, hidden from TalkBack; graphite/lavender-800 in dark. With `SilverMark` (`brand.heroMark` 72, no tile), `Wordmark` (`brand.wordmarkHero` 32 cap), the tagline (`COPY.welcome.tagline`), a primary **Get started** and a translucent **Use the Demo reading**.

### 8.12 States
Empty and error states: a face-frame or mark plate on the sheen, one `type.display` line (sans), one muted line, **one** pill action (optional tonal second). Left-aligned. Neutral, never red.

---

## 9. Screens

File paths, owners and the step-by-step checklist live in `design/redesign-screens.md`. Specs:

### 9.1 Splash and first launch (`app/welcome.tsx`, `features/home/WelcomeScreen.tsx`, `welcomeStore.ts`) → showcase `01_welcome`
Splash: the chrome S centred on pearl `#F6F5F8` (light) or graphite `#121319` (dark), 120dp. No full-bleed liquid photo.

**Welcome** (first run only): full-bleed `LiquidBackdrop`, no app bar or tab bar. One centred block in the space above the actions: `SilverMark` 72dp (`brand.heroMark`, no tile), 20dp, `Wordmark` at cap height 32 (`brand.wordmarkHero`), 12dp, `COPY.welcome.tagline` in Geist 400 16/22 muted, max width 300. Bottom, 24dp gutter above the inset: slate **Get started** with an arrow (56dp), 12dp, translucent **Use the Demo reading** (52dp). No carousel, no account line.
- **Get started** → mark seen → `router.replace('/')` (Home with "No reading yet" and **Start scan**). **Use the Demo reading** → `useDemo()` → mark seen → `replace('/')`. Android back = Get started. TalkBack order: wordmark, tagline, Get started, Use the Demo reading.
- **Gate** (`(tabs)/index.tsx`): once the reading and the `welcomeSeen` flag (SecureStore, same KV as the share tip; also kept in memory so web cannot loop) have loaded, no reading + not seen + no web `?demo=` → `replace('/welcome')`. It runs on focus only, so a cold share still lands on /check. While the flag loads (one read) the tab shows the plain page colour, never Home then a jump.
- QA: `ops/vm/qa-full.sh <theme> fresh` waits for "Get started", shoots `00_welcome`, taps it, then shoots `01_home_first_run`. Web shot: `welcome` (`/welcome?demo=none`).

### 9.2 Home = Check tab (`(tabs)/index.tsx`, `features/home/*`, `components/home/*`) → showcase `02_home`
Mist page, no brand bar, no sheen hero band. Top to bottom (above the fold on a 6.1" phone: greeting, line, card, paste field):
1. **Greeting row**, 56dp, top inset + 8: greeting in `type.display` ("Good afternoon", by the phone's clock; no name, no sparkle) left, 48dp gear **Settings** (`home-settings`, plain, no disc) right with its glyph on the gutter.
2. One muted line, `body`: `COPY.welcome.tagline`.
3. 20dp, **skin-type card** (`KeyChip` → `SkinTypeCard size="compact"`, `key-chip`): droplet disc, "Your skin type" over the value (hd skin type, or the published band mapping), caption "Scan 2 Nov · photo deleted" / "Demo reading · sample, not a scan" / the mock line, trailing arrow. One target → Reading tab. Band meters live on the Reading tab only. **Empty**, same footprint: face-frame disc, "No reading yet" over "Scan once, about a minute", then slate **Start scan** (`home-start-scan`) and tonal **Use the Demo reading** (`home-use-demo`) inside the card.
4. 28dp, section "Check a product", the **paste field** with the inline **Check** pill. The section head is its visible label (`hideLabel`: the "Product link or name" line is dropped here; the input keeps that accessible name). Unchanged behaviour.
5. 28dp, **Share from a store app** (`ShareSteps`, `share-tip`; hidden for good by tertiary **Got it**, `share-tip-dismiss`, `tipStore`): Flipkart / Amazon / Nykaa `Segmented`, then one white `ListGroup thumbs` card of three rows from `COPY.shareSteps(store)`: `share` tile "Tap Share", chrome-S tile "Pick Silver Mirror" (Amazon: "Tap More first…"), `seal-check` tile "See if it fits". No numerals (the showcase's 1–4 are not built). The card reads to TalkBack as the store's `COPY.sharePaths` line plus the steps, polite live region on store change.
6. 20dp, tonal **Try a sample share** (`sample-share`) with its centred caption.
7. Footer captions: `COPY.footer` · `COPY.notAffiliated`.

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

### 9.6 Scan consent (`app/scan/index.tsx`, `features/scan/ConsentScreen.tsx`, `components/scan/Consent.tsx`) → showcase `03_analyze`
App bar: back arrow and the centred title **"Before your scan"** (no body heading). A 200dp **face-frame plate** (radius 28, sheen, 1dp white edge in light / hairline + sheen edge in dark) with the bracket illustration; no face. Then **one white raised card of three thumb-tile rows**: a 48dp soft square tile (`thumb-tile`, lavender icon) + the promise in `type.body` full ink, dividers inset to the text column, one TalkBack node per row: camera "One photo, analysed by YouCam" · trash "Deleted from YouCam right after" · phone-lock "Only bands kept, on this phone". (48dp tile and body weight instead of the kit's 56dp / bodyStrong so each promise stays on one line at 1.0×; local to `PromiseList`, shared with try-on consent.) The **What stays on this phone** card (raised, shadow in light): kept rows with check-circle, not-kept rows with minus-circle, both 20dp in `on-icon-disc`; read as one block. Then `COPY.privacyLine` as body (one TalkBack block), the qualifier behind a "Details" row, `COPY.accuracyNote`, and the tertiary "Read how deletion works". Sticky footer unchanged: the unticked **"I'm 18 or older"** checkbox row directly above the equal-weight **Start scan / Not now** pair (`consentPair`, 52dp).

### 9.7 Capture (`app/scan/capture.tsx`, `features/scan/CaptureScreen.tsx`, `CaptureGuide.tsx`) → showcase `03_analyze` photo frame
The screen sits on the page colour (mist / graphite), not a black viewfinder. App bar: back arrow and the centred title **"Take your photo"** (try-on puts its "Preview, not a shade guarantee" tag in the title slot instead). The live camera fills a **radius-28 frame inset by the 20dp gutter**; the frame corners are masked in the page colour so the native preview reads rounded. On the image only: four white corner brackets (3dp, **32dp** long, rounded caps), a faint 1.5dp oval at 72% width with the outside dimmed, and one hint pill at a time at the top (`COPY.captureTooSmall`, `COPY.captureDark`, the back-camera notice; polite live region). No mesh, no dots, nothing drawn on the person. Below the frame: a **72dp shutter** in the accent (slate ring + fill in light, pearl in dark) labelled "Take photo", flanked by 48dp tonal icon buttons "Next photo tip" and "Switch to back camera" / "Switch to front camera". Review: same app bar (back = retake), the photo in the same radius-28 frame, the muted upload line, **Retake** (tonal) + **Use photo** (primary). The status bar follows the theme.

### 9.8 Processing (`app/scan/processing.tsx`, `features/scan/ProcessingScreen.tsx`) → showcase `03_analyze`
App bar: back arrow (→ Home; the scan finishes and saves even if you leave, as in the showcase) and the centred title **"Making your reading"**. A **full-width radius-28 sheen plate**, close to square (height = min(width / 0.8, 44% of the window)), holding the `FaceFrame` with its dot grid (no tile of its own); the brackets close in on each completed step (`bracketResolve` on the glide ease; reduce motion jumps to the end state), resting closed after "Deleted from YouCam". Below it the **checklist card** (trailing tick / three dots): Uploaded → Analysing (HD) → Reading results → **Deleted from YouCam**, with the stamp "Photo deleted · 21:04" on the delete row and the hidden polite live region announcing steps. Under the card, one muted line: "Stay on this screen. This takes about 10 seconds." Failed: the app-bar title drops, the body heading names the problem (`friendlyError` / "Let’s take that again") over its recovery line, the checklist keeps the failed row, `COPY.privacyLine` replaces the wait line, and the footer offers **Retake photo** / **Try again**, **Use the Demo reading** and **Try later**.

### 9.9 Result (`app/scan/result.tsx`, `features/scan/ResultScreen.tsx`)
Showcase `04_report`. Title "Your reading is ready" (sans; the screen chrome is P2's `ResultScreen`). The body is the shared **KeyPanel** (`features/key/KeyCard.tsx`, props unchanged), top to bottom, 28dp between sections:
1. **Hero skin-type card** (`SkinTypeCard size="hero"`, `testID="reading-skin-type"`): skin gradient (dark: lavender `#3A3458` → `#2A2838` → `#20212A`, a visibly lavender graphite, not flat grey; disc `lavender.700`), 72dp droplet disc, label "Skin type" in full `text` (not muted), the value ("Combination") in `type.valueHero` (Geist 600 28/34) so it dominates the card as in the crop (Home's compact card keeps `type.value` 24/30), one cosmetic line: "Estimated from your bands." when the class is derived, otherwise "Measured by YouCam Skin Analysis HD, 1 Nov." (Demo: "Sample reading for trying Silver Mirror."). Greige **Demo reading** tag inside the card when the Demo reading is on. TalkBack: "Skin-type reading: Combination. …".
2. **Key readings** (`COPY.reading.keyReadings`): a static `ChipRail` (`testID="key-readings"`, chips `key-reading-<concern>`), highest band first, ties in concern order: "Oiliness · High", "Pores · High", "Moisture · Medium". Read as "Oiliness, High" (+ "self-reported, not measured" when edited). A 1dp divider under the rail, as in the crop.
3. **What this means for products**: white `FocusTiles` from `focusTilesFor()` (Lighter textures · Hydration · Fragrance-free; never "repair"), only the tiles the published rules trigger, fewer than three sit left at one-third width (never stretched). With one or two tiles the rule ids caption ("From our published rules (…). Traits to look for on a label.") fills the empty columns beside them, vertically centred (`FocusTiles aside`); with three it sits under the row.
4. **Your bands** + "Feels wrong? Edit" (a compact `SectionHeader` link: `type.label` 14/20 600 in `color.link`, 16dp chevron, 48dp target; TalkBack "Feels wrong? Edit your bands"; it no longer competes with the 18/24 head): the band list card with three-segment meters (no numbers); under it the stamp "Photo deleted · bands only" (sage check) and "Scan 1 Nov. Kept on this phone only." (Demo: sample line).
5. Zone glyph (Result: the overlay → glyph hand-off), accuracy note once, the `extra` slot (share coach mark), then `destructiveNeutral` **Delete my reading** / **Withdraw consent** (not for Demo), each behind the confirmation sheet. Sticky slate **Check a product →** (P2).

### 9.10 Your reading = Reading tab (`app/key.tsx`, `features/key/KeyScreen.tsx`, `KeyCard.tsx`, `KeyPanel.tsx`)
Showcase `04_report`. Centred app-bar title **"Your reading"** (`type.appBarTitle`); in the tab scene there is no back arrow and a 48dp spacer keeps the title optically centred; the pushed `/key` shows the back arrow. Body = the KeyPanel of §9.9 (hero card, Key readings rail, focus tiles, band list + Edit, stamp, zone glyph, accuracy note, **Delete my reading** `destructiveNeutral` + confirmation sheet), then the tertiary "How this was made" and the footer line. Empty (`testID="reading-empty"`): face-frame plate on the sheen, "No reading yet" (`type.display`, sans), one muted line, slate **Start scan →**, tonal **Use the Demo reading** (exact label, QA taps it). Left-aligned.

Settings (P3 owns `SettingsScreen.tsx`; §9.12 text still applies): centred **"Settings"** title with the back arrow; groups are the white r24 `ListGroup` cards; each row is a local `SettingsRow` (showcase `00_brand_panel` feature list): 44dp rounded-square lavender icon tile (radius 12, `icon-disc` fill, 1dp `border` hairline, `sheen-edge` top in dark; the kit thumb tile at row scale) with a 20dp iris icon, title bodyStrong, supporting bodySm muted, chevron only when it opens a screen, ≥64dp. Row dividers are inset to the text column (`paddingX + 44 + gap`, `ListGroup inset`) so each tile-plus-text row reads as one unit. Delete my reading uses trash, Withdraw consent uses minus-circle, so the two neighbouring rows differ at a glance. Credits sit in a raised white card. Row labels unchanged ("How this was made" is tapped by QA).

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

## 11. Moodboard and showcase vs product law (resolved)

The showcase (`design/reference/silver-mirror-showcase.png`) wins over the moodboard and the taste rules on look (soft card shadows, three focus tiles, the lavender gradient, discs, pills, hairlines); product law wins over the showcase.

| Showcase / moodboard | Decision | Why |
|---|---|---|
| "Good morning, Aman ✨" | "Good afternoon", no name, no sparkle | No fake user; no sparkle (taste + brief) |
| Bell with a dot | Gear (Settings) | We have no notifications |
| Serif headings (moodboard) | Geist 600 everywhere; serif only as the outlined wordmark | Showcase 2.1 |
| UNKNOWN = cool slate | Neutral fill, dashed slate edge, slate icon | UNKNOWN must never read as a button (lint) |
| "Barrier repair" focus tile | Lighter textures · Hydration · Fragrance-free | "repair" is banned (brief §4.4) |
| Greige focus tiles (moodboard) | White tiles with lavender discs; greige = Demo badge only | Showcase 2.1 |
| 5-tab bar, Routines / Community / Profile / Progress | 3 tabs: Check · Scan · Reading | Not built |
| Today's Routine, AM/PM, numbered steps | Share steps as thumb-tile rows, store segmented control, no numerals | No routines; no index numerals |
| Analyze face photo with mesh | Drawn face frame; live camera only on capture, no mesh | No real face in shipped art |
| "Key Concerns: Mild acne…" | "Key readings": band chips ("Oiliness · High") | Cosmetic words only |
| Stars, review counts, hearts, "Dermatologist-approved & community loved" | Reason line, verdict tag, honesty line | No ratings of any kind |
| Numeric skin score, before/after, progress charts | Not adopted | Bands, never numbers |
| "I already have an account" | "Use the Demo reading" | No accounts |
| Slate primary + soft secondary for every pair | Consent keeps equal-weight pills | Spec §2 |

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
