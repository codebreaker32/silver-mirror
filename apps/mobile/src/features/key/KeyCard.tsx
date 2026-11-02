import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { COPY, type Band, type KeyProfile } from '@skinkey/contracts';
import { deriveSkinType } from '@skinkey/rules';
import { Body, Button, Caption, Divider, FocusTiles, Icon, Note, SectionHeader, Txt } from '@/components';
import { useTheme } from '@/theme/ThemeProvider';
import { homeType } from '@/components/home/homeType';
import { BandMeter } from '@/features/home/BandMeter';
import { BandList } from './BandChip';
import { focusTilesFor } from './focus';
import { CONCERNS, CONCERN_LABEL, SELF_REPORTED_TAG, formatScanDate, glyphFromKey, zoneCaption, type GlyphZone } from './model';
import { ReadingPortrait } from './ReadingPortrait';
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

const BAND_RANK: Record<Band, number> = { High: 0, Medium: 1, Low: 2 };

/** Small "Demo reading" chip inside the hero (13/18 medium, ink on the well tone). */
function DemoChip({ label }: { label: string }) {
  const t = useTheme();
  return (
    <View style={{ alignSelf: 'flex-start', minHeight: 24, paddingHorizontal: t.space[3] - 2, borderRadius: t.radius.full, backgroundColor: t.colors.iconDisc, justifyContent: 'center' }}>
      <Text {...t.textProps.labelSmRegular} style={{ fontFamily: t.typography.labelSmRegular.fontFamily, fontSize: 13, lineHeight: 18, color: t.colors.onIconDisc }}>
        {label}
      </Text>
    </View>
  );
}

/**
 * The reading, expanded (experience reference "Your Reading"): a licensed portrait plate with a dot grid over the cheek
 * (ReadingPortrait; a stock photo, never the user's face), the drop glyph with the
 * serif "<type> skin" and its source line, the band rows (highest first) whose bars fill on first display, the focus tiles from the published rules, the band
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
      : `Measured by YouCam Skin Analysis, ${date}.`;
  const ranked = CONCERNS.filter((c) => keyProfile.bands[c]?.level).sort((a, b) => BAND_RANK[keyProfile.bands[a].level] - BAND_RANK[keyProfile.bands[b].level]);

  return (
    <View style={{ gap: theme.spacing.section }}>
      <View
        testID="reading-skin-type"
        accessible
        accessibilityLabel={[`Skin-type reading: ${skinType}`, demo ? COPY.reading.demo : null, line].filter(Boolean).join('. ')}
        style={{ gap: theme.space[4] }}
      >
        <ReadingPortrait height={196}>
          {demo ? (
            <View style={{ position: 'absolute', left: theme.space[3], top: theme.space[3] }}>
              <DemoChip label={COPY.reading.demo} />
            </View>
          ) : null}
        </ReadingPortrait>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3] }}>
          <Icon name="droplet" size={28} color={theme.colors.text} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text numberOfLines={1} style={{ fontFamily: homeType.greeting.fontFamily, fontSize: 30, lineHeight: 36, letterSpacing: -0.3, color: theme.colors.text }}>
              {`${skinType} skin`}
            </Text>
            <Text style={[homeType.small, { color: theme.colors.textMuted }]}>
              {estimated || demo ? line : `Based on your latest scan · ${date}`}
            </Text>
          </View>
        </View>
      </View>

      <View testID="key-readings" accessibilityLabel={COPY.reading.keyReadings} style={{ gap: theme.space[3] }}>
        {ranked.map((c, i) => {
          const r = keyProfile.bands[c];
          return (
            <BandMeter
              key={c}
              testID={`key-reading-${c}`}
              label={CONCERN_LABEL[c]}
              level={r.level}
              animateIndex={i}
              accessibilityLabel={`${CONCERN_LABEL[c]}, ${r.level}${r.selfReported ? `, ${SELF_REPORTED_TAG}` : ''}`}
            />
          );
        })}
        <Divider spacing={0} />
      </View>

      <View style={{ gap: theme.space[3] }}>
        <SectionHeader title="What this means" />
        {focus.length > 0 ? (
          <FocusTiles items={focus} />
        ) : (
          <Body muted small>
            No ingredient stands out for your reading yet.
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
              ? 'Sample readings, not a scan. Kept on this phone only.'
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
