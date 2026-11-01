#!/usr/bin/env node
// SkinKey contrast and token-rule validator. Node 18+, no dependencies.
//
//   node check-contrast.mjs                      # print report, exit 1 on any failure
//   node check-contrast.mjs --md contrast-report.md
//   node check-contrast.mjs --tokens other.tokens.json   # check a candidate file
//
// Reads skinkey.tokens.json, resolves every alias for light and dark, and checks
// every pair in PAIRS below with the WCAG 2.1 relative-luminance formula:
//   text   : body and label text            >= 4.5:1
//   large  : text >= 24dp, or >= 18.66dp bold >= 3:1
//   ui     : icons, focus ring, control edges, meter segments, fills (SC 1.4.11) >= 3:1
//   info   : decorative hairlines, reported but not gated
// Translucent colours are alpha-composited over their backdrop first; when the
// backdrop is a live camera frame the worst case (pure white or pure black) is used.
// It also lints the non-colour rules from the art-direction review (type floor,
// touch targets, motion, CAUTION hue, neutral meter, grain, verdict icons).

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTokens, resolvePath, resolve, MODES } from './lib/resolve.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const tIdx = process.argv.indexOf('--tokens');
const tokens = loadTokens(tIdx > -1 ? process.argv[tIdx + 1] : join(here, 'skinkey.tokens.json'));
const MIN = { text: 4.5, large: 3, ui: 3, info: 0 };

// ---------------------------------------------------------------- colour math
function parse(c) {
  c = c.trim();
  let m = c.match(/^#([0-9a-f]{6})$/i);
  if (m) return { r: parseInt(m[1].slice(0, 2), 16), g: parseInt(m[1].slice(2, 4), 16), b: parseInt(m[1].slice(4, 6), 16), a: 1 };
  m = c.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  throw new Error(`Cannot parse colour "${c}"`);
}
const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
const chan = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (c) => 0.2126 * chan(c.r) + 0.7152 * chan(c.g) + 0.0722 * chan(c.b);
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
function hsl(c) {
  const r = c.r / 255, g = c.g / 255, b = c.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s, l };
}

// ------------------------------------------------------------------- pair list
// fg/bg are token paths. `on` is an optional backdrop the bg itself sits on
// (used when bg is translucent). `camera: true` means the backdrop is a live
// camera frame, so both white and black are tried and the worst result kept.
const SURFACES = ['color.bg', 'color.bg-sunken', 'color.surface', 'color.surface-raised'];
const VERDICTS = ['fits', 'caution', 'unknown', 'medicine'];
const PAIRS = [];
const add = (fg, bg, kind, use, extra = {}) => PAIRS.push({ fg, bg, kind, use, ...extra });

for (const s of SURFACES) {
  add('color.text', s, 'text', 'Body text');
  add('color.text-muted', s, 'text', 'Secondary text, ledger keys, meter labels');
  add('color.text-subtle', s, 'text', 'Third-level text (timestamps, helper)');
  add('color.link', s, 'text', 'Text links, tertiary buttons');
  add('color.link-pressed', s, 'text', 'Link pressed');
  add('color.disabled-fg', s, 'text', 'Disabled label on a transparent button (kept readable: offline actions are disabled, not hidden)');
  add('color.border-strong', s, 'ui', 'Outlined button, input edge, sheet handle, pending step ring');
  add('color.focus-ring', s, 'ui', 'Focus ring (2dp, 2dp offset over this surface)');
  add('color.accent', s, 'ui', 'Primary button fill edge, done-step fill, checkbox');
  add('color.accent-pressed', s, 'ui', 'Primary button pressed fill edge');
  add('color.text-muted', s, 'ui', 'Inactive nav icon, trailing chevron, info icon');
  add('meter.filled', s, 'ui', 'Band meter filled segment (neutral ink)');
  add('meter.empty', s, 'ui', 'Band meter empty segment outline (full opacity)');
  add('color.text', s, 'ui', 'Strong ink edges: destructive-neutral outline, invalid field border, ledger top rule, skin-map zone stroke');
  add('color.border', s, 'info', 'Decorative hairline (not gated, SC 1.4.11 exempt)');
}

add('color.on-accent', 'color.accent', 'text', 'Primary button label');
add('color.on-accent', 'color.accent-pressed', 'text', 'Primary button label, pressed');
add('color.on-accent', 'color.accent', 'ui', 'Check mark in done step / checkbox');
add('color.on-accent-subtle', 'color.accent-subtle', 'ui', 'Active nav icon on indicator pill');
add('color.on-accent-subtle', 'color.accent-subtle', 'text', 'Text on accent-subtle (selected chip)');
add('color.text', 'color.accent-subtle', 'text', 'Body text on accent-subtle');
add('color.inverse-text', 'color.inverse-surface', 'text', 'Snackbar message');
add('color.inverse-link', 'color.inverse-surface', 'text', 'Snackbar action');
add('color.disabled-fg', 'color.disabled-bg', 'text', 'Disabled primary button label (stricter than WCAG on purpose)');
add('color.on-overlay', 'color.overlay-camera', 'text', 'Capture hints, try-on badges over live camera', { camera: true });
add('color.on-overlay', 'color.overlay-camera', 'ui', 'Capture oval, barcode corners, shutter ring over live camera', { camera: true });
add('color.qr.module', 'color.qr.field', 'ui', 'QR modules (scanner)');
add('color.text', 'component.skinMap.zoneFill', 'text', 'Skin-map zone label on zone fill', { on: 'color.surface' });
add('color.text', 'meter.filled', 'text', 'Skin-map label on highlighted zone (18% ink)', { alpha: 'component.skinMap.zoneFillHighlightOpacity', on: 'color.surface' });

for (const v of VERDICTS) {
  const b = `verdict.${v}.bg`;
  add(`verdict.${v}.fg`, b, 'text', `${v.toUpperCase()} label (15dp/600 is not large text, so 4.5)`);
  add('color.text', b, 'text', `${v.toUpperCase()} subtitle (body, full text colour)`);
  add('color.text-muted', b, 'text', `${v.toUpperCase()} name-only qualifier`);
  add(`verdict.${v}.icon`, b, 'ui', `${v.toUpperCase()} 24dp icon on head`);
  add('color.focus-ring', b, 'ui', `Focus ring on ${v.toUpperCase()} head (Edit link inside head)`);
  for (const s of ['color.bg', 'color.surface']) {
    add(`verdict.${v}.border`, s, 'ui', `${v.toUpperCase()} head border against the screen`);
    add(`verdict.${v}.icon`, s, 'ui', `${v.toUpperCase()} 16dp icon in match-card tag`);
    add(`verdict.${v}.fg`, s, 'text', `${v.toUpperCase()} tag text without tint`);
  }
}

// --------------------------------------------------------------- evaluation
function colourOf(path, mode) {
  const v = resolvePath(tokens, path, mode);
  if (typeof v !== 'string') throw new Error(`${path} did not resolve to a colour in ${mode}`);
  return v;
}

function evaluate(pair, mode) {
  let fg = parse(colourOf(pair.fg, mode));
  let bgRaw = colourOf(pair.bg, mode);
  let bg = parse(bgRaw);
  if (pair.alpha) bg = { ...bg, a: resolvePath(tokens, pair.alpha, mode) };
  const backdrops = pair.camera ? ['#FFFFFF', '#000000'] : [pair.on ? colourOf(pair.on, mode) : null];
  let worst = null;
  for (const bd of backdrops) {
    let b = bg;
    if (b.a < 1) {
      if (!bd) throw new Error(`${pair.bg} is translucent in ${mode}; give the pair a backdrop`);
      b = over(b, parse(bd));
    }
    const f = fg.a < 1 ? over(fg, b) : fg;
    const r = ratio(f, b);
    if (!worst || r < worst.r) worst = { r, f: hex(f), b: hex(b), bd };
  }
  const min = MIN[pair.kind];
  return { ...pair, mode, ratio: worst.r, fgHex: worst.f, bgHex: worst.b, backdrop: worst.bd, min, pass: pair.kind === 'info' ? null : worst.r >= min - 1e-9 };
}

const results = [];
for (const mode of MODES) for (const p of PAIRS) results.push(evaluate(p, mode));

// --------------------------------------------------------------- rule lints
const lints = [];
const lint = (name, pass, detail) => lints.push({ name, pass: !!pass, detail });
const T = tokens.typography.scale;

const small = Object.entries(T).filter(([, s]) => s.size < tokens.typography.rules.minSize);
lint('Type floor: no style below 12dp', small.length === 0, small.length ? small.map(([k, s]) => `${k}=${s.size}`).join(', ') : `smallest: ${Math.min(...Object.values(T).map((s) => s.size))}dp (${Object.entries(T).filter(([, s]) => s.size === 12).map(([k]) => k).join(', ') || 'none at 12'})`);
const tight = Object.entries(T).filter(([, s]) => s.lineHeight < s.size * 1.15);
lint('Line height >= 1.15 x size on every style', tight.length === 0, tight.map(([k]) => k).join(', ') || 'ok');
lint('Verdict label >= 14dp and weight >= 600', T.verdictLabel.size >= 14 && T.verdictLabel.weight >= 600, `${T.verdictLabel.size}dp / ${T.verdictLabel.weight}`);
const vIcon = tokens.icon.verdict.size;
lint('Verdict icon 22-24dp', vIcon >= 22 && vIcon <= 24, `${vIcon}dp`);
lint('Reasons larger than the verdict label (P1), reason 18-19dp', T.reason.size > T.verdictLabel.size && T.reason.size >= 18 && T.reason.size <= 19, `reason ${T.reason.size}dp vs label ${T.verdictLabel.size}dp`);
const rr = tokens.component.reasonRow;
lint('Product fact in reasons: 16dp in full text colour', rr.fact === '{type.body}' && T.body.size === 16 && rr.factColor === '{color.text}', `${rr.fact} (${T.body.size}dp), ${rr.factColor}`);

// Touch targets: every key that names a tap target must be >= touch.min.
const TARGET_KEY = /^(minHeight|target|minTarget|itemTarget|editTarget|iconButton|torch|handle|rowMinHeight)$/;
const tooSmall = [];
let targetCount = 0;
(function walk(obj, path) {
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('$')) continue;
    const p = `${path}.${k}`;
    if (v && typeof v === 'object' && !Array.isArray(v)) { walk(v, p); continue; }
    if (TARGET_KEY.test(k)) {
      const n = resolve(tokens, v, 'light');
      if (typeof n === 'number') { targetCount++; if (n < tokens.touch.min) tooSmall.push(`${p}=${n}`); }
    }
  }
})(tokens.component, 'component');
const shutter = tokens.component.captureGuide.shutter.size;
lint(`Touch targets >= ${tokens.touch.min}dp (${targetCount} target tokens + shutter)`, tokens.touch.min >= 48 && tooSmall.length === 0 && shutter >= 48, tooSmall.join(', ') || `all >= ${tokens.touch.min}; shutter ${shutter}`);

// Motion: no overshoot, reduced motion is a short crossfade.
const eases = Object.entries(tokens.motion.ease).filter(([k]) => !k.startsWith('$'));
const overshoot = eases.filter(([, e]) => e.bezier.some((n) => n < 0 || n > 1));
lint('Easing never overshoots (all bezier values in 0..1, no springs)', overshoot.length === 0, overshoot.map(([k]) => k).join(', ') || eases.map(([k, e]) => `${k}(${e.bezier.join(',')})`).join(' '));
const rm = tokens.motion.reducedMotion;
lint('Reduced motion: crossfade <= 150ms, no translate, no stagger', rm.duration <= 150 && rm.translate === 0 && rm.stagger === 0 && rm.scaleFrom === 1, `${rm.duration}ms, translate ${rm.translate}, stagger ${rm.stagger}`);

// CAUTION is ochre in both modes: hue 25-65 degrees, never red.
for (const mode of MODES) {
  const c = resolve(tokens, tokens.semantic.color[mode].verdict.caution, mode);
  const hues = Object.entries(c).map(([k, v]) => [k, hsl(parse(v)).h]);
  const bad = hues.filter(([, h]) => h < 25 || h > 65);
  lint(`CAUTION is ochre, never red (${mode})`, bad.length === 0, hues.map(([k, h]) => `${k} ${h.toFixed(0)}deg`).join(', '));
}
lint('CAUTION tint confined to the verdict head', tokens.component.verdictCard.body.bg === 'transparent', `verdictCard.body.bg = ${tokens.component.verdictCard.body.bg}`);

// Meters are neutral ink, never the accent.
for (const mode of MODES) {
  const sem = resolve(tokens, tokens.semantic.color[mode], mode);
  const acc = sem.accent.toUpperCase();
  // Neutral = drawn from the sand ramp (by alias, not by guessing from the hex) and never equal to the accent.
  const raw = tokens.semantic.color[mode].meter;
  const bad = Object.entries(raw).filter(([k, v]) => !/^\{sand\./.test(v) || sem.meter[k].toUpperCase() === acc);
  lint(`Band meter is neutral ink, not accent (${mode})`, bad.length === 0, Object.entries(raw).map(([k, v]) => `${k} ${v} ${sem.meter[k]}`).join(', ') + `; accent ${acc}`);
  const vcols = Object.values(sem.verdict).flatMap((o) => Object.values(o).map((x) => x.toUpperCase()));
  lint(`No verdict colour equals the accent (${mode})`, !vcols.includes(acc), `accent ${acc}`);
}

// Dark primary button deepened.
{
  const d = resolve(tokens, tokens.semantic.color.dark, 'dark');
  const r = ratio(parse(d['on-accent']), parse(d.accent));
  lint('Dark primary button deepened (#86A4A7 with #0C171A)', d.accent.toUpperCase() === '#86A4A7' && d['on-accent'].toUpperCase() === '#0C171A' && r >= 4.5, `${d.accent} / ${d['on-accent']} = ${r.toFixed(2)}:1`);
}

// Grain.
const g = tokens.texture.grain;
lint('Paper grain: <= 3% static tile in light, off in dark', g.light.opacity <= 0.03 && g.dark.opacity === 0 && /static/i.test(g.tile), `light ${g.light.opacity}, dark ${g.dark.opacity}`);

// Distinct verdict silhouettes.
const glyphs = VERDICTS.map((v) => tokens.icon.verdict[v].glyph);
lint('Four distinct verdict icon silhouettes; FITS not a circle; MEDICINE is the pharmacist', new Set(glyphs).size === 4 && !/circle/.test(glyphs[0]) && /pharmacist/.test(glyphs[3]) && !VERDICTS.some((v) => /mortar|pestle|pill|cross|triangle|exclamation|shield/i.test(tokens.icon.verdict[v].glyph + ' ' + tokens.icon.verdict[v].lucide.replace(/^custom:.*/, ''))), glyphs.join(' / '));

// ------------------------------------------------------------------ output
const gated = results.filter((r) => r.pass !== null);
const failed = gated.filter((r) => !r.pass);
const lintFailed = lints.filter((l) => !l.pass);
const lowest = (mode, kind) => gated.filter((r) => r.mode === mode && r.kind === kind).sort((a, b) => a.ratio - b.ratio)[0];

const lines = [];
lines.push('# SkinKey contrast report');
lines.push('');
lines.push(`Generated by \`check-contrast.mjs\` from \`skinkey.tokens.json\` v${tokens.$meta.version}. WCAG 2.1 relative luminance. Text >= 4.5:1; icons, control edges, focus ring, meter segments and fills >= 3:1 (SC 1.4.11). Translucent colours are composited over their backdrop; camera overlays use the worse of a pure white and a pure black frame. Decorative hairlines are listed as "info" and not gated.`);
lines.push('');
lines.push(`**Result: ${gated.length} gated pairs (${gated.filter((r) => r.mode === 'light').length} light, ${gated.filter((r) => r.mode === 'dark').length} dark), ${failed.length} failures. ${lints.length} rule lints, ${lintFailed.length} failures.**`);
lines.push('');
lines.push('| Mode | Lowest text pair | Lowest non-text pair |');
lines.push('|---|---|---|');
for (const mode of MODES) {
  const t = lowest(mode, 'text'), u = lowest(mode, 'ui');
  lines.push(`| ${mode} | ${t.fg} on ${t.bg}: ${t.ratio.toFixed(2)}:1 | ${u.fg} on ${u.bg}: ${u.ratio.toFixed(2)}:1 |`);
}
lines.push('');
if (tokens.$meta.tuningHistory) {
  lines.push('## How the values got here');
  lines.push('');
  for (const h of tokens.$meta.tuningHistory) lines.push(`- ${h}`);
  lines.push('');
}
lines.push('## Rule lints');
lines.push('');
lines.push('| Rule | Result | Detail |');
lines.push('|---|---|---|');
for (const l of lints) lines.push(`| ${l.name} | ${l.pass ? 'PASS' : 'FAIL'} | ${l.detail} |`);
for (const mode of MODES) {
  lines.push('');
  lines.push(`## ${mode[0].toUpperCase() + mode.slice(1)} mode`);
  lines.push('');
  lines.push('| Foreground | Background | FG | BG | Kind | Ratio | Min | Result | Use |');
  lines.push('|---|---|---|---|---|---|---|---|---|');
  for (const r of results.filter((x) => x.mode === mode)) {
    const bd = r.backdrop ? ` (over ${r.backdrop})` : '';
    lines.push(`| ${r.fg} | ${r.bg}${bd} | ${r.fgHex} | ${r.bgHex} | ${r.kind} | ${r.ratio.toFixed(2)}:1 | ${r.kind === 'info' ? 'n/a' : r.min + ':1'} | ${r.pass === null ? 'info' : r.pass ? 'PASS' : '**FAIL**'} | ${r.use} |`);
  }
}
const md = lines.join('\n') + '\n';

const mdIdx = process.argv.indexOf('--md');
if (mdIdx > -1) writeFileSync(join(process.cwd(), process.argv[mdIdx + 1]), md);

console.log(`SkinKey contrast: ${gated.length} gated pairs, ${failed.length} failures; ${lints.length} lints, ${lintFailed.length} failures.`);
for (const f of failed) console.log(`  FAIL ${f.mode} ${f.fg} on ${f.bg}: ${f.ratio.toFixed(2)}:1 < ${f.min}:1 (${f.fgHex} on ${f.bgHex})`);
for (const l of lintFailed) console.log(`  FAIL lint: ${l.name} -> ${l.detail}`);
for (const mode of MODES) {
  const t = lowest(mode, 'text'), u = lowest(mode, 'ui');
  console.log(`  ${mode}: lowest text ${t.ratio.toFixed(2)}:1 (${t.fg} on ${t.bg}); lowest non-text ${u.ratio.toFixed(2)}:1 (${u.fg} on ${u.bg})`);
}
process.exit(failed.length || lintFailed.length ? 1 : 0);
