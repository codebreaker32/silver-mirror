# SkinKey art directions: which one to build

Three looks were designed for the same two screens: the `/check` CAUTION verdict and the `/profile` card. Each one was then scored by four judges (brief fit, visual craft, accessibility, target user). Open the preview files in a browser to see them.

| | Deep Teal | Clay & Ink | Terracotta & Sage |
|---|---|---|---|
| Judge average | **7.6 / 10** (7, 8, 8, 7.5) | **7.5 / 10** (8, 7, 7, 8) | **6.0 / 10** (6, 6, 6, 6) |
| Feel | A calm neighbourhood pharmacy counter | A well-printed label | Indian materials (khadi, clay, turmeric) |
| Fonts | Schibsted Grotesk + Atkinson Hyperlegible Next | Newsreader (serif) + Commissioner | Eczar + Anek Latin |
| Contrast | 84 pairs, all pass | 86 pairs, all pass | 124 pairs, all pass |
| Main risk | Plain, looks like a fintech app | Verdict label too small | Accent breaks the brief, CAUTION screen reads as an alarm |

All three use packages that exist on npm (`@expo-google-fonts/...`). All three fonts were checked for the rupee sign (₹) and have it. None use red, a warning triangle, gradients or pink.

---

## 1. Deep Teal, clinic-free (ranked 1st)

**Feel:** precise and plain-spoken, with nothing to sell. Think Signal, not a hospital.

- **Fonts:** Schibsted Grotesk (headings and reasons), Atkinson Hyperlegible Next (body text). Atkinson was drawn so that I/l/1 and 0/O can't be confused, which helps with ingredient names like "isopropyl myristate".
- **Accent:** deep petrol teal `#0F4D55` (light), `#76B3B7` (dark). It is used only for buttons, links and focus, never for a verdict.
- **Neutrals:** warm putty. Light bg `#F7F6F3`, surface `#FCFBF9`, text `#23221F`, muted `#69655D`. Dark bg `#161614`, surface `#1C1B19`, text `#F2F0EB`.
- **Verdict colours (light / dark):**
  - FITS sage: `#E7F0E9` / `#2B5A3B`, dark `#16261B` / `#A9D3B4`. Icon: circle with check.
  - CAUTION ochre: `#F7EDD9` / `#6E480C`, dark `#2B2110` / `#EBC47D`. Icon: half-filled circle.
  - UNKNOWN slate: `#E9ECEF` / `#3B4651`, dark `#1D2227` / `#BAC4CE`. Icon: dashed circle.
  - MEDICINE: neutral ink outline, pharmacist-at-counter icon, no verdict label.
- **Contrast:** 84 pairs, 0 failures. One judge recomputed 6 of them and they matched.
- **Strengths:**
  - The clearest screen of the three. The CAUTION tint stays in the header and the reasons sit on a plain surface, so the screen never turns yellow.
  - The reasons are set larger than the verdict label, as P1 asks.
  - The best "Where this comes from" block, laid out like a dispensing label.
  - The only true pharmacist icon.
  - The most complete preview: the dark frame is scrolled to the end, so every required string is visible.
  - Best for accessibility.
- **Fixes the judges asked for:**
  1. It is the least premium and least memorable of the three. Add one warm or distinctive touch, for example a warmer bg (`#F5F1EA`), a slightly warmer petrol, a serif for the product title, or numbered reasons.
  2. Atkinson's slashed zero makes "SPF 50" and dates look like code. Set all numbers in Schibsted.
  3. The dark-mode button (`#76B3B7`) looks soft and slightly hospital-cyan. Deepen it.
  4. Draw the band meter in neutral ink, not brand petrol.
  5. Make the empty meter segments clearly readable (full-opacity outline), or label the meter as decorative.
  6. Raise the 11dp text (provenance keys, Low/Med/High) to at least 12 to 13dp.
  7. Make every touch target 48dp. "Feels wrong? Edit" and the edit button are 44dp.
  8. Remove the shield icon in the header. It says "safety", which contradicts "fit, not safety".
  9. Keep the CAUTION outline on the header only.
  10. FITS, CAUTION and UNKNOWN icons are all circles. Give FITS a different shape, for example a seal.
  11. Darken the CAUTION solid icon (`#A86F12` is 3.65:1) to about `#95620F`.
  12. Smaller items: the product title looks like a form field; the token says reasons are 18/24 but the CSS uses 17/24; the stock key logo; the right-aligned Edit pill; and "Measured by YouCam Skin Analysis, 1 Nov" wraps.
- **Preview:** `/home/aman/youcam/design/system/directions/deep-teal.html`

## 2. Clay & Ink (ranked 2nd, very close)

**Feel:** printed matter, not a beauty counter. Sand-coloured paper and one near-black ink.

- **Fonts:** Newsreader, an editorial serif (titles, verdict subtitle, reasons), and Commissioner, a soft sans (UI, labels, fine print).
- **Accent:** near-black blue-green ink `#1B2F32` (light), pale ink `#B0C5C7` (dark).
- **Neutrals:** warm sand. Light bg `#F3EEE6`, surface `#FAF7F2`, text `#1E1C19`, muted `#655B4D`. Dark bg `#151411`, surface `#1E1C18`, text `#F1EBE1`. Adds a faint paper grain.
- **Verdict colours (light / dark):**
  - FITS moss: `#E5EBDD` / `#34492A`, dark `#1E2A1A` / `#B9CCA8`. Icon: seal with check.
  - CAUTION ochre: `#F3E6CC` / `#62410A`, dark `#2D2313` / `#E6C482`. Icon: half-filled circle.
  - UNKNOWN slate: `#E6E8E8` / `#3B464D`, dark `#21262A` / `#BCC5CA`. Icon: dashed circle with a dot.
  - MEDICINE: paper and ink, 1.5dp ink rule, mortar-and-pestle icon, no label.
- **Contrast:** 86 pairs, 0 failures. It is the only direction that also checked the empty meter ticks.
- **Strengths:**
  - Two judges' favourite. It feels the most premium and the most "made".
  - Gender-neutral, and looks nothing like Flipkart or Nykaa.
  - Numbered serif reasons (01, 02) make the reasons the hero of the screen.
  - The four verdict icons have the most distinct shapes.
  - The most rigorous token and contrast work. The preview is built from the same token file.
- **Fixes the judges asked for:**
  1. The "CAUTION" label is the smallest text in its panel (12dp). Raise it to 14 to 15dp, weight 600, with a 22 to 24dp icon.
  2. The product fact in each reason is 14dp muted grey. Set it at 16dp in full text colour.
  3. The dark-mode button (`#B0C5C7`) looks disabled. Deepen it to `#86A4A7` with `#0C171A` text (6.84:1).
  4. The preview hides the provenance block and the fixed strings below the fold. Add a scrolled-to-end frame.
  5. The 20dp serif reasons push reason 02 under the sticky bar and leave one-word lines. Drop to 18 to 19dp.
  6. Show the CAUTION subtitle "May not suit your readings. This is not a safety warning." as one unit, in one style.
  7. The mortar and pestle reads as Ayurveda. Use a person at a counter.
  8. /profile: lay the band chips out as a 2x2 grid, add a Delete button, and use a horizontal meter (the current one looks like phone signal bars).
  9. Make every touch target 48dp.
  10. Dark mode: give the CAUTION panel a stronger border or left rule. Its edge almost disappears, and it looks like FITS to colour-blind users.
  11. Drop the grain in dark mode, or ship it as one static PNG.
  12. Check Commissioner's letter spacing on a real Android phone.
  13. Smaller items: the showcase page overflows at 1400px; centre-aligned header; show the "No paid placements" line; add a reduced-motion demo.
- **Preview:** `/home/aman/youcam/design/system/directions/clay-ink.html`

## 3. Indian Earth: Terracotta & Sage (ranked 3rd)

**Feel:** calm and grounded, rooted in Indian materials without using motifs.

- **Fonts:** Eczar (titles, 20dp and up only) by Vaibhav Singh, and Anek Latin (everything else) by Ek Type. Both are Indian-designed.
- **Accent:** terracotta clay `#9A4630` (light), `#B4593B` (dark). Sage `#556641` is a second colour.
- **Neutrals:** khadi cotton. Light bg `#F4EFE5`, surface `#FAF7F1`, text `#27221C`, muted `#5F5444`. Dark bg `#181512`, surface `#211D19`, text `#F2ECE1`. The one ornament is a dashed "kantha stitch" line.
- **Verdict colours (light / dark):**
  - FITS sage: `#E6EBDB` / `#33402A`, dark `#252C1F` / `#C3CFAE`. Icon: circle with check.
  - CAUTION haldi ochre: `#F6EBCB` / `#5E440F`, dark `#2F2510` / `#E8C978`. Icon: eye.
  - UNKNOWN slate: `#E9E9E5` / `#3B3F3D`, dark `#252827` / `#C9CBC6`. Icon: question mark.
  - MEDICINE: heavy ink outline, pill icon, no label.
- **Contrast:** 124 pairs, 0 failures. The dark button is only just over the line (4.66:1), and the empty meter segments were not tested (about 1.3 to 1.5:1).
- **Strengths:**
  - The most memorable, with a real local story.
  - The most complete preview (six phone frames).
  - The most complete /profile card (Edit, What we keep, Delete).
  - Good reason copy.
- **Fixes the judges asked for:**
  1. The terracotta accent breaks the brief, which asks for one deep ink or teal accent. Next to the ochre CAUTION panel it reads as red alarm. Switch the accent to deep ink, or make it much darker and browner.
  2. The CAUTION tint fills the whole reasons area. Keep it in the header only.
  3. The eye icon suggests "watching you" in a face-scan app. Use a half-filled circle.
  4. The pill icon can read as "take this". Use a pharmacist icon.
  5. Use Eczar 500, not 600, or set the product title in Anek. It currently looks heavy.
  6. Use the dashed stitch once per screen. Repeated, it looks like a coupon cut-line.
  7. Check "Stored on this phone only" against the architecture, because the photo goes to YouCam.
  8. Fix the copy "which skin that looks red often doesn't suit".
  9. One judge felt it reads as an ayurvedic beauty brand and leans feminine.
  10. Smaller items: 48dp touch targets; remove role="img" from the frames; ink logo; cooler UNKNOWN colour; test the empty meter ticks.
- **Preview:** `/home/aman/youcam/design/system/directions/terracotta-sage.html`

---

## Recommendation

**Build Deep Teal, and borrow two things from Clay & Ink.**

Why:

- Deep Teal scored highest overall. It is the safest on the things that can't fail: calm CAUTION, reasons first, a true pharmacist icon, the best provenance block and the best accessibility.
- Its weak spot is personality, and judges suggested fixing that with Clay & Ink's ideas:
  - **numbered 01/02 reasons**;
  - **a serif (Newsreader) for the product title only**.
- Clay & Ink is nearly tied (7.5 vs 7.6) and is the better-looking option. Its problems (a tiny verdict label, a muted product fact, a washed-out dark button) are all fixable. If you care most about looking premium in a demo, it is a fine choice too.
- Avoid Terracotta & Sage: it breaks the brief's accent rule, and its CAUTION screen reads as a warning.

### Fixes to apply before building tokens (Deep Teal)

These change token values, so do them first.

1. **Warm the palette.** Set the light bg to `#F5F1EA` (text 14.13:1, muted 5.73:1) and nudge the petrol slightly warmer or greener (hue about 185 to 190, lower chroma). Re-run `contrast.js`.
2. **Dark-mode primary button.** Replace the `#76B3B7` fill. Note that `#47949B` with white text, which one judge suggested, fails at 3.51:1. Use Petrol 500 `#24767F` with white text (5.29:1), or a less saturated petrol.
3. **Numerals in Schibsted** (tabular) for dates, prices and SPF. Make it a typography token rule.
4. **Band meter in neutral ink,** not petrol. Draw empty segments as a full-opacity `border-strong` outline (3.27:1 on sunken) and add them to the contrast script.
5. **CAUTION solid icon** `#A86F12` to `#95620F` (4.48:1 on the CAUTION bg, 4.45:1 on sunken).
6. **Muted text** `#69655D` to `#625E56` (5.51:1 on sunken, 5.44:1 on the UNKNOWN bg) for more margin.
7. **Type floor.** Nothing below 12dp; set provenance keys and meter labels to 13dp with +0.6 tracking. Settle the headline at 18/24 or 17/24 and use the same value in tokens and code.
8. **Touch target token.** Minimum 48dp.
9. **Add to the scale:** a serif `productTitle` style (Newsreader) and a reason index style (01/02).
10. **Add to the contrast script:** focus ring on sunken, border-strong on sunken, and the empty meter segments.

Apply these at the component stage: remove the shield icon; keep the CAUTION outline on the header only; give FITS a different icon shape; make the product title plain text with an "Edit" link; keep "Measured by YouCam Skin Analysis, 1 Nov" on one line; left-align "Feels wrong? Edit".

Supporting files for Deep Teal (tokens, contrast checker, build script):
`/tmp/claude-1000/-home-aman-youcam/b17a1183-f92a-43c4-ae32-dde9d5f45f9f/scratchpad/deepteal/`
