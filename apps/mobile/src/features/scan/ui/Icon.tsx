import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';

export type IconName = 'check' | 'back' | 'info' | 'trash' | 'close' | 'flip' | 'arrowUpRight' | 'chevronRight' | 'scanFace';

const PATHS: Record<IconName, string[]> = {
  check: ['M20 6 9 17l-5-5'],
  back: ['M15 18l-6-6 6-6'],
  chevronRight: ['M9 18l6-6-6-6'],
  info: ['M12 16v-4', 'M12 8h.01'],
  trash: ['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 14H6L5 6', 'M10 11v6', 'M14 11v6'],
  close: ['M18 6 6 18', 'M6 6l12 12'],
  flip: ['M3 7h13l-3-3', 'M21 17H8l3 3'],
  arrowUpRight: ['M7 17 17 7', 'M7 7h10v10'],
  scanFace: ['M3 7V5a2 2 0 0 1 2-2h2', 'M17 3h2a2 2 0 0 1 2 2v2', 'M21 17v2a2 2 0 0 1-2 2h-2', 'M7 21H5a2 2 0 0 1-2-2v-2', 'M9 15c.8.7 1.8 1 3 1s2.2-.3 3-1', 'M9 9h.01', 'M15 9h.01'],
};

export function Icon({ name, size, color }: { name: IconName; size?: number; color?: string }) {
  const theme = useTheme();
  const s = size ?? theme.icon.md;
  const stroke = color ?? theme.colors.text;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {name === 'info' ? <Circle cx={12} cy={12} r={10} stroke={stroke} strokeWidth={theme.icon.stroke} /> : null}
      {PATHS[name].map((d) => (
        <Path key={d} d={d} stroke={stroke} strokeWidth={theme.icon.stroke} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Svg>
  );
}
