import { Text, View } from 'react-native';
import { COPY, type KeyProfile } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { shortDate } from '@/features/check/format';
import { CONCERN_LABEL } from '@/features/key/model';
import { BandMeter, Card, Heading, Icon, IconDisc, PillButton, Txt } from '@/components';

/** Readings shown on the Home card (≤3; the full list lives on the Reading tab). */
const CARD_CONCERNS = ['oiliness', 'moisture', 'redness'] as const;

export function keyChipText(key: KeyProfile | null, isDemo: boolean): { title: string; sub: string } {
  if (!key) return { title: COPY.reading.none, sub: 'Scan once, about a minute' };
  if (isDemo || key.source === 'demo') return { title: COPY.reading.demo, sub: 'Labelled sample readings, not a scan' };
  if (key.source === 'mock') return { title: COPY.reading.yours, sub: COPY.mockReading };
  const date = shortDate(key.scanDate);
  return { title: COPY.reading.yours, sub: [date ? `Scan ${date}` : null, key.photoDeleted ? 'photo deleted' : null].filter(Boolean).join(' · ') };
}

interface ReadingCardProps {
  keyProfile: KeyProfile | null;
  isDemo: boolean;
  /** Opens the Reading tab (with a reading) or the scan (without). */
  onPress: () => void;
  /** Empty state only: switch on the labelled Demo reading. */
  onUseDemo?: () => void;
}

/**
 * Home reading card (component.readingCard, DESIGN.md §8.3): droplet disc, "Your reading", the skin-type reading,
 * the scan stamp and a chevron, with up to three band chips. One target, one label in visual order. Empty: "No
 * reading yet" with slate Start scan and tonal Use the Demo reading.
 */
export function KeyChip({ keyProfile, isDemo, onPress, onUseDemo }: ReadingCardProps) {
  const t = useTheme();
  const r = t.components.readingCard;
  const { title, sub } = keyChipText(keyProfile, isDemo);

  if (!keyProfile) {
    return (
      <View testID="key-chip" style={{ backgroundColor: r.bg, borderRadius: r.radius, padding: r.padding, gap: t.space[4], ...(t.dark ? { borderWidth: 1, borderColor: r.border, borderTopColor: t.colors.sheenEdge } : t.elevation['1'].style) }}>
        <View style={{ flexDirection: 'row', gap: t.space[3], alignItems: 'center' }}>
          <IconDisc icon="droplet" />
          <View style={{ flex: 1, gap: t.space[1] }}>
            <Heading level="headline" style={[r.value, { color: r.valueColor }]}>
              {title}
            </Heading>
            <Txt variant="caption" style={[r.meta, { color: r.metaColor }]}>
              {sub}
            </Txt>
          </View>
        </View>
        <View style={{ gap: t.space[2] }}>
          <PillButton label="Start scan" trailingIcon="arrow-right" onPress={onPress} testID="home-start-scan" />
          {onUseDemo ? <PillButton label={COPY.reading.useDemo} variant="secondary" onPress={onUseDemo} testID="home-use-demo" /> : null}
        </View>
      </View>
    );
  }

  const skinType = keyProfile.skinType ? `Skin-type reading: ${keyProfile.skinType.value}` : null;
  const bands = CARD_CONCERNS.map((c) => ({ name: CONCERN_LABEL[c], level: keyProfile.bands[c].level, selfReported: keyProfile.bands[c].selfReported }));
  const bandWords = bands.map((b) => `${b.name} reading: ${b.level.toLowerCase()}${b.selfReported ? `, ${COPY.selfReported}` : ''}`).join(', ');
  const a11y = [title, skinType, sub, bandWords].filter(Boolean).join('. ');

  return (
    <Card
      testID="key-chip"
      onPress={onPress}
      accessibilityLabel={`${a11y}. Open`}
      accessibilityHint="Opens your reading"
      padding={r.padding}
      gap={t.space[4]}
      style={t.dark ? { backgroundColor: r.bg, borderColor: r.border, borderTopColor: t.colors.sheenEdge } : undefined}
    >
      <View style={{ flexDirection: 'row', gap: t.space[3], alignItems: 'center', minHeight: r.minHeight - r.padding * 2 }}>
        <IconDisc icon="droplet" />
        <View style={{ flex: 1, gap: 2 }}>
          <Text {...t.textProps.section} style={[r.title, { color: r.titleColor }]}>
            {title}
          </Text>
          {skinType ? (
            <Text {...t.textProps.headline} style={[r.value, { color: r.valueColor }]}>
              {skinType}
            </Text>
          ) : null}
          <Text {...t.textProps.caption} style={[r.meta, { color: r.metaColor }]}>
            {sub}
          </Text>
        </View>
        <Icon name="chevron-right" size={t.icon.lg} color={r.chevron} />
      </View>
      <View
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={{ flexDirection: 'row', backgroundColor: t.components.bandChip.bg, borderRadius: t.radius.md, paddingVertical: t.space[3] }}
      >
        {bands.map((b, i) => (
          <View
            key={b.name}
            style={{ flex: 1, minWidth: 0, paddingHorizontal: t.space[3], gap: t.space[1], borderLeftWidth: i ? 1 : 0, borderLeftColor: t.colors.border }}
          >
            <Text {...t.textProps.caption} numberOfLines={1} style={[t.typography.caption, { color: t.colors.textMuted }]}>
              {b.name}
            </Text>
            <Text {...t.textProps.label} numberOfLines={1} style={[t.typography.label, { color: t.colors.text }]}>
              {b.level}
              {b.selfReported ? '*' : ''}
            </Text>
            <BandMeter level={b.level} segmentWidth={14} />
          </View>
        ))}
      </View>
      {bands.some((b) => b.selfReported) ? <Txt variant="caption" tone="muted">* {COPY.selfReported}</Txt> : null}
    </Card>
  );
}
