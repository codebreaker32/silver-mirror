# SkinKey: Session Kit, Proto-Personas, Jobs and Anti-Personas

*Revised 2026-11-01. For the 3–5 ten-minute interviews and share-flow tests in the next 1–2 hours. Submission deadline: 2026-11-02, 11:45 AM ET.*

**How this document is laid out**
- **Part 1, Session card (pages 1–3):** everything you need on the phone during a session. Read Part 1 only while you are with a participant.
- **Part 2, Assumptions:** what each session checks, the threshold that counts as a signal, and what we change before the deadline if it fails.
- **Part 3, Appendix:** proto-personas, jobs, anti-personas and the evidence list. Read these before the sessions, not during them.

**The personas are guesses, not research.** We have not spoken to a single Indian skincare shopper yet. Every persona trait, goal, habit and quote in Part 3 is an **ASSUMPTION (to validate)** unless a line names a source from `/home/aman/youcam/research/evidence.md` or `/home/aman/youcam/research/skinkey_report.md`. Never quote a persona as user evidence in the pitch, README or video. Only what real participants do or say today counts.

---

# PART 1: SESSION CARD

## 1.1 Before the first session (15 minutes, build lead plus one tester)

**Hour-1 gates: get the build lead to confirm each one.** These are the go/no-go tests listed in skinkey_report.md. Mark each one YES, NO or NOT TESTED.

- [ ] **G1. Sharing a product from the Flipkart app gives SkinKey a usable product title.** If NO or NOT TESTED, show the verdict screens as printed or on-screen mock-ups labelled MOCK. The "send to a friend" task (A2) still runs in the real Flipkart app.
- [ ] **G2. Sharing from the Amazon app works.** If not, run every share task on Flipkart only. Flipkart is the default anyway, because the report makes it the guaranteed demo.
- [ ] **G3. The Flipkart app keeps the skin-type filter when "Find better matches" opens it.** Only the web page has been verified. If NO or NOT TESTED, never say "already filtered in the app". Say what actually happens on screen (for example, "it opens a Flipkart page in the browser").
- [ ] **G4. Flipkart's Skin Analyser and Amazon's SkinCare Analyzer still exist in the 2026 apps.** If not confirmed, skip module M1 and do not name either tool to participants.
- [ ] **G5. The tinted-product preview (YouCam Facial Color Tones plus Makeup VTO) works on the test phone.** If not, skip module M3.
- [ ] **G6. The APK installs and runs at all.** If not, run the whole session on mock-ups and tell each participant: "This is a mock-up picture, not the working app."

**Test-phone checklist**
- [ ] Android dev build installed. It does not run in Expo Go (skinkey_report.md).
- [ ] Flipkart app (and Amazon, only if G2 passed) logged in to a **team** account, never the participant's.
- [ ] **Cached demo profile loaded.** We do not scan participants' faces today (see 1.3).
- [ ] 2–3 demo products bookmarked in the Flipkart app: one that returns **CAUTION**, one that returns **UNKNOWN**, and one that triggers the medicine gate ("This looks like a medicine. Ask the pharmacist.").
- [ ] Mock-up screenshots saved offline as a backup. Each one labelled MOCK.
- [ ] Notifications off (Do Not Disturb), brightness up, battery above 50%, font size at default. Note if a participant asks for bigger text.
- [ ] The note template (1.6) open on a second phone or on paper.

**Recruitment quotas across all sessions** (3–5 people)
- At least 1–2 men and at least 1–2 women. Include non-binary participants if they come forward. Never guess anyone's gender. If you need it for the quota, ask the optional question in 1.2.
- A spread of skin tones, aiming for at least 1–2 people with medium-to-deep skin. **Never ask about skin tone and never note your own judgement of it.** Record it only if the participant describes it themselves.
- Mixed spending: at least one person who says they buy on deals and at least one who doesn't.
- At least one person who buys skincare online only occasionally.
- **Exclude** teammates, their close friends, and anyone who has already seen SkinKey.
- **Known skew:** a café, college or office sample will lean young, tech-savvy and fluent in English. Write that in the debrief.

## 1.2 Screener (30 seconds, ask in this order)

1. "Are you 18 or older?" If no, thank them and stop. Do not continue with anyone under 18.
2. "Which age range are you in: 18–19, 20–35, or over 35?" If they're outside 20–35 you can still run the session if they want, but tag them OUT-OF-TARGET and leave them out of the counts.
3. "Which city do you live in?" We're looking for metro or tier-1 cities. Tag anyone else OUT-OF-TARGET.
4. "Have you bought any skincare online in the last 3 months? Which app or site?" If no, tag them OUT-OF-TARGET.
5. *(Optional, only if you need it for the quota)* "How would you describe your gender? You can skip this."

## 1.3 Consent script (read aloud; 30 seconds)

> "We're students building a skincare shopping app for a hackathon. This takes about 10 minutes. We're testing the idea, not you, and honest criticism is the most useful thing you can give us. You won't hurt our feelings.
> I'll take written notes only. No audio, no video, no photos of you, and we won't write down your name.
> We **won't scan your face** today. The app uses a made-up demo skin profile.
> If I ask about something you bought, you don't have to show me your phone or your orders. Just tell me about it.
> You can skip any question or stop at any time. Is that okay?"

**Data rules for today**
- No real face scans of participants. If someone insists on trying a live scan, only do it with their explicit spoken yes after you've told them that the photo goes to YouCam for analysis and is deleted from YouCam right after. Delete it on screen in front of them. Don't do it in poor light: YouCam needs the face to fill more than 60% of the frame width, facing forward, in even light (evidence.md), so café lighting may fail. Each scan also costs 9–22 API units (evidence.md).
- No names, phone numbers or photos. Use P1, P2, and so on.
- Don't keep any screenshots of a participant's own phone.
- Quotes are anonymous, and only used if the participant says yes at wrap-up.

## 1.4 The 10-minute script

Every session runs the same **core** (blocks 1–5) and **one rotating module** (block 6). Two roles: a **facilitator** who talks and a **note-taker** who writes. If you're alone, write your notes in the two minutes straight after the session.

**0:00–1:00. Screener and consent** (1.2 and 1.3)

**1:00–2:30. Last purchase (A1)**
- "Tell me about the last skincare product you bought online. Where did you buy it: an app, a website or a shop?"
- "How did you decide it would suit your skin?"
- "Who, if anyone, do you talk to or ask about skincare?" (Ask everyone this, worded exactly like this. Never ask anyone whether asking is awkward for them.)

**2:30–4:30. Send-to-a-friend task (A2)**
- Hand over the team phone with a Flipkart product page open.
- Say: **"How would you send this product to a friend?"** Don't say "Share". Don't point. Wait at least 5 seconds before you offer any help.
- Note exactly what they do: tap Share, screenshot, copy the link, or give up. A screenshot counts as a valid answer, not a failure.
- If they reach the share menu, say: "Now imagine SkinKey is one of the options. Pick it." (If G1 failed, switch to the MOCK verdict screen at this point.)

**4:30–6:30. Verdict and UNKNOWN (A3, A5)**
- With the product page still open, ask first: "How would you decide whether to buy this?"
- Show the **CAUTION** verdict. Ask: **"What is this screen telling you? What would you do next?"** Then: "Can you tell me in your own words why it says that?"
- Show the **UNKNOWN** verdict. Ask: "What is this one telling you? What would you do next?"
- Don't explain the screens and don't defend them. If they misread something, write down the misreading. That's the finding.

**6:30–8:00. Consent explain-back (A4)**
- Show the consent screen and the "What we keep" screen. Watch whether they read them or scroll straight past. Note roughly how many seconds they spend.
- Ask: **"In your own words, what happens to your photo?"** Note whether their answer is right or wrong.
- Ask: "Is there anything that would make a face scan awkward or inaccurate for you?" Don't suggest examples (beards, glasses, makeup, a bindi, a hijab, a turban). Only note the ones they raise.

**8:00–9:30. Rotating module** (pick the next one in order, skipping any whose gate failed)
- **M1. Store skin tools (A6).** Only if G4 is YES. "Have you ever used a skin tool inside a shopping app? Tell me about the last time. What happened next? Next time you shopped on a different app, what did you do?"
- **M2. Better matches and affiliate links (A7, A11).** Tap "Find better matches". Ask: "What did you expect to happen? What happened?" Then show the affiliate disclosure line and ask: "What do you think SkinKey gets out of this link?"
- **M3. Tinted preview (A8).** Only if G5 is YES. Show the preview on the demo face, not the participant's. First ask: "Last time you bought a tinted product (sunscreen, BB cream, skin tint), how did you choose the shade?" Then: "What would you do after seeing this?" Then show the second-photo consent screen and ask: "In your own words, what is this asking you for?"
- **M4. Changes to their routine (A9).** "When did you last change your routine or buy something new? What prompted it?" Only note whether they mention weather, sun, heat, humidity or monsoon **without being prompted**. Then show the Skin Forecast card and ask: "What is this telling you?"
- **M5. Products they already own (A10).** "Tell me about the last time you wondered whether something you already own was right for you. What did you do?"

**9:30–10:00. Wrap-up**
- "Is there anything about buying skincare online that frustrates you that we haven't talked about?"
- "Can we quote something you said, with no name or face, in our demo video?" Note yes or no.
- Thank them.

## 1.5 Facilitator rules

- **Don't sell, explain or defend.** If they ask "what does this do?", turn it back: "What do you think it does?"
- **Wait 5 seconds** before helping with any task.
- **Neutral probes:** "What makes you say that?", "What did you expect to happen?", "Show me what you'd do", "Tell me more."
- **Watch what people do, not what they say they'd do.** "I would definitely use this" is weak. Tapping the right thing without help is strong.
- **Don't react to praise.** Just say "Thanks, what makes you say that?" and move on.
- **Any language is fine.** If someone answers in Hindi or Hinglish, write the quote as spoken and mark your translation [tr]. Note any English word that stops them (for example CAUTION, "active", "comedogenic", "exfoliating").
- **Don't sort people into personas during the session.** Write down what happened. The mapping to personas happens in the debrief.
- **Medical questions:** "We can't help with skin conditions. A doctor or pharmacist is the right person." Don't demo a workaround.

**Never say any of these** (all of them are untrue or unverified):
- "This won't irritate your skin" or "This is safe for you."
- "It treats acne" or anything else framed as treatment.
- "Guaranteed shade match" or "No white cast."
- "Nothing ever leaves your phone."
- "We don't make any money from this."
- "It deep-links into Flipkart." (Say "it opens a Flipkart search", per skinkey_report.md.)
- "It checks the exact product, every time." Most shares will come back "based on product name only" or UNKNOWN, because our catalogue has only 12–15 products (skinkey_report.md).

## 1.6 Honest answers to questions participants will ask

- **"Where does my photo go?"** "SkinKey stores no photo. YouCam processes it and we delete it from YouCam right after." (This is the report's approved wording.) "Today we're not scanning your face at all."
- **"Does my photo train AI?"** "We don't know yet. We haven't confirmed YouCam's policy on that." Don't reassure beyond this.
- **"What data leaves my phone?"** "We don't sell data. Your photo goes to YouCam only for the analysis, and then it's deleted. Your skin bands only leave your phone if you choose to create a pharmacist share, and that expires after 30 minutes or as soon as you revoke it."
- **"How do you make money?"** "It's a hackathon prototype. Links on our own web page can carry shopping affiliate tags, which means we could earn a small commission. The app itself has no affiliate links unless Amazon approves that."
- **"Will it work on my skin tone?"** "Skin AI can be less accurate on deeper skin tones and in poor light. That's why we show broad bands instead of exact scores. We'd really like to know if anything feels off to you."
- **"Is this medical advice?"** "No. It's cosmetic guidance only. For a skin condition, see a doctor or pharmacist."
- **"Where does the product info come from?"** "For a small list of products, we typed in the ingredients ourselves from the brand sites. For anything else it's based on the product name only, or it says UNKNOWN."
- **"Is this Flipkart's or Amazon's app?"** "No, we're not affiliated with Flipkart, Amazon or Nykaa."

## 1.7 Note template (one per participant; copy it for each session)

```
P#:        Age band:      City:        Online store(s) used:
Phone/app on the test phone: Flipkart / Amazon / MOCK
Module run: M_
Gender (only if self-described):       Skin tone (only if self-described):

A1 Where they bought last time:
A2 DID (what they tapped):    Share / screenshot / copied link / gave up / needed help after __ s
A3 DID:                       SAID (verbatim):
   Explained the CAUTION reason correctly?  Y / N / partly
A5 SAID about UNKNOWN (verbatim):           What they'd do next:
A4 Read consent?  read / skimmed / skipped (~__ s)
   Photo explain-back correct?  Y / N   Their words:
   Scan concerns they raised themselves:
Module notes: DID:            SAID:
English words that blocked them:
Questions they asked us:
Anything that surprised you:
```

## 1.8 Debrief (15 minutes after the last session)

1. **One row per participant**, with two columns: what they **did**, and what they **said**. Keep OUT-OF-TARGET participants in a separate list.
2. **Count each assumption** as "x of n sessions", where n is only the sessions that actually tested it.
3. **Apply the thresholds in Part 2.** A signal counts as "most" when it's 2 of 3, 3 of 4 or 3 of 5.
4. **Write the design decision** each signal triggers (Part 2), and give it an owner and a time.
5. **Then, and only then, check the personas against the participants.** Note which persona traits nobody showed and which traits came up that no persona has. Don't re-score personas or job ratings from 3–5 sessions. It's too few. Treat everything as an early warning, not a finding.
6. **Reporting rule:** report counts only ("3 of 4 found Share without help"). Never give percentages, and never present these results as statistics about India or Indian shoppers.

---

# PART 2: ASSUMPTIONS, THRESHOLDS AND DECISIONS

"Most" means 2 of 3, 3 of 4 or 3 of 5 sessions. Rotating-module assumptions will usually be tested by only 1 or 2 people, so they give a hint, not a kill.

**A1. Target shoppers buy skincare inside the Amazon, Flipkart or Nykaa apps.**
- Test: block 1, last purchase.
- Signal: most bought on the web or in a shop.
- If it fails: lead the video with Aisle Check and the paste-link path, and keep share-in as one of several ways in.

**A2. Shoppers can find Share on a product page without help.**
- Test: block 2, the "send to a friend" task.
- Signal: most screenshot, copy the link, or can't find Share.
- If it fails: make "Paste a link" the first thing on the home screen, and add a "check the link I just copied" prompt. Note screenshot input as future work.

**A3. A reason tied to the user's own score is understood and changes what they'd do.**
- Test: block 3. Ask how they'd decide on the product page first, then show the verdict and ask for an explain-back.
- Signal: most can't explain in their own words why it says CAUTION, or say it changes nothing.
- If it fails: rewrite the verdict card so the reason comes first, in plainer words, with the score band ("Your redness reading: high") above the ingredient name.

**A4. Participants understand what happens to the photo.**
- Test: block 4, the explain-back.
- Signal: most get it wrong, or skip the screen.
- If it fails: shrink consent to one screen, with the report's sentence in large type, and add "What we keep" before the camera opens. If most also say they'd never do a scan, decide whether to build a no-scan mode (a quiz, or product-name-only checks).
- Limitation: today's tests use a demo profile, so they can't show whether a reason based on the participant's **own** scan earns more trust. Say this in the debrief.

**A5. An honest UNKNOWN is acceptable.**
- Test: block 3, the UNKNOWN card.
- Signal: most read it as broken or say they'd stop using the app.
- If it fails: show the catalogue count ("we know 15 products so far"), make "based on product name only" more prominent, offer a keyword search as the next step, and choose demo products we actually have in the catalogue.

**A6. Store-locked skin tools don't fully meet the need.** *(Module M1, only if G4 is YES.)*
- Test: past-behaviour questions about using a store's skin tool.
- Signal: people use a store tool happily and only ever shop in that one store.
- If it fails: change the pitch wording. Lead with "checks this exact product, with reasons" rather than "any store".

**A7. An already-filtered "Find better matches" search is useful.** *(Module M2.)*
- Test: tap through and ask what they expected.
- Signal: they don't care, or they expected creator picks instead.
- If it fails: make it a secondary button, and cut it from the video's key moment.

**A8. The tinted preview helps a shade decision.** *(Module M3, only if G5 is YES.)*
- Test: ask how they chose a shade last time, then show the preview and ask what they'd do next. Also ask for an explain-back of the second-photo consent.
- Signal: "cool, but it wouldn't matter", or they object to a second photo.
- If it fails: drop the preview from the video and keep Facial Color Tones only if it drives a rule, as the report says.

**A9. Weather plays a part in skincare choices.** *(Module M4.)*
- Test: ask what prompted their last routine change, and note whether weather comes up without prompting.
- Signal: weather never comes up, and the forecast card gets a shrug.
- If it fails: cut the weather home card (it's already 5th on the cut list) and keep, at most, the UV reason on the verdict card.

**A10. People want to check their whole routine, not just one product.** *(Module M5. Not a kill: this decides the roadmap.)*
- Test: ask about the last time they doubted a product they already own.
- If it comes up: put "check my shelf" on the roadmap slide only. It isn't built.

**A11. Affiliate-tagged links don't reduce trust.** *(Module M2.)*
- Test: show the disclosure line and ask what SkinKey gets out of the link.
- Signal: suspicion or a "so it's just selling" reaction.
- If it fails: put the disclosure on the verdict screen itself, and keep "Find better matches" visibly neutral (the store's own search, not our picks).

**A12. The medicine gate rarely fires on everyday products.** *(Passive: just listen.)*
- ASSUMPTION: some everyday face washes or shampoos may contain benzoyl peroxide or ketoconazole, which would trigger the gate. This is not in our evidence.
- Test: note any time a participant mentions using a product with these ingredients.
- If it comes up: reword the gate for those two ingredients ("Contains benzoyl peroxide. Ask the pharmacist if unsure") rather than blocking the product completely. This needs a team decision.

**Flag for the team (not a persona issue):** Open-Meteo's free tier is for non-commercial use only and needs a CC BY 4.0 credit (skinkey_report.md). Showing the Forecast card in an app that has affiliate-tagged links may conflict with that. Decide before submission.

---

# PART 3: APPENDIX (read before the sessions, not during)

## 3.1 Evidence we have, with caveats

**None of this is India-specific or limited to 20–35-year-olds, and several of these are vendor surveys.** Use these figures only as context, never as proof about our users.

- **70% don't know their skin type and 80% don't know ingredients.** Source: CeraVe/OnePoll 2021. Caveat: vendor survey, not India.
- **63% are wrong about their skin type.** Source: Labskin 2022. Caveat: vendor survey, not India.
- **49% have skincare unopened for more than a year.** Source: HK Consumer Council 2021. Caveat: Hong Kong, not India.
- **More than 60% of online beauty shoppers skipped a purchase over shade, and 41% returned a wrong shade.** Source: Google 2022. Caveat: vendor, not India, and about shade rather than skincare fit.
- **41% of women struggle to find a complexion shade, rising to 56% for darker tones.** Source: Benchmarking Co. 2026. Caveat: women only, not India.
- **59% were unhappy because an item looked different on them.** Source: Google/Ipsos 2023. Caveat: vendor research, not India, not specific to skincare.
- **AR try-on raises sales, but the overall effect is small. It works by reducing uncertainty about the product.** Source: Tan, Chandukala & Reddy 2022, J. Marketing. Caveat: a measured reduction in returns from AR is **not supported**; there is only stated intent (evidence.md). Never claim fewer returns.
- **Only 2.1% of open skin-lesion images record Fitzpatrick type.** Source: Wen et al., Lancet Digital Health 2022. Caveat: Fitzpatrick is a skin-tone scale, not oily/dry skin type, and these are dermatology datasets.
- **Dermatology AI is limited on dark skin.** Source: Daneshjou, Science Advances 2022. Caveat: this is about medical AI, not cosmetic skin analysis. We use it as the reason for showing bands and a fairness note.
- **Flipkart has a ModiFace selfie "Skin Analyser" (since about December 2023), and Amazon.in has a quiz-based "SkinCare Analyzer".** Sources: ModiFace newsroom, CXOToday and aboutamazon.in, via skinkey_report.md. Caveat: whether either is still in the 2026 apps is UNVERIFIED (gate G4).
- **Flipkart's skin-type filter values are Oily Skin, Dry Skin, Combination Skin and All Skin Types.** Source: our own HTTP test, web page only (skinkey_report.md). Caveat: undocumented and could change. Whether the Flipkart **app** keeps the filter is UNVERIFIED (gate G3).
- **YouCam's documentation lists no output values for `skin_type`.** Source: skinkey_report.md. Caveat: we may have to work out the Flipkart filter value from the oiliness and moisture bands using our own rule.
- **Open Beauty Facts has 348 India-tagged products with complete ingredients.** Source: our own query (skinkey_report.md). Caveat: expect many in-store barcode scans to come back UNKNOWN.
- **Amazon and Flipkart's APIs don't provide ingredient lists.** Source: skinkey_report.md. The Amazon Creators API and Flipkart's affiliate API have no ingredients field.
- **SkinKey can't show Amazon ratings or reviews.** Source: Associates rule 28 (skinkey_report.md).
- **The share-in path is partly unverified.** What the Amazon and Flipkart apps put into a share, and whether they use the standard Android share menu, are both UNVERIFIED. Sharing from Nykaa is untested. Source: skinkey_report.md.
- **"Treat acne" claims make a product a drug, so we use cosmetic-appearance language.** Source: FDA intended-use guidance (evidence.md). Caveat: this is a US rule; we apply it as a cautious default.
- **For face scans: get explicit consent, delete promptly, and never link to identity.** Source: BIPA cases (evidence.md). Caveat: US (Illinois) law, applied as a design default, not as India's legal standard.
- **Several features may be cut.** In order, if the build falls behind: App Links on our domain, the Nykaa link, Open Beauty Facts lookup, the pharmacist QR with revoke, and the weather home card (skinkey_report.md). Any of these may not exist on the test phone.

## 3.2 Proto-personas (hypotheses only)

**Important: these are not research findings.** Each persona is a set of guesses about **behaviour and needs**. Every line is ASSUMPTION (to validate) unless it cites a source.

**Gender, skin tone, budget and city are deliberately left out of the personas.** An earlier draft tied a gender to each persona's attitude and budget (the man as the deal-hunting novice, the woman as the cautious one with sensitive skin, the non-binary person as the "very online" one interested in tints). That's a stereotype, so we removed it. Any persona can be any gender, skin tone, budget or metro city. Recruit those differences across all three personas, and don't steer anyone towards or away from a topic (tinted products, sensitivity, deals) because of how they look.

Each persona's "Test" lines carry equal weight whichever way they go. Something that contradicts a persona is as useful as something that confirms it.

### Persona 1: "The Starter" (new to actives, describes skin as oily)

- **Snapshot:** started taking skincare seriously recently, prompted by friends or short videos. Uses a face wash and sometimes a moisturiser, and has "tried niacinamide". Not sure whether daily sunscreen matters.
- **Skin, in their words:** "oily, I get pimples." Has never had their skin measured. Has guessed their skin type from a quiz or a video. (Context only: in a vendor survey, 63% were wrong about their skin type, Labskin 2022. Not India data.)
- **Goals:** less visible shine and fewer visible breakouts using cosmetic products. A short routine. Not wasting money on products that do nothing.
- **Frustrations:** ingredient names mean little to them. Every listing says "for all skin types". Can't tell hype from what suits them. Combo deals push them into buying things they're unsure about.
- **How they shop:** browses during sales, sorts by discount and rating, reads the top few reviews, and rarely opens the ingredient list.
- **What builds trust:** high rating counts, a friend or creator who uses the product, a plain specific reason. SkinKey can't show Amazon ratings (rule 28), so we need to learn whether a reason makes up for that.
- **Privacy:** fairly relaxed about scans, but likely to skim consent text. That's a risk for us: they may agree without understanding (A4 measures this).
- **Illustrative quote (made up, not real):** "Every face wash says 'oil control'. I just want someone to tell me: this one, for my face, yes or no."
- **SkinKey moment:**
  - They share a gel moisturiser from the Flipkart app and get a verdict with a reason such as "Your oiliness reading: high (scan 1 Nov)".
  - They tap "Find better matches", which opens a Flipkart search with the Oily Skin filter.
  - UNVERIFIED: whether the app keeps that filter (G3), and whether YouCam returns a usable skin type or we have to work it out from the bands.
- **Test:** A1, A2, A3. Which words do they use for skincare (face wash, beard area, shaving irritation)? Do the verdict and consent copy read as gender-neutral to them? (ASSUMPTION: their vocabulary may differ from the "skincare routine" language we use.)
- **Likely jobs (guess):** J0, J1, J2.

### Persona 2: "The Careful One" (redness-prone, was put off by a strong active)

- **Snapshot:** says a strong active (a retinol or an acid) "didn't agree" with their skin in the past. Now sticks to a few trusted products.
- **Skin, in their words:** "dry, goes red easily." They describe this in cosmetic terms. If they describe a diagnosed condition (eczema, rosacea), that need is out of scope (anti-persona 1).
- **Goals:** know which products contain exfoliating acids or strong actives before buying, see when SkinKey flags those given their redness reading, and buy fewer "trial" bottles.
- **Frustrations:** "suitable for sensitive skin" is printed on everything and means nothing. Ingredient lists are hard to find or don't match between sites (ASSUMPTION, with no supporting evidence). Influencers recommend strong actives without explaining them. Returning opened skincare is a hassle (ASSUMPTION: we haven't checked return policies).
- **How they shop:** discovers products on Nykaa and re-orders familiar ones on Amazon (ASSUMPTION). May have tried a store skin tool (test only if G4 is YES).
- **What builds trust:** a visible data source ("from the brand site, checked 1 Nov"), a tool that admits uncertainty (UNKNOWN, "based on product name only"), pharmacist backing, and no pushy upselling (so test the affiliate disclosure, A11).
- **Privacy:** cautious. Wants to know where the photo goes, how long it's kept, and whether it trains AI. The honest answers are in 1.6, and the training answer is "we don't know yet". They're likely to want a clear statement that we delete the photo from YouCam right after the scan. They can't check that deletion themselves; it's our claim, based on YouCam's delete function.
- **Illustrative quote (made up, not real):** "I don't need ten options. I need to know what's in it and why you're flagging it."
- **SkinKey moment:**
  - They share a vitamin C or AHA serum from the **Flipkart** app (Amazon only if G2 passed).
  - They get CAUTION: "contains an exfoliating acid; your redness reading: high". The card shows where the data came from and the line "cosmetic guidance, not medical advice".
  - "Find better matches" opens a Flipkart search filtered to Dry Skin (same caveats as Persona 1).
  - SkinKey flags ingredients. **It does not predict whether a product will sting, irritate or cause a reaction.** Never say it does.
- **Test:** can they explain CAUTION back in their own words (A3)? What do they do with UNKNOWN (A5)? Do they look at the data source line or skip it? A4 explain-back.
- **Likely jobs (guess):** J0, J6, J3.

### Persona 3: "The Overloaded One" (many products, combination skin, follows creators)

- **Snapshot:** follows several skincare creators, buys new launches, has a long routine and a drawer of half-used products.
- **Skin, in their words:** "combination: oily T-zone, dry cheeks." Unsure whether it's "actually combination or just irritated from too much stuff."
- **Goals:** cut the routine down, stop buying overlapping actives, and find a tinted SPF or skin tint that matches them.
- **Frustrations:** money spent on products they never finish. (Context only: 49% have skincare unopened for more than a year, HK Consumer Council 2021. Hong Kong, not India.) Conflicting advice about combining actives. Tinted products look different on them than in the listing. (Context: more than 60% skipped a purchase over shade and 41% returned a wrong shade, Google 2022, vendor. 41% of women struggle to find a complexion shade, 56% for darker tones, Benchmarking Co. 2026. Neither is India data.)
- **How they shop:** buys wherever the sale or launch is, uses creator links and codes, takes screenshots to "decide later" (so A2 matters).
- **What builds trust:** creator picks, though they're getting sceptical of paid promotions, and ingredient breakdowns. Open question: does a "don't buy this" verdict feel useful or annoying? Ask it neutrally. Don't assume.
- **Privacy:** comfortable with selfie and AR filters. Dislikes spam. Note that the only sharing SkinKey offers is the pharmacist QR, which expires after 30 minutes and can be revoked, and that feature may be cut. There's no public profile sharing.
- **Illustrative quote (made up, not real):** "I don't need another serum. I need to know which of the ones I own to keep."
- **SkinKey moment:**
  - They share a tinted sunscreen from the Flipkart app and get a verdict with reasons.
  - Optionally, they preview the tint. UNVERIFIED (G5). It would need a **new face photo** at preview time, because the scan photo has already been deleted and each YouCam feature needs its own upload (skinkey_report.md). That second photo needs its own consent screen.
  - The preview is labelled "preview, not a shade guarantee".
  - UNVERIFIED: nothing in our files shows that Makeup VTO's foundation effect can simulate a sunscreen's white cast, and our catalogue has no shade data for tinted products. Don't claim either.
  - Skin Forecast may add a "high UV this week" reason, using live Open-Meteo values only (the card may be cut).
- **Test:** A2 (Share or screenshot?), A8, A10.
- **Likely jobs (guess):** J3, J4, J1.

**Skin-tone and inclusion assumptions to watch for (ASSUMPTION, don't ask directly; note only if the participant raises them)**
- People with deeper skin tones may care more about white cast, uneven tone or tanning.
- Claims like "brightening", "fairness" or "whitening" may be a sensitive topic. How SkinKey should treat them is an **open team decision**. Testers shouldn't raise it.
- Whether YouCam's scan works with beards, stubble, glasses or makeup is UNVERIFIED.
- Some participants may not trust or understand the fairness note. If someone with deeper skin reads it, note their reaction.

## 3.3 Jobs-to-be-Done (all ASSUMPTION, to validate)

### J0. Main job: check this product

> **When** I'm looking at a skincare product in a shopping app and can't tell whether it suits my skin, **I want to** check it against my own measured skin and get a clear "fits", "caution" or "don't know", with reasons, **so I can** buy or skip it with more confidence and without researching ingredients.

- **Functional:** a FITS, CAUTION or UNKNOWN verdict tied to the user's score bands (for example, "oiliness: high, scan 1 Nov"), with the data source shown.
- **Emotional:** less second-guessing, and feeling in control rather than sold to.
- **Social:** being able to explain the choice to a friend.
- **Caveats (say these, don't promise around them):**
  - Share-in is UNVERIFIED for Amazon and Flipkart (G1 and G2). Nykaa share-in is untested.
  - With a 12–15-product catalogue, most shares will be "based on product name only" or UNKNOWN. **It is not an exact-product check every time.**
  - We haven't measured how long a check takes.
- **Context:** 70% don't know their skin type (CeraVe/OnePoll 2021, vendor), and 63% are wrong about it (Labskin 2022, vendor). Not India data.

### J1. Know my skin once

> **When** I've been guessing my skin type, **I want** one measured reading kept on my phone, **so I can** stop guessing.

- **Functional:** a one-time scan turned into bands on the phone. The photo is deleted from YouCam right after. A "What we keep" screen with a Delete button.
- **Note:** the store tools already offer something similar (G4). Our only difference is that the profile works across stores and checks a product you're looking at. Test, with past-behaviour questions only (M1), whether that difference matters to anyone.

### J2. Show me better options, already filtered

> **When** a product doesn't fit, **I want** alternatives already filtered to my skin type, **so I can** switch without setting filters myself.

- **Functional:** a Flipkart search with the skin-type filter (verified on the web only; in the app it's UNVERIFIED, G3). Amazon and Nykaa get a keyword search only, and the Nykaa link may be cut.
- **The skin-type value is UNVERIFIED:** it may have to be worked out from the oiliness and moisture bands.
- **Affiliate tags:** our web fallback page carries affiliate tags. Test whether that hurts trust (A11).

### J3. Stop overloading my routine

> **When** I'm about to add another active, **I want to** know whether it suits my skin, **so I can** keep a shorter routine.

- **Functional:** today, only a CAUTION reason for each product. Checking a whole routine for clashes or duplicates is **not built**; it's a candidate only (A10).
- **Context:** 49% have skincare unopened for more than a year (HK Consumer Council 2021). Hong Kong, not India.

### J4. Preview a tinted product on my face (UNVERIFIED, G5)

> **When** I'm buying a tinted sunscreen or skin tint online, **I want** a preview on my own face, **so I can** judge the shade before buying.

- **Functional:** YouCam Facial Color Tones plus Makeup VTO, labelled "preview, not a shade guarantee". It needs a **second photo and a second consent screen**.
- **Not claimed:** that it shows white cast, that a product's tint shade is accurate (we have no source for it), or that it means fewer returns (not supported, evidence.md).
- **Context:** the Google 2022, Benchmarking Co. 2026 and Google/Ipsos 2023 figures in 3.1, with their caveats. AR works by reducing uncertainty about the product, and its overall effect on sales is small (Tan, Chandukala & Reddy 2022).
- **Don't assume interest by gender.** We have no data on who cares about tinted SPF.

### J5. Adjust for the weather (may be cut)

> **When** UV or humidity changes, **I want to** know whether my product still makes sense, **so I'm** not caught without SPF on a high-UV day.

- **Functional:** live Open-Meteo values only, plus one extra reason on the verdict card. The home card is 5th on the cut list, and there's a licence flag (see Part 2).
- **Note:** this is pure ASSUMPTION and the job most likely to be ignored. Cut it first if A9 fails.

### J6. Check in the shop and ask the pharmacist (may be cut)

> **When** I'm at a shelf or asking a pharmacist, **I want to** scan the barcode and show my skin bands without handing over my phone or photo, **so I can** get advice that fits and stay in control.

- **Functional:** barcode lookup in our catalogue, then Open Beauty Facts (348 India-tagged products with complete ingredients, so expect UNKNOWN often; this lookup is 3rd on the cut list). A pharmacist QR showing bands only, expiring after 30 minutes, with Revoke (4th on the cut list). Cloudflare KV can still show a revoked profile for up to about 60 seconds (skinkey_report.md).
- **Medicine gate:** if a product contains adapalene, tretinoin, benzoyl peroxide, clindamycin, hydroquinone, ketoconazole or a steroid, show only "This looks like a medicine. Ask the pharmacist." See A12 for the risk of it firing on everyday products.

## 3.4 Anti-personas: who SkinKey is not for

If a participant fits one of these, still finish the session, but note their need as "out of scope" and leave it out of the requirements. Point anyone with a medical need to a doctor or pharmacist.

1. **People who want a diagnosis of a skin condition** (acne vulgaris, rosacea, eczema, melasma, infections, or whether a mole is dangerous).
   - SkinKey gives cosmetic-appearance guidance only: "looks oily", never "treats acne" (FDA intended-use risk, evidence.md).
   - Dermatology AI is limited on dark skin (Daneshjou 2022, medical AI, not cosmetic skin analysis), and only 2.1% of open skin-lesion images record Fitzpatrick type (Wen et al. 2022).
   - There is no mole-change wording. AI scores never trigger a "see a dermatologist" message; only the fixed symptom checklist the user ticks does that.
2. **People using prescription or medicine-strength products.** The medicine gate deliberately refuses these.
3. **People who want a precise number, a "skin age" or before-and-after proof.**
   - We show bands only, with a fairness note.
   - Our research found no support for the idea that progress tracking improves adherence. evidence.md lists "progress tracking → adherence" as NOT supported, so treat it as a hypothesis only.
4. **Minors (under 18).** They're outside the 20–35 target, and face-scan consent for minors carries more risk (ASSUMPTION: we haven't checked Indian rules). Don't recruit anyone under 18 today.
5. **People who want everything decided for them** (a routine builder, a chat concierge, "add to cart for me"). SkinKey answers one question: does this product suit me?
6. **Pure deal hunters.** We don't compare prices, and we can't show Amazon ratings or reviews.
7. **Retailers and brands (B2B)** who want shopper data.
   - SkinKey does not sell data.
   - The photo goes to YouCam only for analysis and is then deleted.
   - Skin bands leave the phone only when the user creates a pharmacist share, which expires after 30 minutes or when revoked.
   - Our own links go to a web page that carries affiliate tags.

**People who won't do any face scan are not an anti-persona.** The core value depends on the scan, but count how often refusal comes up (A4). If most participants refuse, a no-scan mode becomes a decision for the team.

**Do not exclude these people:**
- People with deeper skin tones. They must be included. The risk of bias is ours to disclose, not a reason to leave them out.
- Men and non-binary shoppers. They're part of the gender-neutral target.
- People less comfortable reading English. The UI is English-only, so record any friction as a known limitation, and let them answer in any language.
- People using low-end Android phones or who need larger text. Note any problems with display or speed.
