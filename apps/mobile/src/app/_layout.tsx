import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ShareIntentProvider } from 'expo-share-intent';
import { useEffect } from 'react';
import { fontAssets } from '@skinkey/design';
import { ToastProvider } from '@/components/Toast';
import { ShareRouter } from '@/features/share';
import { SystemChrome } from '@/theme/SystemChrome';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

// Hold the native splash (chrome S on pearl / graphite) until Geist (every text style) and Noto Serif Display (kept in
// fontAssets; the wordmark itself is outlined paths) are loaded, so no screen ever paints in a fallback face.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootStack() {
  const t = useTheme();
  return (
    <SystemChrome>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="welcome" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="check" options={{ presentation: 'modal' }} />
        <Stack.Screen name="scan" />
        <Stack.Screen name="tryon" options={{ presentation: 'modal' }} />
        <Stack.Screen name="key" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="kit" />
      </Stack>
      <ShareRouter />
    </SystemChrome>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts(fontAssets);
  // A font that fails to load must not strand the user on the splash: fall back to the system face.
  const ready = loaded || Boolean(error);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  return (
    <ShareIntentProvider>
      <ThemeProvider>
        <ToastProvider>
          <RootStack />
        </ToastProvider>
      </ThemeProvider>
    </ShareIntentProvider>
  );
}
