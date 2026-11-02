import { Tabs } from 'expo-router';
import { TabBar } from '@/components/TabBar';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Check · Scan · Reading (DESIGN.md §8.8). Check = Home, Reading = Your reading; Scan is a tab-bar button that opens
 * the scan flow above the tabs (see TAB_ITEMS). The bar floats over the scenes (TabBar.tsx); pushed details
 * (/check, /tryon, /scan, /settings, /how) cover it.
 */
export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: t.colors.pageBottom } }}>
      <Tabs.Screen name="index" options={{ title: 'Check' }} />
      <Tabs.Screen name="reading" options={{ title: 'Reading' }} />
    </Tabs>
  );
}
