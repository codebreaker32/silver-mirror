import type { ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Frosted card of the dashboard (colors reference): the near-white lilac glass fill, a 1dp white hairline at ~70% and
 * a soft plum-tinted offset shadow. Used by the Home cards and the floating tab bar.
 */
export function useGlass(radius: number, lift: 'card' | 'bar' = 'card'): ViewStyle {
  const t = useTheme();
  const bar = lift === 'bar';
  return {
    backgroundColor: t.colors.glass,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: t.colors.glassEdge,
    shadowColor: t.colors.plum,
    shadowOpacity: bar ? 0.16 : 0.1,
    shadowRadius: bar ? 24 : 18,
    shadowOffset: { width: 0, height: bar ? 10 : 6 },
    elevation: bar ? 8 : 3,
  };
}
