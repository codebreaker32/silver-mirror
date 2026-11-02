# Silver Mirror demo video: script and shot list

Voice: ElevenLabs eleven_v3 with audio tags (excited, playfully, warmly...): Charlie for hook
and close, Jessica for the rest. One mp3 per scene (marks rescaled from the older render) in
`public/voiceover/`. Scene length = 0.3s lead + voice + 0.6s tail, plus a few extra seconds on the
footage scenes so the phone recording can play out (`EXTRA` in `scripts/sync-durations.mjs`).

Footage is real phone screen recording from Aman's Samsung (720x1560, `adb screenrecord`), kept
out of git in `design/device-shots/live/rec/`. `scripts/cut-clips.sh` (VM only) cuts it into
constant-30fps H.264 segments in `public/clips/`; `src/footage.ts` lists which segment plays
in which scene, and masks two small labels the video should not show (the "Pasted link" source
line and rule codes).

| # | Scene | Narration | On screen |
|---|-------|-----------|-----------|
| 1 | hook | Mirror, mirror, on the wall. Will this serum suit me at all? | Title over the welcome backdrop |
| 2 | shelf | Every skincare shelf has one. The bottle that didn't suit you. And opened skincare can't go back. | Product photos, the one that didn't suit |
| 3 | gap | Store skin quizzes only know their own catalogue. And no listing knows your skin. | Store quiz vs listing cards |
| 4 | scan | So Silver Mirror starts with one consented scan. YouCam's HD Skin Analysis reads oiliness, pores, moisture and redness. Then the photo is deleted from YouCam. Only Low, Medium and High stay on your phone. | Phone: consent with the 18+ tick, camera capture, uploading / analysing / deleting steps, the "Dry skin" reading. Caption: "Live YouCam HD Skin Analysis. Photo deleted after." |
| 5 | share | Now shop the way you already do. Nykaa, Flipkart or Amazon. Tap share. Pick Silver Mirror. | Phone: Home with the paste field, then the share-from-store steps |
| 6 | verdict | Seconds later: Fits, Caution, or Unknown. Every reason names the ingredient, your reading, and the rule. Claude only reads the listing. Our published rules decide. | Phone: Fits verdict, the reason naming glycerin and the U-zone reading, Key ingredients expanding |
| 7 | tryon | Tinted sunscreen? Try the real shades on your own face, with YouCam Makeup try-on. Nothing is saved. | Phone: try-on photo, preview steps, the preview with the shade. Caption: "Live YouCam Makeup VTO, Re'equil Sheer Zinc Tinted Sunscreen" |
| 8 | tour | Your reading, in plain words. A routine built only from products that fit you. And a shop of verified products, each one checked against your skin. | Phone: Reading tab, Routine AM/PM, Shop with Serums and the "Saved on this phone" toast |
| 9 | close | Silver Mirror. Check before you buy. Mirror, mirror. Now you know. | Logo and tagline |

Render (VM only): `scripts/remote.sh --pull video/out -- "bash video/scripts/render-all.sh"`.
Subtitles: `python3 video/scripts/make-srt.py` writes `out/silver-mirror-demo.srt`
(copied to `docs/silver-mirror-demo.srt`).
