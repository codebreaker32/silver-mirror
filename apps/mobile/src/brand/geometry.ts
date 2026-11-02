/**
 * Silver Mirror brand geometry: the one source for the chrome-S mark.
 *
 * Read by the React Native components (SilverMark, SheenBackdrop) and by
 * scripts/brand/build-brand.mjs, which renders the launcher icon, adaptive icon
 * layers, splash and favicons from the same numbers on the build VM. Colours are
 * never written here: each stop names a role in theme.colors.mark / theme.colors.sheen
 * (design/system/tokens/skinkey.tokens.json), so the PNGs and the app agree.
 *
 * Plain data only (no imports, no React) so Node can load it with type stripping.
 */

/** The mark is drawn on a 100 x 100 grid. */
export const MARK_VIEWBOX = 100;

/** Tile corner radius on the 100 grid (22.5% = the Android adaptive squircle feel). */
export const TILE_RADIUS = 22.5;

/** The S: one continuous stroke, round caps. Top-right terminal, down through the spine, bottom-left terminal. */
export const S_PATH =
  'M65 31.5C61 25.5 45.5 23 38.6 29.4C32.2 35.4 35.2 44 46.4 48.2C58.4 52.6 66.6 57.4 63.6 67.2C60.4 76.6 42.4 78.6 34.6 70.4';

export const S_STROKE = 9.5;

/** Liquid light on the metal: two thin glints that follow the inside of each bowl. */
export const S_GLINTS = ['M60.6 28.6C55.6 25.6 46.6 25.2 41.4 29.4', 'M50.4 50.6C56.6 52.9 61.6 56.2 62 61.6'] as const;
export const S_GLINT_STROKE = 1.6;
export const S_GLINT_OPACITY = 0.85;

/** A soft offset under-stroke gives the chrome depth without an SVG filter (filters are unreliable on Android). */
export const S_SHADE_OFFSET = { x: 1.2, y: 1.9 } as const;
export const S_SHADE_OPACITY = 0.22;

/** Chrome banding along the stroke, top-left to bottom-right. Roles are keys of theme.colors.mark. */
export const CHROME_GRADIENT = {
  x1: 30,
  y1: 20,
  x2: 70,
  y2: 82,
  stops: [
    { offset: 0, role: 'chrome1' },
    { offset: 0.2, role: 'chrome2' },
    { offset: 0.36, role: 'chromeHi' },
    { offset: 0.5, role: 'chrome1' },
    { offset: 0.62, role: 'chrome3' },
    { offset: 0.78, role: 'chrome4' },
    { offset: 0.9, role: 'chrome1' },
    { offset: 1, role: 'chromeLo' },
  ],
} as const;

/** Pearl tile: a diagonal fill plus one radial highlight at the top-left, like light on a mirror. */
export const TILE_GRADIENT = {
  x1: 0,
  y1: 0,
  x2: 100,
  y2: 100,
  stops: [
    { offset: 0, role: 'tileTop' },
    { offset: 1, role: 'tileBottom' },
  ],
} as const;
export const TILE_HIGHLIGHT = { cx: 28, cy: 20, r: 62, opacity: 0.7, opacityDark: 0.12 } as const;
export const TILE_EDGE_STROKE = 0.6;

/** Inside an adaptive-icon foreground (108dp canvas, 66dp safe circle) the S is scaled about the centre. */
export const ADAPTIVE_S_SCALE = 0.78;

/** On the splash the bare S is the whole image, so it is drawn larger on its canvas. */
export const SPLASH_S_SCALE = 1.5;

/** Sheen backdrop stops (theme.colors.sheen) for hero zones; matches texture.sheen in the token file. */
export const SHEEN_GRADIENT = {
  stops: [
    { offset: 0, role: 'start' },
    { offset: 0.4, role: 'lavender' },
    { offset: 0.72, role: 'silver' },
    { offset: 1, role: 'end' },
  ],
  highlight: { cx: 0.18, cy: 0.08, r: 0.7, opacity: 0.55 },
} as const;

export type MarkRole = (typeof CHROME_GRADIENT.stops)[number]['role'] | (typeof TILE_GRADIENT.stops)[number]['role'];
export type SheenRole = (typeof SHEEN_GRADIENT.stops)[number]['role'];
