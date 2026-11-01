import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import type { Tone } from '../present';

export type IconName = 'back' | 'arrow-up-right' | 'search' | 'check' | 'info' | 'close' | 'camera' | 'plus' | 'share';

interface IconProps {
  name: IconName;
  size: number;
  color: string;
  strokeWidth?: number;
}

/** Lucide-style line icons (components.md §1.2), drawn on a 24 grid. Decorative: callers hide them from TalkBack. */
export function Icon({ name, size, color, strokeWidth = 1.75 }: IconProps) {
  const s = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {name === 'back' && <Path d="M19 12H5M12 19l-7-7 7-7" {...s} />}
      {name === 'arrow-up-right' && <Path d="M7 17 17 7M8 7h9v9" {...s} />}
      {name === 'search' && (
        <>
          <Circle cx={11} cy={11} r={7} {...s} />
          <Path d="m20 20-3.5-3.5" {...s} />
        </>
      )}
      {name === 'check' && <Path d="M20 6 9 17l-5-5" {...s} />}
      {name === 'info' && (
        <>
          <Circle cx={12} cy={12} r={9} {...s} />
          <Path d="M12 16v-5M12 8h.01" {...s} />
        </>
      )}
      {name === 'close' && <Path d="M18 6 6 18M6 6l12 12" {...s} />}
      {name === 'camera' && (
        <>
          <Path d="M4 8h3l2-3h6l2 3h3v11H4z" {...s} />
          <Circle cx={12} cy={13} r={3.5} {...s} />
        </>
      )}
      {name === 'plus' && <Path d="M12 5v14M5 12h14" {...s} />}
      {name === 'share' && (
        <>
          <Circle cx={18} cy={5} r={2.5} {...s} />
          <Circle cx={6} cy={12} r={2.5} {...s} />
          <Circle cx={18} cy={19} r={2.5} {...s} />
          <Path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6" {...s} />
        </>
      )}
    </Svg>
  );
}

/** Verdict silhouettes (components.md §6): seal+check, half-filled circle, dashed circle+dot, pharmacist at counter. */
export function VerdictIcon({ tone, size, color }: { tone: Tone; size: number; color: string }) {
  const s = { stroke: color, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {tone === 'fits' && (
        <>
          <Path
            d="M12 2.5l2.2 1.6 2.7-.2.9 2.6 2.3 1.4-.8 2.6.8 2.6-2.3 1.4-.9 2.6-2.7-.2L12 21.5l-2.2-1.6-2.7.2-.9-2.6-2.3-1.4.8-2.6-.8-2.6 2.3-1.4.9-2.6 2.7.2z"
            {...s}
          />
          <Path d="m8.5 12 2.4 2.4 4.6-4.8" {...s} />
        </>
      )}
      {tone === 'caution' && (
        <>
          <Circle cx={12} cy={12} r={9} {...s} />
          <Path d="M12 3a9 9 0 0 1 0 18z" fill={color} stroke="none" />
        </>
      )}
      {tone === 'unknown' && (
        <>
          <Circle cx={12} cy={12} r={9} {...s} strokeDasharray="3 2.6" />
          <Circle cx={12} cy={12} r={1.6} fill={color} stroke="none" />
        </>
      )}
      {tone === 'medicine' && (
        <>
          <Circle cx={12} cy={6.5} r={3} {...s} />
          <Path d="M6 14c0-3 2.7-4.5 6-4.5s6 1.5 6 4.5" {...s} />
          <Line x1={3} y1={14} x2={21} y2={14} {...s} />
          <Rect x={5} y={14} width={14} height={7} {...s} />
          <Line x1={10} y1={17.5} x2={14} y2={17.5} {...s} />
        </>
      )}
    </Svg>
  );
}
