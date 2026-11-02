import { useState } from 'react';
import { useRouter } from 'expo-router';
import { COPY } from '@skinkey/contracts';
import { Body, Button, EmptyState, Heading, Screen, useInTabScene } from '@/components';
import { useTheme } from '@/theme/ThemeProvider';
import { useKey } from './index';
import { KeyPanel } from './KeyPanel';
import type { ConfirmKind } from './ConfirmSheet';

const REMOVED: Record<ConfirmKind, string> = {
  delete: 'Your readings were deleted from this phone.',
  withdraw: 'Consent withdrawn. Your readings were deleted from this phone. If a YouCam deletion failed, YouCam removes files automatically within 30 days.',
};

/** Your reading (Reading tab and the pushed /key detail). In the tab there is no app bar: the tab bar is the way back. */
export function KeyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const inTab = useInTabScene();
  const { key, isDemo, loading, useDemo } = useKey();
  const [removed, setRemoved] = useState<ConfirmKind | null>(null);

  if (loading) return <Screen appBar={!inTab}>{null}</Screen>;

  if (!key) {
    return (
      <Screen appBar={!inTab}>
        <EmptyState
          testID="reading-empty"
          plate="face"
          title={COPY.reading.none}
          body={removed ? REMOVED[removed] : 'Scan once, about a minute. You can still check products by name without one.'}
        >
          <Button label="Start scan" onPress={() => router.push('/scan')} />
          <Button label={COPY.reading.useDemo} variant="secondary" onPress={useDemo} />
        </EmptyState>
      </Screen>
    );
  }

  return (
    <Screen appBar={!inTab}>
      <Heading style={{ paddingTop: inTab ? theme.space[4] : 0 }}>{COPY.reading.yours}</Heading>
      <KeyPanel keyProfile={key} isDemo={isDemo} onRemoved={setRemoved} />
      <Button label="How this was made" variant="tertiary" trailingIcon="chevron-right" onPress={() => router.push('/how')} />
      <Body muted small>
        {COPY.footer}
      </Body>
    </Screen>
  );
}
