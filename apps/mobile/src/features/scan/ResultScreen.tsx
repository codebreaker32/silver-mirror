import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { COPY } from '@skinkey/contracts';
import { coachSeen, markCoachSeen, useKey } from '../key';
import { KeyPanel } from '../key/KeyPanel';
import { ShareCoachMark } from '../key/ShareCoachMark';
import { OverlayToGlyph } from './OverlayToGlyph';
import { scanSession } from './session';
import { Body, Button, Heading, Screen, StateView } from './ui';

export function ResultScreen() {
  const router = useRouter();
  const { key, isDemo, loading } = useKey();
  const [overlay, setOverlay] = useState(() => scanSession.peekOverlay());
  const [showCoach, setShowCoach] = useState(false);
  const dropOverlay = useCallback(() => setOverlay(null), []);

  useEffect(() => {
    scanSession.takeOverlay();
    void coachSeen().then((seen) => setShowCoach(!seen));
  }, []);

  if (loading) return <Screen title="Your Key">{null}</Screen>;
  if (!key) {
    return (
      <Screen title="Your Key" onBack={() => router.replace('/')}>
        <StateView title="No Key yet" body="Your readings were deleted from this phone.">
          <Button label="Back to home" onPress={() => router.replace('/')} />
        </StateView>
      </Screen>
    );
  }

  return (
    <Screen title="Your Key" onBack={() => router.replace('/')} footer={<Button label="Done" onPress={() => router.replace('/')} />}>
      <Heading>Your Key is ready</Heading>
      <OverlayToGlyph keyProfile={key} overlayBase64={overlay} onDropped={dropOverlay} />
      <KeyPanel keyProfile={key} isDemo={isDemo} showGlyph={false} onRemoved={() => router.replace('/')} />
      {showCoach ? (
        <ShareCoachMark
          onDismiss={() => {
            setShowCoach(false);
            void markCoachSeen();
          }}
        />
      ) : null}
      <Button label="How this was made" variant="tertiary" onPress={() => router.push('/how')} />
      <Body muted small>
        {COPY.footer}
      </Body>
    </Screen>
  );
}
