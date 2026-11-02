import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName, type LegacyIconName } from './Icon';

interface IconButtonProps {
  icon: IconName | LegacyIconName;
  /** Required: icon-only controls must say what they do ("Back", "Settings", "More store searches"). */
  accessibilityLabel: string;
  onPress: () => void;
  /** plain = transparent (app bar); tonal = round secondary-bg disc (dock "More"); overlay = on the live camera. */
  variant?: 'plain' | 'tonal' | 'overlay';
  disabled?: boolean;
  accessibilityHint?: string;
  color?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/** 48dp round icon button (component.iconButton). */
export function IconButton({ icon, accessibilityLabel, onPress, variant = 'plain', disabled = false, accessibilityHint, color, testID, style }: IconButtonProps) {
  const t = useTheme();
  const ib = t.components.iconButton;
  const bg = variant === 'tonal' ? ib.bgTonal : variant === 'overlay' ? t.components.captureGuide.iconButtonBg : ib.bg;
  const fg = disabled ? ib.fgDisabled : (color ?? (variant === 'overlay' ? t.colors.onOverlay : ib.fg));
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      android_ripple={{ color: ib.ripple, borderless: true, radius: ib.target / 2 }}
      style={({ pressed }) => [
        {
          width: ib.target,
          height: ib.target,
          borderRadius: ib.radius,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: pressed && !disabled ? (variant === 'tonal' ? t.components.button.secondary.bgPressed : ib.bgPressed) : bg,
        },
        style,
      ]}
    >
      <Icon name={icon} size={ib.iconSize} color={fg} />
    </Pressable>
  );
}

/** Lavender disc holding one line icon (component.iconDisc): 40dp / 20dp, or 56dp / 24dp with `large`. Decorative. */
export function IconDisc({ icon, large = false, bg, color }: { icon: IconName | LegacyIconName; large?: boolean; bg?: string; color?: string }) {
  const t = useTheme();
  const d = t.components.iconDisc;
  const size = large ? d.sizeLg : d.size;
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{ width: size, height: size, borderRadius: d.radius, backgroundColor: bg ?? d.bg, alignItems: 'center', justifyContent: 'center' }}
    >
      <Icon name={icon} size={large ? d.iconSizeLg : d.iconSize} color={color ?? d.fg} />
    </View>
  );
}
