# On-device test findings (Samsung SM-A276B, Android 16, release APK + local mock Worker, 2026-11-02 ~09:15 IST)

## Functional
1. **CRITICAL: a share sent while the app is already running is ignored.** The screen shows "Nothing to check yet". Cold-start shares work (Flipkart, Amazon, Nykaa). The warm-start intent (onNewIntent / expo-share-intent hook when the app is foregrounded or backgrounded) must be handled: reset the check state for each new share.
2. **CRITICAL for the demo: catalogue hits show UNKNOWN.** The product is in the catalogue (Minimalist SPF 50 from brand_official), but the verdict says "We can't read this listing's ingredients" and "Our catalogue: 0 verified products". The cause is that verification gating requires a human tick in data/catalog/verified.json, and there are 0 ticks. Fix one of two ways: (a) tick the demo rows, or (b) let brand_official rows that passed the two-agent verbatim check count as "checked against brand page", and label the human-ticked rows separately.
3. Flipkart title shows the raw lowercase slug ("vaseline gluta hya dewy radiance"). Title-case it and/or resolve it through the catalogue or Claude.
4. Amazon share "Minimalist SPF 30 Body Sunscreen …" offered the wrong SKUs (SPF 50, SPF 60). The fuzzy-match threshold is too loose. Token mismatches like SPF 30 vs 50 or "Body" should disqualify a candidate, and "None of these" should lead to a name-only check.
5. Nykaa: product URLs open in Chrome, not the app. Search URLs open the app home. Outbound to Nykaa must use the browser (already the plan).
6. The share sheet shows only pinned and recent apps first, so SkinKey isn't visible without scrolling. The pin coach mark is essential.

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
7. **CRITICAL: Flipkart short links don't resolve on the live Worker.** POST /v1/resolve with `https://dl.flipkart.com/s/qPYPSuNNNN` gives `outcome: unknown, extractedTitle: null`. The same lookup works from a residential IP. The Worker's `flipkartLocation` sends a GET with no User-Agent and a 4 s timeout from Cloudflare IPs, which Flipkart probably blocks or stalls. Fix:
   - (a) **Resolve on the phone first:** `fetch(shortUrl)` → read `response.url` (the final link address only), cancel the body, and send that URL in `ResolveRequest.url`. The Worker parses the slug and pid from a `flipkart.com/.../p/...` URL without any network call.
   - (b) Server fallback: send a mobile browser User-Agent and allow a longer timeout (8 s).
   - (c) Test both paths.
8. **CRITICAL (config, needs Aman): live `/v1/install` returns "Install tokens are not configured".** `INSTALL_HMAC_SECRET` was missing from `.env` when the secrets were uploaded, so an empty value was stored. It has now been generated in `.env`. Aman runs once:
   `cd /home/aman/youcam && set -a && . ./.env && set +a && cd apps/worker && printf '%s' "$INSTALL_HMAC_SECRET" | npx wrangler secret put INSTALL_HMAC_SECRET --env production`
   Re-check with `curl -X POST https://skinkey-worker.skinkey-worker.workers.dev/v1/install`.
