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

/**
 * Lavender disc holding one line icon (component.iconDisc, showcase droplet circle): 48dp with a 24dp icon by default,
 * 56dp with `large` or size="lg", 72dp with a 28dp icon at size="xl" (the hero skin-type card). Decorative.
 */
export function IconDisc({
  icon,
  large = false,
  size,
  bg,
  color,
}: {
  icon: IconName | LegacyIconName;
  large?: boolean;
  size?: 'md' | 'lg' | 'xl';
  bg?: string;
  color?: string;
}) {
  const t = useTheme();
  const d = t.components.iconDisc;
  const key = size ?? (large ? 'lg' : 'md');
  const px = key === 'xl' ? d.sizeXl : key === 'lg' ? d.sizeLg : d.size;
  const icon_ = key === 'xl' ? d.iconSizeXl : key === 'lg' ? d.iconSizeLg : d.iconSize;
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{ width: px, height: px, borderRadius: d.radius, backgroundColor: bg ?? d.bg, alignItems: 'center', justifyContent: 'center' }}
    >
      <Icon name={icon} size={icon_} color={color ?? d.fg} />
    </View>
  );
}
