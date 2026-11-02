# Devpost submission: Silver Mirror

Paste-ready text for each Devpost field. Numbers are copied from `spikes/FINDINGS.md`, `research/youcam_live_facts.md` and `audit/summary.json`; do not round or restate them differently. Fill the four links at the bottom before submitting.

## Project name

Silver Mirror

## Tagline (under 200 characters)

Scan once with YouCam. Then share any skincare listing from Flipkart, Amazon or Nykaa: see if it suits your reading, the ingredient and rule behind each reason, and tinted shades on your photo.

## Inspiration

Skincare in India is bought from a listing that says "for oily skin", usually after a reel or a friend's tip. That tag is written by the seller, and opened skincare usually can't be returned. We wanted the shopper to hold the listing up to their own reading before they pay.

Desk research shaped the brief. It is desk research only; nobody was interviewed for these numbers (sources graded in `design/research/05_desk_research_baseline.md`):

- Opened skincare usually can't be returned on Nykaa and Purplle.
- About 40% of self-reported skin types matched instrument measurement (Youn et al. 2002, via a secondary summary). People guess their skin type, often wrongly.
- 43% of shoppers worry that AI recommendations are paid placements, so the app had to show its working and rank without paid slots.
- Store skin tools already exist, but each one recommends from its own shelf.

## What it does

1. **One reading.** After consent, one selfie goes to YouCam HD Skin Analysis. Silver Mirror keeps only Low / Medium / High bands for oiliness, moisture, redness and pores, the per-zone skin-type labels and the scan date, on the phone. The photo is deleted from YouCam straight after, and the app waits for YouCam to confirm the delete before it shows the tick.
2. **Share from the store app.** In Flipkart or Nykaa, tap Share, then Silver Mirror. In Amazon, Share, then More, then Silver Mirror. Flipkart sends only a short link; the phone follows it, stops as soon as the listing address arrives (the page itself is never read), and the product slug becomes the title.
3. **Confirm the product.** A deterministic name match against the catalogue proposes rows first, with SKU disqualifiers for a conflicting SPF, body vs face and product type. Claude (effort low, catalogue ids only) is asked only when the name doesn't match or the shopper shares a screenshot, and the same disqualifiers re-check its picks. The shopper picks one; nothing is judged before that.
4. **Verdict with reasons.** A published, deterministic rules engine returns FITS, CAUTION, UNKNOWN or MEDICINE. Each reason names the ingredient, the reading and the rule id: "Contains niacinamide, which our rule SUP-2 counts as a fit for oily-looking skin." CAUTION says "May not suit your readings. A cosmetic fit note, not a health warning."
5. **Try-on.** For tinted sunscreens with a brand-sourced shade colour (7 of our 11, e.g. Foxtale SPF 50 Tinted Fluid Sunscreen), YouCam Makeup VTO renders the brand's shades on the shopper's own photo, right under the verdict's reasons: two shades picked with YouCam Skin Tone where the brand sells several, the one shade otherwise. Preview, not a shade guarantee. Shade colours come only from each brand's own swatch or texture image, with the source recorded per shade; the 4 tinted rows without one hide the button rather than guess.
6. **Better matches.** Up to three FITS products from the verified catalogue, ranked by fit with no paid placements. Each opens a search for that product in the store the shopper came from, and one more link opens a Flipkart search filtered to their skin-type reading.
7. **Honest UNKNOWN.** If we have no ingredient list, we say so ("This doesn't mean it's bad") and offer a label photo: Claude reads the ingredient names into editable chips, the shopper confirms, the rules decide.
8. **Medicine gate.** Adapalene, tretinoin and similar actives stop the flow and point to a pharmacist.
9. **Audit.** A pre-registered audit runs the same rules over 136 brand-page products and their own ingredient lists, published at `/audit`.
10. **For retailers and brands (built, no partner yet).** The same deterministic check is an API: `POST /v1/label-check` takes up to 500 seller-feed items (claims + ingredient list) and returns label-check hits and per-profile verdicts, with no model on the path. The audit is this check over 136 brand pages. For Perfect Corp, 16 units buy one reading that powers every check for 30 days, checks spend 0 YouCam units, and try-on spends 22 units only when a shopper is choosing a tinted product. No partner, no pricing claimed, no affiliate revenue in this build.

## How we built it

- **YouCam first.** Before writing app code we ran live spikes on Perfect Corp's official sample face (18 units): HD Skin Analysis, Makeup VTO and delete. That found three things the build depends on: higher `raw_score` means less visible concern (so bands invert it), `hd_skin_type` comes back per zone, and deletes are eventually consistent (about 2 s), so the delete needs a confirming GET.
- **A Cloudflare Worker (Hono)** holds the YouCam and Anthropic keys, runs scan and try-on jobs with a delete state machine, and keeps a ledger of task ids, units and delete state. A full mock mode replays the real spike responses, so tests and emulator QA spend no units.
- **Claude (`claude-opus-5-5`)** does two reading jobs with structured JSON output, both as fallbacks: share title to catalogue ids when the deterministic name match finds nothing (or for a screenshot), and label photo to ingredient tokens. It never writes verdict text and never decides a verdict.
- **`packages/rules`** is a pure TypeScript function: 11 rules (OCC-1, OCC-2, FRG-1, ALC-1, SUP-1, SUP-2, LC-1a, LC-1b, LC-2, LC-3, MED-1), each with an evidence grade and sources, versioned by hash (`440f555a8845`).
- **Catalogue:** 180 rows from 30 brand files; 125 count for verdicts because a second, independent read matched the brand page's ingredient list word for word.
- **Expo SDK 58 + expo-router** for the Android app (share intent, camera, light and dark themes following the phone), **Vite + React** for the web (`/check`, `/audit`, `/rules`, `/how`), zod contracts shared by all three, and one token pipeline for both React Native and CSS.
- **A copy linter** fails the build on banned words (medical, safety and colourist terms, numeric scores) in app, web, shared copy, README and these submission docs.
- Heavy builds ran on a remote VM (`scripts/remote.sh`), including a headless Android emulator walkthrough of the release APK in both themes.

## YouCam APIs used

Base URL `https://yce-api-01.makeupar.com`, server-to-server from the Worker only.

| API | Endpoint | Used for | Units |
|---|---|---|---:|
| File upload | `POST /s2s/v2.0/file`, then the presigned `PUT` | selfie upload for scan and try-on | 0 |
| Skin Analysis v2.1 HD | `POST /s2s/v2.1/task/skin-analysis`, `GET /s2s/v2.1/task/skin-analysis/{task_id}` | `hd_skin_type` (per zone), `hd_oiliness`, `hd_moisture`, `hd_redness`, `hd_pore` (per zone) | 16 |
| Facial Color Tones (skin tone) | `POST /s2s/v2.0/task/skin-tone-analysis`, `GET /s2s/v2.0/task/skin-tone-analysis/{task_id}` | picks two candidate shades for try-on; the colour is never shown | 20 |
| Makeup VTO | `POST /s2s/v2.0/task/makeup-vto`, `GET /s2s/v2.0/task/makeup-vto/{task_id}` | two shades on the same photo (`foundation`, `lip_color`) | 1 each |
| Task delete | `POST /s2s/v2.0/task/delete` | delete after every result, confirmed by a later GET | 0 |
| Credit | `GET /s2s/v1.0/client/credit`, `GET /s2s/v2.0/credit/feature-cost` | unit ledger on "How this was made" | 0 |

Measured live in the API spike (each feature called on its own): HD Skin Analysis succeeded on the first poll at 5.4 s; each Makeup VTO took about 5.3 s; delete returned 200 and the task was gone (GET 400, mask URL 404) about 2 s later. Skin tone was priced from the live feature-cost list and exercised against the mock only. The app's own chain (upload slot → `src_file_id` → task → delete) has run end to end against the mock, not yet live.

## Challenges we ran into

- **Score direction.** On the sample face, oiliness raw was 99.5 and pores 100: higher means less visible concern. Bands invert it, and the cutoffs stay provisional until calibrated on consenting people.
- **Eventual delete.** A GET straight after delete still returned results. We built a state machine that confirms before the tick, and says so plainly if a delete fails ("auto-removed within 30 days").
- **Share sheets differ by store.** Flipkart shares only a short link, Amazon hides third-party apps behind More, Nykaa shares title and URL. Each needed its own parser and onboarding hint, found by testing on a real Samsung phone.
- **Flipkart from Cloudflare.** The one-redirect lookup worked from a home connection but stalled from Cloudflare IPs. The phone now follows the short link itself and sends the listing address; the Worker parses it with no network call.
- **Audit frame.** The spec's original audit used a Flipkart filter page. Collecting it would need automated store access, which Flipkart's terms don't allow, so we re-registered the method on brand pages only, before running it, with git tags.
- **Honest catalogue tiers.** Gating on human ticks made every real product UNKNOWN on device. We added a recorded second-read tier and label which tier each verdict used.

## Accomplishments that we're proud of

- A working Android APK where a real share from the Flipkart, Amazon.in or Nykaa app lands on a verdict with reasons, in light and dark.
- Two-shade YouCam Makeup VTO on 7 tinted sunscreens, each shade colour taken from the brand's own page with its source recorded.
- A pre-registered, tagged audit with its own result published as is: 0 of 136 label-check mismatches, 70 of 136 flagged CAUTION for a profile their own claim points to, 0 reviewed by a person so far.
- Every verdict shows its working: rule id, reading, ingredient, ruleset version, YouCam task id, units and delete state.
- No numeric skin score, no age estimate, no before/after anywhere.

## What we learned

- Spike the API before designing: three of our biggest decisions (inverted bands, zone copy, delete confirmation) came from 18 units of live calls.
- Honest "we don't know" needs design work, a next step and a catalogue count, or it reads as broken.
- A model is most useful at the messy edges (share titles, label photos), and most trustworthy when it never holds the verdict.

## What's next

- Hallway feedback with consenting shoppers, then band cutoffs calibrated on real readings.
- A person reviews the 86 flagged audit rows; re-run as `audit-run-2` if anything changes.
- Re-scan after 30 days, Hindi, iOS, a pharmacist QR for the medicine gate.
- A retailer or brand pilot of `POST /v1/label-check` on a real seller feed, run on their own YouCam account.
- Brand-sourced shade colours for the 4 tinted rows that have none, so they can offer try-on too.

## Built with

YouCam API (Skin Analysis v2.1 HD, Facial Color Tones, Makeup VTO), Claude (`claude-opus-5-5`, Anthropic SDK), TypeScript, React Native, Expo SDK 58, expo-router, React, Vite, Cloudflare Workers, Hono, zod, Vitest, Playwright, Android.

## Judging criteria: where to look

| Criterion | Evidence in the submission |
|---|---|
| Technological implementation | Three YouCam features wired (HD Skin Analysis and Makeup VTO verified live in the spike, Facial Color Tones against the mock) plus delete; try-on reachable on 7 tinted catalogue rows with brand-sourced shade colours; per-zone HD readings mapped to bands with the inverted score direction; delete state machine with confirming GETs; unit ledger; full mock server replaying real responses; pure rules engine with hash-versioned rules; Claude limited to structured reading jobs; release APK built and walked through on an emulator in both themes. |
| Design | Silver Mirror visual system in light and dark, both designed and following the phone; reason-first verdict cards where state reads from label, icon and outline, not colour alone (CAUTION is amber, never red); a designed UNKNOWN with a next step; 48dp targets and screen-reader labels; consent screen that lists what stays on the phone. |
| Potential impact | Works from the store apps shoppers already use, through the Android share sheet; a published audit of 136 brand-page products (70 flagged for a profile their own claim points to); `POST /v1/label-check` already checks seller feeds for retailers and brands (built, no partner yet); one 16-unit reading powers every check for 30 days, and try-on spends units only at the moment a shopper is choosing a shade. |
| Quality of idea | Checks the exact listing in front of the shopper against their own YouCam reading, rather than recommending from one store's shelf; label claim vs ingredient list vs reading in one view; honest about limits (bands not scores, UNKNOWN, medicine gate, "our sample, not the market"). |

## Links (fill before submitting)

- Demo video: `<YouTube or Vimeo URL>`
- Repository: `<GitHub URL>`
- APK: `<GitHub Release URL for silver-mirror-release.apk>`
- Audit page or method: `audit/METHOD.md` in the repo

Cosmetic guidance, not medical advice. Not affiliated with Flipkart, Amazon or Nykaa.
