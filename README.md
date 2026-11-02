# Silver Mirror

<sub>Formerly `SkinKey`: code identifiers (`@skinkey/*`, `app.skinkey`, the Worker URL) keep the old name.</sub>

> The tag says oily skin. Your scan and the ingredients get a vote.

The listing says "for oily skin". Silver Mirror checks that claim against the product's own ingredient list and your YouCam Skin Analysis readings. It works from the Flipkart or Amazon.in app you are already in, through the Android share sheet. For tinted products, YouCam shows you two shades on your face before you buy something you can't return.

Cosmetic guidance, not medical advice. Not affiliated with Flipkart, Amazon or Nykaa.

## Why

Desk research only; nobody was interviewed for these numbers:

- Opened skincare usually can't be returned on Nykaa and Purplle.
- About 40% of self-reported skin types matched instrument measurement (Youn 2002, via a secondary summary).
- 43% of shoppers worry AI recommendations are paid placements.

What we claim about the scan: it is a consistent, dated reading from YouCam. It is not a validated measurement, and Silver Mirror does not close the 40% gap on its own.

## How it works

1. **Your reading (once).** Consent, then one selfie. YouCam HD Skin Analysis returns oiliness, moisture, redness, pore and zone skin-type readings. The Worker turns each `raw_score` into a band (Low / Medium / High). Higher `raw_score` means less visible concern, so the bands invert it (found in the live spike, see `spikes/FINDINGS.md`). The photo is deleted from YouCam straight after, and the delete is confirmed with up to 3 GETs, 2 s apart. Only bands, zone labels and the scan date stay on the phone.
2. **Share a product.** In Flipkart or Nykaa, tap Share, then Silver Mirror. In Amazon, tap Share, then More, then Silver Mirror.
   - Flipkart shares only a `dl.flipkart.com/s/` short link. The Worker resolves it with ONE redirect request and reads only the `Location` header (slug + pid). It never loads the product page.
   - Amazon shares `Check this out at Amazon` + title + URL. The title is the text minus those two parts.
   - Nykaa shares `Check out <title> on Nykaa` + a `/p/<id>` URL. Nykaa links open in a browser Custom Tab.
3. **Confirm the SKU.** Claude proposes catalogue ids; you tap "Yes, this one". No verdict appears before that.
4. **Verdict.** A pure rules engine compares the product's INCI list and label claims with your bands: FITS, CAUTION, UNKNOWN or MEDICINE. Every reason is a set template filled with a rule id, a band and an ingredient token.
5. **Better matches.** Up to 3 FITS products from the verified catalogue in the same category (rows checked against the brand page by a second, independent read; rows a person has ticked are labelled human-checked), each with a link that opens a Flipkart search.
6. **UNKNOWN is designed, not an error.** "We can't read this listing's ingredients. This doesn't mean it's bad." Snap the label; Claude reads it into editable ingredient chips (low-confidence chips are outlined); you confirm; the rules decide.
7. **Try-on (tinted products).** Two shades, same photo. Preview, not a shade guarantee. The skin-tone hex is used inside the Worker to pick two candidate shades and is never shown; the selfie is deleted from YouCam afterwards.
8. **Medicine gate.** Retinoids and other medicine actives (adapalene, tretinoin and similar) stop the flow with a MEDICINE notice instead of a fit verdict.
9. **How this was made.** Every scan and label read keeps a ledger: YouCam task ids, units, delete state, and whether the run was mock or live.

**Claude reads. Our rules decide.** The product model is `claude-opus-5-5`. It is used for two runtime jobs only: mapping a messy share title to catalogue ids, and reading a label photo into ingredient tokens. It never writes verdict text and never decides a verdict. `packages/rules` is a pure function with no network or SDK imports.

## Architecture

```
 Android app (Expo, apps/mobile)          Web (Vite + React, apps/web)
   share intent ─┐                          /, /check, /audit, /rules, /how
   camera, reading│                                   │
                 ▼                                   ▼
        Cloudflare Worker (Hono, apps/worker)  ◄─────┘
          ├─ YouCam API (skin analysis, skin tone, makeup VTO, delete)   keys live only here
          ├─ Claude claude-opus-5-5 (share resolver, label OCR; structured output)
          ├─ packages/rules  (pure verdict engine, bands, audit)
          └─ data/catalog/catalog.json (merged, deduped, source-tagged)
 packages/contracts  zod schemas for every route, fixed copy strings
 packages/design     design tokens (design/system/tokens) for RN and CSS
```

- Keys (`YOUCAM_API_KEY`, `ANTHROPIC_API_KEY`) exist only as Worker secrets. They are never bundled into the app or the web build; `npm run secrets:grep` checks the built web bundle and both APKs.
- The Worker has a full mock mode (`YOUCAM_MODE=mock`, `CLAUDE_MODE=mock`) that serves the real spike responses, with signed URLs redacted. Tests and the smoke script use it, so no YouCam units are spent.
- Catalogue: `data/catalog/brands/*.json` → `npm run catalog:merge` → `catalog.json` + `AUDIT.md`. Rows need a complete INCI list copied from a brand or retailer page with an https `source_url`; anything else is dropped. A brand-page row counts as verified once a second, independent read matched it word for word (labelled "checked against the brand page"); rows a person has ticked are labelled human-checked. Retailer rows never count.

## What's possible / not possible

| Possible today | Not possible (and why) |
|---|---|
| Share from the native Flipkart, Amazon.in and Nykaa Android apps into Silver Mirror | Running within a store app. Our links open a Flipkart search in the Flipkart app |
| Resolve a Flipkart short link from one redirect header | Reading Flipkart product pages. We never load or scrape them |
| Check a listing's label claim ("for oily skin", fragrance-free, oil-free) against its INCI list and your readings | Checking a product we have no ingredient list for. That is UNKNOWN until you snap the label |
| Dated, banded YouCam readings (Low / Medium / High, zone labels) | Numeric skin scores or an age estimate. YouCam returns them; we discard them |
| Two-shade try-on on a tinted product with a known shade colour | Try-on for tinted products without a shade colour on file. The app hides it rather than guess |
| Deleting the photo from YouCam right after the result, confirmed by retry | Instant deletion. YouCam deletes with about a 2 s lag, so we confirm before showing the tick |
| A pre-registered audit of brand-page claims against the same page's ingredient list (`npm run audit`, `/audit`) | Statements about the whole market. It is our sample of 30 brands, not the market |
| Medical actives detected and gated | Medical advice of any kind |
| Android APK | iOS (roadmap) |

## Audit: brand claims checked against their own ingredient lists

Method `brand-claims-1`, pre-registered in [`audit/METHOD.md`](audit/METHOD.md). It replaces the Flipkart-filter frame in spec §6: collecting that frame would need automated store access, which Flipkart's terms don't allow. It uses only brand-page rows already in `data/catalog/brands/`. Git tags, in order: `audit-method-frozen` → `rules-frozen` (ruleset `440f555a8845`, file hashes in `audit/rules-frozen.json`) → `audit-run`.

Result of the tagged run, copied from `audit/summary.json` (136 products checked, so not a pilot):
- 140 products make a skin-type or free-from claim on their own brand page; 136 have a complete ingredient list there.
- Label Check: **0 of 136** make a claim their own ingredient list doesn't match (strict LC-1a / LC-2 / LC-3), and 0 more under LC-1b. Only 16 free-from claims were testable (fragrance-free 4, alcohol-free 1, oil-free 11).
- Claim vs reading profile: **70 of 136** are flagged CAUTION by our rules for a reading profile their own claim points to. 62 of them list a fragrance ingredient (rule FRG-1) and are flagged for the high-visible-redness profiles; by claim: "for oily skin" 33 of 60, "for sensitive skin" 30 of 52, "for all skin types" 30 of 52, "non-comedogenic" 11 of 24, "for combination skin" 10 of 24, "for dry skin" 0 of 28.
- Six readings, CAUTION counts: Oily 13, Combination 12, Oily & Redness 72, Combination & Redness 67, Normal 0, Dry 12.
- Every flagged row (86 on 70 products) is on the review list `audit/review.md` with claim quote, ingredient, rule id and brand page URL. 0 reviewed by a person so far.

Flagged by our published rules, not a measured effect on skin. Our sample, not the market.

## Run it

Requires Node 24.

```
npm install
npm run typecheck          # every workspace
npm test                   # vitest across packages/* and apps/*
npm run lint:claims        # copy linter: banned words (brief §4.4) in app, web, contracts copy and this README
npm run smoke:mock         # starts wrangler dev in mock mode on :8797 and runs 20 HTTP checks
npm run dev:worker         # Worker on :8787 (mock YouCam by default)
npm run dev:web            # web on :5173
npm run build -w @skinkey/web
npm run secrets:grep       # greps built web bundle + APKs for keys
npm run audit              # brand-page claims vs own INCI → audit/results.csv, summary.json, review.md
npm run catalog:merge      # rebuild data/catalog/catalog.json + AUDIT.md
```

Android (needs the Android SDK and Java 17): `scripts/build-android.sh` builds the debug APK. For a standalone APK, `cd apps/mobile/android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a` → `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`. The app talks to `http://localhost:8787`, so run `adb reverse tcp:8787 tcp:8787` with the Worker running.

Live mode needs `apps/worker/.dev.vars` (generated from `.env` by `npm run gen:devvars`; never committed). Every live YouCam call spends units.

## Repo map

- `apps/mobile`: Expo SDK 58 app (share intent, scan, check, try-on, reading, settings, How this was made)
- `apps/worker`: Cloudflare Worker, YouCam and Claude adapters, mock YouCam, smoke script
- `apps/web`: landing, `/check`, `/audit`, `/rules`, `/how`
- `packages/contracts`, `packages/rules`, `packages/design`
- `data/catalog`: brand files, merged catalogue, audit of the merge
- `spikes/FINDINGS.md`: live API results that shaped the build
- `research/skinkey_v2_spec.md`: the locked spec

## Roadmap

Pharmacist QR, re-scan refresh, Hindi, iOS.

## Credits

YouCam Skin Analysis, Skin Tone Analysis and Makeup VTO by Perfect Corp. Claude by Anthropic. Ingredient names follow EU CosIng.
