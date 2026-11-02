import { useRef, type ReactNode } from 'react';
import { Animated, Easing, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useReduceMotion } from '@/components/useReduceMotion';
import { useTheme } from '@/theme/ThemeProvider';

/** Press feedback for a routine row: settles to 0.98 and back (ease-out, 120ms). Reduced motion: no scale. */
export function RowPressable({ children, style, ...rest }: Omit<PressableProps, 'style' | 'children'> & { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const reduced = useReduceMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    reduced ? undefined : Animated.timing(scale, { toValue: v, duration: 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  return (
    <Pressable
      {...rest}
      accessibilityRole={rest.accessibilityRole ?? 'button'}
      accessibilityLabel={rest.accessibilityLabel}
      onPressIn={() => to(0.98)}
      onPressOut={() => to(1)}
      style={{ minHeight: t.touch.min }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
