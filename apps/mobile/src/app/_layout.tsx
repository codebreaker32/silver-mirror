import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ShareIntentProvider } from 'expo-share-intent';
import { useEffect } from 'react';
import { fontAssets } from '@skinkey/design';
import { ShareRouter } from '@/features/share';
import { ThemeProvider } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts(fontAssets);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ShareIntentProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="check" options={{ presentation: 'modal' }} />
          <Stack.Screen name="scan" />
          <Stack.Screen name="tryon" options={{ presentation: 'modal' }} />
          <Stack.Screen name="key" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="how" />
        </Stack>
        <ShareRouter />
      </ThemeProvider>
    </ShareIntentProvider>
  );
}
