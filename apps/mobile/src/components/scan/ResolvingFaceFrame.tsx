import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { FaceFrame } from '@/brand';
import { useTheme } from '@/theme/ThemeProvider';
import { useReduceMotion } from '../useReduceMotion';

/**
 * The one authored moment (motion.bracketResolve): the face-frame brackets close in a step each time a scan step
 * finishes, on the glide ease, and rest closed after "Deleted from YouCam". Reduce motion = jump to the end state.
 */
export function ResolvingFaceFrame({ width, progress, tile = true }: { width: number; progress: number; /** Off when the frame sits on its own sheen plate. */ tile?: boolean }) {
  const t = useTheme();
  const reduced = useReduceMotion();
  const target = Math.min(1, Math.max(0, progress));
  const value = useRef(new Animated.Value(target)).current;
  const [shown, setShown] = useState(target);

  useEffect(() => {
    const id = value.addListener(({ value: v }) => setShown(v));
    return () => value.removeListener(id);
  }, [value]);

  useEffect(() => {
    if (reduced) {
      value.setValue(target);
      return;
    }
    const anim = Animated.timing(value, {
      toValue: target,
      duration: t.motion.duration.bracketResolve,
      easing: Easing.bezier(...t.motion.ease.glide),
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [target, reduced, value, t]);

  return <FaceFrame width={width} progress={shown} tile={tile} />;
}
