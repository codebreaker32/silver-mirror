import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { useKey } from '@/features/key';
import { Caption, Icon, IconButton } from '@/components';
import { HomeHeading } from '@/components/home/HomeHeading';
import { homeType } from '@/components/home/homeType';
import { useTabScrollTail } from '@/components/TabBar';
import { KeyChip } from './KeyChip';
import { PasteLinkField } from './PasteLinkField';
import { Picks } from './Picks';
import { ShareTipCard } from './ShareTipCard';
import { dismissShareTip, shareTipDismissed } from './tipStore';
import { usePicks } from './usePicks';

/** The Silver Mirror swash S (the welcome's mark), small in a plain well-tone circle at the top left. */
const SWASH_S = require('../../../assets/images/silver-s.png');

/** Greeting by the phone's local time. No name field: we never ask for one. */
export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** One short muted line under the greeting (dashboard reference "Let's take care of your skin"): fits one line. */
export const HOME_LINE = 'Check a product before you buy it.';

/**
 * Quiet secondary action for "Try a sample share": a flat well-tone pill, one fill, no line, 44dp visual in a 48dp
 * target, centred at its own width. Same label, testID and hint as before (QA taps by label).
 */
function SamplePill({ onPress, hint }: { onPress: () => void; hint: string }) {
  const t = useTheme();
  return (
    <Pressable
      testID="sample-share"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Try a sample share"
      accessibilityHint={hint}
      style={{ alignSelf: 'center', minHeight: t.touch.min, justifyContent: 'center' }}
    >
      {({ pressed }) => (
        <View
          style={{
            minHeight: 44,
            paddingHorizontal: t.space[5],
            borderRadius: t.radius.full,
            backgroundColor: pressed ? t.colors.secondaryBgPressed : t.colors.secondaryBg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: t.space[2],
          }}
        >
          <Icon name="arrow-down-left" size={18} color={t.colors.text} />
          <Text style={[homeType.bodyStrong, { color: t.colors.text }]}>Try a sample share</Text>
        </View>
      )}
    </Pressable>
  );
}

/**
 * Home = Check tab (Silver & graphite), keeping the dashboard reference's order (design/reference/dashboard-reference.png,
 * middle phone): the swash S and the Settings gear, the serif greeting over one muted line, the reading surface (skin
 * type word and three band rows, no figures), "Check a product" with the paste field inline, "Picks for you", then the
 * share-from-a-store-app steps, the sample share and the footer captions, quieter. The page is one flat tone;
 * surfaces sit one tone step up, wells one step down; no lines, no shadows. The docked tab bar sits over the bottom,
 * so the scroll leaves its height free.
 */
export default function HomeScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tail = useTabScrollTail();
  const { key, isDemo, loading, useDemo } = useKey();
  const picks = usePicks(key);
  const [tip, setTip] = useState(false);
  // Status-bar scrim: Home scrolls edge to edge under a transparent status bar, so once the greeting has moved up a
  // page-tone strip covers the clock area and no heading slides under the status icons.
  const [scrolled, setScrolled] = useState(false);
  const gutter = t.spacing.gutter;
  // The gear's 48dp target overhangs its 24dp glyph; pull it right so the glyph sits on the gutter.
  const gearPull = (t.touch.min - t.icon.lg) / 2;
  // 32dp between sections: generous, but tight enough that the first row of Picks ends above the bar at 390x844.
  const section = t.space[8];

  useEffect(() => {
    shareTipDismissed().then((d) => setTip(!d));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + t.space[2], paddingHorizontal: gutter, paddingBottom: tail }}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={32}
        onScroll={(e) => {
          const past = e.nativeEvent.contentOffset.y > t.space[2];
          if (past !== scrolled) setScrolled(past);
        }}
      >
        <View testID="home-hero">
          <View style={{ minHeight: t.touch.min, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.colors.bgSunken, alignItems: 'center', justifyContent: 'center' }}
            >
              <Image source={SWASH_S} resizeMode="contain" style={{ width: 20, height: 29 }} />
            </View>
            <IconButton icon="gear" accessibilityLabel="Settings" onPress={() => router.push('/settings')} testID="home-settings" style={{ marginRight: -gearPull }} />
          </View>

          <View style={{ marginTop: t.space[4], gap: t.space[1] }}>
            <Text
              accessibilityRole="header"
              {...t.textProps.display}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={[homeType.greeting, { color: t.colors.text }]}
            >
              {greeting()}
            </Text>
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={[homeType.body, { color: t.colors.textMuted }]}>
              {HOME_LINE}
            </Text>
          </View>

          <View style={{ marginTop: t.space[5] }}>
            {loading ? (
              <View style={{ minHeight: 200 }} />
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

        <View testID="home-check" style={{ marginTop: section, gap: t.space[3] }}>
          <HomeHeading title="Check a product" />
          <PasteLinkField hideLabel emphasis={key ? 'primary' : 'secondary'} onSubmit={(q) => router.push({ pathname: '/check', params: { q } })} />
        </View>

        {picks.length ? (
          <View style={{ marginTop: section }}>
            <Picks picks={picks} onOpen={(q) => router.push({ pathname: '/check', params: { q } })} />
          </View>
        ) : null}

        <View style={{ marginTop: section, gap: section }}>
          {tip ? (
            <ShareTipCard
              onDismiss={() => {
                setTip(false);
                void dismissShareTip();
              }}
            />
          ) : null}

          <View style={{ gap: t.space[2] }}>
            <SamplePill
              onPress={() => router.push({ pathname: '/check', params: { sample: '1' } })}
              hint={`Checks a labelled sample listing. Uses the ${COPY.reading.demo} if you haven't scanned.`}
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
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, backgroundColor: t.colors.bg }}
        />
      ) : null}
    </View>
  );
}
