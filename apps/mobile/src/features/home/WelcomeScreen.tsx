import { useCallback, useEffect } from 'react';
import { BackHandler, Image, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { useKey } from '@/features/key';
import { PillButton, Txt, Wordmark } from '@/components';
import { markWelcomeSeen } from './welcomeStore';

// Liquid-silver backdrop and the swash S, both taken from Aman's showcase (design/reference/showcase/01_welcome.png):
// the backdrop with the text and buttons removed, the S redrawn at full resolution (silver-s.png, 360x520).
const BACKDROP = require('../../../assets/images/welcome-backdrop.jpg');
const SWASH_S = require('../../../assets/images/silver-s.png');

/**
 * First-run welcome (DESIGN.md §9.1, showcase 01_welcome): the liquid-silver backdrop, the swash S, the serif
 * wordmark and the brand line in one centred block, then slate "Get started" and a translucent "Use the Demo reading"
 * at the bottom. No carousel, no account step. Both actions land on Home; Android back counts as Get started.
 */
export default function WelcomeScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Renamed: it is a plain action, not a hook.
  const { useDemo: enableDemo } = useKey();
  const b = t.components.brand;

  const start = useCallback(() => {
    void markWelcomeSeen();
    router.replace('/');
  }, [router]);

  const demo = useCallback(() => {
    enableDemo();
    void markWelcomeSeen();
    router.replace('/');
  }, [router, enableDemo]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      start();
      return true;
    });
    return () => sub.remove();
  }, [start]);

  return (
    <View testID="welcome" style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <Image source={BACKDROP} resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} />
      {/* Palette 2.2: a pink-lavender wash warms the cool silver photo; the Demo pill is blush glass (secondary-translucent). */}
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.colors.welcomeWash }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: t.space[8], paddingTop: insets.top + t.space[6], paddingBottom: t.space[12] }}>
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Image source={SWASH_S} resizeMode="contain" style={{ width: 72, height: 104 }} />
        </View>
        <View style={{ marginTop: t.space[6] }}>
          <Wordmark capHeight={b.wordmarkHero} header />
        </View>
        <Txt variant="body" textBreakStrategy="balanced" style={{ marginTop: t.space[3], lineHeight: 22, textAlign: 'center', maxWidth: 320 }}>
          {COPY.welcome.tagline}
        </Txt>
      </View>
      <View style={{ paddingHorizontal: t.space[6], paddingBottom: insets.bottom + t.space[6], gap: t.space[3] }}>
        <PillButton label={COPY.welcome.start} trailingIcon="arrow-right" onPress={start} testID="welcome-start" />
        <PillButton label={COPY.reading.useDemo} variant="translucent" onPress={demo} testID="welcome-demo" />
      </View>
    </View>
  );
}
