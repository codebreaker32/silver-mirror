# SkinKey loop progress

Each entry: what was done, verification, what's next. Priority list lives in ops/RALPH_PROMPT.md.

## Status board
- [x] 1. Monorepo green (install, typecheck, test)
- [x] 2. Spike findings applied
- [x] 3. Catalog merged + AUDIT.md
- [x] 4. Tier 1 flows E2E against mock
- [x] 5. Worker `wrangler dev` mock + smoke script
- [x] 6. Web pages + vite build
- [x] 7. Android debug APK
- [ ] 8. Quality (copy linter, a11y, secret grep, README)

## Needs Aman
- **Install the APK on the phone**: `adb install apps/mobile/android/app/build/outputs/apk/release/app-release.apk` (standalone), then `adb reverse tcp:8787 tcp:8787` with `npm run dev:worker` running. Not run on a device yet: there is no phone/emulator on the VM (no KVM).
- (STATUS.md morning checklist: selfie for band calibration, Flipkart audit screenshots, hallway tests, demo video)
- **Catalogue verification ticks**: 0 of 176 rows are verified, so better matches and "N verified products" show 0 until a human ticks rows. Check a `brand_official` row's INCI against its `source_url`, then add its id to `data/catalog/verified.json` and run `npm run catalog:merge`. Ticks on retailer rows are ignored by design. About 10 ticks across sunscreen/moisturiser/cleanser would cover the demo.
- **Shade colours for try-on**: none of the 11 real tinted rows has a shade hex, so the phone no longer offers try-on on them (the Worker would reject it). For the demo, add `shades: [{name, hex}]` for 1–2 tinted SKUs (hex picked from the brand's official swatch), then `npm run catalog:merge`.

---

## 2026-11-01 — Iteration 1: monorepo green
- `npm install` on the VM (1242 packages, node v24.22.2).
- Typecheck was red in rules/web/worker: `packages/rules/src/engine.ts` used `VerdictBasis`/`VerdictResult` without importing them (re-exported as types). Added them to the `@skinkey/contracts` import; all cascading errors (audit.ts, web lib/rules.ts, worker routes/rules.ts) cleared.
- Removed stray tracked file `0` at repo root (an accidental redirect output listing env var names + lengths; no values).
- Gitignored `ops/ralph.log` (loop runner output, churns every iteration).
- Verification:
  - `npm run typecheck` → all 6 workspaces pass, 0 errors.
  - `npm test` → 37 files passed, 1 skipped (worker integration, needs live worker); 438 tests passed, 1 skipped.
- Note: `npm run lint` → `lint-claims: TODO (RULES agent)` stub; tracked under item 8.
- Next: item 2 (spike findings: inverted bands, delete-confirm retry, share parsers, coach mark, Nykaa Custom Tab, real fixtures).

## 2026-11-01 — Iteration 2: spike findings applied
- **Bands**: inversion was already in `packages/rules/src/bands.ts` (oiliness/redness/pore `higher_is_less_visible`). Added a test with the real G1 raw scores (99.5 oiliness / 100 pore / 96.2 redness → Low).
- **Delete confirm**: the engine already confirms with 3 GETs 2 s apart (`TIMING.confirmDelayMs/maxConfirmChecks`). Added `scan.test.ts` case pinning exactly 3 confirming GETs ≥2000 ms apart, then `delete_failed`.
- **Share parsers**: `packages/contracts/src/share.ts` (finished + exported). Flipkart `dl.flipkart.com/s/` → `needsRedirect`; Worker `ctx.flipkartLocation()` does ONE `redirect:'manual'` GET (strict URL shape as an SSRF guard), reads only the Location header and cancels the body. In mock mode it returns the fixture Location. `/v1/resolve` uses slug-derived title. Amazon title = text minus prefix and URL; Nykaa "Check out <title> on Nykaa" + /p/<id>. Phone `parseShareText` delegates to the shared parser. Tests: `packages/contracts/test/share.test.ts` (exact FINDINGS payloads), worker `claude.test.ts` (one redirect fetch, never fetches non-short-links, Amazon title), mobile `parse.test.ts`.
- **Coach mark**: `COPY.amazonCoachMark` = "Amazon: Share → More → SkinKey" + `COPY.sharePaths`; shown in ShareTipCard and ShareCoachMark.
- **Nykaa outbound**: `StoreLink.opener` (`custom_tab` for Nykaa), `openStoreUrl()` uses `expo-web-browser` for nykaa.com (better matches + back-to-listing). Test in `links.test.ts`.
- **Fixtures**: G1 fixture was already real/redacted. Added `scripts/redact-spike-fixtures.mjs` → `spike-g5-foundation.json`, `spike-g5-lip.json`. The mock now serves the real G5 result; removed hand-written `makeup-vto.json`. `apps/worker/test/fixtures.test.ts` checks fixtures equal the spike JSON (minus URLs) and contain no `X-Amz-`/amazonaws/AKIA/ttl30.
- Fixed: contracts has no DOM lib → module-scoped `declare const URL` in share.ts.
- Verification: `npm run typecheck` all workspaces 0 errors; `npm test` 39 files passed, 1 skipped; 459 passed, 1 skipped; mobile `jest` 7/7.
- Next: item 3 (catalog.json merge + AUDIT.md).

## 2026-11-01 — Iteration 3: catalogue merged + AUDIT.md
- `packages/rules/src/catalogMerge.ts`: `mergeCatalog()` (deterministic, first row wins) and `sourceKindOf()` (brand_official / retailer / third_party by host). It drops rows with `inci_complete:false`, no https source, third-party decoder sources (CureSkin) or out-of-scope categories (beard oil), and dedupes on id and GTIN. A human tick from `data/catalog/verified.json` only counts on a brand_official row; self-declared `verified:true` on a retailer row is ignored and listed.
- Added optional `source_kind` to `CatalogProduct` (contracts).
- `scripts/merge-catalog.ts` + `npm run catalog:merge` (esbuild bundle, no network) → `data/catalog/catalog.json`, `data/catalog/AUDIT.md`, then refreshes the Worker's `src/generated/catalog.json`.
- Result: 197 input rows from 29 brand files → **176 kept** (149 brand page, 27 retailer), **21 dropped** (13 incomplete INCI, 7 CureSkin, 1 beard oil), 0 verified (needs human ticks, see Needs Aman). Categories: sunscreen 51, cleanser 47, moisturiser 38, serum 29, tinted_spf 11.
- No new brands added this iteration (needs verbatim INCI from official brand pages; not worth the time ahead of items 4–8).
- Tests: `packages/rules/test/catalogMerge.test.ts` (7): classification, drop reasons, dedupe, tick policy, plus checks that catalog.json is exactly the merge of brands/*.json and every row is schema-valid, unique, complete and https.
- Verification: `npm run typecheck` exit 0, 0 TS errors; `npx vitest run` 40 files passed, 1 skipped; 466 passed, 1 skipped.
- Next: item 4 (Tier 1 flows end to end against the mock). For the mock demo a few verified rows will be needed; tests use fixtures, so this doesn't block.

## 2026-11-01 — Iteration 4: Tier 1 flows end to end against the mock
- New `apps/worker/test/tier1.e2e.test.ts`: the phone's own pure flow modules (`features/check/{flow,chips,present}`, `matches/select`, `scan/runScan`, `tryon/runTryon`, `share/{parse,sample}`) drive the real Worker app in-process with mock YouCam (real G1/G5 fixtures) + mock Claude, the real rules engine, and the real merged catalogue. No network, no units. Each response is parsed with the contracts `routes` schemas, like the phone's client.
  - **scan**: consent → upload → analyse → read → delete. The Key has inverted bands (Low on the airbrushed sample), `photoDeleted`, no raw/ui scores; local capture deleted; deleteState `deleted`.
  - **share → SKU confirm → verdict → better matches**: sample share resolves to the Garnier SKU without Claude, verdict FITS/CAUTION with fixed subtitle, then category search → rank → ≤3 FITS-only matches with Flipkart URLs, excluding the current SKU.
  - **designed UNKNOWN**: unknown name → UNKNOWN (ingredients) with the fixed subtitle → label OCR → chips with uncertain flags → user confirms → deterministic label verdict.
  - **try-on**: two shades rendered, no tone hex in the response, selfie deleted.
  - **How this was made**: scan + label-OCR ledgers are `mock:true`, list entries/files; `/v1/ledger` mode mock.
  - **medicine gate**: "Adapalene Gel" title → `medicine` step; `/v1/label-check` returns `medicineToken: adapalene`; a Tretinoin label → MEDICINE with no label text.
- Catalogue ticks are simulated in the test only (brand-page sunscreen rows); the real file still has 0 (Needs Aman).
- **Bug fixed**: `tryonEntry()` offered try-on on tinted products with no shade colour on file (all 11 real tinted rows), which the Worker rejects with 400. It now counts only shades with a hex. Updated `flow.test.ts` and the TINTED fixture.
- `test/helpers.ts` `setup()` takes an optional `catalog` (additive).
- Verification: `npm run typecheck` exit 0, 0 TS errors; `npx vitest run` 41 files passed, 1 skipped; 473 passed, 1 skipped; mobile `jest` 7/7.
- Next: item 5 (`wrangler dev` in mock mode + smoke script).

## 2026-11-01 — Iteration 5: `wrangler dev` in mock mode + smoke script
- `apps/worker/scripts/mock-smoke.ts` + `npm run smoke:mock` (root and worker). It starts `wrangler dev` on 127.0.0.1:8797 with `--var YOUCAM_MODE:mock --var CLAUDE_MODE:mock`, `CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV=false` and blank key env vars. It drives the Worker over real HTTP, parses every response with the contracts `routes` schemas, then kills the whole process group (npx → wrangler → workerd) so nothing keeps holding the port. `-- --url http://localhost:8787` reuses a Worker that is already running. It stops before the scan if `/health` does not report `mode: mock`.
- Checks (20): health is mock (176 rows); install token; the scan upload slot is rewritten to the local `/mock-youcam/upload/`; PUT with the real declared size; scan done in ~9 s of real time with inverted Low bands, no raw numbers, delete confirmed, ledger mock; sample share → Garnier SKU without Claude, product INCI, category search; Flipkart `dl.flipkart.com/s/` → slug title "vaseline gluta hya dewy radiance" from the redirect fixture; label OCR (mock Claude) → 7 chips with uncertain flags; medicine gate → adapalene; try-on on a real tinted row without a shade hex → 400 (refuses instead of guessing); `/v1/rules`; `/v1/ledger` mock.
- Gotcha recorded in the script: the upload slot's `Content-Length` must match the body, otherwise Node fetch fails, so the smoke sends a body of the declared size.
- Verification: `npm run smoke:mock` → 20/20 checks passed, no wrangler/workerd left running; `npm run typecheck` exit 0; `npx vitest run` 41 files passed, 1 skipped; 473 passed, 1 skipped.
- Next: item 6 (web: landing, /check, /audit empty state, /rules, /how; `vite build`).

## 2026-11-01 — Iteration 6: web pages + `vite build`
- The web app already had every page (landing, `/check`, `/audit`, `/rules`, `/how`, `/r/:token`), built on `@skinkey/design/tokens.css`. `app.css` has 0 literal hex colours and 259 `var(--…)` uses. The only hex values in TSX are canvas fallbacks for `cssVar()` in LabelSlot.
- Re-ran `npm run audit`. The old `audit/summary.json` was stale ("catalog.json not merged yet", 183 rows). Now: `catalog_preview` mode, 176 rows from catalog.json, 0 verified, frame missing, 0 checked.
- **Honesty fix on `/audit`**: with 0 products checked, the page showed a heatmap of zeros and "No label-claim hits in this run", which reads as a finding. With `population.checked === 0` it now shows "Nothing checked yet" ("zero means not measured, not nothing found"), with the verified count and frame status, and hides the heatmap and Label Check tables. Coverage, the method, git tags and the frame strip still render.
- New `apps/web/src/routes/render.test.ts` (6 tests) server-renders each route inside the real Layout, through the vite audit plugin, so it uses the real summary.json. The /audit honesty test fails on the previous Audit.tsx and passes on the fix (checked by swapping the file back).
- Verification:
  - `npm run build -w @skinkey/web`: tsc + vite build ✓ (built in ~0.3 s).
  - `vite preview`: `/`, `/check`, `/audit`, `/rules`, `/how`, `/r/abc` → 200 text/html; `/audit/results.csv` → 200 text/csv.
  - `npm run typecheck` exit 0.
  - `npx vitest run`: 42 files passed, 1 skipped; 479 passed, 1 skipped.
- Next: item 7 (Android SDK cmdline-tools + Java 17, `expo prebuild`, `./gradlew assembleDebug`). Item 8 still has the `lint-claims` stub to replace.

## 2026-11-01 — Iteration 7: Android APK
- Installed the Android SDK at `~/android-sdk`: cmdline-tools (latest), platform-tools, platforms;android-36, build-tools;36.0.0. Licences accepted; Gradle pulled android-37 itself. Java is the system OpenJDK 17.0.20.
- `CI=1 npx expo prebuild --platform android --no-install` ✓ (expo-share-intent filters text/* image/*). `android/` stays gitignored.
- `./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a` → BUILD SUCCESSFUL in 7m 50s (824 tasks).
  - **Debug APK path:** `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk` (106 MB). This is a dev client and loads JS from Metro.
- Also `./gradlew assembleRelease` → BUILD SUCCESSFUL in 5m 18s.
  - **Standalone APK:** `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` (45 MB, embeds `index.android.bundle` 3.5 MB, debug-signed).
- `aapt2 dump badging`: package `app.skinkey` 0.1.0, targetSdk 36, arm64-v8a, CAMERA permission, no RECORD_AUDIO. The manifest has the SEND intent filter for text/* and image/*.
- Secret grep of both unzipped APKs (`sk-ant-`, `AKIA…`, `ANTHROPIC_API_KEY`, `YOUCAM_API_KEY`, `x-api-key`) → 0 hits. The bundle's Worker URL is `http://localhost:8787`.
- `scripts/build-android.sh` reproduces the debug build; BUILD_NOTES.md Mobile section updated.
- Not verified: running on a device (no phone or emulator on the VM) → Needs Aman.
- Verification: `npm run typecheck` exit 0; `npx vitest run` 42 files passed, 1 skipped; 479 passed, 1 skipped; mobile jest 7/7.
- Next: item 8 (copy linter replacing the `lint-claims` stub, a11y 48 dp/labels, bundle secret grep script, root README).

## 2026-11-01 — Iteration 8: quality (copy linter, a11y, secret grep, README)
- **Copy linter**: replaced the `lint-claims` stub with `scripts/lint-claims.ts` (`npm run lint:claims`, also run by `npm run lint`). It uses the rules package's `lintCopy()` (brief §4.4 + spec §9 list, Accuracy note allowlisted). It parses TS/TSX with the TypeScript compiler and checks string literals, template text and JSX text in `apps/mobile/src`, `apps/web/src` and `packages/contracts/src` (tests excluded). Code strings (imports, keys, type literals, `===` comparisons, non-copy JSX attributes, identifier-like strings) are skipped. It also checks README.md (outside code fences and inline code) and any .srt/.vtt in docs/. `// lint-claims:allow` marks third-party text quoted verbatim; used once, on the Nykaa retailer title fixture ("No White Cast"), which is retailer data, not SkinKey copy. Result: 158 files, 0 violations. Test `packages/rules/test/lint-claims-cli.test.ts`: the real repo is clean, and a temp fixture gets exactly the 4 expected hits (copy, aria-label, template, README) while code strings and allow-marked lines are skipped.
- **Accessibility**:
  - Mobile `apps/mobile/src/a11y.test.ts` (static AST): 23 Pressables found. Every visible one has `accessibilityRole` and a label (prop or visible Text child). Each is sized from a ≥48 dp token, fills its row, or is a padded card, with no literal size under 48. Every design-token touch size (minHeight/target/minTarget/iconButton/touch.min, 43 values) is ≥48. Already compliant, nothing to change.
  - Web had targets under 48 px: `.btn-sm` 44, `.chip-edit` 40, chip remove button 36, `.sk-nav a` about 40, lookup example buttons about 40. All now 48. `apps/web/src/a11y.test.ts` checks these selectors and that no button or link rule sets a height under 48 px.
- **Secret grep**: `scripts/secret-grep.mjs` (`npm run secrets:grep`) scans `apps/web/dist`, the Worker dist/dry-run if present, and the assets/ + res/raw/ of both APKs (unzipped to a temp dir). It looks for key patterns (`sk-ant-`, AKIA, X-Amz signatures, private keys, key env-var names) plus every secret-named VALUE from `.env`/`.dev.vars`, and prints only names, never values. Fresh web build + both APKs: 28 files, 3 env values checked, 0 hits. Test `packages/rules/test/secret-grep-cli.test.ts`: a planted fake key and an .env value are both flagged without the value being echoed; a clean build passes.
- **README.md** (root): story, why (desk research labelled), hero flow including the spike facts (inverted bands, delete retry, the three share parsers, Custom Tab, coach mark), the Claude boundary, architecture diagram, possible/not-possible table, run commands, Android build, repo map, roadmap, credits. It passes the copy linter (the linter caught 3 of its own first-draft phrases, which were reworded).
- BUILD_NOTES.md: updated the scripts and commands lines.
- Verification:
  - `npm run typecheck`: exit 0, 0 TS errors.
  - `npx vitest run`: 46 files passed, 1 skipped; 495 passed, 1 skipped.
  - mobile `jest`: 7/7.
  - `npm run lint`: exit 0, 0 violations.
  - `npm run build -w @skinkey/web`: built.
  - `npm run secrets:grep`: 0 hits.
- Items 1–8 are verified per the iteration entries above. Still open, and needing the human (see Needs Aman): on-device APK run, catalogue verification ticks, shade hexes for try-on, the selfie for band calibration, and the Flipkart audit frame.

ALL_DONE
