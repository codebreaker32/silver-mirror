# SkinKey: your Skin Passport idea, checked against the facts

*Checked 2026-11-01. Deadline 2026-11-02, 11:45 AM ET, which leaves about 14 build hours. "UNVERIFIED" means nobody could confirm it from an official source or a test of our own.*

**Short answers to your two questions**

1. **Can we include all three ideas?** Yes, but build them as one skin profile used in three places, not as three separate apps. The main feature is checking a product shared from the Amazon or Flipkart app. Skin Forecast and the in-store check stay small. If all three get equal weight, judges will see a feature list rather than one idea.
2. **Can a click on an Amazon or Flipkart link open our app?** No. Only Amazon and Flipkart decide which app opens their links, and their link files list only their own apps.
   - **What does work:** the shopper taps **Share** inside the Amazon or Flipkart app and picks our app. We check the product against their skin.
   - We then open Flipkart's own search already filtered to their skin type. That filter URL was tested and returned the filtered page.
   - Links on **our own** web address can open our app.

**One correction you need to know.** "There are no skin integrations on Amazon and Flipkart" is not true.
- **Flipkart** has had a selfie-based "Skin Analyser" in its app since about December 2023. ModiFace built it; ModiFace is Perfect Corp's main competitor and is owned by L'Oréal ([ModiFace newsroom](https://news.modiface.com/newsroom/flipkart-launches-modiface-powered-skin-analyser), [CXOToday](https://cxotoday.com/media-coverage/flipkarts-modiface-powered-skin-analyser-an-ai-based-feature-sees-strong-user-adoption/)).
- **Amazon.in** has a quiz-based "SkinCare Analyzer" ([aboutamazon.in](https://www.aboutamazon.in/news/retail/personalised-skincare-routine-with-amazon-skincare-analyzer)).
- Whether both are still in the 2026 apps is UNVERIFIED. Check on a phone in hour 1.
- **What's still new:** each store's tool only works inside that store and only recommends from its own catalogue. SkinKey is **one measured profile on your phone** that checks **the exact product you're looking at**, from any store app, and that you can show to a pharmacist.

---

## 1. Can we do the Amazon and Flipkart integration?

### What works

**A) Share-in: from the Amazon or Flipkart app into our app (the main feature)**
- This is a standard Android share target: an intent-filter for `ACTION_SEND` with mimeType `text/plain`, reading `EXTRA_TEXT` ([Android docs](https://developer.android.com/training/sharing/receive)). VERIFIED.
- Library: `expo-share-intent` 9.0.0, released 2026-10-21. It needs Expo SDK 58 ([npm](https://registry.npmjs.org/expo-share-intent), [GitHub](https://github.com/achorein/expo-share-intent)). VERIFIED.
  - `useShareIntent()` gives us `text`, `webUrl` and `meta.title`. `meta.title` works on Android.
  - It does **not** run in Expo Go, so you need a dev build: `eas build -p android --profile development` or `expo run:android`.
- **UNVERIFIED (test first):**
  - What the shared text actually contains. Probably the product title plus an `amzn.in/d/...` or `dl.flipkart.com/s/...` link, but nobody has confirmed it.
  - Whether each app uses the normal Android share menu at all.
- **Fallbacks if only a link arrives:**
  1. An editable "Is this the product?" field.
  2. Follow the redirect on the phone and pull the product ID from the final URL: the ASIN after `/dp/` for Amazon, `pid=` for Flipkart. Both patterns are UNVERIFIED.
  3. Let the user type the name.
- Resolving the short link on a server is unreliable. A real Flipkart short link returned 504/500 in our own test.

**B) Link-out: opening a store search that's already filtered**
- **Flipkart (VERIFIED, HTTP 200):** the page data showed the skin-type filter applied (`"facetMap":{"facets.skin_type[]":["Oily Skin"]}`).
  - URL pattern: `https://www.flipkart.com/search?q=<terms>&p%5B%5D=facets.skin_type%255B%255D%3DOily%2BSkin`
  - Values we saw: Oily Skin, Dry Skin, Combination Skin, All Skin Types.
  - These parameters are not documented, so they could change. Keep a fallback URL that sends the keywords only.
- **Nykaa (partly VERIFIED):** `https://www.nykaa.com/search/result/?q=<terms>` works. The URL syntax for its skin-type filter is UNVERIFIED, so use keywords only.
- **Amazon.in (UNVERIFIED):** `https://www.amazon.in/s?k=<terms>&i=beauty`. Amazon returned 503 to our fetchers, so this wasn't tested. There is no skin-type parameter, so the skin terms go into the search words.
- **Does the store app open, or the browser?**
  - All three domains publish Android app-link files: Amazon.in for `in.amazon.mShop.android.shopping` ([assetlinks](https://www.amazon.in/.well-known/assetlinks.json)), Flipkart for `com.flipkart.android` ([assetlinks](https://www.flipkart.com/.well-known/assetlinks.json)), Nykaa for `com.fsn.nykaa` ([assetlinks](https://www.nykaa.com/.well-known/assetlinks.json)). VERIFIED, but only at the domain level.
  - **UNVERIFIED:** whether search URLs open inside the apps, and whether the Flipkart app keeps the skin filter or drops it.
  - If the app isn't installed, the browser opens. Use `Linking.openURL` or a Chrome Custom Tab, never a WebView.

**C) Our own links open our app (stretch goal)**
- Android App Links for `https://skinkey.<domain>/p/<token>`:
  - set `intentFilters` with `autoVerify: true` in app config;
  - serve `/.well-known/assetlinks.json` with our package name and SHA256 fingerprint ([Expo docs](https://docs.expo.dev/linking/android-app-links/)). VERIFIED.
- Without the app installed, the same URL shows a normal web page. That fallback is our own design, not documented Expo behaviour.

### What does not work

- Amazon or Flipkart links can't open our app.
- We can't add a button, overlay or filter inside their apps.
- We can only filter their results through the URL options they already accept: Flipkart's skin type, brand and discount filters, and keywords only on Amazon and Nykaa.
- We can't get ingredient lists from them:
  - Amazon's old product API (PA-API 5) has been replaced by the Creators API ([Amazon](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/paapiv5-deprecation)). The Creators API needs an approved Associates account plus 10 sales in 30 days, and it has no ingredients field ([onboarding](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/onboarding/register-for-creators-api), [item info](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference/resources/item-info)).
  - Flipkart's affiliate API has no ingredients field either ([docs](https://affiliate.flipkart.com/api-docs/af_glossary.html)), and sign-ups have reportedly been paused since 2018 (UNVERIFIED that this is still true).
- No scraping:
  - Flipkart's terms ban "deep-link, page-scrape, robot, spider…" ([terms](https://www.flipkart.com/pages/terms)).
  - Amazon.in's robots.txt blocks the common bots ([robots.txt](https://www.amazon.in/robots.txt)).
- No affiliate links in the app. Amazon Associates India requires separate approval for mobile apps (policy rule 7, agreement rule 21: [policies](https://affiliate-program.amazon.in/help/operating/policies), [agreement](https://affiliate-program.amazon.in/help/operating/agreement)).
- No Amazon reviews or ratings (rule 28), no WebViews of Amazon pages (rule 21), and no Amazon or Flipkart logos.
- In the README and pitch, say "opens a Flipkart search", not "deep-links into Flipkart".

---

## 2. The combined app: SkinKey

**Why rename:** a hackathon repo called ShelfSense already uses the name "Skin Passport" ([repo](https://github.com/Noufalthecoder/ShelfSense)). No trademark search has been done for "SkinKey" (UNVERIFIED).

**One sentence for everywhere:** *"Share any skincare product from the Flipkart or Amazon app to SkinKey: it checks it against your measured skin and opens Flipkart already filtered to your skin type."*

### Main flow: share a product and get a verdict
1. **Skin Profile, done once.**
   - A consent screen, then the selfie.
   - Upload through our small proxy (Cloudflare Worker) so the API key never ships inside the app.
   - Run YouCam Skin Analysis.
   - Keep only about 10 numbers on the phone: skin type, bands for oiliness, moisture, redness, acne, pore, texture and radiance, and the scan date.
   - Delete the photo. Show a "What we keep" screen with a Delete button.
2. In the Flipkart or Amazon app, the shopper taps **Share → SkinKey**.
3. SkinKey reads the title and matches it against a small hand-built catalogue, with ingredients typed in from brand sites and a source link for each.
   - No match: fall back to keywords in the title, labelled "based on product name only".
   - Still nothing: show **UNKNOWN**.
4. Fixed rules connect the ingredients to the scores, and the app shows **FITS / CAUTION / UNKNOWN**. Each reason names the score behind it, for example "Your oiliness reading: high (scan 1 Nov)". It also shows where the data came from and a permanent "cosmetic guidance, not medical advice" line.
5. Two buttons: **Back to product**, and **Find better matches**, which opens the filtered Flipkart search or a keyword search on Amazon or Nykaa.

### Supporting features (kept small)
- **Skin Forecast:**
  - One Open-Meteo call for UV, humidity and temperature, no key needed ([docs](https://open-meteo.com/en/docs)).
  - It adds one reason to the verdict card, e.g. "high UV this week, no SPF listed", and shows one card on the home screen.
  - The free tier is for non-commercial use only and needs a CC BY 4.0 credit ([terms](https://open-meteo.com/en/terms)).
  - Don't hard-code weather numbers in the demo; show live values.
- **Aisle Check:**
  - Scan a barcode, look it up in our catalogue, then in Open Beauty Facts (`https://world.openbeautyfacts.org/api/v2/product/{barcode}`), and show the same verdict card.
  - Coverage of Indian products is thin: 348 India-tagged products with complete ingredients (our own query).
  - The data is ODbL licensed and must not be used for medical purposes ([terms](https://world.openbeautyfacts.org/terms-of-use)).
- **Show to pharmacist:**
  - A QR code linking to a web page that shows only the score bands (no photo, no skin colour).
  - The share expires after 30 minutes, and a **Revoke** button kills it immediately.

### YouCam API chain (checked against the [docs](https://yce.makeupar.com/document/index.html))
1. **Upload is per feature:** `POST /s2s/v2.0/file/skin-analysis`, which returns a presigned PUT URL. VERIFIED. Each extra YouCam feature needs its own upload and polling loop.
2. Start the Skin Analysis task, then poll `GET /s2s/v2.0/task/<feature>/<task_id>`.
3. **Delete right after reading the results:** `POST /s2s/v2.0/task/delete` removes "a finished task" together with its output and input files. VERIFIED. So the privacy screen can truthfully say the photo is deleted on YouCam's side too.
4. **UNVERIFIED:**
   - The docs list no output values for `skin_type`. If one test call doesn't show usable values, work out Flipkart's skin-type filter from the oiliness and moisture bands, and write that rule in the README.
   - Unit cost per scan: the red team read the docs as 9 units for 1–4 concerns and 12 for 5–7. I didn't re-check that, so pick 7 or fewer concerns.
5. Resize photos to at most 4096 px on the long side before upload (an Expo image-manipulator step). The red team also notes that the Skin Tone feature accepts JPG only.
6. **Drop Fitzpatrick.** It changes nothing in the app and costs units. Keep Facial Color Tones only if it drives a real rule, such as adding tinted-SPF search terms. Otherwise remove it.

### Guardrails
- Separate consent screens for the selfie and for the pharmacist share, each showing what will be shared.
- Privacy wording: "SkinKey stores no photo; YouCam processes it and we delete it from YouCam right after."
- Only cosmetic wording ("looks oily", never "treats acne").
- **Medicine gate.** If a product contains adapalene, tretinoin, benzoyl peroxide, clindamycin, hydroquinone, ketoconazole or a steroid, show only: "This looks like a medicine. Ask the pharmacist."
- The referral checklist is a fixed list of symptoms the user ticks. AI scores never trigger a "see a dermatologist" message, and there is no mole-change wording.
- Show score bands, not exact numbers, plus a note that skin AI can be less accurate on deeper skin tones and in poor light.
- A "not affiliated with Flipkart, Amazon or Nykaa" line, text-only store names, and credits for Open Beauty Facts and Open-Meteo.

---

## 3. Where it ranks

Four judges each scored the four official criteria out of 10, with equal weight, so the maximum total is 40. All 13 concepts were re-scored together in this round.

| Rank | ID | Concept | Tech | Design | Impact | Idea | Total |
|---|---|---|---|---|---|---|---|
| 1 | C6 | Silver Mirror (55+ fitting room) | 7.25 | 8.00 | 6.50 | 7.25 | **29.00** |
| 2 | **C13** | **SkinKey (this concept)** | 7.00 | 7.00 | 6.75 | 7.25 | **28.00** |
| 3 | C10 | Lineup (men's grooming) | 8.00 | 7.00 | 5.75 | 6.50 | 27.25 |
| 4 | C7 | SeatedFit (wheelchair try-on) | 6.25 | 7.00 | 6.00 | 7.50 | 26.75 |
| 5= | C1 | ShadePass (gift a shade) | 7.00 | 7.25 | 5.00 | 7.00 | 26.25 |
| 5= | C5 | DropLive (live shopping) | 7.75 | 6.25 | 5.25 | 7.00 | 26.25 |
| 7 | C3 | Counter (beauty-advisor phone) | 7.00 | 7.00 | 6.00 | 6.00 | 26.00 |
| 8 | C8 | FirstShelf (teen skincare) | 6.50 | 6.25 | 6.00 | 6.75 | 25.50 |
| 9= | C2 | GiftPass | 7.75 | 6.25 | 5.00 | 6.25 | 25.25 |
| 9= | C4 | LiveSwatch | 7.25 | 5.75 | 6.00 | 6.25 | 25.25 |
| 11 | C11 | AisleCheck (pharmacy aisle) | 6.25 | 6.25 | 6.25 | 6.25 | 25.00 |
| 12 | C12 | SwapDesk (returns counter) | 6.50 | 6.00 | 6.00 | 4.25 | 22.75 |
| 13 | C9 | Polish Pocket (nails) | 5.25 | 7.00 | 4.50 | 5.25 | 22.00 |

**Compared with the previous top 3:** the earlier report ranked C5 DropLive first (29.00), C6 Silver Mirror second (28.75) and C3 Counter third (28.25). In this re-scoring:
- C6 stays near the top at 29.00.
- **C13 is second at 28.00**, one point behind C6.
- C5 drops to 26.25 and C3 to 26.00.

The two rounds were separate judging passes, so small differences are noise. A gap of about 2 points is a real signal, and 1 point is not.

**Why C13 didn't come first:**
- Shallow YouCam use. The scan runs once, and the main moment (share, then verdict) makes no YouCam call.
- No virtual try-on, even though this is an "eCommerce VTO" hackathon.
- A small catalogue means most real shares come back as "title only" or UNKNOWN.
- Too many modules.
- No revenue path, because affiliate links aren't allowed in the app.

Judges called it **the most mobile-native** of the 13, and singled out the "filter you'd never set yourself" moment as the sharpest idea.

---

## 4. Red-team: problems and fixes

| Problem | Fix |
|---|---|
| **The main premise is false as written.** Flipkart (ModiFace selfie analyser) and Amazon.in (quiz) already have skin tools. Perfect Corp judges will likely know this, because ModiFace is their competitor. | Rewrite the pitch: "Each store's analysis is locked inside that store and doesn't check the product you're viewing. SkinKey is one measured profile, on your phone, for any product, in any store app." Replace the "filter you'd never have known to set" line with "same profile, every store, about *this* product". Screenshot both store tools in hour 1 for a README comparison table. |
| Share contents are unknown. If only a link arrives, the main demo becomes "share, then type the name". | Hour-1 go/no-go test: share from both apps into a throwaway dev build and log exactly what arrives. |
| The Flipkart app may drop the skin filter when it opens the URL. Only the web page has been tested. | Test with `adb shell am start -a android.intent.action.VIEW -d '<url>'`. If the filter is dropped, open it in a Chrome Custom Tab and say on screen "Flipkart, already filtered". |
| The YouCam scan never appears in the demo, and two of the four APIs do nothing. | Show the live scan (mask overlay, bands) in the video. Put "Measured by YouCam Skin Analysis, 1 Nov" on every verdict. Drop Fitzpatrick, and use Color Tones in one rule or drop it too. |
| Medical risk in the pharmacy aisle, where cosmetics sit next to medicines. | Add the medicine gate (section 2). Keep the referral checklist fixed, and never let AI scores trigger it. |
| Too much scope. Hand-typing ingredients for 25–40 products takes 2–3 hours on its own. | Cut to 12–15 products and 12–15 ingredient rules, and include the exact demo products. Show the counts honestly in the app. Put one real UNKNOWN in the video. |
| Expo Go can't be used, and dev builds are fragile on WSL2. | Start the EAS dev build in hour 0. Set WSL `networkingMode=mirrored` or use `adb reverse`. Cut App Links first. |
| Cloudflare KV can show a revoked profile for up to about 60 seconds. | Use a Durable Object or D1 for revoke, or refresh after 60 seconds on camera. |
| Live face-framing checks aren't available in current Expo (expo-face-detector stops at SDK 51). | Use a static oval guide and show YouCam's error codes as hints ("move closer", "more light"). |
| The Amazon half of the demo rests on unverified pieces. | Make Flipkart the guaranteed main demo. Show Amazon only if the hour-1 test passes. |
| Scripted "UV 9 in Delhi" is probably wrong for November (an estimate, not checked). | Show only live Open-Meteo values. |

Verdicts: technical feasibility survives, scope survives, and legal/novelty only survives if the pitch is rewritten.

---

## 5. The 14-hour MVP

### Hour 0–1: tests before writing any features (go/no-go)
1. Start the EAS Android dev build with `expo-share-intent` installed.
2. Share one product from each of the Amazon.in and Flipkart apps into that build and log `text`, `webUrl` and `meta.title`.
3. Open the Flipkart filter URL and the Amazon `/s?k=` URL on the phone. Check whether they open in the app and whether the filter is kept.
4. Deploy the Worker proxy, run one Skin Analysis call, and record the real `skin_type` output. Test `task/delete`.
5. Open both store apps and screenshot Flipkart's Skin Analyser and Amazon's SkinCare Analyzer.

**If share-in fails completely,** decide right away: switch to "paste link + barcode", or switch to C6.

### Must-have
- Consent, capture, upload and poll through the proxy, YouCam delete, band display and "What we keep".
- Share-in, parser, editable title, 12–15 product catalogue, rules, verdict card.
- Flipkart filter link-out with a keyword-only fallback; Amazon and Nykaa keyword links.
- Medicine gate, cosmetic wording, the not-medical-advice line, and the not-affiliated line.
- A cached demo scan, so the video never waits on YouCam.
- README with a "possible / not possible" section, the APK, and a 2–3 minute video.

### Nice-to-have, cut in this order if behind
1. Android App Links on our domain.
2. Nykaa link.
3. Open Beauty Facts lookup (keep catalogue-only barcodes).
4. Pharmacist QR web page with revoke.
5. Weather home card (keep only the UV reason on the verdict).

### Expo screen list
1. `/onboarding/consent`
2. `/onboarding/capture`
3. `/onboarding/processing`
4. `/profile` (bands, fairness note, "What we keep", Delete)
5. `/check` (opened from a share or a paste: editable title, then the verdict card with buttons)
6. `/scan` (barcode, then `/check`)
7. `/referral` (fixed checklist)
8. `/share-pharmacist` (consent preview, QR, revoke)
9. `/` home (weather chip, "check a product", "scan in store")
10. `/about` (credits and disclaimers)

### Suggested hours

| Hours | Work |
|---|---|
| 0–1 | Tests above |
| 1–4 | Skin Profile |
| 4–9.5 | Main feature, including the catalogue |
| 9.5–10 | Weather signal |
| 10–11.5 | Barcode and referral |
| 11.5–12.5 | Pharmacist QR |
| 12.5–14 | Wording pass, README, APK, video |

### Video plan (about 2:30)

| Time | What's on screen |
|---|---|
| 0:00–0:10 | "63% are wrong about their skin type" (Labskin 2022, vendor survey) |
| 0:10–0:40 | Live YouCam scan, then "What we keep" |
| 0:40–1:35 | Flipkart share, CAUTION with reasons, filtered Flipkart opens |
| 1:35–1:45 | Amazon share, showing an honest UNKNOWN or title-only result |
| 1:45–2:10 | Barcode, referral, pharmacist QR, revoke |
| 2:10–2:30 | What's possible and what isn't |

---

## 6. Recommendation

Build SkinKey: it ranks second (28 of 40, one point behind C6 Silver Mirror) and is the strongest answer to what you asked for, a skin-filtered Flipkart search reached from the share menu inside the Amazon and Flipkart apps. Rewrite the pitch around "one profile, any store, this product", because Flipkart and Amazon.in already have skin tools of their own, and keep Forecast and Aisle Check as small reuses of the same profile. Treat hour 1 as a hard gate: if sharing from the Flipkart app doesn't deliver a usable title, or the build loop doesn't work, switch to C6.

**Sources I checked in this pass:**
- [YouCam API docs](https://yce.makeupar.com/document/index.html): the per-feature upload endpoint and `task/delete` are VERIFIED; `skin_type` output values were not found.
- [ModiFace newsroom: Flipkart Skin Analyser](https://news.modiface.com/newsroom/flipkart-launches-modiface-powered-skin-analyser)
- [CXOToday: Flipkart Skin Analyser adoption](https://cxotoday.com/media-coverage/flipkarts-modiface-powered-skin-analyser-an-ai-based-feature-sees-strong-user-adoption/)
- [aboutamazon.in: SkinCare Analyzer](https://www.aboutamazon.in/news/retail/personalised-skincare-routine-with-amazon-skincare-analyzer)

All other sources come from the research inputs, linked inline above. Background facts are in `/home/aman/youcam/research/evidence.md`, and the competitor list is `/home/aman/youcam/research/competitor_repos.tsv`.