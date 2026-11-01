import { createContext, useContext, type ReactNode } from 'react';
import { useSkinKeyTheme, type SkinKeyTheme } from '@skinkey/design';

const ThemeContext = createContext<SkinKeyTheme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSkinKeyTheme();
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): SkinKeyTheme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used inside ThemeProvider');
  return theme;
}
