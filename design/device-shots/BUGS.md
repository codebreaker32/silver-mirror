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
