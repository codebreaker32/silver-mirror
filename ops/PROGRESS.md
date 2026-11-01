# SkinKey loop progress

Each entry: what was done, verification, what's next. Priority list lives in ops/RALPH_PROMPT.md.

## Status board
- [x] 1. Monorepo green (install, typecheck, test)
- [x] 2. Spike findings applied
- [x] 3. Catalog merged + AUDIT.md
- [x] 4. Tier 1 flows E2E against mock
- [ ] 5. Worker `wrangler dev` mock + smoke script
- [ ] 6. Web pages + vite build
- [ ] 7. Android debug APK
- [ ] 8. Quality (copy linter, a11y, secret grep, README)

## Needs Aman
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
