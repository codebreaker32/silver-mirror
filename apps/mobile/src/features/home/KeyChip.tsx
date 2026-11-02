import { COPY, type KeyProfile } from '@skinkey/contracts';
import { deriveSkinType } from '@skinkey/rules';
import { shortDate } from '@/features/check/format';
import { Pressable, Text, View } from 'react-native';
import { PillButton } from '@/components';
import { useTheme } from '@/theme/ThemeProvider';
import { useGlass } from '@/components/glass';
import { ReadingRing } from './ReadingRing';

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

/**
 * Home reading card (dashboard reference "Skin Health" card, without its number): a frosted glass card, radius 28.
 * Left, "Your skin type" over the skin-type word set large and one muted line (scan stamp or the Demo reading line);
 * right, the decorative ring with the droplet in a pastel disc (hidden from TalkBack, no figure). One target, one
 * label in visual order, opens the Reading tab. Empty: the same card says "No reading yet" over "Scan once, about a
 * minute" with the face-frame in the ring, then Start scan and the text action Use the Demo reading.
 */
export function KeyChip({ keyProfile, isDemo, onPress, onUseDemo }: ReadingCardProps) {
  const t = useTheme();
  const glass = useGlass(28);
  const { title, value, sub } = keyChipText(keyProfile, isDemo);
  const pad = t.space[5];

  const text = (
    <View style={{ flex: 1, minWidth: 0, gap: t.space[1] }}>
      <Text {...t.textProps.bodySm} style={[t.typography.bodySm, { color: t.colors.textMuted }]}>
        {title}
      </Text>
      {keyProfile ? (
        <Text
          {...t.textProps.valueHero}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={{ fontFamily: t.fonts.sansSemibold, fontSize: 34, lineHeight: 42, letterSpacing: -0.8, color: t.colors.text }}
        >
          {value}
        </Text>
      ) : (
        <Text {...t.textProps.headline} style={[t.typography.headline, { color: t.colors.text }]}>
          {value}
        </Text>
      )}
      {sub ? (
        <Text {...t.textProps.caption} style={[t.typography.caption, { color: t.colors.textMuted, marginTop: t.space[1] }]}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
  const row = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[4] }}>
      {text}
      <ReadingRing icon={keyProfile ? 'droplet' : 'face-frame'} />
    </View>
  );

  if (!keyProfile) {
    return (
      <View testID="key-chip" style={[glass, { padding: pad, gap: t.space[4] }]}>
        <View accessible accessibilityLabel={`${title}. ${value}`}>
          {row}
        </View>
        <View style={{ gap: t.space[1] }}>
          <PillButton label="Start scan" trailingIcon="arrow-right" onPress={onPress} testID="home-start-scan" />
          {onUseDemo ? <PillButton label={COPY.reading.useDemo} variant="tertiary" onPress={onUseDemo} testID="home-use-demo" style={{ alignSelf: 'center' }} /> : null}
        </View>
      </View>
    );
  }

  const selfReported = Object.values(keyProfile.bands).some((b) => b.selfReported);
  return (
    <Pressable
      testID="key-chip"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[`${title}, ${value}`, sub, selfReported ? `Some readings ${COPY.selfReported}` : null, 'Open your reading'].filter(Boolean).join('. ')}
      accessibilityHint="Opens the Reading tab"
      android_ripple={{ color: t.colors.state.ripple }}
      style={({ pressed }) => [glass, { minHeight: t.touch.min, padding: pad, overflow: 'hidden', transform: [{ scale: pressed ? 0.99 : 1 }] }]}
    >
      {row}
    </Pressable>
  );
}
