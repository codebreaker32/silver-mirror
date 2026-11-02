import { useState } from 'react';
import { View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { COPY } from '@skinkey/contracts';
import { RULESET_VERSION } from '@skinkey/rules';
import { Body, Card, Heading, ListGroup, ListRow, Screen, Txt, haptic } from '@/components';
import { useTheme } from '@/theme/ThemeProvider';
import { clearLedger } from '../scan/ledgerStore';
import { ConfirmSheet, type ConfirmKind } from './ConfirmSheet';
import { deleteKey, useKey, withdrawConsent } from './index';

const CREDITS = [
  'Skin readings and try-on: YouCam API by Perfect Corp',
  'Label and listing reading: Claude by Anthropic',
  'Fonts: Noto Serif Display and Geist (SIL Open Font License)',
];

export function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { key, isDemo } = useKey();
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const go = (href: Href) => () => router.push(href);

  return (
    <Screen>
      <Heading>Settings</Heading>

      <View style={{ gap: theme.space[3] }}>
        <ListGroup title="Your data">
          <ListRow
            title={COPY.reading.yours}
            supporting={key ? (isDemo ? `${COPY.reading.demo} in use` : 'Stored on this phone only') : COPY.reading.none}
            leadingIcon="droplet"
            onPress={go('/key')}
          />
          <ListRow title="What stays on this phone" supporting="Bands, zone labels and scan date. No photo." leadingIcon="phone-lock" onPress={go('/how')} />
          {key ? <ListRow title={COPY.reading.delete} leadingIcon="trash" trailing="none" onPress={() => setConfirm('delete')} /> : null}
          <ListRow
            title="Withdraw consent"
            supporting="Deletes your reading and consent from this phone"
            leadingIcon="trash"
            trailing="none"
            onPress={() => setConfirm('withdraw')}
          />
        </ListGroup>
        {done ? (
          <Txt accessibilityLiveRegion="polite" variant="bodySm" style={{ paddingHorizontal: theme.space[1] }}>
            {done}
          </Txt>
        ) : null}
      </View>

      <ListGroup title="About">
        <ListRow title="How this was made" supporting="Task ids, units, time and delete status" leadingIcon="document" onPress={go('/how')} />
        <ListRow title="Published rules" supporting={`Rules version ${RULESET_VERSION}. ${COPY.howMadeBoundary}`} leadingIcon="seal-check" trailing="none" />
      </ListGroup>

      <View style={{ gap: theme.space[2] }}>
        <Txt accessibilityRole="header" variant="section" style={{ paddingHorizontal: theme.space[1] }}>
          Credits
        </Txt>
        <Card variant="surface" gap={theme.space[2]}>
          {CREDITS.map((c) => (
            <Body key={c} small>
              {c}
            </Body>
          ))}
        </Card>
      </View>

      <View style={{ gap: theme.space[1] }}>
        <Body small muted>
          {COPY.footer}
        </Body>
        <Body small muted>
          {COPY.notAffiliated}
        </Body>
        <Body small muted>
          Roadmap: share your readings with a pharmacist by QR code. Not built yet.
        </Body>
      </View>

      <ConfirmSheet
        kind={confirm}
        onClose={() => setConfirm(null)}
        onConfirm={async (kind) => {
          if (kind === 'withdraw') await withdrawConsent();
          else await deleteKey();
          clearLedger('scan');
          haptic('confirm');
          setConfirm(null);
          setDone(kind === 'withdraw' ? 'Consent withdrawn. Your reading was deleted from this phone.' : 'Reading deleted from this phone.');
        }}
      />
    </Screen>
  );
}
