export interface Lab {
  L: number;
  a: number;
  b: number;
}

export const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`bad hex ${hex}`);
  const n = Number.parseInt(m[1]!, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const lin = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

/** sRGB (D65) to CIELAB. */
export const hexToLab = (hex: string): Lab => {
  const [r, g, b] = hexToRgb(hex).map(lin) as [number, number, number];
  const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  const z = (r * 0.0193339 + g * 0.119192 + b * 0.9503041) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
};

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** CIEDE2000 colour difference (Sharma, Wu & Dalal 2005). Used internally only; never shown. */
export const deltaE2000 = (x: Lab, y: Lab): number => {
  const C1 = Math.hypot(x.a, x.b);
  const C2 = Math.hypot(y.a, y.b);
  const Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const a1 = (1 + G) * x.a;
  const a2 = (1 + G) * y.a;
  const C1p = Math.hypot(a1, x.b);
  const C2p = Math.hypot(a2, y.b);
  const hp = (b: number, a: number) => (a === 0 && b === 0 ? 0 : (deg(Math.atan2(b, a)) + 360) % 360);
  const h1 = hp(x.b, a1);
  const h2 = hp(y.b, a2);
  const dL = y.L - x.L;
  const dC = C2p - C1p;
  let dh = 0;
  if (C1p * C2p !== 0) {
    dh = h2 - h1;
    if (dh > 180) dh -= 360;
    else if (dh < -180) dh += 360;
  }
  const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dh / 2));
  const Lb = (x.L + y.L) / 2;
  const Cbp = (C1p + C2p) / 2;
  let hb = h1 + h2;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1 - h2) <= 180) hb = (h1 + h2) / 2;
    else hb = h1 + h2 < 360 ? (h1 + h2 + 360) / 2 : (h1 + h2 - 360) / 2;
  }
  const T =
    1 - 0.17 * Math.cos(rad(hb - 30)) + 0.24 * Math.cos(rad(2 * hb)) + 0.32 * Math.cos(rad(3 * hb + 6)) - 0.2 * Math.cos(rad(4 * hb - 63));
  const dTheta = 30 * Math.exp(-(((hb - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lb - 50) ** 2) / Math.sqrt(20 + (Lb - 50) ** 2);
  const Sc = 1 + 0.045 * Cbp;
  const Sh = 1 + 0.015 * Cbp * T;
  const Rt = -Math.sin(rad(2 * dTheta)) * Rc;
  return Math.sqrt((dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh));
};

/** The n shades closest to the tone, ties broken by name for determinism. */
export const nearestShades = <S extends { name: string; hex?: string | undefined }>(toneHex: string, shades: readonly S[], n = 2): S[] => {
  const tone = hexToLab(toneHex);
  return shades
    .filter((s): s is S & { hex: string } => Boolean(s.hex))
    .map((s) => ({ s, d: deltaE2000(tone, hexToLab(s.hex)) }))
    .sort((p, q) => p.d - q.d || p.s.name.localeCompare(q.s.name))
    .slice(0, n)
    .map((p) => p.s);
};
