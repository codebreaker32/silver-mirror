# Silver Mirror: status handoff (updated 2026-11-02 ~18:05 IST)

Deadline: **2026-11-02 22:15 IST** (11:45 ET). Internal submit target: **19:30 IST**.
Formerly SkinKey; user-facing name is Silver Mirror (code ids, `app.skinkey` and the Worker URL keep the old name).

## Done today (2 Nov)
- **On-device test** on the Samsung (release APK + mock Worker): `design/device-shots/BUGS.md`. Bugs 1–6 fixed (warm-start shares, honest catalogue tiers, slug titles, SKU disqualifiers, Nykaa Custom Tab, share-pin card).
- **Audit `brand-claims-1`:** method frozen, rules frozen, run, each tagged in git (`audit-method-frozen` 561344d → `rules-frozen` 2122b55 → `audit-run` 19ef9a2). N=140, a=136, Label Check 0 of 136, claim vs reading profile 70 of 136. Replaces the Flipkart frame (store automation would breach Flipkart's terms; approved).
- **Silver Mirror redesign** from Aman's moodboard: tokens v2.0.0 (pearl / graphite, slate pills, sage / amber / slate / ink verdicts), chrome-S brand mark, `DESIGN.md`; every mobile screen (home, check, verdict, better matches, scan, reading, try-on, settings, How this was made) and the web (landing, `/check`, `/audit`, `/rules`, `/how`, `/r/:token`), light and dark.
- **Build VM tooling:** `scripts/remote.sh`, headless emulator QA (`ops/vm/emu.sh`); release APKs rebuilt and walked through in light and dark (`design/emulator-shots/`).
- **Review batch:** design critique, copy truth and functional QA fixes (see BUGS.md "Review batch").
- **Try-on reachable on real shares (`0361cb3`):** 7 of the 11 tinted SPF rows carry brand-sourced shade colours (Foxtale 9, Earth Rhythm 5; Pilgrim, Re'equil, The Derma Co, Dot & Key, Aqualogica one each; source per shade in `hex_source`). Emulator QA ran Foxtale (two shades) and Re'equil (one shade) end to end on the mock Worker (`c89d60a`).
- **Final hardening (pm):** dark-mode camera screen readable again, honest single-shade try-on label, try-on under the reasons, better-match cards search the shopper's own store, docs updated for try-on (BUGS.md "Final hardening (2 Nov pm)"). Both APKs rebuilt.
- **Submission package (this pass):** `README.md` rewritten (story, YouCam chain with measured numbers, privacy, honesty, audit headline, mermaid diagrams, screenshots in `docs/screens/`), `docs/DEVPOST.md` (every Devpost field + judging mapping), `docs/DEMO_SCRIPT.md` (2:30 script, shot list, real vs cached). The copy linter now also checks `docs/DEVPOST.md` and `docs/DEMO_SCRIPT.md`.

- **Showcase match (2 Nov pm):** every screen restyled to the showcase image (P1–P4 + round 1): lavender-grey page, white cards, sans headings, slate pills, centred titles, flat tab bar, gradient skin-type hero, focus tiles, corner-bracket frames, liquid-silver welcome; graphite dark. Gates green; **both APKs rebuilt at 17:34 / 17:39 IST**; emulator QA (full + try-on, light + dark) 0 failures; `docs/screens/` refreshed. Details in BUGS.md "Showcase match (2 Nov pm)".

## Current state
- **APKs:** `dist-apk/silver-mirror-release.apk` (live Worker) and `dist-apk/silver-mirror-release-localworker.apk` (localhost:8787 via `adb reverse`).
- **Works on the emulator with the mock Worker:** shares from all three stores (cold and warm), SKU confirm, FITS / CAUTION / UNKNOWN / MEDICINE, better matches, scan flow, Demo reading, settings, How this was made.
- **YouCam:** HD Skin Analysis, Makeup VTO and delete verified live on the sample face (`spikes/FINDINGS.md`); about 1,022 units left after the spike. Band cutoffs are provisional until a consenting person is scanned.
- **Catalogue:** 180 rows, 125 usable for verdicts (second-read brand-page check), 0 human-ticked.
- **Open, known:**
  1. ~~Try-on not reachable on real shares~~ **Closed** (`0361cb3`): 7 tinted rows have brand-sourced shade colours. The catalogue lives in the Worker, so no APK rebuild is needed for it, only the Worker redeploy in checklist step 2. The 4 rows without a brand swatch keep the button hidden.
  1b. **The app's own live YouCam chain has never run end to end** (upload slot → `src_file_id` → analysis → delete; try-on with skin tone + VTO on one file, then per-task deletes; spike gaps G2, G3, G7). Checklist step 2b.
  2. **Flipkart short links** (BUGS.md item 7): fixed in code (`cb43f27`): the phone follows the link and sends the listing URL; the Worker parses it offline. Needs the Worker redeploy (checklist step 2) and a real-phone share to confirm live.
  3. **`INSTALL_HMAC_SECRET`** on the live Worker (BUGS.md item 8): confirm it's set.
  4. 86 flagged audit rows await a person's review (`audit/review.md`).
  5. `npm run secrets:grep` with real key values (the VM has no `.env`).
  6. Web is not deployed; Devpost links to the repo and APK.

## AMAN'S CHECKLIST (when you return)
1. **Install the app on your phone:** `adb connect <ip:port>` (Wireless debugging), then `adb install -r dist-apk/silver-mirror-release.apk`. While it's on the phone, check BUGS.md "Final hardening" QA 3 once: start a try-on, swipe the app away while the camera permission prompt is open, then share a Nykaa product. It should open the check, not Home (only reproduced on the emulator so far).
2. **Redeploy the Worker and fix the install secret** (3 minutes, both are your steps):
   - `cd /home/aman/youcam && set -a && . ./.env && set +a && cd apps/worker && printf '%s' "$INSTALL_HMAC_SECRET" | npx wrangler secret put INSTALL_HMAC_SECRET --env production`
   - `npx wrangler deploy --env production` (ships the Flipkart short-link change `cb43f27` **and the shade colours `0361cb3`**: the live Worker serves the catalogue, so without this the live APK still hides try-on)
   **Then check the live Worker** (2 minutes): `curl -X POST https://skinkey-worker.skinkey-worker.workers.dev/v1/install` returns a token. If it says "Install tokens are not configured", run the one-liner in BUGS.md item 8. Then share one Flipkart and one Nykaa product into the app; note whether the Flipkart one gets a title.
2b. **First live run through the app (before hallway tests and recording; about 17–39 units).** On the release APK: one consented self-scan (16 units), then one single-shade try-on on Re'equil Sheer Zinc Tinted Sunscreen from Nykaa (1 unit). Optional if the budget allows: one Foxtale two-shade try-on (22 units) to check Skin Tone live. Screenshot "How this was made" each time (real task ids, units, "Deleted from YouCam"). Record G2, G3 and G7 as pass or fail with the time in `spikes/FINDINGS.md`, and fill the README "Measured" cells (upload slot row). If a step fails, write that in the README rather than claim it.
3. **Hallway tests, 3 consenting people,** using `design/research/questionnaire_quick.md`. For each: spoken or written consent first, one consented scan each (16 units each), one share from their usual store app, then the questions. Note what they say about the verdict wording, UNKNOWN and CAUTION. Write results in `design/research/hallway_2026-11-02.md` (counts and short paraphrases, no names or faces). After each person: Settings → Delete my reading.
4. **Record the demo** per `docs/DEMO_SCRIPT.md` (daylight, as soon as possible). Pre-check the products against the recorded reading first. Export an `.srt` into `docs/` for the linter.
5. **If you approve publishing:** create the GitHub repo (private or public, your call), push, and create a Release with `dist-apk/silver-mirror-release.apk` attached. Check `git status` that no `.env` / `.dev.vars` is included, and run `npm run secrets:grep` locally first.
6. **Devpost:** paste the fields from `docs/DEVPOST.md`, fill the four links (video, repo, APK release, audit), add screenshots from `docs/screens/`, and **submit by 19:30 IST** (hard deadline 22:15 IST).
7. Optional if time: tick reviewed audit rows in `data/catalog/verified.json` and re-run as `audit-run-2`.

## Audit (2 Nov): method brand-claims-1
- Method: `audit/METHOD.md` (tag `audit-method-frozen`). Population: brand-page rows in `data/catalog/brands/`, claims from `marketed_for` + name, checked against the same page's INCI.
- Rules frozen: tag `rules-frozen`, ruleset `440f555a8845`, record in `audit/rules-frozen.json`.
- Run: tag `audit-run` → `audit/results.csv`, `audit/summary.json`, `audit/review.md`. N=140, a=136, checked 136, Label Check c=0 / d=0, claim vs reading profile e=70 of b=136. Six readings (CAUTION): Oily 13, Combination 12, Oily & Redness 72, Combination & Redness 67, Normal 0, Dry 12.
- `/audit` on the web renders only from `audit/summary.json` (schema 2).
