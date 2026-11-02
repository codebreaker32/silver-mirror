import { useEffect } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { useSaved } from '@/features/saved';
import { useToast } from './Toast';
import { haptic } from './haptics';
import { useReduceMotion } from './useReduceMotion';

const HEART = 'M12 20.4s-7.6-4.6-7.6-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.6 2.6c0 5.6-7.6 10.2-7.6 10.2Z';

interface SaveHeartProps {
  productId: string;
  /** Glyph size in dp (default 20). The touch target is always at least 44dp. */
  size?: number;
  /** Read out with the state: "Save The Ordinary Niacinamide". */
  productName?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Save on this phone. A drawn heart: outline when not saved, ink fill when saved. On toggle the glyph dips to 0.86 and
 * settles back to 1 in 180ms (ease-out, no overshoot); reduced motion swaps the fill only. Confirms with a toast.
 */
export function SaveHeart({ productId, size = 20, productName, style }: SaveHeartProps) {
  const t = useTheme();
  const { isSaved, toggle } = useSaved();
  const toast = useToast();
  const reduced = useReduceMotion();
  const on = isSaved(productId);
  const scale = useSharedValue(1);
  const fill = useSharedValue(on ? 1 : 0);

  useEffect(() => {
    fill.value = reduced ? (on ? 1 : 0) : withTiming(on ? 1 : 0, { duration: 160, easing: Easing.out(Easing.cubic) });
  }, [on, reduced, fill]);

  const glyph = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const solid = useAnimatedStyle(() => ({ opacity: fill.value }));

  const press = () => {
    const now = toggle(productId);
    haptic(now ? 'toggleOn' : 'toggleOff');
    if (!reduced) {
      scale.value = withSequence(
        withTiming(0.86, { duration: 70, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) }),
      );
    }
    toast.show(now ? 'Saved on this phone' : 'Removed');
  };

  const ink = t.colors.text;
  return (
    <Pressable
      onPress={press}
      hitSlop={8}
      testID={`save-heart-${productId}`}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      accessibilityLabel={`${on ? 'Remove' : 'Save'}${productName ? ` ${productName}` : ''}${on ? ' from saved' : ' on this phone'}`}
      style={[{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      <Animated.View style={[{ width: size, height: size }, glyph]}>
        <Svg width={size} height={size} viewBox="0 0 24 24" style={{ position: 'absolute' }}>
          <Path d={HEART} fill="none" stroke={ink} strokeWidth={1.6} strokeLinejoin="round" />
        </Svg>
        <Animated.View style={[{ position: 'absolute', width: size, height: size }, solid]}>
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path d={HEART} fill={ink} stroke={ink} strokeWidth={1.6} strokeLinejoin="round" />
          </Svg>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
