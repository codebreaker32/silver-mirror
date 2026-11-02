# Silver Mirror redesign: implementation checklist per screen

Spec: `/DESIGN.md` (§9 per screen). Tokens: `design/system/tokens/skinkey.tokens.json` v2.0.0 → `theme.ts` (already regenerated; the app re-skins on the next build because every component reads tokens). Brand: `apps/mobile/src/brand` (`SilverMark`, `Wordmark`, `BrandLockup`, `SheenBackdrop`, `FaceFrame`). Copy: `packages/contracts/src/copy.ts` (`COPY.appName`, `COPY.reading.*`, `COPY.shareTo`, `COPY.scanStepsDone`).

**Owner groups:** `home` (app shell, Home/Check tab, Reading tab, Settings), `check` (verdict flow, matches, try-on), `scan` (consent → capture → processing → result, How), `web` (`apps/web`).

**Done already (design director, commits a11bb6f, 9f7bcce, e347a30):** tokens + contrast gate (332 pairs, 0 failures), fonts wired (`useFonts(fontAssets)` now loads Noto Serif Display + Geist), brand components, launcher icon / adaptive / monochrome / splash light+dark / favicon, `app.json` name "Silver Mirror", shared COPY rename, rules-engine "Demo reading" provenance, worker "Try the Demo reading." messages.

**Every screen, every group (definition of done):**
- [ ] Tokens only: `theme.colors.*`, `theme.components.*`, `theme.typography.*`; no raw hex, no new font names.
- [ ] Buttons are pills: one `button.primary` per screen state; `secondary` = tonal; `tertiary` = text + chevron. Delete the 1.5dp outlined-box look.
- [ ] Back = one chevron-left icon button (48dp) in the app bar; no "←" text glyph.
- [ ] Icons: 1.5 stroke SVG; no unicode ✓ / ⋯ / → as icons or decoration (use the drawn check-circle).
- [ ] No kicker/eyebrow above headings (`WHAT WE KEEP`, `YOUR DATA`, `ABOUT`, `Your Key` overline, "Is this the product?"). Section heads = `type.section`, sentence case.
- [ ] Serif only for display/title/verdict line/product name (≥20dp). Section heads and reasons are Geist.
- [ ] 48dp targets, `accessibilityLabel` on icon-only controls, decorative icons hidden, every glossary word also swept in a11y labels.
- [ ] Rename sweep with the glossary (DESIGN.md §10); user-facing only.
- [ ] Capture light **and** dark (`npm run shots:web`, `npm run emu -- qa dark|light`) and check at font scale 1.3 and 2.0.
- [ ] Remote checks green: `npm run typecheck`, `npx vitest run`, `npm run test:rn -w @skinkey/mobile`, `npm run lint:claims`.

---

## P0: app shell (home)

| Screen | Files | Tasks |
|---|---|---|
| Root + tab bar | `apps/mobile/src/app/_layout.tsx`, `apps/mobile/src/app/(tabs)/_layout.tsx`, new `apps/mobile/src/app/(tabs)/scan.tsx` + `reading.tsx` (or route the tabs to `/scan` and `/key`) | - [ ] Three tabs **Check · Scan · Reading** per `component.bottomNav` (72dp, `surface-raised`, slate/pearl 56×32 indicator, 2.0 vs 1.5 stroke, 600 vs 400 label, `role` tablist/tab + selected). Icons tag-check / face-frame / droplet (custom SVG).<br>- [ ] Kill the stock white bar and the placeholder icon (`components/Placeholder.tsx`, `assets/images/tabIcons`).<br>- [ ] Android nav bar + status bar themed to `color.bg` both modes (expo-system-ui / edge-to-edge).<br>- [ ] Root `Stack` `contentStyle: { backgroundColor: theme.colors.bg }` so no white flash in dark.<br>- [ ] Fonts already load via `fontAssets`; keep the splash until loaded. |
| Shared UI kit | `apps/mobile/src/features/check/ui/*`, `apps/mobile/src/features/scan/ui/*` | - [ ] Either merge into `apps/mobile/src/ui` (Button, Icon, Sheet, Tag, Text, Screen, Checkbox, Stepper) or re-skin both kits to the same tokens. One icon name scheme (kebab-case), one back icon.<br>- [ ] Button variants read `component.button.*` incl. `radius.full`, `trailingIcon`, `leadingIcon`.<br>- [ ] Sheet: radius 28, handle 36×4, Close always, `bottomSheet.sheenEdge` top hairline in dark. |

## Home = Check tab (home)

| Screen | Files | Tasks |
|---|---|---|
| Home | `apps/mobile/src/app/(tabs)/index.tsx`, `features/home/HomeScreen.tsx` | - [ ] Top bar: `<BrandLockup variant="header" />` + 48dp gear → `/settings` (fixes "Settings unreachable").<br>- [ ] Greeting `type.display` by time of day ("Good evening"), one muted line with the real catalogue count. Replace the slow tagline with "Check a product against your skin reading before you buy."<br>- [ ] Hero band on `<SheenBackdrop />` holding the reading card.<br>- [ ] Order: reading card → "Check a product" section → paste field → compact share tip → tonal "Try a sample share" → footer captions. All above the fold on a 6.5" phone except the footer.<br>- [ ] Rename: "SkinKey" (3). |
| Reading card | `features/home/KeyChip.tsx` (rename file optional) | - [ ] Rebuild as `component.readingCard`: full width (drop `alignSelf: 'flex-start'`), icon disc droplet, "Your reading" / "Skin-type reading: …" / "Scan 2 Nov · photo deleted", chevron, ≤3 band chips; one target, one label in visual order.<br>- [ ] Empty: "No reading yet" + slate **Start scan** + tonal **Use the Demo reading** (`COPY.reading.*`).<br>- [ ] Rename: "Your Key", "Demo Key", "No Key" (3). |
| Paste field | `features/home/PasteLinkField.tsx` | - [ ] `component.field`: white pill, 56dp, 1dp `border-strong`, inline trailing **Check** pill (48dp) inside the field; label above, error below (2dp text-colour edge + info icon). Remove the separate full-width "Check it" outline. |
| Share tip | `features/home/ShareTipCard.tsx`, `features/home/tipStore.ts` | - [ ] `component.shareTeachingCard`: mini share-sheet strip of 3 generic tiles where the highlighted tile is `<SilverMark size={40} accessibilityLabel="Silver Mirror" />` with the label "Silver Mirror"; segmented Flipkart / Amazon / Nykaa showing one `COPY.sharePaths` line; tertiary "Got it". Delete the three empty rounded squares.<br>- [ ] Art a11y label: "Share menu with Silver Mirror highlighted".<br>- [ ] Rename: "SkinKey" (4; most now come from COPY). |

## Reading tab + Settings (home)

| Screen | Files | Tasks |
|---|---|---|
| Your reading | `apps/mobile/src/app/key.tsx`, `features/key/KeyScreen.tsx`, `KeyCard.tsx`, `KeyPanel.tsx`, `BandChip.tsx`, `ZoneGlyph.tsx`, `BandEditSheet.tsx` | - [ ] Reading card expanded + band list (`component.bandList`: rounded card, hairlines, bodyStrong values, 3-segment neutral meter, no numbers) + zone glyph + stamp `COPY.reading.photoDeletedStamp` (replaces "Score bands only") + `verdictCard.demoBadge` when demo.<br>- [ ] Empty: `<FaceFrame width={…} />` plate, serif "No reading yet", slate **Start scan**, tonal **Use the Demo reading**; left-aligned body.<br>- [ ] `destructiveNeutral` **Delete my reading** (leading trash) → confirm sheet.<br>- [ ] Rename: KeyScreen (5), KeyCard (4): "Your Key", "No Key yet", "Delete Key", "Demo Key", "Score bands only". |
| Confirm sheet | `features/key/ConfirmSheet.tsx` | - [ ] Sheet re-skin; destructive confirm = slate primary with explicit verb ("Delete my reading"), cancel = tonal. Rename (2). |
| Share coach mark | `features/key/ShareCoachMark.tsx` | - [ ] Reuse the Home share-strip art with the chrome-S tile. Rename (2). |
| Settings | `apps/mobile/src/app/settings.tsx`, `features/key/SettingsScreen.tsx` | - [ ] Grouped inset cards (`listRow.groupBg`, `groupRadius`), group heads "Your data" / "About" in `type.section` (no tracked overlines). Rows ≥56dp, leading icon, chevron; "Withdraw consent" trash icon **leading**.<br>- [ ] **Credits must change** (truth): "Fonts: Noto Serif Display and Geist (SIL Open Font License)".<br>- [ ] Rename: "SkinKey" (3). |
| Key store copy | `features/key/store.ts` | - [ ] One user-facing "Key" string (check and rename if shown). |

## Check flow (check)

| Screen | Files | Tasks |
|---|---|---|
| Idle / nothing to check | `apps/mobile/src/app/check.tsx`, `features/check/CheckScreen.tsx` (idle branch) | - [ ] Empty state per DESIGN.md §9.14: share-strip art, serif "Nothing to check yet", `COPY.shareTo` (adds Nykaa), slate **Paste a link**. |
| SKU confirm | `features/check/components/SkuConfirmSheet.tsx` | - [ ] Candidate radio cards: sunken category-glyph tile (drop italic "01/02"), bodyStrong name, muted size line, mismatched SPF/size tokens bold, check-circle on selection.<br>- [ ] Full-width tonal **None of these: check by name only**. Keep "We check nothing until you pick." |
| Product header | `features/check/components/ProductHeader.tsx` | - [ ] Serif `type.title`, title-cased; store as `productHeader.sourceChip*` chip; drop the "Is this the product?" kicker after confirmation. |
| Verdict head | `features/check/components/VerdictHead.tsx` | - [ ] Delete `borderLeftWidth: 3`. Use `verdictCard.head.<v>`: radius 20, padding 20, 40dp `iconDisc` with the 24dp icon, caps label, serif `verdictLine`; dashed edge for UNKNOWN / name-only; demo badge.<br>- [ ] MEDICINE: no box, pharmacist 32dp, one serif line, ~28% down. |
| Verdict sheet + order | `features/check/components/VerdictSheet.tsx`, `CheckScreen.tsx` | - [ ] Order: header → verdict → reasons → next step → ledger → matches. Move "Scan for reasons…" + "Start scan" + "Use the Demo Key" **below** the verdict as one compact "No reading yet" card (slate **Start scan** + text **Use the Demo reading**).<br>- [ ] Dock (`component.actionBar`): ONE primary "Back to {store} listing" + 48dp round tonal **More** (store searches sheet) + "Better matches" pill only while that section is off screen. UNKNOWN: "Snap the ingredient list" (no trailing period in the label) is the in-content primary.<br>- [ ] Rename: CheckScreen (4), `useCheckFlow.ts` (1), `flow.ts` (1). |
| Reasons | `features/check/components/ReasonList.tsx` | - [ ] `reasonRow`: section head sans, reading line `type.reason`, fact `type.body`, rule tag caption; drop decorative numerals. |
| UNKNOWN panel | `features/check/components/UnknownPanel.tsx` | - [ ] Neutral dashed head; next steps; real catalogue count (`COPY.catalogCount`), never "0 verified" for a known product (BUGS #2 fix landed in c950e07: verify the copy). |
| Provenance ledger | `features/check/components/ProvenanceLedger.tsx`, `features/check/present.ts` | - [ ] Receipt card (`provenanceLedger.bg`, `radius`, hairlines), sentence-case keys **Reading / Product / Rules / Limits** (`present.ts` emits `SKIN`/`RULES` keys today: switch to sentence case), `keyWidth` 96 (fixes "PRODUC / T"), "Published rules (version b7cbc69)".<br>- [ ] Rename in `present.ts` (3): "Demo Key: labelled sample readings, not a scan" → "Demo reading: labelled sample readings, not a scan"; "No Key on this phone" → "No reading on this phone"; "Demo Key (sample readings)" → "Demo reading (sample readings)". Update `present.test.ts:84` (`/^Demo Key/` → `/^Demo reading/`). |
| Label camera / INCI editor | `features/check/components/LabelCamera.tsx`, `InciChipEditor.tsx` | - [ ] Camera brackets from `captureGuide.bracket*`; INCI chips as pills (`component.chip`), flagged = outline + icon, uncertain = dashed. Rename (1). |
| How-this-was-made sheet | `features/check/components/HowThisWasMadeSheet.tsx` | - [ ] Replace "Deleted from YouCam ✓" text tick with the checklist row (drawn check-circle). |
| Better matches | `features/matches/BetterMatches.tsx` | - [ ] Honesty line caption-size with 1dp rule; reading filter chips; `productMatchCard` (thumb tile, reason line, verdict tag, destination caption; first card on `heroBg`); store searches as a row of 3 chips + one shared destination line (replace 3 stacked outline boxes); drop index numerals. Rename (2). |
| Try-on | `apps/mobile/src/app/tryon.tsx`, `features/tryon/TryonConsent.tsx`, `TryonScreen.tsx`, `TryonResult.tsx` | - [ ] Consent like scan consent (equal-weight pair); progress = checklist card (`COPY.tryonSteps`); result = two equal portrait cards + shade chips + `COPY.tryonCaption` on the plain surface; no slider, no Save. |

## Scan flow (scan)

| Screen | Files | Tasks |
|---|---|---|
| Consent | `apps/mobile/src/app/scan/index.tsx`, `features/scan/ConsentScreen.tsx`, `features/scan/consent.ts` | - [ ] Hero: `<FaceFrame />` on the sheen + serif "Before your scan" + three icon-disc rows.<br>- [ ] "What stays on this phone" checklist card (`consentSheet.keepBox`, `keepIcon` / `dropIcon`); drop the `WHAT WE KEEP` overline and tag-looking chips.<br>- [ ] `COPY.privacyLine` as body (`consentSheet.privacyLead` is now bodyStrong, not the 26dp title), qualifier behind "Details".<br>- [ ] **Move the 18+ checkbox into the sticky footer directly above** the `consentPair` (equal weight, both tonal pills). |
| Capture | `apps/mobile/src/app/scan/capture.tsx`, `features/scan/CaptureScreen.tsx`, `CaptureGuide.tsx`, `captureHints.ts` | - [ ] 24dp-radius frame, 4 white brackets (`captureGuide.bracket`, `bracketWidth` 3, `bracketLength` 28), 1.5dp oval, one hint pill at a time, 72dp shutter ring (3dp). Rename (1). |
| Processing | `apps/mobile/src/app/scan/processing.tsx`, `features/scan/ProcessingScreen.tsx`, `features/scan/steps.ts`, `features/scan/ui/Stepper.tsx` | - [ ] `<FaceFrame progress={doneSteps / 4} />` with the `bracketResolve` animation (ease `glide`, 420ms; reduce motion = jump).<br>- [ ] Checklist card (`component.checklistCard` + `processingStepper`), done labels from `COPY.scanStepsDone` with a drawn check-circle; replace the "✓" appended in `steps.ts` (update `pure.test.ts`, `runScan.test.ts`, `tryon.test.ts` expectations together).<br>- [ ] Stamp "Photo deleted · 21:04" on the delete row; muted "Stay on this screen…" line.<br>- [ ] Title `COPY.reading.making`. Rename (1). |
| Result | `apps/mobile/src/app/scan/result.tsx`, `features/scan/ResultScreen.tsx`, `OverlayToGlyph.tsx` | - [ ] Serif `COPY.reading.ready`; skin-type card (droplet disc); band chips; three `focusTile`s from the facet map (never "repair"); accuracy note once; coach mark with share-strip art; slate **Check a product**.<br>- [ ] Rename (5). |
| How this was made | `apps/mobile/src/app/how.tsx`, `features/scan/HowScreen.tsx`, `features/scan/deleteCopy.ts` | - [ ] Serif lead `COPY.howMadeBoundary`; delete steps as the checklist card; "Photos on this phone" status card + tonal **Check again**; recorded calls as compact cards; remove "No photos stored by SkinKey ✓" text tick. Rename (3). |
| Errors | `features/scan/errors.ts` | - [ ] Rename (2) ("Demo Key" → "Demo reading"); error states per DESIGN.md §9.14 (no red, recovery named). |
| Crop step | `features/share/CropStep.tsx` | - [ ] Pill buttons, brackets, `COPY.cropWarning`. |

## Web (web)

| Page | Files | Tasks |
|---|---|---|
| Shell + fonts | `apps/web/index.html` (fonts + title done), `apps/web/src/routes/Layout.tsx` | - [ ] Credits: "Type: Noto Serif Display and Geist (SIL Open Font License)" (Layout.tsx:77). Wordmark: inline `design/brand/wordmark.svg` (`fill: currentColor`) + `design/brand/silver-mirror-mark.svg`. Favicons from `design/brand/png/favicon-32.png` / `-192.png`. Rename (5). |
| Landing | `apps/web/src/routes/Landing.tsx`, `components/landing/*` (`Compare`, `Honesty`, `BuiltOn`, `GetTheApp`) | - [ ] Sheen hero, serif one-line story, slate "Try a sample share", tonal "Get the Android app", device loop in a plain outline, 3-step strip, APK QR card. Rename (Landing 3, Compare 3, Honesty 3, BuiltOn 1, GetTheApp 1). |
| Check / shared result / rules / how | `routes/Check.tsx`, `SharedResult.tsx`, `Rules.tsx`, `How.tsx`, `components/VerdictCard.tsx`, `components/LabelSlot.tsx` | - [ ] Verdict head + ledger per DESIGN.md §8.4–8.6 using `--sk-verdict-card-head-*`, `--sk-provenance-ledger-*`. `LabelSlot.tsx` canvas font → `Geist` (lines 29, 48). Rename (Check 4, SharedResult 2, Rules 3, How 4, `lib/api.ts` 1). |

---

## Order of work (critical path to the demo)
1. home: tab bar + Home header/reading card/paste field/share tip (the share-sheet icon now exists; this is what judges see first).
2. check: verdict order + head + dock (BUGS: five stacked buttons), ledger key fix, present.ts rename.
3. scan: consent 18+ fold fix, processing checklist + bracket moment, result focus tiles.
4. home: Reading tab + Settings credits.
5. web: rename + credits + verdict styles.
6. Everyone: light + dark captures, font scale 1.3/2.0, then `npm run shots:web` and the emulator QA re-run.
