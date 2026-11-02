import type { ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Legacy name kept so callers compile. Silver & graphite (tokens 2.3) has no glass: a card is the flat surface tone
 * (#F8F8FA) one step up from the page, no border and no shadow. Only the floating tab bar ('bar') lifts, with one
 * soft neutral graphite shadow, because it truly floats over scrolling content.
 */
export function useGlass(radius: number, lift: 'card' | 'bar' = 'card'): ViewStyle {
  const t = useTheme();
  if (lift === 'card') return { backgroundColor: t.colors.surface, borderRadius: radius };
  return {
    backgroundColor: t.colors.surface,
    borderRadius: radius,
    shadowColor: t.colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  };
}
