# Audit method: brand claims checked against their own ingredient lists

Method id: `brand-claims-1`. Written and committed on 2 Nov 2026, then tagged `audit-method-frozen` before any of the
steps below ran. This file is not edited after that tag. If something here turns out to be wrong, the fix goes in a new
file (`METHOD-2.md`) with its own tag, and both runs are kept.

## Why the method changed

Spec §6 framed the headline on a Flipkart "Oily Skin" filter page. Collecting that frame would need automated access to
a store, which would breach Flipkart's terms. Aman approved replacing it on 2 Nov 2026. The new population uses only data
already in `data/catalog/brands/*.json`: rows copied from each **brand's own product page** (product name, the phrases
the brand page markets it for, and the ingredient list on that page). No store page is read, scraped or screenshotted.

## Question

When a brand's own page says a product is "for oily skin", "oil-free", "non-comedogenic", "fragrance-free",
"alcohol-free", "for sensitive skin" and so on, what do our published, deterministic rules say when they read the
ingredient list on that same page?

The answer is two counts and one matrix:
1. **Label Check:** how many make a free-from claim their own ingredient list doesn't match (strict rules).
2. **Claim vs reading profile:** how many are flagged CAUTION by our rules for a YouCam reading profile that their own
   skin-type claim points to.
3. **Six readings:** for each of the six fixed reading profiles, how many of the checked products are flagged CAUTION.

None of these is a measured effect on skin. They are what our published rules flag.

## Steps, each tagged in git before the next one runs

1. `audit-method-frozen`: this file.
2. `rules-frozen`: the rules package and the audit script are frozen. `audit/rules-frozen.json` records the ruleset hash
   and the SHA-256 of every file in `packages/rules/src/` and of `scripts/audit.mjs`. Allowed changes between steps 1 and
   2, and nothing else: (a) the code that implements this method; (b) the claim phrase matcher reads slash lists such as
   "Oily/Combination" as skin-type claims; (c) the MED-1 template wording becomes brand-neutral. Rule triggers,
   ingredient sets, position limits, reading profiles and band cutoffs stay as they are in ruleset v2.0.0. Nobody runs
   this method on the brand rows before the tag. (The only earlier `npm run audit` output checked 0 products, because it
   required human ticks.) The claim matcher was written while looking at how often each marketing phrase appears in the
   brand files; no rule outcome was looked at.
3. `audit-run`: `npm run audit` writes `audit/results.csv`, `audit/summary.json` and `audit/review.md`. The run
   recomputes the ruleset hash. If it differs from `audit/rules-frozen.json`, the run is marked "not the headline". If
   any frozen file differs, the file is named in the run's notes.

## Population

Input: every row of `data/catalog/brands/*.json` at the `rules-frozen` commit (30 brand files, collected 1-2 Nov 2026),
files in filename order, rows in file order. Each row goes through the shared adapter `toCatalogProduct()`
(`packages/rules/src/catalog.ts`). The steps below exclude rows in this order. Every excluded row is listed in
`summary.json` with its reason.

1. **Brand page only.** `source_url` must be https, on a host that is not a retailer or a third-party ingredient decoder
   (`sourceKindOf()` in `packages/rules/src/catalogMerge.ts`: Apollo, 1mg, PharmEasy, Nykaa, Amazon, Flipkart,
   lookfantastic, Myntra, Purplle, Netmeds, Tira; CureSkin, INCIDecoder, Skincarisma, inci.guide). Reasons:
   `retailer_source`, `third_party_source`, `no_https_source`.
2. **In scope.** The category maps to one the ruleset covers (cleanser, moisturiser, serum, sunscreen, tinted SPF,
   toner, and so on). `other` is out (for example beard oil). Reason: `out_of_scope_category`.
3. **One row per product.** The first row wins on the same catalogue id (brand + name) or the same GTIN. Reasons:
   `duplicate_id`, `duplicate_gtin`.

### Claims

Claims come only from the brand page's own `marketed_for` phrases and the product name, by a deterministic phrase match
(`auditClaims()`, which wraps `claimsFromMarketedFor()` in `packages/rules/src/claims.ts`). Claim types counted:

| Claim type | Matched on (case-insensitive) |
|---|---|
| `fragrance_free` | "fragrance-free" / "fragrance free" in a phrase or the name |
| `alcohol_free` | "alcohol-free" / "alcohol free" in a phrase or the name |
| `oil_free` | "oil-free" / "oil free" in a phrase or the name |
| `non_comedogenic` | "non-comedogenic" / "non comedogenic" / "noncomedogenic" in a phrase or the name |
| `for_oily_skin` | "oily" in a phrase that has the word "skin", or that is only skin-type words (e.g. "Oily", "Oily/Combination") |
| `for_combination_skin` | "combination", same condition |
| `for_dry_skin` | "dry", same condition (so "dry touch finish" is not a claim) |
| `for_sensitive_skin` | "sensitive", same condition |
| `for_all_skin_types` | "all skin type(s)", "any skin type", "every … skin type" |

Phrases that say "not for" or "not suitable for" are skipped. The quote kept with each claim is the brand page's phrase,
word for word.

### Counts

- **N:** rows left after the three exclusions that have at least one claim from the table.
- **a:** rows in N whose brand page gives a complete ingredient list (`inci_complete` is not `false`, and at least one
  ingredient). Rows in N without one are `unverifiable`: they count in N, not in a.
- **m:** rows in a that the medicine gate (MED-1) stops. They get no fit or label counts, as in the app.
- **checked = a − m.** Every count below is over the checked rows.
- **c (headline, strict):** checked rows where at least one counted LABEL_CHECK rule fires: LC-1a ("fragrance-free" with
  Parfum/Fragrance/Aroma listed), LC-2 ("alcohol-free" with Alcohol / Alcohol Denat. / SD Alcohol / Ethanol, fatty
  alcohols and Benzyl Alcohol excluded), LC-3 ("oil-free" with an ingredient named "... Oil", PEG and hydrogenated
  solubilisers and essential oils excluded; shown as a contested definition). Reported with a per-rule split.
- **d (informational):** checked rows with no strict hit but an LC-1b hit (an EU-labelled fragrance substance or an
  essential oil under a "fragrance-free" claim; it may come from a plant extract). Not part of c.
- **Six readings:** for each of the six fixed reading profiles in `packages/rules/src/profiles.ts` (copy set B: band
  vectors only), the number of checked rows whose verdict is CAUTION, and FITS, with the split by the grade of the
  strongest rule (R / L / T) and the rule ids that fired.
- **Claim × profile matrix:** for each claim type, the number of checked rows with it, and the CAUTION count under each
  of the six profiles.
- **e of b (claim vs reading profile):** b = checked rows with at least one claim in the mapping below. e = rows in b
  that are flagged CAUTION for at least one profile their own claim maps to. Reported overall and per claim type.

| Brand-page claim | Reading profiles it points to | Why |
|---|---|---|
| for oily skin | Oily, Oily & Redness | the profiles with oiliness High |
| for combination skin | Combination, Combination & Redness | the combination profiles |
| for dry skin | Dry | the dry profile |
| for sensitive skin | Oily & Redness, Combination & Redness | "sensitive" is not a YouCam reading; visible redness High is the closest one (team mapping, grade T) |
| non-comedogenic | Oily, Oily & Redness | the profiles where the heavy-ingredient rules OCC-1 / OCC-2 apply |
| for all skin types | all six | the claim names every type |

Free-from claims (fragrance-free, alcohol-free, oil-free) are covered by the Label Check, not this mapping.

## Human review

The ingredient lists were copied from brand pages by the catalogue workflow and have not been ticked by a person yet
(`data/catalog/verified.json` is empty at the freeze). The pre-pivot method counted only ticked rows, which would measure
nothing today. This method counts every row with a complete brand-page list and puts **every flagged row** on a review
list instead: `audit/review.md` gives, for each label hit and each claim-matched CAUTION, the product, the claim quote,
the matched ingredient and its position, the rule id, the grade and the brand page URL. A row is shown as `ticked` once
its id is in `verified.json`, otherwise `pending`. The headline says how many flagged rows a person has reviewed.

If review finds a transcription error, the brand file is corrected and the audit runs again as a new tagged run
(`audit-run-2`). The first run stays in git history.

## Reporting

The numbers come from the script; the sentences below are templates.
- Coverage: "N products in our brand-page catalogue make a skin-type or free-from claim on their own brand page. a of
  them have a complete ingredient list there."
- Label Check: "c of [checked] make a claim their own ingredient list doesn't match (strict rules LC-1a / LC-2 / LC-3),
  plus d more list a fragrance substance or essential oil under a 'fragrance-free' claim (LC-1b, informational)."
- Claim vs reading profile: "e of b products that name a skin type or 'non-comedogenic' on their brand page are flagged
  CAUTION by our published rules for a reading profile their own claim points to."
- Six readings: "Across the [checked] checked products, the number flagged CAUTION is x₁ for a YouCam 'Oily' reading
  profile, x₂ for 'Combination', …"
- Fixed caption: "Flagged by our published rules, not a measured effect on skin. Our sample, not the market."
- If fewer than 25 rows are checked, the result is labelled a pilot.

Honesty rules (unchanged from spec §6):
- If c or e is 0 or small, it is published anyway. We don't change the method afterwards.
- The wording is always "doesn't match rule LC-x" or "flagged CAUTION by our rules", never "lying", "misleading" or
  "unsafe".
- `/audit` shows brand names, the brand page link and a "Report an error / brand reply" link on every flagged row.

## Limits

- 30 brands chosen by us, about 200 products. Our sample, not the market.
- Brand pages change. The catalogue is a snapshot from 1-2 Nov 2026 with the URL on every row.
- The phrase matcher only reads what the catalogue workflow copied into `marketed_for`. A claim made elsewhere on the
  page, or only in an image, is missed.
- Ingredient matching is string matching on INCI names. Rule grades describe the ingredient side only.
