# Silver Mirror design system: token pipeline

Version 2.0 (tokens `2.0.0`), 2 Nov 2026. **The design system of record is `/DESIGN.md`.** This folder holds the token pipeline that DESIGN.md describes: pearl and graphite neutrals, a deep slate primary pill (pearl in dark), sage / amber / slate / ink verdict roles, **Noto Serif Display** for the wordmark, display and title, and **Geist** for the interface. Both faces contain the rupee sign.

> Below this line the README still documents Clay & Ink v1.1 usage (font file names, grain). The commands and the three-layer structure are unchanged; font loading is now just `useFonts(fontAssets)` (`@expo-google-fonts/noto-serif-display` + `@expo-google-fonts/geist`, no local font files), and grain is off. Run the build and checker on the build VM: `scripts/remote.sh -- "cd design/system/tokens && node build-tokens.mjs && node check-contrast.mjs --md contrast-report.md"`.

| File | What it is |
|---|---|
| `tokens/skinkey.tokens.json` | **Source of truth.** Three layers: `primitive` → `semantic` (light and dark) → `component`. Edit only this. |
| `tokens/build-tokens.mjs` | Generates `theme.ts`, `tokens.css` and the token tables inside `components.md`. |
| `tokens/check-contrast.mjs` | Gates 260 colour pairs (WCAG 2.1) and 26 rule lints, including "every token named in components.md exists". Exits 1 on any failure. |
| `tokens/theme.ts` | React Native / Expo theme (generated). Passes `tsc --strict` with `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` against the real `react-native` types. |
| `tokens/tokens.css` | Web CSS variables (generated). |
| `tokens/contrast-report.md` | Every gated pair with its ratio, plus the lint results (generated). |
| `components.md` | Specs for 27 components: anatomy, variants, states, tokens, accessibility, copy, motion, do/don't. |
| `showcase.html` / `showcase.png` / `showcase-full.png` | Live specimen page: palette with in-browser contrast checks, type, foundations, component specimens in both themes, 15 screens × 2 themes, changelog. `?qa=1` runs a layout QA pass (overflow, 12px floor, 48px targets, one-line strings). |
| `assets/fonts/Newsreader36pt_500Medium.ttf` | Static opsz-36 instance of Newsreader for RN display and title (OFL, licence alongside). |
| `assets/texture/grain-160.png` | Static 160px paper-grain tile. |

```sh
cd tokens
node build-tokens.mjs                       # theme.ts, tokens.css, components.md tables
node check-contrast.mjs --md contrast-report.md   # must exit 0
```

---

## Using the tokens in React Native (Expo)

```sh
npx expo install expo-font @expo-google-fonts/newsreader @expo-google-fonts/commissioner
```

Copy `tokens/theme.ts` and `assets/fonts/Newsreader36pt_500Medium.ttf` into the app.

```tsx
import { useFonts } from 'expo-font';
import { fontAssets, typography, textProps, useSkinKeyTheme, touch } from './theme';

const [loaded] = useFonts({
  ...fontAssets,                                                    // 16pt Newsreader + Commissioner
  Newsreader36pt_500Medium: require('./assets/fonts/Newsreader36pt_500Medium.ttf'), // display, title, figure
});

function Reason({ text }: { text: string }) {
  const theme = useSkinKeyTheme();                                  // follows system light/dark
  return <Text {...textProps.reason} style={[typography.reason, { color: theme.colors.text }]}>{text}</Text>;
}

<Pressable style={{ minHeight: touch.min, minWidth: touch.min }} />            // 48dp own box, not hitSlop
<View style={theme.elevation[1].style} />                                       // or .boxShadow on new arch, never both
const head = theme.components.verdictCard.head[verdict];                        // same shape for all four verdicts
```

- `typography` holds text styles (`type` is a deprecated alias for one release). Styles carry **no `fontWeight`**: on Android the weight lives in the family key.
- `textProps` sets `allowFontScaling` and `maxFontSizeMultiplier: 2` per style. Spread it onto every `<Text>`.
- `theme.colors.*` are semantic colours, `theme.components.*` the component layer, `palette` the primitives (don't use them in components).
- Motion: `Easing.bezier(...motion.ease.standard)`; when reduce motion is on, use `motion.reduced`.
- Prose rules (`$rule`, `$actions` …) are stripped from `theme.ts`; read them in `components.md`.

## Using the tokens on the web

```html
<link rel="stylesheet" href="tokens/tokens.css">
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Commissioner:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
.reason { font: var(--sk-reason-row-reading); letter-spacing: var(--sk-reason-row-reading-tracking); color: var(--sk-reason-row-reading-color); }
.btn    { min-height: var(--sk-button-primary-min-height); background: var(--sk-button-primary-bg); }
```

- Naming: `--sk-color-*`, `--sk-verdict-<s>-*`, `--sk-meter-*`, `--sk-type-*`, `--sk-space-*`, and `--sk-<component>-<path>` (camelCase → kebab, dots → dashes). Component vars that alias a type style also emit `-tracking`, plus `-transform` / `-numeric` when set.
- Theme follows `prefers-color-scheme`; force it with `data-theme="light|dark"` on any element (themed subtrees resolve their own values).
- Type is in **rem with unitless line heights**, so the browser text-size setting scales it. Spacing is px.
- Utilities: `.sk-type-*`, `.sk-focusable` (+ `.sk-on-inverse`, `.sk-on-overlay`), `.sk-target`, `.sk-grain`, `.sk-meter`, `.sk-verdict-head`. `forced-colors` and `prefers-reduced-motion` rules are included.
- `--sk-grain-tile` is relative to `tokens.css` (`../assets/texture/grain-160.png`); override it if you deploy differently.

## Fonts

- **Newsreader** (OFL), the variable font with an optical-size axis (6–72). On the web, load the opsz axis and leave `font-optical-sizing: auto`, so 26–60px display text keeps its thin-thick contrast. In RN, `@expo-google-fonts/newsreader` ships only opsz-16 statics. Those suit 16–20dp text, but they look blunt at display sizes. So `display`, `title` and `figure` use the bundled `Newsreader36pt_500Medium`, which was instanced with fontTools from the Google Fonts variable file at opsz 36, wght 500.
- **Commissioner** (OFL): 400 and 600 from `@expo-google-fonts/commissioner`. Check its tracking on a real Android device.
- Android: `includeFontPadding: false` is already in every style.

## Principles

1. **A calm friend who shows their working.** Every claim names its source: scan date, product data, weather. Nothing flashes, sells or hurries.
2. **Reasons before verdicts.** Reasons (Newsreader 19/500) out-size the 15dp verdict label and are numbered in serif.
3. **Privacy you can see.** "What we keep" comes before the camera, and the YouCam deletion is its own step.
4. **Honest UNKNOWN.** A designed state with a next step and the real catalogue count, never an error.
5. **Fit, not safety.** CAUTION is ochre, never red, never the whole screen. The medicine gate is one quiet line.

The hard rules are lint-enforced, so a token change that breaks one fails the check:
- nothing below 12dp
- 48dp targets
- tint confined to the verdict head
- neutral-ink meters, stepper and map
- four distinct verdict silhouettes
- grain ≤ 3% and off in dark mode
- no fixed heights next to text
- nav selection by weight, not colour

---

## Changelog

### v1.0: grafts from Deep Teal onto Clay & Ink
1. **Dispensing-label provenance ledger.** "Where this comes from" with small-caps keys SKIN / PRODUCT / (WEATHER) / LIMITS and hairline rows.
2. **Verdict tint in the head only.** Reasons sit on a plain surface (`verdictCard.body.bg` transparent).
3. **Band meters in neutral ink**, never the accent. They are horizontal 3-segment meters with full-opacity empty outlines.
4. **Pharmacist-at-counter icon** for the medicine gate, replacing the mortar and pestle.
5. **Judge fixes:**
   - verdict label 15/600 caps with a 24dp icon
   - product fact 16dp in full text colour
   - dark primary deepened to #86A4A7 with #0C171A (6.84:1)
   - 12dp floor, 48dp targets
   - distinct silhouettes (seal + check, half-filled circle, dashed circle, pharmacist)
   - CAUTION never red
   - grain as a static 3% tile, decorative zones only, off in dark mode

### v1.1: critique round 2 (anti-slop, accessibility, design-system engineering)

**Visual / anti-slop**
- Verdict head:
  - The inset 3dp stripe is gone, and there is no rule token.
  - The verdict sentence is Newsreader 20/26/400 (`type.verdictLine`), with a 1dp tinted edge and radius 12. The caps label is the only sans line in the head.
- /check is now a pushed detail with no bottom nav:
  - The bar holds one primary plus a 48dp tertiary.
  - Only the store link-out carries a destination line.
  - The bar's edge and shadow appear only while content scrolls under it (~136dp tall, down from ~250dp).
- Medicine gate: no box. The 32dp pharmacist sits above a bare Newsreader 26/32 line, about a third of the way down.
- Camera stand-ins: soft vignettes replace the flat grey blocks. The capture guide shows one 14/600 instruction line and one hint at a time, with 16dp insets.
- Newsreader now uses the full opsz axis on the web and a 36pt static in RN, with a family key per role.
- The verdict-silhouette specimen is a 2 × 2 grid with one-line labels and inset dark panels.
- Grain: the tile now actually ships (`assets/texture/grain-160.png`). It is shown on the share-teaching illustration, with a light/dark callout and a specimen.
- Eyebrows removed. Caps survive only on ledger keys and the verdict label. Section heads are sentence-case Newsreader 18 (`type.section`).
- /profile bands are a dispensing-label list: 56dp rows, sans name, serif word, neutral meter, one legend.
- Empty state: left-aligned with no icon disc, a Newsreader sentence with the real count, and a tertiary action. The offline banner is a list-row line.
- Skin map: an egg face with a jaw taper and no neck. The T-zone joins the forehead, the cheeks are teardrops and the chin is a crescent. It is drawn at 1.25px, and the cheeks are labelled "Your left / Your right" (mirrored).
- Try-on: a neutral plate with a real 13% warm tint on the right half. The caption is attached to the frame, and hatch is reserved for the skin map.
- Home leads with the share-sheet illustration and "In Flipkart, tap Share → SkinKey". Paste a link is the secondary and Scan in store the tertiary. The chip reads "Your scan · 1 Nov".
- Nav is now Check (tag) / Aisle (barcode) / Profile.
- The pharmacist icon gains one bottle on the counter. No cross; crosses stay banned.
- "Shared from" uses `arrow-down-left`, not the share glyph.
- UNKNOWN head moved to warm sand with a dashed edge. The dark FITS and CAUTION fills are desaturated about 30%.
- Reason hierarchy: reason 19/500, fact 16/400, 6dp apart.
- The checked checkbox row has no grey fill.
- Consent: the approved sentence is kept word for word, but its first clause is set large so the promise lands first.
- The masthead's process notes moved to a changelog at the end of the showcase. The QA debug output no longer appears in screenshots, and the overflowing "Readings by zone" header is fixed.

**Accessibility**
- New `focus-ring-inverse` for the snackbar and `focus-ring-overlay` (white with a 1dp halo) for camera controls. Both are gated.
- Bottom nav: inactive labels are 400 and active labels 600, and the active icon uses a 2.25 stroke. Dark `accent-subtle` is now ink.700. A lint checks this.
- Skin map: bands are encoded by hatch only, in a per-mode colour. The mode-blind `zoneFill` is deleted.
- Sheets are modal on Android: use RN `Modal` or `no-hide-descendants`, move focus to the title on open, and return focus to the trigger on close.
- Only text is grouped. Links and buttons are sibling nodes, which fixes the ledger source link, the forecast button, Edit and the noProfile prompt.
- One hidden polite live region per screen. The QR announces only at 25, 20, 15, 10, 5 and 1 min. The verdict reveal uses `setAccessibilityFocus`.
- Ranking disclosure is 14dp in full text colour, with a border-strong rule.
- No hitSlop-only targets: new `iconButton`, `segmented` and `snackbar.actionTarget` tokens. The target lint now covers every `*Target` key.
- Fixed heights became `minHeight` / `visualMinHeight`, and a lint fails any `height` next to a type token.
- Try-on divider has a halo and the handle a ring. The handle is `adjustable` with `accessibilityValue`.
- Snackbar with an action lasts 10s via `getRecommendedTimeoutMillis`, and stays while TalkBack is on.
- Font scale is capped at 2.0 everywhere (`textProps`). At 1.5× and above, the actions move inline.
- Web type is in rem with unitless line heights. `forced-colors` rules are added.
- Stepper: numerals sit inside the pending and active rings so they can't be mistaken for the UNKNOWN glyph. It uses neutral ink, not the accent.
- Capture: the volume key fires the shutter on a single press, plus a spoken framing hint.
- `check-contrast.mjs --md` accepts absolute paths.
- New gated pairs:
  - focus ring on the inverse surface and over the camera
  - try-on divider
  - map hatch, zone and outline strokes
  - nav icons and labels (the pill and label difference are reported as info)
  - segmented selection
  - stepper check
  - disclosure
  - link on each verdict head

**Design-system engineering**
- `components.md` now uses the real token paths throughout. All 26 component token tables are generated, as are the semantic, type and motion tables, and a lint resolves all ~1,500 token references (legacy v1.0 names fail).
- `button.consentPair` added. Consent uses it, and the showcase reads only `--sk-button-consent-pair-*`.
- Stepper `done`, `current` and `connectorDone` use `color.text`. `failed` and numerals added, and `rowMinHeight` is 56.
- Shadows: the primitive `sand.shadow` is aliased through `color.shadow` (dark: transparent), and RN `shadowColor` is resolved by the build.
- The four verdict-head variants share one shape (`borderWidth`, `borderStyle`, `showLabel`, `subtitle`, `iconSize`), so `head[v].borderWidth` type-checks. Medicine `label: 'none'` became `showLabel: false`.
- New component groups: `focus`, `iconButton`, `actionBar`, `productHeader`, `field`, `segmented`, `switch`, `bandList`, `verdictCard.medicineGate`.
- Missing disabled and pressed states added, plus `bandChip.noData`, `qrShareCard.expired` and `storeLinkOut.destinationDisabledColor`.
- Prose moved to `$` keys, so `theme.ts` carries values only. The `type` export was renamed `typography` (with a deprecated alias), and `textProps` was added.
- `motion.enter.translate` / `scaleFrom` now come from JSON. The grain allowed and forbidden lists are unified, with no reduce-motion rule.

**Deliberately not applied (conflicts with the brief)**
- The anti-slop critique asked for a second line on the medicine gate ("SkinKey doesn't check medicines…"). Brief §2 says the gate shows exactly one line, so that line is parked in `components.md` §6 pending research sign-off.
- The critique suggested new consent copy. The R-approved sentence is kept verbatim and only its typography changed.

### Results at v1.1.0
- `check-contrast.mjs`: 260 gated pairs, 0 failures; 26 lints, 0 failures.
- Lowest text pair: 4.77:1 light, 4.68:1 dark. Lowest non-text pair: 3.41:1 light, 3.35:1 dark.
- Showcase `?qa=1`: 0 issues (no overflow, nothing under 12px, every target ≥ 48px).
