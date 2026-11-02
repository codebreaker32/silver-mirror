import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Separation between groups. Tokens 2.3 (light): no thin rules, so the default divider is space only (a transparent
 * 1dp line plus its spacing); dark keeps the hairline. `strong` keeps a border-strong line (meaningful edges, ≥3:1).
 */
export function Divider({ inset = 0, strong = false, vertical = false, spacing = 0 }: { inset?: number; strong?: boolean; vertical?: boolean; spacing?: number }) {
  const t = useTheme();
  const color = strong ? t.colors.borderStrong : t.dark ? t.colors.border : 'transparent';
  return (
    <View
      importantForAccessibility="no"
      accessibilityElementsHidden
      style={
        vertical
          ? { width: 1, alignSelf: 'stretch', backgroundColor: color, marginHorizontal: spacing }
          : { height: 1, alignSelf: 'stretch', backgroundColor: color, marginLeft: inset, marginVertical: spacing }
      }
    />
  );
}
