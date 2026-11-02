import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { COPY } from '@skinkey/contracts';
import { Body, Button, EmptyState, Heading, Screen } from '@/components';
import { coachSeen, markCoachSeen, useKey } from '../key';
import { KeyPanel } from '../key/KeyPanel';
import { ShareCoachMark } from '../key/ShareCoachMark';
import { OverlayToGlyph } from './OverlayToGlyph';
import { scanSession } from './session';

export function ResultScreen() {
  const router = useRouter();
  const { key, isDemo, loading } = useKey();
  const [overlay, setOverlay] = useState(() => scanSession.peekOverlay());
  const [showCoach, setShowCoach] = useState(false);
  const dropOverlay = useCallback(() => setOverlay(null), []);
  const home = () => router.replace('/');

  useEffect(() => {
    scanSession.takeOverlay();
    void coachSeen().then((seen) => setShowCoach(!seen));
  }, []);

  if (loading) return <Screen onBack={home}>{null}</Screen>;
  if (!key) {
    return (
      <Screen onBack={home}>
        <EmptyState title={COPY.reading.none} body="Your readings were deleted from this phone.">
          <Button label="Back to home" onPress={home} />
        </EmptyState>
      </Screen>
    );
  }

  return (
    <Screen onBack={home} footer={<Button label="Check a product" trailingIcon="arrow-right" onPress={home} />}>
      <Heading>{COPY.reading.ready}</Heading>
      <KeyPanel
        keyProfile={key}
        isDemo={isDemo}
        glyph={<OverlayToGlyph keyProfile={key} overlayBase64={overlay} onDropped={dropOverlay} />}
        extra={
          showCoach ? (
            <ShareCoachMark
              onDismiss={() => {
                setShowCoach(false);
                void markCoachSeen();
              }}
            />
          ) : null
        }
        onRemoved={home}
      />
      <Button label="How this was made" variant="tertiary" trailingIcon="chevron-right" onPress={() => router.push('/how')} />
      <Body muted small>
        {COPY.footer}
      </Body>
    </Screen>
  );
}
