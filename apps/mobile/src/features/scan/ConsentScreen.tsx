import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { COPY } from '@skinkey/contracts';
import { Body, Button, ButtonPair, Note, Screen } from '@/components';
import { CheckboxRow, DetailsRow, FaceFramePlate, KeepCard, PromiseList } from '@/components/scan';
import { useTheme } from '@/theme/ThemeProvider';
import { saveScanConsent } from '../key';
import { ADULT_HELPER, ADULT_LABEL, KEPT_ON_PHONE, NOT_KEPT, makeConsent, SCAN_CONSENT_VERSION } from './consent';

const PROMISES = [
  { icon: 'camera', label: 'One photo, analysed by YouCam' },
  { icon: 'trash', label: 'Deleted from YouCam right after' },
  { icon: 'phone-lock', label: 'Only bands kept, on this phone' },
] as const;

export function ConsentScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [adult, setAdult] = useState(false);
  const [opening, setOpening] = useState(false);
  const cs = theme.components.consentSheet;

  const start = async () => {
    setOpening(true);
    try {
      await saveScanConsent(makeConsent(SCAN_CONSENT_VERSION, adult));
      router.push('/scan/capture');
    } finally {
      setOpening(false);
    }
  };

  return (
    <Screen
      largeTitle
      title="Before your scan"
      footer={
        <>
          <CheckboxRow label={ADULT_LABEL} checked={adult} onChange={setAdult} supporting={adult ? undefined : ADULT_HELPER} />
          <ButtonPair>
            <Button
              label="Start scan"
              variant="consentPair"
              disabled={!adult}
              busy={opening}
              busyLabel="Opening camera…"
              onPress={() => void start()}
            />
            <Button label="Not now" variant="consentPair" onPress={() => router.replace('/')} />
          </ButtonPair>
        </>
      }
    >
      <FaceFramePlate />
      <PromiseList items={PROMISES} />
      <KeepCard title="What stays on this phone" kept={KEPT_ON_PHONE} dropped={NOT_KEPT} footnote="Bands, never scores." />
      <View style={{ gap: theme.space[1] }}>
        <Body accessible style={[cs.privacyLead, { color: cs.privacyColor }]}>
          {COPY.privacyLine}
        </Body>
        <DetailsRow>{COPY.privacyQualifier}</DetailsRow>
      </View>
      <Note>{COPY.accuracyNote}</Note>
    </Screen>
  );
}
