import type { ReactNode } from 'react';
import { View } from 'react-native';
import { COPY, type Band, type KeyProfile } from '@skinkey/contracts';
import { deriveSkinType } from '@skinkey/rules';
import { Body, Button, Caption, Chip, ChipRail, Divider, FocusTiles, Icon, Note, SectionHeader, SkinTypeCard, Tag, Txt } from '@/components';
import { useTheme } from '@/theme/ThemeProvider';
import { BandList } from './BandChip';
import { focusTilesFor } from './focus';
import { CONCERNS, CONCERN_LABEL, SELF_REPORTED_TAG, formatScanDate, glyphFromKey, zoneCaption, type GlyphZone } from './model';
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

/** Hero label (showcase 04_report "Skin Type"); Home's compact card keeps COPY.reading.skinType. */
const HERO_LABEL = 'Skin type';
const BAND_RANK: Record<Band, number> = { High: 0, Medium: 1, Low: 2 };

/**
 * The reading, expanded (DESIGN.md §9.9–9.10, showcase 04_report): the gradient skin-type hero (Demo reading badge
 * inside), "Key readings" as a static chip rail highest band first, the focus tiles from the published rules, the band
 * list with meters and "Feels wrong? Edit", the photo-deleted stamp, the zone glyph, the accuracy note once, then the
 * neutral delete actions. Bands only, never numbers.
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
  const line = estimated
    ? 'Estimated from your bands.'
    : demo
      ? `Sample reading for trying ${COPY.appName}.`
      : `Measured by YouCam Skin Analysis HD, ${date}.`;
  const ruleIds = [...new Set(focus.flatMap((f) => f.rules))];
  // A short focus row (one or two tiles) carries the rules caption beside it, in the empty columns.
  const shortRow = focus.length < theme.components.focusTile.columns;
  const rulesCaption = <Caption>{`From our published rules (${ruleIds.join(', ')}). Traits to look for on a label.`}</Caption>;
  const ranked = CONCERNS.filter((c) => keyProfile.bands[c]?.level).sort((a, b) => BAND_RANK[keyProfile.bands[a].level] - BAND_RANK[keyProfile.bands[b].level]);

  return (
    <View style={{ gap: theme.spacing.section }}>
      <SkinTypeCard
        size="hero"
        testID="reading-skin-type"
        label={HERO_LABEL}
        value={skinType}
        line={line}
        accessibilityLabel={[`Skin-type reading: ${skinType}`, demo ? COPY.reading.demo : null, line].filter(Boolean).join('. ')}
      >
        {demo ? (
          <View style={{ flexDirection: 'row' }}>
            <Tag label={COPY.reading.demo} variant="demo" />
          </View>
        ) : null}
      </SkinTypeCard>

      <View style={{ gap: theme.space[3] }}>
        <SectionHeader title={COPY.reading.keyReadings} />
        <ChipRail testID="key-readings" accessibilityLabel={COPY.reading.keyReadings}>
          {ranked.map((c) => {
            const r = keyProfile.bands[c];
            return (
              <Chip
                key={c}
                testID={`key-reading-${c}`}
                label={`${CONCERN_LABEL[c]} · ${r.level}`}
                accessibilityLabel={`${CONCERN_LABEL[c]}, ${r.level}${r.selfReported ? `, ${SELF_REPORTED_TAG}` : ''}`}
              />
            );
          })}
        </ChipRail>
        <Divider spacing={0} />
      </View>

      <View style={{ gap: theme.space[3] }}>
        <SectionHeader title="What this means for products" />
        {focus.length > 0 ? (
          <>
            <FocusTiles items={focus} aside={shortRow ? rulesCaption : undefined} />
            {shortRow ? null : rulesCaption}
          </>
        ) : (
          <Body muted small>
            None of our published rules is triggered by your readings, so no ingredient stands out for you yet.
          </Body>
        )}
      </View>

      <View style={{ gap: theme.space[3] }}>
        <SectionHeader
          title="Your bands"
          action={onEdit ? { label: 'Feels wrong? Edit', onPress: onEdit, accessibilityLabel: 'Feels wrong? Edit your bands' } : undefined}
        />
        <BandList keyProfile={keyProfile} />
        <View accessible style={{ gap: theme.space[1], paddingHorizontal: theme.space[1] }}>
          {!demo && keyProfile.photoDeleted ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
              <Icon name="check-circle" size={theme.icon.sm} color={theme.colors.verdict.fits.icon} />
              <Txt variant="label">{COPY.reading.photoDeletedStamp}</Txt>
            </View>
          ) : null}
          <Caption>
            {demo
              ? `Sample readings for trying ${COPY.appName}, not a scan of a face. Kept on this phone only.`
              : `Scan ${date}. Kept on this phone only.`}
          </Caption>
        </View>
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
