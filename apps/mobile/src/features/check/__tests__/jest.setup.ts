import { jest } from '@jest/globals';
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('expo-haptics', () => ({
  performAndroidHapticsAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  AndroidHaptics: { Context_Click: 'context-click' },
}));
// Reanimated 4 needs the native worklets runtime, which jest lacks; the kit (TabBar, FadeRise) imports it, so tests get a
// small stand-in: shared values are plain boxes, animated styles are computed once, timings land instantly.
jest.mock('react-native-reanimated', () => {
  const RN = require('react-native');
  const id = (v: unknown) => v;
  const Animated = {
    View: RN.View,
    Text: RN.Text,
    ScrollView: RN.ScrollView,
    Image: RN.Image,
    createAnimatedComponent: id,
  };
  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    Easing: RN.Easing,
    useSharedValue: (v: unknown) => ({ value: v }),
    useAnimatedStyle: (fn: () => unknown) => fn(),
    useAnimatedProps: (fn: () => unknown) => fn(),
    useDerivedValue: (fn: () => unknown) => ({ value: fn() }),
    useReducedMotion: () => false,
    withTiming: id,
    withDelay: (_d: number, v: unknown) => v,
    withSequence: (...v: unknown[]) => v[v.length - 1],
    withSpring: id,
    interpolate: (_x: number, _i: number[], o: number[]) => o[o.length - 1],
    interpolateColor: (_x: number, _i: number[], o: string[]) => o[o.length - 1],
    runOnJS: (fn: unknown) => fn,
    cancelAnimation: () => undefined,
    FadeIn: { duration: () => ({}) },
    FadeOut: { duration: () => ({}) },
    ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
  };
});
