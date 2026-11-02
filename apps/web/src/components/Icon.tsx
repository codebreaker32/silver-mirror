import type { VerdictLabel } from '@skinkey/contracts';
import type { ReactNode } from 'react';

/**
 * The app's line-icon set on the web (DESIGN.md §7, same paths as apps/mobile/src/components/Icon.tsx): 24px grid,
 * 1.5 stroke, round caps and joins, no fills except the CAUTION half circle and small dots. Always decorative
 * (aria-hidden); a control that shows only an icon carries its own aria-label.
 */
export type IconName =
  | 'chevron-left'
  | 'chevron-right'
  | 'arrow-right'
  | 'arrow-up-right'
  | 'arrow-down-left'
  | 'share'
  | 'search'
  | 'check'
  | 'check-circle'
  | 'minus-circle'
  | 'circle'
  | 'circle-dot'
  | 'circle-dashed-dot'
  | 'seal-check'
  | 'circle-half'
  | 'pharmacist-counter'
  | 'droplet'
  | 'face-frame'
  | 'tag-check'
  | 'phone-lock'
  | 'trash'
  | 'info'
  | 'close'
  | 'camera'
  | 'download'
  | 'document'
  | 'leaf';

const s = { stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;
const dot = { fill: 'currentColor', stroke: 'none' } as const;

const GLYPHS: Record<IconName, ReactNode> = {
  'chevron-left': <path d="M15 18l-6-6 6-6" {...s} />,
  'chevron-right': <path d="M9 18l6-6-6-6" {...s} />,
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" {...s} />,
  'arrow-up-right': <path d="M7 17 17 7M8 7h9v9" {...s} />,
  'arrow-down-left': <path d="M17 7 7 17M16 17H7V8" {...s} />,
  share: (
    <>
      <circle cx={18} cy={5} r={2.5} {...s} />
      <circle cx={6} cy={12} r={2.5} {...s} />
      <circle cx={18} cy={19} r={2.5} {...s} />
      <path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6" {...s} />
    </>
  ),
  search: (
    <>
      <circle cx={11} cy={11} r={7} {...s} />
      <path d="m20 20-3.5-3.5" {...s} />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" {...s} />,
  'check-circle': (
    <>
      <circle cx={12} cy={12} r={9} {...s} />
      <path d="m8.5 12.3 2.4 2.4 4.6-4.9" {...s} />
    </>
  ),
  'minus-circle': (
    <>
      <circle cx={12} cy={12} r={9} {...s} />
      <path d="M8.5 12h7" {...s} />
    </>
  ),
  circle: <circle cx={12} cy={12} r={9} {...s} />,
  'circle-dot': (
    <>
      <circle cx={12} cy={12} r={9} {...s} />
      <circle cx={12} cy={12} r={3} {...dot} />
    </>
  ),
  'circle-dashed-dot': (
    <>
      <circle cx={12} cy={12} r={9} {...s} strokeDasharray="3 2.6" />
      <circle cx={12} cy={12} r={1.6} {...dot} />
    </>
  ),
  'seal-check': (
    <>
      <path
        d="M12 2.5l2.2 1.6 2.7-.2.9 2.6 2.3 1.4-.8 2.6.8 2.6-2.3 1.4-.9 2.6-2.7-.2L12 21.5l-2.2-1.6-2.7.2-.9-2.6-2.3-1.4.8-2.6-.8-2.6 2.3-1.4.9-2.6 2.7.2z"
        {...s}
      />
      <path d="m8.5 12 2.4 2.4 4.6-4.8" {...s} />
    </>
  ),
  'circle-half': (
    <>
      <circle cx={12} cy={12} r={9} {...s} />
      <path d="M12 3a9 9 0 0 1 0 18z" {...dot} />
    </>
  ),
  'pharmacist-counter': (
    <>
      <circle cx={12} cy={6.5} r={3} {...s} />
      <path d="M6 14c0-3 2.7-4.5 6-4.5s6 1.5 6 4.5M3 14h18M10 17.5h4" {...s} />
      <rect x={5} y={14} width={14} height={7} {...s} />
    </>
  ),
  droplet: <path d="M12 3.2c3.3 4 6.2 7.3 6.2 10.8a6.2 6.2 0 0 1-12.4 0c0-3.5 2.9-6.8 6.2-10.8z" {...s} />,
  'face-frame': (
    <>
      <path d="M3.5 8V6a2.5 2.5 0 0 1 2.5-2.5h2M16 3.5h2A2.5 2.5 0 0 1 20.5 6v2M20.5 16v2a2.5 2.5 0 0 1-2.5 2.5h-2M8 20.5H6A2.5 2.5 0 0 1 3.5 18v-2" {...s} />
      <ellipse cx={12} cy={12} rx={4} ry={5} {...s} />
    </>
  ),
  'tag-check': (
    <>
      <path d="M3.5 11.6V5a1.5 1.5 0 0 1 1.5-1.5h6.6l8.9 8.9a1.5 1.5 0 0 1 0 2.1l-6.1 6.1a1.5 1.5 0 0 1-2.1 0z" {...s} />
      <path d="m8.6 12.4 2.1 2.1 3.9-4" {...s} />
      <circle cx={7.6} cy={7.6} r={1.1} {...dot} />
    </>
  ),
  'phone-lock': (
    <>
      <rect x={6.5} y={2.5} width={11} height={19} rx={2.5} {...s} />
      <rect x={9.5} y={11} width={5} height={4} rx={1} {...s} />
      <path d="M10.5 11V9.8a1.5 1.5 0 0 1 3 0V11M10.5 18.5h3" {...s} />
    </>
  ),
  trash: <path d="M4 6.5h16M9 6.5V4.5h6v2M18.5 6.5l-.9 13a1.5 1.5 0 0 1-1.5 1.5H7.9a1.5 1.5 0 0 1-1.5-1.5l-.9-13M10 11v6M14 11v6" {...s} />,
  info: (
    <>
      <circle cx={12} cy={12} r={9} {...s} />
      <path d="M12 16.5v-5M12 8h.01" {...s} />
    </>
  ),
  close: <path d="M18 6 6 18M6 6l12 12" {...s} />,
  camera: (
    <>
      <path d="M4 8.5a1.5 1.5 0 0 1 1.5-1.5h2l1.6-2.5h5.8L16.5 7h2A1.5 1.5 0 0 1 20 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18z" {...s} />
      <circle cx={12} cy={13} r={3.5} {...s} />
    </>
  ),
  download: <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" {...s} />,
  document: <path d="M14 3H7.5A1.5 1.5 0 0 0 6 4.5v15A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V7zM14 3v4h4M9 12h6M9 16h6" {...s} />,
  leaf: <path d="M5 19c0-8 5-13.5 14.5-14-.2 9.5-5.7 14.5-13 14.5M5 19c3-4 6-6.5 9.5-8" {...s} />,
};

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={className ? `icon ${className}` : 'icon'} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {GLYPHS[name]}
    </svg>
  );
}

/** One silhouette per verdict (DESIGN.md §2.2): seal-check, half circle, dashed circle + dot, pharmacist at a counter. */
export const VERDICT_ICON: Record<VerdictLabel, IconName> = {
  FITS: 'seal-check',
  CAUTION: 'circle-half',
  UNKNOWN: 'circle-dashed-dot',
  MEDICINE: 'pharmacist-counter',
};

export function VerdictIcon({ label, size = 24 }: { label: VerdictLabel; size?: number }) {
  return <Icon name={VERDICT_ICON[label]} size={size} className={`verdict-icon v-${label.toLowerCase()}`} />;
}
