import type { ReactNode } from 'react';
import { View } from 'react-native';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Card } from './Card';
import { Icon, type IconName } from './Icon';
import { IconDisc } from './IconButton';
import { Txt } from './Text';

export interface SkinTypeCardProps {
  /** compact = Home (white raised card, 56dp disc, trailing arrow); hero = Reading / Result (gradient, 72dp disc). */
  size?: 'compact' | 'hero';
  /** The value, e.g. "Combination". With `quiet`, a sentence such as "Scan once, about a minute". */
  value: string;
  /** Small muted line above the value. Defaults to COPY.reading.skinType ("Your skin type"). */
  label?: string;
  /** Compact: caption under the value ("Scan 1 Nov · photo deleted", "Demo reading · sample, not a scan"). */
  caption?: string;
  /** Hero: one plain cosmetic line under the value (passed in; the card computes nothing). */
  line?: string;
  /** Disc icon; defaults to droplet (the empty state uses face-frame). */
  icon?: IconName;
  /** Set the value in bodyStrong instead of type.value (the empty "No reading yet" card). */
  quiet?: boolean;
  /** Compact only: makes the card one target with a trailing arrow. Ignored when `children` are given. */
  onPress?: () => void;
  /** One label read in visual order, e.g. "Your skin type, Combination, scanned 1 November. Open your reading". */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Actions inside the card under the row (the empty state's Start scan / Use the Demo reading). */
  children?: ReactNode;
  testID?: string;
}

/**
 * Skin-type card (component.readingCard, showcase 02_home "Your Skin Type / Combination ->" and 04_report hero).
 * compact: raised white card, padding 20, ≥96dp: 56dp lavender disc, label (14/20 muted) over the value (Geist 600
 * 24/30), an optional caption, trailing 24dp arrow-right when pressable. hero: the skin gradient, padding 24, a 72dp
 * disc on a white-glass fill (lavender-700 in dark), the label in text (not muted), the value in type.valueHero
 * (Geist 600 26/32) so it dominates as in 04_report, one cosmetic 14/20 muted line, no arrow. Radius 20 (compact) and
 * 2.3: both sizes use the one surface radius (16) on the flat surface tone; no gradient.
 */
export function SkinTypeCard({
  size = 'compact',
  value,
  label = COPY.reading.skinType,
  caption,
  line,
  icon = 'droplet',
  quiet = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  children,
  testID,
}: SkinTypeCardProps) {
  const t = useTheme();
  const rc = t.components.readingCard;
  const hero = size === 'hero';
  const pressable = !hero && !children && onPress ? onPress : undefined;
  const a11y = accessibilityLabel ?? [label, value, hero ? line : caption].filter(Boolean).join(', ');
  const row = (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: hero ? t.space[5] : t.space[4] }}
      accessible={children ? true : undefined}
      accessibilityLabel={children ? a11y : undefined}
    >
      {hero ? <IconDisc icon={icon} size="xl" bg={rc.heroDiscBg} /> : <IconDisc icon={icon} size="lg" />}
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="bodySm" style={[rc.label, { color: hero ? rc.heroLabelColor : rc.labelColor }]}>
          {label}
        </Txt>
        <Txt variant={quiet ? 'bodyStrong' : hero ? 'valueHero' : 'value'} style={{ color: rc.valueColor }}>
          {value}
        </Txt>
        {hero && line ? (
          <Txt variant="bodySm" tone="muted" style={{ marginTop: t.space[1], fontSize: 14, lineHeight: 20 }}>
            {line}
          </Txt>
        ) : null}
        {!hero && caption ? (
          <Txt variant="caption" style={[rc.meta, { color: rc.metaColor }]}>
            {caption}
          </Txt>
        ) : null}
      </View>
      {pressable ? <Icon name="arrow-right" size={t.icon.lg} color={rc.arrow} /> : null}
    </View>
  );
  return (
    <Card
      testID={testID}
      variant="raised"
      padding={hero ? rc.heroPadding : rc.padding}
      radius={t.radius.lg}
      gap={t.space[4]}
      onPress={pressable}
      accessibilityLabel={children ? undefined : a11y}
      accessibilityHint={accessibilityHint}
      style={{ minHeight: rc.minHeight, justifyContent: 'center' }}
    >
      {row}
      {children ? <View style={{ gap: t.space[3] }}>{children}</View> : null}
    </Card>
  );
}
