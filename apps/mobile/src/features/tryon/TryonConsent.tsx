import { useState } from 'react';
import { View } from 'react-native';
import { COPY } from '@skinkey/contracts';
import { Body, Button, ButtonPair, Heading, Note, Screen } from '@/components';
import { PromiseList } from '@/components/scan';
import { CheckboxRow, DetailsRow, FaceFramePlate } from '@/components/scan';
import { useTheme } from '@/theme/ThemeProvider';
import { ADULT_HELPER, ADULT_LABEL } from '../scan/consent';

const PROMISES = [
  { icon: 'camera', label: 'One photo, rendered by YouCam' },
  { icon: 'trash', label: 'Deleted from YouCam right after' },
  { icon: 'phone-lock', label: 'Previews stay on screen, never saved' },
] as const;

/**
 * Try-on consent (DESIGN.md §9.11, showcase 03_analyze language): back arrow + centred "Try-on", the face-frame plate,
 * the title in type.title, the three facts as bare-icon rows on one surface card (PromiseList), and a sticky 18+ box above the
 * equal-weight "Take photo" / "Not now" pair. "Previews stay on screen, never saved" is said once, in the rows.
 */
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
          <CheckboxRow label={ADULT_LABEL} checked={adult} onChange={setAdult} supporting={adult ? undefined : ADULT_HELPER} />
          <ButtonPair>
            <Button label="Take photo" variant="consentPair" disabled={!adult} onPress={onAccept} />
            <Button label="Not now" variant="consentPair" onPress={onDecline} />
          </ButtonPair>
        </>
      }
    >
      <FaceFramePlate />
      <View style={{ gap: theme.space[2] }}>
        <Heading>This needs a second photo</Heading>
        {productName ? <Body muted>{productName}</Body> : null}
      </View>
      <PromiseList items={PROMISES} />
      <Body>
        {mode === 'multi'
          ? 'YouCam reads your skin tone once to pick two shades, then renders both on the same photo. The tone is used for this try-on only and is never shown or kept.'
          : 'YouCam renders the shade on your photo.'}
      </Body>
      <View style={{ gap: theme.space[1] }}>
        <Body accessible style={[cs.privacyLead, { color: cs.privacyColor }]}>
          {COPY.privacyLine}
        </Body>
        <DetailsRow>{COPY.privacyQualifier}</DetailsRow>
      </View>
      <Note>Preview, not a shade guarantee.</Note>
      <Note>{COPY.accuracyNote}</Note>
    </Screen>
  );
}
