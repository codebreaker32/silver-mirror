# YouCam Hackathon — Research Evidence (verified 2026-11-01)

## Hackathon facts
- YouCam API Skin AI & eCommerce VTO Hackathon (Perfect Corp, Devpost). Deadline 2026-11-02 11:45 AM ET. Winners ~2026-11-24.
- Build: working web OR mobile app, clear value for shoppers OR retailers, any YouCam API (Skin Analysis + apparel VTO highlighted). Deliver repo + description + 1–3 min demo video.
- Judging: technological implementation, design, potential impact, quality of idea; depth of YouCam API integration.
- Prizes: $2,500 / $1,000 / $500; Women in Tech $1,000; Rising Star (student) $1,000; +500 API units per social demo video (max 2).
- Team builds a MOBILE app.

## YouCam API capabilities (docs v1.17)
- Base https://yce-api-01.makeupar.com, Bearer API key. Async: POST /s2s/v2.0/file (presigned PUT) -> POST /s2s/v2.0/task/<feature> -> poll GET .../<task_id> (or webhooks). Units charged only on success; results 24h.
- Skin Analysis (v2.1): SD concerns (wrinkle, pore, texture, acne, moisture, oiliness, redness, radiance, age_spot, dark_circle_v2, eye_bag, firmness, droopy eyelids, tear_trough, skin_type) or HD (hd_* incl. sub-regions). Returns overall score, skin_age, per-concern ui_score/raw_score, mask PNG URLs (overlay). 9–22 units. Face >60% width, front-facing, even light.
- Clothes VTO cloth-v4: person + garment image (or template), garment_category upper/lower/full/outerwear/shoes/auto. 2 units. Single person, front-facing garment.
- Makeup VTO: effects (foundation, lip_color, blush, eye_shadow, eyeliner, brows, concealer, contour, highlighter, lashes, skin_smooth) with hex color, texture, intensity. 1 unit.
- Others: Facial Color Tones analyzer (skin/eye/brow/lip/hair colors), Fitzpatrick skin type, Face Attributes & Ratio (face shape), Skin Simulation, Aging Simulation, Hair style/color/volume/bangs/length/density/frizz detection, Beard generator, Nail VTO, Eye color lens, Teeth whitening, Shoes/Hat/Scarf/Bag/Ring/Earring/Necklace/Bracelet/Watch VTO, Fabric VTO, generative (image/video gen, bg removal/change, enhance, headshot, face swap, object removal).
- JS Camera Kit (real-time in-browser makeup/skin/jewelry/hair/teeth; "comprehensive" mode runs makeup + skin + face attrs from one capture). MCP servers beauty/fashion/creators.

## Competitive landscape (~245 hackathon repos since Jul 2026; see competitor_repos.tsv)
- Saturated: apparel VTO/closet (~76), skin scan->routine/shop (~35), makeup shade match (~30), efficacy/keep-or-return trackers (~27), agentic chat concierge (~26), jewelry/watch (~15), occasion/wedding (~14), cultural/regional (~13), hair/wig incl 5+ chemo wig (~12), skin->apparel color draping (~11), retailer B2B (~11), resale/rental (~9), accessibility (~5).
- Near-zero: teens, seniors, pharmacy, gifting, eyewear, scalp, in-store kiosk/associate, live-commerce, men (1), nails (2). Very few native mobile apps.
- Round 1 winners: 1st Aloud (voice-first skincare for blind shoppers; every spoken claim traceable to ui_score; CI claim linter; shipped TestFlight/APK). 2nd ShadeSpan (B2B catalog audit: garment on 6 Fitzpatrick tones, deterministic CIEDE2000/WCAG scoring; "only 14.3% passed"). CASTING (merch tool, 4 APIs chained). KeepMe (consent/identity-preservation in VTO). ConfidFit (Shopify, App Store, "preview not fit guarantee").
- Pattern: underserved user OR B2B buyer + measurable/auditable output + honesty guardrails + shipped surface.

## Pain points (verified)
- US retail returns $890B 2024, 16.9% of sales; 93% retailers cite return fraud; 51% Gen Z bracket (NRF/Happy Returns 2024).
- Online apparel return rate 24.4%; size/fit top reason 53%, color 16%; ~$25.1B processing cost 2023; 85% brands use/plan VTO (Coresight 2023).
- >60% online beauty shoppers skipped purchase over shade; 41% returned wrong shade (Google 2022, vendor). 41% women struggle to find complexion shade, 56% for darker tones (Benchmarking Co. 2026).
- 70% don't know skin type, 80% don't know ingredients (CeraVe/OnePoll 2021, vendor). 63% wrong about skin type (Labskin 2022, vendor). 49% have skincare unopened >1yr (HK Consumer Council 2021).
- Only 2.1% of open skin-lesion images record Fitzpatrick type (Wen et al., Lancet Digital Health 2022). Derm AI limited on dark skin (Daneshjou, Science Advances 2022).
- 94.8% top-1M home pages fail WCAG; shopping pages worst (71.2 errors avg) (WebAIM 2025). 69% disabled shoppers leave hard sites; £17.1B UK lost (Click-Away Pound 2019).

## Impact evidence (verified)
- Tan, Chandukala & Reddy 2022, J. Marketing: AR try-on raises sales; overall effect small; larger for less popular brands, narrower-appeal, pricier products, new-to-channel/category customers; works by reducing product uncertainty.
- Shopify 2022: 94% conversion lift with 3D/AR (industry avg). Snap/Publicis 2022 survey: 80% more confident, 2/3 "less likely to return" (stated intent). Google/Ipsos 2023: 42% don't feel represented by models; 59% unhappy because item looked different on them.
- Perfect Corp vendor claims: 2.5x conversion (self-selected users), Clinique 30–35% basket; skin AI ICC>0.90 (Feldman, vendor-reported, no n).
- NOT supported: measured return reduction from AR (only stated intent); progress tracking -> adherence; personalization -> less waste. Treat as hypotheses.

## Risks / guardrails
- BIPA: Kukovec v. Estée Lauder (VTO) survived motion to dismiss 2022; Castelaz v. Estée Lauder (Perfect Corp named) dismissed 2024 for no identity link. BIPA amended 2024 (one violation per person, $1k/$5k). => explicit e-consent before face capture, delete promptly, no linking face geometry to identity, published retention policy, no sale/sharing.
- FDA intended-use: "treat acne" claims => drug. Use cosmetic-appearance language; "not medical advice, see a dermatologist" referral path.
- Skin AI bias risk on darker tones: show confidence/limits, avoid verdict-like scores.
