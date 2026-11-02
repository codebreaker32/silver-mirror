import { COPY, type KeyProfile } from '@skinkey/contracts';
import { deriveSkinType } from '@skinkey/rules';
import { shortDate } from '@/features/check/format';
import { Pressable, Text, View } from 'react-native';
import { PillButton } from '@/components';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/components';
import { homeType } from '@/components/home/homeType';
import { BandMeter } from './BandMeter';

export interface KeyChipText {
  /** Card label: "Your skin type", or "No reading yet" when empty. */
  title: string;
  /** The value line: the skin-type class, or "Scan once, about a minute" when empty. */
  value: string;
  /** Caption: the scan stamp, the Demo reading line or the mock-fixture line. */
  sub: string;
}

/** Strings for the Home skin-type card. Without hd_skin_type the published band mapping fills in (as on the Reading tab). */
export function keyChipText(key: KeyProfile | null, isDemo: boolean): KeyChipText {
  if (!key) return { title: COPY.reading.none, value: 'Scan once, about a minute', sub: '' };
  const value =
    key.skinType?.value ??
    deriveSkinType({ oiliness: key.bands.oiliness.level, moisture: key.bands.moisture.level, redness: key.bands.redness.level, pore: key.bands.pore.level });
  if (isDemo || key.source === 'demo') return { title: COPY.reading.skinType, value, sub: `${COPY.reading.demo} · sample, not a scan` };
  if (key.source === 'mock') return { title: COPY.reading.skinType, value, sub: COPY.mockReading };
  const date = shortDate(key.scanDate);
  return { title: COPY.reading.skinType, value, sub: [date ? `Scan ${date}` : null, key.photoDeleted ? 'photo deleted' : null].filter(Boolean).join(' · ') };
}

interface ReadingCardProps {
  keyProfile: KeyProfile | null;
  isDemo: boolean;
  /** Opens the Reading tab (with a reading) or the scan (without). */
  onPress: () => void;
  /** Empty state only: switch on the labelled Demo reading. */
  onUseDemo?: () => void;
}

/** The three readings Home shows, in this order. The Reading tab carries the full set. */
export function homeBands(key: KeyProfile): { label: string; level: KeyProfile['bands']['oiliness']['level'] }[] {
  return [
    { label: 'Oiliness', level: key.bands.oiliness.level },
    { label: 'Moisture', level: key.bands.moisture.level },
    { label: 'Pores', level: key.bands.pore.level },
  ];
}

/**
 * Home reading surface (dashboard reference "Skin Health" block, Silver & graphite): one surface-tone block, radius 16,
 * no line, no shadow. "Your skin type" in muted 15, the skin-type word large, the scan line muted; under it three band
 * rows (Oiliness, Moisture, Pores) with a three-segment bar and the band word. No figures anywhere. With a reading the
 * block is one target with one label in visual order and opens the Reading tab. Empty: "No reading yet", the one-line
 * how, then Start scan (graphite pill) and the text action Use the Demo reading.
 */
export function KeyChip({ keyProfile, isDemo, onPress, onUseDemo }: ReadingCardProps) {
  const t = useTheme();
  const { title, value, sub } = keyChipText(keyProfile, isDemo);
  const surface = { backgroundColor: t.colors.surface, borderRadius: 16, padding: t.space[5] } as const;

  if (!keyProfile) {
    return (
      <View testID="key-chip" style={[surface, { gap: t.space[5] }]}>
        <View accessible accessibilityLabel={`${title}. ${value}`} style={{ gap: t.space[1] }}>
          <Text style={[homeType.value, { fontSize: 28, lineHeight: 34, color: t.colors.text }]}>{title}</Text>
          <Text style={[homeType.body, { color: t.colors.textMuted }]}>{value}</Text>
        </View>
        <View style={{ gap: t.space[1] }}>
          <PillButton label="Start scan" trailingIcon="arrow-right" onPress={onPress} testID="home-start-scan" />
          {onUseDemo ? <PillButton label={COPY.reading.useDemo} variant="tertiary" onPress={onUseDemo} testID="home-use-demo" style={{ alignSelf: 'center' }} /> : null}
        </View>
      </View>
    );
  }

  const bands = homeBands(keyProfile);
  const selfReported = Object.values(keyProfile.bands).some((b) => b.selfReported);
  return (
    <Pressable
      testID="key-chip"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[
        `${title}, ${value}`,
        sub,
        bands.map((b) => `${b.label} ${b.level}`).join(', '),
        selfReported ? `Some readings ${COPY.selfReported}` : null,
        'Open your reading',
      ]
        .filter(Boolean)
        .join('. ')}
      accessibilityHint="Opens the Reading tab"
      android_ripple={{ color: t.colors.state.ripple }}
      style={({ pressed }) => [surface, { minHeight: t.touch.min, overflow: 'hidden', gap: t.space[5], backgroundColor: pressed ? t.colors.surfaceRaised : t.colors.surface }]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: t.space[3] }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[homeType.body, { color: t.colors.textMuted }]}>{title}</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={[homeType.value, { marginTop: 2, color: t.colors.text }]}>
            {value}
          </Text>
          {sub ? <Text style={[homeType.small, { marginTop: t.space[1], color: t.colors.textMuted }]}>{sub}</Text> : null}
        </View>
        <Icon name="chevron-right" size={t.icon.md} color={t.colors.textMuted} />
      </View>
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ gap: t.space[3] }}>
        {bands.map((b) => (
          <BandMeter key={b.label} label={b.label} level={b.level} />
        ))}
      </View>
    </Pressable>
  );
}
