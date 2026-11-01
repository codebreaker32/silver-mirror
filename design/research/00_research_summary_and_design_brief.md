# SkinKey: Research Summary and Design Brief

*Prepared 2026-11-01. It sums up files 01–04 in this folder for the design and build team. Submission deadline: 2026-11-02, 11:45 AM ET (evidence.md).*
*Sources: `/home/aman/youcam/research/evidence.md` (**E**), `/home/aman/youcam/research/skinkey_report.md` (**R**), and the four research files in this folder: 01 personas/JTBD, 02 journey map, 03 assumptions map, 04 interview and test kit. Every number below names its source. Anything without a source is **ASSUMPTION (to validate)** or is labelled as a team design choice.*

> **Everything in this brief is a hypothesis until the interviews run.** We have not spoken to one Indian skincare shopper yet. The personas, journey feelings, "thinks" lines and design principles are team guesses based on desk evidence that is **not India-specific**: it comes from vendor surveys, one Hong Kong survey and US legal sources. After 3–5 sessions we will have direction, not proof. Report session results as counts ("3 of 5"), never as percentages or as "Indian shoppers…".

---

## 1. Research summary (one paragraph)

Desk evidence suggests many shoppers are unsure about their own skin and about ingredients. In vendor surveys, 70% didn't know their skin type and 80% didn't know ingredients (CeraVe/OnePoll 2021), 63% were wrong about their skin type (Labskin 2022), and 49% had skincare unopened for more than a year (HK Consumer Council 2021, Hong Kong). None of these surveys is from India, and our files don't state the market for most of them. The two big Indian stores already offer skin tools: Flipkart has a ModiFace selfie Skin Analyser (since about Dec 2023) and Amazon.in has a quiz-based SkinCare Analyzer. Each one works only inside its own store and catalogue, and whether either is still live in 2026 is UNVERIFIED (R). That leaves SkinKey's proposed wedge as "one measured profile on your phone that checks *this* product from *any* store app". Five things could make or break it, and our files have no user evidence on any of them:
- whether shoppers think to tap **Share** in a store app (03: U1, risk 25 of 25);
- whether the shared text even contains a product title (03: F1, 25 of 25);
- whether a cross-store profile beats the store's own tool (03: D3, 25 of 25);
- whether people want a verdict about one product at all (03: D1);
- whether they will hand a selfie to a third-party AI (03: D2).

Three technical facts shape the experience regardless of what users say:
- **UNKNOWN will be common.** The catalogue is 12–15 products (R §4–5), Open Beauty Facts has only 348 India-tagged products with complete ingredients (team query, R §2), and the store APIs have no ingredients field (R §1).
- **Privacy can be shown, not just claimed.** YouCam's `task/delete` removes a finished task's input and output files (VERIFIED, R §2). Results otherwise stay for 24h (E).
- **Accuracy limits have to be visible.** Only 2.1% of open skin-lesion images record Fitzpatrick type (Wen et al. 2022), and dermatology AI is limited on dark skin (Daneshjou 2022). Both are dermatology studies, so applying them to YouCam's cosmetic analysis is an extrapolation (02: E8).

The proto-personas in 01 (Starter, Careful One, Overloaded One) and the listening codes in 04 (Influencer-led trier, Deal-led repeat buyer, Scan-sceptic, Grooming-first buyer) are **hypotheses, not research findings**. This brief adopts them only as working lenses until the sessions report back.

**Note on the four files.** They use different IDs for the same tests (01: A1–A12; 02: B/T rows; 03: F/U/D/Eth/P/V; 04: H1–H9) and slightly different hint timings. **Recommendation (team choice):** use **04** as the single on-phone script and map its results back to the other IDs with the crosswalk in section 6. One persona row in 03 (PP-C) pairs a deeper skin tone with a tight budget. 01 dropped that kind of pairing as a stereotype. This brief follows 01: any persona can be any gender, skin tone, budget or city.

---

## 2. Top 6 design principles

Each principle traces to personas (01), journey stages and moments of truth (02), and assumptions (03/04). Every principle is **ASSUMPTION (to validate)** until the sessions run.

### P1. Reasons before verdicts
**What it means:** the reason, tied to the user's own reading, is the first thing they read. The FITS / CAUTION / UNKNOWN label frames the reason; it does not replace it. Reason template: **"Your [reading] reading: [band] (scan [date])"**, then the product fact, e.g. "Contains fragrance (parfum)".
- **Why:** E's guardrail says "show confidence/limits, avoid verdict-like scores", and that conflicts directly with a verdict label (02 F3; 03 §0 "known tension"). Desk context: 80% don't know ingredients (CeraVe/OnePoll 2021, vendor), so an ingredient name alone may mean little.
- **Traces to:** J0 "check this product" (01); Persona 1 "this one, for my face, yes or no" and Persona 2 "what's in it and why you're flagging it" (both illustrative, made up); MoT 2 first verdict and MoT 3 CAUTION (02); A3 / T3 / CQ2 / U2 / D6 (01–04).
- **Judging context (not user evidence):** the Round 1 winner Aloud made "every spoken claim traceable to ui_score" (E).

### P2. Privacy you can see
**What it means:**
- Show what is kept *before* the camera opens.
- Show the YouCam deletion happening as a step in processing.
- Keep "What we keep" and Delete one tap away at all times.
- Give every new sharing act its own consent screen with a preview: the pharmacist QR, and a second photo for the tint preview.
- **Exact approved line (R):** "SkinKey stores no photo; YouCam processes it and we delete it from YouCam right after."
- **Why:** these are BIPA-derived design defaults: explicit consent, prompt deletion, no identity link, a published retention policy, no sale or sharing (E; US law, used as a benchmark). `task/delete` is VERIFIED only for *finished* tasks. Whether it works on failed or abandoned tasks is UNVERIFIED (02 MoT 1).
- **Traces to:** Persona 2 "cautious" and Scan-sceptic (01, 04); F1 / MoT 1 (02); D2, Eth1 (03); A4 / T1 / H4 (01, 02, 04).

### P3. Honest UNKNOWN
**What it means:**
- UNKNOWN and "based on product name only" are designed states, not error screens.
- UNKNOWN says "This doesn't mean it's bad" and always offers a next step: check the pack, or Find better matches.
- Show the real catalogue count. Never fake confidence from a title.
- **Why:** UNKNOWN is probably the most common real result. Sources: the 12–15-product catalogue (R §4–5), 348 OBF India products (R §2), no store ingredient APIs (R §1), and our internal review panel's prediction (R §3, opinion only).
- **Traces to:** Persona 2 trusts "a tool that admits uncertainty" (01, assumption); MoT 4 (02); F3 (03); A5 / T5 / CQ4 / H7 (01, 02, 04).

### P4. Fit, not safety: cosmetic, never medical
**What it means:**
- CAUTION means "may not suit *this profile*". It never means dangerous, allergic or harmful.
- Use appearance words only ("looks oily", never "treats acne").
- The medicine gate shows exactly one line: "This looks like a medicine. Ask the pharmacist."
- AI scores never trigger referral. Only the fixed checklist the user ticks does.
- **Why:** under FDA intended-use rules, a "treat acne" claim makes a product a drug (E; US rule, used as a cautious default). The gate list (adapalene, tretinoin, benzoyl peroxide, clindamycin, hydroquinone, ketoconazole, steroids) comes from R §2.
- **Traces to:** anti-personas 1–2 (01); MoT 3 and MoT 5 (02); Eth2 and U2 (03); bonus medicine card / CQ5 (04); A12, the risk that the gate fires on everyday benzoyl peroxide or ketoconazole products (01, ASSUMPTION).

### P5. Bands with humility, same respect for every face
**What it means:**
- Show score bands only: no raw numbers, no skin age, no before/after.
- Next to the bands, add a visible **Accuracy note**: "Skin AI can be less accurate on deeper skin tones and in poor light."
- Label a derived skin type as "estimated from oiliness + moisture", never "measured".
- **Do not call it a "fairness note".** 02 flags that "fairness" strongly suggests skin-lightening in India (ASSUMPTION, cultural).
- **Why:** the bands-not-numbers and accuracy-note guardrails come from R §2. The bias risk is extrapolated from Wen et al. 2022 and Daneshjou 2022 (E). YouCam's `skin_type` output values are undocumented (R). The ICC>0.90 accuracy figure is vendor-reported with no n (E), so don't lean on it.
- **Traces to:** anti-persona 3, "wants a precise number" (01); F1 and the accuracy-note moment (02); Eth3 and U3 (03); T8 (02); K3 (04). The kit rule is that any lightening or colourist reading, even once, means rewording immediately (02 §1.6).

### P6. Meet them in the store app, and say exactly where every link goes
**What it means:**
- The main entry is **Share → SkinKey** from the Flipkart (or Amazon) app.
- If sessions show people don't find Share, **Paste a link** gets equal weight.
- Every link-out names its destination and filter: "Flipkart search, filtered to Oily Skin", or "Amazon keyword search".
- Never say "deep-links into Flipkart" (R §1).
- **Why:** the Android share target is VERIFIED. The share payload and share-menu use are UNVERIFIED (R §1A). The Flipkart filter URL is VERIFIED on the web only. Whether the app keeps the filter is UNVERIFIED (R §1B, gate G3). Amazon and Nykaa get keywords only (R §1B).
- **Traces to:** J0, J2 (01); C2, F2, F4 (02); F1, U1, D3, D5, F2 (03); A2 / T2 / T6 / H5 / H6 (01, 02, 04). Personas 1 and 3: Persona 3 "takes screenshots to decide later" (01, assumption), which is why screenshot behaviour is recorded as a valid answer.

*Gender-neutral framing is not a separate principle. It is a brand rule (section 3) and a copy rule (section 4), tested by P1 in 03 and the Grooming-first code in 04.*

---

## 3. Emotional and brand qualities

**Design direction (team choice, ASSUMPTION to validate): "a calm, knowledgeable friend who shows their working."** It should feel premium enough for someone who already pays for serums, without feeling like a luxury club or a clinic.

| Quality | Looks like | Avoid | Traces to |
|---|---|---|---|
| **Calm** | Generous whitespace, one decision per screen, soft motion, no countdown pressure except the pharmacist QR expiry | Flashing badges, sale-style urgency, red alarm states | C4 "doubt" low point (02, team-guess curve) |
| **Trustworthy and transparent** | A provenance block on every verdict ("Where this comes from"), dates on readings, visible deletion step | Hidden fine print, pre-ticked boxes, "AI magic" sparkle | P2, P3; Persona 2 (01) |
| **Premium, not exclusive** | Restrained palette, confident typography, quality iconography, tactile cards | Gold or rose-gold luxury cues, influencer glam | Segment already buys on Amazon/Flipkart/Nykaa (brief; ASSUMPTION) |
| **Gender-neutral** | Neutral palette, product examples that include face wash, sunscreen and shaving/beard-area care, no gendered pronouns or models | Pink/peach/lilac-coded beauty UI; "for him" dark-and-blue clichés | P1 (03), Grooming-first code GB (04), 01 §3.2 de-stereotyping |
| **Warm, not clinical** | Warm neutrals (stone, sand, clay) with one deep ink or teal accent; human but non-face illustration | Hospital white-and-blue, lab coats, molecule wallpaper, microscope imagery | P4: cosmetic, not medical |
| **Respectful of every skin tone** | No skin-colour swatches on the profile; any illustrated faces or hands show a range of tones; no "glow-up" or before/after imagery | "Brightening", "fair", "glow" hero imagery; light-skin-only stock photos | P5; 01 §3.2 inclusion notes; T8 (02) |

**Verdict colour rules (team design proposal, ASSUMPTION; test whether people read CAUTION as danger, 02 T4):**
- **FITS:** muted green or teal.
- **CAUTION:** amber or ochre, **never red**.
- **UNKNOWN:** neutral slate, **not** an error colour.
- **Medicine gate:** its own neutral ink style with a pharmacist icon. It is not an alarm and not a verdict colour.
- Every state also has a text label and an icon, so colour is never the only signal (02 §1.1 "Labels check").

**Three mood references** (for mood only; don't copy layouts, logos or assets; a team choice, not research):
1. **Muji (retail and product design):** unbranded calm, honest materials, naturally gender-neutral. Use it for palette and restraint.
2. **Aesop (retail and print design):** warm, typographic, unhurried, premium without glamour. Use it for type hierarchy and tone. *Caveat: Aesop is itself a skincare brand. Borrow the feel only, and never include it in demo products or verdict examples.*
3. **Signal (privacy-first messaging app):** plain-spoken trust, no dark patterns, privacy explained in one sentence. Use it for the consent screens, "What we keep" and the pharmacist share.

System base: Android-first Material 3 components, so Share, back and permission flows feel native (team choice).

---

## 4. Content and tone guide

### 4.1 Voice
- **Plain, specific, short.** Use English a non-native speaker can scan quickly (UI is English-only; 03 P2 tests this). One idea per sentence.
- **Second person about readings, never about the person.** Write "Your oiliness reading: high". Never write "You have oily skin" or "Your skin is…" (02 §1.4 never-say list).
- **Show the working.** Every claim names its source: reading + scan date, product data source, weather source.
- **Admit limits without apologising.** "We don't have this product's ingredient list, so this is a weaker check."
- **Gender-neutral words:** "face", "skin", "products". Include grooming words (face wash, shaving, beard area) in examples. 04's Grooming-first code assumes some shoppers don't call it "skincare" (ASSUMPTION).

### 4.2 Cosmetic language rules
1. Describe **appearance**, not conditions: "looks oily", "visible redness", "uneven-looking texture". Never "treats", "cures", "heals", "fixes", "prevents acne" (E: FDA intended-use).
2. YouCam's concern names (`acne`, `redness`, etc.) appear as **readings**, not diagnoses. Open team decision: whether the "Acne" band is shown as "Acne reading" or "Visible blemishes reading" (ASSUMPTION; test with P2 terms).
3. **Bands only:** LOW / MEDIUM / HIGH. No raw scores, no `skin_age`, no "skin score out of 100" (R §2; anti-persona 3 in 01).
4. Ingredients are **flagged, not predicted**. SkinKey never says a product will or won't sting, irritate or cause a reaction (01 Persona 2).
5. AI scores never produce "see a dermatologist". Only `/referral` (the fixed checklist) does. No mole-change wording anywhere (R §2).
6. Tinted preview: always "Preview, not a shade guarantee". Never claim it shows white cast (01 J4: unsupported).
7. Never claim SkinKey reduces returns or waste. E lists that as NOT supported (only stated intent).

### 4.3 Verdict and fixed-string wording

| State | Label | Subtitle (always shown) | Body pattern |
|---|---|---|---|
| FITS | **FITS** | "Matches your scan on the ingredients we know about. Not a guarantee." (04 §3.6) | 1–3 reasons: reading → product fact |
| CAUTION | **CAUTION** | "May not suit your readings. This is not a safety warning." (proposed, ASSUMPTION) | Reason first: "Contains fragrance (parfum). Your redness reading: MEDIUM (scan 1 Nov)" |
| Name only | **[FITS/CAUTION] · based on product name only** | "We don't have this product's ingredient list, so this is a weaker check." (04 §3.4) | Name keyword → reading; "Check the full ingredient list on the product page or pack." |
| UNKNOWN | **UNKNOWN** | "This product isn't in our catalogue ([n] products) and its name alone isn't enough. This doesn't mean it's bad." (04 §3.5) | Next steps: check the pack · Find products matched to your skin type |
| Medicine gate | *(no verdict label)* | **"This looks like a medicine. Ask the pharmacist."** (R §2, exact) | Nothing else: no reasons, no better matches |

- **Fallback labels if sessions fail (02 §1.6, 04 §4.3):** UNKNOWN becomes **"NOT ENOUGH INFO"** if 2 or more read it as bad. If CAUTION is read as danger, rename it. The alternative label is an ASSUMPTION; test it in the next session.
- **Fixed strings, used exactly (R §2 unless noted):**
  - "Cosmetic guidance, not medical advice."
  - "Not affiliated with Flipkart, Amazon or Nykaa."
  - "Measured by YouCam Skin Analysis, [date]"
  - Accuracy note: "Skin AI can be less accurate on deeper skin tones and in poor light."
  - "SkinKey stores no photo; YouCam processes it and we delete it from YouCam right after."
  - Link-out: "Opens a Flipkart search, filtered to [Oily Skin]"
  - Credits: "Weather: Open-Meteo (CC BY 4.0)" and "Open Beauty Facts (ODbL)"
- **Optional honesty qualifier for consent (02 MoT 1, ASSUMPTION; test with T1):** "…we ask YouCam to delete it as soon as your results arrive. If something goes wrong, YouCam's own limit is 24 hours."

### 4.4 Banned words and claims

| Never write | Why | Write instead |
|---|---|---|
| safe, unsafe, dangerous, harmful, toxic, allergic, allergy | Reads as a safety or medical rating (P4; 02 never-say) | "may not suit your readings" |
| treat, cure, heal, fix, repair, prevent, anti-acne, clinical, diagnose, condition | Drug-claim risk (E: FDA) | "looks", "appearance", "visible" |
| fair, fairness, whitening, lightening, brightening (as a SkinKey claim) | Colourist reading risk (02 T8). How SkinKey handles products using these claims is an open team decision (01 §3.2) | "Accuracy note"; describe readings only |
| "your skin is…", "you have…" | Diagnosis tone | "Your [x] reading: [band]" |
| guaranteed, perfect match, no white cast, precise, accurate, dermatologist-approved | Unsupported (01 never-say; E: ICC vendor-only) | "preview", "estimate", "not a guarantee" |
| "nothing ever leaves your phone" | Untrue: the photo goes to YouCam (01 §1.5) | the approved privacy line |
| "we don't make any money" | Untrue or unknown (01 §1.5) | the disclosure on our web page |
| "deep-links into Flipkart", "inside Flipkart" | Untrue (R §1) | "opens a Flipkart search" |
| "checks the exact product, every time" | Small catalogue (R §4) | show the catalogue count |
| "skin age", numeric scores, "flawless", "glow-up" | Anti-persona 3; P5 | bands only |
| Store logos; Amazon ratings or reviews | Not allowed (R §1, rule 28) | text-only store names |

---

## 5. Screen-by-screen UX requirements (10 Expo screens)

Common to every screen (team choice; the standards are external, not from our evidence files):
- Meet WCAG 2.1 AA colour contrast and Android minimum touch-target guidance.
- Layouts reflow at the largest system font size without truncating verdict labels (02 §1.1).
- Every control has a TalkBack label.
- Colour is never the only signal.
- Honour reduce-motion.
- Context for why this matters: WebAIM 2025 found 94.8% of the top 1M home pages fail WCAG, with shopping pages worst at 71.2 errors on average (E). That is not India data or app data.

Gate references (G1–G6) are from 01 §1.1.

### 5.1 `/onboarding/consent`
- **Key element:** one screen with the approved privacy sentence in large type, then "We keep on this phone only: skin type, 7 score bands (oiliness, moisture, redness, acne, pores, texture, radiance) and the scan date" (04 §3.2), the Accuracy note, and **Start scan** / **Not now** at equal visual weight. "What we keep" is shown *before* the camera opens (02 MoT 1).
- **Key states:**
  - **Default.**
  - **Not now:** go to home in no-profile mode. Checks show "based on product name only" or UNKNOWN. A self-reported "pick your skin type" start, labelled "self-reported, not measured", is **only added if D2/H4 fails** (03 LoF #5; 04 §4.3).
  - **Offline:** "You need a connection to scan". The scan is disabled, not hidden.
  - **18+ confirmation:** minors are an anti-persona (01). Indian rules are unchecked (ASSUMPTION).
- **Accessibility:** no pre-ticked boxes; a link to the full retention policy on `/about`; TalkBack reads the privacy sentence as one block; works at the largest font size without hiding Not now.
- **Traces to:** P2, P5; T1, Eth1, D2, H4.

### 5.2 `/onboarding/capture`
- **Key element:** camera with a **static oval guide** (live face detection isn't available; expo-face-detector stops at SDK 51, R §4) and three plain tips: face fills the oval (YouCam needs the face at more than 60% of frame width, E), look straight ahead, even light.
- **Key states:**
  - **Camera permission denied:** explain why, with a button to Settings.
  - **Poor capture:** YouCam error codes mapped to hints ("Move closer", "More light") (R §4).
  - **Retake.**
  - The image is resized to at most 4096 px on the long side before upload (R §2).
- **Accessibility:** a large shutter button and a volume-key shutter; TalkBack announces the tips; no flash requirement.
- **Copy rule:** never tell users to remove religious or cultural items (hijab, turban, bindi) or glasses, beards or makeup. Scan behaviour with these is UNVERIFIED (01 §3.2). Record whether participants raise it (01 A4).
- **Traces to:** P2, P5; Eth3.

### 5.3 `/onboarding/processing`
- **Key element:** an honest step list, not a bare spinner: **Uploading → Analysing → Deleting photo from YouCam ✓ → Done**. The deletion step is visible proof of P2.
- **Key states:**
  - **Loading:** processing time is not in our files (ASSUMPTION).
  - **Timeout or failure:** retry once, then offer "Try later". The proxy calls `task/delete` on success, failure and timeout (02 MoT 1). Delete on failed tasks is UNVERIFIED, so show the 24h qualifier only if a delete fails.
  - **Offline mid-scan.**
  - **Cached demo profile** for the video and sessions (R §5).
  - **Optional (ASSUMPTION):** show YouCam's mask overlay once, before deletion, never saved. The red team wants the live scan visible in the demo (R §4).
- **Accessibility:** each step change announced through an accessibility live region; a reduce-motion fallback (static ticks); no colour-only progress.
- **Traces to:** P2; Eth1.

### 5.4 `/profile`
- **Key element:**
  - 7 bands as **text labels** (LOW / MEDIUM / HIGH), optionally with a simple bar.
  - Skin type labelled "estimated from oiliness + moisture" if derived (02 F1; R §2).
  - "Measured by YouCam Skin Analysis, [date] · photo deleted · score bands only".
  - The Accuracy note.
  - **What we keep** and **Delete**.
- **Key states:**
  - **Empty** (never scanned, or deleted): "No profile yet", with Start scan and an explanation of what checks can still do.
  - **Delete confirmation:** after deleting, show the empty state. The reset check is used in the kit (03 §4.4).
  - **Stale scan:** shows the date. A re-scan prompt is ASSUMPTION; no evidence on how often to re-scan.
  - **If U3 fails:** add a one-line explainer per band ("high compared to what?", 03 U3).
- **Accessibility:** no skin-colour swatch; bands readable as text by TalkBack in a logical order; Delete is a clearly labelled button, with no gesture-only path.
- **Traces to:** P2, P5; U3, T8, K3.

### 5.5 `/check` (main screen)
- **Key element:**
  - An editable **"Is this the product?"** title field at the top (R §1A).
  - The verdict label + subtitle.
  - **1–3 reasons, reading first** (P1).
  - The **Where this comes from** block: skin source + date; product source (catalogue with source link / product name only / Open Beauty Facts); weather source only if a UV reason is shown.
  - The cosmetic-guidance and not-affiliated lines.
  - **Back to product** and **Find better matches**, labelled with the destination and filter (P6).
- **Key states:**
  - **Loading:** parsing the share.
  - **Link only, no title:** focus the editable field (R §1A fallback).
  - **No profile:** name-only checks, plus a "Scan for reasons based on your readings" prompt.
  - **FITS, CAUTION, name only, UNKNOWN:** wording in 4.3.
  - **Medicine gate:** only the fixed line plus Back to product. No reasons, no better matches (04 §3.6).
  - **UV reason:** only when the live Open-Meteo rule fires. Never hard-coded (R §2).
  - **Tinted preview (proposed F3b, gate G5):** an entry point only on tinted products. It needs a **second photo with its own consent screen**, is labelled "Preview, not a shade guarantee", and the output image is deleted via `task/delete` (02 F3b).
  - **Offline:** catalogue verdicts still work; link-outs say they need a connection.
- **Accessibility:** TalkBack order is label → subtitle → reasons → source → actions; label + icon + colour for each verdict; the two buttons stack vertically at large font; reason text is never truncated.
- **Traces to:** P1, P3, P4, P6; A3, A5, T3–T6, U2, CQ1–CQ5, Eth2.

### 5.6 `/scan` (Aisle Check)
- **Key element:** a barcode viewfinder with a **manual barcode entry** fallback. Results open the same `/check` card.
- **Key states:**
  - **Camera permission denied:** manual entry.
  - **Catalogue hit:** `/check`.
  - **Open Beauty Facts hit:** source labelled "Open Beauty Facts (ODbL)". Coverage is thin (348 India products, R §2), and the data must not be used for medical purposes (R §2).
  - **Not found:** UNKNOWN.
  - **Offline:** the OBF lookup needs internet (02 F7).
  - **Medicine gate:** critical here, because medicines sit next to cosmetics (R §4).
  - The OBF lookup is 3rd on the cut list (R §5). If it's cut, the screen is catalogue-only.
- **Accessibility:** torch toggle; haptic and announcement on detection; manual entry reachable without the camera.
- **Traces to:** P3, P4; J6. **Not tested in today's sessions.**

### 5.7 `/referral`
- **Key element:** a **fixed symptom checklist the user ticks**. It is never opened or pre-filled from AI scores (R §2). The outcome is "Please see a doctor or pharmacist". No mole-change wording.
- **Key states:**
  - **Nothing ticked:** neutral text.
  - **Item ticked:** referral message.
  - **Scores never appear on this screen.**
  - The checklist content itself is not in our files. The team must write it and keep it short (ASSUMPTION).
- **Accessibility:** native accessible checkboxes; plain words; no icons that look like alerts.
- **Traces to:** P4; anti-persona 1. **Not tested today.**

### 5.8 `/share-pharmacist`
- **Key element:** a **separate consent preview** showing exactly what the pharmacist will see (bands only; no photo, no skin colour). Then a QR code, a **30-minute countdown**, and **Revoke** (R §2).
- **Key states:**
  - **Creating.**
  - **Active:** with timer.
  - **Expired.**
  - **Revoked:** don't promise "instant". Cloudflare KV can show a revoked profile for up to about 60 seconds unless D1 or a Durable Object is used (R §4).
  - **Offline or error:** the QR page needs internet.
  - 4th on the cut list (R §5).
- **Accessibility:** a high-contrast QR with a brightness boost; the countdown announced at intervals, not every second; Revoke is a large, clearly labelled button; a text link alternative to the QR (ASSUMPTION).
- **Traces to:** P2; J6. **Not tested today.**

### 5.9 `/` (home)
- **Key element:**
  - **Check a product.** First run shows a one-time share tip: "In Flipkart, tap Share → SkinKey".
  - **Paste a link,** promoted to equal weight if U1 / T2 / H5 fails (02 §1.6; 03 §5).
  - **Scan in store.**
  - Profile chip (scan date).
  - **Skin Forecast card:** live Open-Meteo UV/humidity, with the CC BY 4.0 credit (R §2).
- **Key states:**
  - **First run, no profile:** consent CTA.
  - **No location permission:** forecast card hidden or "Add location".
  - **Offline:** forecast card hidden.
  - **Forecast cut:** 5th on the cut list (R §5), and also cut if A9 fails (01).
  - **Licence flag:** Open-Meteo's free tier is non-commercial only, which may conflict with affiliate tags (01 Part 2; 02 E19). Decide before submission.
- **Accessibility:** primary actions as full-width buttons; the forecast card readable as one sentence ("UV high today in [city]"); no auto-rotating content.
- **Traces to:** P6; A2, A9, U1.

### 5.10 `/about`
- **Key element:**
  - Plain-language **retention policy** and "We never sell or share your scan" (E: BIPA-derived).
  - Credits: YouCam, Open-Meteo (CC BY 4.0), Open Beauty Facts (ODbL).
  - "Not affiliated with Flipkart, Amazon or Nykaa".
  - The catalogue count.
  - The Accuracy note.
  - **What SkinKey can and can't do** (R §5 README idea).
  - An affiliate disclosure covering our web fallback page only. There are no affiliate links in the app without Amazon approval (R §1).
- **Key states:** static; a version and date line; links open in a Chrome Custom Tab, never a WebView (R §1B).
- **Accessibility:** a real heading structure for TalkBack navigation; no text inside images.
- **Traces to:** P2, P5; V1, A11, H9.

---

## 6. What the interviews must answer before we freeze designs

**Freeze rule (team choice):**
- Visual and copy designs for `/check`, the consent screens, `/profile` and `/` home stay **draft** until the 15-minute debrief.
- "Most" = 2 of 3, 3 of 4 or 3 of 5 sessions (01, 03).
- For guardrail misreads (CAUTION as danger, FITS as a guarantee, the medicine card as a diagnosis, a lightening reading of the accuracy note), **a single case** triggers a rewrite (02 §1.6, 03 §3B, 04 §4.3).
- All thresholds are team decision rules, not research benchmarks.

| # | Question the sessions must answer | Test IDs (04 / 03 / 02 / 01) | If the answer is bad → design change before the deadline |
|---|---|---|---|
| Q1 | Do people find **Share → SkinKey** without help? | H5 / U1 / T2 / A2 | Paste-a-link gets equal weight on `/` home; add a first-run coach mark; show the Share tap in the video (P6) |
| Q2 | Do they understand **what happens to the photo**, and would they tap Start scan? | H4 / D2, Eth1 / T1 / A4 | Shrink consent to one screen with the privacy line in larger type; rewrite "What we keep"; if 2 or more pick Not now, add the self-reported start and lead the pitch with privacy (P2) |
| Q3 | Can they **explain a CAUTION reason** in their own words, linked to a reading? | H7 (CQ1–CQ2) / U2, D6 / T3 / A3 | Reason template moves even further up, with plainer words and the band above the ingredient name (P1) |
| Q4 | Is **CAUTION read as danger**, or **FITS as a guarantee**? | H7 / U2 / T4 | Rename CAUTION (alternative label is ASSUMPTION, test it next); strengthen the FITS "not a guarantee" subtitle (P4) |
| Q5 | Is **UNKNOWN** read as "bad", and is "based on product name only" noticed? | H7 (CQ4) / U2, F3 / T5 / A5 | Rename to "NOT ENOUGH INFO"; make "name only" the headline; lead UNKNOWN with Find better matches and the catalogue count (P3) |
| Q6 | Is the **medicine card** read as a diagnosis? | Bonus medicine card / Eth2 / T7 | Rewrite the gate copy; add a plain next step while keeping the exact R line (P4) |
| Q7 | How is the **Accuracy note** read? Any lightening or colourist reading? | K3 / U3, Eth3 / T8 | Reword immediately (keep the note, never remove it); add band explainers (P5) |
| Q8 | Do people actually **compare across stores**, and do they know the store tools? | H8 (K1, K4) / D3 / B2 / A6 | Pitch and home copy lead with "checks *this* product" rather than "any store". If Flipkart-only share also holds, the team discusses switching to backup concept C6 (03 §5) |
| Q9 | Do they notice and value the **pre-set Flipkart filter**? Is the budget OK? | "Better matches" question / D5 / T6 / A7 | Label the link-out with the filter before opening; make it a secondary button; try a discount filter (syntax UNVERIFIED, R §1) |
| Q10 | Does the product read as **for them**, whatever their gender, and are any **English terms** blocking? | Close + GB code / P1, P2 / A1 notes | Swap example products and onboarding copy for gender-neutral ones; replace blocking terms with plain words or glossary tips |
| Q11 | Does a **commission disclosure** on our web page lower trust? | H9 (K5) / V1 / A11 | Disclosure goes at the top of the web fallback page; keep Find better matches visibly neutral (the store's own search) |

**What the sessions cannot answer (freeze these on guardrails only, and state the limits in the README):**
- trust in a reading from the participant's **own** scan: every session uses the demo profile (01 A4; 02 §6.2);
- the emotional-curve scores;
- Skin Forecast, Aisle Check, the pharmacist QR/revoke and the tinted preview (04 header; 02 §6.2);
- whether `task/delete` works on failed tasks, and whether the Flipkart app keeps the filter. These are build-lead gate checks (02 §6.1), not interview questions.

**Process after the debrief (from 01 §1.8, 04 §4.4):**
1. Tally the results as counts.
2. Apply the rules above.
3. Pick **up to 3** design changes, each with an owner.
4. Update this brief's sections 4–5 with the changes.
5. Then freeze.

Only quotes with recorded permission can appear in the video. Never put a participant quote on the same screen as a statistic (04 §5).

---

## 7. Addendum: desk-research baseline (05_desk_research_baseline.md)

The desk research @Aman provided on 1 Nov adds India-specific public evidence. It is a baseline, not interviews. Design changes D1–D11 in 05 are adopted on top of this brief. The ones that change sections 2–5:

- **P1 reasons.** Name the ingredient **and** say in plain words why it matters, e.g. "Contains coconut oil and isopropyl myristate, which can clog pores". An ingredient name alone means little to most shoppers.
- **Copy A/B test (conflict with §4.1).** This brief uses "Your oiliness reading: HIGH (scan 1 Nov)". 05 proposes "Your skin looked oily in your 1 Nov scan", which describes a moment rather than labelling the person (Harris: 42% find "fix your appearance" invasive). **Default for the build:** the moment phrasing in the reason line, plus the band chip "Oiliness · High" on `/profile`. Confirm in interviews.
- **P3 UNKNOWN.** The next step becomes "Snap the ingredient list". Claude vision reads the photo through the proxy, and the same deterministic rules then run on it.
- **P5 profile.** Add a "Feels wrong? Edit" control: self-reports match measured skin type about 40% of the time.
- **P6 / better matches.** Add "Ranked by fit to your skin. No paid placements." plus "We may earn a commission; it never changes the ranking." Both must stay true.
- **Onboarding.** Add a "Find SkinKey in your share menu" teaching step. Fallbacks: paste link, read the clipboard on open, barcode.
- **Consent.** Explicit, specific consent that can be revoked (India's DPDP Act), with one-tap delete.
- **Demo products.** Lead with sunscreen and moisturiser, where trust in AI recommendations is highest (75–76%), not acne treatment.
