import { Tabs } from 'expo-router';
import { TabBar } from '@/components/TabBar';
import { useReduceMotion } from '@/components/useReduceMotion';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Home · Shop · Scan · Reading · You (experience reference). Scan is a tab-bar button that opens the scan flow above
 * the tabs (see TAB_ITEMS). Scenes crossfade fast on a switch (instant with reduced motion) and keep their state. The
 * docked bar sits over the bottom of the scenes (TabBar.tsx); pushed details (/check, /tryon, /scan, /settings, /how)
 * cover it.
 */
export default function TabsLayout() {
  const t = useTheme();
  const reduced = useReduceMotion();
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: t.colors.bg }, animation: reduced ? 'none' : 'fade' }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop' }} />
      <Tabs.Screen name="reading" options={{ title: 'Reading' }} />
      <Tabs.Screen name="you" options={{ title: 'You' }} />
    </Tabs>
  );
}
