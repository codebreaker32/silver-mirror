import { Pressable, Text, View, type AccessibilityProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructiveNeutral';

interface ButtonProps extends Pick<AccessibilityProps, 'accessibilityHint'> {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  busy?: boolean;
  busyLabel?: string;
  /** Shown under the button before the tap (components.md §14). */
  destination?: string;
  trailingIcon?: IconName;
  leadingIcon?: IconName;
  accessibilityLabel?: string;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  busy = false,
  busyLabel,
  destination,
  trailingIcon,
  leadingIcon,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const t = useTheme();
  const v = t.components.button[variant];
  const off = disabled || busy;
  const fg = disabled
    ? variant === 'primary'
      ? t.components.button.primary.fgDisabled
      : t.colors.disabledFg
    : v.fg;
  const border = 'border' in v ? (disabled && 'borderDisabled' in v ? v.borderDisabled : v.border) : 'transparent';
  const borderWidth = 'borderWidth' in v ? v.borderWidth : 0;
  const a11y = accessibilityLabel ?? [label, destination].filter(Boolean).join('. ');

  return (
    <View style={{ gap: t.space[2] }}>
      <Pressable
        testID={testID}
        onPress={onPress}
        disabled={off}
        accessibilityRole="button"
        accessibilityLabel={a11y}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: off, busy }}
        android_ripple={{ color: variant === 'primary' ? t.colors.state.rippleOnAccent : t.colors.state.ripple }}
        style={({ pressed }) => ({
          minHeight: Math.max(v.minHeight, t.touch.min),
          paddingHorizontal: v.paddingX,
          borderRadius: v.radius,
          borderWidth,
          borderColor: border,
          backgroundColor:
            disabled && variant === 'primary'
              ? t.components.button.primary.bgDisabled
              : pressed
                ? v.bgPressed
                : v.bg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: t.space[2],
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        {leadingIcon ? <Icon name={leadingIcon} size={t.icon.md} color={fg} /> : null}
        <Text style={[v.type, { color: fg, textAlign: 'center', flexShrink: 1 }]}>{busy && busyLabel ? busyLabel : label}</Text>
        {trailingIcon ? <Icon name={trailingIcon} size={t.icon.md} color={fg} /> : null}
      </Pressable>
      {destination ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.space[1] }} importantForAccessibility="no-hide-descendants">
          <Icon name="search" size={t.icon.sm} color={t.components.storeLinkOut.destinationColor} />
          <Text style={[t.components.storeLinkOut.destination, { color: t.components.storeLinkOut.destinationColor, flexShrink: 1 }]}>
            {destination}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
