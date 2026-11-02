import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { useKey } from '@/features/key';
import { Caption, Heading, IconButton, PillButton, Txt } from '@/components';
import { KeyChip } from './KeyChip';
import { PasteLinkField, type PasteInputRef } from './PasteLinkField';
import { ShareTipCard } from './ShareTipCard';
import { dismissShareTip, shareTipDismissed } from './tipStore';

/** Greeting by the phone's local time. No name field: we never ask for one. */
export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Home = Check tab (DESIGN.md §9.2, showcase 02_home): the greeting row with the Settings gear, one muted line, the
 * compact skin-type card, then "Check a product" (paste field), "Share from a store app" (store switch + three
 * thumb-tile steps), the sample share and the footer captions. No brand bar and no hero band: the page is the mist.
 */
export default function HomeScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { key, isDemo, loading, useDemo } = useKey();
  const [tip, setTip] = useState(false);
  // Status-bar scrim: Home scrolls edge to edge under a transparent status bar, so once the greeting has moved up a
  // bg strip covers the clock area and no heading slides under the status icons.
  const [scrolled, setScrolled] = useState(false);
  const paste = useRef<PasteInputRef>(null);
  const gutter = t.spacing.gutter;
  // The gear's 48dp target overhangs its 24dp glyph; pull it right so the glyph sits on the gutter.
  const gearPull = (t.touch.min - t.icon.lg) / 2;

  useEffect(() => {
    shareTipDismissed().then((d) => setTip(!d));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: t.colors.bg }}
        contentContainerStyle={{ paddingTop: insets.top + t.space[2], paddingHorizontal: gutter, paddingBottom: t.spacing.section }}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={32}
        onScroll={(e) => {
          const past = e.nativeEvent.contentOffset.y > t.space[2];
          if (past !== scrolled) setScrolled(past);
        }}
      >
        <View testID="home-hero">
          <View style={{ minHeight: t.touch.min, flexDirection: 'row', alignItems: 'center', gap: t.space[3] }}>
            <Heading level="display" style={{ flex: 1 }}>
              {greeting()}
            </Heading>
            <IconButton icon="gear" accessibilityLabel="Settings" onPress={() => router.push('/settings')} testID="home-settings" style={{ marginRight: -gearPull }} />
          </View>
          <Txt variant="body" tone="muted">
            {COPY.welcome.tagline}
          </Txt>
          <View style={{ marginTop: t.space[5] }}>
            {loading ? (
              <View style={{ minHeight: t.components.readingCard.minHeight }} />
            ) : (
              <KeyChip
                keyProfile={key}
                isDemo={isDemo}
                onPress={() => (key ? router.navigate('/reading') : router.push('/scan'))}
                onUseDemo={useDemo}
              />
            )}
          </View>
        </View>

        <View style={{ marginTop: t.spacing.section, gap: t.spacing.section }}>
          <View style={{ gap: t.space[3] }}>
            <Heading level="section">Check a product</Heading>
            <PasteLinkField ref={paste} hideLabel emphasis={key || loading ? 'primary' : 'secondary'} onSubmit={(q) => router.push({ pathname: '/check', params: { q } })} />
          </View>

          {tip ? (
            <ShareTipCard
              onDismiss={() => {
                setTip(false);
                void dismissShareTip();
              }}
            />
          ) : null}

          <View style={{ gap: t.space[2] }}>
            <PillButton
              label="Try a sample share"
              variant="secondary"
              leadingIcon="arrow-down-left"
              testID="sample-share"
              onPress={() => router.push({ pathname: '/check', params: { sample: '1' } })}
              accessibilityHint={`Checks a labelled sample listing. Uses the ${COPY.reading.demo} if you haven't scanned.`}
            />
            <Caption style={{ textAlign: 'center' }}>
              A labelled sample listing{key && !isDemo ? '' : `, checked against the ${COPY.reading.demo}`}. No store app needed.
            </Caption>
          </View>

          <View style={{ gap: t.space[1] }}>
            <Caption>{COPY.footer}</Caption>
            <Caption>{COPY.notAffiliated}</Caption>
          </View>
        </View>
      </ScrollView>
      {scrolled && insets.top > 0 ? (
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: insets.top,
            backgroundColor: t.colors.bg,
            borderBottomWidth: 1,
            borderBottomColor: t.dark ? t.colors.sheenEdge : t.colors.border,
          }}
        />
      ) : null}
    </View>
  );
}
