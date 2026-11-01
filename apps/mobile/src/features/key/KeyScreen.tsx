import { useState } from 'react';
import { useRouter } from 'expo-router';
import { COPY } from '@skinkey/contracts';
import { Body, Button, Screen, StateView } from '../scan/ui';
import { useKey } from './index';
import { KeyPanel } from './KeyPanel';
import type { ConfirmKind } from './ConfirmSheet';

const REMOVED: Record<ConfirmKind, string> = {
  delete: 'Your readings were deleted from this phone.',
  withdraw: 'Consent withdrawn. Your readings were deleted from this phone. If a YouCam deletion failed, YouCam removes files automatically within 30 days.',
};

export function KeyScreen() {
  const router = useRouter();
  const { key, isDemo, loading, useDemo } = useKey();
  const [removed, setRemoved] = useState<ConfirmKind | null>(null);

  if (loading) return <Screen title="Your Key">{null}</Screen>;

  if (!key) {
    return (
      <Screen title="Your Key">
        <StateView title="No Key yet" body={removed ? REMOVED[removed] : 'You can still check products by name. Scan for reasons based on your readings.'}>
          <Button label="Start scan" onPress={() => router.push('/scan')} />
          <Button label="Use the Demo Key" variant="secondary" onPress={useDemo} />
        </StateView>
      </Screen>
    );
  }

  return (
    <Screen title="Your Key">
      <KeyPanel keyProfile={key} isDemo={isDemo} onRemoved={setRemoved} />
      <Button label="How this was made" variant="tertiary" onPress={() => router.push('/how')} />
      <Body muted small>
        {COPY.footer}
      </Body>
    </Screen>
  );
}
