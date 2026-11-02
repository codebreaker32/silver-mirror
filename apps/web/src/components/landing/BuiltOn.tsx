import { COPY } from '@skinkey/contracts';

/** Plain names in columns: what the app is built on, grouped by job. No logos. */
const GROUPS: { kind: string; names: string[] }[] = [
  { kind: 'YouCam API, Perfect Corp', names: ['Skin Analysis HD', 'Facial Color Tones', 'Makeup VTO', 'Task delete'] },
  { kind: 'Reading labels and titles', names: ['Claude Opus 5.5', 'Structured outputs', 'You confirm every name'] },
  { kind: 'Making every call', names: ['Published rules package', 'Same code on the phone and here', 'Frozen before the audit'] },
  { kind: 'Running it', names: ['Cloudflare Workers', 'Expo and React Native', 'This site: Vite and React'] },
];

export function BuiltOn() {
  return (
    <section className="built" aria-labelledby="built-title">
      <div className="wrap built-grid">
        <h2 id="built-title" data-reveal>
          Built on
        </h2>
        <div className="built-cols" data-reveal>
          {GROUPS.map((g) => (
            <ul key={g.kind} aria-label={g.kind}>
              <li className="built-kind">{g.kind}</li>
              {g.names.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          ))}
        </div>
        <p className="caption built-note">{COPY.howMadeBoundary} Claude never picks the verdict.</p>
      </div>
    </section>
  );
}
