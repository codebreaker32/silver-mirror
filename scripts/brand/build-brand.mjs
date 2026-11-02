#!/usr/bin/env node
// Silver Mirror brand assets: SVG sources + launcher / adaptive / splash / favicon PNGs.
// Run on the build VM (Node 24 strips the types from geometry.ts; sharp rasterises via librsvg):
//   scripts/remote.sh --pull apps/mobile/assets/images --pull design/brand -- 'node scripts/brand/build-brand.mjs'
//
// Geometry: apps/mobile/src/brand/geometry.ts (same numbers the React Native SilverMark draws).
// Colours: resolved from design/system/tokens/skinkey.tokens.json (semantic mark.* and bg), never typed here.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { loadTokens, resolve } from '../../design/system/tokens/lib/resolve.mjs';
import * as G from '../../apps/mobile/src/brand/geometry.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tokens = loadTokens(join(root, 'design/system/tokens/skinkey.tokens.json'));
const kebab = (s) => s.replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase();
const palette = (mode) => {
  const sem = resolve(tokens, tokens.semantic.color[mode], mode);
  return { mark: { ...sem.mark, dark: mode === 'dark' }, bg: sem.bg, sheen: sem.sheen };
};

const V = G.MARK_VIEWBOX;
const stops = (list, colors) => list.map((s) => `<stop offset="${s.offset}" stop-color="${colors[kebab(s.role)]}"/>`).join('');

function defs(m) {
  const c = G.CHROME_GRADIENT;
  const t = G.TILE_GRADIENT;
  const h = G.TILE_HIGHLIGHT;
  return `<defs>
  <linearGradient id="chrome" gradientUnits="userSpaceOnUse" x1="${c.x1}" y1="${c.y1}" x2="${c.x2}" y2="${c.y2}">${stops(c.stops, m)}</linearGradient>
  <linearGradient id="tile" gradientUnits="userSpaceOnUse" x1="${t.x1}" y1="${t.y1}" x2="${t.x2}" y2="${t.y2}">${stops(t.stops, m)}</linearGradient>
  <radialGradient id="hi" gradientUnits="userSpaceOnUse" cx="${h.cx}" cy="${h.cy}" r="${h.r}"><stop offset="0" stop-color="${m.glint}" stop-opacity="${m.dark ? h.opacityDark : h.opacity}"/><stop offset="1" stop-color="${m.glint}" stop-opacity="0"/></radialGradient>
</defs>`;
}

function tileLayer(m, rounded) {
  const rx = rounded ? G.TILE_RADIUS : 0;
  const e = G.TILE_EDGE_STROKE;
  const edge = rounded ? `<rect x="${e / 2}" y="${e / 2}" width="${V - e}" height="${V - e}" rx="${rx}" fill="none" stroke="${m['tile-edge']}" stroke-width="${e}"/>` : '';
  return `<rect width="${V}" height="${V}" rx="${rx}" fill="url(#tile)"/><rect width="${V}" height="${V}" rx="${rx}" fill="url(#hi)"/>${edge}`;
}

function sLayer(m, { mono = false } = {}) {
  if (mono) return `<path d="${G.S_PATH}" stroke="#FFFFFF" stroke-width="${G.S_STROKE}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const o = G.S_SHADE_OFFSET;
  const glints = G.S_GLINTS.map((d) => `<path d="${d}" stroke="${m.glint}" stroke-opacity="${G.S_GLINT_OPACITY}" stroke-width="${G.S_GLINT_STROKE}" stroke-linecap="round" fill="none"/>`).join('');
  return `<path d="${G.S_PATH}" transform="translate(${o.x} ${o.y})" stroke="${m.shade}" stroke-opacity="${G.S_SHADE_OPACITY}" stroke-width="${G.S_STROKE}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
    + `<path d="${G.S_PATH}" stroke="url(#chrome)" stroke-width="${G.S_STROKE}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>${glints}`;
}

const scaled = (inner, k) => `<g transform="translate(${(V * (1 - k)) / 2} ${(V * (1 - k)) / 2}) scale(${k})">${inner}</g>`;
const svg = (px, body, m) => `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${V} ${V}">${m ? defs(m) : ''}${body}</svg>\n`;

const light = palette('light');
const dark = palette('dark');

const sources = {
  // Design sources (vector, committed).
  'design/brand/silver-mirror-mark.svg': svg(512, tileLayer(light.mark, true) + sLayer(light.mark), light.mark),
  'design/brand/silver-mirror-mark-dark.svg': svg(512, tileLayer(dark.mark, true) + sLayer(dark.mark), dark.mark),
  'design/brand/chrome-s.svg': svg(512, sLayer(light.mark), light.mark),
  'design/brand/adaptive-foreground.svg': svg(1024, scaled(sLayer(light.mark), G.ADAPTIVE_S_SCALE), light.mark),
  'design/brand/adaptive-background.svg': svg(1024, tileLayer(light.mark, false), light.mark),
  'design/brand/adaptive-monochrome.svg': svg(1024, scaled(sLayer(light.mark, { mono: true }), G.ADAPTIVE_S_SCALE), null),
};

const rasters = [
  // [out, svgKeyOrString, size]
  ['apps/mobile/assets/images/icon.png', svg(1024, tileLayer(light.mark, false) + scaled(sLayer(light.mark), 0.86), light.mark), 1024],
  ['apps/mobile/assets/images/android-icon-foreground.png', sources['design/brand/adaptive-foreground.svg'], 1024],
  ['apps/mobile/assets/images/android-icon-background.png', sources['design/brand/adaptive-background.svg'], 1024],
  ['apps/mobile/assets/images/android-icon-monochrome.png', sources['design/brand/adaptive-monochrome.svg'], 1024],
  ['apps/mobile/assets/images/splash-icon.png', svg(1024, scaled(sLayer(light.mark), G.SPLASH_S_SCALE), light.mark), 1024],
  ['apps/mobile/assets/images/splash-icon-dark.png', svg(1024, scaled(sLayer(dark.mark), G.SPLASH_S_SCALE), dark.mark), 1024],
  ['apps/mobile/assets/images/favicon.png', sources['design/brand/silver-mirror-mark.svg'], 48],
  ['design/brand/png/mark-light-512.png', sources['design/brand/silver-mirror-mark.svg'], 512],
  ['design/brand/png/mark-dark-512.png', sources['design/brand/silver-mirror-mark-dark.svg'], 512],
  ['design/brand/png/favicon-32.png', sources['design/brand/silver-mirror-mark.svg'], 32],
  ['design/brand/png/favicon-192.png', sources['design/brand/silver-mirror-mark.svg'], 192],
];

for (const [rel, body] of Object.entries(sources)) {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), body);
}
for (const [rel, body, size] of rasters) {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  await sharp(Buffer.from(body), { density: Math.max(72, Math.ceil((72 * size) / 512)) }).resize(size, size).png({ compressionLevel: 9 }).toFile(join(root, rel));
}

// Contact sheet: launcher masks (circle + squircle) on both themes' wallpapers, and the splash on both backgrounds.
{
  const cell = 220;
  const tiles = [];
  const fg = await sharp(join(root, 'apps/mobile/assets/images/android-icon-foreground.png')).resize(cell, cell).png().toBuffer();
  const bgl = await sharp(join(root, 'apps/mobile/assets/images/android-icon-background.png')).resize(cell, cell).png().toBuffer();
  const circle = Buffer.from(`<svg width="${cell}" height="${cell}"><circle cx="${cell / 2}" cy="${cell / 2}" r="${cell / 2}" fill="#fff"/></svg>`);
  const squircle = Buffer.from(`<svg width="${cell}" height="${cell}"><rect width="${cell}" height="${cell}" rx="${cell * 0.3}" fill="#fff"/></svg>`);
  for (const mask of [circle, squircle]) {
    const icon = await sharp(bgl).composite([{ input: fg }, { input: mask, blend: 'dest-in' }]).png().toBuffer();
    tiles.push(icon);
  }
  const splash = async (bg, file) => sharp({ create: { width: cell, height: cell * 1.6, channels: 4, background: bg } })
    .composite([{ input: await sharp(join(root, file)).resize(Math.round(cell * 0.45)).png().toBuffer(), gravity: 'centre' }]).png().toBuffer();
  const sl = await splash(light.bg, 'apps/mobile/assets/images/splash-icon.png');
  const sd = await splash(dark.bg, 'apps/mobile/assets/images/splash-icon-dark.png');
  const W = cell * 5 + 120, H = Math.round(cell * 1.6) + 40;
  await sharp({ create: { width: W, height: H, channels: 4, background: light.sheen.lavender } })
    .composite([
      { input: tiles[0], left: 20, top: 20 },
      { input: tiles[1], left: cell + 40, top: 20 },
      { input: await sharp(join(root, 'design/brand/png/mark-dark-512.png')).resize(cell).png().toBuffer(), left: cell * 2 + 60, top: 20 },
      { input: sl, left: cell * 3 + 80, top: 20 },
      { input: sd, left: cell * 4 + 100, top: 20 },
    ])
    .png()
    .toFile(join(root, 'design/brand/png/brand-sheet.png'));
}

console.log(`brand: ${Object.keys(sources).length} SVG sources, ${rasters.length} PNGs, design/brand/png/brand-sheet.png`);

// Lockup previews (mark + outlined wordmark on the sheen), light and dark: design/brand/png/lockup-<mode>.png
{
  const { WORDMARK } = await import('../../apps/mobile/src/brand/wordmarkPaths.ts');
  for (const mode of ['light', 'dark']) {
    const sem = resolve(tokens, tokens.semantic.color[mode], mode);
    const m = { ...sem.mark, dark: mode === 'dark' };
    const [vx, vy, vw, vh] = WORDMARK.viewBox;
    const cap = 64;
    const k = cap / WORDMARK.capHeight;
    const markPx = 160;
    const W = 1400, H = 360;
    const wx = 80 + markPx + 48;
    const wy = H / 2 + cap / 2;
    const body = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">${G.SHEEN_GRADIENT.stops.map((s) => `<stop offset="${s.offset}" stop-color="${sem.sheen[s.role]}"/>`).join('')}</linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#sheen)"/>
<svg x="80" y="${(H - markPx) / 2}" width="${markPx}" height="${markPx}" viewBox="0 0 ${V} ${V}">${defs(m)}${tileLayer(m, true)}${sLayer(m)}</svg>
<g transform="translate(${wx - vx * k} ${wy}) scale(${k})"><path d="${WORDMARK.d}" fill="${sem.text}"/></g>
</svg>`;
    writeFileSync(join(root, `design/brand/lockup-${mode}.svg`), body);
    await sharp(Buffer.from(body)).png().toFile(join(root, `design/brand/png/lockup-${mode}.png`));
  }
  console.log('brand: lockup-light.png, lockup-dark.png');
}
