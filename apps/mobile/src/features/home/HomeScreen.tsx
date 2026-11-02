import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { useKey } from '@/features/key';
import { Caption, Icon, IconButton } from '@/components';
import { useGlass } from '@/components/glass';
import { PageBackdrop } from '@/components/Screen';
import { useTabScrollTail } from '@/components/TabBar';
import { KeyChip } from './KeyChip';
import { PasteLinkField, type PasteInputRef } from './PasteLinkField';
import { Picks } from './Picks';
import { ShareTipCard } from './ShareTipCard';
import { dismissShareTip, shareTipDismissed } from './tipStore';
import { usePicks } from './usePicks';

/** The Silver Mirror swash S (the welcome's mark), small in the round glass avatar at the top left. */
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
 * Quiet secondary pill for "Try a sample share": glass, white hairline, 40dp visual in a 48dp target, 14/20 medium
 * label and a muted 18dp icon, centred at its own width. Same label, testID and hint as before (QA taps by label).
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
            minHeight: 40,
            paddingHorizontal: t.space[4],
            borderRadius: t.radius.full,
            borderWidth: 1,
            borderColor: t.colors.glassEdge,
            backgroundColor: pressed ? t.colors.secondaryBgPressed : t.colors.secondaryTranslucent,
            flexDirection: 'row',
            alignItems: 'center',
            gap: t.space[2],
          }}
        >
          <Icon name="arrow-down-left" size={18} color={t.colors.textMuted} />
          <Text {...t.textProps.labelSmRegular} style={{ fontFamily: t.typography.labelSmRegular.fontFamily, fontSize: 14, lineHeight: 20, color: t.colors.text }}>
            Try a sample share
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/**
 * "Check a product" row (dashboard reference "Daily Routine  2 Steps >"): a glass row card with a pastel tile, the
 * title in the serif, the muted hint and a chevron. Tapping it opens the paste field under it and focuses it; tapping
 * again closes it. The field keeps its own testIDs and the Check pill.
 */
function CheckRow({ open, onPress }: { open: boolean; onPress: () => void }) {
  const t = useTheme();
  const glass = useGlass(22);
  return (
    <Pressable
      testID="home-check-row"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Check a product"
      accessibilityHint={open ? 'Hides the product field' : 'Shows a field for a product link or name'}
      accessibilityState={{ expanded: open }}
      android_ripple={{ color: t.colors.state.ripple }}
      style={({ pressed }) => [glass, { minHeight: 72, paddingVertical: t.space[3], paddingLeft: t.space[3], paddingRight: t.space[4], overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: t.space[3], transform: [{ scale: pressed ? 0.99 : 1 }] }]}
    >
      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: t.colors.tilePink, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="tag-check" size={t.icon.md} color={t.colors.plum} />
      </View>
      <Text {...t.textProps.headline} numberOfLines={1} style={{ flexShrink: 0, fontFamily: t.fonts.serifDisplay, fontSize: 18, lineHeight: 24, color: t.colors.text }}>
        Check a product
      </Text>
      <Text {...t.textProps.bodySm} numberOfLines={1} style={[t.typography.bodySm, { flex: 1, textAlign: 'right', color: t.colors.textMuted }]}>
        {open ? '' : 'Link or name'}
      </Text>
      <Icon name={open ? 'chevron-down' : 'chevron-right'} size={t.icon.md} color={t.colors.textMuted} />
    </Pressable>
  );
}

/**
 * Home = Check tab, laid out like the dashboard reference (design/reference/dashboard-reference.png, middle phone) in
 * the colors reference palette: the swash S in a round glass avatar with the Settings gear opposite, the serif greeting
 * over one muted line, the reading card (skin type word + decorative ring, no number), the "Check a product" row that
 * opens the paste field, "Picks for you" (catalogue products that FIT the reading), then the share-from-a-store-app
 * steps, the sample share and the footer captions, quieter. The page gradient sits behind; the floating tab bar
 * floats over the bottom, so the scroll leaves its height free.
 */
export default function HomeScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // The floating bar, its page fade and 36dp more: the footer captions rest fully above the fade.
  const tail = useTabScrollTail();
  const { key, isDemo, loading, useDemo } = useKey();
  const picks = usePicks(key);
  const [tip, setTip] = useState(false);
  const [checkOpen, setCheckOpen] = useState(false);
  // Status-bar scrim: Home scrolls edge to edge under a transparent status bar, so once the greeting has moved up a
  // page-top strip covers the clock area and no heading slides under the status icons.
  const [scrolled, setScrolled] = useState(false);
  const paste = useRef<PasteInputRef>(null);
  const gutter = t.spacing.gutter;
  // The gear's 48dp target overhangs its 24dp glyph; pull it right so the glyph sits on the gutter.
  const gearPull = (t.touch.min - t.icon.lg) / 2;

  useEffect(() => {
    shareTipDismissed().then((d) => setTip(!d));
  }, []);

  useEffect(() => {
    if (checkOpen) requestAnimationFrame(() => paste.current?.focus());
  }, [checkOpen]);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <PageBackdrop />
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
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: t.colors.glass,
                borderWidth: 1,
                borderColor: t.colors.glassEdge,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: t.colors.plum,
                shadowOpacity: 0.12,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 2,
              }}
            >
              <Image source={SWASH_S} resizeMode="contain" style={{ width: 20, height: 29 }} />
            </View>
            <IconButton icon="gear" accessibilityLabel="Settings" onPress={() => router.push('/settings')} testID="home-settings" style={{ marginRight: -gearPull }} />
          </View>

          <View style={{ marginTop: t.space[5], gap: t.space[1] }}>
            <Text
              accessibilityRole="header"
              {...t.textProps.display}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={{ fontFamily: t.fonts.serifDisplay, fontSize: 36, lineHeight: 44, letterSpacing: -0.4, color: t.colors.text }}
            >
              {greeting()}
            </Text>
            <Text {...t.textProps.bodySm} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={[t.typography.bodySm, { fontSize: 14, lineHeight: 20, color: t.colors.textMuted }]}>
              {HOME_LINE}
            </Text>
          </View>

          <View style={{ marginTop: t.space[5] }}>
            {loading ? (
              <View style={{ minHeight: 148 }} />
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

        <View style={{ marginTop: t.space[4], gap: t.space[3] }}>
          <CheckRow open={checkOpen} onPress={() => setCheckOpen((o) => !o)} />
          {checkOpen ? <PasteLinkField ref={paste} hideLabel emphasis="primary" onSubmit={(q) => router.push({ pathname: '/check', params: { q } })} /> : null}
        </View>

        {picks.length ? (
          <View style={{ marginTop: t.space[8] }}>
            <Picks picks={picks} onOpen={(q) => router.push({ pathname: '/check', params: { q } })} />
          </View>
        ) : null}

        <View style={{ marginTop: t.space[8], gap: t.space[8] }}>
          {tip ? (
            <ShareTipCard
              onDismiss={() => {
                setTip(false);
                void dismissShareTip();
              }}
            />
          ) : null}

          <View style={{ gap: t.space[1] }}>
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
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: insets.top,
            backgroundColor: t.colors.pageTop,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: t.colors.border,
          }}
        />
      ) : null}
    </View>
  );
}
