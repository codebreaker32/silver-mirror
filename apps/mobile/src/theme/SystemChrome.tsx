import { useEffect, useMemo, type ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider, type Theme } from 'expo-router';
import { useTheme } from './ThemeProvider';

/**
 * Everything outside the React tree that must follow the theme:
 * - status bar icons (dark on pearl, light on graphite), drawn edge-to-edge over colors.bg;
 * - the native root view background (expo-system-ui), so there is no white flash behind screens or the
 *   transparent Android navigation bar in dark mode;
 * - the React Navigation theme, so stack cards, tab scenes and modals paint colors.bg, not the stock white.
 */
export function SystemChrome({ children }: { children: ReactNode }) {
  const t = useTheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(t.colors.bg).catch(() => undefined);
  }, [t.colors.bg]);

  const navTheme = useMemo<Theme>(() => {
    const base = t.dark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      dark: t.dark,
      colors: {
        ...base.colors,
        primary: t.colors.accent,
        background: t.colors.bg,
        card: t.colors.surfaceRaised,
        text: t.colors.text,
        border: t.colors.border,
        notification: t.colors.accent,
      },
    };
  }, [t]);

  return (
    <NavigationThemeProvider value={navTheme}>
      <StatusBar style={t.dark ? 'light' : 'dark'} />
      {children}
    </NavigationThemeProvider>
  );
}
