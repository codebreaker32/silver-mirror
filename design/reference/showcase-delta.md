# Showcase delta: from the current build to Aman's showcase

Version 1 · 2 Nov 2026 · design lead pass · source of truth for the "make it look like the showcase" sprint.

**Reference.** `design/reference/silver-mirror-showcase.png` and its crops in `design/reference/showcase/`
(`00_brand_panel`, `01_welcome`, `02_home`, `03_analyze`, `04_report`, `06_discover`). The `*_EXCLUDED` crops
(routine, community, progress) show features we do not build. Secondary: `design/reference/dribbble-patterns.md`.
**The showcase wins where sources differ; product law wins over the showcase** (§7).

**Current build reviewed.** `design/web-shots/*-{light,dark}.png` (390×844), `design/emulator-shots/{light,dark}_0*,
_1*, *_verdict*, *_tryon_foxtale_*`, `DESIGN.md` v2.0, `apps/mobile/src/components/*`, `app/**`, `features/**`, and
`design/system/tokens/skinkey.tokens.json`.

Colours below were sampled from the crops (pixel reads, then tuned so every text pair passes
`check-contrast.mjs`). Sizes are dp at a 390dp-wide phone (the crops are about 1.95 px per dp).

---

## 0. Critique: does the current build look like the showcase?

Framework: `design:design-critique` (first impression, usability, hierarchy, consistency, accessibility).

**Verdict: no, not yet. The structure is about 70% there; the surface is only about 35% there.** Someone holding the two
side by side would say "same family, different app". The bones already match: pills, icon discs, a reading card,
face frame, checklist, focus tiles. What gives it away is four things.

1. **Serif everywhere.** Greetings, screen titles, product names and the verdict sentence are set in Noto Serif Display.
   The showcase uses a clean semibold sans for every heading and keeps the serif for the wordmark. This is the largest
   single difference, and it is also the main reason our screens read "editorial" while the showcase reads "app".
2. **Wrong page tone and a flat card edge.** Our page is a neutral pearl `#F6F5F8` with near-white cards and hairlines,
   so cards hardly lift. The showcase page is a lavender-grey `#EFECF2` with clean white cards, a soft violet-tinted
   shadow and 24dp corners. The cards float.
3. **The tab bar.** Ours puts a slate pill behind the active icon (Material 3). The showcase is a white bar with line
   icons and small labels, where the active tab is a **filled dark glyph** with no pill at all.
4. **App bars and Home header.** Ours: a left-aligned chevron and a left title, plus a brand lockup on Home. The showcase
   uses a **centred title with a back arrow** on pushed screens, and on Home a compact greeting row with one icon button at
   the top right, with no brand bar.

| Lens | Finding | Severity | Fix (section) |
|---|---|---|---|
| First impression | Serif display greeting and titles make Home read like a magazine, not the showcase's calm app | High | Sans type scale (§2.3) |
| First impression | Page and cards are both near-white, so nothing floats | High | Mist page bg, white cards, violet shadow (§2.1, §2.4) |
| Usability | Home first viewport: brand bar, a 3-line greeting and the reading card push "Check a product" below the fold on 6.1" phones | Medium | Greeting row without lockup, compact skin-type card (§4.2) |
| Usability | First run lands on Home with no brand moment; the welcome in the showcase is missing | Medium | `/welcome` route (§4.1) |
| Hierarchy | Focus tiles are greige bars with a tiny icon; the showcase's "Recommended Focus" is three white square tiles with discs | Medium | Focus tile rebuild (§3.10) |
| Hierarchy | Reading card on Home carries three band meters; the showcase card is one line: "Your Skin Type / Combination →" | Medium | Skin-type card (§3.7) |
| Consistency | Two back affordances (chevron app bar, text "Back to home") and both left and centred titles across screens | Medium | One app bar (§3.2) |
| Consistency | Share tip is a mock share sheet in a grey well; the showcase's list rows with soft square thumb tiles are a better fit for real content | Medium | Thumb-tile rows (§3.6) |
| Accessibility | Current text pairs pass. New mist bg lowers `text-subtle` to 5.2:1 and `chip` text stays 13.5:1; all fine | n/a | Re-run `check-contrast.mjs` |
| Accessibility | Tab selection today = pill + weight + stroke. Without the pill, selection must still be more than colour | Must keep | Filled glyph + 600 label + `selected` state (§3.1) |

**What already works and must survive:** one slate primary per state; equal-weight consent pair; verdict heads with
icon + label + edge (never colour alone); bands, never numbers; the checklist with a delete stamp; dark theme as a
designed graphite with a sheen edge; the 48dp targets and TalkBack labels.

**Dark theme.** The showcase is light only. Dark keeps the same structure (same radii, same card/tile/disc layout,
centred titles, filled-glyph tab) in graphite: tone steps instead of shadows, the 1dp sheen edge on raised surfaces,
a lavender-graphite gradient on the skin-type card. Never an inversion of the light values.

---

## 1. Taste rules applied (impeccable + taste-skill, adapted to React Native)

Adopted: no emoji or sparkle anywhere; no eyebrow labels above headings; no index numerals (the showcase's routine
"1 2 3 4" is not built); no tracked tiny caps (the verdict label stays the one caps line, as DESIGN §4 already says);
no pure black (`#000` only in QR modules); two typefaces at most, and the serif only as the wordmark; running text in full ink, muted only for
supporting lines; the accent appears on the one action; headings two lines or fewer; left-aligned body, one centred
moment per screen (the app-bar title, or the welcome block).

Overridden by the showcase (it wins): soft shadows on resting cards (light only), three equal focus tiles in a row,
lavender gradient on the skin-type card, lavender icon discs, pill buttons, the hairline on cards. Keep each of these
as restrained as the showcase: one shadow recipe, one gradient recipe, one disc colour.

Overridden by product law (it wins over both): see §7.

---

## 2. Tokens (kit owns: `design/system/tokens/skinkey.tokens.json` → `node build-tokens.mjs`)

Change values and add the roles below; keep every existing key name so components re-skin without renames. After the
build, `node design/system/tokens/check-contrast.mjs` must report **0 failures**. If a lint inside it asserts an old
rule (e.g. "verdictLine is serif", "focus tile is greige"), update the lint and its message in the same commit, and say so
in the commit body.

### 2.1 New primitives

| Primitive | Hex | Use |
|---|---|---|
| `mist.50` | `#F5F3F8` | Thumb tile on a white card |
| `mist.100` | `#EFECF2` | **Light page bg** (showcase `#EFEBF1`–`#F0ECF2`) |
| `mist.150` | `#E7E3EC` | Chips, tonal secondary pill, sunken wells (showcase chip `#E6E0EA`) |
| `mist.200` | `#DDD9E3` | Segmented track (showcase `#DDD9E2`) |
| `mist.250` | `#E3DFE9` | Card hairline, dividers (decorative) |
| `lavender.150` | `#E6E2F4` | Icon disc (showcase `#E6E3F6`) |
| `iris.600` | `#5A5B9F` | Line icon inside a disc, light (showcase droplet stroke; HSL 239° / 28% sat, under the 30% cap) |
| `gradient.skin.light` | `#E2DBF3` → `#EEEAF6` (55%) → `#F8F6FB` | Skin-type card, 120°, light (showcase `#DED6F3` → `#EBE6F2`) |
| `gradient.skin.dark` | `#2C2942` → `#24232F` (55%) → `#20212A` | Skin-type card, dark |

### 2.2 Semantic colour (light / dark)

| Role | Light (was) | Dark (was) | Notes |
|---|---|---|---|
| `color.bg` | `mist.100 #EFECF2` (`#F6F5F8`) | `graphite.950 #121319` (same) | Page |
| `color.bg-sunken` | `mist.150 #E7E3EC` (`#EFEEF3`) | `graphite.975 #0E0F14` (same) | |
| `color.surface` | `white` (`#FCFBFD`) | `graphite.900 #1A1B23` (same) | Plain cards are white now |
| `color.surface-raised` | `white` (same) | `graphite.850 #20212A` (same) | Cards, sheets, tab bar, fields |
| `color.border` | `mist.250 #E3DFE9` (`#DCDAE3`) | `graphite.750 #30313C` (same) | Card hairline |
| `color.text-subtle` | `#5E5B6B` (`#636070`) | same as now | 5.6:1 on mist.100, 5.2:1 on mist.150 |
| `color.secondary-bg` | `mist.150 #E7E3EC` | `graphite.750` (same) | Tonal pill |
| `color.secondary-translucent` (new) | `rgba(255,255,255,0.55)` | `rgba(239,238,243,0.10)` | Welcome secondary pill over the backdrop |
| `color.icon-disc` | `lavender.150 #E6E2F4` | `lavender.800 #34304F` (same) | |
| `color.on-icon-disc` | `iris.600 #5A5B9F` (`slate.700`) | `lavender.300 #BEB6DE` (`lavender.200`) | 4.8:1 / 6.5:1 (decorative icons need 3:1) |
| `color.thumb-tile` (new) | `mist.50 #F5F3F8` | `graphite.800 #272832` | Soft square product/step tile |
| `color.segment-track` (new) | `mist.200 #DDD9E3` | `graphite.800 #272832` | |
| `color.segment-thumb` (new) | `white` | `graphite.700 #3A3B47` | |
| `color.tab-active` (new) | `graphite.900 #1A1B23` | `pearl.100 #EFEEF3` | Filled glyph + label |
| `color.tab-inactive` (new) | `silver.500 #7E7B8B` icon, `text-subtle` label | `silver.400 #A8A5B3` icon and label | Icon 4.1:1 on white (non-text ≥3) |
| `color.shadow` | `#3A3360` (was `slate.shadow #2A2D40`) | n/a (no shadows in dark) | Violet-tinted, as in the showcase |
| `color.accent` | `slate.700 #3B3F52` (keep) | `pearl.50` (keep) | Showcase CTA samples `#3D3C51`; the difference is invisible, so no change |

Verdict, mark, sheen, overlay and focus roles stay as they are. `accent-warm` (greige) stays for the Demo-reading badge
only; focus tiles stop using it.

### 2.3 Type scale (Geist for everything you read; the serif only as the outlined wordmark)

| Token | Was | Becomes | Use |
|---|---|---|---|
| `type.display` | Serif 400 34/40 −0.6 | **Geist 600 26/32 −0.5** | Home greeting, empty-state headline |
| `type.title` | Serif 400 26/32 −0.3 | **Geist 600 22/28 −0.4** | Product title on /check, in-body page heads ("Before your scan"), medicine line |
| `type.appBarTitle` (new) | n/a | **Geist 600 18/24 −0.2** | Centred app-bar title |
| `type.value` (new) | n/a | **Geist 600 24/30 −0.4** | "Combination" in the skin-type card |
| `type.headline` | Geist 600 20/26 | keep | Card heads, sheet titles, the matches banner title |
| `type.verdictLine` | Serif 400 20/27 | **Geist 600 18/26 −0.1** | Verdict sentence (reasons stay 18/500, the label stays 15/600 caps) |
| `type.figure` | Serif 26/32 | **Geist 600 24/30 −0.3, tabular** | Catalogue count, QR countdown |
| `type.section` | Geist 600 17/24 | **Geist 600 18/24 −0.2** | "Check a product", "Key readings", "Better matches" |
| `type.bodyStrong` | 16/24 | **16/22** | List-row and product-card titles |
| `type.labelSm` / `labelSmRegular` | 13/16 | keep 13/16 (600 / 500) | Tab labels |
| others | | unchanged | body 16/24, bodySm 14/20, label 14/20, caption 13/18, fine 12/16 |

The welcome tagline is Geist 400 16/22, not serif. The serif appears only as `Wordmark` paths (already outlined, so it
never falls back). Leave the font in `fontAssets`; removing it is out of scope. A screen shows at most five sizes.

### 2.4 Radius, elevation, spacing

| Token | Was | Becomes |
|---|---|---|
| `radius.md` | 14 | **16** (thumb tiles, snackbar) |
| `radius.lg` | 20 | **24** (every card: skin-type, product, reason, ledger, checklist, verdict head, settings groups) |
| `radius.tile` (new) | n/a | **20** (focus tiles) |
| `radius.xl` | 24 | **28** (face frame, camera frame) |
| `radius.sheet`, `radius.full` | 28, 9999 | keep |
| `elevation.light.1` | shadowOpacity 0.08 / radius 14 / y 4 | **RN: shadowColor `color.shadow`, opacity 0.10, radius 18, offsetY 6, elevation 3. CSS: `0 1px 2px rgba(58,51,96,0.05), 0 8px 22px -8px rgba(58,51,96,0.16)`**. Hairline `color.border` stays on, 1dp |
| `elevation.light.2` (tab bar, dock) | upward shadow | **none**; a 1dp top hairline only (the showcase bar is flat) |
| `elevation.dark.*` | tone + sheen edge | keep |
| `space.gutter` / card inset | 20 / 20 | keep 20 / 20; section gap 32 → **28** |
| `component.listRow.minHeight` | 56 | **72** when the row has a thumb tile |

### 2.5 Component tokens to change (same keys)

`bottomNav` (indicator removed: `indicator.bg` → `transparent`, width/height 0, add `iconActiveFilled: true`,
`minHeight` 64, bg `surface-raised`, `labelActive` = labelSm 600 `tab-active`, `labelInactive` = labelSmRegular
`tab-inactive`). `appBar` (`titleAlign: center`, `title: {type.appBarTitle}`, `backIcon: arrow-left`). `iconDisc`
(`size` 48, `sizeLg` 56, new `sizeXl` 72, bg `icon-disc`, fg `on-icon-disc`). `focusTile` (bg `surface-raised`, fg
`text`, radius `radius.tile`, aspect 1, minHeight 104, disc 48, icon 24, label `type.label` centred). `readingCard`
(radius 24, padding 20, value `{type.value}`, minHeight 96). `chip` (bg `bg-sunken` = mist.150, `visualMinHeight` 36,
paddingX 16). `segmented` (track `segment-track`, selectedBg `segment-thumb`, minHeight 48, thumb shadow light:
`0 2px 8px rgba(58,51,96,0.14)`). `productMatchCard` (thumbBg `thumb-tile`, thumbSize 64, thumbRadius 16, radius 24,
padding 16, `heroBg` → `gradient.skin`). `checklistCard` (radius 24, rowMinHeight 52, add `doneTrailing: check` in
`verdict.fits.icon`). `faceFrame` (radius 28). `button.secondary` (bg `secondary-bg` = mist.150).

---

## 3. Components (kit owns: `apps/mobile/src/components/*.tsx`, `components/index.ts`, `components/__tests__`, `brand/*`)

### 3.1 Tab bar (`TabBar.tsx`) → showcase `02_home` / `06_discover` bottom bar
- White bar (`surface-raised`), 64dp + bottom inset, 1dp top hairline (`border`; `sheen-edge` in dark), **no shadow, no pill**.
- Three items, unchanged: Check (`tag-check`), Scan (`face-frame`), Reading (`droplet`). Labels, `testID`s
  (`tab-check`, `tab-scan`, `tab-reading`), `accessibilityLabel` "Check, tab 1 of 3" etc. and `role="tab"` +
  `selected` stay exactly as they are (QA waits on "Check, tab 1 of 3").
- Inactive: 24dp outline icon, 1.5 stroke, `tab-inactive`; label 13/16 500.
- Active: **filled glyph** in `tab-active`; label 13/16 600 in `tab-active`. Add `filled?: boolean` to `Icon` for the three
  tab glyphs: `droplet` = solid drop; `tag-check` = solid tag with the check knocked out in the bar colour;
  `face-frame` = solid 20dp rounded square (r 6) with the oval knocked out. Selection = fill + weight + colour + state.
- Ripple: borderless, radius 28.

### 3.2 App bar (`Screen.tsx` → `AppBar`) → showcase `03_analyze` / `04_report` header
- 56dp. Leading: 48dp icon button `arrow-left` (24dp, 1.75 stroke), `accessibilityLabel="Back"` unchanged.
- Title **centred** in `type.appBarTitle`, one line, ellipsised; a 48dp spacer mirrors the leading button when there is
  no trailing action, so the title is optically centred.
- New prop `center?: ReactNode` to put a node in the title slot (the /check source chip "Shared from Nykaa").
- Inside a tab scene with no back button, the title still centres (Reading tab: "Your reading").
- No hairline at rest; the existing scrolled hairline stays.

### 3.3 Cards (`Card.tsx`)
- `variant="raised"` (default): white / graphite.850, radius 24, 1dp `border`, elevation.light.1 in light; sheen edge in dark.
- New `variant="gradient"`: `gradient.skin` at 120° via react-native-svg `LinearGradient` (no new dependency), radius 24,
  1dp border `rgba(255,255,255,0.6)` light / `sheen-edge` dark, no shadow. Allowed on the skin-type card and the
  better-matches banner only. Never behind reasons, the ledger, forms or the verdict head.
- No nested cards (a card inside a card); grouped rows inside a card use dividers.

### 3.4 Pills (`PillButton.tsx`)
- Primary: slate pill, **56dp** (showcase), label `type.button`, trailing `arrow-right` 20dp when it moves forward
  ("Get started →", "Start scan →", "Check a product →"). Pressed scale 0.98.
- Secondary: tonal `mist.150` pill, 52dp, no edge. New `variant="translucent"` for the welcome: `secondary-translucent`
  fill + 1dp `rgba(255,255,255,0.7)` edge (light) / `sheen-edge` (dark), label in `text`.
- `consentPair` unchanged (equal weight is law).

### 3.5 Chips (`Chip.tsx`, `BandChip.tsx`)
- Light grey rounded pill (`mist.150`), 36dp visual in a 48dp target, label 14/20 600 in `text`, paddingX 16.
- Selected filter chip: slate fill, pearl label, 16dp check icon (showcase "For You" chip, plus our check).
- Static reading chip ("Oiliness · High"): same pill, not pressable, label reads "Oiliness, High" to TalkBack.
- Chip rails scroll horizontally in one row with the gutter as content inset (showcase `06_discover`), no wrap.

### 3.6 List row with thumb tile (`ListRow.tsx`, new prop `thumb`)
`thumb?: { icon?: IconName; mark?: true; glyph?: 'bottle'|'tube'|'jar' }` renders a **56dp soft square tile**
(`thumb-tile`, radius 16) holding a 24dp `on-icon-disc` icon, the 28dp SilverMark, or a product glyph. Then title
(`bodyStrong` 16/22) and supporting (`bodySm` 14/20 muted). Row min 72. Dividers inset to the text column
(gutter + 56 + 16), as in the showcase routine list. Trailing optional chevron/arrow. Used by Home share steps, consent
rows, SKU candidates, settings.

### 3.7 Skin-type card (new `SkinTypeCard.tsx`, replaces the Home use of `readingCard` look) → `02_home`, `04_report`
- `size="compact"` (Home): raised white card, padding 20, minHeight 96: 56dp disc (`droplet`), then
  "Your skin type" (14/20 muted) over the value (`type.value`, e.g. "Combination"), then a caption line
  ("Scan 1 Nov · photo deleted" or "Demo reading · sample, not a scan"), trailing 24dp `arrow-right`. One pressable,
  one label in visual order ("Your skin type, Combination, scanned 1 November. Open your reading").
- `size="hero"` (Reading/Result): `variant="gradient"`, padding 24, 72dp disc at `rgba(255,255,255,0.55)` (dark:
  `lavender.800`), "Skin type" label, value, then one cosmetic line (the existing "Skin type estimated from your bands"
  or the zone line already in `KeyCard`; no new claims). No arrow.
- Props carry strings in; the card computes nothing.

### 3.8 Segmented (`components/home/Segmented.tsx` moves to `components/Segmented.tsx`; re-export from the old path)
Track `segment-track`, 48dp, radius full, 4dp inset; selected thumb white raised pill with its own soft shadow; label
15/20, selected 600 `text`, unselected 500 `text-muted`; selected keeps a 16dp check (colour never alone).
`accessibilityRole="tablist"`/`tab` + `selected`.

### 3.9 Icon disc (`IconButton.tsx` → `IconDisc`)
Sizes 48 / 56 / 72, `icon-disc` bg, `on-icon-disc` icon at 1.5 stroke (24dp; 28dp at 72). Decorative (hidden from TalkBack).
Icon buttons (gear) stay plain 48dp with a 24dp glyph, no disc, as the showcase bell.

### 3.10 Focus tile (`FocusTile.tsx`) → `04_report` "Recommended Focus"
White square tiles, three across with 12dp gaps (`flex: 1`, `aspectRatio: 1`, minHeight 104), radius 20, hairline +
elevation 1 (dark: graphite.850 + sheen edge). Centred 48dp disc with a 24dp icon, 12dp gap, label 14/18 600 centred,
max two lines. Fewer than three items: tiles keep the one-third width and sit left (never stretch). Labels stay the
published facet words (Lighter textures · Hydration · Fragrance-free).

### 3.11 Product card (`ProductCard.tsx`) → `06_discover` cards, our content
Raised white card, radius 24, padding 16; a 64dp thumb tile (radius 16, product glyph or image); name `bodyStrong`
(2 lines), reason line `bodySm` muted where commerce puts stars, verdict tag (icon + label); trailing `arrow-up-right`.
All cards alike (DESIGN §8.3, no featured card). **No hearts, stars, ratings or review counts.**

### 3.12 Checklist (`StepChecklist.tsx`) → `03_analyze` card
Raised card radius 24, rows 52dp: leading state icon (done `check-circle`, current `circle-dot`, pending `circle`),
label (current 600), and a **trailing state mark**: done = 20dp `check` in `verdict.fits.icon`; current = 20dp
`more-horizontal` muted; pending = nothing. Dividers between rows. The delete row keeps its time stamp. Still never a spinner.

### 3.13 Welcome backdrop (new `brand/LiquidBackdrop.tsx`)
The showcase's liquid silver, drawn, not a photo: full-bleed `sheen` gradient plus two or three wide bezier "ribbons"
(react-native-svg paths filled with a lavender→silver→white linear gradient at 35–60% opacity, top-right and bottom-left),
and two small droplet circles (radial white highlight, 1dp `rgba(255,255,255,0.8)` rim). Static, decorative, hidden from
TalkBack. Dark: the same shapes in `graphite.850`→`lavender.800`→`graphite.950` at 50%. No face, no product.

### 3.14 Other kit items
- `Icon.tsx`: add `arrow-left`, the `filled` variants (§3.1); keep every existing name.
- `Text.tsx`: `Heading level="display"|"title"` now renders sans (it follows the tokens; no code change beyond types).
- `EmptyState.tsx`: plate stays (face frame on sheen), headline `type.display` sans, left-aligned, one pill + optional tonal.
- `VerdictHead.tsx`: radius 24, verdict sentence `type.verdictLine` (sans); everything else unchanged.
- `Ledger.tsx`, `Sheet.tsx`, `SectionHeader.tsx`: pick up tokens; `SectionHeader` title `type.section` with an optional
  trailing tertiary ("Got it", "Edit").
- `app/kit.tsx`: add specimens for SkinTypeCard (both sizes), thumb rows, filled tab glyphs, translucent pill, LiquidBackdrop.
- `app/_layout.tsx`: register `<Stack.Screen name="welcome" options={{ animation: 'fade', gestureEnabled: false }} />`.
- `packages/contracts/src/copy.ts` (kit adds new strings up front so screen packages never touch it):
  `welcome: { tagline: 'Check a product against your skin reading before you buy.', start: 'Get started' }`,
  `reading.skinType: 'Your skin type'`, `reading.keyReadings: 'Key readings'`,
  `shareSteps: (store) => [...]` (three rows per store; see §4.2), `matchesBanner: (skinType: string) => \`Better matches for ${skinType.toLowerCase()} skin\``.
  Run `npm run lint:claims` on the VM.

---

## 4. Screens

Each screen: what it becomes, mapped to a crop. Labels in **bold quotes** are tapped by QA or tests and must not change.

### 4.1 Welcome (new route `app/welcome.tsx` → `features/home/WelcomeScreen.tsx`) → `01_welcome`
- Full-bleed `LiquidBackdrop`; no tab bar, no app bar; status bar dark-content (light) / light-content (dark).
- Centred block at about 38% height: `SilverMark` 72dp (no tile, chrome S), 20dp gap, `Wordmark` at cap height 32dp
  (new `brand.wordmarkHero`, or scale `wordmarkWelcome`), 12dp gap, tagline Geist 400 16/22 `text-muted`, centred, max 2 lines.
- Bottom, 24dp gutter, above the inset: primary **"Get started"** with arrow (56dp), 12dp gap, translucent secondary
  **"Use the Demo reading"** (52dp). No "I already have an account" (no accounts). TalkBack order: wordmark ("Silver Mirror"),
  tagline, Get started, Use the Demo reading.
- Behaviour: **Get started** → mark seen → `router.replace('/')` (Home with "No reading yet" and **Start scan**).
  **Use the Demo reading** → `useDemo()` → mark seen → `router.replace('/')`. Android back = Get started.
- Gate (in `(tabs)/index.tsx`): once the key store and `welcomeSeen` (new `features/home/welcomeStore.ts`, same KV as
  `tipStore`) have loaded, if there is **no reading, welcome not seen, and no web `?demo=`** → `<Redirect href="/welcome" />`.
  Never redirect while loading. A share that arrives cold still goes straight to /check (ShareRouter pushes over it).
- QA (`ops/vm/qa-full.sh`, fresh path only): after `pm clear` + launch, `$U wait "^Get started$" 25`, `shot 00_welcome`,
  `tap "^Get started$"`, then `$U wait "Check, tab 1 of 3" 25` and continue as today (shot `01_home_first_run`, then tap
  **"Use the Demo reading"** on the Home card). Non-fresh runs never see the welcome (seen flag or a reading exists).
- Web shots (`scripts/shoot-mobile-web.mjs`): add group `[['welcome', '/welcome?demo=none']]`.

### 4.2 Home = Check tab (`features/home/*`, `components/home/*`) → `02_home`
Top to bottom (light: mist page; dark: graphite page; the `SheenBackdrop` hero band is removed):
1. **Greeting row** (56dp, top inset + 8): greeting (`type.display`, "Good afternoon", no name, no sparkle) left;
   48dp gear icon button **"Settings"** (`testID="home-settings"`) right. **BrandLockup removed** from Home.
2. Subtitle under it, 8dp gap: "Check a product against your skin reading before you buy." `body` muted.
3. 20dp, **Skin-type card compact** (§3.7): value from the reading ("Oily"); caption = scan date + "photo deleted", or
   "Demo reading · sample, not a scan". Press → `/reading`. Band meters leave Home (they live on the Reading tab).
   Empty state, same card footprint: 56dp disc with `face-frame`, label "No reading yet", value line "Scan once, about a
   minute" (bodyStrong), then inside the card a primary **"Start scan"** (arrow) and a secondary **"Use the Demo reading"**.
4. 28dp, section "Check a product": the paste field (white 56dp pill, hairline `border-strong`, leading `paste` icon,
   inline slate **"Check"** pill 40dp in a 48 target). Unchanged behaviour.
5. 28dp, section "Share from a store app" with trailing tertiary **"Got it"** (dismiss, existing `tipStore`; keep
   `testID`s `share-tip` / `share-tip-dismiss`). Segmented Flipkart / Amazon / Nykaa (§3.8, replaces the showcase AM/PM
   control). Below it, a white card with three **thumb-tile rows** (§3.6), replacing the showcase routine list:
   - tile `share` · "Tap Share" · "On the product page in {Store}"
   - tile = SilverMark · "Pick Silver Mirror" · Amazon: "Tap More first, then Silver Mirror"; others: "Pin it so it stays first"
   - tile `seal-check` · "See if it fits" · "Your check opens here, with the reasons"
   Strings come from `COPY.shareSteps(store)`; `COPY.sharePaths` stays as the accessibility summary of the card.
6. 20dp, secondary **"Try a sample share"** (`testID="sample-share"`) + its caption (centred).
7. Footer captions: `COPY.footer`, `COPY.notAffiliated`.
Above the fold on a 6.1" phone: greeting, subtitle, skin-type card, the paste field.

### 4.3 Scan consent (`features/scan/ConsentScreen.tsx`, `components/scan/Consent.tsx`) → `03_analyze` frame language
- App bar: back arrow, centred title **"Before your scan"** (moves from the body heading into the app bar).
- Face-frame plate (illustration, no face) 200dp tall, radius 28, on the sheen.
- One white card of three thumb-tile rows with lavender icons: `camera` "One photo, analysed by YouCam" · `trash`
  "Deleted from YouCam right after" · `phone-lock` "Only bands kept, on this phone".
- "What stays on this phone" card: kept rows with `check-circle`, not-kept rows with `minus-circle`, both 20dp in
  `on-icon-disc`; privacy line, Details row, accuracy note unchanged.
- Sticky footer unchanged in behaviour: **"I'm 18 or older"** checkbox row directly above the equal pair
  **"Start scan"** / **"Not now"** (both tonal with the strong edge, 52dp).

### 4.4 Capture (`features/scan/CaptureScreen.tsx`, `CaptureGuide.tsx`) → `03_analyze`
Live camera in a radius-28 frame inset by the gutter (the showcase's photo frame); the four white corner brackets
(3dp, 32dp long, rounded caps) and the faint oval stay. Centred app-bar title "Take your photo" over the page bg (not
over the camera). Hint pill at the top of the frame. Shutter 72dp ring; **"Take photo"**, **"Use photo"**,
**"Switch to back camera"** labels unchanged. No mesh on the person; no dots over the live image.

### 4.5 Processing (`features/scan/ProcessingScreen.tsx`) → `03_analyze` (the closest match in the set)
App bar: centred **"Making your reading"**, back hidden while running. `FaceFrame` with dots, full width, aspect 0.8,
radius 28, brackets closing per step (keep `bracketResolve`). Below, 20dp, the checklist card (§3.12) with our real
steps: Uploaded ✓ · Analysed (YouCam HD) ✓ · Reading results ⋯ · Deleting from YouCam (stamp when done). One muted line
under it: "Stay on this screen. This takes about 10 seconds."

### 4.6 Result (`features/scan/ResultScreen.tsx` + `features/key/KeyPanel.tsx`) → `04_report`
- App bar: back arrow (→ Home), centred **"Your reading is ready"**.
- Skin-type card hero (§3.7, gradient, 72dp disc, "Skin type" / "Combination" / one cosmetic line).
- 28dp, section **"Key readings"**: a chip rail of the bands, highest first ("Oiliness · High", "Pores · High",
  "Moisture · Medium", …), static chips (§3.5). Under it, 1dp divider (as in the crop).
- 28dp, section "What this means for products": the focus tiles (§3.10).
- Then the band list card with meters and "Feels wrong? Edit" (keep, it is how a user corrects a reading), the stamp
  "Photo deleted · bands only", the share coach mark, "How this was made" tertiary, footer caption.
- Sticky footer: primary **"Check a product"** with arrow (56dp), as the crop's "Get My Routine →".

### 4.7 Reading tab (`features/key/KeyScreen.tsx`, `KeyCard.tsx`, `KeyPanel.tsx`) → `04_report`
Same body as 4.6 (shared `KeyPanel`), app bar centred **"Your reading"** without back (tab scene). Demo badge (greige)
inside the skin-type card when the Demo reading is on. **"Delete my reading"** (`destructiveNeutral`) at the end, then
the confirmation sheet. Empty: face-frame plate, "No reading yet" (`type.display` sans), one line, primary **"Start scan"**,
secondary **"Use the Demo reading"**.

### 4.8 Check: SKU confirm, verdict, better matches (`features/check/*`, `features/matches/*`) → `06_discover` look
Verdict semantics are untouched (FITS sage, CAUTION amber half-circle, UNKNOWN dashed neutral, MEDICINE ink, no box).
- App bar: back arrow; **centred source chip** ("Shared from Nykaa" / "Sample share" / "Pasted link") via `center`.
- Product title `type.title` (Geist 600 22/28, left, title-cased), meta line muted.
- Verdict head: radius 24, verdict sentence in `type.verdictLine` sans. **"FITS" / "CAUTION" / "UNKNOWN"** label text unchanged.
- Reasons: white cards radius 24; reading line 18/26 500; product fact; band chip (§3.5); rule tag caption.
- Ledger "Where this comes from": white card radius 24.
- Better matches section → the crop's Discover: a **banner card** (`variant="gradient"`, radius 24, padding 20) with
  `COPY.matchesBanner(skinType)` in `type.headline` and the honesty line "Ranked by fit to your readings. No paid
  placements." in bodySm muted, and a 56dp white disc holding the `bottle` glyph at right (no product photo, no arrow).
  Section heading **"Better matches"** stays above it as text (QA taps "^Better matches$" on the dock pill; keep both).
  Then the filter chip rail (§3.5, one scrolling row), the single destination line, the product cards (§3.11, all alike,
  `testID`s `better-matches`, `match-0…` unchanged), store-search chips, affiliate line.
- SKU confirm sheet: candidate rows = thumb-tile rows (§3.6) in white radius-24 cards; mismatched tokens bold; radio
  ring/check at right. **"Which product is this?"**, **"Is this the product?"**, **"Yes, this is …"**, **"Yes"**, the
  candidate line text ("Minimalist · SPF 50 Sunscreen · 50g …"), `sku-yes`, `sku-option-N` unchanged.
- Dock: one primary "Back to {store} listing" + round More + the **"Better matches"** pill; 64dp, hairline top, flat.
- Medicine: pharmacist icon 32dp, `COPY.medicine` in `type.title` sans, one action.
- UNKNOWN panel and the label camera / INCI editor pick up tokens only.

### 4.9 Try-on (`features/tryon/*`) → same system
App bar back arrow + centred "Try-on". Consent: face-frame plate, title **"This needs a second photo"** (`type.title`,
QA waits on it), thumb-tile rows for the three facts, sticky **"I'm 18 or older"** + **"Take photo"** / "Not now".
Result: product title `type.title`; two shade cards side by side (white radius 24, image area radius 20 in a
`thumb-tile` well, shade chip under each, keep "Shade: …" labels for QA); the caption; checklist card for steps;
primary **"Close"**.

### 4.10 Settings and How (`features/key/SettingsScreen.tsx`, `features/scan/HowScreen.tsx`)
Settings: centred **"Settings"**; groups as white radius-24 cards; rows with a 40dp lavender disc icon (the
`00_brand_panel` feature list look) + title + supporting + chevron; **"How this was made"** row label unchanged.
How: centred **"How this was made"**; the boundary statement `COPY.howMadeBoundary` as `type.title` sans; checklist cards
for delete steps (§3.12).

---

## 5. Implementation packages (disjoint file ownership)

Order: **P0 Kit first and committed**, then P1–P4 in parallel. A package edits only its own files. If it needs a
kit change, it asks the kit owner (or the lead) instead of editing kit files. Each package edits only its own §9.x
subsection of `DESIGN.md` with `Edit` (never rewrites the file); the kit edits §2, §4, §5, §7, §8, §11.
All heavy commands run on the VM through `scripts/remote.sh`. Commit only owned paths; wait while `.git/index.lock` exists.

| Package | Owns (exclusive) |
|---|---|
| **P0 Kit** | `design/system/tokens/**` (json, build/check scripts, generated `theme.ts` / `tokens.css` / `contrast-report.md`, `design/system/components.md` tables), `packages/design/src/**`, `packages/contracts/src/copy.ts`, `apps/mobile/src/components/*.tsx` + `index.ts` + `__tests__/**`, `apps/mobile/src/components/Segmented.tsx` (new), `apps/mobile/src/brand/**`, `apps/mobile/src/theme/**`, `apps/mobile/src/app/_layout.tsx`, `apps/mobile/src/app/(tabs)/_layout.tsx`, `apps/mobile/src/app/kit.tsx`, `DESIGN.md` §2/4/5/7/8/11 |
| **P1 Home + Welcome** | `apps/mobile/src/app/(tabs)/index.tsx`, `apps/mobile/src/app/welcome.tsx` (new), `apps/mobile/src/features/home/**` (incl. new `WelcomeScreen.tsx`, `welcomeStore.ts`), `apps/mobile/src/components/home/**` (`Segmented.tsx` there becomes a re-export of the kit one), `ops/vm/qa-full.sh`, `scripts/shoot-mobile-web.mjs`, `DESIGN.md` §9.1, §9.2 |
| **P2 Scan flow + How** | `apps/mobile/src/app/scan/**`, `apps/mobile/src/app/how.tsx`, `apps/mobile/src/features/scan/**` (Consent, Capture, CaptureGuide, Processing, Result, How, ui shims), `apps/mobile/src/components/scan/**`, `DESIGN.md` §9.6, §9.7, §9.8 |
| **P3 Reading + Settings** | `apps/mobile/src/app/(tabs)/reading.tsx`, `apps/mobile/src/app/key.tsx`, `apps/mobile/src/app/settings.tsx`, `apps/mobile/src/features/key/**` (KeyScreen, KeyCard, KeyPanel, BandChip, BandEditSheet, ConfirmSheet, SettingsScreen, ShareCoachMark, ZoneGlyph), `DESIGN.md` §9.9, §9.10 |
| **P4 Check + Matches + Try-on** | `apps/mobile/src/app/check.tsx`, `apps/mobile/src/app/tryon.tsx`, `apps/mobile/src/features/check/**` (incl. `ui/` shims), `apps/mobile/src/features/matches/**`, `apps/mobile/src/features/tryon/**`, `apps/mobile/src/features/share/**`, `ops/vm/qa-tryon.sh`, `DESIGN.md` §9.3, §9.4, §9.5 |

Note: the Result screen (§4.6) is mostly `KeyPanel` (P3). P2 owns `ResultScreen.tsx` (app bar, footer "Check a
product"); P3 owns what is inside `KeyPanel`. They agree on the KeyPanel props as they are today; P3 adds the hero
skin-type card, the "Key readings" chip rail and the focus tiles inside `KeyPanel`, so both screens get them.

Never touched by anyone: `packages/rules/**`, `data/catalog/**`, `audit/**`.

### Gate for every package
`scripts/remote.sh -- 'npm run typecheck && npx vitest run && npm run test:rn -w @skinkey/mobile && npm run lint:claims'`, then
`scripts/remote.sh --pull design/web-shots -- 'npm run shots:web'` and a `design:design-critique` pass that answers
"does this look like the reference showcase?" against the mapped crop, in both themes, at 390×844.

---

## 6. Acceptance: side-by-side checks

| Our shot | Crop | Must be true |
|---|---|---|
| `welcome-light` | `01_welcome` | Liquid backdrop, chrome S, serif wordmark, one-line tagline, slate "Get started →", translucent second pill |
| `home-light`, `home-empty-light` | `02_home` | Greeting row with gear right; white skin-type card with disc + value + arrow; mist page; thumb-tile list; white tab bar with filled active glyph and no pill |
| `scan-consent`, `scan-processing` | `03_analyze` | Centred title + back arrow; framed plate with corner brackets; checklist card with trailing ticks |
| `scan-result`, `key` | `04_report` | Gradient skin-type card with large disc; "Key readings" grey chips; three white focus tiles with lavender discs; slate pill CTA with arrow |
| `check-sample`, `check-matches` | `06_discover` | Sans title; chip rail with a dark selected chip; gradient banner; white product cards with soft square tiles; no stars or hearts |
| every `*-dark` | same crops | Same structure in graphite: tone-stepped cards, sheen edge, lavender-graphite gradient, pearl primary, filled pearl tab glyph |

---

## 7. Product law over the showcase (never build)

| Showcase shows | We do instead |
|---|---|
| "Good morning, Aman ✨" | "Good afternoon", no name, no sparkle |
| Bell with a dot | Gear (Settings); we have no notifications |
| "Today's Routine", AM/PM, numbered steps 1–4 | Share steps as thumb-tile rows, store segmented control, no numerals |
| Real face photo with a dotted mesh | Drawn face-frame illustration; live camera only on capture, no mesh on a person |
| "Analyzing texture…" fake steps | Our real Worker steps, ending in "Deleted from YouCam" |
| "Key Concerns: Mild acne…" | "Key readings": band chips ("Oiliness · High"); cosmetic words only |
| "Barrier repair" tile | Lighter textures · Hydration · Fragrance-free ("repair" is banned) |
| "Get My Routine →" | "Check a product →" |
| "Dermatologist-approved & community loved", stars, review counts, hearts | Honesty line, reason line, verdict tag; no ratings of any kind |
| Routines / Community / Profile / Progress tabs, 82/100 score, before/after | Not built. Three tabs: Check · Scan · Reading |
| "I already have an account" | "Use the Demo reading" (no accounts) |
