export const MIN_SHORT_SIDE = 1080;
export const MAX_LONG_SIDE = 4096;

interface Size {
  raw: string;
  w: number;
  h: number;
}

function parse(raw: string): Size | null {
  const m = /^(\d+)\s*x\s*(\d+)$/i.exec(raw.trim());
  if (!m) return null;
  return { raw, w: Number(m[1]), h: Number(m[2]) };
}

const short = (s: Size) => Math.min(s.w, s.h);
const long = (s: Size) => Math.max(s.w, s.h);
const aspectDistance = (s: Size) => Math.abs(long(s) / short(s) - 4 / 3);

/** Smallest 4:3-ish size whose short side is at least 1080 and long side at most 4096. */
export function pickPictureSize(available: readonly string[]): string | undefined {
  const sizes = available.map(parse).filter((s): s is Size => s !== null);
  if (sizes.length === 0) return undefined;
  const ok = sizes.filter((s) => short(s) >= MIN_SHORT_SIDE && long(s) <= MAX_LONG_SIDE);
  const pool = ok.length > 0 ? ok : sizes.filter((s) => short(s) >= MIN_SHORT_SIDE);
  if (pool.length === 0) return [...sizes].sort((a, b) => b.w * b.h - a.w * a.h)[0]?.raw;
  return [...pool].sort((a, b) => aspectDistance(a) - aspectDistance(b) || a.w * a.h - b.w * b.h)[0]?.raw;
}

export function needsDownscale(width: number, height: number): boolean {
  return Math.max(width, height) > MAX_LONG_SIDE;
}

export function meetsShortSide(width: number, height: number): boolean {
  return Math.min(width, height) >= MIN_SHORT_SIDE;
}
