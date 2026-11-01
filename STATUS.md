# SkinKey: status handoff (written 2026-11-01 ~23:30 IST)

Deadline: **2026-11-02 22:15 IST** (11:45 ET). Internal submit target: **19:30 IST**.

## Done tonight
- Research, concept scoring and the locked v2 spec: `research/skinkey_v2_spec.md`.
- User research pack and design brief: `design/research/`. Quick questionnaire: `design/research/questionnaire_quick.md`.
- Design direction locked (Clay & Ink + Deep Teal grafts). Design system: `design/system/` (tokens, components.md, showcase.html).
- Live YouCam spikes on Perfect Corp's official sample face: `spikes/FINDINGS.md`. 18 units spent; balance about 1,022.
  - HD scan returns zone labels. **Higher raw_score means less visible concern** (the bands must invert).
  - Delete works with about a 2 s lag; confirm with retries.
  - Try-on renders are visible.
  - The Flipkart skin-type URL opens the Flipkart app already filtered.
  - Share payloads for Flipkart, Amazon (Share → More) and Nykaa are captured.
- Logins: Expo (smrtamy23@gmail.com), Cloudflare (guruamy26), gcloud project `skinkey-hackathon-2611` created with Testing and Tool Results APIs enabled. **Billing is not linked.**

## Running overnight (background workflows)
- Build: monorepo in `apps/` and `packages/`, then integrate, review, fix and attempt an Android build. Progress: `BUILD_NOTES.md`.
- Catalog: per-brand verified INCI lists in `data/catalog/brands/`, then `catalog.json` and `AUDIT.md`.

## Claude's first jobs when the session resumes
1. Read the build and catalog workflow results.
2. Apply the spike findings to the code:
   - inverted raw_score bands
   - delete-confirm retry
   - Flipkart redirect-header resolver
   - Amazon and Nykaa title parsers
   - "Amazon: Share → More" coach mark
   - Nykaa outbound in a Custom Tab
3. Load the real G1 and G5 JSON from `spikes/` into the Worker mock fixtures.
4. Run /impeccable and /design:design-critique on the 5 must-be-stunning screens.

## Aman's morning checklist
1. Turn on Wireless debugging and send the new IP:port (already paired).
2. Optional, for the local emulator: `! sudo usermod -aG kvm $USER && sudo chmod 666 /dev/kvm`
3. Optional, for Firebase Test Lab on real cloud phones: add Firebase to project `skinkey-hackathon-2611` (console.firebase.google.com → Add project → choose the existing GCP project, Spark plan).
4. Take one consented selfie for band calibration and save it as `test-assets/selfie.jpg` (about 16 units).
5. Flipkart audit frame (about 45 min):
   - search "moisturiser" with the Oily Skin filter and screenshot the first ~40 results in page order
   - search "sunscreen" with the same filter and screenshot the first ~20 results
6. Run 3+ quick hallway tests (questionnaire).
7. Record the demo video in daylight, roughly 14:00–17:00 IST.
