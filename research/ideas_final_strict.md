# YouCam Hackathon Strategy Report: Concept Ranking and Top-3 Recommendations

Sources: `/home/aman/youcam/research/evidence.md` and `/home/aman/youcam/research/competitor_repos.tsv`. I re-ran the keyword greps today (2026-11-01) and fetched the rate-limit doc myself; those results are marked "verified today" below.

Note: `competitor_repos.tsv` has **356 lines**, not ~245. A few are pre-hackathon noise (for example, 2021–2022 repos). Novelty claims below are based on greps of the full file.

---

## 1. Scoring

### 1a. All concepts (ranked by average of the 4 equally weighted judging criteria)

| Rank | ID | Name | Avg score |
|---|---|---|---|
| 1 | C5 | DropLive: "on me" second screen for live-shopping viewers | **29.00** |
| 2 | C6 | Silver Mirror: large-type beauty fitting room for shoppers 55+ | **28.75** |
| 3 | C3 | Counter: beauty-advisor phone that hands off results and wipes itself | **28.25** |
| 4 | C10 | Lineup: first grooming kit for men from measured hair and face | 27.25 |
| 5 | C1 | ShadePass: gift a shade without seeing their face | 26.75 |
| 6 | C7 | SeatedFit: try-on for wheelchair users with a seated-reliability label | 26.00 |
| 7 | C2 | GiftPass: try a gift on someone else, with revocable consent | 25.25 |
| 8 | C4 | LiveSwatch: shade-range cards and claim linting for phone live sellers | 23.50 |
| 9 | C11 | AisleCheck: pharmacy beauty-aisle consult with pharmacist gate | 22.50 |
| 10 | C9 | Polish Pocket: scan a bottle, Nail VTO on your own hand | 22.00 |
| 11 | C12 | SwapDesk: returns-counter exchange tool for associates | 21.75 |
| 12 | C8 | FirstShelf: teen skincare co-sign with parent consent | 21.25 |

### 1b. Top 5 with red-team verdict (advisory columns do NOT change the order)

| Rank | ID | Avg (ranking basis) | Red-team: survives? | Fatal flaws | Red-team delta (advisory) | Avg + delta (advisory only) | Feasibility in 16h (advisory) | API depth (advisory) | Most damaging red-team point |
|---|---|---|---|---|---|---|---|---|---|
| 1 | C5 DropLive | 29.00 | Yes | None | −4 | 25.0 | Low–Med (2 roles, realtime, proxy, 3 devices on camera) | Moderate: Color Tones + repeated Makeup/Earring/cloth-v4, no chaining | "Pre-rendered lookbook plus a push"; scale capped by rate limit; "best for you" ranking |
| 2 | C6 Silver Mirror | 28.75 | Yes | None | −4 | 24.75 | High (single user, single device) | Good: HD Skin Analysis masks/ui_scores drive Makeup VTO parameters | Spot-concealer placement and foundation "satin" may not be renderable, so the side-by-side may look subtle |
| 3 | C3 Counter | 28.25 | Yes | None | −3 | 25.25 | Medium (dev build, QR backend, 2 phones) | Good if Color Tones feeds the SKU ranking; padded if not | ShelfSense already does barcode-to-VTO; sponsor sells Skincare Pro; evidence for the online-shade problem misapplied in-store |
| 4 | C10 Lineup | 27.25 | Yes | None | −5 | 22.25 | Low–Med (multi-pose capture, ~6 endpoints) | Deepest on paper | fade-try-on already chains hair to beard; "one selfie" is false (frizz/density need extra poses) |
| 5 | C1 ShadePass | 26.75 | Yes | None | −4 | 22.75 | Medium | Shallow (Color Tones + N makeup renders) | "Why not just text her?"; asolink already uses the one-link, many-faces pattern |

None of the top 3 has a fatal flaw. Each needs fixes, listed below. The top three are within 0.75 points of each other, which is inside the spread you would expect between judges. The ranking is a slight edge, not a clear gap.

---

## 2. Top 3 recommendations

### #1 — C5 DropLive: an "on me" second screen for live-shopping viewers

**One-liner:** When a live seller drops a lip shade on stream, each consenting viewer's phone immediately shows that shade on their own face. The seller sees an aggregate try-to-cart panel that contains no faces.

**Target user and buyer**
- **User:** viewers of beauty live-shopping streams run from a phone by small sellers, indie brands and boutiques.
- **Buyer:** the seller or retailer pays per session or seat for aggregate analytics. Viewers use it free.
- Willingness to pay is a hypothesis. Nothing in evidence supports it.

**Evidence-backed problem (from evidence.md only)**
- Tan, Chandukala & Reddy 2022 (J. Marketing): AR try-on raises sales. The **overall effect is small**, but it is larger for less popular brands, narrower-appeal products and new-to-channel or new-to-category customers. It works by reducing product uncertainty. A stream shows the product on the host, not on the viewer.
- Google/Ipsos 2023: 42% don't feel represented by models; 59% were unhappy because an item looked different on them.
- Google 2022 (vendor): >60% of online beauty shoppers skipped a purchase over shade; 41% returned a wrong shade.
- Landscape: live-commerce is near-zero in the field. Verified today: "stream" returns 0 hits; the "live" and "seller" hits are unrelated single-user or seller-insight repos.
- Closest pattern is Moyo-Made/asolink: one link, guests try fabric on themselves, order on WhatsApp.
- **There is no live-commerce market, conversion or return statistic in evidence. Cite none.**

**Core mobile flow (scoped)**
1. **Join.** The viewer scans the QR on the stream overlay or enters a room code, reads a one-screen e-consent, and takes one guided selfie with face size and lighting gating.
2. **Analyse once.** The file is uploaded once and its id is reused. Facial Color Tones returns the lip and skin hex.
3. **Rolling pre-render.** The server pre-renders only the **next 2 SKUs** in the host's queue (a rolling window), not the whole queue.
4. **Drop.** The host taps "Drop shade 3" on their phone. Supabase Realtime broadcasts the SKU, the viewer's phone buzzes, and the "On you" card shows the pre-rendered result immediately.
5. **Improvised drop.** If the host drops an unqueued SKU, it renders on demand with an honest "rendering on you… ~Ns" state. This answers the "it's just a lookbook" criticism.
6. **Descriptive chip.** The card shows a neutral chip, e.g. "deeper than your natural lip, ΔE 18" or "close to your natural lip", labelled *preview*. There is **no "best for you" ranking**.
7. **Buy.** One tap adds the item to the cart, and the host panel updates (subject to the k-threshold).
8. **End.** At session end, local and own-server media are purged, and the screen shows YouCam's 24h result retention.

**YouCam API chain (base `https://yce-api-01.makeupar.com`, Bearer key held in a server proxy, never in the app)**
1. `POST /s2s/v2.0/file`, then a presigned PUT of the selfie. Keep the file id for the session.
2. `POST /s2s/v2.0/task/<facial color tones>`, then poll `GET /s2s/v2.0/task/<feature>/<task_id>` or receive a webhook. Returns lip/skin hex.
3. For each SKU in the rolling window: `POST /s2s/v2.0/task/<makeup vto>` with effect `lip_color` (hex, texture, intensity), then webhook or poll. Makeup VTO costs 1 unit per render.
4. Stretch only: Earring VTO (the ear-visibility spec is unverified) and cloth-v4 (2 units, needs a single-person full-body photo).

Copy the exact `<feature>` path segments from docs v1.17; evidence.md gives only the generic pattern. Units are charged only on success, and results last 24h.

**Rate limit (verified today at docs.perfectcorp.com/develop/rate_limit)**
- The limit is 250 requests per 300 s per access token **and** per IP. HTTP 429 if either is exceeded; the docs suggest about 5 requests per second.
- With webhooks, a viewer costs about 1 file call + 1 Color Tones call + 2 render calls ≈ 4–6 requests, which supports roughly 40–60 joins per 5-minute window per token/IP.
- Put this in the README and on one slide, along with the token-bucket queue design. This turns the red-team's scale objection into evidence of technical depth.

**Wow demo moment**
- Split screen: the host phone plus two viewer phones belonging to consenting people with visibly different skin tones.
- The host taps Drop. Both viewer phones buzz at once, each showing the shade on its own face with a different *descriptive* chip.
- Then the host improvises an unqueued shade, and the viewers see the honest "rendering on you" state resolve.
- A viewer taps Buy, and the host panel (with labelled simulated viewers so k≥5) ticks up.

**Red-team flaws and how the fixes address them**

| Flaw | Fix |
|---|---|
| "Live is theatre / pre-rendered lookbook" | On-demand improvised drop, shown once on camera |
| Rate-limit and scale | Webhooks, a server token-bucket at 250/300 s, a 2-SKU rolling window; the verified limit is cited openly |
| Unit cost grows with audience | The rolling window cuts unused pre-renders; frame cost as cost per engaged viewer; cap SKUs |
| "Best contrast for you" is a skin-tone-linked verdict (and CIEDE2000 is not novel; ShadeSpan used it) | Neutral descriptive ΔE chip, labelled preview; don't claim ΔE as the novelty |
| k-anonymity contradicted by a 2-viewer demo; "tries" are just impressions | Count card opens and dwell time, not pushes; "hidden until 5 viewers" state, then cross the threshold with clearly labelled simulated viewers |
| Distribution friction (viewers are on TikTok/IG) | QR overlay join, selfie reuse with consent, an explicit "runs alongside your live app" framing; pitch to the seller as a retailer tool |
| Deletion overclaim | Consent copy states YouCam keeps results up to 24h; "deleted" applies only to your own storage |
| Saturated components (makeup shade match ~30 repos) | Novelty lives in the one-to-many sync and aggregate-only analytics; name asolink and explain the realtime difference |
| Fragile 3-device filming | Pre-recorded host stream, phones on stands, cached-render fallback, one continuous take of the drop |

**Guardrails**
- **Consent/BIPA:** e-consent before capture; no account or identity link to the face; hosts never get images; purge at session end; published retention line covering YouCam's 24h; no sale or sharing.
- **Cosmetic language:** "preview", never "matches you" or "best for your skin".
- **Skin-tone fairness:** no ordinal ranking tied to skin tone; no skin-tone buckets in host analytics (counts per SKU only, k≥5); a capture-quality note on every chip.

**~12-hour MVP**
- *Must-have:*
  - Expo dev client.
  - Supabase (Realtime + Edge Function proxy holding the key + webhook receiver).
  - Room create/join, consent, selfie, upload and Color Tones.
  - Lip-only drop queue of 4 SKUs with a 2-SKU rolling pre-render.
  - Haptic drop card with the ΔE chip, the improvised drop, and a cart stub.
  - Host panel with the k≥5 gate; session purge.
  - A pre-recorded stream embedded as video.
- *Nice-to-have:* Earring VTO, cloth-v4, selfie reuse, a friend "which one?" share, an analytics CSV export.
- *Screens:*
  - Role picker
  - Host: Queue Builder, Host Live (video + Drop buttons + panel)
  - Viewer: Join (QR/code), Consent, Guided Selfie, Viewer Live (stream + "On you" card + cart), Session Ended / Deletion receipt

---

### #2 — C6 Silver Mirror: a large-type beauty fitting room for shoppers 55+

**One-liner:** A large-type, one-thumb fitting room that reads mature-skin cues with HD Skin Analysis. It shows a brand's real hero look next to a version tuned for this face, gives a reason for every change, and never shows an age number.

**Target user and buyer**
- **User:** women 55+ buying foundation, concealer, lip and eye products online, many of them new to online beauty buying.
- **Buyer:** a free app with a retailer cart, plus an embeddable "mature-skin preview" module that retailers or brands license. The module also addresses distribution.

**Evidence-backed problem (from evidence.md only)**
- Tan et al. 2022: AR effects are larger for new-to-channel or new-to-category customers and pricier products (the overall effect is small).
- Benchmarking Co. 2026: 41% of women struggle to find a complexion shade.
- Google/Ipsos 2023: 59% unhappy because an item looked different on them; 42% don't feel represented by models.
- WebAIM 2025: shopping pages are the worst for accessibility. This data is about web home pages, so use it as context, not as proof that the native app is the fix.
- Seniors are near-zero in the landscape. Verified today: "senior", "mature" and "older" each return 0 hits.
- **AARP "Mirror/Mirror" (2019) is not in evidence.md.** The red-team says it fetched it. Verify it yourself and add it to evidence.md before citing it, and only as 53% of Boomer / 40% of Gen X women and a 70% figure. Drop 74%/64%.
- **There is no mature-skin return statistic. Cite none.**

**Core mobile flow**
1. Consent in 20pt+ type with optional read-aloud. Capture with a large framing ghost and a tap or voice shutter. Enforce the HD rule that the short side is at least 1080 px.
2. **HD Skin Analysis** with HD-only concerns in one request; SD and HD can't be mixed per the red-team, so check this. Use moisture, age_spot, droopy eyelid and wrinkle. `skin_age` and the overall score are **never shown**. Masks are **opt-in and off by default**.
3. **Facial Color Tones** returns skin and lip hex.
4. **Reference look:** the shopper picks a brand hero look (shade hex + finish from the product page). This replaces the "as in the ad" strawman.
5. **Rules table:** each row is labelled a "styling choice" and shows the ui_score that triggered it, with a per-rule "turn off" toggle. Rules only adjust **documented parameters**: intensity, glow, concealer on/off and intensity, lip texture (matte/satin/sheer), eyeliner pattern. **No spot placement.**
6. Two Makeup VTO renders side by side, each change captioned in plain language (no anatomy words).
7. Big-button cart of 2–3 items and "Send to my daughter" via the share sheet.

**YouCam API chain**
1. `POST /s2s/v2.0/file`, then a presigned PUT.
2. `POST /s2s/v2.0/task/<skin analysis v2.1>` with HD concerns, then poll `GET .../<task_id>`. Returns ui_score/raw_score per concern and mask PNG URLs. Costs 9–22 units.
3. `POST /s2s/v2.0/task/<facial color tones>` in parallel.
4. `POST /s2s/v2.0/task/<makeup vto>` × 2: the reference recipe, then the tuned recipe (foundation, concealer, eyeliner, eye_shadow, lip_color with hex, texture, intensity). 1 unit each.

The analysis outputs set the VTO parameters. This is real chaining.

**Wow demo moment**
- A consenting 60+ relative scans once.
- Left: the brand's hero look exactly as sold. Right: the tuned look, with 24pt captions such as "satin lip, softer liner, lighter coverage — because moisture read low."
- She taps "Send to my daughter", it lands in WhatsApp, and the video ends on a 3-item cart.

**Red-team flaws and how the fixes address them**

| Flaw | Fix |
|---|---|
| Spot concealer and foundation "satin" likely not supported | **Hour-1 go/no-go spike:** render intensity 100 vs 40, glow on/off, concealer on/off, two eyeliner patterns, lip matte vs satin/sheer on a real face. If the difference isn't obvious at arm's length, lead with lip texture and eyeliner. Drop every claim that masks drive placement. |
| "As in the ad" is self-authored | A real brand reference recipe; "tuned" is a documented delta from it |
| Masks over age spots are a verdict in all but number; anti-aging drift | Masks opt-in and off; plain styling cues; never display wrinkle, firmness or droop labels; no "reduces/corrects" language |
| Rules table unsourced | Label each rule a styling choice, show the triggering score, add an off toggle; cite a published mature-skin makeup guide or a makeup-artist sign-off if you can get one in time (otherwise say "team heuristic") |
| Novelty only demographic; pipeline saturated (coverkind-proof, skinmatch) | The novelty is the reference-vs-tuned delta + hidden skin_age + accessibility-first design; name coverkind-proof |
| Generic evidence | Add the retailer module angle; cite AARP only after your own verification |
| Latency of a ~4-task chain | Progress state through the chain; cached run for the video, labelled |

**Guardrails**
- **Consent/BIPA:** e-consent, no account link, delete own copies after the session, state YouCam's 24h retention.
- **FDA intended use:** cosmetic-appearance language only, plus "not medical advice, see a dermatologist".
- **Fairness:** skin AI accuracy on mature skin and on darker tones is unverified (the evidence notes derm-AI limits on dark skin, Daneshjou 2022), so show confidence and limits. The vendor's ICC>0.90 is self-reported with no n, so don't cite it as validation.

**~12-hour MVP**
- *Must-have:*
  - Hour-1 VTO spike.
  - Large-type design system (Dynamic Type, 48pt+ touch targets).
  - Consent with TTS, guided HD capture, proxy.
  - Skin + Color Tones tasks, a rules engine of 5–6 rules.
  - Reference picker (seed 3 hero looks), side-by-side render, reasons, cart, share-sheet export of the comparison image.
- *Nice-to-have:* voice shutter, opt-in mask viewer, retailer embed mock, Hair Color VTO (cut first).
- *Screens:* Welcome/Consent (read-aloud), Capture Guide, Analysing (progress), Pick a Look, Side-by-Side + Reasons, Rule Detail/Toggle, Cart, Share, Privacy & Deletion

---

### #3 — C3 Counter: a beauty-advisor phone that hands off results and wipes itself

**One-liner:** An associate-held clienteling app built around a consult lifecycle:
1. The customer gives e-consent.
2. Capture is gated on-device.
3. The advisor scans shelf barcodes, and each shade is ranked against the customer's measured skin hex and rendered on her face.
4. Results go to the customer's own phone by QR.
5. The device wipes itself and shows the result. The retailer keeps an audit row with no face data.

**Target user and buyer**
- **Users:** advisors at specialty, department-store and drugstore counters, and walk-in customers (no app or account needed).
- **Buyer:** the retailer. Retailer demand is a hypothesis.

**Evidence-backed problem (from evidence.md only)**
- **Channel-neutral pain point:** Benchmarking Co. 2026, 41% of women struggle to find a complexion shade, 56% for darker tones. Use this as the main pain point.
- Google 2022 (>60% skipped, 41% returned wrong shade) is about **online** shoppers. Use it only to motivate the take-home handoff that carries into online repurchase.
- Tan 2022: larger effects for new-to-category customers and pricier products (overall effect small).
- **BIPA:** Kukovec v. Estée Lauder (VTO) survived dismissal in 2022; the 2024 amendment set one violation per person at $1k/$5k. A shared store device is where this risk is concentrated.
- In-store kiosk/associate is near-zero. Verified today: "associate", "kiosk" and "clientel" each return 0 hits.
- **In-store benefit (faster comparison, fewer tester swatches) is an explicit hypothesis. No evidence supports it.**

**Core mobile flow**
1. New Consult; the customer ticks a plain-language consent.
2. Post-capture gating with ML Kit face detection on the still image: face box ≥60% width, yaw/roll within limits, a mean-brightness threshold. Haptic ticks, and units are spent only on a good image.
3. Facial Color Tones returns the skin hex.
4. The advisor scans 3–5 foundation or lip barcodes from a seeded catalog of ~15 SKUs (disclosed on screen as "demo catalog, hand-sampled hexes").
5. Each SKU is badged by CIEDE2000 distance from the measured skin hex, with a lighting/confidence note. One Makeup VTO task fires per scan, and a grid fills as tasks land.
6. QR handoff: a tokenized, cookie-free page that links YouCam result URLs only, with a 24h TTL and no re-hosting.
7. End Consult purges local files and secure-store and shows the empty file listing as proof. The audit row records consent version hash, timestamp, SKUs previewed and purchased yes/no, with no image.

**YouCam API chain**
1. `POST /s2s/v2.0/file`, then a presigned PUT.
2. `POST /s2s/v2.0/task/<facial color tones>`, then poll.
3. Per scan: `POST /s2s/v2.0/task/<makeup vto>` (foundation / concealer / lip_color with hex, texture, intensity), 1 unit each, polled or delivered by webhook to the proxy.
4. Optional, off by default: Fitzpatrick for the limits note only. SD Skin Analysis is cut (it saved 9–22 units per run and removes FDA and bias exposure on the sales floor).

**Wow demo moment**
- **Open** on the customer's own phone receiving her looks with shade-distance badges, then rewind.
- The advisor's phone buzzes and auto-captures. Three barcodes are scanned in about 5 seconds and the grid fills.
- The customer scans the QR.
- **End** in under 15 seconds: End Consult, the wipe receipt fills line by line ("deleted from this device", "YouCam results retained up to 24h per API docs", "retailer log contains no image"), and the audit row appears.

**Red-team flaws and how the fixes address them**

| Flaw | Fix |
|---|---|
| ShelfSense already does barcode-to-VTO | Color Tones-ranked shade distance (not ingredient verdicts), associate-held native app, consent/handoff/wipe lifecycle; name ShelfSense in the README |
| Sponsor sells Skincare Pro (in-store iPad kiosk) | Say in the first 15 s: "Skincare Pro is a fixed kiosk; Counter is a pocket layer on any associate phone, and the customer leaves owning her results" |
| Evidence for the online-shade problem misapplied in-store | Lead with Benchmarking 2026; state the in-store benefit as a hypothesis |
| Skin Analysis bolted on | Cut it; Color Tones now drives the ranking (real chaining) |
| Seeded hexes undermine fidelity | On-screen disclosure |
| Privacy half-theatre | Exact wording; link YouCam URLs instead of re-hosting; show the empty storage as proof |
| Frame-processor gating over-scoped | Post-capture still-image gating |
| Administrative climax | Reordered demo |

**Guardrails**
- "Designed around BIPA guidance", never "BIPA-certified".
- No name linked to images; the API key only in the proxy.
- Cosmetic language only; no scores on the customer page.
- ΔE badges carry a capture-condition note. The darker-tone path shows "this catalog has no close match; deeper shades in range" (a catalog gap, not an AI verdict).

**~12-hour MVP**
- *Must-have:*
  - Expo dev build with expo-camera barcode scanning and @react-native-ml-kit/face-detection on stills.
  - Proxy plus a tiny token page (Supabase Edge Function + table with TTL).
  - Consent, gated capture, Color Tones, a 15-SKU catalog, ΔE badges, VTO grid.
  - QR handoff, purge + receipt, audit log list.
- *Nice-to-have:* Fitzpatrick limits note, AirDrop, a purchase toggle feeding a simple consult-to-sale tally.
- *Screens:* Advisor Home, Consent, Capture (gated), Scan & Grid, Look Detail, Handoff QR, Wipe Receipt, Audit Log; plus the customer's web handoff page

---

## 3. Grafts worth adding from runners-up

| Source | Idea | Graft into | Why |
|---|---|---|---|
| C1 ShadePass | "What you did NOT receive" privacy receipt | C5 host panel ("no faces, no skin tones, counts only") and C3 wipe receipt | Makes the BIPA guardrail visible on camera; matches the round-1 honesty-guardrail pattern |
| C3 Counter | Post-capture on-device face gating + haptic ticks | C5 join selfie, C6 HD capture (≥1080 px) | Avoids spending units on bad images; a mobile-native detail |
| C4 LiveSwatch | Claim linter (drug-like or "works on everyone" phrases) | C5 host queue: lint each SKU's pitch text before it can be dropped | Adds a second, auditable use of the data and echoes Aloud's CI claim linter; cheap (regex + wordlist) |
| C9 Polish Pocket | Friend "which one?" poll via the share sheet | C5 viewer card, C6 alongside "Send to my daughter" | Social loop with no extra API cost |
| C7 SeatedFit | Honest per-result reliability label | C5/C6/C3 chips: "preview reliability: good / limited (lighting)" from the capture checks | The evidence pattern rewards "preview, not guarantee" (ConfidFit) |
| C2 GiftPass | Revocable, time-limited pass | C5 room membership: "leave room = purge my renders now" | Gives the viewer control |
| C12 SwapDesk | Simple outcome ledger | C3 audit log (consult → purchased yes/no tally) | Gives the retailer a measurable output; label it as a tally, not an impact claim |
| ShadeSpan pattern (round-1 winner) | Catalog audit across consented faces | C6 retailer module: "how many of a brand's hero looks need retuning on 55+ faces" | Strengthens the B2B buyer story; cite the pattern, don't invent numbers |
| C10 Lineup | Barber card as a full-screen "show someone" artifact | C3 customer handoff page / C6 share image | Strong, filmable handoff |

---

## 4. Single #1 pick

**C5 DropLive.** It has the highest average on the four equally weighted judging criteria (29.0), and it is the only top concept whose core interaction, one host tap fanning out to many personal renders, has zero precedent in the 356-line field ("stream" returns 0 hits). It also has the strongest wordless demo moment. It survives the red-team with no fatal flaw, but it only wins if you build the fixes: a lip-only rolling pre-render, a real improvised drop, a verified 250 requests/300 s token-bucket design shown in the README, neutral ΔE chips instead of "best for you", and a k≥5 panel with labelled simulated viewers. Its lead over C6 is only 0.25 points, and C6 is far easier to ship. If the realtime two-role skeleton is not working by about hour 4, switch to C6. That switch is a feasibility call, not a ranking change.