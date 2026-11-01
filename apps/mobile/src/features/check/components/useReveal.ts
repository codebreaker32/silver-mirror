import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

/** Ink settling: opacity + 0.98→1 scale, or a plain crossfade under reduce motion (components.md §1.5). */
export function useReveal(trigger: unknown, delayMs = 0) {
  const t = useTheme();
  const [reduced, setReduced] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => alive && setReduced(v))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    progress.setValue(0);
    const [x1, y1, x2, y2] = t.motion.ease.standard;
    Animated.timing(progress, {
      toValue: 1,
      duration: reduced ? t.motion.reduced.duration : t.motion.duration.verdictReveal,
      delay: reduced ? 0 : delayMs,
      easing: Easing.bezier(x1, y1, x2, y2),
      useNativeDriver: true,
    }).start();
  }, [trigger, reduced, delayMs, progress, t]);

  const scaleFrom = reduced ? t.motion.reduced.scaleFrom : 0.98;
  return {
    opacity: progress,
    transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [scaleFrom, 1] }) }],
  };
}
