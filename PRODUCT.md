# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users
Urban India shoppers aged 20–35, any gender, who already buy skincare on Flipkart, Amazon.in or Nykaa. They have usually found a product through a reel or a friend and are looking at its listing, unsure whether it suits their own skin. Their job: check, before buying, whether this exact listing fits their measured skin. Opened skincare usually can't be returned.

## Product Purpose
Silver Mirror (formerly SkinKey; code identifiers keep `skinkey`) is a check-before-you-buy companion. The shopper takes one consented YouCam Skin Analysis scan. After that, sharing any product from the Flipkart, Amazon or Nykaa app returns a verdict (FITS / CAUTION / UNKNOWN, plus a separate medicine gate) with reasons that name the ingredient and the scan reading behind each one. "Find better matches" then opens store searches tuned to their readings. For tinted products, YouCam Makeup VTO shows two shades on the shopper's own photo. Success means the shopper confidently buys something that suits them, or skips something that doesn't.

## Positioning
Store skin tools only work inside one store's catalogue. Silver Mirror keeps one measured profile on the phone and checks the exact product the shopper is looking at, from any store app, through the share sheet. Every verdict shows its working: rules are published, the YouCam task and delete status are visible, and Claude only reads listings and labels, never decides the verdict.

## Constraints
- Cosmetic language only. No medical claims, no "safe/unsafe", no skin-age or numeric scores; readings are shown as bands.
- Privacy you can see: explicit consent, the photo is deleted from YouCam after the scan, only bands are stored on the phone, and one-tap delete or withdraw.
- English-only UI. Gender-neutral. Must follow the phone's light/dark setting, and both themes must be designed.
- Fixed strings live in `packages/contracts/src/copy.ts`. Banned words are listed in `design/research/00_research_summary_and_design_brief.md` §4.4.
- Hackathon: YouCam API Skin AI & eCommerce VTO (Perfect Corp). Submission deadline 2026-11-02, 22:15 IST.

## Evidence and assets
- Research and brief: `design/research/`. Spec: `research/skinkey_v2_spec.md`. Live API findings: `spikes/FINDINGS.md`.
- Visual system of record: `DESIGN.md` (Silver Mirror, from `design/reference/silver-mirror-moodboard.md`); tokens in `design/system/tokens/`. Clay & Ink is archived in `design/system/directions/`.
