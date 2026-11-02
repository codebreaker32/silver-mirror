import { useEffect } from 'react';
import { View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { useReduceMotion } from './useReduceMotion';

/**
 * A placeholder block in the well tone while content loads. A calm opacity pulse (1 -> 0.55 -> 1 over
 * motion.duration.pulse, 1.2s, ease-in-out), no shimmer sweep; it is static under reduced motion and only
 * lives as long as the load does. Hidden from screen readers: the screen announces its own busy state.
 */
export interface SkeletonProps {
  width?: DimensionValue;
  height: number;
  /** Corner radius; defaults to radius.md (12, thumbnails). Pass t.radius.full for text lines and pills. */
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height, radius, style }: SkeletonProps) {
  const t = useTheme();
  const reduced = useReduceMotion();
  const o = useSharedValue(1);

  useEffect(() => {
    if (reduced) {
      cancelAnimation(o);
      o.value = 1;
      return;
    }
    o.value = withRepeat(withTiming(0.55, { duration: t.motion.duration.pulse / 2, easing: Easing.inOut(Easing.quad) }), -1, true);
    return () => cancelAnimation(o);
  }, [reduced, o, t.motion.duration.pulse]);

  const anim = useAnimatedStyle(() => ({ opacity: o.value }));

  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={style}>
      <Animated.View style={[{ width, height, borderRadius: radius ?? t.radius.md, backgroundColor: t.colors.bgSunken }, anim]} />
    </View>
  );
}
