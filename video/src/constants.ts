// Brand tokens for the video (the app's 2.4 lavender-grey and charcoal palette).
export const COLORS = {
  ground: "#EDECF2",
  panel: "#F7F6FA",
  well: "#E2E0EA",
  accent: "#3A3546",
  text: "#1B1A22",
  muted: "#575566",
  hairline: "#D6D3E0",
  bezel: "#22202A",
  sage: "#4F7A5E",
  sageTint: "#DCE9DF",
  amber: "#A86A12",
  amberTint: "#F5E6CC",
  grey: "#6B6878",
  greyTint: "#E3E1EA",
  white: "#FFFFFF",
};

export const FPS = 30;
export const W = 1920;
export const H = 1080;

// Voice starts this many seconds into each scene's Sequence.
export const VOICE_LEAD = 0.3;
// Cross-fade at each scene boundary (frames). 11 frames = ~370ms.
export const FADE = 11;

// Final narration, one line per scene. Used to estimate word timing when no speech marks exist.
export const NARRATION: Record<string, string> = {
  hook: "Mirror, mirror, on the wall. Will this serum suit me at all?",
  shelf: "Every skincare shelf has one. The bottle that didn't suit you. And opened skincare can't go back.",
  gap: "Store skin quizzes only know their own catalogue. And no listing knows your skin.",
  scan: "So Silver Mirror starts with one consented scan. YouCam's HD Skin Analysis reads oiliness, pores, moisture and redness. Then the photo is deleted from YouCam. Only Low, Medium and High stay on your phone.",
  share: "Now shop the way you already do. Nykaa, Flipkart or Amazon. Tap share. Pick Silver Mirror.",
  verdict: "Seconds later: Fits, Caution, or Unknown. Every reason names the ingredient, your reading, and the rule. Claude only reads the listing. Our published rules decide.",
  tryon: "Tinted sunscreen? Try the real shades on your own face, with YouCam Makeup try-on. Nothing is saved.",
  tour: "Your reading, in plain words. A routine built only from products that fit you. And a shop of verified products, each one checked against your skin.",
  proof: "And it shows its working. Real task IDs. Real deletes. Rules frozen in git before our audit ran.",
  close: "Silver Mirror. Check before you buy. Mirror, mirror. Now you know.",
};
