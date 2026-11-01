import { Text, View } from 'react-native';
import { COPY, type KeyProfile } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { PHOTO_DELETED_STAMP } from '../scan/deleteCopy';
import { Button, Icon, Note, Overline, Tag, TextLink } from '../scan/ui';
import { BandChip } from './BandChip';
import { CONCERNS, formatScanDate, glyphFromKey, type GlyphZone } from './model';
import { ZoneGlyph } from './ZoneGlyph';

interface Props {
  keyProfile: KeyProfile;
  isDemo?: boolean;
  showGlyph?: boolean;
  highlight?: readonly GlyphZone[];
  onEdit?: () => void;
  onDelete?: () => void;
  onWithdraw?: () => void;
}

export function KeyCard({ keyProfile, isDemo, showGlyph = true, highlight, onEdit, onDelete, onWithdraw }: Props) {
  const theme = useTheme();
  const date = formatScanDate(keyProfile.scanDate);
  const glyph = glyphFromKey(keyProfile);
  const demo = isDemo || keyProfile.source === 'demo';

  return (
    <View style={{ gap: theme.spacing.stackLg }}>
      <View style={{ gap: theme.space[2] }}>
        <Overline>Your Key</Overline>
        {demo ? <Tag label="Demo Key · sample readings, not a scan" /> : null}
        {keyProfile.skinType ? (
          <View style={{ gap: theme.space[1] }}>
            <Text style={[theme.type.headline, { color: theme.colors.text }]}>Skin-type reading: {keyProfile.skinType.value}</Text>
            {keyProfile.skinType.derived ? <Tag label="estimated from oiliness + moisture" variant="outline" /> : null}
          </View>
        ) : null}
      </View>

      {showGlyph ? <ZoneGlyph model={glyph} highlight={highlight} caption={`Zones from your ${date} scan · no photo kept`} /> : null}

      <View style={{ gap: theme.space[3] }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
          {CONCERNS.map((c) => (
            <BandChip key={c} concern={c} reading={keyProfile.bands[c]} />
          ))}
        </View>
        <Note>{COPY.accuracyNote}</Note>
        {onEdit ? <TextLink label="Feels wrong? Edit" onPress={onEdit} accessibilityLabel="Feels wrong? Edit your bands" /> : null}
      </View>

      <View
        accessible
        style={{ borderTopWidth: 1.5, borderBottomWidth: 1.5, borderColor: theme.colors.text, paddingVertical: theme.space[3], gap: theme.space[1] }}
      >
        <Text style={[theme.type.bodySm, { color: theme.colors.text }]}>
          {demo ? 'Sample readings for trying SkinKey. Not measured from a face.' : `Measured by YouCam Skin Analysis HD, ${date}`}
        </Text>
        {!demo && keyProfile.photoDeleted ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[1] }}>
            <Icon name="check" size={theme.icon.sm} color={theme.colors.text} />
            <Text style={[theme.type.label, { color: theme.colors.text }]}>{PHOTO_DELETED_STAMP} · score bands only</Text>
          </View>
        ) : null}
        <Text style={[theme.type.caption, { color: theme.colors.textMuted }]}>Kept on this phone only.</Text>
      </View>

      {onDelete || onWithdraw ? (
        <View style={{ gap: theme.space[3] }}>
          {onDelete ? <Button label="Delete Key" variant="destructiveNeutral" icon="trash" onPress={onDelete} /> : null}
          {onWithdraw && !demo ? <Button label="Withdraw consent" variant="destructiveNeutral" onPress={onWithdraw} /> : null}
        </View>
      ) : null}
    </View>
  );
}
