# SkinKey: Assumptions Map (riskiest assumptions, scored, with tests you can run today)

*Prepared 2026-11-01 for the interview and share-flow window (3–5 sessions of about 10 minutes, next 1–2 hours). Hackathon deadline: 2026-11-02 11:45 AM ET (E).*
*Evidence sources: `/home/aman/youcam/research/evidence.md` (**E**) and `/home/aman/youcam/research/skinkey_report.md` (**R**). Every number below comes from one of those files and names its source. Anything not evidenced there is labelled **ASSUMPTION (to validate)**.*

**How to use this document**
- **Facilitator and note-taker:** you only need **Section 4** (facilitator card, script, observation sheet). Print it or keep it open on a second phone.
- **Build lead:** run the **Section 3A team checks** in parallel with the sessions. Several of them are the R §5 hour-0–1 go/no-go gate.
- **Whole team:** Sections 1–2 explain why each test exists. Section 5 says what to change afterwards.

---

## 0. Read this first

- **The target segment is a hypothesis.** "Urban 20–35 India shoppers on Amazon.in / Flipkart / Nykaa who follow skinfluencers and are confused by actives" is the segment named in the brief. It is not a research finding. ASSUMPTION (to validate).
- **The proto-personas (Section 0.1) are hypotheses, not research findings.** None has been validated.
- **3–5 sessions give direction, not proof.** All pass/fail thresholds are **decision rules the team set**. They are not research benchmarks. "Pass" means "keep building as planned". "Fail" means "change the design or the pitch before the demo". With fewer than 3 sessions, report anecdotes only and score nothing.
- **No statistic in this kit is Indian data.** E gives no India geography for any survey or study cited here: CeraVe/OnePoll 2021, Labskin 2022, Google 2022, Benchmarking Co. 2026, Tan, Chandukala & Reddy 2022, Wen et al. 2022, Daneshjou 2022. Several are vendor surveys (E labels them "vendor"). Never present them as describing Indian shoppers.
- **US vs India rules.** The legal guardrails in E (BIPA, FDA intended-use) are US rules. We use them only as design benchmarks. Indian cosmetic, drug and data-protection rules are not in our files. ASSUMPTION (to validate).
- **Internal panel opinions are not evidence.** R §3 contains scores and comments from our own four-judge review panel (not the hackathon's judges, not users). Where this document mentions them, they are labelled "internal review panel (R §3), opinion" and do not count toward any evidence score.
- **Known tension.** E (Risks) says skin AI should "show confidence/limits, avoid verdict-like scores". SkinKey's main output is a verdict (FITS / CAUTION / UNKNOWN). We keep it, but U2, U3 and Eth3 test whether the verdict reads as more certain than it is.

### 0.1 Proto-personas (HYPOTHESES, not findings)

Use these only to plan recruitment. Do not quote them as research.

| ID | Hypothesis persona | Why we include them |
|---|---|---|
| PP-A | 20s, follows skinfluencer reels, buys serums and sunscreen on Nykaa and Amazon, unsure what niacinamide or retinol does for *their* skin | Closest to the brief's segment |
| PP-B | Man who buys face wash, sunscreen, moisturiser or beard/shaving care on Flipkart or Amazon and doesn't call it "skincare" | The product is gender-neutral. E notes men are almost absent among competitor hackathon repos ("men (1)"), which is about competitors, not about users |
| PP-C | Budget-limited student or early-career shopper with a medium-deep or deep skin tone, picks by price and reviews | Tests the price side of "Find better matches" and the fairness guardrail |

All three: ASSUMPTION (to validate).

### 0.2 How the scores work

| Score | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| **Importance (I)** | Nice to have | Minor polish | Hurts the demo or pitch; a reasonable workaround exists | Main demo badly weakened; workaround is clumsy | Core thesis or main demo dies if false |
| **Evidence (E)** | Nothing, our opinion, or an internal-panel prediction | Indirect only: vendor surveys, unstated geography, research on a neighbouring question, or a technical check that doesn't answer the actual question | Technically verified for this exact question | Observed with target users once | Observed with target users more than once |

**Risk = I × (6 − E)**, max 25. Higher means riskier. **Tie-break:** among equal risk, higher Importance goes first. Guardrails (Eth2, Eth3) are excluded from leap-of-faith picks because they ship regardless (see note under the map).

**One exception, stated openly:** U1 scores I=5 even though a workaround exists (paste a link). The paste workaround turns "check from any store app" into a manual lookup, which removes the wedge, so we treat it as core.

---

## 1. The map (21 assumptions)

| # | Area | Assumption (we believe that…) | I | E | Risk | What we have now (source) | Leap of faith |
|---|---|---|---|---|---|---|---|
| F1 | Feasibility | Sharing from the **Amazon.in and Flipkart apps** delivers a usable **product title**, not just a short link | 5 | 1 | **25** | Android share target and `expo-share-intent` `meta.title` on Android VERIFIED. Actual payload content UNVERIFIED; whether each app uses the normal Android share menu at all UNVERIFIED (R §1A). | **#1** |
| U1 | Usability | Shoppers will think to tap **Share → SkinKey** inside a store app and find it in the share sheet | 5 | 1 | **25** | None. Only the technical mechanism is verified (R §1A). | **#2** |
| D3 | Desirability | "One measured profile that checks *this* product from *any* store" is wanted **over** the store-native tools | 5 | 1 | **25** | Flipkart has a ModiFace selfie Skin Analyser (since about Dec 2023); Amazon.in has a quiz SkinCare Analyzer. Whether either is still live in 2026 UNVERIFIED (R, intro). No user preference data. | **#3** |
| D1 | Desirability | At the moment of browsing, shoppers want a **per-product verdict**, not only a routine or a recommendations list | 5 | 2 | **20** | Indirect only. 70% don't know their skin type, 80% don't know ingredients (CeraVe/OnePoll 2021, vendor) (E). Per E's summary of Tan, Chandukala & Reddy 2022 (J. Marketing): AR try-on raises sales, **overall effect small**, larger for new-to-channel/category customers, and works by reducing product uncertainty. That study is about AR try-on, not verdicts. | **#4** |
| D2 | Desirability | Shoppers will **take a selfie** and let a third-party AI analyse it to build the profile | 5 | 2 | **20** | Indirect. Flipkart's selfie analyser exists (R). R cites a CXOToday article on its adoption; no figures are in our files. That tool runs inside a store app; whether users trust a store app more than a new third-party app is ASSUMPTION (to validate). | **#5** |
| Eth2 | Ethics (guardrail) | Users see SkinKey as **cosmetic shopping guidance, not diagnosis**, and accept the **medicine gate** ("This looks like a medicine. Ask the pharmacist.") | 5 | 2 | 20 | US FDA intended-use: "treat acne" claims make a product a drug (E). Gate ingredient list in R §2. Indian equivalent: ASSUMPTION (to validate). User reading: none. | Guardrail* |
| Eth3 | Ethics (guardrail) | Skin Analysis bands are accurate enough on **deeper skin tones, facial hair, and in café/office light** that verdicts don't mislead some users more than others | 5 | 2 | 20 | Indirect, leaning against: only 2.1% of open skin-lesion images record Fitzpatrick type (Wen et al., Lancet Digital Health 2022); derm AI is limited on dark skin (Daneshjou, Science Advances 2022) (E). Neither studied cosmetic oiliness/moisture analysis or YouCam, so this is a related risk, not a measured YouCam failure. Perfect Corp skin AI ICC>0.90 is vendor-reported, no n (E). Facial hair: not covered in E or R, ASSUMPTION (to validate). Tension with E's "avoid verdict-like scores". | Guardrail* |
| U2 | Usability | Users read **FITS / CAUTION / UNKNOWN** correctly: UNKNOWN is not "bad", CAUTION is not "dangerous", FITS is not a guarantee | 4 | 1 | 20 | None. E (Risks) warns against verdict-like scores; this test checks whether ours over-claim. | |
| U3 | Usability | **Score bands** ("Oiliness: high, scan 1 Nov"), the source line ("Measured by YouCam") and the **fairness note** are understood and don't reduce trust unfairly | 4 | 1 | 20 | None from users. Bands-not-numbers and the fairness note ("can be less accurate on deeper skin tones and in poor light") come from R §2 Guardrails. E (Risks) adds "show confidence/limits". | |
| D5 | Desirability | **"Find better matches"** (Flipkart search pre-filtered to skin type) is useful and the results fit the shopper's budget | 4 | 1 | 20 | Filter URL works on Flipkart web (R §1B). Internal review panel (R §3), opinion: called the "filter you'd never set yourself" moment the sharpest idea. Not counted as evidence. Price fit: none. | |
| D4 | Desirability | Target users are actually **unsure** of their skin type, so a *measured* profile adds something | 4 | 2 | 16 | 63% wrong about skin type (Labskin 2022, vendor). 70% don't know skin type (CeraVe/OnePoll 2021, vendor). Geography not stated (E). | |
| D6 | Desirability | Target users are **confused by actives** (niacinamide, retinol, AHA/BHA, SPF) and understand verdict reasons that name them | 4 | 2 | 16 | 80% don't know ingredients (CeraVe/OnePoll 2021, vendor, geography not stated) (E). Nothing on our segment or on our reason wording. | |
| F3 | Feasibility | Products users actually share hit our 12–15-product catalogue or the title-keyword fallback often enough that verdicts aren't mostly UNKNOWN | 4 | 2 | 16 | Technical facts lean against: catalogue cut to 12–15 products (R §4); Open Beauty Facts has 348 India-tagged products with complete ingredients (our own query, R §2); no ingredients field in the Amazon Creators API or Flipkart affiliate API (R §1). Internal review panel (R §3), opinion, not counted: predicted most real shares would come back title-only or UNKNOWN. | |
| Eth1 | Ethics | Users **understand and believe** "What we keep" (no photo; deleted from YouCam via `task/delete`; about 10 numbers on the phone), so consent is informed | 4 | 2 | 16 | `task/delete` removing input and output files VERIFIED (R §2). E: YouCam keeps results 24h unless deleted. User understanding: none. | |
| F5 | Feasibility | Sharing from the **Nykaa app** also delivers a usable title | 3 | 1 | 15 | Not covered anywhere in R. Only the Nykaa keyword search URL is partly VERIFIED (R §1B). UNVERIFIED. | |
| F4 | Feasibility | YouCam `skin_type` (or our oiliness + moisture rule) maps cleanly to Flipkart's values (Oily / Dry / Combination / All Skin Types) | 3 | 1 | 15 | `skin_type` output values not in the docs (UNVERIFIED). Facet values seen on Flipkart web (R §1B, §2). | |
| V1 | Viability | Affiliate revenue via **our own web fallback page** is reachable, and disclosing it doesn't hurt trust | 3 | 1 | 15 | No affiliate links in the app without separate Amazon Associates India approval for apps (policy rule 7, agreement rule 21) (R §1). Flipkart affiliate sign-ups reportedly paused since 2018 (UNVERIFIED, R). The web fallback needs Android App Links, a stretch goal that is cut first (R §4, §5), and is "our own design, not documented Expo behaviour" (R §1C). Whether routing in-app taps through our page to add tags is allowed: ASSUMPTION (to validate). Internal review panel (R §3), opinion: "no revenue path". | |
| V2 | Viability | Retailers or brands would value, partner with, or tolerate a cross-store verdict layer | 3 | 1 | 15 | None. ASSUMPTION (to validate). Not testable with shoppers today. | |
| P1 | Positioning | **Gender-neutral** framing works: men who buy face wash, sunscreen or beard care see SkinKey as for them | 3 | 1 | 15 | None from users. ASSUMPTION (to validate). | |
| P2 | Positioning | **English-only UI** is enough for this urban segment | 3 | 1 | 15 | None. ASSUMPTION (to validate). | |
| F2 | Feasibility | The **Flipkart app** (not just the website) keeps the skin-type filter when it opens our URL | 3 | 2 | 12 | Web filter URL VERIFIED (HTTP 200, `facets.skin_type[]` applied). App behaviour UNVERIFIED. Fallback: Chrome Custom Tab (R §1B, §4). | |

\* **Why Eth2 and Eth3 are not leap-of-faith picks.** They are constraints, not bets. The medicine gate, cosmetic-only wording, bands instead of numbers and the fairness note stay in **whatever** the tests show. Today's tests only tell us whether the copy works.

**Why D1 and D2 beat D5, U2 and U3 (all 20).** Tie-break by Importance: D1 and D2 are I=5. Also, a U2/U3 failure can be fixed with copy before the demo; a D1/D2 failure can't. U2 is still a must-ask in every session.

**Parked (low importance for this demo, not mapped):** Skin Forecast, Aisle Check in-store use, pharmacist QR uptake, tinted-product makeup VTO preview. Related shade evidence, if it comes up (E's paraphrases, not quotes; geography not stated): over 60% of online beauty shoppers skipped a purchase over shade (Google 2022, vendor); 41% of women struggle to find a complexion shade, 56% for darker tones (Benchmarking Co. 2026, **women-only sample**, do not generalise to all shoppers).

---

## 2. Top 5 leap-of-faith assumptions

### LoF #1: F1. The share payload contains the product title
- **Team check (5 min, no build needed, Section 3A):** on 2–3 different phones, open a product in **Amazon.in**, **Flipkart** and (for F5) **Nykaa**. Tap Share → **Copy** (or "message yourself" on WhatsApp, or Google Keep). Paste and read the text.
- **With the dev build:** share into it and log `text`, `webUrl`, `meta.title` (R §5, hour 0–1 test). Copied text may differ from what a share target receives: ASSUMPTION (to validate); confirm with the build.
- **Pass (per app):** at least 2 of 3 shares contain readable product-name text (brand plus product).
- **Fail:** link only (`amzn.in/d/...`, `dl.flipkart.com/s/...`), or the app doesn't use the Android share menu.
- **If it fails:** make the editable "Is this the product?" field the main path (R §1A). Amazon: per R §4, show Amazon only if the hour-1 test passes. If the Amazon app doesn't use the Android share menu at all, drop Amazon share from the demo. If a link or text does arrive but no title, the title-only/UNKNOWN case from the R §5 video plan can be shown. If Flipkart share-in fails completely, R §5 says decide right away: "paste link + barcode", or switch to C6 (the backup concept, Silver Mirror, R §3).

### LoF #2: U1. Shoppers find Share → SkinKey on their own
- **Session task (90 s, before any pitch or screenshots):** hand over the facilitator's phone with the Flipkart app open on a **sunscreen** product page. Say: *"Imagine you have an app that checks products against your skin. You want it to check this one. Show me what you'd do."* Don't say "share". The note-taker times it quietly; no visible timer.
- **Hint rule:** if they're stuck at 60 seconds, say once: *"Where would you go to send this to another app?"* Mark the result **assisted**.
- **Pass:** a majority (2 of 3, 3 of 4, 3 of 5) reach Share → SkinKey unassisted within 60 seconds. No build installed: a majority tap Share first.
- **Fail:** a majority look for a button inside Flipkart, go to the home screen, give up, or need the hint.
- **Limits, record them:** the task is primed (the prompt says an app exists). It runs on the facilitator's phone, so share-sheet order and the Flipkart app may be unfamiliar. Note each participant's usual store and Android vs iPhone next to the result.
- **If it fails:** add a first-run coach mark ("In Flipkart, tap Share → SkinKey") and make **paste link** equal to Share on the home screen.

### LoF #3: D3. Cross-store profile beats the store-native tools
- **Team check first (Section 3A):** screenshot the Flipkart Skin Analyser and the Amazon SkinCare Analyzer and confirm they still exist (R §5).
- **Session, behaviour first (must-ask, no pitch yet):**
  1. *"In the last month, did you look at the same skincare product on more than one app or site? Which ones? What happened?"*
  2. *"Have you seen any skin tool inside a shopping app?"* (unaided, no screenshots)
- **IF-TIME, afterwards:** show the store-tool screenshots. Ask *"Have you used either? What did you think?"* Treat any opinion as colour only.
- **Pass:** a majority describe a **real, recent** multi-store moment. (Stated preference doesn't count toward the pass.)
- **Fail:** a majority buy from one store only and describe no comparing.
- **If it fails:** cut "any store" from the pitch and lead with "checks *this exact product* against a measured profile". Per R, neither store tool checks the product you're viewing: UNVERIFIED until the team screenshots confirm it.

### LoF #4: D1. They want a per-product verdict
- **Session:**
  1. Past behaviour: *"Think of the last skincare product you bought online. How did you decide it suited your skin? Were you unsure at any point?"* Code: influencer, reviews, friend, ingredient search, dermatologist, guess.
  2. After the U2 cards, toss a coin to pick the **FITS or CAUTION** card. Say: *"Imagine your scan had said this, at that moment."* Ask: *"What, if anything, would you have done differently?"*
  3. Show three plain options in random order: **(a)** a check of this exact product against your skin, **(b)** a daily routine, **(c)** a list of recommended products. Ask: *"At that moment, which would have helped most, if any?"*
- **Pass:** a majority recall a **real** moment of being unsure about suitability **and** a majority pick (a). Answers to step 2 are hypothetical and count only as colour.
- **Fail:** most recall no uncertainty, or most pick (b) or (c).
- **If it fails:** move the verdict lower and lead with "Find better matches" (if D5 passes) or the routine view.

### LoF #5: D2. They'll scan their face
- **Participants do not scan during the 10-minute session.** They see a mock consent screen. A real scan is an optional extra after the session (Section 4.4), with its own consent.
- **Session:**
  1. First: *"What would you want to know before letting an app scan your face for skin analysis?"* Write down every question verbatim.
  2. Show the mock consent and "What we keep" screens. Say: *"Doing it or skipping it are equally useful to us."*
  3. Hand them the **private tick card** (paper, folded): *Scan now / Maybe later / No*. They tick it without showing you.
- **Pass:** a majority tick **Scan now**, or complete the optional scan. A spoken yes alone is weak and doesn't count.
- **Fail:** a majority tick **No**, or ask for things we can't promise.
- **The exact questions and refusal reasons become our privacy copy.**
- **If it fails:** offer a no-selfie start (pick skin type manually, labelled "self-reported, not measured") and make the scan an optional upgrade.

---

## 3. Tests for the other assumptions

**Threshold words used below** (team decision rules): **majority** = 2 of 3, 3 of 4, 3 of 5. **Nearly all** = 3 of 3, 3 of 4, 4 of 5. **Any one** = a single participant, whatever n is.

### 3A. Team checks (build lead, in parallel with sessions; no participants)

| # | Check | Pass | Fail → action |
|---|---|---|---|
| F1 / F5 | Copy-paste share check on 2–3 phones for Amazon.in, Flipkart, Nykaa; then dev-build log of `text`, `webUrl`, `meta.title` (R §5) | See LoF #1 | See LoF #1. Nykaa fails → keep Nykaa as a keyword link-out only (R §1B) and tell participants who mainly use Nykaa to paste a link |
| F2 | On a phone with Flipkart installed, tap the filter URL, or `adb shell am start -a android.intent.action.VIEW -d '<url>'` (R §4) | The app opens with the "Oily Skin" filter visible | Filter dropped → Chrome Custom Tab and show "Flipkart, already filtered" on screen (R §4) |
| F4 | One real Skin Analysis call; read `skin_type` in the raw output (R §5 step 4) | Value maps to Oily / Dry / Combination | No usable value → oiliness + moisture rule, written in the README (R §2) |
| Eth1 (tech) | Run `task/delete` after that call (R §5 step 4) and confirm a success response | Success response | Don't offer participant scans; fix first |
| Eth3 | Scan one team member twice in the venue's lighting; compare bands. If a team member with facial hair, or with a deeper skin tone, volunteers, scan them too and note it. **Sanity check only, not a fairness validation.** Budget: each scan costs 9–22 units (E); R's red team read 9 units for 1–4 concerns and 12 for 5–7 (not re-checked, R §2). Agree a maximum number of scans before starting. | No band moves more than one level between the two scans (team rule) | Unstable → strengthen the fairness note, push borderline bands to UNKNOWN, say so in the README |
| D3 | Screenshot both store tools (R §5 step 5) | Both found | Tool gone → update the pitch and README comparison table |
| V1 | Re-read the Amazon Associates India app rules (policy rule 7, agreement rule 21, R §1 links) | — | Record what is and isn't allowed; until approval, **no affiliate tags anywhere in the app** |
| Kit | Cached demo profile loaded (R §5 must-have) so stimuli never wait on YouCam | Works offline | Use static mock screens only |

### 3B. Participant tests (beyond the top 5)

| # | When | Cheapest test | Pass | Fail → action |
|---|---|---|---|---|
| U2 | Must-ask | Show the three mock cards one at a time (UNKNOWN, then FITS and CAUTION in random order). For each: *"In your words, what is this card telling you? What would you do?"* | Nearly all explain UNKNOWN as "not enough info". **Nobody** reads CAUTION as "harmful" or "allergy". **Nobody** reads FITS as a guarantee. | Any misread of CAUTION or FITS, or more than one of UNKNOWN → rename or add a subtitle (e.g. "UNKNOWN: we don't have this product's ingredients yet"); soften FITS wording (E: avoid verdict-like scores) |
| Eth2 | Must-ask | Show the medicine-gate card (e.g. an adapalene product). First: *"In your words, what is this card saying about you?"* Then: *"Does it tell you anything about your health?"* Then: *"What would you do next?"* | **Nobody** says it diagnosed a condition. A majority find the gate reasonable and name a next step. | **Any one** "it says I have acne" → rewrite the copy before the demo (strict on purpose). No next step ("no pharmacist to ask online") → add a plain next step to the gate card; copy must stay cosmetic-only (R §2) |
| Eth1 | Must-ask | After the mock consent and "What we keep" screens: *"What happens to the selfie after the scan?"* | Nearly all say roughly "not kept, just some levels" | More than one thinks the photo is stored, or shared with Flipkart or Amazon → rewrite "What we keep" in plainer words |
| D4 | Must-ask | *"What's your skin type? How do you know?"* | A majority are unsure, or rely on a guess or quiz | Nearly all are confident from a dermatologist → lead with product checking, not the measurement |
| D6 | Must-ask (skip if late) | *"Which of these have you heard of: niacinamide, retinol, AHA/BHA, SPF? Do you know which suit your skin?"* Then on the CAUTION card, point at the reason naming an active: *"What does this line mean to you?"* | A majority are unsure which actives suit them **and** understand the reason line | Most know their actives → don't pitch "confused by actives"; reason line misread → rewrite it in plain words |
| D5 | Must-ask (skip if late) | Open the bookmarked filtered Flipkart URL on the phone. *"What is this page showing you? Would you pick something from this list?"* Then: *"What did you pay for your last product? Would you look at cheaper or pricier options?"* | A majority understand it's filtered for skin type and say they'd pick from it | Not understood → add a label on our side before opening ("Opening Flipkart, filtered to Oily Skin"). Budget mismatch → try adding a price/discount filter: R §1 says Flipkart accepts discount filters, but the exact URL syntax is UNVERIFIED |
| F3 | Must-ask (names only) | Note-taker writes down the last 2 products each participant bought or considered. **The team checks them after the session**, not live. | At least 3 in 10 named products are in the catalogue **or** have an active-ingredient keyword in the title that the fallback can match (labelled "based on product name only", R §2) (team rule) | Below that → add the named products tonight if time allows; keep one honest UNKNOWN in the video (R §4) |
| P1 | Recruitment | Soft quota: at least 1 man (Section 4.1). Note whether the screener wording caught him and whether he saw the app as for him (from the close question) | At least 1 man recruited and he doesn't say "this is for women" | Rework onboarding copy and example products to be gender-neutral |
| P2 | Throughout | Note-taker marks any term they asked to have explained or any language switch | No more than one participant stuck on English UI terms | List the terms; simplify UI copy |
| U3 | IF-TIME | Show the profile screen with bands, source line and the fairness note. *"What does 'oiliness: high' mean? How sure is the app? What does this note [fairness] tell you?"* | A majority explain the band and link it to the verdict reason; nobody says the note makes the whole app useless | Many ask "high compared to what?" → one-line explainer per band. Note read as "useless for me" → reword it, keep it (R §2 guardrail) |
| V1 | IF-TIME | Show two versions of the same FITS card, in random order, one with "SkinKey may earn a commission from store links". **Say first: "This is test wording; the app earns nothing today."** Ask: *"Which of these would you act on, or no difference?"* | A majority say no difference or pick the disclosed one. **Weak evidence**: people tend to say disclosures don't affect them | A majority prefer the undisclosed card → keep the disclosure wording on any future web fallback page and rewrite it. Either way: **no affiliate tags in the app**; tags only ever on our own web fallback page, only after Amazon approval (R §1); routing in-app taps through that page is ASSUMPTION (to validate) |
| V2 | Not in sessions | Can't be tested with shoppers today | — | Keep as ASSUMPTION (to validate) in the pitch. Don't claim retailer interest. |

---

## 4. Facilitator kit (phone, English, café / college / office)

### 4.1 Before session 1: checklist

**Recruit (3–5 people)**
- Approach people in a café, college or office who look 20–35. Use the screener (4.3). Don't pick only friends.
- **Soft quota (team decision rule, ASSUMPTION-based):** at least 1 man, at least 1 person who would describe their skin as medium-deep or deep (you'll only know from the optional closing question; if you don't get one, say so in the results), a spread of budgets, and a spread of main store (Amazon / Flipkart / Nykaa).
- Record each participant's relationship to the team (friend / classmate / colleague / stranger).
- If you offer a thank-you, offer the same one to everyone (none is specified in our files).
- If possible, the facilitator should be a team member who didn't design the screens.

**Stimuli: one offline PDF or slide deck, in this order** (never browse your photo gallery in front of participants)
1. Mock consent screen + "What we keep" screen
2. Three verdict cards for a sample sunscreen: UNKNOWN, FITS, CAUTION (CAUTION includes one reason naming an active, e.g. "Your oiliness reading: high (scan 1 Nov)" plus the source line and "cosmetic guidance, not medical advice")
3. Three-option card: (a) check this product, (b) daily routine, (c) recommended products
4. Medicine-gate card (adapalene product)
5. IF-TIME: store-tool screenshots (from the team check), profile/bands screen with fairness note, FITS card with and without the commission line

**Also ready**
- One Android phone with Amazon.in and Flipkart installed, the Flipkart app open on a **sunscreen** product page, the filtered Flipkart URL bookmarked, and the dev build installed if ready.
- Paper: private tick cards (*Scan now / Maybe later / No*), one observation sheet per participant (4.5), a coin.
- Cached demo profile loaded (if the build is ready).

### 4.2 Facilitator card (keep this in front of you)

- **Don't help, don't sell, don't give skincare advice.** If asked "is this good for my skin?", say *"I'm not able to advise, sorry. What do you think?"*
- **Neutral probes only:** *"What are you looking for?"*, *"What would you expect to happen?"*, *"Tell me more."*, *"Why?"* Never *"Would you like…?"* or *"Isn't it useful that…?"*
- **If they ask "what do I do?"** during the share task: *"Whatever you'd normally do."* At 60 seconds, one hint (LoF #2), then mark **assisted**.
- **Other languages are fine.** If they answer in Hindi or another language, the note-taker writes their original words plus a translation.
- **No photos, no recordings** of participants, ever.
- **If someone is uncomfortable, stop.** Thank them; nothing is lost.
- **C6** means the team's backup concept, Silver Mirror (R §3). Don't mention it to participants.

### 4.3 The 10-minute script (MUST-ASK)

Running late? Skip, in this order: **D5**, then **D6**. Never skip U1, U2, Eth2, D2/Eth1, D1/D4.

| Min | Say / do | Tests |
|---|---|---|
| 0:00 | *"We're students testing an app idea for a hackathon, not testing you. About 10 minutes, written notes only, no photos or recordings of you. You can skip anything or stop any time. At the end there's an optional extra you can skip. Are you 18 or over? OK to continue?"* | — |
| 0:30 | Screener: *"In the last 3 months, have you bought face wash, sunscreen, moisturiser, serum, or shaving or beard care on Amazon, Flipkart or Nykaa? Which app most? Is your phone Android or iPhone?"* | segment (hypothesis), P1 |
| 1:00 | *"Last one you bought online: what was it, what did you pay, how did you decide it suited your skin? Were you unsure at any point?"* *"What's your skin type, and how do you know?"* *"Name another product you considered."* | D1, D4, F3 |
| 2:00 | *"In the last month, did you look at the same product on more than one app or site?"* *"Have you seen any skin tool inside a shopping app?"* *"Have you heard of niacinamide, retinol, AHA/BHA, SPF? Do you know which suit you?"* | D3, D6 |
| 3:00 | **Share task** (no pitch before this). Hand over the phone on the sunscreen page; read the LoF #2 prompt; note-taker times quietly. | U1 (F1 only if on their own phone) |
| 4:30 | *"What would you want to know before letting an app scan your face?"* Show consent + "What we keep". *"What happens to the selfie after the scan?"* Hand over the private tick card. | D2, Eth1 |
| 6:00 | Three verdict cards, one at a time: *"In your words, what is this telling you? What would you do?"* Coin toss → FITS or CAUTION: *"Imagine your scan had said this…"* Three-option card. Point at the active-ingredient reason line. | U2, D1, D6 |
| 7:30 | Medicine-gate card: open question → health question → *"What would you do next?"* | Eth2 |
| 8:15 | Open the filtered Flipkart link: *"What is this page showing you? Would you pick from this list? Cheaper or pricier?"* | D5 |
| 9:00 | *"What would stop you using something like this?"* Optional, asked last: *"If you'd like to say, how would you describe your skin tone: light, medium, deep, or prefer not to say? And your gender, or prefer not to say?"* (Used only to check our recruitment mix; never linked to any scan.) *"May we quote your words, without your name, in our project write-up?"* Thank them. | P1, recruitment mix, quote permission |

### 4.4 Optional extras (only if they offer more time)

**IF-TIME (2–3 min):** store-tool screenshots (D3), profile/bands + fairness note (U3), commission-line cards (V1, say "test wording" first).

**Optional real scan (3–5 min), only if ALL are true:** the build is ready, the team check showed `task/delete` succeeds, the unit budget allows it, and the team has confirmed the proxy stores no images (ASSUMPTION (to validate) until checked). Read this **separate scan consent** aloud and ask for a clear yes:

> *"This optional scan sends a photo of your face through our small server to YouCam, run by Perfect Corp, for skin analysis. SkinKey keeps no photo, only about 10 skin levels on this phone. Right after the results come back, we ask YouCam to delete the photo and results. If that deletion failed, YouCam would hold the results for up to 24 hours. We don't link it to your name. You can skip, and skipping is just as useful to us."*

- Capture tips (E): face fills more than 60% of the frame width, front-facing, even light. If the scan fails or takes too long (processing time is not in our files: ASSUMPTION), stop and thank them; don't retry more than once.
- **After the scan, check on screen:** the app (or the build lead watching the proxy log) shows that the `task/delete` call returned success. Say honestly that this is our side's confirmation; we can't inspect YouCam's servers. Then ask: *"Does that match what you expected? Agree, partly, or disagree with the oiliness and moisture levels?"* Record only the answer. **No skin-tone analysis at this sample size.**

**Reset between participants (mandatory, every time):**
1. In SkinKey: Profile → Delete (or clear app data). Confirm the profile screen is empty.
2. If a scan ran: confirm the `task/delete` success was recorded.
3. Reload the cached demo profile only if stimuli need it.
4. Clear the clipboard, close extra store-app pages, return Flipkart to the sunscreen page.
5. New observation sheet.

### 4.5 Observation sheet (one per participant; circle codes, don't interpret)

**Header:** P# · time · venue · relationship (friend / classmate / colleague / stranger) · main store (A / F / N / other) · phone (Android / iPhone) · phone used for share task (facilitator's / own) · language (English / mixed / other)

| Test | What to record (codes) |
|---|---|
| U1 | First action: **S** tapped Share · **I** looked inside store app · **H** went to home screen · **G** gave up. Seconds to reach SkinKey: ___ · **Assisted** Y/N · (always primed) |
| D1 | Unsure moment recalled Y/N · how decided: **I** influencer · **R** reviews · **F** friend · **G** ingredient search · **D** dermatologist · **X** guess · **O** other · option picked: a / b / c / none |
| D4 | Skin type said: ___ · source: **D** / **Q** quiz / **X** guess / **I** influencer / **O** · unsure Y/N |
| D3 | Multi-store in last month Y/N, which: ___ · saw skin tool in a shopping app (unaided) Y/N, which: ___ |
| D6 | Heard of: niacinamide / retinol / AHA-BHA / SPF · knows which suit them Y/N · reason line understood Y/N |
| D2 | Questions before scan (verbatim): ___ · tick card: Scan now / Maybe later / No · optional scan: done / declined / not offered |
| Eth1 | **K** not kept · **S** SkinKey stores it · **R** shared with a store · **U** unsure |
| U2 | UNKNOWN = "not enough info" Y/N · CAUTION read as harmful/allergy Y/N · FITS read as guarantee Y/N |
| Eth2 | Read as diagnosis Y/N · gate reasonable Y/N · next step (verbatim): ___ |
| D5 | Understood filter Y/N · would pick from list Y/N · price paid: ___ · cheaper / pricier / same |
| F3 | Product names: 1 ___ 2 ___ (team checks later) |
| P2 | Terms they asked about / language switch: ___ |
| Close | What would stop them (verbatim): ___ · optional skin tone / gender: ___ · **quote permission Y/N** |
| Quotes | Exact words, with the test code next to each |

**Pass/Fail is scored together after the last session, not during.**

---

## 5. After the sessions: synthesis and decisions

**Who and when:** the note-taker tallies the sheets within 15 minutes of the last session. Facilitator + build lead make the go/no-go call straight after. The share-in go/no-go (F1/F2/F4) belongs to the R §5 hour-0–1 gate and is decided there, by the build lead, not delayed for interviews.

| Result | Action before the demo |
|---|---|
| F1 fails on both apps | Lead with paste-link + editable title. If Flipkart share-in fails completely, decide right away: "paste link + barcode", or switch to C6, the backup concept Silver Mirror (R §5). |
| F1 passes on Flipkart only | Flipkart is the main demo. Amazon: if the Amazon app doesn't use the Android share menu, drop Amazon share from the demo; if a link or text arrives without a title, show the title-only/UNKNOWN case (R §5 video plan). Per R §4, show Amazon only if the hour-1 test passes. |
| **F1 Flipkart-only AND D3 fails** | The wedge collapses: SkinKey becomes a Flipkart-only checker competing head-on with Flipkart's own analyser. Hold the pre-agreed discussion: reframe as "checks this exact product", or switch to C6. R §3 has C6 at 29.00 vs SkinKey 28.00 from the internal panel, and R says a 1-point gap is noise, so the call rests on today's evidence. |
| Most participants mainly use Nykaa and F5 fails | Say in the pitch that share-in is tested on Flipkart (and Amazon if it passed); offer Nykaa users paste-link; Nykaa link-out stays keyword-only (R §1B). |
| U1 fails | Coach mark plus an equal-weight paste-link entry. Show the share step explicitly in the video. |
| D3 fails | Rewrite the pitch around "checks this exact product" rather than "any store". |
| D1 fails | Move the verdict lower; lead with "Find better matches" (if D5 passed) or the routine view. |
| D2 fails | Add a self-reported start ("self-reported, not measured") alongside the scan; use the recorded questions as privacy copy. |
| D5 fails | Label the link-out before opening; try a price/discount filter (syntax UNVERIFIED). |
| D4 / D6 fail | Drop "you don't know your skin type / actives" framing; lead with checking this exact product. |
| U2 or Eth2: any misread | Fix the copy first. Non-negotiable. |
| U3 fails | Add band explainers; reword (never remove) the fairness note. |
| Eth1 fails | Rewrite "What we keep" in plainer words before the demo. |
| F3 below rule | Add the named products tonight if time allows; keep one honest UNKNOWN in the video. |
| V1 (any result) | No affiliate tags in the app. Any future tags go only on our own web fallback page after Amazon approval; routing is ASSUMPTION (to validate). |
| Quotes collected | README use **only with quote permission (Y on the sheet)**, labelled "n=X informal sessions, 2026-11-01". Never round them into percentages. |

**Sources:** `/home/aman/youcam/research/evidence.md`, `/home/aman/youcam/research/skinkey_report.md`, and the primary links inside those files. Anything not traced to them in this document is an ASSUMPTION (to validate).
