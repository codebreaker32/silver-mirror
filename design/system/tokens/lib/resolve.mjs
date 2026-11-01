// SkinKey token resolver. No dependencies.
// Resolves "{ref}" aliases in skinkey.tokens.json for a given colour mode.
import { readFileSync } from 'node:fs';

export const MODES = ['light', 'dark'];

export function loadTokens(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

const ALIAS = /^\{([^{}]+)\}$/;

export function isAlias(v) {
  return typeof v === 'string' && ALIAS.test(v);
}

function dig(obj, parts, ref) {
  let cur = obj;
  for (const p of parts) {
    if (cur == null || !(p in cur)) throw new Error(`Unresolved token reference ${ref}`);
    cur = cur[p];
  }
  return cur;
}

// Returns the raw (unresolved) target of an alias, plus its kind.
export function lookup(tokens, ref, mode) {
  const m = ref.match(ALIAS);
  if (!m) throw new Error(`Not an alias: ${ref}`);
  const parts = m[1].split('.');
  const [head, ...rest] = parts;
  const prim = tokens.primitive.color;
  if (head in prim) return { kind: 'primitive', value: dig(prim, [head, ...rest], ref) };
  const sem = tokens.semantic.color[mode];
  switch (head) {
    case 'color': return { kind: 'color', value: dig(sem, rest, ref) };
    case 'verdict': return { kind: 'color', value: dig(sem.verdict, rest, ref) };
    case 'meter': return { kind: 'color', value: dig(sem.meter, rest, ref) };
    case 'space': {
      const k = rest.join('.');
      if (k in tokens.spacing.scale) return { kind: 'number', value: tokens.spacing.scale[k] };
      return { kind: 'number', value: dig(tokens.spacing.semantic, rest, ref) };
    }
    case 'radius': return { kind: 'number', value: dig(tokens.radius, rest, ref) };
    case 'type': return { kind: 'type', value: dig(tokens.typography.scale, rest, ref), name: rest[0] };
    case 'elevation': return { kind: 'elevation', value: dig(tokens.elevation[mode], rest, ref) };
    case 'icon': return { kind: 'number', value: dig(tokens.icon, rest, ref) };
    case 'touch': return { kind: 'number', value: dig(tokens.touch, rest, ref) };
    case 'z': return { kind: 'number', value: dig(tokens.zIndex, rest, ref) };
    case 'duration': return { kind: 'number', value: dig(tokens.motion.duration, rest, ref) };
    case 'ease': return { kind: 'ease', value: dig(tokens.motion.ease, rest, ref) };
    default: throw new Error(`Unknown token namespace in ${ref}`);
  }
}

// Fully resolve a value (string alias, object or array) for a mode.
export function resolve(tokens, value, mode, seen = new Set()) {
  if (isAlias(value)) {
    if (seen.has(value)) throw new Error(`Circular token reference ${value}`);
    const next = new Set(seen).add(value);
    return resolve(tokens, lookup(tokens, value, mode).value, mode, next);
  }
  if (Array.isArray(value)) return value.map((v) => resolve(tokens, v, mode, seen));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith('$')) continue;
      out[k] = resolve(tokens, v, mode, seen);
    }
    return out;
  }
  return value;
}

// Resolve a dotted path such as "color.text", "verdict.fits.bg",
// "component.reasonRow.factColor" or a literal "#hex"/"rgba()".
export function resolvePath(tokens, path, mode) {
  if (/^#|^rgba?\(/.test(path)) return path;
  if (isAlias(path)) return resolve(tokens, path, mode);
  const [head, ...rest] = path.split('.');
  if (head === 'component') return resolve(tokens, dig(tokens.component, rest, path), mode);
  return resolve(tokens, `{${path}}`, mode);
}

export function resolvedColors(tokens, mode) {
  return resolve(tokens, tokens.semantic.color[mode], mode);
}
