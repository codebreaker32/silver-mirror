/**
 * Contract proposals from WEB (apps/web). Not exported from the package index; nothing here changes a shared file.
 *
 * 1. SAMPLE_SHARE (owner: shared demo.ts): the "Try a sample share" payload, so web /check and the app replay the same
 *    text. apps/web imports it from this file by relative path until it moves to demo.ts.
 * 2. Worker (owner: WORKER), no schema change:
 *    - CORS for the web origin on /v1/resolve, /v1/label-ocr, /v1/catalog/*, /v1/rules, /v1/label-check.
 *    - /v1/resolve and /v1/label-ocr accept calls without x-skinkey-install from the web (IP-limited),
 *      or a route that issues an anonymous web install token.
 * 3. Rules (owner: RULES): export `AuditSummary`, `HeatmapCell`, `AuditProduct` and `RESULTS_HEADER` from the
 *    @skinkey/rules index (today they live in packages/rules/src/audit.ts, which apps/web imports by type-only path).
 * 4. Rules (owner: RULES): an exported `rulesForToken(token)` (which rules' inciSet matches one INCI token, exclusions
 *    applied) would let the landing page's ingredient lookup skip its per-profile verdict() loop.
 */

/** Labelled sample share text. Replays the share-sheet payload shape (text only); the product is a catalogue row. */
export const SAMPLE_SHARE = {
  label: 'Sample share (replayed, not from your phone)',
  source: 'sample',
  text: 'Check out this product on Flipkart: Foxtale Oil Balancing Moisturizer with Niacinamide & Cica',
} as const;
