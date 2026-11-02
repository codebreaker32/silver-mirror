import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { COPY } from '@skinkey/contracts';
import { Body, Card, Icon, ListGroup, Screen, Txt, haptic, type IconName } from '@/components';
import { PHOTO_CREDITS, PHOTO_LICENCE } from '@/components/photos';
import { useTheme } from '@/theme/ThemeProvider';
import { clearLedger } from '../scan/ledgerStore';
import { Disclosure } from '../check/components/Disclosure';
import { ConfirmSheet, type ConfirmKind } from './ConfirmSheet';
import { deleteKey, useKey, withdrawConsent } from './index';

const CREDITS = [
  'Skin readings and try-on: YouCam API by Perfect Corp',
  'Label and listing reading: Claude by Anthropic',
  'Fonts: Noto Serif Display and Geist (SIL Open Font License)',
];

/** 44dp rounded-square icon tile, radius 12 (showcase 00_brand_panel feature list; kit thumb tile §3.6 at row scale). */
const TILE = 24;

interface RowProps {
  title: string;
  supporting?: string;
  icon: IconName;
  /** Opens a screen (trailing chevron) or a confirmation sheet (no chevron). Static when absent. */
  onPress?: () => void;
  chevron?: boolean;
  testID?: string;
}

/**
 * Settings row: a bare 24dp ink line icon in a 24dp column (no tile), title (bodyStrong) over supporting (bodySm muted),
 * trailing chevron when it opens a screen. ≥64dp, one TalkBack node. Tokens from component.listRow / iconDisc.
 */
function SettingsRow({ title, supporting, icon, onPress, chevron = true, testID }: RowProps) {
  const t = useTheme();
  const r = t.components.listRow;
  const label = [title, supporting].filter(Boolean).join('. ');
  const body = (
    <>
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ width: 24, alignItems: 'center' }}>
        <Icon name={icon} size={t.icon.lg} color={t.colors.text} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="bodyStrong" style={[r.title, { color: r.titleColor }]}>
          {title}
        </Txt>
        {supporting ? (
          <Txt variant="bodySm" style={[r.supporting, { color: r.supportingColor }]}>
            {supporting}
          </Txt>
        ) : null}
      </View>
      {onPress && chevron ? <Icon name="chevron-right" size={r.trailingIcon} color={r.trailingColor} /> : null}
    </>
  );
  const box = { minHeight: 64, paddingHorizontal: r.paddingX, paddingVertical: r.paddingY, gap: r.gap, flexDirection: 'row' as const, alignItems: 'center' as const };
  if (!onPress) {
    return (
      <View testID={testID} accessible accessibilityLabel={label} style={box}>
        {body}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      android_ripple={{ color: t.colors.state.ripple }}
      style={({ pressed }) => [box, { minHeight: box.minHeight, backgroundColor: pressed ? r.bgPressed : 'transparent' }]}
    >
      {body}
    </Pressable>
  );
}

/** Settings (DESIGN.md §9.12, showcase 00_brand_panel rows): centred title, white r24 groups, icon-tile rows, dividers inset to the text column. */
export function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { key, isDemo } = useKey();
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const go = (href: Href) => () => router.push(href);
  // Row dividers start at the text column, so each tile-plus-text row reads as one unit (§3.6).
  const ROW_INSET = theme.components.listRow.paddingX + TILE + theme.components.listRow.gap;

  return (
    <Screen largeTitle title="Settings">

      <View style={{ gap: theme.space[3] }}>
        <ListGroup title="Your data" inset={ROW_INSET}>
          <SettingsRow
            title={COPY.reading.yours}
            supporting={key ? (isDemo ? `${COPY.reading.demo} in use` : 'Stored on this phone only') : COPY.reading.none}
            icon="droplet"
            onPress={go('/key')}
          />
          <SettingsRow title="What stays on this phone" supporting="Bands, zone labels and scan date. No photo." icon="phone-lock" chevron={false} />
          {key ? <SettingsRow title={COPY.reading.delete} supporting="Asks before it deletes" icon="trash" chevron={false} onPress={() => setConfirm('delete')} /> : null}
          <SettingsRow
            title="Withdraw consent"
            supporting="Deletes your reading and consent from this phone"
            icon="minus-circle"
            chevron={false}
            onPress={() => setConfirm('withdraw')}
          />
        </ListGroup>
        {done ? (
          <Txt accessibilityLiveRegion="polite" variant="bodySm">
            {done}
          </Txt>
        ) : null}
      </View>

      <Disclosure title="Credits" icon="info" testID="photo-credits">
        <View style={{ gap: theme.space[2] }}>
          {CREDITS.map((c) => (
            <Body key={c} small>
              {c}
            </Body>
          ))}
          <Body small muted>
            {`Photos from Unsplash (${PHOTO_LICENCE}).`}
          </Body>
          {PHOTO_CREDITS.map((c) => (
            <Body key={c.file} small>
              {`${c.shows}: ${c.photographer}`}
            </Body>
          ))}
          <Body small testID="product-photo-credit">
            Product photos: Open Beauty Facts contributors, CC BY-SA 3.0 (openbeautyfacts.org)
          </Body>
        </View>
      </Disclosure>

      <View style={{ gap: theme.space[1] }}>
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
          setDone(kind === 'withdraw' ? 'Consent withdrawn. Your reading was deleted from this phone.' : 'Reading deleted from this phone.');
        }}
      />
    </Screen>
  );
}
