# SkinKey: desk-research baseline (answers to the questionnaire)

Source: a desk-research document @Aman provided on 1 Nov 2026. **Nobody was interviewed for it.** It is a baseline built from public surveys, platform reports, papers and Reddit posts, graded A–D:
- **A:** peer-reviewed or a large survey with a disclosed method.
- **B:** industry survey with a stated sample.
- **C:** company data or press release.
- **D:** single Reddit posts.

Do not present it as interview data, and do not use any of its quotes in the demo video. The figures come from the provided document; the claude session has not re-verified them.

## Key findings
1. **People guess their skin type, often wrongly.** About 40% of self-reported skin types matched instrument measurement (Youn et al. 2002, via a secondary summary) [A]. Men and people with darker skin (Fitzpatrick IV–VI) made more self-assessment errors (Bhanot et al. 2024, US) [A, Global].
2. **Reviews are the main fit signal, and people distrust them.** 56% found ratings positively biased (LocalCircles 2024) [A]. 65% don't trust e-commerce ratings (LocalCircles) [A].
3. **A wrong purchase can't be undone.** Nykaa and Purplle don't accept returns of opened products (Hubble), so a bad product gets abandoned, not returned.
4. **Discovery is social, but purchases follow trust.**
   - 40% of Gen Z go to Instagram creators first for a skin concern, but only 8% bought their last product because of Instagram.
   - Brand reputation (44%) and dermatologist advice (36%) drove purchases more often (SuperJ/Hercules) [B].
5. **Comfort with face scans depends on consent and fairness** (Harris Poll, *The Algorithmic Aisle*, n=3,222 across the US, UK, Brazil and India) [B]. Respondents find an AI beauty tool invasive when it:

   | Behaviour | Share who find it invasive |
   |---|---|
   | Stores data without clear consent | 44% |
   | Uses a selfie in a way they didn't expect | 43% |
   | Suggests they need to "fix" their appearance | 42% |

   - 77% of Indian respondents worry these tools aren't built for people like them.
   - In AI dermatology, accuracy is lower on darker skin: AUROC 0.82 for Fitzpatrick IV–VI against 0.89 for I–III. This comes from a lesion-diagnosis meta-analysis (PMC) [A, Global].
6. **People want AI to help them decide.** Shares of respondents who find AI useful for each task (Harris) [B]:

   | Task | Share who find it useful |
   |---|---|
   | Summarising reviews | 81% |
   | Staying within budget | 81% |
   | Understanding ingredients | 79% |
   | Comparing claims | 78% |

   - Trust in AI recommendations is highest for moisturiser (76%) and sunscreen (75%) and lowest for acne treatment (65%).
   - 43% worry that AI recommendations are paid placements.
7. **"Unknown" splits people.** Some read an honest "I don't know" as trustworthy (AVA field study, arXiv 2604.17843) [A, Global, different domain]. Others leave for a tool that always gives an answer. Pair "Unknown" with a next step.
8. **Sunscreen habits are weak.** 37.5% of daily users re-apply, and 64.5% dislike white cast (SuperJ/Hercules) [B].
9. **The market already has scans.**
   - Flipkart has a ModiFace analyser (Jan 2024).
   - Nykaa launched Skin Scan (Nov 2025).
   - Myntra partnered with Revieve.
   - Interviews should ask: "Why not just use Nykaa's scan?"
10. **Law.** India's DPDP Act requires explicit, revocable consent for personal data such as facial images (Mantra summary). This matters more for an India-first app than BIPA, which is a US law.
11. **The share sheet may be hard to find.** The Android share sheet is cluttered and apps can't replace it (Android 12+), so SkinKey may sit in the alphabetical list below the fold. This is a prediction to test.
12. **Recruit outside metros.** Half of Myntra's Gen Z beauty buyers are in Tier 2 and Tier 3 cities [C]. Men's skincare orders are growing [C].

## Design changes adopted from this baseline
| # | Change | Driven by |
|---|---|---|
| D1 | Show the scan reading in plain words, with a "Feels wrong? Edit" control on the profile | Finding 1 |
| D2 | Base verdict reasons on named ingredients, e.g. "Contains coconut oil and isopropyl myristate, which can clog pores", never "heavy oils". Star ratings are a secondary signal at most. | Findings 2, 6 |
| D3 | Position the app as "check before you buy" and place the verdict before add-to-cart | Finding 3 |
| D4 | The photo is deleted after the scan (YouCam `task/delete`) and only the readings are stored. The capture screen says so, along with "may be less accurate on deeper skin tones and in poor light". Make no claim about which skin tones were tested unless we test them. | Findings 5, 10 |
| D5 | Under "Find better matches": "Ranked by fit to your skin. No paid placements." Because we use affiliate links, add **"We may earn a commission if you buy; it never changes the ranking."** Both lines must stay true. | Finding 6 (43% paid-placement worry) |
| D6 | Turn "Unknown" into a next step: "We can't read the ingredients on this listing. Snap the ingredient list?" A photo is read by Claude vision through our proxy, then fed into the same deterministic rules. | Finding 7 |
| D7 | Describe a moment, not the person. A/B test "Your skin looked oily in your 1 Nov scan" against "Your oiliness reading: High". | Finding 5 ("fix" trigger, 42%) |
| D8 | Lead the demo with sunscreen and moisturiser, not acne treatment. Use the tinted-sunscreen try-on preview (YouCam Makeup VTO + Facial Color Tones) to answer white-cast worries. | Findings 6, 8 |
| D9 | Teach the share step in onboarding ("Find SkinKey in your share menu, then pin it"). Fallbacks: paste link, read the clipboard on app open with the Android 12+ toast, and barcode. | Finding 11 |
| D10 | Consent screens follow DPDP: explicit, specific, revocable. "Delete my profile" is reachable in one tap. | Finding 10 |
| D11 | The pitch answers "Why not Nykaa's or Flipkart's scan?" Those scans are locked to one store and one catalogue. SkinKey keeps one profile for any product, in any app, with reasons shown. | Finding 9 |

## What only the real interviews can answer (prioritise these)
- Q10: how many products people own but don't use. There is no Indian figure.
- Q7: what happens to a product that didn't work.
- Q14: the exact moment of use (before add-to-cart, in the cart, or while scrolling reels).
- The share-flow timing.
- Q16: how people react to "Unknown".

Add these probes:
- "What makes you say your skin is oily?"
- "What did you do with it afterwards?"
- "Would it change anything if the photo never left your phone?"
- "Why not just use Nykaa's or Flipkart's scan?"

Recruiting: include at least one person who has never read an ingredient list, one person from a Tier 2 or Tier 3 city, and at least one man.
