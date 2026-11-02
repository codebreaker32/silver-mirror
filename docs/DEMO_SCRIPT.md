# Demo video: script and shot list (2:30)

For Aman to record on his own phone (Samsung SM-A276B) this afternoon, in daylight. Target length 2:30; the Devpost limit is 1–3 minutes. Narration is about 330 words, which fits 2:30 at a calm pace.

Rules for every line and caption: cosmetic language only; say "reading", never `your skin is`; no scores; CAUTION is "may not suit my readings", never a warning about the product. Name what is real and what is cached on screen.

## Before you record (30 minutes)

1. **Install** `dist-apk/silver-mirror-release.apk` (talks to the live Worker): `adb install -r dist-apk/silver-mirror-release.apk`.
2. **Check the live Worker** (BUGS.md items 7 and 8):
   - `curl -X POST https://skinkey-worker.skinkey-worker.workers.dev/v1/install` must return a token, not "Install tokens are not configured". If it fails, run the `wrangler secret put INSTALL_HMAC_SECRET --env production` line from BUGS.md item 8.
   - Share one Flipkart product into the app. If it comes back UNKNOWN with no title, the live Flipkart lookup is still blocked from Cloudflare (item 7). Then record the verdict beats from **Nykaa and Amazon** and use Flipkart only for the "filtered search" beat (that one opens the Flipkart app directly and does not need the lookup).
3. **Phone setup:** Do Not Disturb on; Developer options → Show taps on; screen recorder (or `scrcpy --record demo.mp4` over Wireless debugging) at full resolution. Light theme for the main takes; one short take in dark theme (Settings → Display) for the montage.
4. **Share sheet privacy:** the Android chooser shows direct-share contacts at the top. Blur that row in the edit, or long-press each suggestion → "Don't suggest" before recording.
5. **Pin Silver Mirror** in the share sheet (long-press → Pin) so it's visible without scrolling.
6. **Pre-check the products against the reading you'll record with.** Verdicts depend on the reading on the phone. After the scan take (Take A below), paste each product name into Home → "Paste a link or name" to see what it returns. Candidates from the verified catalogue:

| Purpose | Product (store) | What our rules return |
|---|---|---|
| CAUTION with a reason | CeraVe Oil Control Moisturising Gel Cream For Oily Skin (Nykaa or Amazon) | CAUTION when the oiliness reading is High (rule OCC-1 or OCC-2 names the ingredient) |
| CAUTION, redness | Dot & Key Vitamin C + E Super Bright Gel Moisturizer (Nykaa) | CAUTION when the redness reading is High (FRG-1, fragrance ingredient) |
| FITS with a reason | Minimalist SPF 50 Sunscreen 50g (Nykaa) | FITS; with oiliness High it cites niacinamide (SUP-2) |
| UNKNOWN, honest | Vaseline Gluta Hya Dewy Radiance (Flipkart) | UNKNOWN, not in our catalogue → "Snap the ingredient list" |
| MEDICINE | Differin Adapalene Gel 0.1% 15 g (Amazon) | Medicine gate |

   If the recorded reading has no High or Low band, no rule fires and everything reads FITS without reasons. In that case record beats 1–3 with the **Demo reading** (oiliness High): it is only offered while no reading is on the phone (Home → "Use the Demo reading"), so record those takes **before** Take A, or after Take F. Keep the "Demo reading" badge in frame and change the beat 2 line to "with the demo reading".
7. **Units:** each live scan costs 16 YouCam units (balance was about 1,022 after the spike). No try-on units are needed (see beat 6).

## Shot list and narration

| # | Time | Shot (phone screen unless noted) | Narration | Caption on screen |
|---|---|---|---|---|
| 1 | 0:00–0:12 | Nykaa app, a moisturiser listing whose title says "for oily skin". Slow scroll past the claim. | "This listing says it's for oily skin. The seller wrote that. Opened skincare usually can't go back." | "Desk research: opened skincare usually can't be returned on Nykaa and Purplle." |
| 2 | 0:12–0:40 | **One unbroken take.** Share → Silver Mirror → "Which product is this?" → tap the match → verdict card → scroll to "Why". | "So I share it to Silver Mirror. It asks which product this is, and checks nothing until I pick. Then our rules compare its ingredient list with my YouCam reading. CAUTION: it may not suit my readings, and here's the ingredient and the rule behind that." | "Real phone · real time · uncut" |
| 3 | 0:40–0:55 | Tap "Better matches" → three FITS cards → tap the store link "Opens a Flipkart search, filtered to Oily Skin" → Flipkart app opens with "1 Filter". | "Better matches are ranked by fit to my readings. No paid placements. This link opens Flipkart's own search, already filtered to my skin-type reading." | "Ranked by fit. No paid placements." |
| 4 | 0:55–1:10 | Amazon app → Share → **More** → Silver Mirror → verdict (FITS with reason, or the Differin medicine gate). | "Amazon hides other apps behind More, so the app teaches that step. And if a listing looks like a medicine, we stop and point to a pharmacist." | "Amazon: Share → More → Silver Mirror" |
| 5 | 1:10–1:35 | **Take A, consenting person** (recorded first, edited in here). Scan tab → consent screen ("What stays on this phone") → 18+ tick → selfie → steps: Uploaded, Analysing (HD), Reading results, Deleted from YouCam → Your reading with bands. | "The reading comes from one consented selfie and YouCam HD Skin Analysis. About ten seconds. We keep bands, Low, Medium or High, never a score. And the photo is deleted from YouCam before we show this tick." | "Consent given on camera. YouCam HD Skin Analysis, live." |
| 6 | 1:35–1:47 | Still card (edit): `spikes/g5_foundation_deep.jpg` and `spikes/g5_lip_sheer.jpg` side by side. | "YouCam Makeup VTO is wired for tinted products: two shades on the same photo. Preview, not a shade guarantee." | "YouCam Makeup VTO, live API spike on Perfect Corp's sample face. In the app once a shade colour is on file." |
| 7 | 1:47–2:02 | Settings (gear on Home) → How this was made: YouCam task id, units, "Deleted from YouCam ✓". Then back in Settings → Delete my reading → Home shows "No reading yet". | "Every check shows its working: the YouCam task, the units, and the confirmed delete. And one tap deletes my reading from the phone." | "Delete confirmed by YouCam, about 2 s after the request." |
| 8 | 2:02–2:20 | Laptop screen: `docs/screens/14-web-audit-result-light.png` (or the README audit section on GitHub), then terminal `git tag` showing `audit-method-frozen`, `rules-frozen`, `audit-run`. | "We pre-registered an audit: 136 brand-page products, their claims checked against their own ingredient lists. None failed a label check. 70 were flagged by our rules for a reading their own claim points to." | "Flagged by our published rules, not a measured effect on skin. Our sample, not the market." |
| 9 | 2:20–2:30 | Home screen in dark theme, then the app icon. | "Claude reads the listing. Our rules decide. Silver Mirror." | "Cosmetic guidance, not medical advice. Not affiliated with Flipkart, Amazon or Nykaa." |

Beat 2 is the one that matters most: if a take breaks, redo the whole take rather than cutting inside it.

## Recording order (so the reading on the phone is the right one)

1. **Take A:** the consenting person's scan (beat 5). Their reading is now on the phone. Get their spoken "yes, you can record this" on video or in writing before the camera starts; keep their face out of the final cut except inside the app's own frame, or crop to the screen.
2. Pre-check products (step 6 above) against that reading.
3. **Takes B–E:** beats 1–4 with that reading.
4. **Take F:** beat 7 (How this was made, then Delete my reading). Do this last, because it removes the reading.
5. Beat 8 on the laptop, beat 9 in dark theme (it shows the Demo reading or "No reading yet"; either is fine).

If there is no consenting person in time, record beat 5 with Aman's own consented scan.

## What is real and what is cached

| Element | Real or cached |
|---|---|
| Share payloads from Flipkart, Amazon, Nykaa | Real, from the store apps on the phone |
| Product match ("Which product is this?") | Real Claude call through the live Worker; catalogue rows were copied earlier from brand pages and ship with the app |
| Verdict and reasons | Computed at check time by the published rules (ruleset `440f555a8845`) from the reading on the phone and the catalogue row |
| Skin reading (beat 5) | Live YouCam HD Skin Analysis call, 16 units; photo deleted from YouCam and the delete confirmed |
| Demo reading (if used) | Labelled sample readings, badge stays in frame |
| Better matches | Catalogue rows, ranked on the phone; the Flipkart filtered search opens live in the Flipkart app |
| Try-on images (beat 6) | Saved output of the live API spike on Perfect Corp's sample face (1 Nov), not an app screen |
| Audit numbers (beat 8) | Output of the tagged run `audit-run` (`audit/summary.json`), not re-run on camera |
| UNKNOWN / MEDICINE screens | Real app responses to real listings |

## Edit checklist

- Total 2:20–2:40. Novelty (share → verdict) lands by 0:20.
- Blur direct-share contacts in the share sheet and any notification.
- Keep the "Demo reading" badge visible whenever the Demo reading is used.
- Subtitles: export an `.srt` into `docs/` so `npm run lint:claims` checks it.
- Upload unlisted to YouTube, paste the link into `docs/DEVPOST.md` and Devpost.
