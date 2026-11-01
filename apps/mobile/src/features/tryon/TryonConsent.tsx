import { useState } from 'react';
import { Text } from 'react-native';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { ADULT_HELPER, ADULT_LABEL } from '../scan/consent';
import { Body, Button, ButtonPair, CheckboxRow, Heading, Note, Screen } from '../scan/ui';

export function TryonConsent({ productName, mode, onAccept, onDecline }: { productName?: string; mode: 'multi' | 'single'; onAccept: () => void; onDecline: () => void }) {
  const theme = useTheme();
  const cs = theme.components.consentSheet;
  const [adult, setAdult] = useState(false);
  return (
    <Screen
      title="Try-on"
      onBack={onDecline}
      footer={
        <>
          {!adult ? <Body muted small>{ADULT_HELPER}</Body> : null}
          <ButtonPair>
            <Button label="Take photo" variant="consentPair" disabled={!adult} onPress={onAccept} style={{ flex: 1 }} />
            <Button label="Not now" variant="consentPair" onPress={onDecline} style={{ flex: 1 }} />
          </ButtonPair>
        </>
      }
    >
      <Heading>This needs a second photo</Heading>
      {productName ? <Body muted>{productName}</Body> : null}
      <Text accessible style={[cs.privacyLead, { color: cs.privacyColor }]}>
        {COPY.privacyLine}
      </Text>
      <Body muted small>
        {COPY.privacyQualifier}
      </Body>
      <Body>
        {mode === 'multi'
          ? 'YouCam reads your skin tone once to pick two shades, then renders both on the same photo. The tone is used for this try-on only and is never shown or kept.'
          : 'YouCam renders the shade on your photo.'}
      </Body>
      <Body>The previews stay on screen only. There is no save button, and they are gone when you close this screen.</Body>
      <Note>Preview, not a shade guarantee.</Note>
      <Note>{COPY.accuracyNote}</Note>
      <CheckboxRow label={ADULT_LABEL} checked={adult} onChange={setAdult} />
    </Screen>
  );
}
