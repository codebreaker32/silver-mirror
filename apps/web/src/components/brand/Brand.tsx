import { COPY } from '@skinkey/contracts';
import { useId } from 'react';
import { WORDMARK_PATH, WORDMARK_VIEWBOX } from './wordmarkPath';

const S_PATH = 'M65 31.5C61 25.5 45.5 23 38.6 29.4C32.2 35.4 35.2 44 46.4 48.2C58.4 52.6 66.6 57.4 63.6 67.2C60.4 76.6 42.4 78.6 34.6 70.4';
const CHROME_STOPS: [number, string][] = [
  [0, '--sk-color-mark-chrome-1'],
  [0.2, '--sk-color-mark-chrome-2'],
  [0.36, '--sk-color-mark-chrome-hi'],
  [0.5, '--sk-color-mark-chrome-1'],
  [0.62, '--sk-color-mark-chrome-3'],
  [0.78, '--sk-color-mark-chrome-4'],
  [0.9, '--sk-color-mark-chrome-1'],
  [1, '--sk-color-mark-chrome-lo'],
];

/**
 * The chrome-S mark on its pearl tile (design/brand/silver-mirror-mark.svg), drawn from the theme's mark tokens so it
 * follows light and dark. Decorative next to the wordmark; pass `label` only when it stands alone.
 */
export function SilverMark({ size = 40, label, tile = true }: { size?: number; label?: string; tile?: boolean }) {
  const id = useId().replace(/:/g, '');
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };
  return (
    <svg className="silver-mark" width={size} height={size} viewBox="0 0 100 100" focusable="false" {...a11y}>
      <defs>
        <linearGradient id={`${id}c`} gradientUnits="userSpaceOnUse" x1="30" y1="20" x2="70" y2="82">
          {CHROME_STOPS.map(([o, v]) => (
            <stop key={o} offset={o} style={{ stopColor: `var(${v})` }} />
          ))}
        </linearGradient>
        <linearGradient id={`${id}t`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0" style={{ stopColor: 'var(--sk-color-mark-tile-top)' }} />
          <stop offset="1" style={{ stopColor: 'var(--sk-color-mark-tile-bottom)' }} />
        </linearGradient>
        <radialGradient id={`${id}h`} gradientUnits="userSpaceOnUse" cx="28" cy="20" r="62">
          <stop offset="0" style={{ stopColor: 'var(--sk-color-mark-glint)', stopOpacity: 'var(--mark-hi, 0.7)' }} />
          <stop offset="1" style={{ stopColor: 'var(--sk-color-mark-glint)', stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      {tile && (
        <>
          <rect width="100" height="100" rx="22.5" fill={`url(#${id}t)`} />
          <rect width="100" height="100" rx="22.5" fill={`url(#${id}h)`} />
          <rect x="0.3" y="0.3" width="99.4" height="99.4" rx="22.5" fill="none" strokeWidth="0.6" style={{ stroke: 'var(--sk-color-mark-tile-edge)' }} />
        </>
      )}
      <path d={S_PATH} transform="translate(1.2 1.9)" strokeOpacity="0.22" strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ stroke: 'var(--sk-color-mark-shade)' }} />
      <path d={S_PATH} stroke={`url(#${id}c)`} strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M60.6 28.6C55.6 25.6 46.6 25.2 41.4 29.4" strokeOpacity="0.85" strokeWidth="1.6" strokeLinecap="round" fill="none" style={{ stroke: 'var(--sk-color-mark-glint)' }} />
      <path d="M50.4 50.6C56.6 52.9 61.6 56.2 62 61.6" strokeOpacity="0.85" strokeWidth="1.6" strokeLinecap="round" fill="none" style={{ stroke: 'var(--sk-color-mark-glint)' }} />
    </svg>
  );
}

/** "Silver Mirror" outlined in Noto Serif Display, in the current text colour. Sized by height (cap height ≈ 0.92 of it). */
export function Wordmark({ height = 18, decorative = false }: { height?: number; decorative?: boolean }) {
  const [, , w, h] = WORDMARK_VIEWBOX.split(' ').map(Number);
  const a11y = decorative ? { 'aria-hidden': true as const } : { role: 'img', 'aria-label': COPY.appName };
  return (
    <svg className="wordmark-svg" height={height} width={(height * w!) / h!} viewBox={WORDMARK_VIEWBOX} focusable="false" {...a11y}>
      <path d={WORDMARK_PATH} fill="currentColor" />
    </svg>
  );
}

/** Header lockup: the tile and the wordmark in a row (DESIGN.md §3). The text name is the accessible name. */
export function BrandLockup({ markSize = 36, wordHeight = 17 }: { markSize?: number; wordHeight?: number }) {
  return (
    <span className="lockup">
      <SilverMark size={markSize} />
      <Wordmark height={wordHeight} decorative />
      <span className="visually-hidden">{COPY.appName}</span>
    </span>
  );
}
