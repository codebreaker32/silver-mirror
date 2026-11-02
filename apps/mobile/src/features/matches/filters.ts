/**
 * Reading filter chips for better matches (DESIGN.md §9.5): one chip per reading the ranked reasons name, e.g.
 * "For your oiliness". The chips only narrow the list we already ranked by the published rules; they never re-rank,
 * add products or make a claim of their own.
 */

/** "Oiliness reading: High", "Nose pore reading: High", "T-zone reading: Oily" → the reading names, in order. */
export function readingsIn(reasonLine: string): string[] {
  const out: string[] = [];
  for (const m of reasonLine.matchAll(/([A-Z][\w-]*(?: pore)?) reading:/g)) {
    const name = m[1]!;
    if (!out.includes(name)) out.push(name);
  }
  return out;
}

export interface ReadingFilter {
  /** The reading name as the reasons write it ("Nose pore"). */
  reading: string;
  /** Chip label: "For your nose pores". */
  label: string;
  count: number;
}

const chipLabel = (reading: string) => `For your ${reading.toLowerCase().replace(/ pore$/, ' pores').replace(/^pore$/, 'pores')}`;

/** Filters worth offering: readings named by at least one match, most common first, at most three. */
export function readingFilters(matches: readonly { readings: readonly string[] }[], max = 3): ReadingFilter[] {
  const counts = new Map<string, number>();
  for (const m of matches) for (const r of m.readings) counts.set(r, (counts.get(r) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([reading, count]) => ({ reading, label: chipLabel(reading), count }));
}

export const applyReadingFilter = <T extends { readings: readonly string[] }>(matches: readonly T[], reading: string | null): T[] =>
  reading ? matches.filter((m) => m.readings.includes(reading)) : [...matches];
