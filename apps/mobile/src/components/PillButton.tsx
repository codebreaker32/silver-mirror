import { Children, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName, type LegacyIconName } from './Icon';

/**
 * primary: the one slate pill per screen state (pearl in dark), 56dp (showcase); pass trailingIcon="arrow-right"
 * when it moves forward ("Get started", "Start scan", "Check a product").
 * secondary: tonal mist pill, 52dp, no outline. tertiary: text + optional chevron in a 48dp box.
 * translucent: welcome only, a white-glass pill with a light edge over the liquid backdrop (sheen edge in dark).
 * destructiveNeutral: text pill with a leading trash icon, never red; always followed by a confirm sheet.
 * consentPair: two identical tonal pills with a 1dp strong edge (Start scan / Not now at equal weight).
 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructiveNeutral' | 'consentPair' | 'translucent';

export interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  busy?: boolean;
  /** Replaces the label while busy, e.g. "Checking…". */
  busyLabel?: string;
  leadingIcon?: IconName | LegacyIconName;
  trailingIcon?: IconName | LegacyIconName;
  /** @deprecated Old scan-kit name for leadingIcon. */
  icon?: IconName | LegacyIconName;
  /** Where the tap goes, shown as a caption under the button and read with the label (store searches). */
  destination?: string;
  /** Stretch to the container width (default for primary / secondary / consentPair inside a column). */
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export function PillButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  busy = false,
  busyLabel,
  leadingIcon,
  trailingIcon,
  icon,
  destination,
  fullWidth,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}: PillButtonProps) {
  const t = useTheme();
  const b = t.components.button;
  const v = b[variant];
  const inactive = disabled || busy;
  const lead = leadingIcon ?? icon ?? (variant === 'destructiveNeutral' ? (b.destructiveNeutral.leadingIcon as IconName) : undefined);

  const fg = disabled ? (variant === 'primary' ? b.primary.fgDisabled : t.colors.disabledFg) : v.fg;
  const bg = disabled && variant === 'primary' ? b.primary.bgDisabled : v.bg;
  const borderWidth = 'borderWidth' in v ? v.borderWidth : 0;
  const borderColor = 'border' in v ? (disabled && 'borderDisabled' in v ? v.borderDisabled : v.border) : 'transparent';
  const a11y = accessibilityLabel ?? [busy && busyLabel ? busyLabel : label, destination].filter(Boolean).join('. ');
  const stretch = fullWidth ?? (variant !== 'tertiary' && variant !== 'destructiveNeutral');
  // A leading text action (tertiary, left-aligned) pulls its 48dp box left so the label sits on the content edge.
  const flat = StyleSheet.flatten(style) ?? {};
  const hang = variant === 'tertiary' && !stretch && flat.alignSelf !== 'center' && flat.alignSelf !== 'flex-end' ? -v.paddingX : 0;

  return (
    <View style={[{ gap: t.space[2], alignSelf: stretch ? 'stretch' : 'flex-start', marginLeft: hang }, style]}>
      <Pressable
        testID={testID}
        onPress={onPress}
        disabled={inactive}
        accessibilityRole="button"
        accessibilityLabel={a11y}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: inactive, busy }}
        android_ripple={{ color: variant === 'primary' ? b.primary.ripple : t.colors.state.ripple, borderless: false }}
        style={({ pressed }) => ({
          minHeight: Math.max(v.minHeight, t.touch.min),
          paddingHorizontal: v.paddingX,
          borderRadius: v.radius,
          borderWidth,
          borderColor,
          backgroundColor: pressed && !inactive ? v.bgPressed : bg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: b.primary.gap,
          overflow: 'hidden',
          transform: [{ scale: pressed && !inactive ? 0.98 : 1 }],
        })}
      >
        {({ pressed }) => {
          const color = variant === 'tertiary' && pressed && !inactive ? b.tertiary.fgPressed : fg;
          return (
            <>
              {lead ? <Icon name={lead} size={t.icon.md} color={color} /> : null}
              <Text {...t.textProps.button} style={[v.type, { color, textAlign: 'center', flexShrink: 1 }]}>
                {busy && busyLabel ? busyLabel : label}
              </Text>
              {trailingIcon ? <Icon name={trailingIcon} size={t.icon.md} color={color} /> : null}
            </>
          );
        }}
      </Pressable>
      {destination ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.space[1] }} importantForAccessibility="no-hide-descendants">
          <Icon name="search" size={t.icon.sm} color={t.components.storeLinkOut.destinationColor} />
          <Text {...t.textProps.caption} style={[t.components.storeLinkOut.destination, { color: t.components.storeLinkOut.destinationColor, flexShrink: 1 }]}>
            {destination}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** Two pills side by side at 1×, stacked from button.stackAtFontScale (1.3×). Children get equal width. */
export function ButtonPair({ children }: { children: ReactNode }) {
  const t = useTheme();
  const { fontScale } = useWindowDimensions();
  const stack = fontScale >= t.components.button.stackAtFontScale;
  const items = Children.toArray(children);
  return (
    <View style={{ flexDirection: stack ? 'column' : 'row', gap: t.space[3] }}>
      {items.map((child, i) => (
        <View key={i} style={stack ? undefined : { flex: 1 }}>
          {child}
        </View>
      ))}
    </View>
  );
}
