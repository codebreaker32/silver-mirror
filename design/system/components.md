# Silver Mirror component specifications

> **Superseded look, kept anatomy (2026-11-02).** The visual direction is now **Silver Mirror** (tokens v2.0.0). `/DESIGN.md` is the design system of record: palette, type, brand, per-screen specs. This file keeps the component anatomy, states, accessibility and copy rules, and its token tables are regenerated from `tokens/skinkey.tokens.json`, so values below are current. Prose that still says Newsreader, Commissioner, ochre, ink, sand or paper grain describes Clay & Ink and is overridden by DESIGN.md: read Newsreader as Noto Serif Display (display and title only, 20dp floor), Commissioner as Geist, ochre as amber, ink accent as slate, sand as pearl/graphite; grain is off.

*Original direction: Clay & Ink v1.1, 1 Nov 2026.*

**Stack:** Expo / React Native, Android-first, with Material 3 behaviour for share, back, permissions, sheets and snackbars. A small web app (results/fallback page, pharmacist QR page, landing) reads the same tokens as CSS variables.

**Sources:** `directions/README.md` (judge fixes), `directions/clay-ink.*`, `directions/deep-teal.*`, `research/00_research_summary_and_design_brief.md` §3–5 and §7. **Token source of truth:** `tokens/skinkey.tokens.json`. Every "Component tokens" table, the semantic colour table (§1.3), the type table (§1.4) and the motion table (§1.5) are **generated** into this file by `node tokens/build-tokens.mjs`, so they cannot drift. `node tokens/check-contrast.mjs` fails if any backticked token reference in this file does not resolve. Changelog: `README.md`.

---

## 0. Principles

1. **A calm, knowledgeable friend who shows their working.** Every claim names where it came from: the reading and scan date, the product data source, the weather source. Nothing flashes, sells or hurries. The only countdown in the product is the pharmacist QR expiry.
2. **Reasons before verdicts.** The verdict label frames the reasons; it does not replace them. Reasons are set *larger* than the label (`type.reason` 19dp/500 > `type.verdictLabel` 15dp), and they are numbered in serif (01, 02) so they read as the main content.
3. **Privacy you can see.** Show what is kept before the camera opens. Show the YouCam deletion as its own step in processing. Keep "What we keep" and Delete one tap away. Every new sharing act gets its own consent screen with a preview.
4. **Honest UNKNOWN.** UNKNOWN and "based on product name only" are designed states, not errors. They always offer a next step and show the real catalogue count. They use no error colour and no error icon.
5. **Fit, not safety.** CAUTION means "may not suit *this profile*". It is ochre, never red. It never fills the screen. It uses no triangle, no exclamation mark and no shield. The medicine gate is neutral ink with one line.

---

## 1. How to read this spec

### 1.1 Token references

Components reference **semantic, type, space, radius, elevation, motion and component tokens only**. They never use raw hex values or primitives. Names in backticks are real paths in `skinkey.tokens.json`.

| Written here | Lives in `skinkey.tokens.json` | React Native | Web CSS |
|---|---|---|---|
| `color.text`, `color.bg-sunken` | `semantic.color.<mode>.*` | `useSkinKeyTheme().colors.text`, `.colors.bgSunken` | `var(--sk-color-text)`, `var(--sk-color-bg-sunken)` |
| `verdict.caution.bg`, `meter.filled` | `semantic.color.<mode>.verdict.*` / `.meter.*` | `theme.colors.verdict.caution.bg`, `theme.colors.meter.filled` | `var(--sk-verdict-caution-bg)`, `var(--sk-meter-filled)` |
| `type.reason` | `typography.scale.reason` | `<Text {...textProps.reason} style={typography.reason}>` | `font: var(--sk-type-reason); letter-spacing: var(--sk-type-reason-tracking)` or class `.sk-type-reason` |
| `space.4`, `space.gutter` | `spacing.scale` / `spacing.semantic` | `space[4]`, `spacing.gutter` (dp numbers) | `var(--sk-space-4)` (px) |
| `radius.lg` | `radius` | `radius.lg` | `var(--sk-radius-lg)` |
| `elevation.2` | elevation → light / dark → level 2 | `theme.elevation[2].style` (or `.boxShadow` on the new architecture, never both) | `--sk-elevation-2-surface / -border / -shadow` |
| `motion.duration.press`, `motion.ease.standard` | `motion.*` | `motion.duration.press`, `Easing.bezier(...motion.ease.standard)` | `var(--sk-duration-press)`, `var(--sk-ease-standard)` |
| `touch.min`, `icon.lg` | `touch`, `icon` | `touch.min`, `icon.lg` | `var(--sk-touch-min)`, `var(--sk-icon-lg)` |
| `<component>.<path>` e.g. `verdictCard.head.caution.bg` | `component.*` | `theme.components.verdictCard.head.caution.bg` | `var(--sk-verdict-card-head-caution-bg)` (camelCase → kebab, dots → dashes) |

A component var that aliases a type style also emits `-tracking`, and `-transform` / `-numeric` when the style sets them, e.g. `--sk-verdict-card-head-label-tracking` and `--sk-verdict-card-head-label-transform`. Keys starting with `$` (rules, copy, component cross-references such as `consentSheet.$actions`) are documentation only and are stripped from `theme.ts`.

### 1.2 Global rules

| Rule | Spec |
|---|---|
| **Type floor** | No text under **12dp**. Only `type.fine` (data credits) sits at 12. Ledger keys, meter labels, tags and nav labels are 13dp. Serif is never below 18dp. |
| **Touch targets** | Every interactive element is a `Pressable` whose **own box** is at least 48 × 48dp (`touch.min`), reached with `minHeight` / `minWidth` and padding. **hitSlop is not a fix on Android**: touches outside the parent's bounds are never delivered and a nested `<Text onPress>` takes no hitSlop. Use hitSlop only where the parent already has 48dp of room. Never use a nested Text link for an action in RN; move it to its own row. Targets are at least 8dp apart (`touch.gap`). |
| **Grouping for TalkBack** | In RN Android, `accessible={true}` on a parent makes its children unfocusable. **Group only text.** Render any link or button that belongs to a group as a sibling node after it (ledger PRODUCT source link, forecast "Check a sunscreen", product-header Edit, the noProfile "Start scan" prompt), or expose it through `accessibilityActions` + `onAccessibilityAction`. |
| **Live regions** | One visually hidden `<Text accessibilityLiveRegion="polite">` per screen. Write to it only on real changes (a processing step, the QR at 25, 20, 15, 10, 5 and 1 min). Never make a list or a visible countdown a live region. For the verdict reveal, call `AccessibilityInfo.setAccessibilityFocus(verdictHeadRef)` when loading ends; do not use `announceForAccessibility` (deprecated on Android 16). |
| **Dynamic type** | `allowFontScaling` stays on; `maxFontSizeMultiplier` is **2.0** on every style (`textProps` in `theme.ts`). Test at 1.0, 1.3 and 2.0 (Android 14 non-linear scaling). `minHeight`, never a fixed `height`, on anything that contains text (lint-enforced). At ≥ 1.3× button pairs stack. At ≥ 1.5× ledger keys stack above values, the sticky action bar becomes inline at the end of the content (`actionBar.inlineAtFontScale`), and nav labels wrap to 2 lines. **Verdict labels, reasons and fixed strings never truncate.** Web: rem type and unitless line heights in `tokens.css`; reflow at 200% zoom and 320 CSS px (WCAG 1.4.4 / 1.4.10). |
| **Colour never alone** | Every state has a text label, a unique icon silhouette and a hue. FITS and CAUTION heads have near-equal luminance, so in greyscale the silhouette (seal vs half-filled circle) and the caps label carry the difference. There is no leading stripe. |
| **CAUTION** | Ochre (`verdict.caution.*`), **never red**. The tint is confined to the verdict head and never reaches reasons, backgrounds, app bars or buttons. |
| **Accent use** | `color.accent` is for primary buttons, links, focus, selected nav and selected segments **only**. It never marks a verdict, a band, a meter, a processing step or a chart (lint-enforced for the stepper, band list and skin map). |
| **Eyebrows** | Tracked caps survive only on ledger keys (`type.overline`) and the verdict label. Section heads are sentence-case `type.section` (Newsreader 18/24). No screen-level overlines. |
| **Numerals** | Dates, prices, counts, indices, SPF and the countdown use tabular figures (`type.reasonIndex`, `type.figure`, or `fontVariant: ['tabular-nums']`). |
| **Paper grain** | Static 160px PNG tile (`assets/texture/grain-160.png`) at **3%** in light (`texture.grain.light.opacity`), **0** in dark (`texture.grain.dark.opacity`). Allowed only on `texture.grain.allowed`: the share-teaching illustration panel, landing hero margins, the empty-state illustration plate and the splash. **Never** behind body text, reasons, the ledger, forms, cameras or on card and sheet surfaces themselves. It never animates, so reduce motion does not change it. Skip it on low-RAM devices (`ActivityManager.isLowRamDevice`). |
| **Icons** | Lucide line icons at `icon.stroke` 1.75, round caps, sizes `icon.sm` 16 / `icon.md` 20 / `icon.lg` 24 / `icon.xl` 32. Decorative icons next to text are hidden from TalkBack (`importantForAccessibility="no"`). Icon-only controls carry an `accessibilityLabel`. **Banned:** shield, warning triangle, exclamation mark, medical cross or plus, pill, mortar and pestle, sparkles, store logos, and the share/upload glyph for provenance ("Shared from" uses `arrow-down-left`). |
| **Focus** | 2dp ring, 2dp offset (`focus.width`, `focus.offset`), measured against the surrounding surface. Three colours: `focus.color` on paper, `focus.inverse` on the snackbar, `focus.overlay` (white + 1dp `focus.overlayHalo`) over the camera or a photo. All gated. |
| **Navigation** | The bottom nav exists on top-level screens only (home, /profile). /check, better matches, try-on and the QR share are **pushed details**: back arrow, no bottom nav (M3: never show back and a selected tab together). |
| **Safe areas** | Fixed bars respect the status bar and the gesture inset (`react-native-safe-area-context`). Scroll content gets a bottom inset equal to the sticky bar height. |
| **Links out** | Store links open the store app or a Chrome Custom Tab, **never a WebView**. Every button that leaves for a store search shows its destination line *before* the tap. |

### 1.3 Semantic colour tokens (generated)

Ratios for every pair are in `tokens/contrast-report.md` (260 gated pairs, 0 failures at v1.1.0).

<!-- tokens:@semantic -->
| Token | Light | Dark |
|---|---|---|
| `color.bg` | #F6F5F8 (`pearl.50`) | #121319 (`graphite.950`) |
| `color.bg-sunken` | #EFEEF3 (`pearl.100`) | #0E0F14 (`graphite.975`) |
| `color.surface` | #FCFBFD (`pearl.25`) | #1A1B23 (`graphite.900`) |
| `color.surface-raised` | #FFFFFF (`white`) | #20212A (`graphite.850`) |
| `color.text` | #1A1B23 (`graphite.900`) | #EFEEF3 (`pearl.100`) |
| `color.text-muted` | #4B4958 (`silver.700`) | #C6C3CF (`pearl.300`) |
| `color.text-subtle` | #636070 (`silver.600`) | #A8A5B3 (`silver.400`) |
| `color.border` | #DCDAE3 (`pearl.200`) | #30313C (`graphite.750`) |
| `color.border-strong` | #7E7B8B (`silver.500`) | #7E7B8B (`silver.500`) |
| `color.accent` | #3B3F52 (`slate.700`) | #F6F5F8 (`pearl.50`) |
| `color.on-accent` | #F6F5F8 (`pearl.50`) | #2F3243 (`slate.800`) |
| `color.accent-pressed` | #50576F (`slate.600`) | #C6C3CF (`pearl.300`) |
| `color.accent-subtle` | #E1E4EE (`slate.100`) | #2F3243 (`slate.800`) |
| `color.on-accent-subtle` | #2F3243 (`slate.800`) | #E1E4EE (`slate.100`) |
| `color.secondary-bg` | #E7E5EC (`pearl.150`) | #30313C (`graphite.750`) |
| `color.secondary-bg-pressed` | #DCDAE3 (`pearl.200`) | #3A3B47 (`graphite.700`) |
| `color.on-secondary` | #1A1B23 (`graphite.900`) | #EFEEF3 (`pearl.100`) |
| `color.accent-warm` | #CFC4BB (`greige.300`) | #4A4038 (`greige.800`) |
| `color.on-accent-warm` | #4A4038 (`greige.800`) | #E4DCD5 (`greige.200`) |
| `color.icon-disc` | #ECE9F5 (`lavender.100`) | #34304F (`lavender.800`) |
| `color.on-icon-disc` | #3B3F52 (`slate.700`) | #DDD8EE (`lavender.200`) |
| `color.bracket` | #666E88 (`slate.500`) | #A6ADC2 (`slate.300`) |
| `color.link` | #50576F (`slate.600`) | #C7CCDB (`slate.200`) |
| `color.link-pressed` | #3B3F52 (`slate.700`) | #E1E4EE (`slate.100`) |
| `color.focus-ring` | #666E88 (`slate.500`) | #BEB6DE (`lavender.300`) |
| `color.focus-ring-inverse` | #BEB6DE (`lavender.300`) | #50576F (`slate.600`) |
| `color.focus-ring-overlay` | #FFFFFF (`white`) | #FFFFFF (`white`) |
| `color.overlay` | rgba(18, 19, 25, 0.40) | rgba(8, 9, 12, 0.64) |
| `color.overlay-camera` | rgba(14, 15, 20, 0.62) | rgba(14, 15, 20, 0.62) |
| `color.on-overlay` | #FFFFFF (`white`) | #FFFFFF (`white`) |
| `color.overlay-halo` | rgba(14, 15, 20, 0.60) | rgba(14, 15, 20, 0.60) |
| `color.inverse-surface` | #20212A (`graphite.850`) | #E7E5EC (`pearl.150`) |
| `color.inverse-text` | #EFEEF3 (`pearl.100`) | #1A1B23 (`graphite.900`) |
| `color.inverse-link` | #DDD8EE (`lavender.200`) | #50576F (`slate.600`) |
| `color.disabled-bg` | #E7E5EC (`pearl.150`) | #30313C (`graphite.750`) |
| `color.disabled-fg` | #636070 (`silver.600`) | #A8A5B3 (`silver.400`) |
| `color.shadow` | #2A2D40 (`slate.shadow`) | transparent |
| `color.sheen-edge` | rgba(255, 255, 255, 0.00) | rgba(239, 238, 243, 0.07) |
| `color.state.pressed` | rgba(26, 27, 35, 0.08) | rgba(239, 238, 243, 0.10) |
| `color.state.hover` | rgba(26, 27, 35, 0.05) | rgba(239, 238, 243, 0.06) |
| `color.state.ripple` | rgba(26, 27, 35, 0.12) | rgba(239, 238, 243, 0.14) |
| `color.state.ripple-on-accent` | rgba(246, 245, 248, 0.18) | rgba(47, 50, 67, 0.16) |
| `color.sheen.start` | #FDFCFE | #262733 |
| `color.sheen.lavender` | #ECE8F4 | #24222F |
| `color.sheen.silver` | #E4E3EA | #1C1D25 |
| `color.sheen.end` | #F6F5F8 (`pearl.50`) | #121319 (`graphite.950`) |
| `color.mark.tile-top` | #FFFFFF (`white`) | #30313C (`graphite.750`) |
| `color.mark.tile-bottom` | #E7E5EC (`pearl.150`) | #1A1B23 (`graphite.900`) |
| `color.mark.tile-edge` | #DCDAE3 (`pearl.200`) | #3A3B47 (`graphite.700`) |
| `color.mark.chrome-hi` | #FBFBFD (`chrome.50`) | #FBFBFD (`chrome.50`) |
| `color.mark.chrome-1` | #D9D8E1 (`chrome.200`) | #D9D8E1 (`chrome.200`) |
| `color.mark.chrome-2` | #9F9DAE (`chrome.400`) | #9F9DAE (`chrome.400`) |
| `color.mark.chrome-3` | #CBC5E0 (`chrome.lav`) | #CBC5E0 (`chrome.lav`) |
| `color.mark.chrome-4` | #686678 (`chrome.600`) | #838194 (`chrome.500`) |
| `color.mark.chrome-lo` | #4F4D5E (`chrome.700`) | #686678 (`chrome.600`) |
| `color.mark.glint` | #FFFFFF (`white`) | #FFFFFF (`white`) |
| `color.mark.shade` | #2A2D40 (`slate.shadow`) | #0E0F14 (`graphite.975`) |
| `verdict.fits.bg` | #E2EEE8 (`sage.100`) | #1A2A25 (`sage.900`) |
| `verdict.fits.fg` | #2B5145 (`sage.700`) | #C4DDD2 (`sage.200`) |
| `verdict.fits.border` | #568676 (`sage.500`) | #568676 (`sage.500`) |
| `verdict.fits.icon` | #3D6B5C (`sage.600`) | #97C0B0 (`sage.300`) |
| `verdict.caution.bg` | #F5EAD6 (`amber.100`) | #2A2317 (`amber.900`) |
| `verdict.caution.fg` | #66460C (`amber.700`) | #EDD6AE (`amber.200`) |
| `verdict.caution.border` | #A57A2F (`amber.500`) | #A57A2F (`amber.500`) |
| `verdict.caution.icon` | #8A6118 (`amber.600`) | #D4A65A (`amber.400`) |
| `verdict.unknown.bg` | #EFEEF3 (`pearl.100`) | #20212A (`graphite.850`) |
| `verdict.unknown.fg` | #2F3243 (`slate.800`) | #C7CCDB (`slate.200`) |
| `verdict.unknown.border` | #666E88 (`slate.500`) | #848CA5 (`slate.400`) |
| `verdict.unknown.icon` | #50576F (`slate.600`) | #A6ADC2 (`slate.300`) |
| `verdict.medicine.bg` | #F6F5F8 (`pearl.50`) | #121319 (`graphite.950`) |
| `verdict.medicine.fg` | #1A1B23 (`graphite.900`) | #EFEEF3 (`pearl.100`) |
| `verdict.medicine.border` | #1A1B23 (`graphite.900`) | #C6C3CF (`pearl.300`) |
| `verdict.medicine.icon` | #1A1B23 (`graphite.900`) | #EFEEF3 (`pearl.100`) |
| `meter.filled` | #272832 (`graphite.800`) | #E7E5EC (`pearl.150`) |
| `meter.empty` | #7E7B8B (`silver.500`) | #7E7B8B (`silver.500`) |
| `color.qr.module` | #000000 (`black`) | #000000 (`black`) |
| `color.qr.field` | #FFFFFF (`white`) | #FFFFFF (`white`) |
<!-- /tokens -->

### 1.4 Type styles (generated)

Android: `includeFontPadding: false`; never set `fontWeight` on a custom family (the weight is in the family key). `Newsreader36pt_500Medium` is a static opsz-36 instance bundled from `assets/fonts/`; everything else ships in `@expo-google-fonts/newsreader` and `@expo-google-fonts/commissioner`. QA: check Commissioner tracking on a real Android phone (judge fix 12).

<!-- tokens:@type -->
| Token | RN fontFamily | Family / weight | Size / line (dp) | Tracking | Use |
|---|---|---|---|---|---|
| `type.display` | NotoSerifDisplay_400Regular | Noto Serif Display 400 | 34 / 40 | -0.6 | Home greeting, welcome headline, empty-state headline |
| `type.title` | NotoSerifDisplay_400Regular | Noto Serif Display 400 | 26 / 32 | -0.3 | Product title on /check, screen titles, the medicine-gate line |
| `type.headline` | Geist_600SemiBold | Geist 600 | 20 / 26 | -0.2 | Card heads, sheet titles, 'Where this comes from', empty-state sentence |
| `type.verdictLine` | NotoSerifDisplay_400Regular | Noto Serif Display 400 | 20 / 27 | 0 | The verdict sentence under the label, one unit in one style |
| `type.section` | Geist_600SemiBold | Geist 600 | 17 / 24 | -0.1 | Sentence-case section heads: 'Why · 2 reasons', 'What stays on this phone', 'Better matches' |
| `type.reason` | Geist_500Medium | Geist 500 | 18 / 26 | -0.1 | Reason reading line. Out-sizes the 15dp verdict label (P1: reasons before verdicts). |
| `type.reasonIndex` | Geist_500Medium | Geist 500, tabular | 15 / 22 | 0 | Step numbers where order matters (share steps). Not decoration on candidates or matches. |
| `type.figure` | NotoSerifDisplay_400Regular | Noto Serif Display 400, tabular | 26 / 32 | -0.3 | QR countdown ('29 min left'), catalogue count on /how |
| `type.verdictLabel` | Geist_600SemiBold | Geist 600, caps | 15 / 20 | 1.2 | FITS / CAUTION / UNKNOWN, with a 24dp icon in a disc. Never truncates; wraps at max font scale. |
| `type.body` | Geist_400Regular | Geist 400 | 16 / 24 | 0 | Body copy, the product fact in each reason (full text colour), consent body |
| `type.bodyStrong` | Geist_600SemiBold | Geist 600 | 16 / 24 | 0 | Band value (High), emphasised step, list row title |
| `type.bodySm` | Geist_400Regular | Geist 400 | 14 / 20 | 0.1 | Ledger values, supporting lines, card secondary text |
| `type.label` | Geist_600SemiBold | Geist 600 | 14 / 20 | 0.1 | Chip and band names, field labels, snackbar action |
| `type.labelSm` | Geist_600SemiBold | Geist 600 | 13 / 16 | 0.2 | Selected tab label, tags |
| `type.labelSmRegular` | Geist_400Regular | Geist 400 | 13 / 16 | 0.2 | Unselected tab label (selection is weight + stroke + pill, never colour alone) |
| `type.button` | Geist_600SemiBold | Geist 600 | 16 / 20 | 0.1 | All buttons |
| `type.overline` | Geist_600SemiBold | Geist 600 | 13 / 18 | 0.1 | Ledger keys only (Reading / Product / Rules / Limits), sentence case. The name is historical: no tracked caps, no eyebrows. |
| `type.caption` | Geist_400Regular | Geist 400 | 13 / 18 | 0.1 | Destination lines, disclosures, meter labels (Low / Medium / High), timestamps |
| `type.fine` | Geist_400Regular | Geist 400 | 12 / 16 | 0.2 | Data credits only (Open-Meteo CC BY 4.0, Open Beauty Facts ODbL). The floor: nothing is smaller than 12. |
<!-- /tokens -->

### 1.5 Motion and haptics policy

The motion personality is **ink settling**: unhurried, no springs, no overshoot, nothing loops. Reduce motion is read from `AccessibilityInfo.isReduceMotionEnabled()` / Reanimated `useReducedMotion()`; on the web, `prefers-reduced-motion`.

<!-- tokens:@motion -->
| Token | Value |
|---|---|
| `motion.duration.instant` | 0ms |
| `motion.duration.press` | 100ms |
| `motion.duration.state` | 160ms |
| `motion.duration.base` | 220ms |
| `motion.duration.enter` | 300ms |
| `motion.duration.verdictReveal` | 320ms |
| `motion.duration.reasonStagger` | 60ms |
| `motion.duration.stepTick` | 220ms |
| `motion.duration.bracketResolve` | 420ms |
| `motion.duration.sheetEnter` | 300ms |
| `motion.duration.sheetExit` | 220ms |
| `motion.duration.screen` | 280ms |
| `motion.duration.crossfade` | 120ms |
| `motion.ease.standard` | cubic-bezier(0.2, 0, 0, 1) |
| `motion.ease.decelerate` | cubic-bezier(0.05, 0.7, 0.1, 1) |
| `motion.ease.exit` | cubic-bezier(0.3, 0, 1, 1) |
| `motion.ease.glide` | cubic-bezier(0.16, 1, 0.3, 1) |
| `motion.ease.linear` | cubic-bezier(0, 0, 1, 1) |
| `motion.enter.translate` / `motion.enter.scaleFrom` | 6dp / 0.98 |
| `motion.timing.snackbarMs` | 4000 |
| `motion.timing.snackbarWithActionMs` | 10000 |
| `motion.timing.qrAnnounceEverySec` | 300 |
| `motion.timing.qrFinalAnnounceSec` | 60 |
| `motion.reducedMotion.duration` | 120ms crossfade, no translate, no scale, no stagger |
<!-- /tokens -->

**Haptics.** Use `View.performHapticFeedback` constants through `expo-haptics` `performAndroidHapticsAsync(AndroidHaptics.*)`, and check the enum names against the installed version. These calls respect the system touch-feedback setting. **Routine taps get no extra haptic**; the M3 ripple is enough. Haptics never encode judgement: every verdict gets the same tick.

| Moment | Android constant | Fallback (API < 30/34) |
|---|---|---|
| Verdict lands (all states, including the medicine gate) | `CONTEXT_CLICK` | same |
| Shutter fires | `CONTEXT_CLICK` | same |
| Barcode detected | `CONFIRM` | `CONTEXT_CLICK` |
| Processing done; profile deleted; QR revoked | `CONFIRM` | `CONTEXT_CLICK` |
| Checkbox / switch | `TOGGLE_ON` / `TOGGLE_OFF` (API 34) | `CLOCK_TICK` |
| Comparison divider passes a detent (0/50/100%) | `SEGMENT_TICK` (API 34) | `CLOCK_TICK` |
| Sheet dismissed by drag | `GESTURE_END` | none |
| Long-press to copy a link | `LONG_PRESS` | same |
| A user action could not finish (capture failed, invalid barcode) | `REJECT` | `LONG_PRESS` |
| **Never** | `REJECT` for CAUTION, UNKNOWN or the medicine gate; any repeating haptic; haptics on countdown ticks | |

### 1.6 State model (shared by every interactive component)

Priority: disabled > loading > pressed > focused > default. On the web, hover = `color.state.hover`.

| State | Visual | Semantics |
|---|---|---|
| default | the component tokens | |
| pressed | `color.state.pressed` layer, Android ripple `color.state.ripple` (bounded), optional scale `motion.enter.scaleFrom` as a transform, `motion.duration.press`. Bounds never shift. | |
| focused | `focus.color` ring (or `focus.inverse` / `focus.overlay`), `focus.width`, `focus.offset` | TalkBack focus uses the system highlight; never suppress it |
| disabled | fill `color.disabled-bg`, label `color.disabled-fg` (4.77:1 light / 4.68:1 dark, **still readable**), outline `color.border`. Per component: `button.primary.fgDisabled`, `button.tertiary.fgDisabled`, `textLink.fgDisabled`, `listRow.fgDisabled`, `storeLinkOut.destinationDisabledColor`. | `accessibilityState={{disabled:true}}`. **Shown, not hidden.** A visible reason line sits nearby when one exists. |
| loading | the label becomes a static progress label ("Checking…"), width kept. No looping spinner. | `accessibilityState={{busy:true}}`; the screen's live region says what is happening |
| error | inline message under the control in `color.text` with an `info` icon (`stateView.fieldInvalid`). **No red.** | written to the screen's live region |

---

## 2. App bar

**Purpose:** orientation and back. It also shows the source of the current item ("Shared from Flipkart").

**Anatomy:** a container (`appBar.minHeight` 56, `color.bg`, no shadow until content scrolls under it, then a hairline `appBar.borderOnScroll` bottom edge), then a leading back icon button (`iconButton.target` 48), then a **left-aligned** title (`appBar.title`) or source line, then 0–1 trailing icon buttons.

**Variants:**

| Variant | Content |
|---|---|
| `small` | title in `appBar.title` (Newsreader 20), or source line in `appBar.source` muted with a 16dp `arrow-down-left` ("arrived from"). **Never the share/upload glyph**: on Android it means "share this", and provenance must not look like an action. |
| `large` | M3 medium: title in `type.title` below the bar, collapsing on scroll. Used for /profile and /about. |
| `camera` | transparent over the camera, icons in `color.on-overlay`, with a `color.overlay-camera` top gradient-free band (a flat scrim) |

**States:**

| State | Spec |
|---|---|
| default | as above |
| scrolled | hairline `appBar.borderOnScroll` bottom edge; no shadow |
| pressed (icon) | circular ripple, radius.full, 48dp |
| focused (icon) | focus ring, circle |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:appBar iconButton -->
| Token | References | Light | Dark |
|---|---|---|---|
| `appBar.minHeight` | — | 56 | same |
| `appBar.bg` | `color.bg` | #F6F5F8 | #121319 |
| `appBar.fg` | `color.text` | #1A1B23 | #EFEEF3 |
| `appBar.title` | `type.headline` | Geist 600 20/26 | same |
| `appBar.titleAlign` | — | start | same |
| `appBar.source` | `type.caption` | Geist 400 13/18 | same |
| `appBar.sourceColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `appBar.sourceIcon` | — | arrow-down-left | same |
| `appBar.iconButton` | `touch.min` | 48 | same |
| `appBar.iconSize` | `icon.lg` | 24 | same |
| `appBar.backIcon` | — | chevron-left | same |
| `appBar.borderOnScroll` | `color.border` | #DCDAE3 | #30313C |
| `appBar.paddingX` | `space.1` | 4 | same |
| `iconButton.target` | `touch.min` | 48 | same |
| `iconButton.iconSize` | `icon.lg` | 24 | same |
| `iconButton.radius` | `radius.full` | 9999 | same |
| `iconButton.fg` | `color.text` | #1A1B23 | #EFEEF3 |
| `iconButton.bg` | — | transparent | same |
| `iconButton.bgTonal` | `color.secondary-bg` | #E7E5EC | #30313C |
| `iconButton.bgPressed` | `color.state.pressed` | rgba(26, 27, 35, 0.08) | rgba(239, 238, 243, 0.10) |
| `iconButton.ripple` | `color.state.ripple` | rgba(26, 27, 35, 0.12) | rgba(239, 238, 243, 0.14) |
| `iconButton.fgDisabled` | `color.disabled-fg` | #636070 | #A8A5B3 |
<!-- /tokens -->

**Accessibility:**
- Back: `accessibilityRole="button"`, label "Back". The system back gesture and back button behave the same way (M3 predictive back is allowed).
- The title is `accessibilityRole="header"`.
- TalkBack order: back, then title, then trailing action.

**Copy:** source line "Shared from Flipkart" / "Shared from Amazon" / "Pasted link" / "Scanned barcode". Store names are text only.

**Motion and haptics:** title collapse follows scroll, with no extra animation. No haptic.

**Do / Don't:**
- Do left-align the title (judge fix).
- Don't use a shield, lock or "verified" badge in the bar. A shield says "safety".
- Don't centre the title.
- Don't put a logo in the bar.

---

## 3. Buttons

**Purpose:** one clear action per region. Buttons stack vertically, full width, inside the sticky action bar or in the content.

**Anatomy:** a container, an optional leading icon (`icon.md`), a label (`type.button`), an optional trailing icon (an external-link arrow only on link-outs), and an optional **destination line** below (see §14).

**Variants:**

| Variant | Use | Fill / text / border | Min height |
|---|---|---|---|
| `primary` | the one main action per screen (Find better matches on CAUTION/UNKNOWN, Back to product on FITS/medicine) | `color.accent` / `color.on-accent` / none | 52 |
| `secondary` | alternative actions (Back to product when it isn't primary, Paste a link) | transparent / `color.text` / 1.5dp `color.border-strong` | 48 |
| `tertiary` | low-emphasis text button (Back to product under a link-out primary, Scan in store, Retake, Try later) | transparent / `color.link` / none; the 48dp target stays | 48 |
| `destructiveNeutral` | **Delete** (profile), **Revoke** (QR) | transparent / `color.text` / 1.5dp `color.text` border, plus a `trash-2` or `link-2-off` icon. **Never red.** Severity comes from the confirm step, not from colour. | 52 |
| `consentPair` | **Start scan / Not now** on every consent screen, which need equal visual weight (brief §5.1). `consentSheet.$actions` points here; a decline is never styled "destructive". | both: `button.consentPair.bg` / `button.consentPair.fg` / 1.5dp `button.consentPair.border`, same size and type | 52 |
| `icon` | 48dp circular, icon only | transparent / `color.text` | 48 × 48 |

**States:**

| State | primary | secondary / consentPair / destructiveNeutral | tertiary |
|---|---|---|---|
| default | `color.accent` fill | outline as listed | `color.link` |
| pressed | `color.accent-pressed` + scale 0.98 | `color.state.pressed` + scale 0.98 | overlay, radius.md |
| focused | `focus.color` ring 2dp, 2dp offset, `radius.md` + 2 | same | same |
| disabled | `button.primary.bgDisabled` / `button.primary.fgDisabled`, no border | `button.secondary.borderDisabled` outline / `button.secondary.fgDisabled` | `button.tertiary.fgDisabled` |
| loading | label → "Checking…", "Creating…" or "Deleting…" with the width kept; `busy` | same | n/a |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:button actionBar focus -->
| Token | References | Light | Dark |
|---|---|---|---|
| `button.primary.bg` | `color.accent` | #3B3F52 | #F6F5F8 |
| `button.primary.fg` | `color.on-accent` | #F6F5F8 | #2F3243 |
| `button.primary.bgPressed` | `color.accent-pressed` | #50576F | #C6C3CF |
| `button.primary.ripple` | `color.state.ripple-on-accent` | rgba(246, 245, 248, 0.18) | rgba(47, 50, 67, 0.16) |
| `button.primary.minHeight` | — | 52 | same |
| `button.primary.paddingX` | `space.6` | 24 | same |
| `button.primary.radius` | `radius.full` | 9999 | same |
| `button.primary.type` | `type.button` | Geist 600 16/20 | same |
| `button.primary.gap` | `space.2` | 8 | same |
| `button.primary.trailingIcon` | — | arrow-right | same |
| `button.primary.bgDisabled` | `color.disabled-bg` | #E7E5EC | #30313C |
| `button.primary.fgDisabled` | `color.disabled-fg` | #636070 | #A8A5B3 |
| `button.secondary.bg` | `color.secondary-bg` | #E7E5EC | #30313C |
| `button.secondary.fg` | `color.on-secondary` | #1A1B23 | #EFEEF3 |
| `button.secondary.border` | `color.secondary-bg` | #E7E5EC | #30313C |
| `button.secondary.borderWidth` | — | 0 | same |
| `button.secondary.bgPressed` | `color.secondary-bg-pressed` | #DCDAE3 | #3A3B47 |
| `button.secondary.minHeight` | — | 48 | same |
| `button.secondary.paddingX` | `space.5` | 20 | same |
| `button.secondary.radius` | `radius.full` | 9999 | same |
| `button.secondary.type` | `type.button` | Geist 600 16/20 | same |
| `button.secondary.fgDisabled` | `color.disabled-fg` | #636070 | #A8A5B3 |
| `button.secondary.borderDisabled` | `color.disabled-bg` | #E7E5EC | #30313C |
| `button.tertiary.bg` | — | transparent | same |
| `button.tertiary.fg` | `color.link` | #50576F | #C7CCDB |
| `button.tertiary.fgPressed` | `color.link-pressed` | #3B3F52 | #E1E4EE |
| `button.tertiary.bgPressed` | `color.state.pressed` | rgba(26, 27, 35, 0.08) | rgba(239, 238, 243, 0.10) |
| `button.tertiary.minHeight` | — | 48 | same |
| `button.tertiary.paddingX` | `space.3` | 12 | same |
| `button.tertiary.radius` | `radius.full` | 9999 | same |
| `button.tertiary.type` | `type.button` | Geist 600 16/20 | same |
| `button.tertiary.trailingIcon` | — | chevron-right | same |
| `button.tertiary.fgDisabled` | `color.disabled-fg` | #636070 | #A8A5B3 |
| `button.destructiveNeutral.bg` | — | transparent | same |
| `button.destructiveNeutral.fg` | `color.text` | #1A1B23 | #EFEEF3 |
| `button.destructiveNeutral.border` | `color.border-strong` | #7E7B8B | same |
| `button.destructiveNeutral.borderWidth` | — | 0 | same |
| `button.destructiveNeutral.bgPressed` | `color.state.pressed` | rgba(26, 27, 35, 0.08) | rgba(239, 238, 243, 0.10) |
| `button.destructiveNeutral.minHeight` | — | 52 | same |
| `button.destructiveNeutral.paddingX` | `space.4` | 16 | same |
| `button.destructiveNeutral.radius` | `radius.full` | 9999 | same |
| `button.destructiveNeutral.type` | `type.button` | Geist 600 16/20 | same |
| `button.destructiveNeutral.leadingIcon` | — | trash | same |
| `button.destructiveNeutral.fgDisabled` | `color.disabled-fg` | #636070 | #A8A5B3 |
| `button.destructiveNeutral.borderDisabled` | `color.border` | #DCDAE3 | #30313C |
| `button.consentPair.bg` | `color.secondary-bg` | #E7E5EC | #30313C |
| `button.consentPair.fg` | `color.on-secondary` | #1A1B23 | #EFEEF3 |
| `button.consentPair.border` | `color.border-strong` | #7E7B8B | same |
| `button.consentPair.borderWidth` | — | 1 | same |
| `button.consentPair.bgPressed` | `color.secondary-bg-pressed` | #DCDAE3 | #3A3B47 |
| `button.consentPair.minHeight` | — | 52 | same |
| `button.consentPair.paddingX` | `space.4` | 16 | same |
| `button.consentPair.radius` | `radius.full` | 9999 | same |
| `button.consentPair.type` | `type.button` | Geist 600 16/20 | same |
| `button.consentPair.fgDisabled` | `color.disabled-fg` | #636070 | #A8A5B3 |
| `button.consentPair.borderDisabled` | `color.border` | #DCDAE3 | #30313C |
| `button.stackAtFontScale` | — | 1.3 | same |
| `actionBar.bg` | `elevation.2.surface` | #FFFFFF | #20212A |
| `actionBar.border` | `elevation.2.border` | #DCDAE3 | #30313C |
| `actionBar.shadow` | `elevation.2` | elevation 2 | same |
| `actionBar.paddingTop` | `space.3` | 12 | same |
| `actionBar.paddingBottom` | `space.2` | 8 | same |
| `actionBar.paddingX` | `space.gutter` | 20 | same |
| `actionBar.gap` | `space.2` | 8 | same |
| `actionBar.moreTarget` | `touch.min` | 48 | same |
| `actionBar.maxHeightAt1x` | — | 112 | same |
| `actionBar.inlineAtFontScale` | — | 1.5 | same |
| `focus.color` | `color.focus-ring` | #666E88 | #BEB6DE |
| `focus.inverse` | `color.focus-ring-inverse` | #BEB6DE | #50576F |
| `focus.overlay` | `color.focus-ring-overlay` | #FFFFFF | same |
| `focus.overlayHalo` | `color.overlay-halo` | rgba(14, 15, 20, 0.60) | same |
| `focus.width` | — | 2 | same |
| `focus.offset` | — | 2 | same |
| `focus.overlayHaloWidth` | — | 1 | same |
<!-- /tokens -->

**Sticky action bar (/check).** `actionBar.*`: one primary, then one 48dp tertiary or secondary. **Only the button that leaves for a store search carries a destination line**; "Back to product" explains itself. Target height at 1.0× is `actionBar.maxHeightAt1x` (136dp), so reason 01 and the start of reason 02 sit above the fold on a 390 × 844 screen. The bar has no edge or shadow at rest; it gains `actionBar.border` and `actionBar.shadow` only while content scrolls under it. Render it **after** the ScrollView in JSX so TalkBack reaches it last. At font scale ≥ `actionBar.inlineAtFontScale` the actions move inline to the end of the content instead of being sticky.

| Verdict | Primary | Second action |
|---|---|---|
| CAUTION, UNKNOWN | Find better matches + destination line | tertiary Back to product |
| FITS | Back to product | secondary Find better matches + destination line |
| medicine | Back to product | none |

**Accessibility:**
- `accessibilityRole="button"`. The label is the visible text plus the destination where there is one: "Find better matches. Opens a Flipkart search, filtered to Oily Skin."
- Disabled buttons stay focusable and announce "dimmed" plus the reason line.
- At ≥ 1.3× font, pairs stack vertically, and Not now stays visible without scrolling on consent.
- The sticky bar never covers TalkBack focus. The scroll view gets a bottom inset; at ≥ 1.5× the bar is inline, so nothing can be hidden under it.

**Copy:**
- Sentence case and verbs: "Start scan", "Not now", "Find better matches", "Back to product", "Paste a link", "Scan in store", "Delete", "Revoke", "Try later", "Retake".
- No "Buy", no "Shop now", no exclamation marks.

**Motion and haptics:** press `motion.duration.press`, `motion.ease.standard`. No haptic. Success haptics fire on the *result*, not the tap (§1.5).

**Do / Don't:**
- Do keep one primary per screen.
- Do use `consentPair` on any consent screen.
- Don't use a red Delete.
- Don't make Not now a grey text link next to a filled Start scan.
- Don't put two primaries side by side.

---

## 4. Text link

**Purpose:** inline navigation (retention policy, "Ingredient list source", "Feels wrong? Edit", "Edit").

**Anatomy:** label in `type.label`, or the body size when inline in a sentence, in `color.link`. A trailing `arrow-up-right` 16dp marks a link that leaves the app. The hit area is padded to 48dp high.

**Variants:**

| Variant | Spec |
|---|---|
| `inline` | **web only**: inside body text, always underlined (`textLink.underlineWidth` 1, `textLink.underlineOffset` 3). In RN an action never lives in a nested `<Text onPress>`; it moves to its own standalone row. |
| `standalone` | no underline, 600 weight, optional leading icon |
| `external` | standalone + `arrow-up-right`; opens a Chrome Custom Tab |

**States:**

| State | Spec |
|---|---|
| default | `color.link` |
| pressed | underline thickens to 2dp + `color.state.pressed` behind it, radius.xs |
| focused | focus ring around the padded hit area |
| visited | not shown (no visited colour) |
| disabled (offline external) | `textLink.fgDisabled` + caption "Needs a connection" in `textLink.disabledCaption` |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:textLink -->
| Token | References | Light | Dark |
|---|---|---|---|
| `textLink.fg` | `color.link` | #50576F | #C7CCDB |
| `textLink.fgPressed` | `color.link-pressed` | #3B3F52 | #E1E4EE |
| `textLink.fgDisabled` | `color.disabled-fg` | #636070 | #A8A5B3 |
| `textLink.type` | `type.label` | Geist 600 14/20 | same |
| `textLink.disabledCaption` | `type.caption` | Geist 400 13/18 | same |
| `textLink.disabledCaptionColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `textLink.underlineWidth` | — | 1 | same |
| `textLink.underlineOffset` | — | 3 | same |
| `textLink.minTarget` | `touch.min` | 48 | same |
<!-- /tokens -->

**Accessibility:**
- `accessibilityRole="link"`. External links say so: "Ingredient list source, opens in browser".
- "Feels wrong? Edit" is **left-aligned** with a 48dp hit area (judge fix: it was 44dp).

**Copy:** say where the link goes: "Read the full retention policy", not "Learn more".

**Do / Don't:**
- Do make the Pressable's own box 48dp (padding, not hitSlop).
- Don't use colour alone for inline links; underline them.
- Don't open store or policy links in a WebView.

---

## 5. Product header (editable "Is this the product?")

*Added: the /check screen requires it.*

**Purpose:** confirms which product is being checked, and lets the user correct a bad share parse.

**Anatomy:**
1. Kicker "Is this the product?" (`productHeader.kicker`, 14dp sentence case, muted). No tracked caps.
2. Product title (`productHeader.title`, Newsreader 26/32) as **plain text**. It must not look like a form field (judge fix): no box and no dashed underline.
3. Meta line (`productHeader.meta`, muted, tabular): "Illustrative example · 50 g · ₹399 on the listing".
4. **Edit** text link, visually at the top-right of the kicker row, `productHeader.editTarget` 48dp box.

**TalkBack order:** kicker, title and meta are **one header node** ("Is this the product? Velvet Rose Day Cream with Niacinamide. 50 g, 399 rupees on the listing."); Edit is a **sibling rendered after it** in the tree (absolutely positioned top-right), label "Edit product name".

**Variants:** `display` (default), `editing` (an inline text field replaces the title), `linkOnly` (no title parsed, so the field is focused on arrival).

**States:**

| State | Spec |
|---|---|
| display | as above |
| editing | `field.*`: `field.bg` fill, a 1.5dp `field.border` bottom edge, `radius.md` top. Focus: a 2dp `field.focusBorder` bottom edge. "Check again" (secondary) + "Cancel" (tertiary). |
| linkOnly | editing state on arrival, helper "We couldn't read the product name. Type it to check." (proposed) |
| loading (parsing share) | title skeleton: 2 bars of `color.bg-sunken`, radius.xs, static; label "Reading the shared link…" (proposed) |
| error (empty submit) | helper in `color.text` + `info` icon: "Type a product name to check." (proposed) |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:productHeader field -->
| Token | References | Light | Dark |
|---|---|---|---|
| `productHeader.kicker` | `type.bodySm` | Geist 400 14/20 | same |
| `productHeader.kickerColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `productHeader.title` | `type.title` | Noto Serif Display 400 26/32 | same |
| `productHeader.titleColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `productHeader.meta` | `type.caption` | Geist 400 13/18 | same |
| `productHeader.metaColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `productHeader.sourceChipBg` | `color.bg-sunken` | #EFEEF3 | #0E0F14 |
| `productHeader.sourceChipFg` | `color.text-muted` | #4B4958 | #C6C3CF |
| `productHeader.gap` | `space.1` | 4 | same |
| `productHeader.editTarget` | `touch.min` | 48 | same |
| `field.bg` | `color.surface-raised` | #FFFFFF | #20212A |
| `field.fg` | `color.text` | #1A1B23 | #EFEEF3 |
| `field.placeholder` | `color.text-subtle` | #636070 | #A8A5B3 |
| `field.border` | `color.border-strong` | #7E7B8B | same |
| `field.borderWidth` | — | 1 | same |
| `field.focusBorder` | `color.focus-ring` | #666E88 | #BEB6DE |
| `field.focusBorderWidth` | — | 2 | same |
| `field.label` | `type.label` | Geist 600 14/20 | same |
| `field.labelColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `field.value` | `type.body` | Geist 400 16/24 | same |
| `field.minHeight` | — | 56 | same |
| `field.radius` | `radius.full` | 9999 | same |
| `field.paddingX` | `space.5` | 20 | same |
| `field.trailingActionTarget` | `touch.min` | 48 | same |
<!-- /tokens -->

**Accessibility:**
- The header group is `accessibilityRole="header"`; Edit follows it as its own node.
- The field has a visible label ("Product name"), never placeholder-only. Paste is allowed.

**Copy:**
- "Is this the product?" is fixed (R §1A).
- Price is written "₹399 on the listing", never "₹399 deal".

**Do / Don't:**
- Do keep the product title in the serif.
- Don't truncate long titles; wrap them to 3 lines, then show "Show full name".

---

## 6. Verdict card

**Purpose:** frames the reasons with one of five outcomes. It is the head of /check. It is also used at reduced size in product match cards (as a tag, §27) and on the web results page.

**Anatomy:** a composite. Only part (a) is tinted.

(a) **Verdict head** (tinted) — `verdictCard.head.<s>.*`:
- `verdictCard.head.<s>.bg` fill and a **1dp tinted edge** `verdictCard.head.<s>.border` (`borderStyle` solid; **dashed** for UNKNOWN and for name-only)
- `verdictCard.head.radius` (12), `verdictCard.head.padding` (16)
- **No leading stripe or rule.** A side stripe on a rounded card is the stock alert pattern; the state is carried by the silhouette, the caps label and the tint.
- Row 1: icon at `verdictCard.head.<s>.iconSize` (24dp) + label in `verdictCard.head.label` (Commissioner 15/600 caps), both in `verdictCard.head.<s>.fg`, gap `verdictCard.head.iconGap`. **This is the only sans line in the head.**
- Row 2: the verdict sentence in `verdictCard.head.<s>.subtitle` = `type.verdictLine` (**Newsreader 20/26, weight 400**), `verdictCard.head.subtitleColor`, as one paragraph
- **Nothing else goes in the tinted area.**

(b) **Reasons section** on the plain screen surface (`color.bg`): the sentence-case heading "Why · 2 reasons" in `reasonRow.heading` (Newsreader 18), then 1–3 Reason rows (§7).

(c) **Provenance ledger** (§10), then the fixed lines.

(d) **Sticky action bar** (§3). No bottom nav: /check is a pushed detail.

**Verdict icon silhouettes.** They are distinct shapes, in `verdictCard.head.<s>.icon`, `icon.stroke` 1.75, 24dp (`icon.verdict.size`); the gate uses 32dp (`icon.verdict.medicineSize`).

| State | Icon | Shape notes |
|---|---|---|
| FITS | **seal + check** (Lucide `badge-check`) | scalloped outline; the only non-circle |
| CAUTION | **half-filled circle** (right half solid) | "partly fits"; no triangle, no "!" |
| UNKNOWN | **dashed circle + centre dot** | "incomplete information"; not "?" and not an error glyph. Head fill is warm paper (`verdict.unknown.bg` = sand), never cool slate, so it can't read as "info, tap me". |
| MEDICINE | **pharmacist at counter** (head circle r3 at 10,6.25; shoulders arc; counter line y14; counter box; drawer line; **one small bottle standing on the counter** at x18–21), from Deep Teal. Checked at 20dp. | no cross, no plus, no pill, no mortar |
| NAME-ONLY | the base state's icon + a 1dp dashed head border | the weaker check is shown by the border *and* the words |

**Variants (copy is fixed: brief §4.3).**

| Variant | Label | Subtitle | Body | Actions |
|---|---|---|---|---|
| `fits` | **FITS** | "Matches your scan on the ingredients we know about. Not a guarantee." | 1–3 reasons: reading → product fact | primary Back to product; secondary Find better matches |
| `caution` | **CAUTION** | "May not suit your readings. This is not a safety warning." | reason first, for example 01 "Your skin showed some redness in your 1 Nov scan." / "Contains fragrance (parfum), which is often flagged for skin with visible redness." | primary Find better matches; secondary Back to product |
| `nameOnly` | **FITS · based on product name only** or **CAUTION · based on product name only**. Line 1 is the caps label; line 2 is "based on product name only" in `verdictCard.nameOnly.qualifier`, as part of the label node. Dashed edge (`verdictCard.nameOnly.borderStyle`). | "We don't have this product's ingredient list, so this is a weaker check." | name keyword → reading; then "Check the full ingredient list on the product page or pack." + tertiary "Snap the ingredient list" (§7 addendum) | as the base state |
| `unknown` | **UNKNOWN** (flag `verdictCard.head.unknown.showLabel` → "NOT ENOUGH INFO" if sessions fail) | "This product isn't in our catalogue ([n] products) and its name alone isn't enough. This doesn't mean it's bad." | next steps as list rows: "Snap the ingredient list", "Check the pack", "Find products matched to your skin type" | primary Find better matches; secondary Back to product |
| `medicine` | *(no label: `verdictCard.head.medicine.showLabel` false)* | **"This looks like a medicine. Ask the pharmacist."** in `verdictCard.medicineGate.line` (Newsreader 26/32). **No box** (`verdictCard.head.medicine.borderWidth` 0, fill = screen bg). The 32dp pharmacist sits above the line (`verdictCard.medicineGate.iconGap`), about a third of the way down the content area (`verdictCard.medicineGate.offsetTopPct`). The brief allows exactly one line, so no explainer line is added (an optional bodySm line "SkinKey doesn't check medicines. A pharmacist can tell you how to use it." is parked pending research sign-off). | **nothing**: no reasons, no ledger, no better matches | Back to product only |

**States:**

| State | Spec |
|---|---|
| loading | static head skeleton (`color.bg-sunken`, `radius.lg`, no tint, no icon) + "Checking this product…"; `busy`. No shimmer loop. |
| revealed | the head fades and scales in (`motion.duration.verdictReveal`), then the reasons stagger in |
| noProfile | `nameOnly` or `unknown`, plus a prompt row **below the head** on the plain surface: "Scan for reasons based on your readings" + tertiary Start scan, rendered as a sibling node after the head (never inside the grouped head). |
| offline | catalogue verdicts render normally. Link-out buttons are disabled with the destination line "Needs a connection" (§14). |
| uv | adds a WEATHER row to the ledger. Only shown when the live Open-Meteo rule fires; never hard-coded. |
| error (parse failed) | not a verdict. Show the Product header `linkOnly` state, or the §22 error state. |
| pressed / focused | the head is **not interactive**. TalkBack focuses it as one grouped node. |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:verdictCard -->
| Token | References | Light | Dark |
|---|---|---|---|
| `verdictCard.head.radius` | `radius.lg` | 20 | same |
| `verdictCard.head.padding` | `space.5` | 20 | same |
| `verdictCard.head.gap` | `space.2` | 8 | same |
| `verdictCard.head.label` | `type.verdictLabel` | Geist 600 15/20 caps | same |
| `verdictCard.head.iconGap` | `space.3` | 12 | same |
| `verdictCard.head.subtitleColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `verdictCard.head.fits.bg` | `verdict.fits.bg` | #E2EEE8 | #1A2A25 |
| `verdictCard.head.fits.fg` | `verdict.fits.fg` | #2B5145 | #C4DDD2 |
| `verdictCard.head.fits.border` | `verdict.fits.border` | #568676 | same |
| `verdictCard.head.fits.icon` | `verdict.fits.icon` | #3D6B5C | #97C0B0 |
| `verdictCard.head.fits.iconDisc` | `color.surface-raised` | #FFFFFF | #20212A |
| `verdictCard.head.fits.iconDiscSize` | — | 40 | same |
| `verdictCard.head.fits.borderWidth` | — | 1 | same |
| `verdictCard.head.fits.borderStyle` | — | solid | same |
| `verdictCard.head.fits.showLabel` | — | true | same |
| `verdictCard.head.fits.subtitle` | `type.verdictLine` | Noto Serif Display 400 20/27 | same |
| `verdictCard.head.fits.iconSize` | `icon.verdict.size` | 24 | same |
| `verdictCard.head.caution.bg` | `verdict.caution.bg` | #F5EAD6 | #2A2317 |
| `verdictCard.head.caution.fg` | `verdict.caution.fg` | #66460C | #EDD6AE |
| `verdictCard.head.caution.border` | `verdict.caution.border` | #A57A2F | same |
| `verdictCard.head.caution.icon` | `verdict.caution.icon` | #8A6118 | #D4A65A |
| `verdictCard.head.caution.iconDisc` | `color.surface-raised` | #FFFFFF | #20212A |
| `verdictCard.head.caution.iconDiscSize` | — | 40 | same |
| `verdictCard.head.caution.borderWidth` | — | 1 | same |
| `verdictCard.head.caution.borderStyle` | — | solid | same |
| `verdictCard.head.caution.showLabel` | — | true | same |
| `verdictCard.head.caution.subtitle` | `type.verdictLine` | Noto Serif Display 400 20/27 | same |
| `verdictCard.head.caution.iconSize` | `icon.verdict.size` | 24 | same |
| `verdictCard.head.unknown.bg` | `verdict.unknown.bg` | #EFEEF3 | #20212A |
| `verdictCard.head.unknown.fg` | `verdict.unknown.fg` | #2F3243 | #C7CCDB |
| `verdictCard.head.unknown.border` | `verdict.unknown.border` | #666E88 | #848CA5 |
| `verdictCard.head.unknown.icon` | `verdict.unknown.icon` | #50576F | #A6ADC2 |
| `verdictCard.head.unknown.iconDisc` | `color.surface-raised` | #FFFFFF | #20212A |
| `verdictCard.head.unknown.iconDiscSize` | — | 40 | same |
| `verdictCard.head.unknown.borderWidth` | — | 1 | same |
| `verdictCard.head.unknown.borderStyle` | — | dashed | same |
| `verdictCard.head.unknown.showLabel` | — | true | same |
| `verdictCard.head.unknown.subtitle` | `type.verdictLine` | Noto Serif Display 400 20/27 | same |
| `verdictCard.head.unknown.iconSize` | `icon.verdict.size` | 24 | same |
| `verdictCard.head.medicine.bg` | `verdict.medicine.bg` | #F6F5F8 | #121319 |
| `verdictCard.head.medicine.fg` | `verdict.medicine.fg` | #1A1B23 | #EFEEF3 |
| `verdictCard.head.medicine.border` | `verdict.medicine.border` | #1A1B23 | #C6C3CF |
| `verdictCard.head.medicine.icon` | `verdict.medicine.icon` | #1A1B23 | #EFEEF3 |
| `verdictCard.head.medicine.iconDisc` | — | transparent | same |
| `verdictCard.head.medicine.iconDiscSize` | — | 0 | same |
| `verdictCard.head.medicine.borderWidth` | — | 0 | same |
| `verdictCard.head.medicine.borderStyle` | — | solid | same |
| `verdictCard.head.medicine.showLabel` | — | false | same |
| `verdictCard.head.medicine.subtitle` | `type.title` | Noto Serif Display 400 26/32 | same |
| `verdictCard.head.medicine.iconSize` | `icon.verdict.medicineSize` | 32 | same |
| `verdictCard.medicineGate.offsetTopPct` | — | 28 | same |
| `verdictCard.medicineGate.iconGap` | `space.4` | 16 | same |
| `verdictCard.medicineGate.line` | `type.title` | Noto Serif Display 400 26/32 | same |
| `verdictCard.medicineGate.lineColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `verdictCard.nameOnly.borderStyle` | — | dashed | same |
| `verdictCard.nameOnly.qualifier` | `type.label` | Geist 600 14/20 | same |
| `verdictCard.nameOnly.qualifierColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `verdictCard.demoBadge.bg` | `color.accent-warm` | #CFC4BB | #4A4038 |
| `verdictCard.demoBadge.fg` | `color.on-accent-warm` | #4A4038 | #E4DCD5 |
| `verdictCard.demoBadge.type` | `type.labelSm` | Geist 600 13/16 | same |
| `verdictCard.demoBadge.radius` | `radius.full` | 9999 | same |
| `verdictCard.demoBadge.paddingX` | `space.3` | 12 | same |
| `verdictCard.demoBadge.visualMinHeight` | — | 24 | same |
| `verdictCard.body.bg` | — | transparent | same |
| `verdictCard.sectionGap` | `space.7` | 28 | same |
<!-- /tokens -->

**Accessibility:**
- Full /check TalkBack order: **back → product header group → Edit → verdict head → "Why · 2 reasons" heading → reasons → ledger (each row's text, then its link) → fixed lines → disclosure → sticky actions** (brief §5.5). The sticky bar is rendered after the ScrollView in JSX. "Why · 2 reasons" has `accessibilityRole="header"` so heading navigation works (brief §8).
- The head is one node (`accessible`), `accessibilityRole="header"`. Its label is "Caution. May not suit your readings. This is not a safety warning." The icon is decorative.
- Medicine: "This looks like a medicine. Ask the pharmacist."
- Name only: "Fits, based on product name only. We don't have this product's ingredient list, so this is a weaker check."
- When loading ends, call `AccessibilityInfo.setAccessibilityFocus(verdictHeadRef)` so TalkBack lands on the head and carries on in reading order. Do not use `announceForAccessibility` (deprecated on Android 16, API 36).
- The label never truncates. At 200% the label and the "based on product name only" line wrap.

**Copy rules:**
- Use the §4.3 strings exactly.
- The subtitle is **one unit** (judge fix 6).
- Never write: safe, unsafe, harmful, allergic, avoid, warning (outside the fixed "not a safety warning"), "perfect match", or "guaranteed".
- Medicine: one line, no additions.

**Motion and haptics:**
- Reveal: `motion.duration.verdictReveal`, `motion.ease.decelerate`, scale from `motion.enter.scaleFrom`.
- One `CONTEXT_CLICK` when the head lands, **the same for every state**.
- Reduce motion: a 120ms crossfade, no scale.

**Do / Don't:**
- Do keep the tint inside the head.
- Don't add a side stripe; it is the stock alert pattern.
- Do let the reasons out-size the label.
- Do show the catalogue count in UNKNOWN.
- Don't tint the screen, the reasons, the app bar or the buttons.
- Don't use red, a triangle or a shield.
- Don't show reasons or better matches under the medicine gate.
- Don't animate CAUTION differently from FITS.

**Web (results / fallback page):** same anatomy, as `<section aria-labelledby>`. The head is a `<header>` with an `<h2>` label. Same CSS tokens.

---

## 7. Reason row (numbered serif)

**Purpose:** the main content of /check. It ties one of the user's readings to one product fact.

**Anatomy:** a 2-column grid (index `reasonRow.indexWidth` 32 | content), padding `reasonRow.paddingY` vertical, with a hairline `reasonRow.divider` bottom.
1. Index "01" (`reasonRow.index`, Newsreader italic 18, muted, tabular)
2. **Reading line** (`reasonRow.reading` = `type.reason`, **Newsreader 19/26 weight 500**, `color.text`). Weight 500 so it leads the fact despite Commissioner's large x-height.
3. **Product fact** (`reasonRow.fact` = `type.body`, Commissioner 16/400, **`reasonRow.factColor` full text colour**), only `reasonRow.factGap` (6dp) below the reading so each reason reads as one unit. It names the ingredient *and* says in plain words why it matters.
4. A reading band chip (§8, compact), `reasonRow.chipGap` above

**Variants:**

| Variant | Reading line | Fact |
|---|---|---|
| `catalogue` (default) | moment phrasing (build default, brief §7): "Your skin looked oily in your 1 Nov scan." | "Contains isopropyl myristate, which can clog pores." |
| `templateB` (A/B flag) | "Your oiliness reading: HIGH (scan 1 Nov)" | same |
| `nameOnly` | as above | "The name mentions [keyword]." (proposed) + the fixed line "Check the full ingredient list on the product page or pack." in the verdict body |
| `uv` | "UV is high today in [city]." (proposed) | links to the reading; the ledger gains a WEATHER row |
| `fitsPositive` | as above | for example "Oil-free gel texture, listed as non-comedogenic by the brand." (proposed; facts must be catalogue-sourced) |

**States:**

| State | Spec |
|---|---|
| default | as above |
| entering | opacity + translateY `motion.enter.translate`→0, staggered `motion.duration.reasonStagger` |
| expanded (optional "Why this matters") | tertiary link; reveals a `type.body` explanation in place |
| focused | focus ring around the row (if expandable) |
| loading | not shown; reasons arrive with the verdict |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:reasonRow -->
| Token | References | Light | Dark |
|---|---|---|---|
| `reasonRow.heading` | `type.section` | Geist 600 17/24 | same |
| `reasonRow.headingColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `reasonRow.index` | `type.reasonIndex` | Geist 500 15/22 tabular | same |
| `reasonRow.indexColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `reasonRow.indexWidth` | — | 28 | same |
| `reasonRow.reading` | `type.reason` | Geist 500 18/26 | same |
| `reasonRow.readingColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `reasonRow.fact` | `type.body` | Geist 400 16/24 | same |
| `reasonRow.factColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `reasonRow.factGap` | — | 6 | same |
| `reasonRow.chipGap` | `space.3` | 12 | same |
| `reasonRow.paddingY` | `space.4` | 16 | same |
| `reasonRow.bg` | `elevation.1.surface` | #FFFFFF | #1A1B23 |
| `reasonRow.radius` | `radius.lg` | 20 | same |
| `reasonRow.paddingX` | `space.4` | 16 | same |
| `reasonRow.divider` | `color.border` | #DCDAE3 | #30313C |
<!-- /tokens -->

**Accessibility:**
- One node per reason: "Reason 1 of 2. Your skin looked oily in your 1 Nov scan. Contains isopropyl myristate, which can clog pores. Oiliness reading: high." The index text and the meter are hidden from TalkBack.
- Never truncated. 1–3 reasons only.

**Copy rules:**
- Talk about readings, never the person: never "You have oily skin" or "Your skin is…".
- Appearance words only ("looks oily", "visible redness").
- Ingredients are *flagged, not predicted*: never "will irritate" or "will break you out".
- Use "1 Nov" date style, and keep the word "scan" in the date reference.

**Motion and haptics:** stagger as above. No haptic. Reduce motion: a 120ms crossfade with all rows together.

**Do / Don't:**
- Do put the reading first and the fact second.
- Do set the fact in full text colour at 16dp.
- Don't add more than 3 reasons.
- Don't use the verdict tint behind rows.
- Don't show raw scores.

---

## 8. Reading band chip + meter

**Purpose:** shows one reading as a band (LOW / MEDIUM / HIGH). The text is the information; the meter is a visual echo.

**Anatomy, compact chip (reason rows, match cards):**
- `bandChip.bg`, `bandChip.radius`, `bandChip.visualMinHeight` 32 (it is not a target)
- Text "Oiliness · High" (`bandChip.type`, `bandChip.fg`; the "·" in `bandChip.separatorColor`)
- A trailing **horizontal 3-segment meter**: segments `bandChip.meter.segmentWidth` × `bandChip.meter.segmentHeight` (10 × 6), gap `bandChip.meter.segmentGap` 3, `bandChip.meter.segmentRadius`. Filled = `bandChip.meter.filled` (neutral ink). Empty = a **full-opacity 1dp `bandChip.meter.emptyStroke` outline** (≥ 3:1).

**Anatomy, band list (/profile)** — `bandList.*`, set like the dispensing-label ledger:
- One legend above the list, right-aligned, in `bandList.legend`: three mini meters with "Low · Medium · High". It replaces the 7 repeated scale labels of v1.0.
- A `bandList.topRule` (1.5dp ink) and `bandList.bottomRule`, hairline `bandList.rowDivider` between rows.
- One row per band, `bandList.rowMinHeight` 56: band name on the left in `bandList.name` (Commissioner 16), band word on the right in `bandList.value` (**Newsreader 18**), with the neutral meter under the word (`bandList.meterGap`).
- At ≥ `bandList.stackAtFontScale` the word and meter wrap under the name.

**Variants:**

| Variant | Use | Size |
|---|---|---|
| `compact` | inside a reason row or match card, non-interactive | visual 32dp |
| `list` | the /profile band list (`bandList.*`) | row 56dp |
| `interactive` | opens the band explainer sheet (enabled if U3 fails). A Pressable whose own box is `bandChip.target` (48dp) around the 32dp visual. | 48dp target |
| `selfReported` | adds the tag "self-reported, not measured" (§27) | |

**States:**

| State | Spec |
|---|---|
| default | as above |
| pressed (interactive) | `color.state.pressed` |
| focused (interactive) | focus ring, radius.sm + 2 |
| stale (scan older than 30 days, ASSUMPTION) | caption "Scan [date]" stays visible. No colour change. |
| noData | "Pores · Not measured" (proposed), word in `bandChip.noData.valueColor`, all segments empty (`bandChip.noData.filledSegments` 0) |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:bandChip bandList -->
| Token | References | Light | Dark |
|---|---|---|---|
| `bandChip.bg` | `color.bg-sunken` | #EFEEF3 | #0E0F14 |
| `bandChip.fg` | `color.text` | #1A1B23 | #EFEEF3 |
| `bandChip.radius` | `radius.full` | 9999 | same |
| `bandChip.paddingX` | `space.3` | 12 | same |
| `bandChip.visualMinHeight` | — | 32 | same |
| `bandChip.type` | `type.label` | Geist 600 14/20 | same |
| `bandChip.separatorColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `bandChip.bgPressed` | `color.state.pressed` | rgba(26, 27, 35, 0.08) | rgba(239, 238, 243, 0.10) |
| `bandChip.target` | `touch.min` | 48 | same |
| `bandChip.meter.orientation` | — | horizontal | same |
| `bandChip.meter.segments` | — | 3 | same |
| `bandChip.meter.segmentWidth` | — | 10 | same |
| `bandChip.meter.segmentHeight` | — | 6 | same |
| `bandChip.meter.segmentGap` | — | 3 | same |
| `bandChip.meter.segmentRadius` | `radius.xs` | 2 | same |
| `bandChip.meter.filled` | `meter.filled` | #272832 | #E7E5EC |
| `bandChip.meter.emptyStroke` | `meter.empty` | #7E7B8B | same |
| `bandChip.meter.emptyStrokeWidth` | — | 1 | same |
| `bandChip.meter.emptyFill` | — | transparent | same |
| `bandChip.meter.label` | `type.caption` | Geist 400 13/18 | same |
| `bandChip.meter.labelColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `bandChip.noData.valueColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `bandChip.noData.filledSegments` | — | 0 | same |
| `bandList.topRule` | `color.border` | #DCDAE3 | #30313C |
| `bandList.topRuleWidth` | — | 1 | same |
| `bandList.bottomRule` | `color.border` | #DCDAE3 | #30313C |
| `bandList.bottomRuleWidth` | — | 1 | same |
| `bandList.rowMinHeight` | — | 56 | same |
| `bandList.rowPaddingY` | `space.2` | 8 | same |
| `bandList.rowDivider` | `color.border` | #DCDAE3 | #30313C |
| `bandList.name` | `type.body` | Geist 400 16/24 | same |
| `bandList.nameColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `bandList.value` | `type.bodyStrong` | Geist 600 16/24 | same |
| `bandList.valueColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `bandList.meterGap` | `space.1` | 4 | same |
| `bandList.legend` | `type.caption` | Geist 400 13/18 | same |
| `bandList.legendColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `bandList.stackAtFontScale` | — | 1.5 | same |
<!-- /tokens -->

**Accessibility:**
- Label: "Oiliness reading: high." The meter is `importantForAccessibility="no"` because it duplicates the text.
- TalkBack reads the band list row by row, in a fixed order: oiliness, moisture, redness, acne (label per open decision), pores, texture, radiance.
- No skin-colour swatch, ever.

**Copy:**
- Bands only. No numbers, no "skin age", no "/100".
- The concern name follows the open team decision ("Acne reading" or "Visible blemishes reading").

**Motion and haptics:** none. The meter is static.

**Do / Don't:**
- Do draw the meter in neutral ink.
- Do keep empty segments visible (≥ 3:1).
- Don't use the accent, the verdict colours or a traffic-light ramp.
- Don't animate the fill.

---

## 9. Skin-map overlay frame (photo-free zone diagram)

**Purpose:** shows *where* on the face a reading came from, using zone data derived from YouCam masks, **without any photo or skin colour**.

> **ASSUMPTION / UNVERIFIED:** this needs YouCam masks to give per-zone values. Masks are turned into zone bands in the proxy and then discarded with the task. Cut this component if zone data isn't available.

**Anatomy:**
- Section head "Readings by zone" (`skinMap.heading`, Newsreader 18) with a **48dp icon-only list toggle** at the trailing edge (`skinMap.listToggleTarget`, `list` icon, label "Show as list"). It replaced v1.0's "WHERE READINGS CAME FROM · Show as list" row, which overflowed a 350dp column.
- Above the frame, a concern selector (`segmented.*`): the 7 readings, scrollable, each `segmented.minHeight` 48; selected = `segmented.selectedBg` + check icon.
- A frame on `skinMap.bg`, `skinMap.radius`, padding `skinMap.padding`, 1dp `skinMap.border`.
- A **line-art egg face**: wider brow, a jaw taper to the chin, no neck, no hair, no realistic features (two faint brow strokes and a mouth line only). Stroke `skinMap.faceStrokeWidth` 1.25 in `skinMap.faceOutline`.
- **5 zones** outlined in `skinMap.zoneStroke` at `skinMap.zoneStrokeWidth`: a curved forehead band; a T-zone nose that joins the forehead; two soft teardrop cheeks along the cheekbone; a crescent chin. **Band = hatch density, never fill lightness:** none = Low, single 45° hatch at `skinMap.hatchSpacingMedium` = Medium, cross-hatch at `skinMap.hatchSpacingHigh` = High, strokes `skinMap.hatchWidth` in `skinMap.hatch` (per-mode neutral ink, gated at 3:1 on the frame).
- **Every zone has a text row** in the list beside the drawing (same top-to-bottom order): "Forehead · High", "Nose · High", "Your left cheek · Medium", "Your right cheek · Medium", "Chin · Low". The diagram is **mirrored like a selfie**, so cheeks are "Your left / Your right" and the list never contradicts the drawing.
- A legend row of three swatches + "Low · Medium · High" (`skinMap.legend`).
- A caption: "Zones from your [date] scan · mirrored like a selfie · no photo kept" (proposed).

**Variants:** `profile` (with selector), `processing` (one reading, shown once before "Done", never saved), `compact` (in a reason row expansion, one zone set).

**States:**

| State | Spec |
|---|---|
| default | the selected concern's zones |
| switching | hatch crossfades over `motion.duration.state` |
| noZoneData | the frame shows the face outline + "Zone detail isn't available for this reading." (proposed) |
| listView | the icon toggle swaps the drawing for list rows (§26) "Forehead · High"; its label becomes "Show as diagram" |
| focused (segment) | focus ring |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:skinMap segmented -->
| Token | References | Light | Dark |
|---|---|---|---|
| `skinMap.bg` | `color.surface` | #FCFBFD | #1A1B23 |
| `skinMap.radius` | `radius.lg` | 20 | same |
| `skinMap.padding` | `space.4` | 16 | same |
| `skinMap.border` | `color.border` | #DCDAE3 | #30313C |
| `skinMap.heading` | `type.section` | Geist 600 17/24 | same |
| `skinMap.listToggleTarget` | `touch.min` | 48 | same |
| `skinMap.faceOutline` | `color.border-strong` | #7E7B8B | same |
| `skinMap.faceStrokeWidth` | — | 1.5 | same |
| `skinMap.zoneStroke` | `color.text` | #1A1B23 | #EFEEF3 |
| `skinMap.zoneStrokeWidth` | — | 1.5 | same |
| `skinMap.hatch` | `meter.filled` | #272832 | #E7E5EC |
| `skinMap.hatchWidth` | — | 1 | same |
| `skinMap.hatchSpacingMedium` | — | 6 | same |
| `skinMap.hatchSpacingHigh` | — | 5 | same |
| `skinMap.label` | `type.caption` | Geist 400 13/18 | same |
| `skinMap.labelColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `skinMap.legend` | `type.caption` | Geist 400 13/18 | same |
| `skinMap.legendColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `segmented.minHeight` | `touch.min` | 48 | same |
| `segmented.track` | `color.bg-sunken` | #EFEEF3 | #0E0F14 |
| `segmented.border` | `color.border-strong` | #7E7B8B | same |
| `segmented.borderWidth` | — | 0 | same |
| `segmented.radius` | `radius.full` | 9999 | same |
| `segmented.fg` | `color.text-muted` | #4B4958 | #C6C3CF |
| `segmented.type` | `type.label` | Geist 600 14/20 | same |
| `segmented.selectedBg` | `color.surface-raised` | #FFFFFF | #20212A |
| `segmented.selectedFg` | `color.text` | #1A1B23 | #EFEEF3 |
| `segmented.selectedIcon` | — | check | same |
| `segmented.bgPressed` | `color.state.pressed` | rgba(26, 27, 35, 0.08) | rgba(239, 238, 243, 0.10) |
<!-- /tokens -->

**Accessibility:**
- The diagram is `accessibilityRole="image"`, with a full text alternative: "Oiliness reading by zone: forehead high, nose high, cheeks medium, chin low."
- "Show as list" is always available.
- Segments are `accessibilityRole="tab"` with `selected` state.

**Copy:**
- Zone names only. Appearance words. Never "problem areas" or "trouble zones".

**Motion and haptics:** a 200ms crossfade on switch. `CLOCK_TICK` on segment change is optional; the default is none.

**Do / Don't:**
- Do keep it schematic and gender-neutral (an egg, not a mask: no straight neck lines, no rectangle zones).
- Don't use hatch anywhere else in the product; hatch means skin-map band.
- Don't render a photo, a skin-tone fill or a red–yellow heatmap.
- Don't show numbers or zone percentages.
- Don't draw a realistic face.

---

## 10. Provenance ledger ("Where this comes from")

**Purpose:** visible proof of sources and limits. It is laid out like a **dispensing label** (taken from Deep Teal).

**Anatomy:**
- No fill. It sits on `color.bg`.
- A **1.5dp ink top rule** (`provenanceLedger.topRule`, `provenanceLedger.topRuleWidth`), then the title "Where this comes from" (`provenanceLedger.title`, Newsreader 20).
- Rows are a 2-column grid: **key column `provenanceLedger.keyWidth` (72dp)** with small-caps keys (`provenanceLedger.key` = `type.overline`, 13dp caps, muted), then values (`provenanceLedger.value` 14/20 in `color.text` + `provenanceLedger.caption` muted sub-line). Hairline `provenanceLedger.rowDivider` between rows, `provenanceLedger.rowPaddingY` vertical padding.
- A **1.5dp ink bottom rule** (`provenanceLedger.bottomRule`) closes the label.
- **Links in a row are their own row**: the "Ingredient list source" link sits on its own line under the PRODUCT text, aligned to the value column, as a sibling node with a 48dp box.
- Below the ledger, the two fixed lines in `type.caption`, muted.

**Variants:** `check` (full), `profile` (SKIN + LIMITS only), `web` (same as `<dl>`), `pharmacistView` (SKIN + LIMITS + "Shared by the user for 30 minutes", proposed).

**States:**

| State | Spec |
|---|---|
| default | as above |
| stacked (≥ `provenanceLedger.stackAtFontScale`, or below `provenanceLedger.stackBelowWidth`) | each key sits above its value, full width |
| link pressed / focused | per §4 |
| offline | the external source link is disabled + "Needs a connection" |
| hidden | under the medicine gate |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:provenanceLedger -->
| Token | References | Light | Dark |
|---|---|---|---|
| `provenanceLedger.title` | `type.headline` | Geist 600 20/26 | same |
| `provenanceLedger.titleColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `provenanceLedger.bg` | `elevation.1.surface` | #FFFFFF | #1A1B23 |
| `provenanceLedger.radius` | `radius.lg` | 20 | same |
| `provenanceLedger.paddingX` | `space.4` | 16 | same |
| `provenanceLedger.topRule` | `color.border` | #DCDAE3 | #30313C |
| `provenanceLedger.topRuleWidth` | — | 1 | same |
| `provenanceLedger.bottomRule` | `color.border` | #DCDAE3 | #30313C |
| `provenanceLedger.bottomRuleWidth` | — | 1 | same |
| `provenanceLedger.rowDivider` | `color.border` | #DCDAE3 | #30313C |
| `provenanceLedger.rowPaddingY` | `space.3` | 12 | same |
| `provenanceLedger.key` | `type.overline` | Geist 600 13/18 | same |
| `provenanceLedger.keyColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `provenanceLedger.keyWidth` | — | 96 | same |
| `provenanceLedger.keyGap` | `space.4` | 16 | same |
| `provenanceLedger.value` | `type.bodySm` | Geist 400 14/20 | same |
| `provenanceLedger.valueColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `provenanceLedger.mono` | `type.caption` | Geist 400 13/18 | same |
| `provenanceLedger.caption` | `type.caption` | Geist 400 13/18 | same |
| `provenanceLedger.captionColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `provenanceLedger.keys` | — | Reading / Product / Rules / Limits | same |
| `provenanceLedger.stackBelowWidth` | — | 360 | same |
| `provenanceLedger.stackAtFontScale` | — | 1.5 | same |
<!-- /tokens -->

**Accessibility:**
- The title is `accessibilityRole="header"`. Each row's **text** is one node: "Skin: Measured by YouCam Skin Analysis, 1 Nov. Photo deleted, score bands only." A link in a row is a separate node after it (grouping would make it unreachable on Android).
- Web: `<section aria-labelledby>` + `<dl>`, `<dt>` / `<dd>`.

**Copy:**
- Fixed strings exactly.
- "Measured by YouCam Skin Analysis, 1 Nov" stays on **one line at 1.0×** (judge fix). The key column width is set so it fits at 360dp width; at larger font it may wrap.

**Motion and haptics:** enters with the reasons stagger (last item). No haptic.

**Do / Don't:**
- Do treat it as proof, set at a readable size.
- Don't collapse it behind "Details".
- Don't put grain behind it.
- Don't drop LIMITS (the Accuracy note).

---

## 11. Consent sheet

**Purpose:** explicit, specific, revocable consent (DPDP) before any new data act: the first scan, the pharmacist share, the tint photo.

**Anatomy:**
1. **The privacy sentence, exactly as approved**, as one paragraph and one TalkBack block. Its first clause "SkinKey stores no photo;" is set in `consentSheet.privacyLead` (Newsreader 26/32) on its own line; the rest "YouCam processes it and we delete it from YouCam right after." in `consentSheet.privacyRest` (Commissioner 16). Same words and punctuation, so the promise lands first without rewriting R-approved copy. (Nested Text for styling only is fine in RN; it carries no action.)
2. A "What we keep" box: `consentSheet.keepBox.*` with a sentence-case `consentSheet.keepBox.title` (Newsreader 18) + `consentSheet.keepList`
3. Accuracy note (`consentSheet.accuracyNote`, muted, `info` 16dp)
4. An "I'm 18 or older" checkbox row, **unticked** (first scan only): `consentSheet.checkbox.*`, 24dp box in a 48dp row, **no row fill** when checked (`consentSheet.checkbox.rowBg`)
5. A retention policy link
6. `button.consentPair` buttons, side by side (stacked at ≥ 1.3×)

No screen-level overline ("Before the camera opens" is gone).

**Variants:**

| Variant | Body | Buttons |
|---|---|---|
| `firstScan` (full screen, /onboarding/consent) | privacy line: "SkinKey stores no photo; YouCam processes it and we delete it from YouCam right after." What we keep: "We keep on this phone only: skin type, 7 score bands (oiliness, moisture, redness, acne, pores, texture, radiance) and the scan date". Accuracy note. Optional qualifier (flag, T1): "…we ask YouCam to delete it as soon as your results arrive. If something goes wrong, YouCam's own limit is 24 hours." | Start scan / Not now |
| `pharmacistShare` (bottom sheet) | "What the pharmacist will see" preview: a band chip grid (`profile`), "No photo. No skin colour." (proposed), "Expires after 30 minutes. You can revoke it." (proposed) | Create QR / Not now |
| `tintPhoto` (bottom sheet) | "This needs a second photo." (proposed) + the privacy line + "Preview, not a shade guarantee" | Take photo / Not now |

**States:**

| State | Spec |
|---|---|
| default | Start scan disabled until 18+ is ticked; helper "Tick to confirm you're 18 or older." (proposed) |
| ready | 18+ ticked; Start scan enabled |
| offline | Start scan disabled + inline note "You need a connection to scan" (not hidden) |
| loading | Start scan → "Opening camera…" (proposed) |
| declined | Not now → home in no-profile mode, with no penalty copy |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:consentSheet -->
| Token | References | Light | Dark |
|---|---|---|---|
| `consentSheet.privacyLead` | `type.bodyStrong` | Geist 600 16/24 | same |
| `consentSheet.privacyRest` | `type.body` | Geist 400 16/24 | same |
| `consentSheet.privacyColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `consentSheet.keepBox.bg` | `elevation.1.surface` | #FFFFFF | #1A1B23 |
| `consentSheet.keepBox.border` | `color.border` | #DCDAE3 | #30313C |
| `consentSheet.keepBox.radius` | `radius.lg` | 20 | same |
| `consentSheet.keepBox.padding` | `space.5` | 20 | same |
| `consentSheet.keepBox.title` | `type.section` | Geist 600 17/24 | same |
| `consentSheet.keepList` | `type.body` | Geist 400 16/24 | same |
| `consentSheet.keepIcon` | — | check-circle | same |
| `consentSheet.dropIcon` | — | minus-circle | same |
| `consentSheet.accuracyNote` | `type.bodySm` | Geist 400 14/20 | same |
| `consentSheet.accuracyColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `consentSheet.checkbox.size` | — | 24 | same |
| `consentSheet.checkbox.target` | `touch.min` | 48 | same |
| `consentSheet.checkbox.border` | `color.border-strong` | #7E7B8B | same |
| `consentSheet.checkbox.checked` | `color.accent` | #3B3F52 | #F6F5F8 |
| `consentSheet.checkbox.check` | `color.on-accent` | #F6F5F8 | #2F3243 |
| `consentSheet.checkbox.preTicked` | — | false | same |
| `consentSheet.checkbox.rowBg` | — | transparent | same |
<!-- /tokens -->

**Accessibility:**
- TalkBack reads the privacy sentence as one block.
- The checkbox is a native `accessibilityRole="checkbox"` with `checked` state, and the 48dp row is the target.
- At 200% font, Not now stays on screen (buttons stack; the body scrolls above the sticky pair).
- No pre-ticked boxes.
- The retention policy link goes to /about.

**Copy:**
- Fixed strings exactly.
- Never "nothing leaves your phone" and never "100% private".
- No guilt copy on Not now.

**Motion and haptics:**
- Sheet variants use the §25 motion. Full screen uses the screen transition.
- Checkbox: `TOGGLE_ON` / `TOGGLE_OFF`.

**Do / Don't:**
- Do show this before the camera permission prompt.
- Do give both buttons equal weight.
- Don't bundle consents.
- Don't hide Not now below the fold.
- Don't use dark patterns (a greyed Not now, or a countdown).

---

## 12. Capture guide (oval + hints)

**Purpose:** helps the user take a usable photo. The guide is static; there is no live face detection.

**Anatomy:**
- Full-bleed camera. (Design files use a soft radial vignette as the camera stand-in, never flat grey blocks.)
- A `captureGuide.overlay` mask with an **oval cut-out** (`captureGuide.ovalWidthPct` 72% wide, `captureGuide.ovalAspect` 0.78) and a `captureGuide.ovalStrokeWidth` 2dp `captureGuide.oval` stroke.
- **One instruction line** above the oval, one line at 14/600 (`captureGuide.instruction`): "Fill the oval with your face".
- **One hint at a time** below the oval in a pill (`captureGuide.hint.*`, `visualMinHeight` 40, kept `captureGuide.hint.insetX` 16dp from the edges): "More light", "Look straight ahead", "Move closer". The hint replaces itself; tips never stack edge to edge.
- The bottom bar: shutter `captureGuide.shutter.size` 72 (ring `captureGuide.shutter.ringWidth`), plus 48dp flip-camera and Tips icon buttons (`captureGuide.iconButtonTarget`) on `captureGuide.iconButtonBg`.
- Focus over the camera uses `captureGuide.focus` (white ring + 1dp dark halo).

**Variants:** `selfie` (default), `tintPhoto` (same guide, with the tag "Preview, not a shade guarantee").

**States:**

| State | Spec |
|---|---|
| default | tips visible |
| hint | a mapped YouCam error code shows one hint: "Move closer", "More light", "Look straight ahead" (proposed). It replaces the tip stack and is announced. |
| capturing | the shutter inner disc scales to 0.9 for 120ms. The preview freezes. |
| review | the photo is shown with "Use photo" (primary) / "Retake" (tertiary) |
| permissionDenied | no camera. Show an empty state (§22) "SkinKey needs the camera to take one photo for YouCam to analyse." (proposed) + primary "Open settings" + tertiary "Not now". |
| disabled (offline) | the shutter is disabled + "You need a connection to scan" |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:captureGuide -->
| Token | References | Light | Dark |
|---|---|---|---|
| `captureGuide.overlay` | `color.overlay-camera` | rgba(14, 15, 20, 0.62) | same |
| `captureGuide.oval` | `color.on-overlay` | #FFFFFF | same |
| `captureGuide.ovalStrokeWidth` | — | 1.5 | same |
| `captureGuide.ovalWidthPct` | — | 72 | same |
| `captureGuide.ovalAspect` | — | 0.78 | same |
| `captureGuide.bracket` | `color.on-overlay` | #FFFFFF | same |
| `captureGuide.bracketWidth` | — | 3 | same |
| `captureGuide.bracketLength` | — | 28 | same |
| `captureGuide.frameRadius` | `radius.xl` | 24 | same |
| `captureGuide.instruction` | `type.label` | Geist 600 14/20 | same |
| `captureGuide.instructionColor` | `color.on-overlay` | #FFFFFF | same |
| `captureGuide.hint.bg` | `color.overlay-camera` | rgba(14, 15, 20, 0.62) | same |
| `captureGuide.hint.fg` | `color.on-overlay` | #FFFFFF | same |
| `captureGuide.hint.type` | `type.bodyStrong` | Geist 600 16/24 | same |
| `captureGuide.hint.radius` | `radius.full` | 9999 | same |
| `captureGuide.hint.paddingX` | `space.4` | 16 | same |
| `captureGuide.hint.visualMinHeight` | — | 40 | same |
| `captureGuide.hint.insetX` | `space.4` | 16 | same |
| `captureGuide.hint.interactive` | — | false | same |
| `captureGuide.shutter.size` | — | 72 | same |
| `captureGuide.shutter.ring` | `color.on-overlay` | #FFFFFF | same |
| `captureGuide.shutter.ringWidth` | — | 3 | same |
| `captureGuide.shutter.fill` | `color.on-overlay` | #FFFFFF | same |
| `captureGuide.iconButtonTarget` | `touch.min` | 48 | same |
| `captureGuide.iconButtonBg` | `color.overlay-camera` | rgba(14, 15, 20, 0.62) | same |
| `captureGuide.focus` | `color.focus-ring-overlay` | #FFFFFF | same |
<!-- /tokens -->

**Accessibility:**
- The shutter label is "Take photo".
- **Volume keys fire the shutter on a single press** (either key). Both keys together is the TalkBack shortcut, so never require both.
- No face detection, so give a spoken framing hint on entry (`captureGuide.$spokenHint`): "Hold the phone at eye level, about an arm's length away."
- Each hint change is written to the screen's single hidden live region.
- No flash is required.
- The image is resized to at most 4096px on the long side before upload.

**Copy:**
- Instruction: "Fill the oval with your face". Hints, one at a time: "Look straight ahead", "More light" (proposed wording of the brief's three tips).
- **Never** ask users to remove a hijab, turban, bindi, glasses, beard or makeup.

**Motion and haptics:**
- `CONTEXT_CLICK` on capture.
- No pulsing oval.
- Reduce motion: no shutter scale.

**Do / Don't:**
- Do keep the oval static and calm.
- Don't show a face-detected green tick; we can't detect faces.
- Don't show beauty filters.

---

## 13. Processing stepper (with the visible deletion step)

**Purpose:** an honest progress list, with no bare spinner. The deletion step is proof of P2.

**Anatomy:**
- A vertical list of 4 steps, each `processingStepper.rowMinHeight` (56).
- Each step has a 24dp status glyph, a label (`type.body`) and an optional sub-line (`type.caption` muted).
- A `processingStepper.connectorWidth` connector: `processingStepper.connector` until the step is done, then `processingStepper.connectorDone`.
- **Neutral ink only, never the accent** (lint-enforced).
- The steps, as fixed in the brief: **Uploading → Analysing → Deleting photo from YouCam ✓ → Done**.

Status glyphs avoid every verdict silhouette. Pending and active rings hold the **step numeral**, so the active glyph can't be mistaken for the UNKNOWN dashed circle + dot.

| Step state | Glyph |
|---|---|
| pending | `processingStepper.pending.ring` 1.5dp ring with the numeral in `processingStepper.pending.numeralColor` |
| active | `processingStepper.current.ring` 2dp ring with the numeral in `processingStepper.current.numeral` (static) |
| done | `processingStepper.done.fill` disc + check in `processingStepper.done.check` |
| failed | `processingStepper.failed.ring` ring + a `processingStepper.failed.bar` "–" bar |

**Variants:** `scan` (4 steps), `tint` (Uploading → Making preview → Deleting from YouCam → Done, proposed), `demo` (cached demo profile; caption "Demo profile" tag).

**States:**

| State | Spec |
|---|---|
| inProgress | the active step label is in `color.text` 600. After 15s, the sub-line reads "Still working. This can take up to a minute." (proposed; the time is an ASSUMPTION). |
| deleting | the sub-line reads "Asking YouCam to delete your photo" (proposed) |
| done | step 3 label becomes "Photo deleted from YouCam" + check. Hold 600ms, then route to /profile. |
| deleteFailed | step 3 shows the failed glyph + sub-line: the qualifier "If something goes wrong, YouCam's own limit is 24 hours." **Only in this state.** |
| failed / timeout | primary "Try again" (once), then tertiary "Try later" only. The proxy still calls `task/delete`. |
| offline mid-scan | the step fails + "You're offline. Your photo wasn't kept by SkinKey." (proposed; check against the architecture) + "Try later" |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:processingStepper -->
| Token | References | Light | Dark |
|---|---|---|---|
| `processingStepper.rowMinHeight` | — | 56 | same |
| `processingStepper.indicator` | — | 24 | same |
| `processingStepper.connector` | `color.border-strong` | #7E7B8B | same |
| `processingStepper.connectorDone` | `color.text` | #1A1B23 | #EFEEF3 |
| `processingStepper.connectorWidth` | — | 1.5 | same |
| `processingStepper.done.fill` | `color.text` | #1A1B23 | #EFEEF3 |
| `processingStepper.done.check` | `color.bg` | #F6F5F8 | #121319 |
| `processingStepper.done.label` | `type.body` | Geist 400 16/24 | same |
| `processingStepper.done.labelColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `processingStepper.current.ring` | `color.text` | #1A1B23 | #EFEEF3 |
| `processingStepper.current.ringWidth` | — | 1.5 | same |
| `processingStepper.current.numeral` | `type.labelSm` | Geist 600 13/16 | same |
| `processingStepper.current.numeralColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `processingStepper.current.label` | `type.bodyStrong` | Geist 600 16/24 | same |
| `processingStepper.current.labelColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `processingStepper.pending.ring` | `color.border-strong` | #7E7B8B | same |
| `processingStepper.pending.ringWidth` | — | 1.5 | same |
| `processingStepper.pending.numeral` | `type.labelSm` | Geist 600 13/16 | same |
| `processingStepper.pending.numeralColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `processingStepper.pending.label` | `type.body` | Geist 400 16/24 | same |
| `processingStepper.pending.labelColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `processingStepper.failed.ring` | `color.text` | #1A1B23 | #EFEEF3 |
| `processingStepper.failed.ringWidth` | — | 1.5 | same |
| `processingStepper.failed.bar` | `color.text` | #1A1B23 | #EFEEF3 |
| `processingStepper.failed.label` | `type.bodyStrong` | Geist 600 16/24 | same |
| `processingStepper.failed.labelColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `processingStepper.deletedStep.label` | `type.bodyStrong` | Geist 600 16/24 | same |
| `processingStepper.deletedStep.caption` | `type.caption` | Geist 400 13/18 | same |
| `processingStepper.deletedStep.captionColor` | `color.text-muted` | #4B4958 | #C6C3CF |
<!-- /tokens -->

**Accessibility:**
- The list is **not** a live region (TalkBack would re-read every child on each change). The screen's one hidden polite live region gets a single sentence per change: "Step 3 of 4, deleting photo from YouCam." then "Photo deleted from YouCam."
- Progress is never colour-only: there is a glyph and the text changes too.

**Copy:** the step labels are exact. Never "Securely deleting…" or "AI magic…".

**Motion and haptics:**
- The check draws in over `motion.duration.state` per step.
- `CONFIRM` once on Done.
- Reduce motion: static ticks swap in, with no draw.

**Do / Don't:**
- Do show the deletion as its own step.
- Don't use a looping spinner or an indeterminate bar.
- Don't fake progress percentages.
- Don't skip step 3 on fast runs.

---

## 14. Store link-out button (with destination line)

**Purpose:** leaves SkinKey for a store and says exactly where the link goes *before* the tap (P6).

**Anatomy:**
- A button (`primary` or `secondary`, §3).
- A trailing `arrow-up-right` 20dp.
- Below the button, a **destination line** (`storeLinkOut.destination`, `storeLinkOut.destinationColor`, centred, `storeLinkOut.destinationGap`), with a leading `search` 16dp icon.
- Only store-search link-outs carry the line. "Back to product" carries none (it explains itself).

**Variants and destination copy:**

| Variant | Label | Destination line |
|---|---|---|
| `betterMatchesFlipkart` | Find better matches | "Opens a Flipkart search, filtered to [Oily Skin]" (fixed pattern) |
| `betterMatchesAmazon` | Find better matches | "Opens an Amazon keyword search for "[keywords]"" (proposed, following the "Amazon keyword search" rule) |
| `betterMatchesNykaa` | Find better matches | "Opens a Nykaa keyword search for "[keywords]"" (proposed) |
| `backToProduct` | Back to product | none |
| `matchCard` | (card row, §19) | "Opens a Flipkart search for this product" (proposed) |

**States:**

| State | Spec |
|---|---|
| default | as the button variant |
| pressed / focused | §3 |
| offline | disabled; the destination line becomes "Needs a connection" in `storeLinkOut.destinationDisabledColor` (proposed, per brief §5.5) |
| filterUnverified | if gate G3 shows that the app drops the filter, the line says "Opens a Flipkart search for [Oily Skin]" (no "filtered") |
| loading | label "Opening…" up to 1s, then hand off |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:storeLinkOut -->
| Token | References | Light | Dark |
|---|---|---|---|
| `storeLinkOut.label` | `type.button` | Geist 600 16/20 | same |
| `storeLinkOut.destination` | `type.caption` | Geist 400 13/18 | same |
| `storeLinkOut.destinationColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `storeLinkOut.destinationDisabledColor` | `color.disabled-fg` | #636070 | #A8A5B3 |
| `storeLinkOut.destinationGap` | `space.1` | 4 | same |
| `storeLinkOut.icon` | — | arrow-up-right | same |
| `storeLinkOut.iconColor` | `color.text-muted` | #4B4958 | #C6C3CF |
<!-- /tokens -->

**Accessibility:** the label merges the button and the destination: "Find better matches. Opens a Flipkart search, filtered to Oily Skin. Leaves SkinKey."

**Copy:**
- Text-only store names. No logos, ratings or reviews.
- Never "deep-links into Flipkart" or "inside Flipkart".
- Never "Buy" or "Best price".

**Motion and haptics:** none extra. The system handles app switching.

**Do / Don't:**
- Do name the filter.
- Do open the store app or a Chrome Custom Tab.
- Don't use a WebView.
- Don't hide the destination in a tooltip.

---

## 15. "Ranked by fit / commission" disclosure

**Purpose:** says plainly how matches are ordered and how money works.

**Anatomy:**
- An inline note: a `rankingDisclosure.ruleWidth` `rankingDisclosure.rule` leading rule, padding `rankingDisclosure.paddingY` / `rankingDisclosure.paddingX`.
- Lines in `rankingDisclosure.type` (14dp), `rankingDisclosure.color` (full text colour). Never muted fine print (lint-enforced).
- An optional link "How ranking works" → /about.

**Variants:**

| Variant | Lines | Placement |
|---|---|---|
| `app` | "Ranked by fit to your skin. No paid placements." | above the match list, before the first card |
| `web` | "Ranked by fit to your skin. No paid placements." + "We may earn a commission; it never changes the ranking." | at the **top** of the web fallback page, above the results (Q11) |

The commission line appears **only on surfaces that carry affiliate tags**. There are no affiliate links in the app without Amazon approval (brief §5.10). Both lines must stay true; if the ranking logic changes, the copy changes the same day.

**States:**

| State | Spec |
|---|---|
| default | as above |
| link focused | focus ring |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:rankingDisclosure -->
| Token | References | Light | Dark |
|---|---|---|---|
| `rankingDisclosure.type` | `type.bodySm` | Geist 400 14/20 | same |
| `rankingDisclosure.color` | `color.text` | #1A1B23 | #EFEEF3 |
| `rankingDisclosure.rule` | `color.border-strong` | #7E7B8B | same |
| `rankingDisclosure.ruleWidth` | — | 1 | same |
| `rankingDisclosure.paddingY` | `space.3` | 12 | same |
| `rankingDisclosure.paddingX` | `space.3` | 12 | same |
| `rankingDisclosure.copy` | — | Ranked by fit to your readings. No paid placements. / We may earn a commission if you buy; it never changes the ranking | same |
<!-- /tokens -->

**Accessibility:**
- Read before the list (DOM / TalkBack order).
- Web: `<aside aria-label="How results are ranked">`.

**Copy:** exact strings. Never "Sponsored", "Featured" or "Top pick".

**Do / Don't:**
- Do keep it visible at the top.
- Don't move it into a footer or a tooltip.
- Don't use grey fine print below 14dp.

---

## 16. Share-sheet teaching card

**Purpose:** teaches the main entry point: **Share → SkinKey** from the store app.

**Anatomy:**
- A card (`shareTeachingCard.bg`, 1dp `shareTeachingCard.border`, `shareTeachingCard.radius`, padding `shareTeachingCard.padding`, `elevation.1`).
- An illustration panel (`shareTeachingCard.illustrationBg`, `radius.md`; **the paper grain is shown here**, the static 3% tile, light only — `texture.grain.allowed`). It shows a generic, store-agnostic share sheet with the "SkinKey" tile outlined `shareTeachingCard.highlightWidth` in `shareTeachingCard.highlight`. There are no store logos and no real app icons except our own.
- A title (`type.headline`).
- A 3-step numbered list (`type.reasonIndex` numerals + `type.body`).
- Actions: primary "Got it", tertiary "Paste a link instead".

**Variants:** `firstRun` (onboarding step "Find SkinKey in your share menu", with a sentence-case "Step 2 of 3" caption, no overline), `homeHero` (**the hero of home**: the same illustration, then "In Flipkart, tap Share → SkinKey" in `type.headline`; Paste a link is the secondary below it and Scan in store the tertiary; the top-right chip reads "Your scan · 1 Nov" with no person glyph), `pasteEqual` (if U1 / T2 / H5 fails, paste-a-link is shown at equal weight as a `secondary` button).

**States:**

| State | Spec |
|---|---|
| default | as above |
| dismissed | gone for good (stored); still reachable from /about "How to check a product" |
| pressed / focused (actions) | §3 |
| clipboardFound | a row "Use the copied link?" (proposed) + "Check it" (secondary). **Only after** the user opens the app; ask once per link. |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:shareTeachingCard -->
| Token | References | Light | Dark |
|---|---|---|---|
| `shareTeachingCard.bg` | `elevation.1.surface` | #FFFFFF | #1A1B23 |
| `shareTeachingCard.border` | `color.border` | #DCDAE3 | #30313C |
| `shareTeachingCard.radius` | `radius.lg` | 20 | same |
| `shareTeachingCard.padding` | `space.4` | 16 | same |
| `shareTeachingCard.stepIndex` | `type.reasonIndex` | Geist 500 15/22 tabular | same |
| `shareTeachingCard.stepIndexColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `shareTeachingCard.body` | `type.body` | Geist 400 16/24 | same |
| `shareTeachingCard.title` | `type.section` | Geist 600 17/24 | same |
| `shareTeachingCard.illustrationBg` | `color.bg-sunken` | #EFEEF3 | #0E0F14 |
| `shareTeachingCard.illustrationStroke` | `color.border-strong` | #7E7B8B | same |
| `shareTeachingCard.highlight` | `color.accent` | #3B3F52 | #F6F5F8 |
| `shareTeachingCard.highlightWidth` | — | 2 | same |
| `shareTeachingCard.grain` | — | false | same |
<!-- /tokens -->

**Accessibility:**
- The illustration is `accessibilityRole="image"`, label "Share menu with SkinKey highlighted".
- Steps are read as text. The card title is a heading.

**Copy:**
- "In Flipkart, tap Share → SkinKey" and "Find SkinKey in your share menu" are exact.
- Steps (proposed): "01 Open the product in Flipkart", "02 Tap Share", "03 Pick SkinKey".

**Motion and haptics:** enter 320ms. No looping hand animation.

**Do / Don't:**
- Do show the real Android share pattern.
- Don't draw the Flipkart logo or UI chrome.
- Don't auto-rotate tips.

---

## 17. Forecast card

**Purpose:** a live, sourced weather nudge tied to the user's readings. It is optional and 5th on the cut list.

**Anatomy:**
- A card (`forecastCard.bg`, 1dp `forecastCard.border`, `forecastCard.radius`, padding `forecastCard.padding`).
- Kicker "Skin forecast · [city]" in sentence case (`forecastCard.kicker`, 14/600 muted, `sun` 16dp). No tracked caps.
- The main sentence (`forecastCard.figure`, Newsreader 20): "UV high today in [city]".
- A supporting line (`type.body`): "Humidity 78%. Your skin looked oily in your 1 Nov scan." (proposed; tabular numerals).
- Credit (`forecastCard.credit` = `type.fine` 12dp, the one data-credit use of the floor): "Weather: Open-Meteo (CC BY 4.0)" + "Updated 9:00" (proposed).
- An optional tertiary "Check a sunscreen" (proposed).

**Variants:** `uv`, `humidity`, `calm` ("UV low today in [city]").

**States:**

| State | Spec |
|---|---|
| loading | static skeleton lines (`color.bg-sunken`) |
| default | as above |
| noLocation | the card shows "Add location for a daily UV and humidity note." (proposed) + tertiary "Add location" |
| offline | **hidden** |
| cut / licence not cleared | not rendered |
| stale (> 6h) | "Updated [time]" stays; refresh on focus |
| pressed / focused | the whole card is not pressable; only the tertiary button is |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:forecastCard -->
| Token | References | Light | Dark |
|---|---|---|---|
| `forecastCard.bg` | `elevation.1.surface` | #FFFFFF | #1A1B23 |
| `forecastCard.border` | `color.border` | #DCDAE3 | #30313C |
| `forecastCard.radius` | `radius.lg` | 20 | same |
| `forecastCard.padding` | `space.4` | 16 | same |
| `forecastCard.kicker` | `type.label` | Geist 600 14/20 | same |
| `forecastCard.kickerColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `forecastCard.figure` | `type.headline` | Geist 600 20/26 | same |
| `forecastCard.figureColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `forecastCard.body` | `type.body` | Geist 400 16/24 | same |
| `forecastCard.credit` | `type.fine` | Geist 400 12/16 | same |
| `forecastCard.creditColor` | `color.text-muted` | #4B4958 | #C6C3CF |
<!-- /tokens -->

**Accessibility:**
- Group **only the text** (kicker, sentence, body, credit) as one node: "Skin forecast, Pune. UV high today in Pune. Humidity 78 percent. Weather: Open-Meteo." "Check a sunscreen" is a sibling node after the group, so TalkBack can reach it.
- No auto-rotating content.

**Copy:** never "protect", "prevent damage" or "dangerous UV". Describe conditions and link them to readings.

**Motion and haptics:** none.

**Do / Don't:**
- Do credit the source every time.
- Don't hard-code a UV message.
- Don't use the CAUTION ochre for high UV.

---

## 18. Tinted try-on comparison (split preview)

**Purpose:** a preview of a tinted product on the user's second photo (F3b, gate G5).

**Anatomy:**
- An image frame (`tryOnCompare.radius`, 4:5, 1dp `tryOnCompare.frameBorder`).
- **Split view**: left "Without", right "With tint". A vertical `tryOnCompare.dividerWidth` `tryOnCompare.divider` line with a 1dp `tryOnCompare.dividerHalo` either side, so it reads over light and dark photos; a 48dp handle (`tryOnCompare.handleBg` / `tryOnCompare.handleFg`) with a 2dp `tryOnCompare.handleRing`.
- Corner badges (`tryOnCompare.badge.*`): "Without" / "With tint".
- **A permanent caption bar attached to the bottom edge of the frame**: "Preview, not a shade guarantee" (`tryOnCompare.disclaimer` on `tryOnCompare.disclaimerBg`). Never over the photo.
- A view switcher (`segmented.*`): "Without · Split · With tint", each 48dp.
- A note (`tryOnCompare.note`, muted): "This preview is deleted from YouCam when you leave." (proposed; it must match `task/delete` behaviour).
- Design files use a neutral warm-grey placeholder plate with a real ~13% warm overlay (`tryOnCompare.previewTintOpacity`) on the tinted half. **Never hatch**: hatch means skin-map band only.

**Variants:** `split` (default), `toggle` (single image + switcher only, for small screens and reduced motion).

**States:**

| State | Spec |
|---|---|
| consentNeeded | the entry point opens Consent `tintPhoto` (§11) |
| processing | Processing stepper `tint` variant |
| ready | split at 50% |
| dragging | the handle shows the focus ring; the divider follows the finger; `SEGMENT_TICK` at 0/50/100% |
| failed | §22 error: "We couldn't make a preview." (proposed) + "Try again" / "Not now" |
| deleted / left | the image is cleared from memory; returning needs a new photo |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:tryOnCompare -->
| Token | References | Light | Dark |
|---|---|---|---|
| `tryOnCompare.radius` | `radius.lg` | 20 | same |
| `tryOnCompare.frameBorder` | `color.border` | #DCDAE3 | #30313C |
| `tryOnCompare.divider` | `color.on-overlay` | #FFFFFF | same |
| `tryOnCompare.dividerWidth` | — | 2 | same |
| `tryOnCompare.dividerHalo` | `color.overlay-halo` | rgba(14, 15, 20, 0.60) | same |
| `tryOnCompare.dividerHaloWidth` | — | 1 | same |
| `tryOnCompare.handle` | `touch.min` | 48 | same |
| `tryOnCompare.handleBg` | `color.inverse-surface` | #20212A | #E7E5EC |
| `tryOnCompare.handleFg` | `color.inverse-text` | #EFEEF3 | #1A1B23 |
| `tryOnCompare.handleRing` | `color.on-overlay` | #FFFFFF | same |
| `tryOnCompare.handleRingWidth` | — | 2 | same |
| `tryOnCompare.badge.bg` | `color.overlay-camera` | rgba(14, 15, 20, 0.62) | same |
| `tryOnCompare.badge.fg` | `color.on-overlay` | #FFFFFF | same |
| `tryOnCompare.badge.type` | `type.labelSm` | Geist 600 13/16 | same |
| `tryOnCompare.badge.radius` | `radius.full` | 9999 | same |
| `tryOnCompare.disclaimer` | `type.label` | Geist 600 14/20 | same |
| `tryOnCompare.disclaimerColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `tryOnCompare.disclaimerBg` | `color.surface` | #FCFBFD | #1A1B23 |
| `tryOnCompare.note` | `type.caption` | Geist 400 13/18 | same |
| `tryOnCompare.noteColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `tryOnCompare.focus` | `color.focus-ring-overlay` | #FFFFFF | same |
| `tryOnCompare.previewTintOpacity` | — | 0.13 | same |
<!-- /tokens -->

**Accessibility:**
- **Dragging is never the only path.** The segmented switcher does the same thing.
- The handle is `accessibilityRole="adjustable"` with `accessibilityValue={{min:0,max:100,now}}` and increment / decrement actions (10% steps). Label "Comparison divider" (the value is spoken from `accessibilityValue`, not baked into the label). Focus uses `tryOnCompare.focus`.
- The image label is "Your photo with tint preview" (no skin-tone description).

**Copy:**
- "Preview, not a shade guarantee" is always visible.
- Never "no white cast", "perfect shade", "glow", "brightening" or "before/after".
- Use "Without" / "With tint".

**Motion and haptics:**
- The divider follows the finger directly.
- `SEGMENT_TICK` at detents.
- Reduce motion: open in `toggle` variant.

**Do / Don't:**
- Do use a separate consent and delete afterwards.
- Don't save or share the output.
- Don't place the comparison on /profile.

---

## 19. Product match card (better matches)

**Purpose:** one ranked alternative from the catalogue, with its reason.

**Anatomy:**
- A card (`productMatchCard.bg`, 1dp `productMatchCard.border`, `productMatchCard.radius`, padding `productMatchCard.padding`), list gap `productMatchCard.listGap`.
- Rank index "01" (`type.reasonIndex`).
- Product name (`type.headline`, up to 3 lines).
- Meta (`type.caption`, muted, tabular): "50 ml · ₹349 on the listing".
- A FITS tag (§27, `verdict` variant: seal icon 16dp + "FITS").
- **One reason line** (`productMatchCard.fit`, `productMatchCard.fitColor`).
- A band chip (`compact`).
- A divider.
- The link-out row: label "See it in Flipkart search" (proposed, `textLink.type`, `textLink.fg`) + `arrow-up-right` + the destination line.

**Variants:** `catalogue` (default), `nameOnly` (tag "Name only" + weaker reason), `compact` (no reason, for horizontal lists; **not used on /check**).

**States:**

| State | Spec |
|---|---|
| default | as above |
| pressed | the whole card is pressable (one target, ≥ 48dp tall), with `color.state.pressed` + scale 0.98 |
| focused | focus ring, radius.lg + 2 |
| offline | the link row is disabled + "Needs a connection"; the card content stays readable |
| outOfStock / unknown availability | not shown. We don't know stock. |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:productMatchCard -->
| Token | References | Light | Dark |
|---|---|---|---|
| `productMatchCard.bg` | `elevation.1.surface` | #FFFFFF | #1A1B23 |
| `productMatchCard.border` | `color.border` | #DCDAE3 | #30313C |
| `productMatchCard.radius` | `radius.lg` | 20 | same |
| `productMatchCard.padding` | `space.4` | 16 | same |
| `productMatchCard.index` | `type.reasonIndex` | Geist 500 15/22 tabular | same |
| `productMatchCard.indexColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `productMatchCard.name` | `type.bodyStrong` | Geist 600 16/24 | same |
| `productMatchCard.nameColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `productMatchCard.fit` | `type.bodySm` | Geist 400 14/20 | same |
| `productMatchCard.fitColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `productMatchCard.meta` | `type.caption` | Geist 400 13/18 | same |
| `productMatchCard.metaColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `productMatchCard.thumbBg` | `color.bg-sunken` | #EFEEF3 | #0E0F14 |
| `productMatchCard.thumbRadius` | `radius.md` | 14 | same |
| `productMatchCard.thumbSize` | — | 56 | same |
| `productMatchCard.heroBg` | `color.sheen.lavender` | #ECE8F4 | #24222F |
| `productMatchCard.verdictTagIcon` | `icon.sm` | 16 | same |
| `productMatchCard.minHeight` | — | 96 | same |
| `productMatchCard.listGap` | `space.3` | 12 | same |
<!-- /tokens -->

**Accessibility:** one node: "Match 1. Minimalist Oil-Free Moisturiser. Fits. Oil-free gel, listed as non-comedogenic. Opens a Flipkart search for this product." Role `link`.

**Copy:**
- No ratings, stars, review counts, "Bestseller", "Sponsored" or store logos.
- Price is "on the listing".
- **Disclosure (§15) above the list.**

**Motion and haptics:** stagger 60ms on first render. No haptic.

**Do / Don't:**
- Do show why each match fits.
- Don't rank by price or commission.
- Don't show a CAUTION item as a "better match".

---

## 20. Barcode scanner frame

**Purpose:** Aisle Check. It finds a product by barcode in-store.

**Anatomy:**
- A full-bleed camera with a `barcodeFrame.overlay` mask (design files: a soft vignette stand-in, never flat grey blocks).
- A **rectangular window** (`barcodeFrame.window.width` × `barcodeFrame.window.height`) with four `barcodeFrame.cornerLength` corner brackets (`barcodeFrame.cornerWidth` `barcodeFrame.corner`).
- Hint text above the window (`barcodeFrame.hint`, `barcodeFrame.hintColor`): "Point at the barcode" (proposed).
- A bottom bar with a torch toggle (`barcodeFrame.torch` 48dp, labelled; focus `barcodeFrame.focus`) + **"Type the barcode"** (secondary on `color.overlay-camera`, always visible).

**Variants:** `camera` (default), `manual` (no camera: a field with a numeric keypad + "Check" primary).

**States:**

| State | Spec |
|---|---|
| scanning | brackets static (no laser line, no sweep) |
| detected | the brackets close in 4dp over 200ms; `CONFIRM` haptic; announce "Barcode found. Checking."; route to /check (catalogue / OBF / UNKNOWN / medicine gate) |
| lowLight | hint "More light, or turn on the torch" (proposed) |
| torchOn | the icon is filled; label "Torch, on" (`accessibilityState.checked`) |
| permissionDenied | `manual` variant + note "Camera is off. You can type the barcode." (proposed) |
| offline | catalogue-only; note "Open Beauty Facts lookup needs a connection." (proposed) |
| invalid entry | inline helper "Barcodes have 8 or 13 digits." (proposed) + `REJECT` haptic |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:barcodeFrame -->
| Token | References | Light | Dark |
|---|---|---|---|
| `barcodeFrame.overlay` | `color.overlay-camera` | rgba(14, 15, 20, 0.62) | same |
| `barcodeFrame.corner` | `color.on-overlay` | #FFFFFF | same |
| `barcodeFrame.cornerWidth` | — | 3 | same |
| `barcodeFrame.cornerLength` | — | 24 | same |
| `barcodeFrame.radius` | `radius.xl` | 24 | same |
| `barcodeFrame.window.width` | — | 280 | same |
| `barcodeFrame.window.height` | — | 160 | same |
| `barcodeFrame.hint` | `type.bodyStrong` | Geist 600 16/24 | same |
| `barcodeFrame.hintColor` | `color.on-overlay` | #FFFFFF | same |
| `barcodeFrame.torch` | `touch.min` | 48 | same |
| `barcodeFrame.focus` | `color.focus-ring-overlay` | #FFFFFF | same |
<!-- /tokens -->

**Accessibility:**
- Manual entry can be reached without the camera, and is first in TalkBack order when the camera is denied.
- Detection is announced.
- The torch toggle is labelled.

**Copy:** results show the source "Open Beauty Facts (ODbL)" in the ledger. A missing result is UNKNOWN, never "Error".

**Motion and haptics:**
- `CONFIRM` on detection.
- Reduce motion: no bracket close.

**Do / Don't:**
- Do treat the medicine gate as critical here.
- Don't use a red laser line or beeps.
- Don't auto-open a store.

---

## 21. QR share card (countdown + revoke)

**Purpose:** lets a pharmacist see the user's bands for 30 minutes, with a revoke option.

**Anatomy:**
- A card (`qrShareCard.bg`, 1dp `qrShareCard.border`, `qrShareCard.radius`, padding `qrShareCard.padding`).
- A title (`type.headline`): "Show this to the pharmacist" (proposed).
- The **QR** (≥ 220dp, `color.qr.module` on `color.qr.field`, 16dp quiet zone, inside a 1dp `color.border` frame, radius.md).
- A countdown (`qrShareCard.countdown` = `type.figure`, Newsreader 26 with tabular figures): "29 min left" (proposed format; update each minute, and each second only under 60s *visually*).
- A summary line (`type.bodySm`): "Shows score bands only. No photo." (proposed).
- A text alternative: tertiary "Copy link".
- **Revoke**: `destructiveNeutral`, full width, 52dp.

**Variants:** `app` (owner view), `webPharmacist` (the web page the QR opens: the ledger `pharmacistView` + the band grid + "Expires at [time]" + "Cosmetic guidance, not medical advice."; no actions).

**States:**

| State | Spec |
|---|---|
| creating | QR skeleton + "Creating…"; `busy` |
| active | as above; brightness raised to max (`expo-brightness`), restored on leave; keep the screen awake |
| expiringSoon (< 5 min) | the countdown stays `color.text` (**no colour shift, no ochre**); one announcement |
| expired | the QR is replaced by a `qrShareCard.expired.placeholderBg` square + "This QR has expired." (`qrShareCard.expired.message`, proposed) + primary "Create a new QR" |
| revoking | Revoke → "Revoking…" |
| revoked | "Revoked. The link can keep working for up to a minute." (proposed; **never promise "instant"**); `CONFIRM` haptic |
| offline / error | "The QR page needs a connection." (proposed) + "Try again" |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:qrShareCard -->
| Token | References | Light | Dark |
|---|---|---|---|
| `qrShareCard.bg` | `elevation.1.surface` | #FFFFFF | #1A1B23 |
| `qrShareCard.border` | `color.border` | #DCDAE3 | #30313C |
| `qrShareCard.radius` | `radius.lg` | 20 | same |
| `qrShareCard.padding` | `space.5` | 20 | same |
| `qrShareCard.title` | `type.headline` | Geist 600 20/26 | same |
| `qrShareCard.qrModule` | `color.qr.module` | #000000 | same |
| `qrShareCard.qrField` | `color.qr.field` | #FFFFFF | same |
| `qrShareCard.qrSize` | — | 240 | same |
| `qrShareCard.quietZone` | — | 16 | same |
| `qrShareCard.countdown` | `type.figure` | Noto Serif Display 400 26/32 tabular | same |
| `qrShareCard.countdownColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `qrShareCard.countdownLabel` | `type.caption` | Geist 400 13/18 | same |
| `qrShareCard.countdownLabelColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `qrShareCard.timeRule.filled` | `meter.filled` | #272832 | #E7E5EC |
| `qrShareCard.timeRule.track` | `color.border` | #DCDAE3 | #30313C |
| `qrShareCard.timeRule.height` | — | 4 | same |
| `qrShareCard.summary` | `type.bodySm` | Geist 400 14/20 | same |
| `qrShareCard.summaryColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `qrShareCard.expired.placeholderBg` | `color.bg-sunken` | #EFEEF3 | #0E0F14 |
| `qrShareCard.expired.message` | `type.body` | Geist 400 16/24 | same |
| `qrShareCard.expired.messageColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `qrShareCard.brightnessBoost` | — | true | same |
<!-- /tokens -->

**Accessibility:**
- The QR is an image, label "QR code for your shared bands".
- The visible countdown is **never** a live region. The screen's hidden live region speaks **at 25, 20, 15, 10, 5 and 1 minutes only** (`motion.timing.qrAnnounceEverySec`, `motion.timing.qrFinalAnnounceSec`).
- Revoke is large and clearly labelled "Revoke pharmacist access".
- "Copy link" is the non-visual alternative.

**Copy:** "30 minutes", "Revoke". Show no scores, no photo and no skin colour.

**Motion and haptics:**
- The countdown digits swap without animation.
- `CONFIRM` on revoked.
- **No haptic on ticks.**

**Do / Don't:**
- Do keep the countdown calm; it is the one allowed timer.
- Don't turn it red or ochre near expiry.
- Don't hide Revoke in a menu.

---

## 22. Empty, error and offline states

**Purpose:** designed, calm states that always offer a next step.

**Anatomy:**
- **Left-aligned** in the content column (`stateView.align` start). No centred stack, no icon disc.
- A title sentence in `stateView.title` (Newsreader 20) that carries a real detail, e.g. "No better matches in our catalogue yet."
- A body (`stateView.body`, muted) with the honest count: "14 products checked by hand. We add more each week."
- One **tertiary** action (`stateView.$action`), flush-left with the text.
- An illustration plate is optional (the only place besides the share illustration where grain may appear).
- **Offline banner** (`stateView.offlineBanner.*`): a list-row style line, `cloud-off` 20dp + text in `stateView.offlineBanner.type`, a hairline `stateView.offlineBanner.border` under it. Not a tinted slab.

**Variants (copy):**

| Variant | Icon (inline, 20dp, optional) | Title / body | Actions |
|---|---|---|---|
| `noProfile` | `scan-face` line | "No profile yet" / "You can still check products by name. Scan for reasons based on your readings." (body proposed) | Start scan · Check a product |
| `profileDeleted` | `check` | "No profile yet" / "Your readings were deleted from this phone." (proposed) | Start scan |
| `offlineScan` | `cloud-off` | "You need a connection to scan" | (button disabled, not hidden) |
| `offlineBanner` (inline, top of content) | `cloud-off` 20dp | "You're offline. Catalogue checks still work." (proposed) | none |
| `error` | `info` | "Something went wrong" / "Try again in a moment." (proposed) | Try again → (2nd failure) Try later |
| `permissionCamera` / `permissionLocation` | `camera-off` / `map-pin-off` | why it's needed, one sentence | Open settings · Not now |
| `noMatches` | none | "No better matches in our catalogue yet." / "[n] products checked by hand. We add more each week." (proposed) | tertiary Back to product |

*UNKNOWN is **not** an empty or error state. It uses the Verdict card (§6).*

**States:** default; action pressed / focused / loading per §3.

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:stateView -->
| Token | References | Light | Dark |
|---|---|---|---|
| `stateView.align` | — | start | same |
| `stateView.title` | `type.title` | Noto Serif Display 400 26/32 | same |
| `stateView.titleColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `stateView.body` | `type.body` | Geist 400 16/24 | same |
| `stateView.bodyColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `stateView.plateBg` | `color.sheen.lavender` | #ECE8F4 | #24222F |
| `stateView.plateRadius` | `radius.lg` | 20 | same |
| `stateView.gap` | `space.2` | 8 | same |
| `stateView.offlineBanner.bg` | — | transparent | same |
| `stateView.offlineBanner.fg` | `color.text` | #1A1B23 | #EFEEF3 |
| `stateView.offlineBanner.border` | `color.border` | #DCDAE3 | #30313C |
| `stateView.offlineBanner.type` | `type.bodySm` | Geist 400 14/20 | same |
| `stateView.offlineBanner.icon` | — | cloud-off | same |
| `stateView.offlineBanner.iconColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `stateView.offlineBanner.minHeight` | — | 48 | same |
| `stateView.fieldInvalid.border` | `color.text` | #1A1B23 | #EFEEF3 |
| `stateView.fieldInvalid.borderWidth` | — | 2 | same |
| `stateView.fieldInvalid.message` | `type.caption` | Geist 400 13/18 | same |
| `stateView.fieldInvalid.messageColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `stateView.fieldInvalid.icon` | — | info | same |
<!-- /tokens -->

**Accessibility:**
- The title is a heading.
- Banners are a live region polite when they appear.
- Actions keep 48dp targets.

**Copy:**
- No blame, no "Oops", no exclamation marks, no error codes in the UI.
- Say what still works.

**Motion and haptics:** enter crossfade 200ms; no haptic.

**Do / Don't:**
- Do keep disabled actions visible with the reason.
- Don't use red, triangles or sad faces.
- Don't style UNKNOWN as an error.

---

## 23. Toasts and snackbars

**Purpose:** brief, non-critical confirmation (M3 snackbar).

**Anatomy:**
- `snackbar.bg`, `snackbar.radius`, padding `snackbar.paddingX`, elevation 3, `snackbar.minHeight` 48.
- Text in `type.bodySm` `color.inverse-text`, up to 2 lines.
- An optional action (`snackbar.actionType`, `snackbar.action`, `snackbar.actionTarget` 48dp box). Its focus ring is `snackbar.focus` (`color.focus-ring-inverse`): the normal ring disappears on the inverse surface (2.27:1 light / 1.41:1 dark).
- It sits above the bottom nav or the sticky action bar, `space.3` gutter.

**Variants:** `info` ("Link copied", "Profile deleted"), `withAction` ("Couldn't open Flipkart." + "Try again", proposed).

**States:**

| State | Spec |
|---|---|
| entering | translateY 8dp + opacity, 320ms |
| visible | `motion.timing.snackbarMs` (4s), or `motion.timing.snackbarWithActionMs` (10s) with an action, both passed through `AccessibilityInfo.getRecommendedTimeoutMillis` on Android. While TalkBack is on, a snackbar with an action stays until dismissed. |
| exiting | opacity 200ms, exit easing |
| action pressed / focused | overlay / focus ring |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:snackbar -->
| Token | References | Light | Dark |
|---|---|---|---|
| `snackbar.bg` | `color.inverse-surface` | #20212A | #E7E5EC |
| `snackbar.fg` | `color.inverse-text` | #EFEEF3 | #1A1B23 |
| `snackbar.action` | `color.inverse-link` | #DDD8EE | #50576F |
| `snackbar.actionType` | `type.label` | Geist 600 14/20 | same |
| `snackbar.actionTarget` | `touch.min` | 48 | same |
| `snackbar.focus` | `color.focus-ring-inverse` | #BEB6DE | #50576F |
| `snackbar.type` | `type.bodySm` | Geist 400 14/20 | same |
| `snackbar.radius` | `radius.md` | 14 | same |
| `snackbar.minHeight` | — | 48 | same |
| `snackbar.paddingX` | `space.4` | 16 | same |
| `snackbar.elevation` | — | 3 | same |
| `snackbar.z` | `z.snackbar` | 50 | same |
<!-- /tokens -->

**Accessibility:**
- Announced as a polite live region. Never the only place critical information appears: revoked, deleted and offline status are also shown on screen.
- Never covers the primary action.

**Copy:**
- Past tense and short. "Profile deleted" has **no Undo**, because deletion is immediate (P2).

**Motion and haptics:**
- 320ms in, 200ms out.
- No haptic of its own; the triggering action owns the haptic.

**Do / Don't:**
- Do use snackbars sparingly.
- Don't stack them.
- Don't use them for verdicts, consent or errors that block the user.

---

## 24. Bottom navigation (3 items)

**Purpose:** top-level destinations (M3 navigation bar).

**Where:** top-level screens only: home (Check) and /profile. **Hidden** on pushed details (/check incl. the medicine gate, better matches, try-on, QR share) and during onboarding, camera, capture and processing. M3: a screen never shows a back arrow and a selected tab together.

**Anatomy:**
- Container: `bottomNav.bg`, 1dp top `bottomNav.border`, `bottomNav.minHeight` 80 + gesture inset (min, so labels can wrap at 2.0×).
- 3 equal items: a 24dp icon in a 64 × 32dp indicator pill (`bottomNav.indicator.*`), and a label below.

| Item | Icon | Label | Route |
|---|---|---|---|
| 1 | `tag` (a product label) | Check | `/` home |
| 2 | `scan-barcode` | Aisle | `/scan` (Aisle Check) |
| 3 | `user-round` (neutral) | Profile | `/profile` |

The scan metaphor lives on one tab only (v1.0 had Check with a face-scan glyph next to Scan with a barcode).

**States:**

| State | Spec |
|---|---|
| default | icon `bottomNav.iconInactive` at `bottomNav.iconInactiveStrokeWidth`; label `bottomNav.labelInactive` (13/400) in `bottomNav.labelInactiveColor` |
| selected | pill `bottomNav.indicator.bg` (`color.accent-subtle`, dark = ink.700 so it reads on the bar); icon `bottomNav.iconActive` at `bottomNav.iconActiveStrokeWidth` 2.25; label `bottomNav.labelActive` (13/**600**) in `bottomNav.labelActiveColor`. Selection = pill + weight + stroke + colour; **never colour alone** (lint-enforced). |
| pressed | ripple inside the indicator |
| focused | focus ring around the item (≥ 48 × 48) |
| hidden | on pushed details and during onboarding, camera, capture and processing |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:bottomNav -->
| Token | References | Light | Dark |
|---|---|---|---|
| `bottomNav.minHeight` | — | 72 | same |
| `bottomNav.bg` | `elevation.2.surface` | #FFFFFF | #20212A |
| `bottomNav.border` | `color.border` | #DCDAE3 | #30313C |
| `bottomNav.sheenEdge` | `color.sheen-edge` | rgba(255, 255, 255, 0.00) | rgba(239, 238, 243, 0.07) |
| `bottomNav.items` | — | 3 | same |
| `bottomNav.itemMinWidth` | — | 72 | same |
| `bottomNav.itemTarget` | `touch.min` | 48 | same |
| `bottomNav.indicator.bg` | `color.accent` | #3B3F52 | #F6F5F8 |
| `bottomNav.indicator.width` | — | 56 | same |
| `bottomNav.indicator.height` | — | 32 | same |
| `bottomNav.indicator.radius` | `radius.full` | 9999 | same |
| `bottomNav.iconActive` | `color.on-accent` | #F6F5F8 | #2F3243 |
| `bottomNav.iconInactive` | `color.text-muted` | #4B4958 | #C6C3CF |
| `bottomNav.iconActiveStrokeWidth` | — | 2 | same |
| `bottomNav.iconInactiveStrokeWidth` | — | 1.5 | same |
| `bottomNav.labelActive` | `type.labelSm` | Geist 600 13/16 | same |
| `bottomNav.labelInactive` | `type.labelSmRegular` | Geist 400 13/16 | same |
| `bottomNav.labelActiveColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `bottomNav.labelInactiveColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `bottomNav.labels` | — | Check / Scan / Reading | same |
<!-- /tokens -->

**Accessibility:**
- Container `accessibilityRole="tablist"`. Each item `accessibilityRole="tab"`, label "Check" (not "Check, tab 1 of 3", which makes TalkBack say "tab" twice), `accessibilityState={{selected}}`, position "1 of 3" in `accessibilityHint`.
- Labels are always shown, never icon-only. At 200% they wrap to 2 lines; the bar grows.

**Copy:** single words, as listed.

**Motion and haptics:** the indicator fades in over 200ms (no stretch). No haptic.

**Do / Don't:**
- Do keep exactly 3 items.
- Don't use a badge count.
- Don't hide the labels.

---

## 25. Bottom sheet

**Purpose:** focused secondary tasks: What we keep, Feels wrong? Edit, the band explainer, the pharmacist and tint consents, the Delete confirm.

**Anatomy:**
- M3 modal sheet: `bottomSheet.bg`, top `bottomSheet.radius`, elevation 3 (dark: `bottomSheet.border` edge instead of a shadow), over `bottomSheet.scrim`.
- A drag handle (`bottomSheet.handle.width` × `bottomSheet.handle.height` `bottomSheet.handle.color`, inside a `bottomSheet.handle.target` 48dp box that toggles expand).
- A title (`type.headline`), content, and a sticky action area.
- Max height 90%; content scrolls.

**Variants:**

| Variant | Content |
|---|---|
| `info` | What we keep |
| `form` | Feels wrong? Edit: skin-type options as radio list rows; the result is tagged "self-reported, not measured" |
| `consent` | §11 |
| `confirm` | Delete: title "Delete your readings?" (proposed); body "This removes your skin type, score bands and scan date from this phone." (proposed); `destructiveNeutral` "Delete" + tertiary "Cancel" |

**States:**

| State | Spec |
|---|---|
| opening / closing | translateY over `motion.duration.sheetEnter`; scrim fades |
| expanded / half | two detents (50% / 90%) for long content |
| dragging | follows the finger; `GESTURE_END` on dismiss |
| loading (confirm action) | button loading state |
| focused | focus is trapped inside the sheet (see Accessibility); it is returned to the trigger on close by the app, because RN does not restore it |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:bottomSheet -->
| Token | References | Light | Dark |
|---|---|---|---|
| `bottomSheet.bg` | `elevation.3.surface` | #FFFFFF | #20212A |
| `bottomSheet.border` | `elevation.3.border` | #DCDAE3 | #7E7B8B |
| `bottomSheet.sheenEdge` | `color.sheen-edge` | rgba(255, 255, 255, 0.00) | rgba(239, 238, 243, 0.07) |
| `bottomSheet.radius` | `radius.sheet` | 28 | same |
| `bottomSheet.padding` | `space.6` | 24 | same |
| `bottomSheet.scrim` | `color.overlay` | rgba(18, 19, 25, 0.40) | rgba(8, 9, 12, 0.64) |
| `bottomSheet.title` | `type.headline` | Geist 600 20/26 | same |
| `bottomSheet.handle.width` | — | 36 | same |
| `bottomSheet.handle.height` | — | 4 | same |
| `bottomSheet.handle.color` | `color.border-strong` | #7E7B8B | same |
| `bottomSheet.handle.target` | `touch.min` | 48 | same |
| `bottomSheet.maxHeightPct` | — | 90 | same |
| `bottomSheet.closeTarget` | `touch.min` | 48 | same |
<!-- /tokens -->

**Accessibility:**
- **Android modality:** `accessibilityViewIsModal` is iOS-only. Render every sheet (consent, pharmacistShare, tintPhoto, Delete confirm, What we keep) inside RN `Modal`, or set `importantForAccessibility="no-hide-descendants"` on the screen root while the sheet is open, so TalkBack can't swipe into the screen behind the scrim.
- On open, `AccessibilityInfo.setAccessibilityFocus(titleRef)`. On close, put focus back on the trigger's ref.
- Back closes it (and gets predictive back).
- **The handle is never the only way to close.** There is a Close icon button (48dp) or a Cancel action.
- The title receives focus on open, so it is read first.

**Copy:** the title says the task. Delete copy names exactly what is removed.

**Motion and haptics:**
- `motion.duration.sheetEnter` with `motion.ease.decelerate` in, `motion.duration.sheetExit` with `motion.ease.exit` out.
- Reduce motion: a 120ms crossfade, no slide.

**Do / Don't:**
- Do confirm Delete in a sheet, with one tap from /profile.
- Don't nest sheets.
- Don't put the verdict in a sheet.

---

## 26. List rows

**Purpose:** settings, /about, What we keep, UNKNOWN next steps, the referral checklist, and zone lists.

**Anatomy:** `listRow.minHeight` 56 (grows for 2 lines), padding x `listRow.paddingX`, gap `listRow.gap`. Parts: optional leading icon (`icon.lg`, `color.text`), title (`type.body` or `type.label`), optional supporting text (`type.bodySm`, muted), and an optional trailing element (chevron, external arrow, checkbox, switch, value text). The divider is a `color.border` hairline, inset to the text.

**Variants:** `navigation` (chevron), `external` (arrow-up-right + "opens in browser"), `checkbox` (referral checklist; the whole row toggles), `radio`, `switch` (`switch.*`: 52 × 32 track inside a 48dp row target), `value` ("Scan date · 1 Nov"), `nextStep` (UNKNOWN: icon + title + chevron).

**States:**

| State | Spec |
|---|---|
| default | as above |
| pressed | full-row `color.state.pressed` |
| focused | focus ring inset `listRow.focusInset` |
| checked | ink-filled checkbox (`consentSheet.checkbox.checked` + `consentSheet.checkbox.check`); **no row fill** (`listRow.checkedBg` transparent): a grey row fill reads as disabled |
| disabled | `listRow.fgDisabled` + reason sub-line |

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:listRow switch -->
| Token | References | Light | Dark |
|---|---|---|---|
| `listRow.minHeight` | — | 56 | same |
| `listRow.paddingX` | `space.gutter` | 20 | same |
| `listRow.paddingY` | `space.3` | 12 | same |
| `listRow.gap` | `space.4` | 16 | same |
| `listRow.title` | `type.bodyStrong` | Geist 600 16/24 | same |
| `listRow.titleColor` | `color.text` | #1A1B23 | #EFEEF3 |
| `listRow.supporting` | `type.bodySm` | Geist 400 14/20 | same |
| `listRow.supportingColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `listRow.leadingIcon` | `icon.lg` | 24 | same |
| `listRow.trailingIcon` | `icon.md` | 20 | same |
| `listRow.trailingColor` | `color.text-muted` | #4B4958 | #C6C3CF |
| `listRow.groupBg` | `elevation.1.surface` | #FFFFFF | #1A1B23 |
| `listRow.groupRadius` | `radius.lg` | 20 | same |
| `listRow.divider` | `color.border` | #DCDAE3 | #30313C |
| `listRow.dividerInset` | `space.gutter` | 20 | same |
| `listRow.bgPressed` | `color.state.pressed` | rgba(26, 27, 35, 0.08) | rgba(239, 238, 243, 0.10) |
| `listRow.fgDisabled` | `color.disabled-fg` | #636070 | #A8A5B3 |
| `listRow.focusInset` | — | 2 | same |
| `listRow.checkedBg` | — | transparent | same |
| `switch.minTarget` | `touch.min` | 48 | same |
| `switch.trackWidth` | — | 52 | same |
| `switch.trackHeight` | — | 32 | same |
| `switch.trackBorderWidth` | — | 2 | same |
| `switch.radius` | `radius.full` | 9999 | same |
| `switch.offTrackBorder` | `color.border-strong` | #7E7B8B | same |
| `switch.offThumb` | `color.border-strong` | #7E7B8B | same |
| `switch.offThumbSize` | — | 16 | same |
| `switch.onTrack` | `color.accent` | #3B3F52 | #F6F5F8 |
| `switch.onThumb` | `color.on-accent` | #F6F5F8 | #2F3243 |
| `switch.onThumbSize` | — | 24 | same |
<!-- /tokens -->

**Accessibility:**
- The whole row is the target, with a native role (`button`, `link`, `checkbox`, `radio`, `switch`).
- Referral checkboxes are native and accessible, with **no alert-style icons**. The outcome text "Please see a doctor or pharmacist" appears as a live region when an item is ticked.

**Copy:**
- Plain words.
- The referral list is never pre-filled from AI scores, and scores never appear on /referral.
- No mole-change wording.

**Motion and haptics:** `TOGGLE_ON` / `TOGGLE_OFF` on checkbox and switch; nothing else.

**Do / Don't:**
- Do keep text on 2 lines max in 1-line rows (they wrap; they never truncate fixed strings).
- Don't use swipe-only actions.

---

## 27. Tags

**Purpose:** small non-interactive qualifiers.

**Anatomy:** `tag.visualMinHeight` 24 (not a target), padding x `tag.paddingX`, `tag.radius`, label `tag.type` (13dp), optional `tag.iconSize` icon.

| Variant | Fill / text / border | Example copy |
|---|---|---|
| `neutral` | `color.bg-sunken` / `color.text` | "Illustrative example", "Demo profile" |
| `outline` | transparent / `color.text` / 1dp `tag.outlineBorder` | "Name only", "self-reported, not measured", "estimated from oiliness + moisture" |
| `source` | transparent / `color.text-muted` | "Open Beauty Facts (ODbL)" |
| `verdict` | `color.verdict.<s>.bg` / `color.verdict.<s>.fg` + the state icon 16dp | "FITS" (match cards only) |

**States:** static only. A tag is never a button; if it needs to be tappable, use a band chip (`interactive`) or a text link.

**Component tokens** (generated from `skinkey.tokens.json`; RN `theme.components.*`, web `--sk-<group>-<path>`):

<!-- tokens:tag -->
| Token | References | Light | Dark |
|---|---|---|---|
| `tag.bg` | `color.bg-sunken` | #EFEEF3 | #0E0F14 |
| `tag.fg` | `color.text` | #1A1B23 | #EFEEF3 |
| `tag.radius` | `radius.full` | 9999 | same |
| `tag.visualMinHeight` | — | 24 | same |
| `tag.paddingX` | `space.3` | 12 | same |
| `tag.type` | `type.labelSm` | Geist 600 13/16 | same |
| `tag.outlineBorder` | `color.border-strong` | #7E7B8B | same |
| `tag.iconSize` | `icon.sm` | 16 | same |
<!-- /tokens -->

**Accessibility:** tags are read inline with their parent node, not as separate stops.

**Copy:** lowercase qualifiers as written in the brief ("self-reported, not measured"). No "New!" and no "Hot".

**Do / Don't:**
- Do pair a verdict tag with its icon.
- Don't use a CAUTION tag on match cards.
- Don't go below 13dp (12 is for data credits only).

---

## 28. QA checklist (per component, before merge)

- [ ] Only tokens are used; there are no hex values or primitives in component code.
- [ ] Light and dark are both checked. The dark primary is `color.accent` / `color.on-accent` as gated in `tokens/contrast-report.md`. The dark focus ring differs from the button fill.
- [ ] `node tokens/build-tokens.mjs && node tokens/check-contrast.mjs` exits 0 (contrast, rule lints, and every token reference in this file).
- [ ] No text under 12dp. Every target is a Pressable whose own box is at least 48dp (no hitSlop-only targets, no nested Text links). Tested at 200% font with no truncated verdict label, reason or fixed string.
- [ ] TalkBack order matches the spec. Only text is grouped; links and buttons are sibling nodes. Decorative icons and meters are hidden. One hidden polite live region per screen. Sheets are modal on Android (RN `Modal`).
- [ ] Reduce motion: `motion.reducedMotion.duration` crossfades only. Nothing loops. The grain is static, only on `texture.grain.allowed`, and off in dark mode.
- [ ] No red anywhere. No triangle, shield, pill, cross or mortar. CAUTION tint only in the verdict head; no side stripe. No tracked-caps eyebrows outside ledger keys and the verdict label.
- [ ] Fixed strings match brief §4.3 character for character (`·`, `→`, `;`, and the `(scan 1 Nov)` style).
- [ ] The banned-words scan (brief §4.4) passes on every string.
- [ ] Haptics follow the §1.5 table. There is no `REJECT` on verdicts.
- [ ] Commissioner tracking is checked on a real Android device.
