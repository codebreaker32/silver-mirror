import { COPY, type KeyProfile } from '@skinkey/contracts';
import { deriveSkinType } from '@skinkey/rules';
import { shortDate } from '@/features/check/format';
import { PillButton, SkinTypeCard } from '@/components';

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
 * Home skin-type card (SkinTypeCard compact, DESIGN.md §9.2 item 3, showcase 02_home "Your Skin Type / Combination ->"):
 * droplet disc, "Your skin type" over the value, the scan stamp, a trailing arrow; one target, one label in visual
 * order. The band meters live on the Reading tab. Empty: a face-frame disc, "No reading yet", "Scan once, about a
 * minute", then slate Start scan and tonal Use the Demo reading inside the same card.
 */
export function KeyChip({ keyProfile, isDemo, onPress, onUseDemo }: ReadingCardProps) {
  const { title, value, sub } = keyChipText(keyProfile, isDemo);

  if (!keyProfile) {
    return (
      <SkinTypeCard testID="key-chip" icon="face-frame" label={title} value={value} quiet accessibilityLabel={`${title}. ${value}`}>
        <PillButton label="Start scan" trailingIcon="arrow-right" onPress={onPress} testID="home-start-scan" />
        {onUseDemo ? <PillButton label={COPY.reading.useDemo} variant="secondary" onPress={onUseDemo} testID="home-use-demo" /> : null}
      </SkinTypeCard>
    );
  }

  const selfReported = Object.values(keyProfile.bands).some((b) => b.selfReported);
  return (
    <SkinTypeCard
      testID="key-chip"
      label={title}
      value={value}
      caption={sub}
      onPress={onPress}
      accessibilityLabel={[`${title}, ${value}`, sub, selfReported ? `Some readings ${COPY.selfReported}` : null, 'Open your reading'].filter(Boolean).join('. ')}
      accessibilityHint="Opens the Reading tab"
    />
  );
}
