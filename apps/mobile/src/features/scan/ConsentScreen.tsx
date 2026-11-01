import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { saveScanConsent } from '../key';
import { ADULT_HELPER, ADULT_LABEL, KEEP_CHIPS, makeConsent, SCAN_CONSENT_VERSION } from './consent';
import { Body, Button, ButtonPair, CheckboxRow, Heading, KeepChip, Note, Overline, Screen, TextLink } from './ui';

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
      title="Skin scan"
      footer={
        <>
          {!adult ? <Body muted small>{ADULT_HELPER}</Body> : null}
          <ButtonPair>
            <Button
              label="Start scan"
              variant="consentPair"
              disabled={!adult}
              busy={opening}
              busyLabel="Opening camera…"
              onPress={() => void start()}
              style={{ flex: 1 }}
            />
            <Button label="Not now" variant="consentPair" onPress={() => router.replace('/')} style={{ flex: 1 }} />
          </ButtonPair>
        </>
      }
    >
      <Heading>Before your scan</Heading>
      <Text accessible style={[cs.privacy, { color: cs.privacyColor }]}>
        {COPY.privacyLine}
      </Text>
      <Body muted small>
        {COPY.privacyQualifier}
      </Body>
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radius.lg,
          padding: theme.space[4],
          gap: theme.space[3],
        }}
      >
        <Overline>What we keep</Overline>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }} accessible accessibilityLabel={`What we keep: ${KEEP_CHIPS.join(', ')}. On this phone only.`}>
          {KEEP_CHIPS.map((c) => (
            <KeepChip key={c} label={c} />
          ))}
        </View>
        <Text style={[cs.keepList, { color: theme.colors.text }]}>On this phone only. Bands, never scores. No photo.</Text>
      </View>
      <Note>{COPY.accuracyNote}</Note>
      <CheckboxRow label={ADULT_LABEL} checked={adult} onChange={setAdult} />
      <TextLink label="Read how deletion works" onPress={() => router.push('/how')} />
    </Screen>
  );
}
