import { useState } from 'react';
import { View } from 'react-native';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { ListGroup, ListRow, type ListRowThumb } from '../ListRow';
import { SectionHeader } from '../SectionHeader';
import { Segmented } from '../Segmented';

export const SHARE_STORES = ['Flipkart', 'Amazon', 'Nykaa'] as const;
export type ShareStore = (typeof SHARE_STORES)[number];

/** COPY.sharePaths line for one store (spikes/FINDINGS.md S1: Amazon hides Silver Mirror behind More). */
export function sharePathFor(store: ShareStore): string {
  return COPY.sharePaths.find((p) => p.startsWith(`${store}:`)) ?? COPY.shareTo;
}

/** Thumb tiles for the three steps: the share glyph, the real chrome S (what they will look for), the FITS seal. */
const STEP_THUMBS: readonly ListRowThumb[] = [{ icon: 'share' }, { mark: true }, { icon: 'seal-check' }];

interface ShareStepsProps {
  /** "Got it": hides the section for good (Home keeps the flag in tipStore). */
  onDismiss: () => void;
  initialStore?: ShareStore;
  testID?: string;
  dismissTestID?: string;
}

/**
 * Home "Share from a store app" (DESIGN.md §9.2 item 5, showcase 02_home routine list): a section head with a
 * tertiary "Got it", a Flipkart / Amazon / Nykaa segmented control, then one white card of three thumb-tile rows from
 * COPY.shareSteps(store). No step numerals: order is the position. TalkBack reads the card as the store's one-line
 * path (COPY.sharePaths), announced politely when the store changes.
 */
export function ShareSteps({ onDismiss, initialStore = 'Flipkart', testID, dismissTestID }: ShareStepsProps) {
  const t = useTheme();
  const [store, setStore] = useState<ShareStore>(initialStore);
  const steps = COPY.shareSteps(store);
  const path = sharePathFor(store);
  return (
    <View testID={testID} style={{ gap: t.space[3] }}>
      <SectionHeader title="Share from a store app" action={{ label: 'Got it', onPress: onDismiss, chevron: false, testID: dismissTestID }} />
      <Segmented options={SHARE_STORES} value={store} onChange={setStore} accessibilityLabel="Store app" testID="share-store" />
      <View
        testID="share-paths"
        accessible
        accessibilityLabel={`${path}. ${steps.map((s) => `${s.title}: ${s.supporting}`).join('. ')}`}
        accessibilityLiveRegion="polite"
        style={{ marginTop: t.space[1] }}
      >
        <ListGroup thumbs>
          {steps.map((s, i) => (
            <ListRow
              key={s.title}
              thumb={STEP_THUMBS[i]}
              title={s.title}
              supporting={s.supporting}
              trailing="none"
              testID={i === 1 ? (store === 'Amazon' ? 'amazon-coach-mark' : 'share-path') : undefined}
            />
          ))}
        </ListGroup>
      </View>
    </View>
  );
}
