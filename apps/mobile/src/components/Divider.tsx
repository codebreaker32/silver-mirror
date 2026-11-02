import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

/** 1dp hairline. `strong` uses border-strong (meaningful edges, ≥3:1); `inset` indents from the leading edge. Decorative. */
export function Divider({ inset = 0, strong = false, vertical = false, spacing = 0 }: { inset?: number; strong?: boolean; vertical?: boolean; spacing?: number }) {
  const t = useTheme();
  const color = strong ? t.colors.borderStrong : t.colors.border;
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
