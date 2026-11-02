import type { Band, KeyProfile } from '@skinkey/contracts';

const CONCERNS = ['oiliness', 'moisture', 'redness', 'pore'] as const;
const FILLED: Record<Band, number> = { Low: 1, Medium: 2, High: 3 };
const label = (c: string) => `${c[0]!.toUpperCase()}${c.slice(1)} reading`;

/** Three-segment neutral meter (DESIGN.md §1.6: bands, never numbers). Decorative: the band word carries the value. */
export function BandMeter({ level }: { level: Band }) {
  return (
    <span className="band-meter" aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <span key={i} data-on={i <= FILLED[level] ? 'true' : undefined} />
      ))}
    </span>
  );
}

/** Band list (component.bandList): one row per reading, the band in bodyStrong, a meter, no numbers. */
export function BandList({ bands }: { bands: KeyProfile['bands'] }) {
  return (
    <ul className="band-list">
      {CONCERNS.map((c) => (
        <li key={c}>
          <span className="band-name">{label(c)}</span>
          <BandMeter level={bands[c].level} />
          <strong className="band-value">{bands[c].level}</strong>
        </li>
      ))}
    </ul>
  );
}
