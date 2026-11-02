import { useState } from 'react';
import { useRouter } from 'expo-router';
import { COPY } from '@skinkey/contracts';
import { Body, Button, EmptyState, Screen } from '@/components';
import { useKey } from './index';
import { KeyPanel } from './KeyPanel';
import type { ConfirmKind } from './ConfirmSheet';

const REMOVED: Record<ConfirmKind, string> = {
  delete: 'Your readings were deleted from this phone.',
  withdraw: 'Consent withdrawn. Your readings were deleted from this phone. If a YouCam deletion failed, YouCam removes files automatically within 30 days.',
};

/**
 * Your reading (Reading tab and the pushed /key detail, showcase 04_report). Centred app-bar title "Your reading"; in
 * the tab scene the AppBar drops the back arrow (the tab bar is the way back) and keeps the title optically centred.
 */
export function KeyScreen() {
  const router = useRouter();
  const { key, isDemo, loading, useDemo } = useKey();
  const [removed, setRemoved] = useState<ConfirmKind | null>(null);

  if (loading) return <Screen title={COPY.reading.yours}>{null}</Screen>;

  if (!key) {
    return (
      <Screen title={COPY.reading.yours}>
        <EmptyState
          testID="reading-empty"
          plate="face"
          title={COPY.reading.none}
          body={removed ? REMOVED[removed] : 'Scan once, about a minute. You can still check products by name without one.'}
        >
          <Button label="Start scan" trailingIcon="arrow-right" onPress={() => router.push('/scan')} />
          <Button label={COPY.reading.useDemo} variant="secondary" onPress={useDemo} />
        </EmptyState>
      </Screen>
    );
  }

  return (
    <Screen title={COPY.reading.yours}>
      <KeyPanel keyProfile={key} isDemo={isDemo} onRemoved={setRemoved} />
      <Button label="How this was made" variant="tertiary" trailingIcon="chevron-right" onPress={() => router.push('/how')} />
      <Body muted small>
        {COPY.footer}
      </Body>
    </Screen>
  );
}
