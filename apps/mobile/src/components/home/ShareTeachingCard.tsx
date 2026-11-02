import { useState } from 'react';
import { View } from 'react-native';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Card } from '../Card';
import { Icon } from '../Icon';
import { PillButton } from '../PillButton';
import { Heading, Txt } from '../Text';
import { Segmented } from './Segmented';
import { ShareStrip } from './ShareStrip';

export const SHARE_STORES = ['Flipkart', 'Amazon', 'Nykaa'] as const;
export type ShareStore = (typeof SHARE_STORES)[number];

/** COPY.sharePaths line for one store (spikes/FINDINGS.md S1: Amazon hides Silver Mirror behind More). */
export function sharePathFor(store: ShareStore): string {
  return COPY.sharePaths.find((p) => p.startsWith(`${store}:`)) ?? COPY.shareTo;
}

/** The share sheet lists pinned and recent apps first (BUGS.md #6), so the pin step is part of every teaching card. */
export const PIN_TIP = `Not in the first row? Scroll along, then long-press ${COPY.appName} and choose Pin.`;

interface ShareTeachingCardProps {
  onDismiss: () => void;
  /** Optional second text action, e.g. "Paste a link instead" on Home. */
  secondary?: { label: string; onPress: () => void; testID?: string };
  initialStore?: ShareStore;
  testID?: string;
  dismissTestID?: string;
}

/**
 * Share teaching card (component.shareTeachingCard, DESIGN.md §9.2 item 5): the mini share-sheet strip with the real
 * chrome-S tile, the heading, a Flipkart / Amazon / Nykaa switch showing one path line, the pin tip, then text actions.
 * Used on Home and as the coach mark after a scan.
 */
export function ShareTeachingCard({ onDismiss, secondary, initialStore = 'Flipkart', testID, dismissTestID }: ShareTeachingCardProps) {
  const t = useTheme();
  const [store, setStore] = useState<ShareStore>(initialStore);
  const path = sharePathFor(store);
  return (
    <Card testID={testID} padding={t.components.shareTeachingCard.padding + t.space[1]} gap={t.space[3]}>
      <ShareStrip moreLit={store === 'Amazon'} />
      <Heading level="section">{COPY.coachMark}</Heading>
      <Segmented options={SHARE_STORES} value={store} onChange={setStore} accessibilityLabel="Store app" testID="share-store" />
      <View testID="share-paths" accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[2], minHeight: t.space[6] }}>
        <Icon name="share" size={t.icon.md} color={t.colors.text} />
        <Txt variant="bodyStrong" testID={store === 'Amazon' ? 'amazon-coach-mark' : 'share-path'} style={{ flex: 1 }}>
          {path}
        </Txt>
      </View>
      <View style={{ flexDirection: 'row', gap: t.space[2], alignItems: 'flex-start' }}>
        <View style={{ paddingTop: 2 }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Icon name="info" size={t.icon.sm} color={t.colors.textMuted} />
        </View>
        <Txt variant="bodySm" tone="muted" testID="share-pin-tip" style={{ flex: 1 }}>
          {PIN_TIP}
        </Txt>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: secondary ? 'space-between' : 'flex-end', marginBottom: -t.space[2] }}>
        {secondary ? <PillButton label={secondary.label} variant="tertiary" onPress={secondary.onPress} leadingIcon="paste" testID={secondary.testID} /> : null}
        <PillButton label="Got it" variant="tertiary" onPress={onDismiss} trailingIcon="check" testID={dismissTestID} />
      </View>
    </Card>
  );
}
