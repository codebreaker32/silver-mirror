# Design critique: current app vs the Silver Mirror direction

Date: 2026-11-02. Reviewer pass for the Silver Mirror re-skin.

Sources: on-device shots in `design/device-shots/` (01–19, sheet1–4; Samsung SM-A276B, Android 16, **dark mode only**), `design/device-shots/BUGS.md`, and the code in `apps/mobile/src`. The yardstick is `design/reference/silver-mirror-moodboard.md`, with the product law in `research/skinkey_v2_spec.md`, the copy rules in brief §4, and the impeccable craft floor.

Stage: late refinement. The structure, accessibility work and verdict semantics are worth keeping. The look is not. Nearly every finding below is a re-skin, a re-composition or a copy change, not new behaviour. Functional bugs 1–4 in BUGS.md are out of scope here except where they change what a screen shows.

Severity: **Critical** = blocks the demo story or breaks a product rule. **Moderate** = clearly hurts hierarchy, trust or polish. **Minor** = finish.

---

## Overall impression

In two seconds the current app reads as a well-written document with no visual identity: warm brown-black paper, a sans "SkinKey" set as plain text, outlined boxes everywhere and a stock white Expo tab bar with a placeholder glyph. None of the moodboard is present yet. There is no chrome-S mark, no pearl or lavender surfaces, no slate primary pill, no rounded field cards and no designed dark mode. The biggest opportunity is cheap: the token pipeline already drives every component (no raw hex found in `apps/mobile/src`), so moving the palette, primary button, card language and type roles in `design/system/tokens/skinkey.tokens.json` re-skins about 80% of the app at once. The rest is per-screen composition: Home, the verdict action bar and the consent fold.

---

## System-level findings (fix once, every screen improves)

| # | Finding | Severity | Recommendation |
|---|---|---|---|
| S1 | **No brand anywhere.** The launcher icon and adaptive foreground are the Expo template "A" (`assets/images/android-icon-foreground.png`, `icon.png`). `splash-icon.png` is the Expo logo, and `app.json` `name` is still "SkinKey". This icon and label are exactly what users have to find in the Flipkart/Amazon share sheet (BUGS #6). | Critical | Draw the chrome-S as SVG (a silver gradient stroke on a pearl tile) and export the adaptive foreground, background, monochrome, icon and splash from it. Set `expo.name` to "Silver Mirror" and keep `android.package` as `app.skinkey`. Splash background moves from `#FAF7F2` to the pearl token, with a dark splash variant. |
| S2 | **The palette is Clay & Ink, not Silver Mirror.** Dark `bg` is `sand.950` (warm brown-black) and the accent is `ink.300` `#86A4A7`, the "washed grey-blue" in BUGS. Light mode is warm sand paper. | Critical | Add primitives for `pearl` (about `#F6F5F8`), a `silver`/lavender-grey ramp, `slate` (about `#3B3F52`), `greige` (about `#CFC4BB`) and `graphite` for dark. Semantic mapping, light: bg pearl, surface white, surface-raised white with a soft shadow, accent slate. Dark: bg graphite/slate (about `#1B1D25`), surface one step lighter with a faint lavender cast, text pearl, **primary pill = pearl fill with slate text** (an inverted pill, not teal). Rebuild with `build-tokens.mjs` and re-run `check-contrast.mjs` (on the VM). |
| S3 | **No primary-button hierarchy.** The secondary variant is a 1.5px outlined box and it is used for nearly every action ("Check it", "Try a sample share", the three store searches, "Back to product", "Go to Home"). Primary is a pale teal slab. On 13_verdict_top three filled teal buttons are visible at once. | Critical | Primary: full-width slate pill (radius = height/2), at most **one per screen state**. Secondary: soft translucent pill (a pearl or silver tint fill, no hard outline), as on the moodboard's splash. Tertiary: text with a chevron. Remove the outlined-box look from `button.secondary` entirely. |
| S4 | **Two parallel UI kits.** `features/check/ui` and `features/scan/ui` both define Button, Icon, Tag and Sheet. Their icon names differ (`arrow-up-right` vs `arrowUpRight`), and so do headings: check/home headings use the serif `type.headline` ("Check a product", "Better matches"), while scan/settings/how headings use the sans `Heading` ("Before your scan", "Settings", "How this was made"). Back affordances differ too: a `←` arrow on Check, a `‹` chevron on Scan/Settings/Key. | Moderate | Merge into one `src/ui` kit before re-skinning, or at minimum make both read the same component tokens. Type roles follow the moodboard: **serif = wordmark, screen display titles and the verdict subtitle only. Section headers = sans semibold.** One back icon (thin chevron), one app-bar component. |
| S5 | **The bottom tab bar is the unstyled default.** It is a white bar in dark mode with the system-blue label "Home", a placeholder icon and a single tab (`app/(tabs)/_layout.tsx`). The Android nav bar below it is grey on Home and dark elsewhere. | Critical | Either style it with three tabs (**Home · Your reading · Settings**, 1.5px line icons, slate active pill, token bg, both themes) or remove the tabs layout. Three tabs also fix S6. Do not copy the moodboard's five tabs: we have no routine, products or community tab to fill them. Theme the system nav bar via edge-to-edge and a token background. |
| S6 | **Settings is unreachable.** Nothing in the app routes to `/settings` (grep: only SettingsScreen itself links out). Credits, About and the second "Withdraw consent" path cannot be found. | Critical | A tab (S5) or a 48dp settings icon button on the Home header. |
| S7 | **Dark mode is the only theme ever tested, and it is undesigned.** Light mode has never been seen on a device. | Critical | Design both themes from the S2 tokens, capture both on device, and add light shots to `design/device-shots/`. |
| S8 | **Card language.** Cards are flat warm-grey slabs with hairlines. Inputs are underline-only fields on near-black fills, so the paste field barely reads as an input (02_home). | Moderate | Moodboard: 16–20px radius, white/surface fill, a hairline **or** a soft offset shadow (y 2–4, blur 12–16, low alpha), never both heavy. The input becomes a rounded filled field with a visible 1px border (≥3:1) and an inline trailing action. |
| S9 | **Kickers and overlines.** "WHAT WE KEEP", "YOUR DATA", "ABOUT", "PHOTOS ON THIS PHONE", "DELETE STEPS", "Your Key" (KeyCard `Overline`) and "Is this the product?" above the product title all hit the craft-floor kicker ban. | Moderate | Make them real sans-semibold section headers, or delete them and let the content speak. "Is this the product?" is redundant once the SKU sheet has confirmed the product. |
| S10 | **Colored left border >1px on the verdict head.** `VerdictHead.tsx` sets `borderLeftWidth: 3` in the tone colour (craft-floor refuse). | Moderate | Carry the tone with a full soft tint fill, the tone icon in a tinted circle (like the moodboard's droplet-in-lavender-circle) and the label. Use a uniform 1px border (dashed for UNKNOWN). |
| S11 | **Unicode glyphs as icons.** "No photos stored by SkinKey ✓" (`HowScreen.tsx:116`) and "Deleted from YouCam ✓" (`HowThisWasMadeSheet.tsx:20`). | Minor | Use the drawn `check` icon in a thin circle, as on the moodboard's checklist. |
| S12 | **Numbered indices as decoration.** The italic serif "01/02/03" on SKU candidates (08_check, sheet2) and match cards carries no information. | Minor | Keep numbers only on the share-steps list, where order matters. Candidates get a category glyph tile or thumbnail instead. |
| S13 | **The rename has not happened.** Roughly 70 user-facing occurrences of SkinKey, Your Key, Demo Key, No Key yet, Delete Key and Making your Key remain across `apps/mobile/src` and `packages/contracts/src/copy.ts` (see the checklist at the end). | Critical | Do one sweep using the glossary. Update `copy.ts` first, because fixed strings live there. |

---

## Per-screen fix lists

### 1. Launch / splash (01_launch, app icon)
What draws the eye: the white "SkinKey" text. There is no mark.
1. **Critical.** Replace the Expo icon and splash with the chrome-S (S1). The splash is a pearl gradient in light and graphite with a silver sheen in dark, with the S mark centred. Avoid a full-bleed liquid photo, which would be heavy in the APK and risky on contrast.
2. **Moderate.** Optional first-run welcome per the moodboard: mark, serif "Silver Mirror", one-line subtitle, slate pill "Get started", translucent secondary "Try a sample share". Only add it if it costs no extra step before a share can be checked, because share-first is the product.

### 2. Home (02_home, 03_home_scrolled; `features/home/*`)
Eye goes to the "SkinKey" wordmark (correct), then straight to a large outlined "Check it" box (wrong). The share tip, which is the main way in, is cut off at the fold.
1. **Critical.** Header: chrome-S tile (32–40dp) + serif "Silver Mirror" + a settings icon button (S6). Replace the tagline "The tag says oily skin. Your scan and the ingredients get a vote." It is clever but slow for the non-native readers the brief writes for. Candidate: "Check a product against your skin reading before you buy." A time-of-day greeting ("Good morning") is fine. **Do not add a name field** just to personalise it.
2. **Critical.** "Your reading" summary card per the moodboard: a lavender circle with a droplet icon, "Your reading" / "Skin-type reading: Combination" / "Scan 2 Nov · photo deleted", and a chevron. The empty state is "No reading yet" / "Scan once (about a minute)" with a slate pill "Start scan" inside the card. The current `KeyChip` is a shrink-wrapped dark slab (`alignSelf: 'flex-start'`) that does not look tappable. Make it full width.
3. **Critical.** One primary path. "Check a product" becomes a sans section header, followed by a rounded field with a trailing inline "Check" button inside the field (an icon-plus-label pill). That removes the competing full-width "Check it" outline. The field needs a visible border at ≥3:1 and a paste affordance ("Paste" chip when the clipboard holds a URL, if cheap).
4. **Moderate.** Compact share tip that fits above the fold on a 6.5" phone: replace the three empty rounded squares (they read as broken art) with a mini share-sheet strip of generic app tiles where the highlighted tile **is the real chrome-S icon and the label "Silver Mirror"**. That teaches the exact icon to look for (BUGS #6). Show one store line at a time, picked by a Flipkart / Amazon / Nykaa segmented control (this reuses the moodboard's AM/PM segment pattern for something real), and drop the always-visible Amazon line. "Got it" becomes a small tertiary dismiss, not a full-width filled button.
5. **Moderate.** "Try a sample share" becomes a translucent secondary pill with its caption beneath. Today it is a third outlined box of the same weight as everything else.
6. **Minor.** Footer lines (cosmetic guidance, not affiliated) at caption size in muted text are fine. Keep them.

### 3. Check: idle / "Nothing to check yet" (16, 17; `CheckScreen.tsx` idle branch)
Shown for warm-start shares because of BUGS #1. The visual fix does not replace the functional fix.
1. **Critical (functional, BUGS #1).** Reset the flow on each new share intent.
2. **Moderate.** The empty state needs an illustration (the share-sheet strip from Home §2.4) and a slate pill "Paste a link". The current outlined "Go to Home" box and a single sentence feel like an error. Copy: "In Flipkart, Amazon or Nykaa, tap Share → Silver Mirror." Nykaa is missing from today's line.

### 4. Check: SKU confirm sheet (08_check, 11/12, 19; `SkuConfirmSheet.tsx`)
Structurally good ("We check nothing until you pick" is excellent honesty copy). Visually it is a list of outlined boxes over a blurred skeleton.
1. **Moderate.** Candidate rows become 16px-radius surface cards with a soft shadow. Use a category glyph or product thumbnail tile on the left instead of the italic "01/02", the name in sans semibold, and the size variants on a second muted line ("50 g · also 30 g, 100 g"). Mark the selected state with a check circle as well as colour.
2. **Moderate.** Raise the "None of these" tertiary to a full-width translucent pill. It is the honest escape and currently looks like a footnote. Once BUGS #4 is fixed it leads to a name-only check, so say that: "None of these: check by name only".
3. **Minor.** Use a sheet handle and corner radius from the new card radius. The sheet bg should be one step above the screen in dark so it is not the same brown as the page.

### 5. Verdict (13, 14, 15, 18; `VerdictSheet`, `VerdictHead`, `UnknownPanel`, `CheckScreen` action bar)
Eye goes to "Find better matches" (a sticky filled pill), then "Snap the ingredient list." (also filled), then the UNKNOWN card. The verdict should be first.
1. **Critical.** Reading order: product title → **verdict card** → reasons → next step → provenance → matches. Today "Scan for reasons based on your readings" plus two tertiary links ("Start scan", "Use the Demo Key") sit *above* the verdict and push it down. Move them below the verdict as one compact "No reading yet" inline card with a single slate pill "Start scan" and a text link "Use the Demo reading".
2. **Critical.** Action-bar overload (BUGS: "too many full-width buttons"). The bar shows a filled "Find better matches" **even while the Better matches section is on screen** (15), and the screen above it adds a second filled primary ("Snap the ingredient list."). Fix: the action bar holds **one** slate pill, "Back to Nykaa listing" (the destination named in the label, so the caption line can go), plus a small secondary pill "Better matches" that hides once the matches section is visible. On UNKNOWN, "Snap the ingredient list" is the screen's primary *inside the content* and becomes a translucent pill in the bar. Drop the trailing period in the button label.
3. **Critical.** Verdict card in the new language (S10): soft tone tint, tone icon in a tinted circle, label in tracked caps, serif subtitle. FITS = muted sage/teal, CAUTION = soft amber (**never red**), MEDICINE = ink outline, no tint. **Watch out:** the moodboard's "UNKNOWN = cool slate" collides with the new slate primary pill. Give UNKNOWN a pearl/neutral fill with a dashed slate 1px border and the dashed-circle icon, so it can never read as a button. Re-verify that all four remain distinguishable in greyscale (label + icon + border style).
4. **Critical (functional, BUGS #2).** "Our catalogue: 0 verified products." under a known product reads as broken. Until verification gating is fixed, this count line damages trust in every demo shot.
5. **Moderate.** Product title (Flipkart slug, BUGS #3): title-case it, and show the store as a small source chip ("Flipkart") instead of the share-icon app-bar text.
6. **Moderate.** Add a small `Demo reading` badge next to the verdict, not a full-width tag row, when the Demo reading is in use.

### 6. Provenance ledger "Where this comes from" (14; `ProvenanceLedger.tsx`)
The dispensing-label idea is good and on-brand for "show the working". Execution:
1. **Moderate.** "PRODUCT" wraps to "PRODUC / T" because the fixed `keyWidth` and the tracked caps collide. Use sentence-case sans-semibold keys ("Product", "Rules", "Limits") and size the key column from the longest key, or stack key over value below 360dp width.
2. **Moderate.** Re-skin as a rounded surface card with hairline row dividers instead of 1.5px full-width rules top and bottom. The rule in `text` colour is the strongest line on the screen and draws the eye away from the verdict.
3. **Minor.** "Published rules vb7cbc69" means nothing to shoppers. Use "Published rules (version b7cbc69)" with the link, and keep the hash muted.

### 7. Better matches (15; `BetterMatches.tsx`)
1. **Moderate.** Three stacked full-width outlined "Search Flipkart ↗ / Amazon.in ↗ / Nykaa ↗" boxes, each with a caption, form a wall. Use a single row of three store chips (the moodboard's filter-chip pattern) with one shared caption: "Opens a keyword search for 'sunscreen' in the store app (Nykaa: browser)". Each chip stays ≥48dp tall, with an accessibility label naming the destination.
2. **Moderate.** Match cards become moodboard product cards: white/surface, soft shadow, a FITS tag, a one-line reason, and "See it in Flipkart search ↗". Drop the decorative index number.
3. **Minor.** Keep "Ranked by fit to your readings. No paid placements." It is the honesty line, and the 1px left rule is allowed. Set it as caption-size muted text so it doesn't compete with the header.

### 8. Consent: "Before your scan" (04_scan; `ConsentScreen.tsx`)
1. **Critical.** **The 18+ checkbox is below the fold** while the sticky footer says "Tick to confirm you're 18 or older" next to a disabled "Start scan". The user sees an instruction with nothing to tick. Move the checkbox row into the sticky footer directly above the buttons, or make the footer helper scroll to it.
2. **Critical.** Warmth before legal (BUGS). Open with a pearl hero showing the face-frame brackets illustration (no real face) and the serif title "Before your scan". Follow it with three short icon rows using thin line icons: "One photo, analysed by YouCam", "Deleted from YouCam right after", "Only bands kept, on this phone". The approved privacy line (fixed string) follows as body text, not as the 40sp lead it is today: at that size a long legal sentence becomes the hero.
3. **Moderate.** "What we keep" chips look like filter tags (BUGS). Render them as a checklist with a check-circle icon per row, or as pearl pills with a small lock/phone icon. Drop the "WHAT WE KEEP" overline (S9) and use a sans header "What stays on this phone".
4. **Moderate.** Button pair: "Start scan" becomes a slate pill (disabled state clearly muted but still legible at ≥4.5:1 for the label as the token notes claim) and "Not now" becomes a text button. Two equal outlined boxes hide the primary action.

### 9. Capture (no device shot; `CaptureGuide.tsx`, `CaptureScreen.tsx`)
1. **Moderate.** Apply the moodboard's analyze framing to the live camera: a rounded frame, thin corner brackets and an optional faint dotted mesh drawn as an SVG overlay (no real face in shipped art). Show the light/position hints as one pill at a time over the preview.
2. **Minor.** Capture a device shot of this screen in both themes. It is unreviewed.

### 10. Processing (no device shot; `ProcessingScreen.tsx`, `ui/Stepper.tsx`)
1. **Moderate.** This is the moodboard's checklist card, and our steps are real: Uploading ✓ → Analysing (YouCam HD) ✓ → Reading results ✓ → Deleted from YouCam ✓. Put the stepper in a rounded surface card under a face-frame placeholder with the brackets. Thin circle-check icons for done, a ring with a dot for active, and the existing live-region announcements (already good).
2. **Moderate.** Copy: "Making your Key" becomes "Making your reading".
3. **Minor.** The single authored motion moment for the app lives here: the bracket frame gently resolving as each step completes, with exponential ease-out, respecting reduce-motion (the hook exists in `scan/ui/useReduceMotion.ts`).

### 11. Result / "Your reading" (no device shot of a real reading; `ResultScreen.tsx`, `KeyCard.tsx`, `BandChip.tsx`, `ZoneGlyph.tsx`)
1. **Critical.** Moodboard report layout: a skin-type card (droplet in a lavender circle, "Skin-type reading: Combination", one plain line), the reading bands as soft pill chips (LOW / MEDIUM / HIGH, **never numbers**), then "What this means for products" as three square icon tiles. **The tiles must come from the published rules/facet map (deterministic), not from Claude.** **Do not use the moodboard's "Barrier repair"**: "repair" is a banned word (brief §4.4). Use cosmetic tiles such as "Lighter textures", "Hydration", "Fragrance-free".
2. **Moderate.** "Score bands only" in the photo-deleted stamp (`KeyCard.tsx`) mixes "score" into the no-score story. Use "Photo deleted · bands only".
3. **Moderate.** "Delete Key" becomes "Delete my reading". Both destructive actions become neutral text-style buttons with a trash icon at the bottom, not two stacked outlined boxes.
4. **Moderate.** Heading "Your Key is ready" becomes "Your reading is ready". The share coach mark that follows should reuse the Home share-strip art (chrome-S tile).

### 12. Your reading: empty (05_key; `KeyScreen.tsx`)
1. **Moderate.** A lone scan-face icon in a dark circle above a serif "No Key yet" feels unfinished. Use a pearl card with the face-frame brackets illustration, "No reading yet", one body line, a slate pill "Start scan" and a translucent pill "Use the Demo reading".
2. **Minor.** Centred multi-line body copy: left-align it on mobile for scanability, or keep it to one line.

### 13. Settings (06_settings; `SettingsScreen.tsx`)
1. **Critical.** Make it reachable (S6).
2. **Moderate.** Group the rows into rounded inset cards ("Your data", "About") with sans-semibold group headers instead of tracked overlines. Each row is ≥48dp with a leading line icon and a chevron. "Withdraw consent" keeps its trash icon, but the icon belongs leading, not trailing, so it doesn't read as a delete-row control.
3. **Minor.** The About block is six muted paragraphs. Make it a credits list with one item per line and keep the fixed strings verbatim. "Roadmap: … Not built yet." can stay but should sit last.

### 14. How this was made (07_how; `HowScreen.tsx`, `HowThisWasMadeSheet.tsx`)
Strong honesty content, weakest layout: a long wall of muted text with an arrow-chain sentence.
1. **Moderate.** Render the delete steps as the same vertical checklist/stepper used on Processing (one visual language for "real steps"), not a "→"-joined sentence.
2. **Moderate.** "Photos on this phone" becomes a status card with a check-circle icon (S11) and the "Check again" action as a small secondary pill, not a full-width outline.
3. **Minor.** Each recorded call becomes a compact card (service, task id muted mono for the id only, units, time, delete status chip).

### 15. Try-on (no device shot; `features/tryon/*`)
1. **Moderate.** Apply the same consent pattern as the scan (icon rows, sticky checkbox) and present the two shades side by side in rounded frames with "Preview, not a shade guarantee" (fixed rule 4.2.6). **No before/after slider** (moodboard Do-NOT list).
2. **Minor.** Capture device shots.

---

## Visual hierarchy summary
- **What draws the eye first today:** Home: the outlined "Check it" box. Verdict: the sticky filled "Find better matches". Consent: a 40sp legal sentence. All three are wrong.
- **What it should be:** Home: the "Your reading" card, then the check field. Verdict: the verdict card. Consent: the warm hero and the three promises, with the slate "Start scan" as the only filled element.
- **Rule for the re-skin:** one slate pill per state, serif only for display moments, and whitespace from tokens (tight inside groups, `space[7]+` between sections, more above a header than below).

## Consistency

| Element | Issue | Recommendation |
|---|---|---|
| Headings | Serif on home/check, sans on scan/settings/how | Serif display title per screen; sans semibold section headers everywhere (S4) |
| Back control | `←` arrow (check) vs `‹` chevron (scan, settings, key) | One thin chevron in a 48dp target, one app-bar component |
| Buttons | Outlined boxes used for primary, secondary and link-outs alike | Slate pill / translucent pill / text (S3) |
| Steps | Stepper on Processing, arrow sentence on How, italic numbers on share tip and SKU sheet | One checklist component for real steps; numbers only where order matters |
| Cards | Flat slabs, hairlines and 1.5px ink rules mixed | One card recipe: 16–20 radius, surface fill, hairline or soft shadow |
| Icons | Lucide-style 1.75 stroke in check/ui, separate set in scan/ui, Unicode ✓ | One drawn set at 1.5px stroke (moodboard) |
| Chips | KeepChip, BandChip, Tag all differ | One pill chip recipe with variants (reading, keep, verdict tag) |

## Accessibility
- **Color contrast:** Dark tokens currently pass (muted text 5.01:1 on surface-raised, teal button label 6.84:1, per the token notes). For the new palette: slate `#3B3F52` on pearl `#F6F5F8` is about 9.6:1 (good for the primary pill and body). **Greige `#CFC4BB` on pearl is about 1.6:1**, so greige may only be a fill or decorative accent, never text or a meaning-bearing border. Lavender-silver surfaces need muted text re-tuned so it reaches ≥4.5:1, tinted from slate rather than grey. Run `check-contrast.mjs` on the VM after the token change, for both themes and all four verdict heads.
- **Touch targets:** Button and icon-button tokens already enforce 48dp. Risks in the redesign: store chips in a row, the inline "Check" button inside the field, and the tab bar. All must stay ≥48dp tall with ≥8dp gaps.
- **Text readability:** Body sizes are generous. The consent lead at about 40sp is too large for a legal sentence, so reduce it to body-large. Avoid centred multi-line body text (05_key).
- **Screen reader:** Labels and hints are thorough (KeyChip, store buttons, verdict head `headA11y`, live-region stepper). Keep them through the rename: every "Key" in accessibility labels needs the glossary sweep too. The share-tip art label must change to "Share menu with Silver Mirror highlighted".
- **State not by colour alone:** Verdict icons are distinct silhouettes (seal, half circle, dashed circle, pharmacist). Keep them. The UNKNOWN versus slate-primary collision (§5.3) is the only new risk.

## What works well (keep through the re-skin)
- Honest, specific copy: "We check nothing until you pick", "This doesn't mean it's bad", "Ranked by fit to your readings. No paid placements."
- The verdict architecture: tint confined to the head, a distinct icon per state, the medicine gate with no tint, reasons first, provenance visible.
- The token pipeline is real and used everywhere. No raw hex found in `apps/mobile/src` UI code, so the re-skin is mostly a token edit.
- The live-region announcements on the stepper and verdict, the haptics on landing, and the 48dp targets.
- The share-first flow and the SKU confirmation sheet structure.

---

## Priority recommendations (do in this order)
1. **Brand and rename (S1, S13):** the chrome-S SVG feeds the icon, splash, Home header and share-tip art. `app.json` name and `copy.ts` move to Silver Mirror plus the glossary. Without this, the demo and the share sheet still say SkinKey with an Expo icon.
2. **Tokens re-skin (S2, S3, S8, S7):** the pearl/slate/greige/graphite palette, pill buttons and card recipe, in light and dark. This one change fixes most of the "generic flat black" and "no hierarchy" findings.
3. **Verdict screen composition (§5.1–5.3):** verdict first, one primary in the action bar, the UNKNOWN treatment that cannot be mistaken for a button. Pair it with BUGS #1 and #2 so demo shots show real verdicts.
4. **Home recomposition (§2):** a "Your reading" card, one check field with an inline action, and a compact share tip using the real icon, above the fold.
5. **Navigation (S5, S6):** a styled three-tab bar or a header settings button. Themed system nav bar.
6. **Consent fold (§8.1–8.2):** checkbox next to "Start scan", warmth before legal.
7. **Result / Your reading (§11):** skin-type card, band chips, rule-derived focus tiles (no "repair", no numbers).
8. **Kit merge and consistency (S4, S9–S12):** one UI kit, one icon set, no kickers, no Unicode icons.

## Coverage gaps (capture before sign-off)
Never seen on device: **light mode (all screens)**, a FITS verdict, a CAUTION verdict, MEDICINE, a filled "Your reading", Capture, Processing, Result, Try-on, error states. Re-shoot these after the re-skin, in both themes, at default and largest font scale.

## Rename checklist (user-facing only; keep `app.skinkey`, the worker URL and code identifiers)
- `apps/mobile/app.json` `expo.name` → "Silver Mirror".
- `packages/contracts/src/copy.ts`: `medicine` subtitle, `noReadingsSubtitle` ("try the Demo reading"), `shareTipTitle`, per-store share paths, `amazonCoachMark`, `privacyLine` ("Silver Mirror stores no photo; …"), Flipkart facet line, `coachMark`. Brief §4.3 lists the privacy line as a fixed string, so record the brand substitution in the brief too.
- `features/home/KeyChip.tsx` (No Key yet / Demo Key / Your Key / "Open your Key"), `HomeScreen.tsx` (hint "Demo Key", caption), `ShareTipCard.tsx` (steps, art label, tile label).
- `features/check/CheckScreen.tsx` (Demo Key tag, "Use the Demo Key", not-skincare and idle copy), `present.ts` ("No Key on this phone", "Demo Key: …", "SkinKey catalogue"), `useCheckFlow.ts` (rate-limit line), `components/LabelCamera.tsx`.
- `features/scan/*`: ProcessingScreen ("Making your Key"), ResultScreen (Your Key ×3, "No Key yet", "Your Key is ready"), errors.ts, CaptureGuide.tsx, HowScreen.tsx ("Your Key scan", "No photos stored by SkinKey").
- `features/key/*`: KeyScreen (Your Key, No Key yet, Use the Demo Key), KeyCard (Overline, Demo Key tag, "trying SkinKey", "Delete Key"), SettingsScreen (Your Key row, Demo Key in use, No Key yet), ConfirmSheet and deleteCopy (check them for "Key").
- `features/matches/BetterMatches.tsx` ("use the Demo Key", "Leaves SkinKey").
- Re-run the a11y and copy tests on the VM after the sweep (`a11y.test.ts` and the contracts tests may assert old strings).
