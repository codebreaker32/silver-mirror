import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { demo } from '@/demo';
import HomeScreen from '@/features/home/HomeScreen';
import { welcomeSeen, welcomeSeenThisRun } from '@/features/home/welcomeStore';
import { useKey } from '@/features/key';
import { TabScene } from '@/components/Screen';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Check tab. First-run gate (DESIGN.md §9.1): once the reading and the welcome flag have both loaded, a phone with no
 * reading that has never passed the welcome goes to /welcome. Never redirects while loading, and never on a web
 * `?demo=` screenshot. It only runs while this tab is focused, so a cold share still lands on /check (ShareRouter
 * pushes over Home). The synchronous flag guards against a stale `seen` if this screen outlived the welcome.
 */
export default function CheckTab() {
  const t = useTheme();
  const router = useRouter();
  const { key, loading } = useKey();
  const [seen, setSeen] = useState<boolean | null>(demo ? true : null);
  const showWelcome = !loading && seen === false && !key && !welcomeSeenThisRun();

  useEffect(() => {
    if (demo) return;
    let live = true;
    welcomeSeen().then((s) => live && setSeen(s));
    return () => {
      live = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (showWelcome) router.replace('/welcome');
    }, [showWelcome, router]),
  );

  // The flag is one SecureStore read: hold the page colour for that moment rather than flash Home before the welcome.
  if (seen === null || showWelcome) return <View style={{ flex: 1, backgroundColor: t.colors.bg }} />;
  return (
    <TabScene>
      <HomeScreen />
    </TabScene>
  );
}
