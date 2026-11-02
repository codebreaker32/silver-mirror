import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { useKey } from '@/features/key';
import { BrandLockup, Caption, Heading, IconButton, PillButton, SheenBackdrop, Txt } from '@/components';
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
 * Home = Check tab (DESIGN.md §9.2): brand bar with the Settings gear, greeting, the reading card on the sheen hero
 * band, then "Check a product" (paste field), the compact share tip, the sample share and the footer captions.
 */
export default function HomeScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { key, isDemo, loading, useDemo } = useKey();
  const [tip, setTip] = useState(false);
  const paste = useRef<PasteInputRef>(null);
  const gutter = t.spacing.gutter;
  // The gear's 48dp target overhangs its 24dp glyph; pull it right so the glyph sits on the gutter.
  const gearPull = (t.touch.min - t.icon.lg) / 2;

  useEffect(() => {
    shareTipDismissed().then((d) => setTip(!d));
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.colors.bg }} contentContainerStyle={{ paddingBottom: t.spacing.section }} keyboardShouldPersistTaps="handled">
      <View testID="home-hero" style={{ paddingTop: insets.top + t.space[2], paddingHorizontal: gutter, paddingBottom: t.space[6], gap: t.space[4] }}>
        <SheenBackdrop style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: t.radius.xl, borderBottomRightRadius: t.radius.xl }} />
        <View style={{ minHeight: t.components.appBar.minHeight, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <BrandLockup variant="header" />
          <IconButton icon="gear" accessibilityLabel="Settings" onPress={() => router.push('/settings')} testID="home-settings" style={{ marginRight: -gearPull }} />
        </View>
        <View style={{ gap: t.space[1] }}>
          <Heading level="display">{greeting()}</Heading>
          <Txt variant="body" tone="muted">
            Check a product against your skin reading before you buy.
          </Txt>
        </View>
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

      <View style={{ paddingHorizontal: gutter, paddingTop: t.space[6], gap: t.spacing.section }}>
        <View style={{ gap: t.space[3] }}>
          <Heading level="section">Check a product</Heading>
          <PasteLinkField ref={paste} emphasis={key || loading ? 'primary' : 'secondary'} onSubmit={(q) => router.push({ pathname: '/check', params: { q } })} />
        </View>

        {tip ? (
          <ShareTipCard
            onDismiss={() => {
              setTip(false);
              void dismissShareTip();
            }}
            onPaste={() => paste.current?.focus()}
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
  );
}
