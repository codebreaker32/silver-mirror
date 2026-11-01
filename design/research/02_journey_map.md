# SkinKey: Current-State and Future-State Journey Maps + Today's Session Kit

*Draft v2, 2026-11-01. For today's 3–5 ten-minute interviews and share-flow tests. Hackathon deadline: 2026-11-02, 11:45 AM ET.*

**Facilitators: you only need Section 1 (the facilitator card).** The rest of the document is the map behind it.

---

## 0. Read this first (1 minute)

**What this is.** These maps are the team's **hypotheses** about how an urban 20–35 shopper in India buys skincare today, and how SkinKey could change that. We have not done any user research yet. Today's sessions test **part** of these maps (see 6.2 for what they don't test).

**Honesty rules.**
- **[E#]** = the claim comes from `/home/aman/youcam/research/evidence.md` or `/home/aman/youcam/research/skinkey_report.md` (key in Section 2).
- **ASSUMPTION** = not evidenced yet, needs testing. Not a finding.
- **UNVERIFIED** = a technical or market fact our files could not confirm.
- **"Thinks" lines, the proto-persona and the feelings scores (−2 to +2) are team guesses.** They are not quotes or measurements. Never quote them in the pitch, and never read them to participants.
- **Geography warning.** None of the statistics below is documented as coming from urban Indian shoppers aged 20–35. They come from vendor surveys and one Hong Kong survey, and for most of them our files don't state the market. The legal sources are US (FDA) and Illinois (BIPA). Never present any of them as "Indian shoppers say…".

**Proto-persona (hypothesis, not a research finding):** "The Active-Curious Shopper". Any gender, 20–35, lives in a metro or tier-1 city, already buys skincare on Amazon.in, Flipkart or Nykaa, follows skinfluencers, unsure which actives (niacinamide, retinol, AHA/BHA, SPF) suit their skin, Android, reads English. *Every attribute is an ASSUMPTION.* Don't steer participants toward it. Someone who doesn't fit it is data, not a bad recruit.

---

## 1. Facilitator card (open this on your phone)

### 1.1 Before the first session (team, ~15 min)
- [ ] **Pairs.** One facilitator and one note-taker, with a paper sheet or a second phone plus a stopwatch. If possible, the facilitator should be someone who didn't build the screens.
- [ ] **Test phone:** a team Android phone with the SkinKey dev build, Flipkart and Amazon installed. **Stop before checkout, and don't open account pages** (the store apps are logged into a team account).
- [ ] **Live scans of participants: NO, not today.** Use the cached demo profile. *Why:* a live scan sends a stranger's face to YouCam's servers, needs the face at more than 60% of the frame, front-facing, in even light [E18] (hard in a café), and doesn't fit in 10 minutes. *Consequence:* "this is about MY skin" (MoT 2) and "the profile contradicts what I believed" (F1) **cannot be tested today**.
- [ ] **Pick the session mode** after the hour-1 gate [E20] and write it on every sheet:
  - **Mode A:** share-in works. Run as written.
  - **Mode B:** share-in broken, but the app runs. Use paste-link from `/` home and mark T2 = N/A.
  - **Mode C:** the dev build is broken. Use screenshots or paper mock-ups of: share-tip, consent, sample profile with accuracy note, CAUTION, UNKNOWN, medicine gate. For "Find better matches", open the real Flipkart filter URL in the phone browser (the web URL returned HTTP 200 [E15]). Mark T2 = N/A.
- [ ] **Fill in the state-trigger products** (from the 12–15-product catalogue [report sections 4–5]), or set the dev toggle:

  | State | Product name (fill in) | How to reach it |
  |---|---|---|
  | FITS | ________ | share or paste |
  | CAUTION | ________ | share or paste |
  | Medicine gate | ________ (contains e.g. benzoyl peroxide) | share or paste |
  | UNKNOWN | any product not in the catalogue | the participant's own pick usually does this [E21] |

- [ ] **Onboarding share-tip:** today we test the tip **as designed** (show it, then the task). If the build has no tip yet, show the tip mock-up. Note "tip shown Y/N".
- [ ] **Labels check:** FITS / CAUTION / UNKNOWN must be readable as text at large system font, not only by colour.
- [ ] **Agree on the decision table (1.6)** before session 1.

### 1.2 Screener (30 seconds, before the timer starts)
1. "Are you 18 or older?" If no: thank them and stop. If yes: "Under 20, 20–35, or over 35?" (record)
2. "Is your own phone Android or iPhone?" (record. iPhone users can still do the task on our phone, but mark them.)
3. "In the last 6 months or so, have you bought or seriously looked at anything for your face online: face wash, sunscreen, moisturiser, anything? Which app?" If no: out of segment. Thank them, or run the session and mark it.
4. "Which city do you live in?" (record)
5. "Do you know anyone on our team?" (record)
- **Quota:** try to include at least 1–2 men across the 3–5 sessions. Record gender only if the participant states it.
- **Never screen for, guess or record skin tone.**

### 1.3 Consent script (read this out)
> "Hi, I'm ___ from a hackathon team building a skincare-checking app. This takes about 10 minutes. We're testing the app, not you, so there are no wrong answers. We didn't design it to be perfect, so criticism helps us most. We won't record audio or video. I'll take anonymous notes as P1 to P5, with no names or phone numbers. You can stop at any time. We won't take any photo of you today. Is it OK if we quote your words anonymously in our hackathon pitch?"

Record **Quote OK: Y/N**.

### 1.4 Timed script (10 minutes; the note-taker keeps time)

| Time | Block | Say (word for word) | Note-taker watches / scores |
|---|---|---|---|
| 0:00–0:30 | Start | (consent script above) | Quote OK |
| 0:30–2:30 | **Background** | 1. "Tell me about the last thing you bought or looked at for your face: face wash, sunscreen, moisturiser, anything. Where did you first come across it?" 2. "Walk me through how you chose it." Follow-up only if needed: "Where else did you look at it?" Optional: "What price range were you looking in?" 3. "What type of skin do you think you have?" Then: "How do you know?" | B1, **B2**, **B3**, B4. Probe confusion only if they raise it. |
| 2:30–4:00 | **Consent screen and profile** | Show `/onboarding/consent`: "Please read this as you normally would." Then: "In your own words, what happens to the photo?" Then show the demo `/profile`: "This is a sample profile, not your skin. Imagine it's yours." Point at the accuracy note: "What is this note telling you?" | **T1**, did they read or skip (time spent), T8 |
| 4:00–7:30 | **Share task** | Show the share-tip (as designed). Then: "Open Flipkart, find a moisturiser or sunscreen you'd consider, and check it with SkinKey." **Then stay silent.** After the verdict, before they tap: "What do you expect will happen if you tap *Find better matches*?" After it opens: "What do you notice about these results?" | **T2** (stopwatch; was SkinKey under "More" in the share list?), **T3**, **T5** if UNKNOWN, **T6**, their product and its verdict |
| 7:30–9:00 | **CAUTION, then UNKNOWN** | Open the CAUTION product **on its own**: "What is this telling you? What would you do right now?" Let them do it. Then UNKNOWN (skip if the share task already gave UNKNOWN): same two questions. | **T4**, **T5**, T3 |
| 9:00–10:00 | **Close** | "If this were on your phone right now, would you keep it or delete it? Why?" "How much would you rely on it? What makes you say that?" | Their exact words |
| *(only if time remains)* | Optional extras | Medicine gate: "What is this telling you?" / "Think of a time you almost bought something for your face but didn't. What happened?" / "Have you ever used anything that tells you what suits your skin? Where?" (Name Flipkart's or Amazon's tool only *after* they answer.) | T7, B5, B6 |

**Stop rules for the share task (T2):**
- After **60 seconds** stuck: "Is there any way to send this page to another app?"
- After **90 seconds**: "Try the Share button."
- **T2 = Y only if they needed no hint.** If finding the product in Flipkart takes more than 2 minutes, use a product already open on the phone.
- **Expected result:** the participant's own pick will probably come back UNKNOWN or title-only, because the catalogue is small [E21]. That's fine; it's real data. CAUTION is shown separately in the next block.

**Never say:** Share (before the task), safe, dangerous, allergic, harmful, medical, treat, cure, fairness, "your skin is…". Don't explain the app before the task. Don't quote our statistics. Don't read out "Thinks" lines or the persona.
**If asked for skin or medical advice:** "Please ask a pharmacist or dermatologist."
**Language:** write their original words. If they answer in Hindi or another language, or mix languages, write it as said and mark the language. Don't paraphrase into English.
**Accessibility:** note it if they use large text or zoom in.

### 1.5 Scoring sheet (one per participant; write their words *before* you score)

Header: P#, mode A/B/C, tip shown Y/N, demo profile = yes (always today), screener answers, quote OK.

**Core rows (score Y / N / ?, with Y defined in advance):**

| # | Hypothesis | Counts as Y only if… | Y/N/? | Their words |
|---|---|---|---|---|
| B2 | Compares across stores (the wedge) | In their last purchase they looked at the same product in 2+ apps or sites (note which) | | |
| B3 | Unsure of own skin type | They say they're unsure, or give no basis, or "I think" | | |
| T1 | Understands what happens to the photo | Unprompted, they say it's processed and deleted, and that only bands or scores are kept | | |
| T2 | Finds Share → SkinKey | Reaches SkinKey with no hint (record seconds) | | |
| T3 | Explains a verdict reason | Restates a reason in their own words, linked to a skin reading | | |
| T4 | CAUTION read as "fit" | Their words describe suitability for this profile; no safety, allergy or disease words, unprompted | | |
| T5 | UNKNOWN still useful | Their *next action* is to tap Find better matches or try another product (not leaving) | | |
| T6 | Notices the pre-set filter | Mentions the skin-type filter or chip **unprompted** | | |

**Optional rows:** B1 found it via reels or creators · B4 raised ingredients or actives unprompted · B5 knows or has used a store skin tool (which one) · B6 almost-bought or stopped-using story · T7 medicine-gate reaction (relief / annoyance / confusion) · T8 accuracy-note reading (**any** "skin-lightening" or colourist reading counts as a failure).

**Always fill in:**
- **Their product and its verdict** (FITS / CAUTION / UNKNOWN / title-only). This gives a small real count of how often UNKNOWN happens.
- **Surprises:** ________
- **What they did instead of what we expected:** ________

### 1.6 Decision table (agree before session 1; threshold = 2 or more sessions)

| If… | Then, before 2026-11-02 11:45 ET |
|---|---|
| T2 = N in 2+ sessions | Make paste-link a first-class entry on `/` home; strengthen the share-tip; pitch "Share **or** paste" |
| T1 = N in 2+ | Rewrite the consent copy (see MoT 1) |
| T3 = N in 2+ | Rewrite the reason template (score name + band + scan date first) |
| T4 = N in 2+ | Rename CAUTION (the alternative label is an ASSUMPTION; test it in the next session) and rewrite the reason copy |
| T5 = N in 2+ | The UNKNOWN screen leads with "Find better matches" and shows catalogue counts |
| T6 = N in 2+ | The link-out label states the filter, e.g. "Flipkart search, filtered to Oily Skin" |
| T8 colourist or lightening reading, even once | Reword the accuracy note immediately |
| B2 mostly N | Soften "every store" in the pitch; lead with "checks *this* product" |
| B1–B6 (any result) | **Background only.** These can't change the build in 24 hours. Use them in the pitch only as "observed in N of M sessions (small convenience sample)", never as a statistic. |

### 1.7 Debrief (15 minutes, straight after the last session)
1. Tally each row as Y/N/? across sessions, split by mode (A/B/C) and by in-segment vs out-of-segment.
2. Read out the surprises and "did instead" notes.
3. Apply the decision table. Owner for build changes: ______. Owner for updating the map and pitch: ______.
4. Write down the caveats: convenience sample, location, n, mode, demo profile (not their own skin), participants who know the team.

---

## 2. Evidence key

| Tag | What it says | Source (as recorded in our files) | Caveat |
|---|---|---|---|
| E1 | 70% don't know their skin type; 80% don't know ingredients | CeraVe/OnePoll 2021 (evidence.md) | Vendor survey. Market not stated. |
| E2 | 63% are wrong about their skin type | Labskin 2022 (evidence.md) | Vendor survey. Market not stated. A **different** survey, year and sample from E1, so don't combine them. |
| E3 | 49% have skincare unopened for more than 1 year | HK Consumer Council 2021 (evidence.md) | Hong Kong, not India |
| E4 | More than 60% of online beauty shoppers skipped a purchase over shade; 41% returned a wrong shade | Google 2022 (evidence.md) | Vendor. About shade (tinted products), not actives. Market not stated. |
| E5 | "41% women struggle to find complexion shade, 56% for darker tones" | Benchmarking Co. 2026 (evidence.md) | Our files describe the sample only as women; market not stated. Don't extend it to men or a gender-neutral audience. |
| E6 | AR try-on raises sales; the overall effect is small; it is larger for less popular brands, narrower-appeal products, pricier products and new-to-channel/category customers; it works by reducing product uncertainty | Tan, Chandukala & Reddy 2022, *J. Marketing* (evidence.md) | About try-on, not skin checks. Quote it in full in the pitch; don't stretch it. |
| E7 | 80% more confident; two-thirds "less likely to return" | Snap/Publicis 2022 survey (evidence.md) | **Stated intent only.** Market and category not stated. |
| E8 | Only 2.1% of open skin-lesion images record Fitzpatrick type; derm AI is limited on dark skin | Wen et al. 2022 (*Lancet Digital Health*); Daneshjou 2022 (*Science Advances*) (evidence.md) | About **dermatology** lesion datasets and derm AI, not YouCam's cosmetic Skin Analysis. Applying it to YouCam is an **extrapolation**. YouCam accuracy by skin tone is not in our files. |
| E9 | "Treat acne" claims make a product a drug; use cosmetic-appearance wording plus a "not medical advice, see a dermatologist" referral path | FDA intended-use (evidence.md) | US rule. Indian equivalent not in our files (ASSUMPTION). |
| E10 | Face-data cases (Kukovec, Castelaz v. Estée Lauder) lead to: explicit e-consent before capture, prompt deletion, no linking face geometry to identity, **published retention policy, no sale or sharing** | BIPA (evidence.md) | Illinois law. Indian privacy law not in our files (ASSUMPTION). |
| E11 | Flipkart has had a ModiFace selfie Skin Analyser since about Dec 2023; Amazon.in has a quiz SkinCare Analyzer; each works only inside its own store and catalogue | Report intro ("One correction you need to know") and section 4 red-team; ModiFace newsroom, CXOToday, aboutamazon.in | **UNVERIFIED that both are still live in 2026.** The team checks this in hour 1, not in sessions. |
| E12 | The Amazon Creators API and the Flipkart affiliate API have no ingredients field. The Creators API needs an approved Associates account plus 10 sales in 30 days. Flipkart affiliate sign-ups reportedly paused since 2018 (UNVERIFIED). | Report section 1, "What does not work" | SkinKey can't fetch ingredients from the stores |
| E13 | Flipkart's terms ban scraping; Amazon.in's robots.txt blocks common bots | Report section 1 | |
| E14 | "No affiliate links in the app." Amazon Associates India needs separate approval for mobile apps (policy rule 7, agreement rule 21). No Amazon reviews or ratings (rule 28). No WebViews of Amazon pages (rule 21). No Amazon or Flipkart logos (report guardrail, no rule number). | Report section 1 | |
| E15 | The Flipkart skin-type filter URL was tested on the web: HTTP 200, facet applied. Values seen: Oily Skin, Dry Skin, Combination Skin, All Skin Types. Flipkart URL options listed: skin type, brand, discount, keywords. | Report section 1B and "What does not work" | Undocumented, could change. **Whether the Flipkart app keeps the filter is UNVERIFIED.** No price facet listed. |
| E16 | Nykaa keyword search URL works; Nykaa skin filter syntax UNVERIFIED. Amazon `/s?k=` URL **untested** (Amazon returned 503 to our fetchers). | Report section 1B | Keyword-only for both |
| E17 | Open Beauty Facts: 348 India-tagged products with complete ingredients; ODbL; not for medical use | Report section 2 (team query) | Thin coverage |
| E18 | YouCam `task/delete` removes "a finished task" and its input and output files (VERIFIED). Results are kept for 24h. Capture needs the face at more than 60% of width, front-facing, even light. `skin_type` output values are not documented. Each extra YouCam feature needs its own upload and polling loop. | `task/delete`, `skin_type`, per-feature upload: report section 2. 24h retention and capture rule: evidence.md. | Deletion of **failed or abandoned** tasks is not covered (UNVERIFIED) |
| E19 | The Open-Meteo free tier is non-commercial only and needs a CC BY 4.0 credit | Report section 2 | Conflicts with any revenue plan (see F4) |
| E20 | The Android share target is standard (VERIFIED). What the Amazon and Flipkart apps send, and whether each uses the normal share menu, is UNVERIFIED. A Flipkart short link returned 504/500 in a server test. Share-in needs a dev build, not Expo Go; dev builds are fragile on WSL2. | Report sections 1A, 4, 5 | **Hour-1 go/no-go gate.** Nykaa share-in not tested. |
| E21 | Simulated judges: the small catalogue means most real shares come back title-only or UNKNOWN; YouCam use is shallow; "no revenue path, because affiliate links aren't allowed in the app" | Report section 3 | **Internal judging, not user research** |
| E22 | Cloudflare KV can show a revoked profile for up to about 60 seconds | Report section 4 | |
| E23 | **Not supported by evidence:** measured return reduction from AR (only stated intent); personalisation leading to less waste | evidence.md | Pitch these only as hypotheses |
| E24 | Report guardrails: separate consent screens; privacy line "SkinKey stores no photo; YouCam processes it and we delete it from YouCam right after"; cosmetic wording only; medicine-gate list; fixed referral checklist that AI scores never trigger; bands, not numbers; a note that skin AI "can be less accurate on deeper skin tones and in poor light"; not-affiliated line | Report section 2, Guardrails | Team design rules, not evidence about users |
| E25 | Round 1 winners pattern: "underserved user OR B2B buyer + measurable/auditable output + honesty guardrails + shipped surface" | evidence.md | What **judges** rewarded. Not evidence about user trust. |

The catalogue size of 12–15 products comes from report sections 4 and 5 (section 2 says only "a small hand-built catalogue").

---

## 3. Current-state journey (no SkinKey)

**Scope:** discover, browse, read reviews and ingredients, doubt, buy or abandon, use, regret or leave unused. All actions, thoughts and feelings are ASSUMPTIONS unless tagged.

### C1. Discover (skinfluencer reel or ad)
- **Actions:** Scrolls reels or short videos, sees a creator recommend a serum with an active, and saves or screenshots it. *(ASSUMPTION: the channel mix)*
- **Thinks (team guess):** *Their skin looks great. Is it for my skin type, though?*
- **Feels:** +2, hopeful *(guess)*
- **Pain points:** The creator's skin may not match the shopper's, who may not know their own skin: 70% don't know their skin type [E1]; separately, 63% are wrong about it [E2]. These are different vendor surveys with markets not stated. Advice is generic *(ASSUMPTION)*.
- **Opportunity:** A measured profile ready *before* the hype moment.
- **SkinKey screen:** none directly; prepared by `/onboarding/*` and `/profile`. Share-in from Instagram or YouTube is out of scope.
- **Today:** background probe 1 → B1.

### C2. Browse Amazon.in / Flipkart / Nykaa
- **Actions:** Searches in one or more store apps, compares price and variants, and may try a store's own skin tool [E11, 2026 status UNVERIFIED].
- **Thinks (team guess):** *Three listings, three prices. Same product?*
- **Feels:** +1, motivated but starting to feel overloaded *(guess)*
- **Pain points:**
  - Each store's tool works only inside that store and its catalogue [E11]. That cross-store shoppers feel this is an ASSUMPTION (test with B2).
  - Results aren't filtered to their skin unless they set filters themselves. Flipkart has a skin-type facet [E15]; whether shoppers use it is an ASSUMPTION.
  - Price matters *(ASSUMPTION; no evidence in our files)*.
- **Opportunity:** One profile that works with **any store app that offers Share (Flipkart first; Amazon and Nykaa still to test [E20])**.
- **SkinKey screen:** Share into `/check` (F2); "Find better matches" (F4).
- **Today:** background probe 2 → B2 (cross-store comparison, the wedge). Optional → B5.

### C3. Read reviews and ingredients
- **Actions:** Reads reviews, zooms into the ingredient image, googles actives *(ASSUMPTION)*.
- **Thinks (team guess):** *What is "sodium hyaluronate"? Can I use this with retinol?*
- **Feels:** −1, confused *(guess)*
- **Pain points:** 80% don't know ingredients [E1, vendor, market not stated]; our files have **no data on actives specifically**. Ingredient lists on listings may be missing or image-only *(ASSUMPTION; we know only that the store APIs have no ingredients field [E12])*.
- **Opportunity:** 1–3 reasons tied to their measured scores, plus provenance.
- **SkinKey screen:** `/check` verdict (F3). It **cannot** show Amazon reviews or ratings [E14], so it complements reviews and doesn't replace them.
- **Today:** score B4 only if they raise ingredients themselves.

### C4. Doubt
- **Actions:** Leaves it in the cart, asks a friend, compares in another tab *(ASSUMPTION)*.
- **Thinks (team guess):** *Am I even oily, or combination?*
- **Feels:** −2, stuck *(guess)*
- **Pain points:** Skin-type uncertainty [E1, E2]. For tinted products only, shade uncertainty: more than 60% skipped a purchase over shade [E4, vendor]; "41% women struggle to find complexion shade, 56% for darker tones" [E5, women only]. Fear of irritation from actives *(ASSUMPTION)*.
- **Opportunity:** Reduce product uncertainty, the mechanism by which AR try-on raised sales in [E6] (try-on, not skin checks). Give a clear fits / be careful / we don't know signal.
- **SkinKey screen:** `/check` (F3); F3b shade preview (proposed).
- **Today:** optional probe → B6.

### C5. Buy or abandon
- **Actions:** Buys (maybe the "safe" bestseller) or abandons *(ASSUMPTION)*.
- **Feels:** buy +1 / abandon −1 *(guess)*
- **Pain points:** Shade-driven abandonment [E4] (tinted products only). How often people abandon over actives is not evidenced.
- **Opportunity:** A better-fit alternative instead of a dead end.
- **SkinKey screen:** "Find better matches" (F4); "Back to product" (F5).

### C6. Use *(not tested today)*
- **Actions:** Starts using it, layers actives, forgets SPF *(ASSUMPTION)*.
- **Thinks (team guess):** *Is the tingling normal?*
- **Pain points:** Unsure whether a reaction is normal. **SkinKey must not answer this** [E9]; route to the fixed `/referral` checklist and a pharmacist [E24].
- **Opportunity:** A cosmetic-only context cue (e.g. "high UV this week, no SPF listed"); a profile to show a pharmacist.
- **SkinKey screen:** `/` home Forecast card (F6); `/referral`; `/share-pharmacist` (F7).

### C7. Regret, return or unused
- **Actions:** Stops using it, leaves it on the shelf, gives it away; returns are possible only if the platform allows them *(ASSUMPTION; eligibility not in our files)*.
- **Feels:** −2, regret *(guess)*
- **Pain points:** 49% have skincare unopened for more than a year [E3, **Hong Kong**]; 41% returned a wrong shade [E4, vendor, tinted products].
- **Do not claim** that SkinKey reduces returns or waste [E23]. "Less likely to return" is stated intent only [E7].
- **Today:** optional probe → B6.

### Current-state emotional curve (team guess, −2 to +2)

| Stage | Score | Curve | Driver |
|---|---|---|---|
| C1 Discover | +2 | `####` | Hype |
| C2 Browse | +1 | `###` | Overload starting |
| C3 Reviews and ingredients | −1 | `#` | Jargon |
| C4 Doubt | −2 | `.` | "Do I know my skin?" |
| C5 Buy / abandon | +1 / −1 | `###` / `#` | Relief or frustration |
| C6 Use | +1 → 0 | `###` → `##` | Unsure how to use it |
| C7 Regret | −2 | `.` | Wasted money |

*The lows (C4, C7) are where SkinKey has to earn its place. These scores are untested; today's sessions don't measure them.*

---

## 4. Future-state journey (with SkinKey)

### F1. Onboarding scan (one time, with consent) — *capture and own-profile reaction not tested today*
- **Actions:** Reads the consent screen, takes a selfie inside the static oval, waits, then sees the profile as **score bands only** with the scan date, accuracy note, "What we keep" and Delete.
- **Thinks (team guess):** *Where does my face go? OK, it's deleted.*
- **Feels:** −1 at consent, 0 at capture, +1 at profile *(guess)*
- **Pain points / risks:**
  - Face-data fear. Guardrails come from US case law [E10]; Indian requirements are not in our files (ASSUMPTION).
  - Deletion promise: `task/delete` is VERIFIED only for **finished** tasks, and results are kept for 24h [E18]. A failed or abandoned task (timeout, app killed, YouCam error) may not get deleted. See MoT 1.
  - Capture needs the face at more than 60% of width, front-facing, in even light [E18]. Expo has no live face framing, so we use a static oval and YouCam error hints (report section 4).
  - Accuracy: the report's guardrail calls for a note that skin AI "can be less accurate on deeper skin tones and in poor light" [E24]. The deeper-tone part draws on derm-AI evidence [E8]; carrying it over to YouCam is an **extrapolation**.
  - **Naming risk (ASSUMPTION, cultural):** the report calls this a "fairness note". In India, "fairness" strongly suggests skin-lightening products. **Rename it "Accuracy note"** and test how people read it (T8).
  - `skin_type` values are undocumented [E18], so skin type may come from **our rule** over the oiliness and moisture bands. Say so on screen; don't call it "measured".
  - A result that contradicts the user's belief may cause distrust *(ASSUMPTION; untestable today with the demo profile)*.
- **Opportunity (hypothesis):** "What we keep" (about 10 numbers) and a visible delete make privacy concrete. "Measured bands, not a quiz" may be the hook *(ASSUMPTION)*.
- **Screens:** `/onboarding/consent` → `/onboarding/capture` → `/onboarding/processing` → `/profile`
- **Today:** consent screen read-back → T1; accuracy note → T8; skin-type question asked *before* any profile is shown → B3.

### F2. Share from the store app
- **Actions:** On a product page in the Flipkart (or Amazon) app: Share → SkinKey. `/check` opens with an editable title ("Is this the product?").
- **Feels:** 0 (did it work?) → +1 *(guess)*
- **Pain points / risks:**
  - Share contents, and whether each app uses the standard share menu, are UNVERIFIED [E20]. If only a link arrives, the user confirms or types the name.
  - Discoverability: users may not think of Share, and on a fresh install SkinKey may sit under "More" in the share list *(ASSUMPTION: the biggest risk)*.
  - Server-side short-link resolution failed (504/500) [E20].
  - Nykaa share-in is untested. The report makes Flipkart the guaranteed demo and shows Amazon only if the hour-1 test passes (section 4).
- **Opportunity:** A one-time share-tip in onboarding; paste-a-link on `/` home as the fallback.
- **Today:** share task, tip shown as designed → T2 (stopwatch, 60 s / 90 s hint rule).

### F3. Verdict: FITS / CAUTION / UNKNOWN
- **Actions:** Reads the verdict and 1–3 reasons, each naming its score, e.g. "Your oiliness reading: high (scan 1 Nov)". Also sees provenance (catalogue with source link / "based on product name only" / Open Beauty Facts), "Measured by YouCam Skin Analysis, [date]", and a permanent "cosmetic guidance, not medical advice" line. A UV reason appears if relevant.
- **Feels:** FITS +2 / CAUTION 0 / UNKNOWN −1 *(guess)*
- **Pain points / risks:**
  - The catalogue is small (12–15 products; report sections 4–5), so most real shares come back title-only or UNKNOWN [E21]. Ingredients can't be fetched [E12], and scraping is banned [E13].
  - FITS / CAUTION is a verdict-like label, which conflicts with evidence.md's guardrail "avoid verdict-like scores". Copy must say it's about fit with *this profile*, not a safety rating.
  - CAUTION could come from a mis-measured score on deeper tones. This is a risk extrapolated from derm AI [E8], not shown for YouCam.
  - **Medicine gate:** adapalene, tretinoin, benzoyl peroxide, clindamycin, hydroquinone, ketoconazole or steroids → show only "This looks like a medicine. Ask the pharmacist." [E24]
- **Opportunity:** Reasons tied to *their* measurements. **Hypothesis (to validate, T3):** visible provenance builds user trust. What we actually know is that judges rewarded honesty guardrails in Round 1 winners [E25]; that is a judging pattern, not a user finding. An honest UNKNOWN still offers "Find better matches".
- **F3b. Tinted-product shade preview (proposed, not in the report's MVP screen list; not tested today):** YouCam Facial Color Tones plus Makeup VTO (foundation hex), labelled "preview, not a colour guarantee". It targets shade doubt [E4, E5], but E5 covers women only. Risks:
  - Each extra feature needs its own upload and polling loop [E18]. Whether that means a **new selfie** (needs its own consent) or **holding the onboarding photo** (conflicts with "stores no photo") is a design decision (ASSUMPTION).
  - The VTO output is a new image of the user's face. It must also be deleted via `task/delete` and falls under the E10 guardrails.
  - The report says to keep Color Tones only if it drives a real rule (section 2).
- **Today:** T3, T4 (CAUTION shown alone first), T5 (UNKNOWN next action). Optional: T7 (medicine gate).

### F4. Find better matches
- **Actions:** Taps "Find better matches". **If the hour-1 test shows the Flipkart app keeps the filter,** the app opens filtered to their skin type (Oily / Dry / Combination / All Skin Types [E15]). **Otherwise** a Chrome Custom Tab opens the filtered Flipkart web search (web URL VERIFIED, HTTP 200). Amazon.in and Nykaa open keyword searches [E16].
- **Thinks (team guess):** *It already set a skin filter for me* (only if the filter is kept and visible).
- **Feels:** +1 *(guess)*
- **Pain points / risks:**
  - App behaviour is UNVERIFIED [E15]. Copy says "opens a Flipkart search", never "deep-links into Flipkart" (report section 1).
  - No verified facet exists for sensitivity or redness, so those go into keywords. The Amazon URL is untested [E16].
  - **Price:** better matches may be pricier; no price facet is listed for the Flipkart URL [E15] *(ASSUMPTION that this matters)*.
  - **Revenue: UNVERIFIED.** "No affiliate links in the app" [E14]. The Creators API needs an approved Associates account [E12]. Flipkart affiliate sign-ups are reportedly paused [E12, UNVERIFIED]. Judges saw "no revenue path" [E21]. **A web fallback page on our own domain (`skinkey.<domain>/p/<token>`) carrying affiliate tags is a stretch ASSUMPTION:** the fallback page is "our own design, not documented Expo behaviour", and App Links are the first item to cut (report sections 1C, 4, 5).
  - **Licensing conflict (ASSUMPTION to check):** any affiliate revenue plus the non-commercial Open-Meteo free tier [E19]. Whether a hackathon app counts as "commercial" is unknown.
  - No Amazon reviews, ratings, WebViews or logos [E14].
- **Opportunity:** "Same profile, every store, about *this* product", the wedge against store-locked tools [E11], but only if people actually compare across stores (B2).
- **Today:** pre-tap expectation question, then "What do you notice?" → T6 (counts only if unprompted).

### F5. Buy *(not tested today)*
- **Actions:** Buys in the store app (SkinKey isn't in checkout) or taps "Back to product".
- **Risks:** SkinKey can't confirm purchases, so impact is hard to measure. Confidence is evidenced only as stated intent for AR [E7]; sales uplift only for AR try-on [E6].
- **Opportunity:** "Save to my checked list" *(ASSUMPTION, not in MVP)*.

### F6. Forecast *(not tested today)*
- **Actions:** A home card with live Open-Meteo UV, humidity and temperature, plus one verdict reason.
- **Risks:** Push nudges are not in the MVP (report: one card plus one reason). The weather card is the 5th nice-to-have to cut (report section 5). Non-commercial tier with a CC BY credit [E19]. Never script weather numbers. Avoid medical-sounding advice [E9].
- **Screens:** `/` home card; reason in `/check`; credit on `/about`.

### F7. Aisle Check and pharmacist share *(not tested today)*
- **Actions:** In a physical store: `/scan` barcode → the same verdict (catalogue first, then Open Beauty Facts). Optional pharmacist QR: a web page with bands only (no photo, no skin colour), 30-minute expiry, Revoke.
- **Risks:**
  - The Open Beauty Facts lookup and the QR page both **need internet**.
  - Coverage is thin (348 India-tagged products with complete ingredients), and OBF data is not for medical use [E17].
  - Medicines sit next to cosmetics, so the medicine gate is critical (report section 4).
  - Revoke lag of up to about 60 s on KV [E22]. Use a Durable Object or D1, or don't promise "instant".
  - The OBF lookup and the pharmacist QR are nice-to-haves #3 and #4 to cut (report section 5).
- **Opportunity:** The same profile in a physical store; the pharmacist share as a conversation aid, not a diagnosis.

### Future-state emotional curve (team guess, −2 to +2)

| Stage | Score | Curve | Driver |
|---|---|---|---|
| F1 Consent → profile | −1 → +1 | `#` → `###` | Wary, then curious |
| F2 Share | 0 → +1 | `##` → `###` | "Did it work?" |
| F3 Verdict | +2 / 0 / −1 | `####` / `##` / `#` | Wording and coverage |
| F4 Better matches | +1 | `###` | Pre-set filter (if the app keeps it) |
| F5 Buy | +1 | `###` | More confident (unproven) |
| F6 Forecast | +1 | `###` | Ongoing relevance |
| F7 Aisle check | +1 / −1 | `###` / `#` | Physical store, thin data |

*Intended shape: one deliberate dip at consent, then a flatter, higher curve. The big risk is UNKNOWN becoming the most common verdict [E21], which would recreate the C4 low inside our own app. Today's "their product → verdict" count gives a first real look at this.*

### Current-state pain → SkinKey screen

| Pain | Evidence | Screen | Remaining risk |
|---|---|---|---|
| Unsure or wrong about skin type | E1, E2 (separate vendor surveys) | `/onboarding/*`, `/profile` | Belief contradiction; deeper-tone risk extrapolated [E8]; derived skin type |
| Don't understand ingredients | E1 (vendor) | `/check` reasons | UNKNOWN common [E21] |
| Store tools locked to one store | E11 | Share → `/check` | Share contents UNVERIFIED [E20]; cross-store behaviour untested (B2) |
| Unfiltered search | ASSUMPTION | Find better matches | App may drop the filter [E15] |
| Shade doubt (tinted products) | E4, E5 (women) | F3b (proposed) | Not in MVP; capture and deletion design |
| Unsure about a reaction | ASSUMPTION | `/referral`, `/share-pharmacist` | Must stay non-medical [E9] |
| Unused or regretted products | E3 (Hong Kong) | Whole flow (indirect) | Reduction not evidenced [E23] |
| Medicines in the pharmacy aisle | Report section 4 | Medicine gate | Missed when ingredients are incomplete |

---

## 5. Moments of truth

### MoT 1. Consent (`/onboarding/consent`) — tested today via T1
- **The user must believe:** "My photo is used once and deleted, and I know exactly what's kept."
- **Risks:**
  - People tap through without reading.
  - Over-promising: YouCam processes the photo on its servers.
  - `task/delete` is VERIFIED only for **finished** tasks; results are kept for 24h [E18]. So "we delete it right after" is true only if our delete call succeeds.
  - Indian legal requirements are not in our files (ASSUMPTION).
- **Mitigation:**
  - Plain English on one screen; show "What we keep" *before* capture.
  - **Cleanup path:** the proxy logs every task ID it creates and calls `task/delete` on success, failure or timeout, retrying on the next app open. Whether `task/delete` accepts failed tasks is UNVERIFIED; add it to the hour-1 test.
  - **Proposed copy qualifier (ASSUMPTION, test with T1):** "…we ask YouCam to delete it as soon as your results arrive. If something goes wrong, YouCam's own limit is 24 hours."
  - **Published retention policy and "we never sell or share your scan"** on `/about` and in "What we keep" [E10].
  - Separate consent for the pharmacist share and for any VTO capture; the VTO output image is deleted too [E10, E24].
- **Watch:** read or skip, time spent, repeat-back accuracy, questions.

### MoT 2. First verdict (`/check`) — partly tested today (comprehension only; demo profile)
- **The user must believe:** "This is about *my* skin and *this* product, and I can see why."
- **Risks:** The profile contradicts their self-image (E2: 63% wrong about type, vendor) → "the app is wrong"; generic-sounding reasons; share delivers only a link [E20].
- **Mitigation:** Every reason names the score and scan date; "Measured by YouCam Skin Analysis, [date]"; a provenance line; the accuracy note [E24]; demo products drawn from the catalogue.
- **Watch:** first words; can they explain *why* (T3)?

### MoT 3. CAUTION — tested today via T4
- **The user must believe:** "Be careful with this *for this profile*, and here's a better option", not "this is dangerous" or "I have a condition".
- **Risks:** Read as an allergy, safety or medical warning [E9]; conflicts with "avoid verdict-like scores" (evidence.md); deeper-tone mis-measurement (extrapolated, [E8]); reads as "bad product" *(ASSUMPTION)*.
- **Mitigation:** Cosmetic wording only ("looks oily", never "treats acne"); framed as fit; always paired with Find better matches; bands, never numbers; AI scores never trigger referral [E24].
- **Watch:** unprompted words: *dangerous, allergy, harmful, disease*.

### MoT 4. UNKNOWN — tested today via T5 and the "their product" count
- **The user must believe:** "It's honest about what it doesn't know, and it's still useful."
- **Risks:** Probably the most common real result [E12, E17, E21]; the user decides the app is useless; the temptation to fake confidence from the title.
- **Mitigation:** "Based on product name only" label; filtered Find better matches; honest catalogue counts; one real UNKNOWN in the demo video (report section 4); paste-ingredients option *(ASSUMPTION, not in MVP)*.
- **Watch:** their next action (leave / better matches / try another).

### MoT 5. Medicine gate — optional today (T7)
- **The user must believe:** "This one needs a pharmacist, and SkinKey is right not to judge it."
- **Risks:** False negatives when ingredient data is incomplete; feeling patronised for products like benzoyl peroxide *(ASSUMPTION on perception and on Indian sale status)*; any added wording drifting into dosing advice [E9].
- **Mitigation:** The fixed list and the single fixed line [E24]; no score-based suggestions; optional pharmacist QR with its own consent and Revoke.
- **Watch:** relief, annoyance or confusion.

### Additional moments

| Moment | Risk | Source |
|---|---|---|
| Finding SkinKey in the share list (F2) | The core flow never starts; SkinKey may sit under "More" | ASSUMPTION; [E20] |
| Landing after Find better matches (F4) | The filter is dropped or a browser opens | [E15], app UNVERIFIED |
| Accuracy note (F1) | "Fairness" read as skin-lightening or colourist | ASSUMPTION (cultural); tested via T8 |
| Pharmacist Revoke (F7) | Profile visible for up to about 60 s | [E22] |
| Shade preview (F3b) | Read as a colour guarantee; deeper-tone risk | E5, E8 (extrapolated); "preview not fit guarantee" pattern (ConfidFit, evidence.md) |

---

## 6. Evidence gaps and today's coverage

### 6.1 Gaps
1. **No India-specific data** on skincare buying, actives confusion, reel influence, abandonment or returns. The statistics come from vendor surveys and Hong Kong, and for most the market isn't stated.
2. **No data on actives specifically** (niacinamide, retinol, AHA/BHA), only "ingredients" [E1].
3. **No data on men's skincare buying.** E5 covers women only.
4. **No evidence for YouCam accuracy by skin tone.** E8 is derm AI, extrapolated.
5. **All "Thinks" lines, the persona and the emotional curves** are team guesses.
6. **Technical go/no-go items (team, hour 1, not sessions):** share payload [E20]; Flipkart app filter retention [E15]; whether `task/delete` works on failed tasks [E18]; whether the store tools are still live in 2026 [E11].
7. **Commercial items:** affiliate eligibility [E12, E14] and the Open-Meteo non-commercial terms [E19].
8. **Impact:** no evidence that SkinKey-type checks reduce returns or waste [E23]. Use "we expect" and "to validate".

### 6.2 What today's sessions do NOT test (these stay ASSUMPTIONS)
C6, F5, F6, F7, F3b, the emotional-curve scores, a live scan, and how people react to **their own** profile (MoT 2 "my skin"; F1 "contradicts my belief"). B-rows are background only. Any pitch use reads "observed in N of M sessions (small convenience sample, [location])", never as a statistic.

---

*Sources: `/home/aman/youcam/research/evidence.md` and `/home/aman/youcam/research/skinkey_report.md`. Anything not tagged [E#] or a report section is a team ASSUMPTION to validate.*
