# On-device test findings (Samsung SM-A276B, Android 16, release APK + local mock Worker, 2026-11-02 ~09:15 IST)

## Functional
1. **FIXED (emulator QA 2 Nov: warm shares and a share on top of an open check both land).** ~~CRITICAL: a share sent while the app is already running is ignored.~~ The screen shows "Nothing to check yet". Cold-start shares work (Flipkart, Amazon, Nykaa). The warm-start intent (onNewIntent / expo-share-intent hook when the app is foregrounded or backgrounded) must be handled: reset the check state for each new share.
2. **FIXED (option b: brand-page rows that passed the second verbatim read count, labelled "Checked against the brand page"; human ticks labelled separately).** ~~CRITICAL for the demo: catalogue hits show UNKNOWN.~~ The product is in the catalogue (Minimalist SPF 50 from brand_official), but the verdict says "We can't read this listing's ingredients" and "Our catalogue: 0 verified products". The cause is that verification gating requires a human tick in data/catalog/verified.json, and there are 0 ticks. Fix one of two ways: (a) tick the demo rows, or (b) let brand_official rows that passed the two-agent verbatim check count as "checked against brand page", and label the human-ticked rows separately.
3. **FIXED** (displayTitle title-cases lowercase slugs). Flipkart title shows the raw lowercase slug ("vaseline gluta hya dewy radiance"). Title-case it and/or resolve it through the catalogue or Claude.
4. **FIXED** (SPF / size / "Body" mismatches disqualify; emulator QA goes straight to a name-only UNKNOWN). Amazon share "Minimalist SPF 30 Body Sunscreen …" offered the wrong SKUs (SPF 50, SPF 60). The fuzzy-match threshold is too loose. Token mismatches like SPF 30 vs 50 or "Body" should disqualify a candidate, and "None of these" should lead to a name-only check.
5. **FIXED** (Nykaa back-link and store search open in a Custom Tab). Nykaa: product URLs open in Chrome, not the app. Search URLs open the app home. Outbound to Nykaa must use the browser (already the plan).
6. **FIXED** (Home share-teaching card: "Find Silver Mirror in your share menu, then pin it"). The share sheet shows only pinned and recent apps first, so the app isn't visible without scrolling. The pin coach mark is essential.

## Visual / UX (feeds the redesign)
- The app follows phone dark mode, and dark mode reads as generic flat black. Both themes need a real design (decision: follow the phone, both redesigned).
- The bottom tab bar is the unstyled default: white bar, placeholder icon, a single "Home" tab.
- Home: walls of text, no brand moment, the share tip card is cut off at the fold, and the "Check it" button competes with the input.
- Buttons: the primary fill is washed grey-blue (low energy), and secondary buttons are outlined boxes everywhere, so there's no hierarchy.
- The provenance ledger's "PRODUCT" key wraps to "PRODUC / T". The key column is too narrow.
- Consent screen: a long legal block before any warmth, and the chips look like tags rather than "what we keep".
- Verdict screen: the UNKNOWN card works structurally. Too many full-width buttons stack at the bottom (Find better matches, Back to product, plus three store buttons).

Screens: 01–19 *.png in this folder; contact sheets sheet.png, sheet2.png, sheet3.png, sheet4.png.

## Production (live Worker) findings — 2026-11-02 ~10:00 IST
7. **FIXED in code (needs a Worker redeploy + APK on a phone to confirm live): the phone follows the short link itself (XHR, aborted once headers arrive) and sends the listing URL; the Worker parses slug + pid with no network call; the server fallback keeps one redirect header with an honest client id and an 8 s timeout. Tests: apps/mobile/src/features/share/flipkartFollow.test.ts, apps/worker/test/claude.test.ts.** ~~CRITICAL: Flipkart short links don't resolve on the live Worker.~~ POST /v1/resolve with `https://dl.flipkart.com/s/qPYPSuNNNN` gives `outcome: unknown, extractedTitle: null`. The same lookup works from a residential IP. The Worker's `flipkartLocation` sends a GET with no User-Agent and a 4 s timeout from Cloudflare IPs, which Flipkart probably blocks or stalls. Fix:
   - (a) **Resolve on the phone first:** `fetch(shortUrl)` → read `response.url` (the final link address only), cancel the body, and send that URL in `ResolveRequest.url`. The Worker parses the slug and pid from a `flipkart.com/.../p/...` URL without any network call.
   - (b) Server fallback: send a mobile browser User-Agent and allow a longer timeout (8 s).
   - (c) Test both paths.
8. **CRITICAL (config, needs Aman): live `/v1/install` returns "Install tokens are not configured".** `INSTALL_HMAC_SECRET` was missing from `.env` when the secrets were uploaded, so an empty value was stored. It has now been generated in `.env`. Aman runs once:
   `cd /home/aman/youcam && set -a && . ./.env && set +a && cd apps/worker && printf '%s' "$INSTALL_HMAC_SECRET" | npx wrangler secret put INSTALL_HMAC_SECRET --env production`
   Re-check with `curl -X POST https://skinkey-worker.skinkey-worker.workers.dev/v1/install`.

## Review batch, 2 Nov (design critique, craft, copy truth and functional QA of the Silver Mirror build)
Re-checked on the build VM: web shots (`design/web-shots`, `design/web-shots/site`) and the emulator walkthrough
(`design/emulator-shots`, light + dark) of the rebuilt release APK.

Fixed:
- **Pore-zone legend** (ZoneGlyph): each swatch draws its own hatch lines; Medium = single hatch, High = cross-hatch, in both themes (url(#pattern) did not resolve across Svg roots on Android).
- **Demo reading called a scan**: zone lines say "sample reading" and the caption reads "Sample zones · Demo reading · no photo taken"; reason lines on the Demo reading say "sample reading".
- **Better matches pill covering copy**: it now sits inside the dock, above Back to listing, only while the section is off screen.
- **Product title**: catalogue rows show brand · name in the title and the pack size (without "also …") in the meta line; raw marketplace titles drop their SEO tail ("Minimalist SPF 30 Body Sunscreen"), cap at 3 lines, and the full listing title moves to the ledger's Product row.
- **Home under the status bar**: a bg scrim covers the status area once Home scrolls; the hero sheen fades into the page instead of ending on a hard, rounded edge.
- **Reading tab indicator**: the active pill remounts with its fill so Android keeps the 16dp radius (it rendered square).
- **Share tip**: "Paste a link instead" removed; the mock share strip has labelled tiles (Messages, Copy link) instead of grey bars.
- **Better matches cards**: one reason line ("Niacinamide · fits your oiliness reading"); full reason stays in the TalkBack label.
- **Rule jargon**: "Rule SUP-2 · literature-graded", ledger "SUP-2 (literature-graded)"; rule ids never break at the hyphen.
- **UNKNOWN redundancy**: catalogue count once (under Next step); the provenance caption above the ledger is gone.
- **Settings**: Published rules uses the info icon (seal-check is FITS only) and the same short ruleset version as each verdict; group heads align to the gutter; dividers inset both sides; Withdraw consent has its own icon.
- **How this was made (app)**: shared-link and label checks are recorded (resolve / labelOcr ledgers); the static Delete steps are a numbered list, not empty rings; the duplicated 30-day line is gone; empty-state copy says sample checks make no calls.
- **Scan consent**: "Read how deletion works" is a chevron tertiary like every other text action; the face frame sits straight on the sheen plate (no card in a card). Disabled label contrast is 4.89:1 light / 5.34:1 dark (check-contrast), so no token change.
- **Reading tab**: the Demo reading shows once (badge + one line); "estimated from your bands" is a caption; one focus trait is a full-width row.
- **Sample share**: now a catalogued product (Minimalist Niacinamide 10% Face Serum), so the first demo verdict has reasons; the dock says "Back to home" instead of pointing at a listing that does not exist. Paste placeholder shortened to "Paste a link or name".
- **Try-on demo previews** (web `?demo=` only): token-drawn face-frame plates labelled "Sample preview", no raster MOCK slabs, honest shade labels.
- **Site /rules**: phone rows stack as cards with column heads; desktop cells wrap; regex families sit behind a "Pattern" disclosure; the old app name in a rule citation is swapped at render time (rule data unchanged, so ruleset 440f555a8845 holds).
- **Site landing lookup**: verdict labels sit on their own line under the profile name (no clipping); the ingredient field keeps icon and value on one row.
- **Site /how**: "Delete failed: Delete failed:" fixed; on phone the three diagrams become stacked lists (no 5px labels); the prompt table stacks; the overflowing box label is shorter.
- **Site misc**: developer note "Release link pending…" removed; nav CTA is tonal (one primary per view); "0 of 136 … plus 0 more" reads "None of the 136 …"; audit result sentences in Geist; botanical plates framed and dimmed in dark; highlighted INCI no longer detaches from its comma.
- **Copy truth**: README renamed (Silver Mirror, Your reading, share paths, honest verified-catalogue wording); Worker scan error says "your reading"; stale proposal strings updated; lint-claims now fails on "SkinKey", "Your/Demo/Delete Key", "No Key yet".
- **QA script**: one extra scroll after Better matches (Amazon's first card) and a medicine-gate share.

Checked, no change:
- Web greeting "Good morning" vs "Good afternoon" in one run: the shots straddled 12:00 IST (06:29–06:30 UTC); the greeting uses the device's local hour. The kit's "Good evening" is a fixed demo clock.
- "Nose pore reading: High" appended to oiliness reasons is spec §2B wording (G1 fail example), kept.

Still open (not in this batch):
- Item 7 (Flipkart short links on the live Worker) and item 8 (INSTALL_HMAC_SECRET) above.
- secrets:grep on the VM checks patterns only (no .env there): run it locally or with the key values before submission.
- FIXED 2 Nov pm: greige focus tiles in dark (greige.850, less saturated), light-mode chrome S contrast (stops one step deeper). Still open, minor: dark-mode UNKNOWN icon disc, landing scrollytelling spacing on desktop, nested cards on the landing fold, reason-card hierarchy, kit-2 MEDICINE state.

## Final hardening (2 Nov pm)

From the emulator QA report (`c89d60a`, local-worker APK, mock Worker) and the judge panel. Gates: typecheck, Vitest, Jest (`test:rn`), lint:claims and check-contrast all pass; both APKs rebuilt.

Fixed:
- **Dark-mode camera screen unreadable (QA 1, high).** `CaptureGuide` painted its surround with `inverse-surface`, near-white (#E7E5EC) in dark mode, under the white Back chevron, shutter ring and frame corners. New token `component.captureGuide.surround` = `graphite.950`, dark in both themes like a viewfinder, gated in check-contrast (on-overlay on surround); light status-bar icons while the camera is open. Applies to scan and try-on.
- **Try-on label put words in the seller's mouth (QA 2, EU-2).** "The listing says one shade suits everyone. Try it on me" now shows only when the listing makes a `one_shade` / `universal_tint` claim (no catalogue row does today); a single colour on file reads "Try this shade on me". Button labels lost their full stop (DESIGN.md §9.4), and the entry has the face-frame icon.
- **Try-on buried under the pore map (EU-3).** The entry now sits straight under the reasons.
- **"Better matches" pill missing after a second share (QA 4).** A new share resets the scroll position and the remembered geometry (Android can clamp the offset without an onScroll).
- **Better-match cards opened a brandless Flipkart search on every store (EU-1).** Cards now search `<brand> <name>` in the store the product was shared from (Nykaa in a Custom Tab, Amazon, else Flipkart); caption and TalkBack say which store. The web uses brand + name too. `packages/rules` `engine.ts` still builds its Flipkart `searchUrl` from the bare name: left unchanged to keep `packages/rules` behaviour identical to the frozen audit (ruleset hash `440f555a8845` still matches; note `engine.ts` / `index.ts` file hashes already differ from `audit/rules-frozen.json` after the rename and SKU commits, as the README says); the app and web no longer read it.
- **Minor:** "Why · 0 reasons" → "Why"; try-on heading keeps the pack size on its own line (no dangling " ·"); mock try-on renders are labelled as placeholders for TalkBack.
- **Docs (TI-1, TI-3, M1, M2, IDEA-1/3/4, D1, D3):** README, DEVPOST, DEMO_SCRIPT and STATUS now say try-on is reachable on 7 of 11 tinted rows (brand-sourced colours, `hex_source`), describe the resolver as catalogue-first with Claude as the fallback, add "Who else this helps" (`/v1/label-check` with a mock-Worker curl and its real response), a new tagline, a demo opening that names CeraVe and OCC-2, and a live in-app Foxtale try-on beat (22 units, dry run first, spike still as fallback). Gallery: `12-tryon-light.png` (grey sample ovals) replaced by `12-tryon-youcam-spike.png` and `16-tryon-in-app-dark.png`; `11-verdict-states-light.png` cropped above the orphaned icon. README states the test counts, that skin tone in mock mode follows the documented shape, and that the delete state machine is unit-tested, not yet run live.
- `ops/vm/qa-tryon.sh` matches the new single-shade label.

Still open:
- **QA 3 (cold share into a leftover task lands on Home).** Only reproduced by force-stopping the app while the camera permission dialog is up; likely emulator-specific. Not changed; qa-tryon.sh clears the leftover task. Check once on the Samsung.
- **App's own live YouCam chain never run end to end (TI-2):** upload slot → `src_file_id`, skin tone live, per-task deletes on a shared file (G2, G3, G7). Needs the Worker redeploy, then STATUS checklist step 2b. Not done here (no live calls from this session).
- No front camera on the AVD: the guide opens on the front lens and shows black until flipped; the app doesn't switch lenses on its own (real phones have a front camera).
- Better matches still repeat the destination line per card (DESIGN §9.5 asks for one shared line), and the first card's lavender tint can read as featured.
- Judge-panel suggestions not taken in this batch: getTask 400 → "gone" before any delete, scan job with no error message when a task expires, delete-after-shared-file confirmation GET, `image/jpg` upload content type, two filled primaries on UNKNOWN, Reading-tab status-bar scrim, medicine-gate title length, try-on consent duplicate line.

## Showcase match (2 Nov pm)

Screens restyled to Aman's showcase (`design/reference/silver-mirror-showcase.png`, crops in `design/reference/showcase/`) in packages P1–P4 plus round 1 (`cb855c6`, `f1834e9`, `8baeea6`, `c91f744`, `5eca0a7`). The changes: pale lavender-grey page, white radius-24 cards with hairline and soft shadow, sans headings (serif only on the wordmark), lavender icon discs, slate pill CTAs with arrow (pearl in dark), centred screen titles with a back arrow, a flat white tab bar with a filled active glyph, a segmented store picker, square thumb tiles, a gradient skin-type hero, "What this means for products" focus tiles, corner-bracket frames with checklist cards, and the liquid-silver welcome. Dark is a designed graphite version.

- Gates on the VM (17:30 IST): typecheck, Vitest 551 passed / 1 skipped, Jest `test:rn` 26 passed, lint:claims 0 violations, check-contrast 0 failures.
- Both APKs rebuilt: `silver-mirror-release.apk` at 17:34 IST (workerUrl = live Worker) and `silver-mirror-release-localworker.apk` at 17:39 IST (workerUrl = `http://localhost:8787`). Both bundles contain the new strings ("Your skin type", "Share from a store app", "What this means for products").
- Emulator, localworker APK, mock Worker restarted on the current tree: `qa-full.sh light fresh` 0 failures, `qa-full.sh dark` 0 failures, `qa-tryon.sh light all` and `dark all` 0 failures after the script fix below (Foxtale two shades and Re'equil one shade rendered; Flipkart settled in 4 s).
- **QA script fix:** the restyled verdict's taller reason card left "Try two shades on me" in the UI tree but under the sticky bottom bar (Better matches pill + Back to listing), so the tap hit the bar and consent never opened. `ui.sh` gains `where` and `nudge`. `qa-tryon.sh` lifts the entry above the bar before it takes the shot and taps. The checks themselves are unchanged.
- `docs/screens/` 01–10 and 16 refreshed from these shots (04 from the web shot). `11-verdict-states-light.png` still shows the old serif kit strip, because the kit route can't be captured full height without the shot script's seeding.
- Still open from the critiques: Demo reading shows a single focus tile, the welcome backdrop is flatter than the reference, and the face-frame oval is narrow.
