# SkinKey v2: locked spec (red-team fixes applied)

*Locked 2026-11-01 11:30 ET (22:00 IST). Devpost deadline 2026-11-02 11:45 ET (22:15 IST). Internal submit 09:00 ET (19:30 IST).*
*This file replaces the v2 plan draft and applies the four red-team reviews (YouCam API, retail, feasibility, originality).*

**Rules for every number in this file and everything built from it:**
- Every number is cited to a file, computed by a committed script, or marked **ASSUMPTION** / **UNVERIFIED**.
- Headline results are never written before the script has run.
- All language stays cosmetic, never medical.

**State at lock (checked on disk):**
- `/home/aman/youcam/data/catalog/brands/` has 0 files.
- `/home/aman/youcam/spikes/` does not exist.
- There is no app, Worker or web code yet.
- Node v24.21.0 is installed.
- `/home/aman/Android/{cmdline-tools/latest, platform-tools}` and `/home/aman/jdks/jdk17` exist. Platforms and build-tools are not installed, and no device is attached.

**Doc sources** (saved under `/tmp/claude-1000/-home-aman-youcam/b17a1183-f92a-43c4-ae32-dde9d5f45f9f/scratchpad/docs/`, called "docs" below):
- `md/sa21_get.md`, `md/sa21_post.md`
- `md/reference_ai_skin_analysis.md`
- `md/reference_description_ai_makeup_vto.md`
- `md/develop_rate_limit.md`, `md/develop_file_retention_period.md`, `md/develop_webhook.md`
- `md/reference_description_ai_face_tone_analyzer.md`
- `yce.html`, which holds the `task/delete` and `credit` endpoints

---

## Red-team fixes: what was applied and what was not

| Red-team finding | Decision in v2 (locked) |
|---|---|
| `hd_skin_type` may not return a label string | Gate **G1**. Two copy sets are written in advance. The linter bans "T-zone reading" unless a t_zone label actually comes back (§3, §9). |
| Share moment makes no YouCam call | Facial Color Tones moves out of onboarding and into the try-on flow, where it runs on the fresh try-on selfie. For tinted products the share moment chains Tone → Makeup VTO ×2 → delete. Skincare checks still reuse the stored HD readings. That is a deliberate privacy choice (no new face upload for each product) and is said openly (§3, residual risk R2). |
| Scope too large | Three tiers (§12). The never-cut tier is hero loop, HD scan with delete, verified catalogue frame, designed UNKNOWN, and try-on. The Durable Object, webhooks, `/brands`, Hindi, the translucent sheet, barcode and re-scan diff are cut. |
| Makeup VTO body wrong | Corrected bodies in §3 (`version:"1.0"`, `skin_smooth` effect object, `colorIntensity`, lip `shape`/`style`/`gloss`/`transparencyIntensity`). |
| VTO image size | Resize the selfie to **768×1024**. The docs give two limits: the table says "long side < 1920" and the error text says "width < 1920px, height < 1080px". 768×1024 meets both. Gate G7 checks it. |
| task/delete semantics | The docs say it "removes the task, its output files, and the uploaded input files it was run on" (yce.html). There is no endpoint to delete a file on its own. §3 adds a delete state machine and an "orphan upload" state. |
| ui_score is a "psychological motivator" | Bands come from **raw_score only**. A CI test fails if `ui_score` reaches the verdict module. Cutoffs are published on `/rules`. |
| `format` defaults to zip | Always send `format:"json"`. |
| Rate limit | 250 requests per 300 s per IP and per token (develop_rate_limit.md). That is about 0.83 req/s sustained. The Worker paces requests at least 1.2 s apart. All agents and CI use a mock YouCam server. |
| Polling is mandatory | The tone doc says a task with no GET in its retention window times out even if it succeeded, and units are still used. Every task gets at least one GET. Webhooks are cut and the Worker polls. |
| "Live mask overlay" wording and the privacy claim | Renamed to "YouCam result overlay". It stays in memory only and is never written to disk. Capture URIs are deleted after upload. A CI/E2E check lists the cache directory and expects no images (§9). |
| HD capture failures | Capture guide with `pictureSize` short side ≥1080, an oval at 60–80% of frame width, a light hint, and readable error copy (§2). |
| "Find better matches" sends users to the seller-tag signal we question | Our ranked catalogue comes first. The Flipkart link is secondary and labelled "Flipkart's own skin-type filter (seller-tagged, not checked by SkinKey)". The YouCam-class → Flipkart-facet mapping is published (§5). |
| Headline A has no YouCam in it / Headline B is circular / selection bias | A **pre-registered sampling frame** is taken from Flipkart's own "Oily Skin" filter. The rules are frozen before the run. The result is three counts plus a "one tag, six YouCam reading profiles" matrix, with the circularity stated openly. YouCam engineering counts (delete confirmations, repeatability) sit next to it (§6). |
| LC rule false positives | LC-1a is strict and LC-1b is informational. LC-2 matches plain "Alcohol" and SD Alcohol, and excludes Benzyl Alcohol and the fatty alcohols. LC-3 excludes PEG/hydrogenated castor-oil solubilisers and moves essential oils to LC-1b. Every flagged row is human-reviewed and screenshotted. Brand names are blurred in the video (§5, §6). |
| Claude's SKU choice effectively decides the verdict | A **SKU confirmation step** ("We think this is [brand, name, size]. Yes / Not this") comes before any verdict (§2, §4). |
| DPDP gaps | 18+ confirmation. The consent screen names Perfect Corp processing. A crop/warning step comes before any screenshot goes to Claude. "Withdraw consent" sits next to Delete Key (§9). |
| Judges can't run the hero | "Try a sample share" button. A labelled Demo Key. Caps per install. A unit reserve held until winners are announced (§7, §11). |
| Toolchain misstated | Build locally with Gradle (sdkmanager + jdk17 exist) and install through Windows `adb.exe`. EAS is the backup. EAS Update handles JS-only fixes (§12). |
| Timezone / daylight | The plan runs on two clocks. The team's timezone is **ASSUMPTION: India** (Flipkart/Amazon.in focus, desk research supplied by Aman), so recording happens in IST daylight (§12). |
| "Portable key" is ShelfSense's "Skin Passport" | The story now leads with the two mechanics that are actually distinct: share-in from the store apps, and the label-claim check (§1). |
| Try-on is the most-copied feature | The try-on is triggered by the listing's own shade claim, renders two shades on the same photo, never shows a CIEDE2000 score, and runs ≤20 s in the video (§2, §11). |
| Originality claims are absolute | All such claims are scoped to "356 repo descriptions, snapshot 2026-11-01", re-checked Mon 07:00 ET. Skinimalist, dermavto, skin-ai-daily-edit, skinshelf, aurafit, AuraBeauty, claim-guard and face-value are added to the comparison table (§11). |
| Receipt drawer is developer clutter | The verdict sheet keeps one provenance line. Task ids and units move behind "How this was made" (§8). |
| Demand panel contradicts the consent copy | Cut. There is one buyer story: marketplace catalogue QA (§7). |
| Pharmacist QR dropped | Kept as a 1-line README "roadmap" item. It is not built (§10). |
| Advanced Skin Report / Product Recommendation ignored | One README line explains why we use deterministic rules instead. We call it once in a spike as a comparison if the request parameter can be found; the parameter is UNVERIFIED in the saved docs (§3). |

**Not applied (reason):**
- The "Refresh this reading at share time" scan. It costs 12+ units per check and asks for a face upload for each product, which conflicts with the privacy stance. It goes to the roadmap.
- Hindi/Hinglish. No time for a human check.
- Scan-stability study on "teammates". There is one human, so it is reported honestly as n=1 plus opt-in hallway testers, and only if they opt in.

---

## 1) One-line story and pitch

**Story:** *The listing says "for oily skin". SkinKey checks that claim against the product's own ingredient list and your YouCam Skin Analysis readings, from the Flipkart or Amazon.in app you're already in. For tinted products, YouCam shows you two shades on your face before you buy something you can't return.*

- **Tagline:** "The tag says oily skin. Your scan and the ingredients get a vote."
- **Why it matters (cited, desk research, nobody interviewed):**
  - Opened skincare usually can't be returned on Nykaa and Purplle (05 finding 3, grade C).
  - About 40% of self-reported skin types matched instrument measurement (Youn 2002 via a secondary summary, 05 finding 1, grade A).
  - 43% worry AI recommendations are paid placements (05 finding 6).
  - 64.5% dislike white cast (05 finding 8, grade B).
- **What we can and can't claim about the scan:** it is a consistent, dated reading. It is not a validated measurement. We never claim YouCam fixes the 40% problem (retail red-team).
- **Pitch to Perfect Corp, neutral wording:**
  - Store skin tools recommend from their own shelf.
  - SkinKey brings YouCam Skin AI and Makeup VTO to the product the shopper is already looking at, in the Flipkart and Amazon.in Android apps, through the share sheet.
  - On the B2B side the same deterministic rules become a catalogue-QA check that marketplaces can run on their seller feeds, and a retailer runs it on its own YouCam account.
- **Distinct mechanics, scoped to evidence.** None of the 356 hackathon repo descriptions in competitor_repos.tsv (snapshot 2026-11-01) mentions either of these:
  1. Share-in from the native Flipkart / Amazon.in Android apps.
  2. Checking a listing's label claim (fragrance-free / alcohol-free / oil-free / "for oily skin") against its own INCI list and the user's YouCam readings.
- **What we explicitly don't claim is ours:**
  - Fit verdicts from scan + ingredients: before-you-buy (row 288) does this.
  - Shade preview: ShelfSense (row 91), dermavto (row 188).
  - Zone heatmaps: aurafit (row 75), AuraBeauty (row 342).
  - Provenance receipts: skinshelf (row 16).
  - Claim linter: Round-1 winner Aloud.

---

## 2) Hero flow (step by step)

### A. Onboarding (once; the Key expires after 30 days, see §9)
1. **Consent.** One screen showing:
   - Approved line: "SkinKey stores no photo; YouCam processes it and we delete it from YouCam right after."
   - Qualifier: "YouCam (Perfect Corp) processes the photo on its servers. If deletion fails, YouCam removes files automatically within 30 days."
   - "What we keep" chips: skin-type reading, oiliness / moisture / redness / pore bands, zone labels, scan date.
   - The Accuracy note.
   - "I'm 18 or older" checkbox, not pre-ticked.
   - **Start scan** and **Not now** at equal visual weight. Not now leads to Demo Key mode or name-only checks.
2. **Capture guide** (expo-camera):
   - `pictureSize` pinned so the short side is ≥1080.
   - Static oval sized so the face fills 60–80% of frame width. The docs require the face at more than 60% of width.
   - Light hint.
   - Readable copy for `error_src_face_too_small` ("Move closer so your face fills the oval") and `error_lighting_dark` ("Face a window or a lamp").
3. **Processing**, showing real Worker status steps (no spinners):
   - Uploading → Analysing (HD) → Reading results → Deleting from YouCam ✓.
   - The capture file is deleted from the phone cache right after the PUT (`FileSystem.deleteAsync`).
4. **YouCam result overlay**:
   - The single blended JPG from `enable_mask_overlay` is shown from memory for under 2 s.
   - It then cross-fades into the illustrated zone glyph and is dropped from memory.
5. **Your Key card**:
   - Glyph with zone labels in text.
   - Bands, with "Feels wrong? Edit". An edit marks that band "self-reported".
   - Scan date, a "photo deleted" stamp, and **Delete Key / Withdraw consent**.
6. **Coach mark:** "Find SkinKey in your share menu, then pin it" (05 finding 11).

### B. Share moment (the hero, one unbroken take)
1. In the Flipkart or Amazon.in app: Share → SkinKey. The payload is text plus URL. The S1 fallback is a screenshot (`image/*`), with a crop step before anything goes to Claude.
2. **SKU confirmation:**
   - If the catalogue gives a match above threshold, show "We think this is **[brand · name · size]**. Yes / Not this".
   - If Claude's entity resolver returns candidates, show the top 3 as choices.
   - If nothing matches, go to UNKNOWN.
   - No verdict appears before Yes.
3. **Verdict sheet.** Target: under 3 s for a catalogue hit (ASSUMPTION, to be measured and reported). Card order:
   1. Label (FITS / CAUTION / UNKNOWN / MEDICINE) and its fixed subtitle.
   2. **Reason 1, Label Check** (only if a strict LC rule fires): "Listing says 'fragrance-free'. Its ingredient list has *Parfum* (rule LC-1a)."
   3. **Reason 2, reading → named ingredient → plain words.** The glyph zone lights up.
      - G1 pass: "T-zone reading: Oily (scan 1 Nov). Contains isopropyl myristate, which our rule OCC-2 flags as heavy for oily-looking skin."
      - G1 fail: "Oiliness reading: High (whole face, scan 1 Nov) · Nose pore reading: High. Contains …"
   4. One provenance line: "Measured by YouCam Skin Analysis HD, 1 Nov · photo deleted · rules v[hash]".
   5. Links: "Where this comes from" (rule, source, INCI source URL) and "How this was made" (task ids, units, latency, delete status).
4. **If the product is tinted** (tinted SPF / tinted moisturiser / lip tint / tinted lip balm), go to flow C.
5. **Better matches:**
   - "Ranked by fit to your readings. No paid placements."
   - Verified catalogue SKUs, one reason line each. Each opens a Flipkart keyword search for that product's name.
   - A secondary link: "Browse Flipkart's own Combination Skin filter (seller-tagged, not checked by SkinKey)". This uses the facet URL.
   - Amazon and Nykaa get keyword search only.

### C. Tint try-on (share-moment YouCam chain)
1. Trigger:
   - If the listing makes a shade claim ("universal tint", "suits all skin tones", one shade only), the button reads **"The listing says one shade suits everyone. Try it on me."**
   - If the product has several shades, the button reads **"Try two shades on me."**
2. A separate try-on consent sheet, then a fresh selfie, resized on the phone to 768×1024.
3. Progress shows real steps:
   - Multi-shade: "Reading skin tone (YouCam) → Rendering 2 shades (YouCam) → Deleting from YouCam ✓".
   - Single-shade: render only.
4. Result:
   - The two renders sit side by side, both from the same photo.
   - Caption: "Two shades, same photo. Preview, not a shade guarantee."
   - No before/after. Shade-name chips. No Save button. The render is held in memory only and dropped when the sheet closes.

### D. UNKNOWN (designed, not an error)
1. Copy: "We can't read this listing's ingredients. This doesn't mean it's bad." Then the live count: "Our catalogue: N verified products."
2. One big button: **Snap the ingredient list.**
3. Claude vision returns INCI tokens. They appear as editable chips, with uncertain tokens outlined.
4. The user confirms, the same rules run, and the card morphs into a verdict.
5. Provenance reads: "Photo of label, confirmed by you."

### E. MEDICINE gate
- Triggered if the INCI or title contains a gated token (adapalene, tretinoin, benzoyl peroxide, clindamycin, ketoconazole, hydroquinone, …).
- Copy: "This looks like a medicine (contains [token]). SkinKey doesn't check medicines. Ask a pharmacist or doctor."
- No verdict and no better-matches link.

---

## 3) YouCam API chain: endpoints, params, units, visible effect

Base: `https://yce-api-01.makeupar.com`. Bearer key, held only in the Worker.

**Profile (onboarding): 16 units**

| # | Call | Params (exact) | Units | Visible effect / decision |
|---|---|---|---|---|
| P1 | `POST /s2s/v2.0/file`, then presigned PUT | jpg, short side ≥1080 | 0 | "Uploading". Phone deletes the capture URI after the PUT. |
| P2 | `POST /s2s/v2.1/task/skin-analysis` | `src_file_id`, HD concerns `hd_skin_type, hd_oiliness, hd_moisture, hd_redness, hd_pore`, `enable_mask_overlay:true`, **`format:"json"`**. No acne, no skin age. | **16** (HD 5–8 concerns, reference_ai_skin_analysis.md:610-613) | Overlay for under 2 s. `hd_skin_type` whole/t_zone/u_zone feeds the glyph and zone reasons (if G1 passes). `raw_score` bands feed the rules. `hd_pore` sub-regions give "nose pore reading". |
| P3 | `GET /s2s/v2.1/task/skin-analysis/{task_id}` | Poll every 3 s (docs suggest about 10 s), at least one GET | 0 | "Reading results". `data.results.output[]`: `type, region, raw_score, ui_score, mask_urls`. `ui_score` is discarded at the Worker boundary. |
| P4 | `POST /s2s/v2.0/task/delete` | `task_id` of P2, only after status is terminal and the result is read | 0 | "Deleting from YouCam ✓". Removes the task, outputs and input file (yce.html). |

**Try-on (share moment, tinted only): 22 units (multi-shade) or 1 unit (single shade)**

| # | Call | Params | Units | Visible effect |
|---|---|---|---|---|
| T1 | `POST /s2s/v2.0/file` | 768×1024 jpg (G7) | 0 | "Uploading" |
| T2 | `POST /s2s/v2.0/task/skin-tone-analysis` (multi-shade only) | same `src_file_id` (G2) | **20** (reference_description_ai_face_tone_analyzer.md:594) | "Reading skin tone". `skin_color` hex, used **internally only** to pick 2 candidate shades by CIEDE2000. The score is never shown. |
| T3 | `POST /s2s/v2.0/task/makeup-vto` ×1–2 | See body below | 1 each | The renders |
| T4 | GETs for T2/T3, then `task/delete` for each | Wait until every task on the file is terminal; delete each | 0 | "Deleted from YouCam ✓" |

**Makeup VTO body (from docs):**
```json
{
  "src_file_id": "<id>",
  "version": "1.0",
  "effects": [
    {"category": "foundation",
     "palettes": [{"color": "#C8A27E", "colorIntensity": 40, "glowIntensity": 30, "coverageIntensity": 25}]},
    {"category": "skin_smooth", "skinSmoothStrength": 0, "skinSmoothColorIntensity": 0}
  ]
}
```
Values are placeholders; G5 picks the real ones.

Lip variant:
```json
{"category": "lip_color", "shape": {"name": "original"}, "style": {"type": "full"},
 "palettes": [{"color": "#B5535C", "texture": "sheer", "colorIntensity": 50, "gloss": 40, "transparencyIntensity": 50}]}
```
- `shape.name` must be a label from lipshape.json.
- The docs note that smoothing at 0 can blend worse. G5 compares 0 with the default. If 0 looks broken we send a low value such as 10, and the README says so.

**Delete state machine** (Worker plus phone; one record per uploaded file):
`uploaded → task_created → running → terminal(success|error) → result_read → delete_requested → deleted | delete_failed`

| Situation | What happens | What the receipt says |
|---|---|---|
| Upload with no task (cancel, 400 on create, quality fail) | Nothing can be deleted | **Orphan upload**: "Not processed; YouCam removes it automatically within 30 days." |
| Tasks sharing a file | All tasks finish, all results are read, then each task is deleted | Normal delete ticks |
| Delete fails | Receipt shows the failure | "Delete failed: auto-removed within 30 days." |

**Retention wording.** One line is used everywhere, based on develop_file_retention_period.md: files and task ids are kept up to 30 days. The v2.1 note that results can be queried for 24 hours is not used in copy.

**Not used, and why (README "what we didn't use"):**
- **Fitzpatrick (10 units):** pushes toward UV and medical framing, and changes no rule.
- **Skin/Aging Simulation:** before/after efficacy implications.
- **Face Attributes:** no rule uses it.
- **Advanced Skin Report / Product Recommendation (v2.1, llm_results.json):** we chose published deterministic rules so every verdict can be audited. We try it once in a spike as a comparison if the request parameter can be found (UNVERIFIED).
- **`pf_camera_kit` / Mobile Camera Kit:** no React Native SDK. We use our own capture guide. The web `/check` fallback uses the JS Camera Kit `hdskincare` mode for live capture-quality checks (Tier 2).

**Worker (Cloudflare, no Durable Object):**
- Keys stay server-side.
- Phone → Worker → YouCam, with a rate limiter: 250 requests per 300 s sliding window in KV, requests at least 1.2 s apart, 429 retry with jitter, idempotency keys on create.
- **Unit ledger**, cross-checked against `GET /s2s/v1.0/client/credit` and `GET /s2s/v2.0/credit/feature-cost` (both in yce.html).
- Caps per install (anonymous install id, HMAC-signed): **1 real scan and 3 try-ons**.
- A judging reserve that is never spent by the team (§11).
- `MOCK_YOUCAM=1` replays recorded G1–G7 fixtures for all agent development and CI. Agent traffic on the real key pauses during recording.

**Hour-0 gates** (raw JSON saved to `/home/aman/youcam/spikes/`; spike budget ≈ 90 units):

| Gate | Question | Pass → | Fail → |
|---|---|---|---|
| G0 | Delete a finished task. Do a later GET and the old download URL both fail? | The approved privacy line stands | Change the consent copy before anything is recorded: "we ask YouCam to delete…; auto-removed within 30 days" |
| G1 | Does `hd_skin_type` return a class label per zone (whole/t_zone/u_zone)? Which way does each `raw_score` run (higher = more visible oiliness, or less)? Scan once normal and once blotted, n=1. | Zone copy set A; facet from `whole` | Copy set B: whole-face oiliness/moisture/redness bands plus pore sub-regions; skin type derived from bands by a published rule; "T-zone reading" banned by the linter |
| G2 | Does one `file_id` work for both tone and VTO? | One upload per try-on | Separate uploads, each with its own delete |
| G3 | Does deleting task A break task B on a shared file? | Delete order is free | Strict "all terminal, then delete" (already the default) |
| G5 | Is a low-coverage foundation render visible at 3 intensities, with smoothing at 0 and at default? | Tinted-SPF try-on | `lip_color` sheer on a lip tint or tinted lip balm becomes Plan A |
| G6 | Does task/delete work on an `error` task? | Same ticks | "Delete failed" state |
| G7 | Is 768×1024 accepted by makeup-vto? | Use it | Try 720×960 |
| S1 | What do the Flipkart and Amazon.in shares contain? (Share → Copy → paste into notes; no build needed) | Text parser | Screenshot share read by Claude after a crop step, plus the paste field |
| S2 | Does the Flipkart app keep the facet URL? Do Oily/Dry/Combination/All Skin Types each apply? | In-app link | Chrome Custom Tab, labelled "opens in browser" |

---

## 4) Claude Opus 5.5 usage: reads and extracts, never decides

- **Model:** `claude-opus-5-5`, called from the Worker (TypeScript, `@anthropic-ai/sdk`) and from offline scripts.
- **Request settings:**
  - `thinking: {type:"adaptive"}`. It can't be disabled on this model.
  - `output_config.effort` set explicitly (the default is `medium`).
  - **Structured outputs** through `output_config.format` (JSON schema), or `strict: true` tools with `tool_choice:"auto"`. Forced `tool_choice` returns a 400 on this model.
  - No `temperature`.
  - Server-side `fallbacks:"default"` (beta `server-side-fallback-2026-07-01`), with a `stop_reason === "refusal"` check before reading content.
  - Prompt caching on the frozen system prompt plus the CosIng name list.
  - Offline catalogue extraction goes through the Message Batches API.
- **Boundary:** `verdict(bands, inciTokens, claims, rules)` in `rules/` is a pure function.
  - CI fails if `rules/` imports the Anthropic SDK, `fetch`, or any network module.
  - CI fails if any `ui_score` field reaches it.
- **SKU choice:** Claude proposes candidates only. The **user confirms the SKU** before a verdict appears.

| Prompt | Purpose | Structured output (schema keys) | Effort | Guard |
|---|---|---|---|---|
| X1 Catalogue extractor (offline, 2 passes) | Pull INCI, claims, shades and finish from brand D2C pages | `{inci:[{token, position}], claims:[{type, quote, char_span}], shades:[{name, swatch_img_url}], finish, tinted:boolean, spf, size}` | high | Pass 2 re-extracts and diffs against pass 1. Each row keeps `source_url`, `fetched_at`, a page screenshot, and `verified:false` until a human ticks it. Shade hexes are **sampled by code** from swatch images (URL and pixel logged), never produced by Claude. |
| X2 Verification-packet writer (offline) | Highlights the INCI and claim spans on the screenshot and lists the pass-1/pass-2 disagreements, so the human only ticks | `{row_id, disagreements:[…], highlights:[bbox]}` | medium | The human decision is the only path to `verified:true` |
| X3 Share resolver (runtime) | Map a messy title, URL or screenshot to **catalogue IDs only** | `{candidates:[{catalog_id, confidence, why}], extracted_title, is_skincare:boolean}` | low | Never produces INCI from a title. Below threshold → UNKNOWN. Screenshots are cropped to the product area before upload. |
| X4 Label OCR (runtime) | Photo of the ingredient list → INCI tokens normalised to CosIng names | `{tokens:[{raw, cosing_name, confidence}], unreadable_regions:int}` | medium | Editable chips. The user confirms. Low-confidence tokens are outlined. |
| X5 Claim span extractor (offline) | Find claim spans (fragrance-free, alcohol-free, oil-free, "for oily/dry/sensitive skin", one-shade/universal-tint) | `{claims:[{type, quote}]}` | medium | Human ticks each claim. Matching against INCI is deterministic (rules). |
| X6 Eval runner (offline) | Golden set: ~30 share payloads and ~20 label photos (**ASSUMPTION**: as many as the human can photograph) | Token-level comparison against human labels | n/a | Report counts only: "x of y tokens", "a of 30 shares resolved", "UNKNOWN → verdict via label photo: k of m" |

Claude never writes verdict copy at runtime. Every user-facing reason is a fixed template filled with rule_id, band and INCI token.

---

## 5) Rules engine

Package: `rules/` (pure TypeScript, shared by app, Worker and web).

**Rule record:**
`rule_id, kind (FIT_CAUTION | FIT_SUPPORT | LABEL_CHECK | MEDICINE), grade (R|L|T), trigger_band (e.g. oiliness=High OR t_zone∈{Oily, Combination}), inci_set (CosIng names + regex for families), position_limit (optional, e.g. top 5), template, sources[] (citation + URL), counter_sources[]`

**Grades** describe the evidence for the *ingredient side*. No rule has measured evidence that it changes how skin looks for a given reading, and `/rules` says so in a banner.
- **R** = the ingredient's identity comes from a regulatory list (e.g. EU fragrance-allergen labelling, Reg. 2023/1545).
- **L** = literature, possibly contested; the counter-citation is shown (e.g. Fulton 1989 vs Draelos & DiNardo 2006 on comedogenicity).
- **T** = team rule.

**Bands:**
- Computed from `raw_score` only. Cutoffs (**ASSUMPTION** placeholders: Low <40, Medium 40–69, High ≥70, with direction set by G1) are fixed and published *before* the audit runs. They are not tuned to make the headline look better.
- Monotonicity test: moving a band toward "more concern" can never turn CAUTION into FITS.

**Verdict logic (deterministic):**
1. MEDICINE token present → **MEDICINE**.
2. No verified INCI and no user-confirmed chips → **UNKNOWN**.
3. Any FIT_CAUTION rule fires → **CAUTION**, reasons ordered R > L > T.
4. Otherwise → **FITS**, with support reasons, or "No ingredient in our rules flags your readings."
- LABEL_CHECK results are shown as an extra reason. They never change the label on their own.

**Starting rule set** (A4 drafts it and attaches a citation to each rule, or downgrades it to T; frozen at the `rules-frozen` tag):

| rule_id | Kind | Trigger | INCI | Grade |
|---|---|---|---|---|
| OCC-1 | CAUTION | Oiliness High / t_zone Oily | Petrolatum, Paraffinum Liquidum, Cera Microcristallina in top 5 | L/T |
| OCC-2 | CAUTION | Oiliness High / t_zone Oily | Isopropyl Myristate, Isopropyl Palmitate | L (Fulton; counter-cited) |
| FRG-1 | CAUTION | Redness High / "& Redness" class | Parfum/Fragrance/Aroma, or listed EU allergen | R (ingredient side) |
| ALC-1 | CAUTION | Moisture Low | Alcohol Denat. / Alcohol / SD Alcohol in top 5 | L/T |
| SUP-1 | SUPPORT | Moisture Low | Glycerin, Sodium Hyaluronate, Ceramide NP/AP/EOP | L |
| SUP-2 | SUPPORT | Oiliness High | Niacinamide; gel/"oil-free" texture claim verified | L/T |
| LC-1a | LABEL | Claim "fragrance-free" | Parfum / Fragrance / Aroma | R, counted |
| LC-1b | LABEL (info) | Claim "fragrance-free" | EU allergen or essential oil only (may come from an extract) | R, **not counted** in the headline |
| LC-2 | LABEL | Claim "alcohol-free" | Alcohol, Alcohol Denat., SD Alcohol *, Ethanol. **Excludes** Benzyl Alcohol and fatty alcohols (Cetyl, Cetearyl, Stearyl, Behenyl…), each with a unit test | R/T |
| LC-3 | LABEL | Claim "oil-free" | INCI names that are plant/mineral oils ending in "Oil". **Excludes** PEG-n Hydrogenated Castor Oil and other PEG/hydrogenated solubilisers; essential oils go to LC-1b. Shown as "contested definition" | T |
| MED-* | MEDICINE | any | adapalene, tretinoin, benzoyl peroxide, clindamycin, ketoconazole, hydroquinone, … | n/a |

- Medicine fixtures include everyday BPO washes and ketoconazole shampoos. A reviewed false-positive list sits in the repo.

**YouCam class → Flipkart facet mapping** (published on `/rules`; only facet values seen in skinkey_report.md are used, and S2 confirms which apply):

| YouCam class | Flipkart facet |
|---|---|
| Oily | Oily Skin |
| Dry | Dry Skin |
| Combination | Combination Skin |
| Normal | All Skin Types |
| Redness, Oily & Redness, Dry & Redness, Combination & Redness | Keyword search only, no facet (no matching facet value) |

**Transparency pages** (web, generated from the package at build time):
- `/rules`: every rule with grade, sources, counter-sources and a CosIng link per INCI. Band cutoffs and their direction. Class→facet table. Ruleset git hash. The "not a measured effect" banner.
- `/how`: the YouCam call chain diagram, what is kept, the delete state machine, the Claude boundary.

**CI (Tier 2, trimmed):**
- Snapshot matrix (SKUs × 6 profiles).
- Determinism.
- Monotonicity.
- Medicine fixtures.
- LC exclusion unit tests.
- No-LLM/no-network import test.
- `ui_score` firewall.
- Claim linter on app, web, README and video subtitles.
- Traceability: every rendered reason carries rule_id + band + token + source_url.
- `rank()` returns identical output with affiliate flags on and off.
- Cache-directory image check (E2E script run on device).

---

## 6) Measurable headline result

> **Amended 2 Nov 2026 (approved by Aman):** the Flipkart frame below is replaced by method `brand-claims-1` in [`audit/METHOD.md`](../audit/METHOD.md): brand-page claims checked against the same page's ingredient list, with no store access. The text below is kept as the original pre-registration; where they differ, `audit/METHOD.md` wins.

**Pre-registered method.** Each step is committed and tagged in git *before* the next step runs.
1. **Frame (human, H0–H3):**
   - Aman opens Flipkart (app or web) and searches "moisturiser" with the "Oily Skin" filter on, then "sunscreen" with the same filter.
   - He screenshots the first ~40 and ~20 results in page order, with a visible timestamp.
   - Claude (X3 in vision mode) transcribes the product names from the screenshots and the human checks the transcription.
   - Commit `data/frame/flipkart_oily_2026-11-01/` (screenshots, SHA-256, names.csv). Tag `frame-frozen`.
   - No scraping and no automated access to Flipkart. Human viewing only. Our reading of Flipkart's terms is that this is allowed; it is not legal advice.
2. **Rules:** tuned only on catalogue rows *outside* the frame. Tag `rules-frozen` with the ruleset hash.
3. **Rows:**
   - Every frame product gets a catalogue row from the **brand's own D2C page**, with robots.txt respected.
   - No D2C page, or no INCI on it → row status `unverifiable`, which counts in N but not in a.
   - The human ticks the verification packet.
   - Tag `rows-frozen`.
4. **Run:** `npm run audit` writes `audit/results.csv` (one row per product × rule hit, with claim_quote, claim_url, matched token, rule_id, grade and screenshot path) and `audit/summary.json`. Tag `audit-run`. `/audit` renders only from `summary.json`.

**Reported counts.** Templates only. The numbers come from the script.
- **Coverage:** "Flipkart's 'Oily Skin' filter showed us **N** moisturisers and sunscreens on 1 Nov. We could verify full ingredient lists from brand pages for **a** of them."
- **Lead, "One tag, six readings"** (the count runs through YouCam output fields):
  - Template: "Flipkart shows the same **a** products to everyone who picks 'Oily Skin'. Under our published rules, the number flagged CAUTION is **x₁** for a YouCam 'Oily' reading profile, **x₂** for 'Combination', **x₃** for 'Oily & Redness'…"
  - Shown as a 6-column heatmap (Clay & Ink teal/ochre/slate) with the R / L / T split per cell.
  - Fixed caption: "Flagged by our published rules, not a measured effect on skin. Our sample, not the market."
  - The 6 profiles are fixed band vectors defined from the `hd_skin_type` class list (or from the G1-fail bands) and published on `/rules`.
- **Label Check:** "**c** of **a** make a claim their own ingredient list doesn't match (strict rules LC-1a / LC-2 / LC-3)", plus "**d** more have a listed allergen under a 'fragrance-free' claim (LC-1b, informational)". Each flagged row is human-reviewed, has a screenshot and a "Report an error / brand reply" link.
- **YouCam engineering counts:**
  - "**k** of **m** YouCam delete calls confirmed (a later GET returned an invalid-task error)."
  - Units per profile and per try-on, taken from the ledger.
  - Median latency.
  - Repeatability: "1 consenting person × 3 scans: **s** of **t** bands identical". This is n=1, a consistency check only, and says nothing about other skin tones. Opt-in hallway testers are added only if they consent.
- **Claude eval counts:** shares resolved; label tokens correct; UNKNOWN → verdict via label photo.

**Honesty rules:**
- If x or c is 0 or tiny, we publish it anyway. The story then becomes "the seller tag held up on our sample; here's what changes by reading profile". We don't change the method afterwards.
- Brand names are blurred in the video; `/audit` shows them with the brand-reply link.
- Wording is always "doesn't match rule LC-x", never "lying", "misleading" or "unsafe".
- **Fallback:** if fewer than about 25 frame rows are verified by the freeze, ship as "pilot: a of N verified" with the same method.

---

## 7) Retailer side and business model (honest)

- **One buyer story: marketplace and brand catalogue QA.**
  - "Your seller feed says 'oil-free' and 'for oily skin'. Here are the listings whose own ingredient list doesn't match, and which YouCam reading profiles each one gets flagged for."
- **What ships:**
  - `POST /v1/label-check` (JSON: claims + INCI → LC hits) and `GET /v1/rules`, in the Worker. Deterministic, no Claude on the path.
  - A README curl example.
  - Tier-3 stretch: `/audit` "Run on a CSV" runs the rules package client-side in the browser.
- **How Perfect Corp gains (pitch):** the consumer try-on and the B2B fit check run on the retailer's own YouCam account. Our growth means more YouCam units sold.
- **Pricing and willingness to pay:** not claimed. **ASSUMPTION**; nobody was interviewed.
- **Precedent, not traction:** Amazon's Milan parapharmacy runs a Perfect Corp skin-analysis Derma-bar (Feb 2025, skinkey_concept.json).
- **Consumer side:** free.
- **Affiliate, honest status:**
  - Amazon is **untagged everywhere**. Associates India policy rule 7 bans sites "designed or intended for use with a mobile phone".
  - Nykaa: applied / pending. Off by default (`AFFILIATE_NYKAA=off`), and only on our web `/r/<token>` page.
  - Flipkart affiliate: UNVERIFIED.
  - Copy: "We may earn a commission if you buy; it never changes the ranking" (D5), shown only when a tag is live.
  - Never claim revenue. The phrasing is "built, live once approved".
- **Firewall:** `rank()` takes no brand, billing or affiliate input. CI asserts this (§5).
- **Cut:** demand panel, the "two customers" framing, `/brands` console.
- **Licence:** Open-Meteo's free tier is non-commercial. The UV line is Tier 3 and is dropped if billing ever goes live.

---

## 8) Screens

Visual system: Clay & Ink (`/home/aman/youcam/design/system/directions/clay-ink.html`).
- Measured contrast (design agent): FITS 8.1:1, CAUTION ochre 7.5:1, UNKNOWN slate 7.9:1.
- Material 3 base, 48 dp targets, works at the largest font size, TalkBack order matches visual order, colour is never the only signal.
- Haptic `CONTEXT_CLICK` on a verdict; CAUTION never uses `REJECT`.
- Reduce-motion means 150 ms cross-fades.
- No spinners; every step shows real task status.

**Must be stunning** (design agent pass plus a human screenshot review):
1. **Verdict sheet** (FITS / CAUTION / UNKNOWN → morph / MEDICINE). The reason comes first, the zone glyph lights the relevant zone, the provenance line sits at the bottom.
2. **Scan processing → overlay → Key card.** Real steps, the overlay cross-fades into the illustrated glyph, the "photo deleted" stamp lands.
3. **Tint try-on.** Two renders from the same photo, shade chips, fixed caption, deleted stamp.
4. **`/audit`.** Frame screenshot strip, the "one tag, six readings" heatmap, Label Check table, git tags and the CSV link.
5. **Landing page.** One-line story, 20 s loop, APK QR, "Try a sample share".

**The rest** (clean, consistent, not hero-polished):
- Consent (18+, equal-weight buttons).
- Capture guide.
- SKU confirmation.
- Better matches.
- "How this was made" (task ids, units, latency, delete states).
- Home (paste-link field, Key chip, share tip, "Try a sample share").
- Settings: Delete Key, Withdraw consent, About (pharmacist-QR roadmap line, credits).
- Web `/check` (paste link or title, sample share, Demo Key, label photo upload).
- `/rules`, `/how`, `/r/<token>`.

---

## 9) Guardrails

**Privacy (DPDP-style; BIPA-informed):**
- Explicit, specific, revocable consent, with a **separate consent** for the try-on selfie.
- 18+ checkbox.
- Names Perfect Corp as the processor. Server location is UNVERIFIED, so we don't claim it.
- The approved line plus the 30-day qualifier. "Delete confirmed" is shown only when G0 passes.
- Withdraw consent deletes the on-phone Key and explains the YouCam-side 30-day auto-removal.
- Only bands, zone labels, the tone hex (try-on only, dropped at close) and the scan date are kept, all on the phone. No face geometry is linked to identity. Nothing is sold or shared.
- Screenshot shares get a crop step and the warning "Crop out your address or order details" before anything reaches Claude.
- Product text is never sent together with face data.
- **Code-level proof:**
  - `deleteAsync` runs on capture URIs.
  - The overlay and renders live in memory only (base64 data URI, `expo-image cachePolicy="none"`).
  - An E2E script lists the app cache and files directory after a scan and a try-on, and expects no jpg, png or webp.

**Cosmetic language (claim linter, CI):**
- Bans every brief §4.4 word: safe/unsafe, treat/cure/fix/prevent/heal, fair/fairness/whitening, "your skin is", guaranteed/accurate/precise/no white cast, skin age, numeric scores, "inside Flipkart", "deep-links into Flipkart", plus **"any store"** and **"any app"**.
- Bans **"T-zone reading"** if G1 fails.
- Allowlists the approved Accuracy note string.
- **Fixed strings:**
  - FITS: "Matches your readings on the ingredients we know about. Not a guarantee."
  - CAUTION: "May not suit your readings. A cosmetic fit note, not a health warning."
  - Try-on: "Two shades, same photo. Preview, not a shade guarantee."
  - Footer: "Cosmetic guidance, not medical advice."

**Skin-tone accuracy** (the brief bans the word "fairness"):
- Accuracy note next to every band: "Skin AI can be less accurate on deeper skin tones and in poor light."
- We make no claim about which tones were tested.
- Bands only, never scores.
- A manual edit is allowed and labelled "self-reported".
- The tone hex is never shown as a swatch and never ranks people.

**Medicine gate:** §2E. Fixtures and the false-positive list are in CI.

**Affiliate disclosure:** §7. Disclosure is shown only when a tag is live, and "No paid placements" always.

**Data honesty:**
- Unverified rows show as UNKNOWN.
- Desk-research figures are labelled as desk research.
- Hallway tests are reported as counts and anecdotes.
- No store logos, Amazon ratings or reviews.
- "Not affiliated with Flipkart, Amazon or Nykaa."

---

## 10) What's cut

| Item | Status |
|---|---|
| Skin Forecast module | Cut. One live UV line is Tier 3, only when its rule fires. |
| Aisle Check / barcode / Open Beauty Facts | Cut (the label photo covers UNKNOWN) |
| Pharmacist QR + revoke | Not built. One README roadmap line ("independently novel per skinkey_concept.json"). |
| App Links / assetlinks, referral checklist | Cut / moved to About |
| Durable Object, webhooks (Standard Webhooks) | Cut. The Worker polls; the README explains why. |
| `/brands` console, demand panel, Fit API beyond label-check | Cut |
| Hindi/Hinglish, translucent share sheet, Direct Share, re-scan diff | Cut (roadmap) |
| Fitzpatrick, Face Attributes, Simulations | Not used (§3) |
| SD scan, trusting `ui_score` | Replaced by HD + `raw_score` |

---

## 11) Demo video arc and README/Devpost outline

**Demo (2:30; the novelty lands by 0:20; real phone via scrcpy with show-taps; brand names blurred on flagged rows):**

| Time | Beat |
|---|---|
| 0:00–0:10 | Flipkart search with the "Oily Skin" filter on. Caption: "This filter is seller-tagged. Opened skincare usually can't be returned (Nykaa, Purplle; desk research)." |
| 0:10–0:45 | **One unbroken take**, badge "Real phone · real time · uncut". A non-tinted moisturiser from the frame → Share → SkinKey → "We think this is … Yes" → CAUTION with the zone reason (and the Label Check reason if one fires) → glyph lights → Better matches (our ranked list) → secondary "Flipkart's own filter (seller-tagged)". |
| 0:45–1:05 | A different product, tinted: "The listing says one shade suits everyone. Try it on me" → consent → selfie → "Reading skin tone → Rendering 2 shades → Deleting" → two shades, same photo. |
| 1:05–1:20 | Obscure product → UNKNOWN → Snap label → chips confirmed → verdict. "Claude reads. Our rules decide." Catalogue count shown. |
| 1:20–1:40 | How the key was made: capture guide, YouCam result overlay → glyph, delete tick. "How this was made": real task ids, units, delete confirmed. |
| 1:40–2:05 | `/audit`: frame screenshots, git tags, terminal `npm run audit`, the computed heatmap and Label Check counts. "Our sample, not the market." |
| 2:05–2:20 | B2B: `curl /v1/label-check` on a 3-row seller feed. "Catalogue QA for marketplaces, on your own YouCam account." |
| 2:20–2:30 | Comparison table → APK + web QR. "Cosmetic guidance, not medical advice. Not affiliated with Flipkart, Amazon or Nykaa." |

**Demo products:**
- **SKU-1 (CAUTION, one take):** a non-tinted moisturiser from the frame with a verified rule hit.
- **SKU-2 (try-on):** Plan A is a lip tint or tinted lip balm (`lip_color` sheer). If G5 passes, it is a tinted SPF (`foundation`).
- Both are picked from human-verified rows by **H4 (15:30 ET / 02:00 IST)**.
- A rough insurance take is recorded as soon as the first build works.

**README (repo):**
1. One-line story + 20 s GIF.
2. How to test in 2 minutes, without the Flipkart app:
   - "Try a sample share".
   - The Demo Key (sample readings, labelled).
   - Web `/check`.
   - APK link.
   - Caps per install.
3. Hero flow.
4. YouCam chain: sequence diagram, endpoints, params, units, delete state machine, what we didn't use and why (Advanced Skin Report, Camera Kit, Fitzpatrick).
5. Claude boundary: prompts, schemas, "never decides", eval counts.
6. Rules + `/rules` + band cutoffs + class→facet.
7. Audit method: frame, tags, counts, caveats.
8. Privacy + G0 result.
9. Comparison table:
   - Rows: Flipkart Skin Analyser (ModiFace), Amazon.in SkinCare Analyzer (quiz), Nykaa Skin Scan (UNVERIFIED), Skinimalist, before-you-buy, ShelfSense, skinshelf, dermavto, skin-ai-daily-edit, aurafit/AuraBeauty, youcam-claim-guard/face-value, cast-forecast, mirrorkey.
   - Columns: works from the store apps / measured reading / checks the specific product / label-claim check / auditable / photo deleted / closest overlap and how we differ.
   - "Store-owned" is described as structural, not as an accusation.
   - Scope line: "based on 356 repo descriptions, snapshot re-pulled Mon 07:00 ET".
10. What's possible / not possible.
11. Roadmap (pharmacist QR, re-scan refresh, Hindi, iOS).
12. Credits and licences.

**Devpost:**
- Inspiration (desk research, labelled as such).
- What it does.
- How we built it: YouCam chain first, then Claude, then rules.
- The measured result: script output only.
- Challenges: G-gate results, honestly.
- Accomplishments.
- What we learned.
- What's next.
- Links: APK (GitHub Releases), web, `/audit`, repo, video.

---

## 12) Build plan (about 24 h)

**Two clocks:** ET = IST − 10:30. DST ended 1 Nov, so ET is UTC−5.

**Timezone:** **ASSUMPTION: Aman is in India.** If he is in ET, shift the human sleep block to 02:00–06:30 ET and record 06:45–08:30 ET.

**Toolchain (H0):**
- `JAVA_HOME=/home/aman/jdks/jdk17`.
- `sdkmanager "platforms;android-3x" "build-tools;3x.0.0"`, using the compileSdk Expo SDK 58 needs (look this up first).
- `npx expo prebuild` → `./gradlew assembleRelease`, signed with our keystore.
- Install through **Windows `adb.exe`** (WSL2 has no USB; `usbipd-win` is the alternative).
- Dev loop: dev client + `expo start --tunnel`.
- **EAS** (Free tier, low priority) builds in parallel as a backup.
- **EAS Update / expo-updates** ships JS fixes after the RC without a native rebuild.
- Native modules frozen in the first build: expo-share-intent 9.0.0 (fallback: a plain `ACTION_SEND` intent-filter config plugin), expo-camera, expo-image, expo-secure-store, expo-file-system, expo-haptics, expo-updates. No translucent-activity plugin.

**Work streams and owners:**

| Stream | Owner | Scope |
|---|---|---|
| H | **Aman (human)** | Phone + spikes S1/S2; YouCam/Anthropic keys into Worker secrets; G-gate scans (his face, consented); Flipkart frame screenshots; ticking verification packets; demo SKU pick; hallway tests; recording; Devpost submit |
| A1 App core | Claude agent | Expo monorepo, share intent, parser, SKU confirm, verdict sheet, better matches, Home, sample share, Demo Key |
| A2 Scan + try-on | Claude agent | Capture guide, upload, HD flow, overlay in memory, Key card, try-on, delete state machine on the phone, cache-check E2E |
| A3 Worker | Claude agent | YouCam proxy, limiter, ledger, caps, mock YouCam from fixtures, Claude endpoints X3/X4, `/v1/label-check` |
| A4 Rules + audit | Claude agent | `rules/` package, cited rules, bands, CI suites, linter, `npm run audit`, summary.json |
| A5 Catalogue | Claude agent (+ batches) | X1/X2/X5 on frame products and the general catalogue, swatch sampling, verification packets, eval set X6 |
| A6 Web + docs | Claude agent | Landing, `/check`, `/audit`, `/rules`, `/how`, `/r/<token>`, README, Devpost draft, comparison table, competitor re-pull |
| A7 Design/QA | Claude agent | Clay & Ink tokens, the 5 must-be-stunning screens, a11y, linter sweeps, screenshot review list for the human |

**Timeline:**

| H | ET | IST | Milestones |
|---|---|---|---|
| H0–H0.5 | 11:30–12:00 | 22:00–22:30 | Aman: S1 (share → copy → paste), S2, start sdkmanager. Agents: monorepo, Worker skeleton, mock server, rules skeleton, first native build started (local and EAS). |
| H0.5–H2 | 12:00–13:30 | 22:30–00:00 | Aman: G0, G1 (×3 for repeatability), G2, G3, G5, G6, G7 via a Worker curl script that A3 prepares. Raw JSON saved to `spikes/`. Fixtures committed and the mock goes live. |
| **H2 Gate A** | 13:30 | 00:00 | Share payload, HD JSON shape and score direction, VTO visibility, delete behaviour recorded. Copy set A or B chosen. Try-on Plan A or B chosen. |
| H2–H4 | 13:30–15:30 | 00:00–02:00 | Aman: Flipkart frame screenshots (~45 min) → tag `frame-frozen`; first 10 verification ticks; pick SKU-1 and SKU-2. Agents: catalogue batches running, verdict sheet on a cached Key, scan screen. |
| H4–H10 | 15:30–21:30 | 02:00–08:00 | **Aman sleeps.** Agents only, against mocks: full Tier 1 UI, Claude X3/X4, rules + CI green, verification packets for all frame rows, web skeleton, README draft. `rules-frozen` tag at H8 (rules tuned on non-frame rows only). |
| H10–H13 | 21:30–00:30 | 08:00–11:00 | Aman: device test on the new build, tick verification packets (ASSUMPTION ~1–2 min/row), real scan and try-on on device. |
| **H13 Gate B** | 00:30 | 11:00 | **One real unbroken take** (Flipkart share → SKU confirm → verdict → better matches) recorded as insurance. If missed: cut Tier 2 items in the order below. |
| H13–H15.5 | 00:30–03:00 | 11:00–13:30 | Tier 2 lands. Hallway tests: ≥3 non-team people (in person or video call). Counts: "found SkinKey in the share sheet without help: x of n", "chose differently after the verdict: y of n", reported as anecdotes. `rows-frozen` → `npm run audit` → `audit-run`. |
| **H15.5 Freeze** | 03:00 | 13:30 | Feature, catalogue and copy freeze. RC APK built locally. Linter sweep. Fixes after this point go out only as EAS Update. |
| H16–H19 | 03:30–06:30 | 14:00–17:00 | **Daylight recording** (sunset in north India is about 17:30 IST, ASSUMPTION per city). Agent traffic paused on the key. Full backup take. |
| H19–H21.5 | 06:30–09:00 | 17:00–19:30 | Edit video (agent assembles, human approves), final APK on GitHub Releases, README/Devpost final, competitor re-grep at 07:00 ET, unit reserve check. |
| **H21.5 Submit** | **09:00** | **19:30** | Devpost submitted |
| H21.5–H24.25 | 09:00–11:45 | 19:30–22:15 | Buffer: re-upload only. Social cuts (+500 units each, max 2, evidence.md) are posted after submission for the judging reserve. |

**Tiers:**
- **Tier 1, never cut. Must be perfect at Gate B:**
  - Share → SKU confirm → verdict → better matches (Flipkart take).
  - HD scan with capture guide, overlay and delete.
  - ≥25 verified frame rows plus SKU-1 and SKU-2.
  - Designed UNKNOWN with label-photo chips.
  - Try-on (Plan A or B).
  - "How this was made".
  - Signed APK.
- **Tier 2, agents overnight:**
  - `/audit` + `npm run audit`.
  - `/rules`, `/how`.
  - Trimmed CI.
  - Web `/check` + landing.
  - `/v1/label-check`.
  - README / comparison table.
  - Claude eval counts.
- **Tier 3, only if Gate B is on time:**
  - Amazon.in take.
  - `/audit` CSV upload.
  - UV line.
  - JS Camera Kit on `/check`.
  - Advanced Skin Report comparison spike.

**Cut order if behind:** Tier 3 → Claude eval counts → `/v1/label-check` (curl text only) → web `/check` (keep landing) → `/how` (fold into README) → try-on falls back to single-shade lip render (1 unit, no tone call). Tier 1 is never cut.

**Unit budget** (read the balance at H0 via `GET /s2s/v1.0/client/credit`; every figure below is a planning **ASSUMPTION**):

| Use | Units |
|---|---|
| Spikes | ≈90 |
| On-device development (mocks elsewhere): ~8 scans (128) + ~12 try-ons (≈150) | ≈280 |
| Recording: 3 scans (48) + 6 try-ons (≈130) | ≈180 |
| **Judge reserve**, held until winners are announced (~2026-11-24, evidence.md) | **≥600** |

- If the balance is below about 1,200, the judge path defaults to the Demo Key plus single-shade try-ons.
- A ledger alert fires at 25% remaining.

---

## 13) Predicted scores after fixes (honest uncertainty)

Baseline: v1 scored 28/40 (#2 of 13). The four red-team panels scored v2 *before* these fixes at about tech 7.5–7.75, design 6.5–7.25, impact 6.5–7, idea 7–7.5.

| Criterion | Predicted (after fixes) | Range | What moves it | What sinks it |
|---|---|---|---|---|
| Technological implementation (incl. YouCam depth) | 8.0 | 7.0–8.75 | 3 YouCam features chained across onboarding and the share moment; correct v2.1 HD usage (`raw_score`, `format:json`, mask overlay); verified delete state machine with confirmation counts; unit ledger; mock server; CI boundary tests; shipped APK | G1 returns no zone labels (zone story weakens); try-on render barely visible; build pipeline failure |
| Design | 7.5 | 6.5–8.25 | Reason-first verdict sheet, overlay → glyph, two-shade same-photo try-on, designed UNKNOWN, honest copy | Hero still janky at Gate B; capture failures on the demo phone; too many surfaces dilute the polish |
| Potential impact | 7.0 | 6.0–7.75 | Pre-registered frame from Flipkart's own filter; reproducible counts; one credible B2B buyer story; hallway counts | Small `a`; counts near 0; no shopper-outcome data beyond anecdotes; no pricing or customer |
| Quality of idea | 7.5 | 6.75–8.25 | Leads with the two distinct mechanics (share-in, label/tag check against the reading); try-on tied to the listing's own shade claim | Overlap with before-you-buy / ShelfSense if judges skim; a near-duplicate submission lands before the deadline |
| **Total** | **30 / 40** | **26.5–33** | | |

These are self-predictions from simulated judges, not data. Real judges are unknown, so no placing is predicted. The biggest single swing factor is whether the Gate B unbroken take and the audit counts are both real by the freeze.

**Residual risks (not fixable in 24 h, or fixable only partly):**
- **R1. G1 shape.** If `hd_skin_type` gives no zone label, zone reasons rest on whole-face bands plus pore sub-regions only. Copy set B is pre-written; the story is weaker.
- **R2. Skincare checks reuse stored readings.** Most shares make no new YouCam call. This is a deliberate privacy trade-off, said openly; a Perfect Corp judge may still mark it down.
- **R3. Small or empty headline.** a may be small and x/c may be near 0. The method is fixed and we publish whatever comes out.
- **R4. Rule circularity.** The heatmap counts where our rules fire. It is disclosed, graded R/L/T and counter-cited, and still open to challenge.
- **R5. Brand-claim disputes.** Even strict LC rules can be contested, e.g. an "oil-free" definition. Mitigations: human review, screenshot, brand reply link, names blurred in the video. Not legal advice.
- **R6. Shade colour noise.** Swatch hexes from marketing images are colour-unmanaged. The two-shade render is a preview, not a match.
- **R7. Platform drift.** Flipkart facet URLs and the share payload are undocumented and could change during judging. Mitigations: browser fallback and the sample-share replay.
- **R8. Human bottleneck.** One person does verification, device work and recording. If ticking takes longer than ~2 min/row (ASSUMPTION), `a` shrinks to a "pilot".
- **R9. Units and Worker uptime through judging.** Caps and a reserve are in place, but a burst of judges or a Cloudflare/YouCam outage would break the live path. The Demo Key and sample share still work offline from the scan.
- **R10. DPDP specifics.** Indian rules on consent notices, minors and cross-border transfer were not legally reviewed. We follow the conservative pattern only.
- **R11. Originality snapshot.** The 356-repo scan reads descriptions, not READMEs, and five repos were dated 2026-11-01. A close competitor could appear before 11:45 ET.
- **R12. Timezone assumption.** If the team isn't in IST, the daylight and sleep blocks must be shifted at H0.
