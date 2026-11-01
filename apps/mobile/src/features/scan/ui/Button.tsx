import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructiveNeutral' | 'consentPair';

interface Props {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  busyLabel?: string;
  busy?: boolean;
  icon?: IconName;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', disabled, busy, busyLabel, icon, accessibilityLabel, accessibilityHint, style }: Props) {
  const theme = useTheme();
  const b = theme.components.button;
  const c = theme.colors;
  const inactive = Boolean(disabled || busy);

  const look = (() => {
    switch (variant) {
      case 'primary':
        return {
          bg: inactive ? b.primary.bgDisabled : b.primary.bg,
          pressed: b.primary.bgPressed,
          fg: inactive ? b.primary.fgDisabled : b.primary.fg,
          border: undefined,
          borderWidth: 0,
          minHeight: b.primary.minHeight,
          paddingX: b.primary.paddingX,
          radius: b.primary.radius,
        };
      case 'secondary':
        return {
          bg: b.secondary.bg,
          pressed: b.secondary.bgPressed,
          fg: inactive ? b.secondary.fgDisabled : b.secondary.fg,
          border: inactive ? b.secondary.borderDisabled : b.secondary.border,
          borderWidth: b.secondary.borderWidth,
          minHeight: b.secondary.minHeight,
          paddingX: b.secondary.paddingX,
          radius: b.secondary.radius,
        };
      case 'tertiary':
        return {
          bg: b.tertiary.bg,
          pressed: b.tertiary.bgPressed,
          fg: inactive ? c.disabledFg : b.tertiary.fg,
          border: undefined,
          borderWidth: 0,
          minHeight: b.tertiary.minHeight,
          paddingX: b.tertiary.paddingX,
          radius: b.tertiary.radius,
        };
      case 'destructiveNeutral':
        return {
          bg: c.surface,
          pressed: b.destructiveNeutral.bgPressed,
          fg: inactive ? c.disabledFg : b.destructiveNeutral.fg,
          border: inactive ? c.border : b.destructiveNeutral.border,
          borderWidth: b.destructiveNeutral.borderWidth,
          minHeight: b.destructiveNeutral.minHeight,
          paddingX: b.destructiveNeutral.paddingX,
          radius: b.destructiveNeutral.radius,
        };
      case 'consentPair':
        return {
          bg: inactive ? c.disabledBg : c.surfaceRaised,
          pressed: c.state.pressed,
          fg: inactive ? c.disabledFg : c.text,
          border: inactive ? c.border : c.borderStrong,
          borderWidth: b.secondary.borderWidth,
          minHeight: b.primary.minHeight,
          paddingX: b.primary.paddingX,
          radius: b.primary.radius,
        };
    }
  })();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: Boolean(busy) }}
      disabled={inactive}
      onPress={onPress}
      android_ripple={{ color: c.state.ripple, borderless: false }}
      style={({ pressed }) => [
        {
          minHeight: look.minHeight,
          paddingHorizontal: look.paddingX,
          borderRadius: look.radius,
          backgroundColor: pressed && !inactive ? look.pressed : look.bg,
          borderColor: look.border,
          borderWidth: look.borderWidth,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transform: [{ scale: pressed && !inactive ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
        {icon ? <Icon name={icon} color={look.fg} size={theme.icon.md} /> : null}
        <Text style={[b.primary.type, { color: look.fg, textAlign: 'center' }]}>{busy && busyLabel ? busyLabel : label}</Text>
      </View>
    </Pressable>
  );
}

export function TextLink({ label, onPress, accessibilityLabel, external }: { label: string; onPress: () => void; accessibilityLabel?: string; external?: boolean }) {
  const theme = useTheme();
  const t = theme.components.textLink;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      hitSlop={(theme.touch.min - 32) / 2}
      style={{ minHeight: t.minTarget, justifyContent: 'center', alignSelf: 'flex-start' }}
    >
      {({ pressed }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[1] }}>
          <Text
            style={[
              theme.type.label,
              { color: pressed ? t.fgPressed : t.fg, textDecorationLine: 'underline', textDecorationColor: pressed ? t.fgPressed : t.fg },
            ]}
          >
            {label}
          </Text>
          {external ? <Icon name="arrowUpRight" size={theme.icon.sm} color={t.fg} /> : null}
        </View>
      )}
    </Pressable>
  );
}
