import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { clearLedger } from '../scan/ledgerStore';
import { Body, Heading, Icon, Overline, Screen, haptic } from '../scan/ui';
import { ConfirmSheet, type ConfirmKind } from './ConfirmSheet';
import { deleteKey, useKey, withdrawConsent } from './index';

function Row({ title, supporting, onPress, icon = 'chevronRight' }: { title: string; supporting?: string; onPress: () => void; icon?: 'chevronRight' | 'trash' }) {
  const theme = useTheme();
  const r = theme.components.listRow;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={supporting ? `${title}. ${supporting}` : title}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: supporting ? 72 : r.minHeight,
        paddingVertical: r.paddingY,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space[4],
        backgroundColor: pressed ? r.bgPressed : 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: r.divider,
      })}
    >
      <View style={{ flex: 1, gap: theme.space[1] }}>
        <Text style={[r.title, { color: r.titleColor }]}>{title}</Text>
        {supporting ? <Text style={[r.supporting, { color: r.supportingColor }]}>{supporting}</Text> : null}
      </View>
      <Icon name={icon} size={r.trailingIcon} color={r.trailingColor} />
    </Pressable>
  );
}

const CREDITS = [
  'Skin readings and try-on: YouCam API by Perfect Corp',
  'Label and listing reading: Claude by Anthropic',
  'Fonts: Newsreader and Commissioner (SIL Open Font License)',
];

export function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { key, isDemo } = useKey();
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const go = (href: Href) => () => router.push(href);

  return (
    <Screen title="Settings">
      <Heading>Settings</Heading>
      <View>
        <Overline>Your data</Overline>
        <Row title="Your Key" supporting={key ? (isDemo ? 'Demo Key in use' : 'Stored on this phone only') : 'No Key yet'} onPress={go('/key')} />
        <Row title="How this was made" supporting="Task ids, units, time and delete status" onPress={go('/how')} />
        {key ? <Row title="Delete Key" icon="trash" onPress={() => setConfirm('delete')} /> : null}
        <Row title="Withdraw consent" supporting="Deletes your Key and consent from this phone" icon="trash" onPress={() => setConfirm('withdraw')} />
        {done ? (
          <Text accessibilityLiveRegion="polite" style={[theme.type.bodySm, { color: theme.colors.text, paddingTop: theme.space[3] }]}>
            {done}
          </Text>
        ) : null}
      </View>

      <View style={{ gap: theme.space[2] }}>
        <Overline>About</Overline>
        <Body small>Roadmap: share your readings with a pharmacist by QR code. Not built yet.</Body>
        {CREDITS.map((c) => (
          <Body key={c} small muted>
            {c}
          </Body>
        ))}
        <Body small muted>
          {COPY.footer}
        </Body>
        <Body small muted>
          {COPY.notAffiliated}
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
          setDone(kind === 'withdraw' ? 'Consent withdrawn. Your Key was deleted from this phone.' : 'Key deleted from this phone.');
        }}
      />
    </Screen>
  );
}
