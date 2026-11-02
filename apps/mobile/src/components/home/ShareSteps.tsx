import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from '../Icon';
import { Segmented } from '../Segmented';
import { HomeHeading } from './HomeHeading';
import { homeType } from './homeType';

export const SHARE_STORES = ['Flipkart', 'Amazon', 'Nykaa'] as const;
export type ShareStore = (typeof SHARE_STORES)[number];

/** COPY.sharePaths line for one store (spikes/FINDINGS.md S1: Amazon hides Silver Mirror behind More). */
export function sharePathFor(store: ShareStore): string {
  return COPY.sharePaths.find((p) => p.startsWith(`${store}:`)) ?? COPY.shareTo;
}

/** The swash S (what they will look for in the share sheet). */
const SWASH_S = require('../../../assets/images/silver-s.png');

interface ShareStepsProps {
  /** "Got it": hides the section for good (Home keeps the flag in tipStore). */
  onDismiss: () => void;
  initialStore?: ShareStore;
  testID?: string;
  dismissTestID?: string;
}

/**
 * Home "Share from a store app" (Silver & graphite): a plain heading with the "Got it" text action, the Flipkart /
 * Amazon / Nykaa segmented control, then the three COPY.shareSteps(store) rows set straight on the page, tight inside
 * the group: a 24dp glyph column (share, the swash S, the FITS seal), the step in ink and its how in muted. No box, no
 * dividers, no numerals: order is the position. TalkBack reads the group as the store's one-line path
 * (COPY.sharePaths), announced politely when the store changes.
 */
export function ShareSteps({ onDismiss, initialStore = 'Flipkart', testID, dismissTestID }: ShareStepsProps) {
  const t = useTheme();
  const [store, setStore] = useState<ShareStore>(initialStore);
  const steps = COPY.shareSteps(store);
  const path = sharePathFor(store);
  const glyph = (i: number) =>
    i === 1 ? (
      <Image source={SWASH_S} resizeMode="contain" style={{ width: 16, height: 23 }} />
    ) : (
      <Icon name={i === 0 ? 'share' : 'seal-check'} size={t.icon.md} color={t.colors.text} />
    );
  return (
    <View testID={testID} style={{ gap: t.space[4] }}>
      <HomeHeading title="Share from a store app" action={{ label: 'Got it', onPress: onDismiss, testID: dismissTestID }} />
      <Segmented options={SHARE_STORES} value={store} onChange={setStore} accessibilityLabel="Store app" testID="share-store" />
      <View
        testID="share-paths"
        accessible
        accessibilityLabel={`${path}. ${steps.map((s) => `${s.title}: ${s.supporting}`).join('. ')}`}
        accessibilityLiveRegion="polite"
        style={{ gap: t.space[4], paddingTop: t.space[1] }}
      >
        {steps.map((s, i) => (
          <View
            key={s.title}
            testID={i === 1 ? (store === 'Amazon' ? 'amazon-coach-mark' : 'share-path') : undefined}
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: t.space[3] }}
          >
            <View style={{ width: 24, height: 22, alignItems: 'center', justifyContent: 'center' }}>{glyph(i)}</View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[homeType.bodyStrong, { lineHeight: 22, color: t.colors.text }]}>{s.title}</Text>
              <Text style={[homeType.body, { color: t.colors.textMuted }]}>{s.supporting}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
