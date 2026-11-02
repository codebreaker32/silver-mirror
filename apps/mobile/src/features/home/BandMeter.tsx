import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import type { Band } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { homeType } from '@/components/home/homeType';
import { useReduceMotion } from '@/components/useReduceMotion';

/** Segments filled per band: Low fills one of three, Medium two, High three. Never a figure. */
export const BAND_SEGMENTS: Record<Band, 1 | 2 | 3> = { Low: 1, Medium: 2, High: 3 };

const SEG = 22;

/** One lit segment: an ink fill that grows from the left edge of its well in 300ms (ease-out) after `delay`. */
function Fill({ delay, animate, color }: { delay: number; animate: boolean; color: string }) {
  const reduced = useReduceMotion();
  const v = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    if (!animate || reduced) {
      v.value = 1;
      return;
    }
    v.value = withDelay(delay, withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }));
  }, [animate, reduced, delay, v]);
  const style = useAnimatedStyle(() => ({ width: SEG * v.value }));
  return <Animated.View style={[{ position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3, backgroundColor: color }, style]} />;
}

/**
 * One reading row: the band name, a three-segment bar (filled segments in ink, the rest in the well tone) and the band
 * word. The word always carries the reading; the bar only repeats it. With `animateIndex` the lit segments fill from
 * zero on first display (300ms each, rows 60ms apart); reduced motion shows them filled. The row is hidden from
 * TalkBack unless `accessibilityLabel` is given (Home reads it through the parent card).
 */
export function BandMeter({
  label,
  level,
  animateIndex,
  testID,
  accessibilityLabel,
}: {
  label: string;
  level: Band;
  animateIndex?: number;
  testID?: string;
  accessibilityLabel?: string;
}) {
  const t = useTheme();
  const lit = BAND_SEGMENTS[level];
  const animate = animateIndex !== undefined;
  return (
    <View
      testID={testID ?? `band-${label.toLowerCase()}`}
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
      style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[3], minHeight: 24 }}
    >
      <Text numberOfLines={1} style={[homeType.body, { flex: 1, color: t.colors.text }]}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: SEG, height: 6, borderRadius: 3, backgroundColor: t.colors.bgSunken, overflow: 'hidden' }}>
            {i < lit ? <Fill animate={animate} delay={(animateIndex ?? 0) * 60 + i * 80} color={t.colors.text} /> : null}
          </View>
        ))}
      </View>
      <Text numberOfLines={1} style={[homeType.bodyStrong, { width: 64, textAlign: 'right', color: t.colors.text }]}>
        {level}
      </Text>
    </View>
  );
}
