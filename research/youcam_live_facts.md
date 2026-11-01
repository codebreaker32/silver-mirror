# YouCam API: live facts (verified with our key, 2026-11-01 16:55 UTC)

- Auth: `Authorization: Bearer $YOUCAM_API_KEY` works against https://yce-api-01.makeupar.com (HTTP 200).
- **Unit balance** (`GET /s2s/v1.0/client/credit`): **1,040 units**, made up of 1,000 PAYG units plus 40 units with a later expiry.
- Live costs (`GET /s2s/v2.0/credit/feature-cost`; full list in youcam_skus_live.json):

| Feature | Endpoint | Units |
|---|---|---|
| Skin Analysis v2.1 SD, 1–4 / 5–8 / 9–12 / 13–16 concerns | /s2s/v2.1/task/skin-analysis | 9 / 12 / 14 / 16 |
| Skin Analysis v2.1 HD, 1–4 / 5–8 / 9–12 / 13–16 concerns | /s2s/v2.1/task/skin-analysis | 12 / 16 / 20 / 22 |
| Facial Color Tones Analyzer | /s2s/v2.0/task/skin-tone-analysis | **20** |
| Makeup VTO | /s2s/v2.0/task/makeup-vto | 1 |
| Look VTO | /s2s/v2.0/task/look-vto | 2 |
| Skin Simulation, 1–4 / 5–10 concerns | /s2s/v2.0/task/skin-simulation | 4 / 6 |
| Fitzpatrick | /s2s/v2.0/task/fitzpatrick-scale-analyzer | 10 |
| Face Attribute & Ratio, 1–5 features | /s2s/v2.0/task/face-attr-analysis | 10 |

## Budget implications
- A full onboarding scan (HD 5–8 concerns 16 + Color Tones 20) plus 2 tinted VTO renders (2) comes to **about 38 units per profile**.
- 1,040 units covers about 27 full profiles. The plan:
  - Mock YouCam responses during development, using recorded fixtures from one real run.
  - Cache the demo profile.
  - Spend units only on real test scans and the demo recording.
- Color Tones is the most expensive call. Run it once per profile and only if it drives the tinted try-on.
- Bonus: +500 units per qualifying social demo video, maximum 2 (press release).
