import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { Verdict } from '@skinkey/design';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, VerdictIcon, type IconName, type LegacyIconName } from './Icon';

interface ChipProps {
  label: string;
  /** Interactive (filter) chip when given; a static reading chip otherwise. */
  onPress?: () => void;
  selected?: boolean;
  /** Leading line icon; selected chips show the check instead. */
  icon?: IconName | LegacyIconName;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  /**
   * Fill: 'tonal' (default) is the well-tone pill (#E1E3E8); 'glass' (legacy name) is the surface tone (#F8F8FA), one
   * step up from the page, for action chips that sit straight on the page (the /check store searches). No border.
   */
  fill?: 'tonal' | 'glass';
}

/**
 * Pill chip (component.chip, tokens 2.3): the well-tone pill, 36dp visual in a 48dp target, label 13 semibold at normal
 * tracking, no border. Selected = graphite fill + check + weight, so the state never rests on colour alone. Static
 * chips are read with their card.
 */
export function Chip({ label, onPress, selected = false, icon, disabled = false, accessibilityLabel, testID, fill = 'tonal' }: ChipProps) {
  const t = useTheme();
  const c = t.components.chip;
  const fg = disabled ? t.colors.disabledFg : selected ? c.selectedFg : c.fg;
  const lead: IconName | LegacyIconName | undefined = selected ? (c.selectedIcon as IconName) : icon;
  const glass = fill === 'glass' && !selected;
  const rest = glass ? t.colors.surface : c.bg;
  const down = glass ? t.colors.secondaryBgPressed : t.colors.state.pressed;
  const pill = (pressed: boolean) => (
    <View
      testID={testID ? `${testID}-pill` : undefined}
      style={{
        minHeight: c.visualMinHeight,
        paddingHorizontal: c.paddingX,
        borderRadius: c.radius,
        backgroundColor: selected ? c.selectedBg : pressed ? down : rest,
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[1] + 2,
      }}
    >
      {lead ? <Icon name={lead} size={t.icon.sm} color={fg} strokeWidth={selected ? 2 : t.icon.stroke} /> : null}
      <Text {...t.textProps.label} style={[c.type, { color: fg }]}>
        {label}
      </Text>
    </View>
  );
  if (!onPress) {
    return (
      <View testID={testID} accessible accessibilityLabel={accessibilityLabel ?? label} style={{ alignSelf: 'flex-start' }}>
        {pill(false)}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected, disabled }}
      style={{ minHeight: c.target, justifyContent: 'center', alignSelf: 'flex-start' }}
    >
      {({ pressed }) => pill(pressed)}
    </Pressable>
  );
}

/**
 * One horizontal row of chips that scrolls sideways (showcase 06_discover): bleeds to the screen edge and uses the
 * gutter as its content inset, so the first chip lines up with the content and the last one peeks. No wrap.
 */
export function ChipRail({ children, accessibilityLabel, testID }: { children: ReactNode; accessibilityLabel?: string; testID?: string }) {
  const t = useTheme();
  const g = t.spacing.gutter;
  return (
    <ScrollView
      horizontal
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -g, flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: g, columnGap: t.components.chip.gap, alignItems: 'center' }}
    >
      {children}
    </ScrollView>
  );
}

/** Wrapping row of chips with the chip gap. */
export function ChipRow({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: t.components.chip.gap, rowGap: t.space[1] }}>{children}</View>;
}

const TAG_TYPE = { fontFamily: 'Geist_600SemiBold', fontSize: 13, lineHeight: 18, letterSpacing: 0 } as const;

type TagVariant = 'neutral' | 'outline' | 'demo' | { verdict: Verdict };

/**
 * Small 24dp tag (component.tag): neutral well fill, outline (self-reported, flagged), demo (well-tone Demo reading chip)
 * or a verdict tag (icon + label in the verdict colours). Not interactive.
 */
export function Tag({ label, variant = 'neutral', icon, accessibilityLabel }: { label: string; variant?: TagVariant; icon?: IconName | LegacyIconName; accessibilityLabel?: string }) {
  const t = useTheme();
  const tag = t.components.tag;
  const tone = typeof variant === 'object' ? variant.verdict : null;
  const v = tone ? t.colors.verdict[tone] : null;
  // Demo reading: a small well-tone chip.
  const demo = variant === 'demo' ? { bg: t.colors.iconDisc, fg: t.colors.onIconDisc } : null;
  // Verdict tags are the same light grey pill as every other chip (2.1 round 1); the verdict glyph in its own ink
  // carries the state, the label stays in text colour.
  const fg = demo ? demo.fg : tag.fg;
  return (
    <View
      accessible={accessibilityLabel ? true : undefined}
      accessibilityLabel={accessibilityLabel}
      style={{
        minHeight: tag.visualMinHeight,
        paddingHorizontal: tag.paddingX - 2,
        borderRadius: tag.radius,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[1],
        backgroundColor: demo ? demo.bg : variant === 'outline' ? 'transparent' : tone ? t.components.chip.bg : tag.bg,
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: tag.outlineBorder,
      }}
    >
      {tone ? <VerdictIcon tone={tone} size={tag.iconSize} color={v?.icon} /> : icon ? <Icon name={icon} size={tag.iconSize} color={fg} /> : null}
      <Text {...t.textProps.labelSm} style={[tag.type, TAG_TYPE, { color: fg }]}>
        {label}
      </Text>
    </View>
  );
}

/** @deprecated Scan-kit consent chip; prefer the checklist rows in the "What stays on this phone" card. */
export function KeepChip({ label }: { label: string }) {
  return <Chip label={label} />;
}
