import type { ReactNode } from 'react';
import { View } from 'react-native';
import { COPY, type KeyProfile } from '@skinkey/contracts';
import { deriveSkinType } from '@skinkey/rules';
import { Body, Button, Caption, Card, Divider, FocusTiles, Icon, IconDisc, Note, SectionHeader, Tag, Txt } from '@/components';
import { useTheme } from '@/theme/ThemeProvider';
import { BandList } from './BandChip';
import { focusTilesFor } from './focus';
import { formatScanDate, glyphFromKey, zoneCaption, type GlyphZone } from './model';
import { ZoneGlyph } from './ZoneGlyph';

interface Props {
  keyProfile: KeyProfile;
  isDemo?: boolean;
  showGlyph?: boolean;
  /** Replaces the zone glyph (the result screen's overlay → glyph hand-off). */
  glyph?: ReactNode;
  highlight?: readonly GlyphZone[];
  /** Rendered after the reading, before the delete actions (the result screen's coach mark). */
  extra?: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onWithdraw?: () => void;
}

/**
 * The reading, expanded (DESIGN.md §9.9–9.10): skin-type card (droplet disc, scan date, photo-deleted stamp, Demo
 * reading badge), the band list, focus tiles from the published rules, the zone glyph, the accuracy note once, then
 * the neutral delete actions. Bands only, never numbers.
 */
export function KeyCard({ keyProfile, isDemo, showGlyph = true, glyph, highlight, extra, onEdit, onDelete, onWithdraw }: Props) {
  const theme = useTheme();
  const date = formatScanDate(keyProfile.scanDate);
  const demo = isDemo || keyProfile.source === 'demo';
  const focus = focusTilesFor(keyProfile);
  // A Key without hd_skin_type gets the published band → class mapping, tagged as estimated.
  const skinType =
    keyProfile.skinType?.value ??
    deriveSkinType({ oiliness: keyProfile.bands.oiliness.level, moisture: keyProfile.bands.moisture.level, redness: keyProfile.bands.redness.level, pore: keyProfile.bands.pore.level });
  const estimated = !keyProfile.skinType || keyProfile.skinType.derived;
  const meta = demo ? null : `Scan ${date}${keyProfile.photoDeleted ? ' · photo deleted' : ''}`;
  const ruleIds = [...new Set(focus.flatMap((f) => f.rules))];

  return (
    <View style={{ gap: theme.spacing.stackLg }}>
      <Card variant="raised" gap={theme.space[4]}>
        <View
          accessible
          accessibilityLabel={[`Skin-type reading: ${skinType}`, demo ? COPY.reading.demo : meta, estimated ? 'Estimated from your bands' : null].filter(Boolean).join('. ')}
          style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.space[4] }}
        >
          <IconDisc icon="droplet" />
          <View style={{ flex: 1, gap: theme.space[1] }}>
            <Txt variant="headline">{`Skin-type reading: ${skinType}`}</Txt>
            {meta ? <Caption>{meta}</Caption> : null}
            {estimated ? <Caption>Skin type estimated from your bands</Caption> : null}
          </View>
        </View>
        {demo ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
            <Tag label={COPY.reading.demo} variant="demo" />
          </View>
        ) : null}
        <Divider spacing={0} />
        <View accessible style={{ gap: theme.space[1] }}>
          <Body small>
            {demo ? `Sample readings for trying ${COPY.appName}, not a scan of a face.` : `Measured by YouCam Skin Analysis HD, ${date}`}
          </Body>
          {!demo && keyProfile.photoDeleted ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
              <Icon name="check-circle" size={theme.icon.sm} color={theme.colors.text} />
              <Txt variant="label">{COPY.reading.photoDeletedStamp}</Txt>
            </View>
          ) : null}
          <Caption>Kept on this phone only.</Caption>
        </View>
      </Card>

      <View style={{ gap: theme.space[3] }}>
        <SectionHeader
          title="Your bands"
          action={onEdit ? { label: 'Feels wrong? Edit', onPress: onEdit, accessibilityLabel: 'Feels wrong? Edit your bands' } : undefined}
        />
        <BandList keyProfile={keyProfile} />
      </View>

      <View style={{ gap: theme.space[3] }}>
        <SectionHeader title="What this means for products" />
        {focus.length > 0 ? (
          <>
            <FocusTiles items={focus} />
            <Caption>{`From our published rules (${ruleIds.join(', ')}). Traits to look for on a label.`}</Caption>
          </>
        ) : (
          <Body muted small>
            None of our published rules is triggered by your readings, so no ingredient stands out for you yet.
          </Body>
        )}
      </View>

      {glyph ?? (showGlyph ? <ZoneGlyph model={glyphFromKey(keyProfile)} highlight={highlight} caption={zoneCaption(keyProfile)} /> : null)}

      <Note>{COPY.accuracyNote}</Note>

      {extra}

      {onDelete || onWithdraw ? (
        <View style={{ gap: theme.space[1] }}>
          <Divider spacing={0} />
          {onDelete ? <Button label={COPY.reading.delete} variant="destructiveNeutral" onPress={onDelete} /> : null}
          {onWithdraw && !demo ? <Button label="Withdraw consent" variant="destructiveNeutral" onPress={onWithdraw} /> : null}
        </View>
      ) : null}
    </View>
  );
}
