import { createContext, useContext, type ReactNode } from 'react';
import { useSkinKeyTheme, type ColorScheme, type SkinKeyTheme } from '@skinkey/design';

const ThemeContext = createContext<SkinKeyTheme | null>(null);

/**
 * Provides the Silver Mirror theme. The app is light only (the showcase is a daylight lavender-mist design), so the
 * phone's dark setting does not switch it. `scheme` still forces one for tests and the kit gallery.
 */
export function ThemeProvider({ children, scheme }: { children: ReactNode; scheme?: ColorScheme }) {
  const theme = useSkinKeyTheme(scheme ?? 'light');
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): SkinKeyTheme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used inside ThemeProvider');
  return theme;
}
