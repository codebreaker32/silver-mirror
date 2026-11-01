import { useEffect, useState } from 'react';

const NAMES = [
  'YouCam Skin Analysis HD',
  'YouCam Facial Color Tones',
  'YouCam Makeup VTO',
  'YouCam task delete',
  'Claude Opus 5.5',
  'Cloudflare Workers',
  'Expo',
];

export function BuiltOn() {
  const [lit, setLit] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setLit((i) => (i + 1) % NAMES.length), 2000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <section className="field-sunken built" data-tone="sunken" aria-label="What SkinKey is built on">
      <div className="wrap" data-reveal>
        <p>
          Built on{' '}
          {NAMES.map((n, i) => (
            <span key={n}>
              <span className={`name${i === lit ? ' lit' : ''}`}>{n}</span>
              {i < NAMES.length - 1 ? ', ' : ''}
            </span>
          ))}
          , and a set of published rules that make every call.
        </p>
      </div>
    </section>
  );
}
