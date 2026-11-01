# SkinKey loop progress

Each entry: what was done, verification, what's next. Priority list lives in ops/RALPH_PROMPT.md.

## Status board
- [x] 1. Monorepo green (install, typecheck, test)
- [x] 2. Spike findings applied
- [ ] 3. Catalog merged + AUDIT.md
- [ ] 4. Tier 1 flows E2E against mock
- [ ] 5. Worker `wrangler dev` mock + smoke script
- [ ] 6. Web pages + vite build
- [ ] 7. Android debug APK
- [ ] 8. Quality (copy linter, a11y, secret grep, README)

## Needs Aman
- (none yet beyond STATUS.md morning checklist: selfie for band calibration, Flipkart audit screenshots, hallway tests, demo video)

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
