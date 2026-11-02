import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useReduceMotion } from '@/components/useReduceMotion';

/**
 * A section's one-time entrance: fades in and rises 8dp over 260ms (ease-out), delayed by `index` x 40ms so Home's
 * sections settle top to bottom. It runs once on mount (tab scenes keep their state, so not on every focus) and is
 * skipped entirely with reduced motion.
 */
export function FadeRise({ index = 0, style, children, testID }: { index?: number; style?: StyleProp<ViewStyle>; children: ReactNode; testID?: string }) {
  const reduced = useReduceMotion();
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(index * 40, withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) }));
  }, [index, v]);
  const anim = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ translateY: (1 - v.value) * 8 }] }));
  return (
    <Animated.View testID={testID} style={[style, reduced ? null : anim]}>
      {children}
    </Animated.View>
  );
}
