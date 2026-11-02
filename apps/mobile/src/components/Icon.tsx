import type { ReactNode } from 'react';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import type { Verdict } from '@skinkey/design';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * One line-icon set for the whole app (DESIGN.md §7): 24dp grid, 1.5 stroke, round caps and joins, no fills
 * (except the CAUTION half circle and small dots). Kebab-case names. Icons are decorative: they are hidden from
 * TalkBack, so an icon-only control must carry its own accessibilityLabel (see IconButton).
 */
export type IconName =
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'arrow-right'
  | 'arrow-up-right'
  | 'arrow-down-left'
  | 'share'
  | 'paste'
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
  | 'flip'
  | 'torch'
  | 'cloud-off'
  | 'gear'
  | 'more-horizontal'
  | 'plus'
  | 'waves'
  | 'sun'
  | 'leaf'
  | 'spray-off'
  | 'bottle'
  | 'tube'
  | 'jar'
  | 'clock'
  | 'document';

/** Old names from the two retired kits (features/check/ui, features/scan/ui). Prefer the kebab-case names. */
export type LegacyIconName = 'back' | 'arrowUpRight' | 'chevronRight' | 'scanFace';

const LEGACY: Record<LegacyIconName, IconName> = {
  back: 'chevron-left',
  arrowUpRight: 'arrow-up-right',
  chevronRight: 'chevron-right',
  scanFace: 'face-frame',
};

export const ICON_NAMES: readonly IconName[] = [
  'chevron-left', 'chevron-right', 'chevron-down', 'arrow-right', 'arrow-up-right', 'arrow-down-left', 'share', 'paste',
  'search', 'check', 'check-circle', 'minus-circle', 'circle', 'circle-dot', 'circle-dashed-dot', 'seal-check',
  'circle-half', 'pharmacist-counter', 'droplet', 'face-frame', 'tag-check', 'phone-lock', 'trash', 'info', 'close',
  'camera', 'flip', 'torch', 'cloud-off', 'gear', 'more-horizontal', 'plus', 'waves', 'sun', 'leaf', 'spray-off',
  'bottle', 'tube', 'jar', 'clock', 'document',
];

export interface IconProps {
  name: IconName | LegacyIconName;
  /** dp; defaults to icon.md (20). Use 16 / 20 / 24 / 32. */
  size?: number;
  /** Defaults to colors.text. */
  color?: string;
  /** Defaults to icon.stroke (1.5); the selected tab uses 2.0. */
  strokeWidth?: number;
}

function glyph(name: IconName, color: string, sw: number): ReactNode {
  const s = { stroke: color, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const dot = { fill: color, stroke: 'none' };
  switch (name) {
    case 'chevron-left':
      return <Path d="M15 18l-6-6 6-6" {...s} />;
    case 'chevron-right':
      return <Path d="M9 18l6-6-6-6" {...s} />;
    case 'chevron-down':
      return <Path d="M6 9l6 6 6-6" {...s} />;
    case 'arrow-right':
      return <Path d="M5 12h14M13 6l6 6-6 6" {...s} />;
    case 'arrow-up-right':
      return <Path d="M7 17 17 7M8 7h9v9" {...s} />;
    case 'arrow-down-left':
      return <Path d="M17 7 7 17M16 17H7V8" {...s} />;
    case 'share':
      return (
        <>
          <Circle cx={18} cy={5} r={2.5} {...s} />
          <Circle cx={6} cy={12} r={2.5} {...s} />
          <Circle cx={18} cy={19} r={2.5} {...s} />
          <Path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6" {...s} />
        </>
      );
    case 'paste':
      return (
        <>
          <Path d="M9 4.5H7a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6.5a2 2 0 0 0-2-2h-2" {...s} />
          <Rect x={9} y={3} width={6} height={3.5} rx={1} {...s} />
          <Path d="M9 12h6M9 16h4" {...s} />
        </>
      );
    case 'search':
      return (
        <>
          <Circle cx={11} cy={11} r={7} {...s} />
          <Path d="m20 20-3.5-3.5" {...s} />
        </>
      );
    case 'check':
      return <Path d="M20 6 9 17l-5-5" {...s} />;
    case 'check-circle':
      return (
        <>
          <Circle cx={12} cy={12} r={9} {...s} />
          <Path d="m8.5 12.3 2.4 2.4 4.6-4.9" {...s} />
        </>
      );
    case 'minus-circle':
      return (
        <>
          <Circle cx={12} cy={12} r={9} {...s} />
          <Path d="M8.5 12h7" {...s} />
        </>
      );
    case 'circle':
      return <Circle cx={12} cy={12} r={9} {...s} />;
    case 'circle-dot':
      return (
        <>
          <Circle cx={12} cy={12} r={9} {...s} />
          <Circle cx={12} cy={12} r={3} {...dot} />
        </>
      );
    case 'circle-dashed-dot':
      return (
        <>
          <Circle cx={12} cy={12} r={9} {...s} strokeDasharray="3 2.6" />
          <Circle cx={12} cy={12} r={1.6} {...dot} />
        </>
      );
    case 'seal-check':
      return (
        <>
          <Path
            d="M12 2.5l2.2 1.6 2.7-.2.9 2.6 2.3 1.4-.8 2.6.8 2.6-2.3 1.4-.9 2.6-2.7-.2L12 21.5l-2.2-1.6-2.7.2-.9-2.6-2.3-1.4.8-2.6-.8-2.6 2.3-1.4.9-2.6 2.7.2z"
            {...s}
          />
          <Path d="m8.5 12 2.4 2.4 4.6-4.8" {...s} />
        </>
      );
    case 'circle-half':
      return (
        <>
          <Circle cx={12} cy={12} r={9} {...s} />
          <Path d="M12 3a9 9 0 0 1 0 18z" {...dot} />
        </>
      );
    case 'pharmacist-counter':
      return (
        <>
          <Circle cx={12} cy={6.5} r={3} {...s} />
          <Path d="M6 14c0-3 2.7-4.5 6-4.5s6 1.5 6 4.5" {...s} />
          <Line x1={3} y1={14} x2={21} y2={14} {...s} />
          <Rect x={5} y={14} width={14} height={7} {...s} />
          <Line x1={10} y1={17.5} x2={14} y2={17.5} {...s} />
        </>
      );
    case 'droplet':
      return <Path d="M12 3.2c3.3 4 6.2 7.3 6.2 10.8a6.2 6.2 0 0 1-12.4 0c0-3.5 2.9-6.8 6.2-10.8z" {...s} />;
    case 'face-frame':
      return (
        <>
          <Path d="M3.5 8V6a2.5 2.5 0 0 1 2.5-2.5h2M16 3.5h2A2.5 2.5 0 0 1 20.5 6v2M20.5 16v2a2.5 2.5 0 0 1-2.5 2.5h-2M8 20.5H6A2.5 2.5 0 0 1 3.5 18v-2" {...s} />
          <Ellipse cx={12} cy={12} rx={4} ry={5} {...s} />
        </>
      );
    case 'tag-check':
      return (
        <>
          <Path d="M3.5 11.6V5a1.5 1.5 0 0 1 1.5-1.5h6.6l8.9 8.9a1.5 1.5 0 0 1 0 2.1l-6.1 6.1a1.5 1.5 0 0 1-2.1 0z" {...s} />
          <Path d="m8.6 12.4 2.1 2.1 3.9-4" {...s} />
          <Circle cx={7.6} cy={7.6} r={1.1} {...dot} />
        </>
      );
    case 'phone-lock':
      return (
        <>
          <Rect x={6.5} y={2.5} width={11} height={19} rx={2.5} {...s} />
          <Rect x={9.5} y={11} width={5} height={4} rx={1} {...s} />
          <Path d="M10.5 11V9.8a1.5 1.5 0 0 1 3 0V11M10.5 18.5h3" {...s} />
        </>
      );
    case 'trash':
      return <Path d="M4 6.5h16M9 6.5V4.5h6v2M18.5 6.5l-.9 13a1.5 1.5 0 0 1-1.5 1.5H7.9a1.5 1.5 0 0 1-1.5-1.5l-.9-13M10 11v6M14 11v6" {...s} />;
    case 'info':
      return (
        <>
          <Circle cx={12} cy={12} r={9} {...s} />
          <Path d="M12 16.5v-5M12 8h.01" {...s} />
        </>
      );
    case 'close':
      return <Path d="M18 6 6 18M6 6l12 12" {...s} />;
    case 'camera':
      return (
        <>
          <Path d="M4 8.5a1.5 1.5 0 0 1 1.5-1.5h2l1.6-2.5h5.8L16.5 7h2A1.5 1.5 0 0 1 20 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18z" {...s} />
          <Circle cx={12} cy={13} r={3.5} {...s} />
        </>
      );
    case 'flip':
      return <Path d="M3.5 8.5h14l-3-3M20.5 15.5h-14l3 3" {...s} />;
    case 'torch':
      return <Path d="M8 3h8v4l-2 3.2V21h-4V10.2L8 7zM8 7h8M12 13.5v2" {...s} />;
    case 'cloud-off':
      return <Path d="M3 3l18 18M8.4 6.3A5.6 5.6 0 0 1 17.3 10h.4a3.6 3.6 0 0 1 2.6 6.1M16.5 18H7a4 4 0 0 1-1.5-7.7" {...s} />;
    case 'gear':
      return (
        <>
          <Path
            d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
            {...s}
          />
          <Circle cx={12} cy={12} r={3} {...s} />
        </>
      );
    case 'more-horizontal':
      return (
        <>
          <Circle cx={5.5} cy={12} r={1.4} {...dot} />
          <Circle cx={12} cy={12} r={1.4} {...dot} />
          <Circle cx={18.5} cy={12} r={1.4} {...dot} />
        </>
      );
    case 'plus':
      return <Path d="M12 5v14M5 12h14" {...s} />;
    case 'waves':
      return <Path d="M3.5 8c2.1-1.6 3.6-1.6 5.7 0s3.6 1.6 5.7 0 3.6-1.6 5.6 0M3.5 12.5c2.1-1.6 3.6-1.6 5.7 0s3.6 1.6 5.7 0 3.6-1.6 5.6 0M3.5 17c2.1-1.6 3.6-1.6 5.7 0s3.6 1.6 5.7 0 3.6-1.6 5.6 0" {...s} />;
    case 'sun':
      return (
        <>
          <Circle cx={12} cy={12} r={4} {...s} />
          <Path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" {...s} />
        </>
      );
    case 'leaf':
      return <Path d="M5 19c0-8 5-13.5 14.5-14-.2 9.5-5.7 14.5-13 14.5M5 19c3-4 6-6.5 9.5-8" {...s} />;
    case 'spray-off':
      return (
        <>
          <Path d="M8 10h6v10.5a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1zM9.5 10V6.5h3V10M12.5 7.5H15" {...s} />
          <Path d="M17.5 5.5h.01M19.5 7.5h.01M17.5 9.5h.01M3.5 3.5l17 17" {...s} />
        </>
      );
    case 'bottle':
      return <Path d="M10 2.5h4v3l1.5 2.2A2 2 0 0 1 16 9v10.5a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9a2 2 0 0 1 .5-1.3L10 5.5zM8 12.5h8" {...s} />;
    case 'tube':
      return <Path d="M7 3h10l-1.5 13.5a1.5 1.5 0 0 1-1.5 1.3h-4a1.5 1.5 0 0 1-1.5-1.3zM10 17.8V21h4v-3.2M7.4 6.5h9.2" {...s} />;
    case 'jar':
      return (
        <>
          <Rect x={5} y={4} width={14} height={4} rx={1.5} {...s} />
          <Path d="M6 8v10.5A2.5 2.5 0 0 0 8.5 21h7a2.5 2.5 0 0 0 2.5-2.5V8M9 13h6" {...s} />
        </>
      );
    case 'clock':
      return (
        <>
          <Circle cx={12} cy={12} r={9} {...s} />
          <Path d="M12 7.5V12l3 2" {...s} />
        </>
      );
    case 'document':
      return <Path d="M14 3H7.5A1.5 1.5 0 0 0 6 4.5v15A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V7zM14 3v4h4M9 12h6M9 16h6" {...s} />;
  }
}

export function resolveIconName(name: IconName | LegacyIconName): IconName {
  return (LEGACY as Record<string, IconName>)[name] ?? (name as IconName);
}

export function Icon({ name, size, color, strokeWidth }: IconProps) {
  const t = useTheme();
  const px = size ?? t.icon.md;
  return (
    <Svg width={px} height={px} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {glyph(resolveIconName(name), color ?? t.colors.text, strokeWidth ?? t.icon.stroke)}
    </Svg>
  );
}

/** Verdict silhouettes (DESIGN.md §2.2): seal-check, half circle, dashed circle + dot, pharmacist at a counter. */
export function VerdictIcon({ tone, size, color }: { tone: Verdict; size?: number; color?: string }) {
  const t = useTheme();
  return <Icon name={t.icon.verdictGlyph[tone] as IconName} size={size ?? t.icon.verdictSize} color={color ?? t.colors.verdict[tone].icon} />;
}
