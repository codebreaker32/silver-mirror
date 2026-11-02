import { useState, type ReactNode } from 'react';
import { Pressable, type AccessibilityRole, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { useReduceMotion } from './useReduceMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * The press for cards and tiles (tokens 2.4): flat at rest; while the finger is down the card scales to 0.98
 * over motion.duration.press (150ms, ease-out) and lifts with one soft neutral shadow, then settles back the
 * same way. Reduced motion: no scale, the lift alone. Layout never shifts (transform only).
 */
export interface PressableScaleProps {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  /** Scale while pressed; 0.98 for cards, 0.96 for small tiles. */
  scaleTo?: number;
  /** Lift with a soft shadow while pressed (default true). */
  lift?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: { selected?: boolean; disabled?: boolean };
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export function PressableScale({
  children,
  onPress,
  onLongPress,
  disabled,
  scaleTo = 0.98,
  lift = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  testID,
  style,
}: PressableScaleProps) {
  const t = useTheme();
  const reduced = useReduceMotion();
  const [down, setDown] = useState(false);
  const p = useSharedValue(0);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: reduced ? 1 : 1 - (1 - scaleTo) * p.value }] }));
  const to = (v: number) => {
    p.value = withTiming(v, { duration: t.motion.duration.press, easing: Easing.out(Easing.cubic) });
  };
  const elevated: ViewStyle | null =
    lift && down
      ? { shadowColor: t.colors.shadow, shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 5 }
      : null;

  return (
    <AnimatedPressable
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      onPressIn={() => {
        setDown(true);
        to(1);
      }}
      onPressOut={() => {
        setDown(false);
        to(0);
      }}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled, ...accessibilityState }}
      style={[style, elevated, anim]}
    >
      {children}
    </AnimatedPressable>
  );
}
