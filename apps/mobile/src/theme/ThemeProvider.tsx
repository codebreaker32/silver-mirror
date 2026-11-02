import { createContext, useContext, type ReactNode } from 'react';
import { useSkinKeyTheme, type ColorScheme, type SkinKeyTheme } from '@skinkey/design';

const ThemeContext = createContext<SkinKeyTheme | null>(null);

/**
 * Provides the Silver Mirror theme. Follows the phone's light/dark setting (useColorScheme, re-rendering when it
 * changes); both themes are designed (pearl daylight / graphite with a silver sheen). `scheme` forces one for tests
 * and the kit gallery.
 */
export function ThemeProvider({ children, scheme }: { children: ReactNode; scheme?: ColorScheme }) {
  const theme = useSkinKeyTheme(scheme);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): SkinKeyTheme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used inside ThemeProvider');
  return theme;
}
