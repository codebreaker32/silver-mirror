# SkinKey component specifications

*Direction: **Clay & Ink**, with four parts taken from **Deep Teal**. Version 0.1, 1 Nov 2026. Draft until the interview debrief (brief §6 freeze rule).*

**Stack:** Expo / React Native, Android-first, with Material 3 behaviour for share, back, permissions, sheets and snackbars. There is also a small web app (the results/fallback page, the pharmacist QR page and the landing page) that reads the same tokens as CSS variables.

**Sources:**
- `directions/README.md` (judge fixes)
- `directions/clay-ink.*`
- `directions/deep-teal.*`
- `research/00_research_summary_and_design_brief.md` §3–5 and §7
- Tokens: `tokens/skinkey.tokens.json`, which is being built in parallel

**What was taken from Deep Teal:**
1. The provenance ledger is laid out like a **dispensing label**: small-caps keys SKIN / PRODUCT / LIMITS, with hairline rows.
2. The verdict tint stays **in the verdict head only**. Reasons sit on a plain surface.
3. Band meters are drawn in **neutral ink**, never in the accent.
4. The medicine gate uses a **pharmacist-at-counter** icon. It replaces the mortar and pestle.

---

## 0. Principles

1. **A calm, knowledgeable friend who shows their working.** Every claim names where it came from: the reading and scan date, the product data source, the weather source. Nothing flashes, sells or hurries. The only countdown in the product is the pharmacist QR expiry.
2. **Reasons before verdicts.** The verdict label frames the reasons; it does not replace them. Reasons are set *larger* than the label (`type.reason` 19dp > `type.verdictLabel` 15dp), and they are numbered in serif (01, 02) so they read as the main content.
3. **Privacy you can see.** Show what is kept before the camera opens. Show the YouCam deletion as its own step in processing. Keep "What we keep" and Delete one tap away. Every new sharing act gets its own consent screen with a preview.
4. **Honest UNKNOWN.** UNKNOWN and "based on product name only" are designed states, not errors. They always offer a next step and show the real catalogue count. They use no error colour and no error icon.
5. **Fit, not safety.** CAUTION means "may not suit *this profile*". It is ochre, never red. It never fills the screen. It uses no triangle, no exclamation mark and no shield. The medicine gate is neutral ink with one fixed line.

---

## 1. How to read this spec

### 1.1 Token references

Components reference **semantic, type, space, radius, elevation and motion tokens only**. They never use raw hex values or primitives. Hex values appear in §1.3 only so the token builder can reconcile them.

| Prefix in this doc | Resolves to in `skinkey.tokens.json` | RN | Web CSS |
|---|---|---|---|
| `color.*` | `semantic.light.color.*` / `semantic.dark.color.*`, picked by colour scheme | `useTheme().color.verdict.caution.bg` | `var(--color-verdict-caution-bg)` |
| `type.*` | `type.*` (family, size, lineHeight, letterSpacing, weight) | spread into `Text` style | `font` shorthand vars `--type-reason-*` |
| `space.N` | `space.N`, on a 4dp base (`space.1` = 4 … `space.12` = 48) | number (dp) | `--space-N` in `rem` |
| `radius.*` | `radius.*` | `borderRadius` | `--radius-*` |
| `elevation.N` | `elevation.N` (tone + border + shadow recipe) | `boxShadow` (new arch) + `elevation` fallback | `--elevation-N` |
| `motion.*` | `motion.duration.*`, `motion.easing.*` | Reanimated `withTiming` | `--motion-*` |
| `<component>.<part>.<prop>` | component layer (aliases of the above, defined per component below) | theme `components.*` | `--<component>-<part>-<prop>` |

When the token file lands and a name differs, reconcile it **in this table and §1.3 only**. Component tables keep their names.

### 1.2 Global rules

| Rule | Spec |
|---|---|
| **Type floor** | No text under **12dp**. Only `type.overline` and `type.tag` sit at 12. Provenance keys and meter labels are 13dp (`type.ledgerKey`, `type.caption`). |
| **Touch targets** | Every interactive element is at least **48 × 48dp** (`size.touch.min`). Smaller visuals (Edit link, chips, icon buttons, sheet handle) expand their hit area with `hitSlop` or padding, never with layout overlap. Targets are at least 8dp apart. |
| **Dynamic type** | `allowFontScaling` stays on. `maxFontSizeMultiplier` is never below **2.0**. Layouts are tested at 1.0, 1.3 and 2.0 (Android 14 non-linear scaling). Use `minHeight`, never a fixed `height`, on any element that contains text. At ≥ 1.3×, button pairs stack vertically. At ≥ 1.5×, ledger keys stack above their values, the chip grid becomes one column, and the bottom nav keeps its labels (they wrap to 2 lines, they never truncate). **Verdict labels, reasons and fixed strings never truncate** (`numberOfLines` is unset). Web: `rem` units, reflow at 200% zoom and at 320 CSS px (WCAG 1.4.4 / 1.4.10). |
| **Colour never alone** | Every state has a text label, a unique icon silhouette and a hue. |
| **CAUTION** | Ochre (`color.verdict.caution.*`), **never red**. The tint is confined to the verdict head and never reaches reasons, backgrounds, app bars or buttons. |
| **Accent use** | `color.accent` is used for primary buttons, links, focus and selected nav **only**. It never marks a verdict, a band, a meter or a chart. |
| **Numerals** | Dates, prices, counts, indices, SPF and the countdown use `fontVariant: ['tabular-nums']` (`type.*` with the `numeric` modifier). |
| **Paper grain** | A static PNG tile at **3% opacity** (`surface.grain.opacity` = 0.03 light, **0 dark**). It is only allowed on decorative paper zones: the landing hero, empty-state illustration panels and the share-teaching illustration. It is **never** behind body text, reasons, the ledger, forms or the camera. It never animates and is off when reduce-motion is on. It is not used on low-RAM devices (`ActivityManager.isLowRamDevice`). |
| **Icons** | Lucide-style line icons, 1.5dp stroke, round caps, sizes `size.icon.sm` 16 / `md` 20 / `lg` 24. One style per hierarchy level. A decorative icon next to text is hidden from TalkBack (`importantForAccessibility="no"`). Icon-only controls carry an `accessibilityLabel`. **Banned glyphs:** shield, warning triangle, exclamation mark, cross or plus-in-circle (medical), pill, mortar and pestle, sparkles ("AI magic"), store logos. |
| **Focus** | Keyboard, switch access and web focus get a 2dp `color.focus.ring` outline with a 2dp offset over the surrounding surface. Contrast is measured against that surface, not the control fill. |
| **Safe areas** | Fixed bars respect the status bar and the gesture inset (`react-native-safe-area-context`). Scroll content gets a bottom inset equal to the sticky bar height. |
| **Links out** | Store links open the store app or a Chrome Custom Tab. **Never a WebView.** Every link-out shows its destination line *before* the tap. |

### 1.3 Semantic tokens this spec relies on

Values are Clay & Ink, with the judge fixes applied. Ratios are WCAG 2.1, computed with `scratchpad/cc.py` and the original `clay-ink.contrast.md`.

| Token | Light | Dark | Note / contrast |
|---|---|---|---|
| `color.bg` | #F3EEE6 | #151411 | |
| `color.surface` | #FAF7F2 | #1E1C18 | |
| `color.surface.raised` | #FFFCF7 | #28251F | sticky bars, sheets, cards |
| `color.surface.sunken` | #EAE3D8 | #100F0D | inputs, empty-state discs, disabled fills |
| `color.text` | #1E1C19 | #F1EBE1 | 14.7 / 15.5 on bg |
| `color.text.muted` | #655B4D | #B0A595 | ≥ 5.2 on every surface, both modes |
| `color.border` | #DDD3C5 | #38332B | decorative hairline only, never the only edge of a control |
| `color.border.strong` | #7E725F | #807464 | control outlines and empty meter segments; ≥ 3.35 on every surface |
| `color.accent` | #1B2F32 | **#86A4A7** | **Dark fixed**: was #B0C5C7, which looked disabled. The fill is 6.91 on bg and 5.73 on raised. |
| `color.on.accent` | #F6F1E8 | **#0C171A** | 12.45 light / **6.84 dark** (rechecked) |
| `color.accent.pressed` | #132326 | #B0C5C7 | text on the pressed fill: 14.40 / 10.11 |
| `color.accent.text` | #253D41 | #B0C5C7 | links; ≥ 8.48 everywhere |
| `color.focus.ring` | #43666A | **#B0C5C7** | **Recommend dark = ink.200**, so the ring differs from the new dark button fill (10.23 on bg). |
| `color.chip.bg` / `color.chip.fg` | #EAE3D8 / #2B2722 | #2E2A24 / #E8E0D4 | 11.64 / 10.89 |
| `color.meter.on` | = `color.chip.fg` | = `color.chip.fg` | neutral ink, **never accent** |
| `color.meter.off` | = `color.border.strong` | = `color.border.strong` | full-opacity 1.5dp outline; 3.70 light / 3.12 dark on chip bg |
| `color.verdict.fits.{bg,fg,border}` | #E5EBDD / #34492A / #B3C4A3 | #1E2A1A / #B9CCA8 / #3F5534 | fg on bg 8.09 / 8.75 |
| `color.verdict.caution.{bg,fg,border}` | #F3E6CC / #62410A / #DDBE85 | #2D2313 / #E6C482 / #5E4920 | fg on bg 7.46 / 9.24 |
| `color.verdict.unknown.{bg,fg,border}` | #E6E8E8 / #3B464D / #C1C7CA | #21262A / #BCC5CA / #414C53 | fg on bg 7.87 / 8.71 |
| `color.verdict.medicine.{bg,fg,border}` | #EFEBE4 / #1E1C19 / #1E1C19 | #211F1B / #F1EBE1 / #B0A595 | border is 1.5dp |
| `color.verdict.*.rule` | = `.fg` | = `.fg` | **New**: a 3dp leading rule on the verdict head. It fixes the dark CAUTION edge that almost disappeared (caution rule 10.19 on dark surface). |
| `color.scrim` | rgba(26,24,21,0.48) | rgba(0,0,0,0.60) | behind modal sheets |
| `color.media.fg` / `color.media.scrim` | #FFFFFF / rgba(0,0,0,0.55) | same | **camera and photo only**. White on the scrim is ≥ 4.74 even over a white scene. |
| `color.inverse.surface` / `.text` / `.action` | #2B2722 / #F3EEE6 / #B0C5C7 | #E8E0D4 / #1E1C19 / #253D41 | snackbars: 12.84 / 8.23 light, 12.99 / 8.80 dark |
| `color.qr.bg` / `color.qr.fg` | #FFFFFF / #000000 | same | QR always prints black on white |
| `color.shadow` | rgba(66,59,50,0.38) | none (tone steps only) | |

**Non-colour tokens this spec needs.** Flag these to the token builder if they are missing.

| Token | Value |
|---|---|
| `size.touch.min` | 48dp |
| `size.icon.sm` / `md` / `lg` / `xl` | 16, 20, 24, 32dp |
| `size.button.primary` | 52dp min height |
| `size.button.secondary` | 48dp min height |
| `size.shutter` | 72dp |
| `surface.grain.opacity` | 0.03 light, 0 dark |
| `state.pressed.overlay` | `color.text` at 10% (ripple / state layer) |
| `radius.xs` / `chip` / `button` / `verdict` / `card` / `sheet` / `full` | 2, 6, 8, 10, 12, 24, 999 |
| `space.gutter` | 20dp (= `space.5`) |

### 1.4 Type styles used here

| Token | Family / weight | Size / line (dp) | Tracking | Use |
|---|---|---|---|---|
| `type.display` | Newsreader 400 | 34 / 40 | −0.5 | landing hero, empty-state title |
| `type.title` | Newsreader 400 | 26 / 32 | −0.3 | product title, screen titles |
| `type.headline` | Newsreader 400 | 20 / 27 | −0.1 | section and sheet titles, privacy sentence, forecast sentence |
| `type.verdictLabel` | Commissioner 600, caps | **15 / 20** | +1.0 | FITS / CAUTION / UNKNOWN. **Fixed**: was 12dp. |
| `type.verdictSubtitle` | Newsreader 400 | 18 / 25 | 0 | the verdict subtitle, set as **one unit in one style** |
| `type.medicineLine` | Newsreader 500 | 20 / 27 | −0.1 | "This looks like a medicine. Ask the pharmacist." |
| `type.reason` | Newsreader 400 | **19 / 26** | −0.1 | reason reading line. **Fixed**: was 20/27, which pushed reason 02 under the sticky bar. |
| `type.reasonIndex` | Newsreader 400 italic, tabular | 17 / 26 | 0 | 01, 02, 03 |
| `type.reasonFact` | Commissioner 400 | **16 / 24** | 0 | product fact, in **`color.text`**. **Fixed**: was 14dp muted. |
| `type.body` | Commissioner 400 | 16 / 24 | 0 | |
| `type.bodySm` | Commissioner 400 | 14 / 20 | 0 | |
| `type.label` | Commissioner 600 | 14 / 20 | +0.1 | chips, list-row titles, links |
| `type.button` | Commissioner 600 | 15 / 20 | +0.1 | |
| `type.ledgerKey` | Commissioner 600, caps | 13 / 18 | +0.8 | SKIN / PRODUCT / WEATHER / LIMITS |
| `type.caption` | Commissioner 400 | 13 / 18 | +0.1 | destination lines, fine print, meter labels |
| `type.overline` | Commissioner 600, caps | 12 / 16 | +1.2 | section kickers |
| `type.tag` | Commissioner 600 | 12 / 16 | +0.4 | tags |

Android: `includeFontPadding: false`. QA: check Commissioner's tracking on a real Android phone (judge fix 12).

### 1.5 Motion and haptics policy

The motion personality is **ink settling**: unhurried, no springs, no overshoot, nothing loops.

| Token | Value | Use |
|---|---|---|
| `motion.duration.press` | 120ms | press scale 0.98 + state layer |
| `motion.duration.state` | 200ms | colour and state changes, step ticks drawing |
| `motion.duration.enter` | 320ms | cards and toasts entering |
| `motion.duration.verdictReveal` | 320ms | verdict head: opacity 0→1 + scale 0.98→1 |
| `motion.duration.reasonStagger` | 60ms | reasons: opacity + translateY 6dp→0, 60ms apart |
| `motion.duration.sheet` | 300ms | bottom sheet in/out |
| `motion.duration.screen` | 360ms | screen transitions (M3 shared-axis X) |
| `motion.duration.reduced` | 120ms | **reduce motion**: every transition becomes this crossfade. No translate, scale or stagger. |
| `motion.easing.standard` | cubic-bezier(0.2, 0, 0, 1) | entering and moving |
| `motion.easing.exit` | cubic-bezier(0.3, 0, 1, 1) | leaving |

Reduce motion is read from `AccessibilityInfo.isReduceMotionEnabled()` / Reanimated `useReducedMotion()`. On the web it is `prefers-reduced-motion`.

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

Priority: disabled > loading > pressed > focused > default. On the web, hover = a 6% state layer.

| State | Visual | Semantics |
|---|---|---|
| default | the component tokens | |
| pressed | `state.pressed.overlay` ripple (`android_ripple`, bounded) + scale 0.98, `motion.duration.press`. The bounds never shift. | |
| focused | 2dp `color.focus.ring`, 2dp offset | TalkBack focus uses the system highlight; never suppress it |
| disabled | fill `color.surface.sunken`, text `color.text.muted` (5.22 / 7.90, **still readable**), border `color.border` | `accessibilityState={{disabled:true}}`. **Shown, not hidden.** A visible reason line sits nearby when one exists. |
| loading | the label is replaced by a static progress label ("Checking…"), and the width stays the same. No looping spinner. A 3-dot opacity step at 600ms is allowed, and it is off under reduce motion. | `accessibilityState={{busy:true}}`, live region polite |
| error | inline message under the control in `color.text`, with an `info` icon. **No red.** | announced through a live region |

---

## 2. App bar

**Purpose:** orientation and back. It also shows the source of the current item ("Shared from Flipkart").

**Anatomy:** a container (64dp min height, `color.bg`, no shadow until content scrolls under it, then a hairline `color.border` bottom edge), then a leading back icon button (48dp), then a **left-aligned** title or source line, then 0–1 trailing icon buttons (48dp).

**Variants:**

| Variant | Content |
|---|---|
| `small` | title in `type.label`, or source line in `type.caption` muted, with a 16dp store-agnostic `share` icon |
| `large` | M3 medium: title in `type.title` below the bar, collapsing on scroll. Used for /profile and /about. |
| `camera` | transparent over the camera, icons in `color.media.fg`, with a `color.media.scrim` top gradient-free band (a flat scrim) |

**States:**

| State | Spec |
|---|---|
| default | as above |
| scrolled | hairline `color.border` bottom edge; in light only, add `elevation.1` |
| pressed (icon) | circular ripple, radius.full, 48dp |
| focused (icon) | focus ring, circle |

**Component tokens:**

| Token | Value |
|---|---|
| `appBar.bg` | `color.bg` |
| `appBar.fg` | `color.text` |
| `appBar.source.fg` | `color.text.muted` |
| `appBar.title.type` | `type.label` (small) / `type.title` (large) |
| `appBar.minHeight` | 64 |
| `appBar.paddingX` | `space.1` (so the 48dp icon buttons align to a 12dp visual inset) |
| `appBar.divider` | `color.border` |
| `appBar.icon.size` | `size.icon.lg` |

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

**Anatomy:** a container, an optional leading icon (`size.icon.md`), a label (`type.button`), an optional trailing icon (an external-link arrow only on link-outs), and an optional **destination line** below (see §14).

**Variants:**

| Variant | Use | Fill / text / border | Min height |
|---|---|---|---|
| `primary` | the one main action per screen (Start scan, Find better matches on CAUTION/UNKNOWN, Back to product on FITS/medicine) | `color.accent` / `color.on.accent` / none | 52 |
| `secondary` | alternative actions (Back to product when it isn't primary, Paste a link) | transparent / `color.text` / 1.5dp `color.border.strong` | 48 |
| `tertiary` | low-emphasis text button (Not now *outside* consent, Retake, Try later, Got it) | transparent / `color.accent.text` / none; the 48dp target stays | 48 |
| `destructiveNeutral` | **Delete** (profile), **Revoke** (QR) | `color.surface` / `color.text` / 1.5dp `color.text` border, plus a `trash-2` or `link-2-off` icon. **Never red.** Severity comes from the confirm step, not from colour. | 52 |
| `consentPair` | **Start scan / Not now**, which need equal visual weight (brief §5.1) | both: `color.surface.raised` / `color.text` / 1.5dp `color.border.strong`, same size and type | 52 |
| `icon` | 48dp circular, icon only | transparent / `color.text` | 48 × 48 |

**States:**

| State | primary | secondary / consentPair / destructiveNeutral | tertiary |
|---|---|---|---|
| default | `color.accent` fill | outline as listed | `color.accent.text` |
| pressed | `color.accent.pressed` + scale 0.98 | `state.pressed.overlay` + scale 0.98 | overlay, radius.button |
| focused | focus ring 2dp, 2dp offset, radius.button + 2 | same | same |
| disabled | `color.surface.sunken` / `color.text.muted`, no border | `color.border` outline / `color.text.muted` | `color.text.muted` |
| loading | label → "Checking…", "Creating…" or "Deleting…" with the width kept; `busy` | same | n/a |

**Component tokens:**

| Token | Value |
|---|---|
| `button.primary.bg` / `.fg` / `.pressedBg` | `color.accent` / `color.on.accent` / `color.accent.pressed` |
| `button.secondary.border` / `.fg` | `color.border.strong` / `color.text` |
| `button.tertiary.fg` | `color.accent.text` |
| `button.destructiveNeutral.bg` / `.fg` / `.border` | `color.surface` / `color.text` / `color.text` |
| `button.consentPair.bg` / `.fg` / `.border` | `color.surface.raised` / `color.text` / `color.border.strong` |
| `button.disabled.bg` / `.fg` | `color.surface.sunken` / `color.text.muted` |
| `button.radius` | `radius.button` |
| `button.paddingX` / `.gap` | `space.5` / `space.2` |
| `button.type` | `type.button` |
| `button.minHeight.primary` / `.secondary` | `size.button.primary` / `size.button.secondary` |
| `button.stackGap` | `space.3` |
| `actionBar.bg` / `.border` / `.elevation` / `.padding` | `color.surface.raised` / `color.border` (top) / `elevation.2` / `space.4` top, `space.5` x, safe-area bottom |

**Accessibility:**
- `accessibilityRole="button"`. The label is the visible text plus the destination where there is one: "Find better matches. Opens a Flipkart search, filtered to Oily Skin."
- Disabled buttons stay focusable and announce "dimmed" plus the reason line.
- At ≥ 1.3× font, pairs stack vertically, and Not now stays visible without scrolling on consent.
- The sticky bar never covers TalkBack focus. The scroll view gets a bottom inset.

**Copy:**
- Sentence case and verbs: "Start scan", "Not now", "Find better matches", "Back to product", "Paste a link", "Scan in store", "Delete", "Revoke", "Try later", "Retake".
- No "Buy", no "Shop now", no exclamation marks.

**Motion and haptics:** press 120ms, `motion.easing.standard`. No haptic. Success haptics fire on the *result*, not the tap (§1.5).

**Do / Don't:**
- Do keep one primary per screen.
- Do use `consentPair` on any consent screen.
- Don't use a red Delete.
- Don't make Not now a grey text link next to a filled Start scan.
- Don't put two primaries side by side.

---

## 4. Text link

**Purpose:** inline navigation (retention policy, "Ingredient list source", "Feels wrong? Edit", "Edit").

**Anatomy:** label in `type.label`, or the body size when inline in a sentence, in `color.accent.text`. A trailing `arrow-up-right` 16dp marks a link that leaves the app. The hit area is padded to 48dp high.

**Variants:**

| Variant | Spec |
|---|---|
| `inline` | inside body text, always underlined (1dp, 2dp offset) |
| `standalone` | no underline, 600 weight, optional leading icon |
| `external` | standalone + `arrow-up-right`; opens a Chrome Custom Tab |

**States:**

| State | Spec |
|---|---|
| default | `color.accent.text` |
| pressed | underline thickens to 2dp + `state.pressed.overlay` behind it, radius.xs |
| focused | focus ring around the padded hit area |
| visited | not shown (no visited colour) |
| disabled (offline external) | `color.text.muted` + caption "Needs a connection" |

**Component tokens:**

| Token | Value |
|---|---|
| `link.fg` | `color.accent.text` |
| `link.underline` | `color.accent.text` |
| `link.type` | `type.label` |
| `link.minTarget` | `size.touch.min` |
| `link.icon` | `size.icon.sm` |

**Accessibility:**
- `accessibilityRole="link"`. External links say so: "Ingredient list source, opens in browser".
- "Feels wrong? Edit" is **left-aligned** with a 48dp hit area (judge fix: it was 44dp).

**Copy:** say where the link goes: "Read the full retention policy", not "Learn more".

**Do / Don't:**
- Do pad to 48dp.
- Don't use colour alone for inline links; underline them.
- Don't open store or policy links in a WebView.

---

## 5. Product header (editable "Is this the product?")

*Added: the /check screen requires it.*

**Purpose:** confirms which product is being checked, and lets the user correct a bad share parse.

**Anatomy:**
1. Overline "Is this the product?" (`type.overline`, muted), with an **Edit** text link at the trailing edge of the same row, 48dp target.
2. Product title (`type.title`, `color.text`) as **plain text**. It must not look like a form field (judge fix): no box and no dashed underline.
3. Meta line (`type.caption`, muted, tabular): "Illustrative example · 50 g · ₹399 on the listing".

**Variants:** `display` (default), `editing` (an inline text field replaces the title), `linkOnly` (no title parsed, so the field is focused on arrival).

**States:**

| State | Spec |
|---|---|
| display | as above |
| editing | the field takes `color.surface.sunken` fill, a 1.5dp `color.border.strong` bottom edge and radius.button top. Focus: a 2dp `color.focus.ring` bottom edge. "Check again" (secondary) + "Cancel" (tertiary). |
| linkOnly | editing state on arrival, helper "We couldn't read the product name. Type it to check." (proposed) |
| loading (parsing share) | title skeleton: 2 bars of `color.surface.sunken`, radius.xs, static; label "Reading the shared link…" (proposed) |
| error (empty submit) | helper in `color.text` + `info` icon: "Type a product name to check." (proposed) |

**Component tokens:**

| Token | Value |
|---|---|
| `productHeader.kicker.type` / `.fg` | `type.overline` / `color.text.muted` |
| `productHeader.title.type` / `.fg` | `type.title` / `color.text` |
| `productHeader.meta.type` / `.fg` | `type.caption` / `color.text.muted` |
| `productHeader.gap` | `space.2` |
| `field.bg` / `.border` / `.focus` | `color.surface.sunken` / `color.border.strong` / `color.focus.ring` |

**Accessibility:**
- The title is `accessibilityRole="header"`. Edit's label is "Edit product name".
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

(a) **Verdict head** (tinted):
- `color.verdict.<s>.bg`
- 1dp `color.verdict.<s>.border`
- a 3dp leading rule in `color.verdict.<s>.rule`
- radius.verdict, padding `space.4`
- Row 1: icon at `size.icon.lg` (24dp) + label in `type.verdictLabel` (15dp, 600, caps), both in `color.verdict.<s>.fg`, gap `space.2`
- Row 2: subtitle in `type.verdictSubtitle` (`color.text`), as one paragraph
- **Nothing else goes in the tinted area.**

(b) **Reasons section** on the plain screen surface (`color.bg`): the heading "Why" + count in `type.overline`, then 1–3 Reason rows (§7).

(c) **Provenance ledger** (§10), then the fixed lines.

(d) **Sticky action bar** (§3).

**Verdict icon silhouettes.** They are distinct shapes, all in `color.verdict.<s>.fg`, 1.5dp stroke, 24dp.

| State | Icon | Shape notes |
|---|---|---|
| FITS | **seal + check** (Lucide `badge-check`) | scalloped outline; the only non-circle |
| CAUTION | **half-filled circle** (right half solid) | "partly fits"; no triangle, no "!" |
| UNKNOWN | **dashed circle + centre dot** | "incomplete information"; not "?" and not an error glyph |
| MEDICINE | **pharmacist at counter** (head circle r3 at 12,6.5; shoulders arc; counter line y14; counter box; small drawer line), from Deep Teal | no cross, no pill, no mortar |
| NAME-ONLY | the base state's icon + a 1dp dashed head border | the weaker check is shown by the border *and* the words |

**Variants (copy is fixed: brief §4.3).**

| Variant | Label | Subtitle | Body | Actions |
|---|---|---|---|---|
| `fits` | **FITS** | "Matches your scan on the ingredients we know about. Not a guarantee." | 1–3 reasons: reading → product fact | primary Back to product; secondary Find better matches |
| `caution` | **CAUTION** | "May not suit your readings. This is not a safety warning." | reason first, for example 01 "Your skin showed some redness in your 1 Nov scan." / "Contains fragrance (parfum), which is often flagged for skin with visible redness." | primary Find better matches; secondary Back to product |
| `nameOnly` | **FITS · based on product name only** or **CAUTION · based on product name only**. Line 1 is the caps label; line 2 is "based on product name only" in `type.label`, as part of the label node. | "We don't have this product's ingredient list, so this is a weaker check." | name keyword → reading; then "Check the full ingredient list on the product page or pack." + tertiary "Snap the ingredient list" (§7 addendum) | as the base state |
| `unknown` | **UNKNOWN** (flag `verdict.unknown.label` → "NOT ENOUGH INFO" if sessions fail) | "This product isn't in our catalogue ([n] products) and its name alone isn't enough. This doesn't mean it's bad." | next steps as list rows: "Snap the ingredient list", "Check the pack", "Find products matched to your skin type" | primary Find better matches; secondary Back to product |
| `medicine` | *(no label)* | **"This looks like a medicine. Ask the pharmacist."** in `type.medicineLine`, `color.verdict.medicine.fg`. 1.5dp border, no leading rule, icon at `size.icon.xl` (32dp). | **nothing**: no reasons, no ledger, no better matches | Back to product only |

**States:**

| State | Spec |
|---|---|
| loading | static head skeleton (`color.surface.sunken`, radius.verdict, no tint, no icon) + "Checking this product…"; `busy`. No shimmer loop. |
| revealed | the head fades and scales in (`motion.duration.verdictReveal`), then the reasons stagger in |
| noProfile | `nameOnly` or `unknown`, plus a prompt row under the subtitle on the plain surface: "Scan for reasons based on your readings" + tertiary Start scan |
| offline | catalogue verdicts render normally. Link-out buttons are disabled with the destination line "Needs a connection" (§14). |
| uv | adds a WEATHER row to the ledger. Only shown when the live Open-Meteo rule fires; never hard-coded. |
| error (parse failed) | not a verdict. Show the Product header `linkOnly` state, or the §22 error state. |
| pressed / focused | the head is **not interactive**. TalkBack focuses it as one grouped node. |

**Component tokens:**

| Token | Value |
|---|---|
| `verdictHead.bg` | `color.verdict.<state>.bg` |
| `verdictHead.border` | `color.verdict.<state>.border`, 1dp (medicine: 1.5dp, `color.verdict.medicine.border`) |
| `verdictHead.rule` | `color.verdict.<state>.rule`, 3dp leading edge (not on medicine) |
| `verdictHead.radius` / `.padding` | `radius.verdict` / `space.4` |
| `verdictHead.icon.size` / `.fg` | `size.icon.lg` (medicine `size.icon.xl`) / `color.verdict.<state>.fg` |
| `verdictHead.label.type` / `.fg` | `type.verdictLabel` / `color.verdict.<state>.fg` |
| `verdictHead.subtitle.type` / `.fg` | `type.verdictSubtitle` / `color.text` |
| `verdictHead.medicine.type` | `type.medicineLine` |
| `verdictHead.gap` | `space.2` (icon–label), `space.3` (label–subtitle) |
| `verdictCard.sectionGap` | `space.7` |
| `verdictCard.reasons.bg` | `color.bg` (**never** the verdict tint) |
| `verdictCard.nameOnly.borderStyle` | dashed |

**Accessibility:**
- TalkBack order: **label → subtitle → reasons → source (ledger) → fixed lines → actions** (brief §5.5).
- The head is one node (`accessible`), `accessibilityRole="header"`. Its label is "Caution. May not suit your readings. This is not a safety warning." The icon is decorative.
- Medicine: "This looks like a medicine. Ask the pharmacist."
- Name only: "Fits, based on product name only. We don't have this product's ingredient list, so this is a weaker check."
- The reveal is announced once through `AccessibilityInfo.announceForAccessibility` after the loading state.
- The label never truncates. At 200% the label and the "based on product name only" line wrap.

**Copy rules:**
- Use the §4.3 strings exactly.
- The subtitle is **one unit** (judge fix 6).
- Never write: safe, unsafe, harmful, allergic, avoid, warning (outside the fixed "not a safety warning"), "perfect match", or "guaranteed".
- Medicine: one line, no additions.

**Motion and haptics:**
- Reveal: 320ms, standard easing.
- One `CONTEXT_CLICK` when the head lands, **the same for every state**.
- Reduce motion: a 120ms crossfade, no scale.

**Do / Don't:**
- Do keep the tint inside the head.
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

**Anatomy:** a 2-column grid (index 32dp | content), padding `space.4` vertical, with a hairline `color.border` bottom.
1. Index "01" (`type.reasonIndex`, muted, tabular)
2. **Reading line** (`type.reason`, `color.text`)
3. **Product fact** (`type.reasonFact`, 16dp, **`color.text`**): it names the ingredient *and* says in plain words why it matters (§7 addendum)
4. A reading band chip (§8, `compact`), `space.3` above

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
| entering | opacity + translateY 6dp→0, staggered `motion.duration.reasonStagger` |
| expanded (optional "Why this matters") | tertiary link; reveals a `type.body` explanation in place |
| focused | focus ring around the row (if expandable) |
| loading | not shown; reasons arrive with the verdict |

**Component tokens:**

| Token | Value |
|---|---|
| `reason.index.type` / `.fg` | `type.reasonIndex` / `color.text.muted` |
| `reason.reading.type` / `.fg` | `type.reason` / `color.text` |
| `reason.fact.type` / `.fg` | `type.reasonFact` / `color.text` |
| `reason.paddingY` | `space.4` |
| `reason.columnGap` | `space.2` |
| `reason.indexWidth` | 32 |
| `reason.divider` | `color.border` |
| `reason.bg` | transparent (sits on `color.bg`) |
| `reasons.heading.type` / `.fg` | `type.overline` / `color.text.muted` ("Why · 2 reasons") |

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

**Anatomy:**
- Chip: `color.chip.bg`, radius.chip
- Text "Oiliness · High" (`type.label`, `color.chip.fg`)
- A trailing **horizontal 3-segment meter**: segments 10 × 6dp, gap 2dp, radius.xs. Filled = `color.meter.on` (neutral ink). Empty = a **full-opacity 1.5dp `color.meter.off` outline**.
- This replaces Clay & Ink's vertical "signal bars" (judge fix 8).

**Variants:**

| Variant | Use | Size |
|---|---|---|
| `compact` | inside a reason row, non-interactive | min height 32dp |
| `profile` | the /profile **2 × 2 grid** (1 column at ≥ 1.5× font); band text on line 1, meter + `type.caption` "Low · Medium · High" scale labels below | min height 56dp |
| `interactive` | opens the band explainer sheet (enabled if U3 fails) | 48dp target |
| `selfReported` | adds the tag "self-reported, not measured" (§27) | |

**States:**

| State | Spec |
|---|---|
| default | as above |
| pressed (interactive) | `state.pressed.overlay` |
| focused (interactive) | focus ring, radius.chip + 2 |
| stale (scan older than 30 days, ASSUMPTION) | caption "Scan [date]" stays visible. No colour change. |
| noData | "Pores · Not measured" (proposed), all segments empty |

**Component tokens:**

| Token | Value |
|---|---|
| `bandChip.bg` / `.fg` | `color.chip.bg` / `color.chip.fg` |
| `bandChip.radius` | `radius.chip` |
| `bandChip.paddingX` | `space.3` |
| `bandChip.type` | `type.label` |
| `bandMeter.on` | `color.meter.on` |
| `bandMeter.off` | `color.meter.off` (1.5dp outline) |
| `bandMeter.segment` | 10 × 6, `radius.xs`, gap 2 |
| `bandMeter.scaleLabel.type` / `.fg` | `type.caption` / `color.text.muted` |
| `bandGrid.gap` | `space.2` |

**Accessibility:**
- Label: "Oiliness reading: high." The meter is `importantForAccessibility="no"` because it duplicates the text.
- TalkBack reads the profile grid row by row, in a fixed order: oiliness, moisture, redness, acne (label per open decision), pores, texture, radiance.
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
- A frame on `color.surface.sunken`, radius.card, padding `space.4`.
- A **generic line-art face outline** (oval + neck, no hair, no beard, no features beyond a centre line). Stroke 1.5dp `color.text.muted`.
- **5 zones**: forehead, nose, left cheek, right cheek, chin. They are filled by **hatch density**, not colour: none = Low, 45° single hatch = Medium, cross-hatch = High. Hatch strokes are 1dp `color.meter.on`.
- A legend row of three swatches + "Low · Medium · High" (`type.caption`).
- A caption: "Zones from your [date] scan · no photo kept" (proposed).
- Above the frame, a concern selector: an M3 segmented button of the 7 readings, scrollable, each segment 48dp.

**Variants:** `profile` (with selector), `processing` (one reading, shown once before "Done", never saved), `compact` (in a reason row expansion, one zone set).

**States:**

| State | Spec |
|---|---|
| default | the selected concern's zones |
| switching | zones crossfade over `motion.duration.state` |
| noZoneData | the frame shows the face outline + "Zone detail isn't available for this reading." (proposed) |
| listView | toggle "Show as list" → list rows (§26) "Forehead · High" |
| focused (segment) | focus ring |

**Component tokens:**

| Token | Value |
|---|---|
| `skinMap.bg` / `.radius` / `.padding` | `color.surface.sunken` / `radius.card` / `space.4` |
| `skinMap.outline` | `color.text.muted`, 1.5dp |
| `skinMap.hatch` | `color.meter.on`, 1dp; spacing 6dp (medium) / 4dp cross (high) |
| `skinMap.zoneBorder` | `color.border.strong`, 1dp |
| `skinMap.legend.type` | `type.caption` |
| `segmented.selected.bg` / `.fg` | `color.chip.bg` / `color.text` + check icon |
| `segmented.border` | `color.border.strong` |

**Accessibility:**
- The diagram is `accessibilityRole="image"`, with a full text alternative: "Oiliness reading by zone: forehead high, nose high, cheeks medium, chin low."
- "Show as list" is always available.
- Segments are `accessibilityRole="tab"` with `selected` state.

**Copy:**
- Zone names only. Appearance words. Never "problem areas" or "trouble zones".

**Motion and haptics:** a 200ms crossfade on switch. `CLOCK_TICK` on segment change is optional; the default is none.

**Do / Don't:**
- Do keep it schematic and gender-neutral.
- Don't render a photo, a skin-tone fill or a red–yellow heatmap.
- Don't show numbers or zone percentages.
- Don't draw a realistic face.

---

## 10. Provenance ledger ("Where this comes from")

**Purpose:** visible proof of sources and limits. It is laid out like a **dispensing label** (taken from Deep Teal).

**Anatomy:**
- No fill. It sits on `color.bg`.
- A **1.5dp `color.text` top rule**, then the title "Where this comes from" (`ledger.title.type` = `type.button`, 15/20, 600), `space.3` below.
- Rows are a 2-column grid: **key column 76dp** with small-caps keys (`type.ledgerKey`, muted), then values (`type.bodySm` 14/20 in `color.text` + `type.caption` muted sub-line). Each row has a `color.border` hairline below and `space.3` vertical padding.
- A **1.5dp `color.text` bottom rule** closes the label.
- Below the ledger, the two fixed lines in `type.caption`, muted.

| Key | Value line | Sub-line |
|---|---|---|
| SKIN | "Measured by YouCam Skin Analysis, [date]" | `check` 16dp + "Photo deleted · score bands only" |
| PRODUCT | "Ingredient list from the SkinKey catalogue" / "Product name only" / "Open Beauty Facts (ODbL)" | "[n] products checked by hand · " + external link "Ingredient list source" |
| WEATHER *(only when a UV reason shows)* | "Weather: Open-Meteo (CC BY 4.0)" | "Updated [time]" (proposed) |
| LIMITS | "Skin AI can be less accurate on deeper skin tones and in poor light." | none |

Fixed lines: "Cosmetic guidance, not medical advice." / "Not affiliated with Flipkart, Amazon or Nykaa."

**Variants:** `check` (full), `profile` (SKIN + LIMITS only), `web` (same as `<dl>`), `pharmacistView` (SKIN + LIMITS + "Shared by the user for 30 minutes", proposed).

**States:**

| State | Spec |
|---|---|
| default | as above |
| stacked (≥ 1.5× font) | each key sits above its value, full width |
| link pressed / focused | per §4 |
| offline | the external source link is disabled + "Needs a connection" |
| hidden | under the medicine gate |

**Component tokens:**

| Token | Value |
|---|---|
| `ledger.rule` | `color.text`, 1.5dp (top and bottom) |
| `ledger.title.type` / `.fg` | `type.button` / `color.text` |
| `ledger.key.type` / `.fg` | `type.ledgerKey` / `color.text.muted` |
| `ledger.key.width` | 76 |
| `ledger.value.type` / `.fg` | `type.bodySm` / `color.text` |
| `ledger.sub.type` / `.fg` | `type.caption` / `color.text.muted` |
| `ledger.row.paddingY` | `space.3` |
| `ledger.row.divider` | `color.border` |
| `ledger.fixed.type` / `.fg` | `type.caption` / `color.text.muted` |
| `ledger.marginTop` | `space.7` |

**Accessibility:**
- The title is `accessibilityRole="header"`. Each row is one node: "Skin: Measured by YouCam Skin Analysis, 1 Nov. Photo deleted, score bands only."
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
1. Title (`type.title`)
2. **The privacy sentence in large type** (`type.headline`, `color.text`), read as one block
3. A "What we keep" box: `color.surface`, 1dp `color.border`, radius.card, padding `space.4`, with an overline "What we keep" + `type.body`
4. Accessibility / Accuracy note (`type.bodySm`, muted, `info` 16dp)
5. An "I'm 18 or older" checkbox row, **unticked** (first scan only)
6. A retention policy link
7. `consentPair` buttons

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

**Component tokens:**

| Token | Value |
|---|---|
| `consent.title.type` | `type.title` |
| `consent.privacy.type` / `.fg` | `type.headline` / `color.text` |
| `consent.keepBox.bg` / `.border` / `.radius` / `.padding` | `color.surface` / `color.border` / `radius.card` / `space.4` |
| `consent.note.type` / `.fg` | `type.bodySm` / `color.text.muted` |
| `consent.buttons` | `button.consentPair.*` |
| `consent.gap` | `space.6` |
| `checkbox.box` | 20dp, 1.5dp `color.border.strong`, radius.xs; checked fill `color.accent` + check `color.on.accent` |

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
- Full-bleed camera.
- A `color.media.scrim` mask with an **oval cut-out** (width 78% of the frame, aspect 3:4). The oval has a 2dp `color.media.fg` stroke.
- A tip stack above the oval: three tips in `type.body`, `color.media.fg`.
- A hint chip below the oval (`color.inverse.surface` / `color.inverse.text`, radius.chip).
- The bottom bar: shutter at `size.shutter` (72dp; ring 3dp `color.media.fg`, inner disc `color.media.fg`), plus a 48dp flip-camera icon button and a 48dp "Tips" icon button.

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

**Component tokens:**

| Token | Value |
|---|---|
| `capture.scrim` | `color.media.scrim` |
| `capture.oval.stroke` | `color.media.fg`, 2dp |
| `capture.tip.type` / `.fg` | `type.body` / `color.media.fg` |
| `capture.hint.bg` / `.fg` | `color.inverse.surface` / `color.inverse.text` |
| `capture.shutter.size` | `size.shutter` |
| `capture.shutter.ring` / `.fill` | `color.media.fg` |
| `capture.iconButton` | 48dp, `color.media.fg` |

**Accessibility:**
- The shutter label is "Take photo".
- **Volume keys also fire the shutter.**
- TalkBack announces the tips on entry and each hint as it changes (live region polite).
- No flash is required.
- The image is resized to at most 4096px on the long side before upload.

**Copy:**
- Tips: "Fill the oval with your face", "Look straight ahead", "Find even light" (proposed wording of the brief's three tips).
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
- A vertical list of 4 steps, each 56dp min.
- Each step has a 24dp status glyph, a label (`type.body`) and an optional sub-line (`type.caption` muted).
- A 2dp connector line between glyphs: `color.border.strong` until the step is done, then `color.text`.
- The steps, as fixed in the brief: **Uploading → Analysing → Deleting photo from YouCam ✓ → Done**.

Status glyphs avoid every verdict silhouette.

| Step state | Glyph |
|---|---|
| pending | 1.5dp `color.border.strong` ring |
| active | 2dp `color.text` ring + a 6dp `color.text` centre dot (static) |
| done | `color.text` filled disc + check in `color.bg` |
| failed | 1.5dp `color.text` ring + a "–" bar |

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

**Component tokens:**

| Token | Value |
|---|---|
| `stepper.glyph.size` | `size.icon.lg` |
| `stepper.pending` | `color.border.strong` |
| `stepper.active` / `.done` | `color.text` |
| `stepper.connector.todo` / `.done` | `color.border.strong` / `color.text`, 2dp |
| `stepper.label.type` | `type.body` |
| `stepper.sub.type` / `.fg` | `type.caption` / `color.text.muted` |
| `stepper.row.minHeight` | 56 |
| `stepper.gap` | `space.3` |

**Accessibility:**
- The list is a live region (`accessibilityLiveRegion="polite"`). Each change is announced: "Step 3 of 4, deleting photo from YouCam." then "Photo deleted from YouCam."
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
- Below the button, a **destination line** (`type.caption`, muted, centred under the button, `space.2` gap), with a leading `search` 16dp icon.

**Variants and destination copy:**

| Variant | Label | Destination line |
|---|---|---|
| `betterMatchesFlipkart` | Find better matches | "Opens a Flipkart search, filtered to [Oily Skin]" (fixed pattern) |
| `betterMatchesAmazon` | Find better matches | "Opens an Amazon keyword search for "[keywords]"" (proposed, following the "Amazon keyword search" rule) |
| `betterMatchesNykaa` | Find better matches | "Opens a Nykaa keyword search for "[keywords]"" (proposed) |
| `backToProduct` | Back to product | "Returns to the [Flipkart] listing" (proposed) |
| `matchCard` | (card row, §19) | "Opens a Flipkart search for this product" (proposed) |

**States:**

| State | Spec |
|---|---|
| default | as the button variant |
| pressed / focused | §3 |
| offline | disabled; the destination line becomes "Needs a connection" (proposed, per brief §5.5) |
| filterUnverified | if gate G3 shows that the app drops the filter, the line says "Opens a Flipkart search for [Oily Skin]" (no "filtered") |
| loading | label "Opening…" up to 1s, then hand off |

**Component tokens:**

| Token | Value |
|---|---|
| `linkOut.button` | `button.primary.*` / `button.secondary.*` |
| `linkOut.icon` | `size.icon.md` |
| `linkOut.dest.type` / `.fg` | `type.caption` / `color.text.muted` |
| `linkOut.dest.gap` | `space.2` |

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
- An inline note: a 1dp `color.border.strong` leading rule, padding `space.3`.
- Lines in `type.bodySm`, `color.text`.
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

**Component tokens:**

| Token | Value |
|---|---|
| `disclosure.rule` | `color.border.strong`, 1dp leading edge |
| `disclosure.type` / `.fg` | `type.bodySm` / `color.text` |
| `disclosure.padding` | `space.3` |
| `disclosure.marginBottom` | `space.4` |

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
- A card (`color.surface.raised`, 1dp `color.border`, radius.card, padding `space.5`, `elevation.1`).
- An illustration panel (`color.surface.sunken`, radius.button; **paper grain allowed here**). It shows a generic, store-agnostic share sheet with a highlighted "SkinKey" tile outlined 2dp `color.text`. There are no store logos and no real app icons except our own.
- A title (`type.headline`).
- A 3-step numbered list (`type.reasonIndex` numerals + `type.body`).
- Actions: primary "Got it", tertiary "Paste a link instead".

**Variants:** `firstRun` (onboarding step "Find SkinKey in your share menu"), `homeTip` (a dismissible one-time tip on home: "In Flipkart, tap Share → SkinKey"), `pasteEqual` (if U1 / T2 / H5 fails, paste-a-link is shown at equal weight as a `secondary` button).

**States:**

| State | Spec |
|---|---|
| default | as above |
| dismissed | gone for good (stored); still reachable from /about "How to check a product" |
| pressed / focused (actions) | §3 |
| clipboardFound | a row "Use the copied link?" (proposed) + "Check it" (secondary). **Only after** the user opens the app; ask once per link. |

**Component tokens:**

| Token | Value |
|---|---|
| `teachCard.bg` / `.border` / `.radius` / `.padding` | `color.surface.raised` / `color.border` / `radius.card` / `space.5` |
| `teachCard.elevation` | `elevation.1` |
| `teachCard.art.bg` | `color.surface.sunken` + `surface.grain.opacity` |
| `teachCard.highlight` | `color.text`, 2dp |
| `teachCard.title.type` | `type.headline` |
| `teachCard.step.index` | `type.reasonIndex` |

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
- A card (`color.surface`, 1dp `color.border`, radius.card, padding `space.4`).
- Overline "Skin forecast · [city]" (`type.overline`).
- The main sentence (`type.headline`): "UV high today in [city]".
- A supporting line (`type.body`): "Humidity 78%. Your skin looked oily in your 1 Nov scan." (proposed; tabular numerals).
- Credit (`type.caption`, muted): "Weather: Open-Meteo (CC BY 4.0)" + "Updated 9:00" (proposed).
- An optional tertiary "Check a sunscreen" (proposed).

**Variants:** `uv`, `humidity`, `calm` ("UV low today in [city]").

**States:**

| State | Spec |
|---|---|
| loading | static skeleton lines (`color.surface.sunken`) |
| default | as above |
| noLocation | the card shows "Add location for a daily UV and humidity note." (proposed) + tertiary "Add location" |
| offline | **hidden** |
| cut / licence not cleared | not rendered |
| stale (> 6h) | "Updated [time]" stays; refresh on focus |
| pressed / focused | the whole card is not pressable; only the tertiary button is |

**Component tokens:**

| Token | Value |
|---|---|
| `forecast.bg` / `.border` / `.radius` / `.padding` | `color.surface` / `color.border` / `radius.card` / `space.4` |
| `forecast.kicker.type` | `type.overline` |
| `forecast.main.type` | `type.headline` |
| `forecast.body.type` | `type.body` |
| `forecast.credit.type` / `.fg` | `type.caption` / `color.text.muted` |

**Accessibility:**
- Readable as one sentence: the card is grouped, label "UV high today in Pune. Humidity 78 percent. Weather: Open-Meteo."
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
- An image frame (radius.card, 4:5).
- **Split view**: the left side is "Without", the right side is "With tint". There is a vertical 2dp `color.media.fg` divider with a 48dp circular handle (`color.inverse.surface`, chevrons `color.inverse.text`).
- Corner labels in hint chips (`color.inverse.*`): "Without" / "With tint".
- **A permanent caption bar under the image**: "Preview, not a shade guarantee" (`type.label`, `color.text`).
- A view switcher: an M3 segmented button "Without · Split · With tint", each 48dp.
- A note (`type.caption`, muted): "This preview is deleted from YouCam when you leave." (proposed; it must match `task/delete` behaviour).

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

**Component tokens:**

| Token | Value |
|---|---|
| `tryOn.frame.radius` | `radius.card` |
| `tryOn.divider` | `color.media.fg`, 2dp |
| `tryOn.handle.bg` / `.fg` / `.size` | `color.inverse.surface` / `color.inverse.text` / `size.touch.min` |
| `tryOn.label.bg` / `.fg` | `color.inverse.surface` / `color.inverse.text` |
| `tryOn.caption.type` / `.fg` | `type.label` / `color.text` |
| `tryOn.note.type` | `type.caption` |

**Accessibility:**
- **Dragging is never the only path.** The segmented switcher does the same thing.
- The handle is an `adjustable` role with increment / decrement actions (10% steps), label "Comparison divider, 50 percent".
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
- A card (`color.surface`, 1dp `color.border`, radius.card, padding `space.4`).
- Rank index "01" (`type.reasonIndex`).
- Product name (`type.headline`, up to 3 lines).
- Meta (`type.caption`, muted, tabular): "50 ml · ₹349 on the listing".
- A FITS tag (§27, `verdict` variant: seal icon 16dp + "FITS").
- **One reason line** (`type.reasonFact`, `color.text`).
- A band chip (`compact`).
- A divider.
- The link-out row: label "See it in Flipkart search" (proposed, `type.label`, `color.accent.text`) + `arrow-up-right` + the destination line.

**Variants:** `catalogue` (default), `nameOnly` (tag "Name only" + weaker reason), `compact` (no reason, for horizontal lists; **not used on /check**).

**States:**

| State | Spec |
|---|---|
| default | as above |
| pressed | the whole card is pressable (one target, ≥ 48dp tall), with `state.pressed.overlay` + scale 0.98 |
| focused | focus ring, radius.card + 2 |
| offline | the link row is disabled + "Needs a connection"; the card content stays readable |
| outOfStock / unknown availability | not shown. We don't know stock. |

**Component tokens:**

| Token | Value |
|---|---|
| `matchCard.bg` / `.border` / `.radius` / `.padding` | `color.surface` / `color.border` / `radius.card` / `space.4` |
| `matchCard.index.type` | `type.reasonIndex` |
| `matchCard.name.type` | `type.headline` |
| `matchCard.meta.type` / `.fg` | `type.caption` / `color.text.muted` |
| `matchCard.reason.type` / `.fg` | `type.reasonFact` / `color.text` |
| `matchCard.link.fg` | `color.accent.text` |
| `matchCard.gap` | `space.2`; list gap `space.3` |

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
- A full-bleed camera with a `color.media.scrim` mask.
- A **rectangular window** (80% width, 5:3) with four 24dp corner brackets (3dp `color.media.fg`).
- Hint text above the window (`type.body`, `color.media.fg`): "Point at the barcode" (proposed).
- A bottom bar with a torch toggle (48dp icon button, labelled) + **"Type the barcode"** (secondary on `color.media.scrim`, always visible).

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

**Component tokens:**

| Token | Value |
|---|---|
| `scanner.scrim` | `color.media.scrim` |
| `scanner.bracket` | `color.media.fg`, 3dp, 24dp arms |
| `scanner.hint.type` / `.fg` | `type.body` / `color.media.fg` |
| `scanner.torch.size` | `size.touch.min` |
| `scanner.manual.field` | `field.*` (§5) |

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
- A card (`color.surface.raised`, radius.card, padding `space.5`).
- A title (`type.headline`): "Show this to the pharmacist" (proposed).
- The **QR** (≥ 220dp, `color.qr.fg` on `color.qr.bg`, 16dp quiet zone, inside a 1dp `color.border` frame, radius.button).
- A countdown (`type.title`, tabular): "29 min left" (proposed format; update each minute, and each second only under 60s *visually*).
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
| expired | the QR is replaced by the sunken square + "This QR has expired." (proposed) + primary "Create a new QR" |
| revoking | Revoke → "Revoking…" |
| revoked | "Revoked. The link can keep working for up to a minute." (proposed; **never promise "instant"**); `CONFIRM` haptic |
| offline / error | "The QR page needs a connection." (proposed) + "Try again" |

**Component tokens:**

| Token | Value |
|---|---|
| `qrCard.bg` / `.radius` / `.padding` | `color.surface.raised` / `radius.card` / `space.5` |
| `qrCard.qr.bg` / `.fg` | `color.qr.bg` / `color.qr.fg` |
| `qrCard.qr.minSize` | 220 |
| `qrCard.countdown.type` | `type.title` + numeric |
| `qrCard.summary.type` / `.fg` | `type.bodySm` / `color.text.muted` |
| `qrCard.revoke` | `button.destructiveNeutral.*` |

**Accessibility:**
- The QR is an image, label "QR code for your shared bands".
- Countdown announcements go through a live region **at 25, 20, 15, 10, 5 and 1 minutes only, never every second**.
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
- Centred in the content area, max width 320dp.
- An icon disc (64dp `color.surface.sunken` circle, icon 32dp `color.text`; the paper grain is allowed on the disc's surrounding illustration panel only).
- A title (`type.headline`).
- A body (`type.body`, muted).
- A primary and/or tertiary action.

**Variants (copy):**

| Variant | Icon | Title / body | Actions |
|---|---|---|---|
| `noProfile` | `scan-face` line | "No profile yet" / "You can still check products by name. Scan for reasons based on your readings." (body proposed) | Start scan · Check a product |
| `profileDeleted` | `check` | "No profile yet" / "Your readings were deleted from this phone." (proposed) | Start scan |
| `offlineScan` | `cloud-off` | "You need a connection to scan" | (button disabled, not hidden) |
| `offlineBanner` (inline, top of content) | `cloud-off` 20dp | "You're offline. Catalogue checks still work." (proposed) | none |
| `error` | `info` | "Something went wrong" / "Try again in a moment." (proposed) | Try again → (2nd failure) Try later |
| `permissionCamera` / `permissionLocation` | `camera-off` / `map-pin-off` | why it's needed, one sentence | Open settings · Not now |
| `noMatches` | `search` | "No better matches in our catalogue yet" / "[n] products checked by hand." (proposed) | Back to product |

*UNKNOWN is **not** an empty or error state. It uses the Verdict card (§6).*

**States:** default; action pressed / focused / loading per §3.

**Component tokens:**

| Token | Value |
|---|---|
| `emptyState.disc.bg` / `.size` | `color.surface.sunken` / 64 |
| `emptyState.icon.fg` / `.size` | `color.text` / `size.icon.xl` |
| `emptyState.title.type` | `type.headline` |
| `emptyState.body.type` / `.fg` | `type.body` / `color.text.muted` |
| `emptyState.gap` | `space.4` |
| `offlineBanner.bg` / `.fg` / `.border` | `color.surface` / `color.text` / `color.border.strong` (1dp bottom) |

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
- `color.inverse.surface`, radius.button, padding `space.3` / `space.4`, `elevation.2`.
- Text in `type.bodySm` `color.inverse.text`, up to 2 lines.
- An optional action (`type.label`, `color.inverse.action`, 48dp target).
- It sits above the bottom nav or the sticky action bar, `space.3` gutter.

**Variants:** `info` ("Link copied", "Profile deleted"), `withAction` ("Couldn't open Flipkart." + "Try again", proposed).

**States:**

| State | Spec |
|---|---|
| entering | translateY 8dp + opacity, 320ms |
| visible | **4s**, or **10s** with an action; paused while TalkBack is on (stays until dismissed) |
| exiting | opacity 200ms, exit easing |
| action pressed / focused | overlay / focus ring |

**Component tokens:**

| Token | Value |
|---|---|
| `snackbar.bg` / `.fg` / `.action` | `color.inverse.surface` / `color.inverse.text` / `color.inverse.action` |
| `snackbar.radius` / `.padding` / `.elevation` | `radius.button` / `space.3`, `space.4` / `elevation.2` |
| `snackbar.type` | `type.bodySm` |
| `snackbar.duration` | 4000 / 10000 |

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

**Anatomy:**
- Container: `color.surface.raised`, 1dp top `color.border`, min height 80dp + gesture inset.
- 3 equal items: a 24dp icon in a 64 × 32dp active indicator pill (`color.chip.bg`), and a label below (`nav.label.type` = `type.caption` 13/18, 600 when selected).

| Item | Icon | Label | Route |
|---|---|---|---|
| 1 | `scan-search` | Check | `/` home |
| 2 | `scan-barcode` | Scan | `/scan` |
| 3 | `user-round` (neutral) | Profile | `/profile` |

**States:**

| State | Spec |
|---|---|
| default | icon + label `color.text.muted` |
| selected | indicator `color.chip.bg`; icon filled-weight 2dp stroke `color.accent.text`; label 600 `color.text`. Shown by indicator + weight + colour, never colour alone. |
| pressed | ripple inside the indicator |
| focused | focus ring around the item (≥ 48 × 48) |
| hidden | during onboarding, camera, capture and processing only; **always shown** on /check, including the medicine gate |

**Component tokens:**

| Token | Value |
|---|---|
| `nav.bg` / `.border` | `color.surface.raised` / `color.border` |
| `nav.indicator` | `color.chip.bg`, `radius.full`, 64 × 32 |
| `nav.icon.default` / `.selected` | `color.text.muted` / `color.accent.text` |
| `nav.label.type` / `.default` / `.selected` | `type.caption` (600 when selected) / `color.text.muted` / `color.text` |
| `nav.minHeight` | 80 |

**Accessibility:**
- `accessibilityRole="tab"` inside `tablist`; `selected` state; label "Check, tab 1 of 3".
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
- M3 modal sheet: `color.surface.raised`, top radius.sheet, `elevation.2`, over `color.scrim`.
- A drag handle (32 × 4dp `color.border.strong`, inside a 48dp tap target that toggles expand).
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
| opening / closing | translateY over `motion.duration.sheet`; scrim fades |
| expanded / half | two detents (50% / 90%) for long content |
| dragging | follows the finger; `GESTURE_END` on dismiss |
| loading (confirm action) | button loading state |
| focused | focus is trapped inside the sheet; it returns to the trigger on close |

**Component tokens:**

| Token | Value |
|---|---|
| `sheet.bg` / `.radius` / `.elevation` | `color.surface.raised` / `radius.sheet` / `elevation.2` |
| `sheet.scrim` | `color.scrim` |
| `sheet.handle` | `color.border.strong`, 32 × 4, target `size.touch.min` |
| `sheet.padding` | `space.5`; bottom = safe area + `space.4` |
| `sheet.title.type` | `type.headline` |

**Accessibility:**
- `accessibilityViewIsModal`. Back closes it (and gets predictive back).
- **The handle is never the only way to close.** There is a Close icon button (48dp) or a Cancel action.
- The title is announced on open.

**Copy:** the title says the task. Delete copy names exactly what is removed.

**Motion and haptics:**
- 300ms standard / exit easing.
- Reduce motion: a 120ms crossfade, no slide.

**Do / Don't:**
- Do confirm Delete in a sheet, with one tap from /profile.
- Don't nest sheets.
- Don't put the verdict in a sheet.

---

## 26. List rows

**Purpose:** settings, /about, What we keep, UNKNOWN next steps, the referral checklist, and zone lists.

**Anatomy:** min height 56dp (1-line) / 72dp (2-line), padding x `space.5`. Parts: optional leading icon (`size.icon.lg`, `color.text`), title (`type.body` or `type.label`), optional supporting text (`type.bodySm`, muted), and an optional trailing element (chevron, external arrow, checkbox, switch, value text). The divider is a `color.border` hairline, inset to the text.

**Variants:** `navigation` (chevron), `external` (arrow-up-right + "opens in browser"), `checkbox` (referral checklist; the whole row toggles), `radio`, `switch`, `value` ("Scan date · 1 Nov"), `nextStep` (UNKNOWN: icon + title + chevron).

**States:**

| State | Spec |
|---|---|
| default | as above |
| pressed | full-row `state.pressed.overlay` |
| focused | focus ring inset 2dp |
| checked | checkbox filled `color.accent` + check `color.on.accent`; the row text is unchanged |
| disabled | `color.text.muted` + reason sub-line |

**Component tokens:**

| Token | Value |
|---|---|
| `listRow.minHeight.one` / `.two` | 56 / 72 |
| `listRow.paddingX` / `.gap` | `space.5` / `space.4` |
| `listRow.title.type` / `.fg` | `type.body` / `color.text` |
| `listRow.support.type` / `.fg` | `type.bodySm` / `color.text.muted` |
| `listRow.divider` | `color.border` |
| `listRow.trailing.fg` | `color.text.muted` |

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

**Anatomy:** min height 24dp, padding x `space.2`, radius.xs, label `type.tag` (12dp, the floor), optional 16dp icon.

| Variant | Fill / text / border | Example copy |
|---|---|---|
| `neutral` | `color.chip.bg` / `color.chip.fg` | "Illustrative example", "Demo profile" |
| `outline` | transparent / `color.text` / 1dp `color.border.strong` | "Name only", "self-reported, not measured", "estimated from oiliness + moisture" |
| `source` | transparent / `color.text.muted` | "Open Beauty Facts (ODbL)" |
| `verdict` | `color.verdict.<s>.bg` / `color.verdict.<s>.fg` + the state icon 16dp | "FITS" (match cards only) |

**States:** static only. A tag is never a button; if it needs to be tappable, use a band chip (`interactive`) or a text link.

**Component tokens:**

| Token | Value |
|---|---|
| `tag.minHeight` | 24 |
| `tag.paddingX` | `space.2` |
| `tag.radius` | `radius.xs` |
| `tag.type` | `type.tag` |
| `tag.neutral.bg` / `.fg` | `color.chip.bg` / `color.chip.fg` |
| `tag.outline.border` | `color.border.strong` |
| `tag.verdict.bg` / `.fg` | `color.verdict.<state>.bg` / `.fg` |

**Accessibility:** tags are read inline with their parent node, not as separate stops.

**Copy:** lowercase qualifiers as written in the brief ("self-reported, not measured"). No "New!" and no "Hot".

**Do / Don't:**
- Do pair a verdict tag with its icon.
- Don't use a CAUTION tag on match cards.
- Don't go below 12dp.

---

## 28. QA checklist (per component, before merge)

- [ ] Only tokens are used; there are no hex values or primitives in component code.
- [ ] Light and dark are both checked. The dark primary is `#86A4A7` / `#0C171A` (6.84:1). The dark focus ring differs from the button fill.
- [ ] No text under 12dp. Every target is at least 48dp. Tested at 200% font with no truncated verdict label, reason or fixed string.
- [ ] TalkBack order matches the spec. Decorative icons and meters are hidden. Live regions are polite.
- [ ] Reduce motion: 120ms crossfades only. Nothing loops. The grain is static and off in dark mode.
- [ ] No red anywhere. No triangle, shield, pill or mortar. CAUTION tint only in the verdict head.
- [ ] Fixed strings match brief §4.3 character for character (`·`, `→`, `;`, and the `(scan 1 Nov)` style).
- [ ] The banned-words scan (brief §4.4) passes on every string.
- [ ] Haptics follow the §1.5 table. There is no `REJECT` on verdicts.
- [ ] Commissioner tracking is checked on a real Android device.
