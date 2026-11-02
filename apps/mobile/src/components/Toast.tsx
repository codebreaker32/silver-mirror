import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useReduceMotion } from './useReduceMotion';

/**
 * Small confirmations ("Saved", "Removed from saved"). One toast at a time, a charcoal pill at the bottom
 * above the tab bar: rises 8dp and fades in over motion.duration.toast (180ms, ease-out), holds 1.8s, fades
 * out. Reduced motion: opacity only. Announced through a polite live region (Android) and
 * AccessibilityInfo.announceForAccessibility (iOS). Never carries an action; anything that needs one is a sheet.
 */
interface ToastApi {
  show: (message: string) => void;
}

const ToastContext = createContext<ToastApi>({ show: () => undefined });

export function useToast(): ToastApi {
  return useContext(ToastContext);
}

const HOLD_MS = 1800;
const RISE = 8;
// Tab bar height + its raised scan button (components/TabBar TAB_BAR), plus a breath of space.
const ABOVE_TAB_BAR = 64 + 26 + 12;

export function ToastProvider({ children }: { children: ReactNode }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReduceMotion();
  const [message, setMessage] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progress = useSharedValue(0);

  const show = useCallback((next: string) => {
    setMessage(next);
    setNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!message) return;
    const d = t.motion.duration.toast;
    progress.value = 0;
    progress.value = withTiming(1, { duration: d, easing: Easing.out(Easing.cubic) });
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      progress.value = withTiming(0, { duration: d, easing: Easing.inOut(Easing.cubic) });
      timer.current = setTimeout(() => setMessage(null), d + 20);
    }, HOLD_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // nonce re-runs the cycle when the same message is shown twice in a row
  }, [message, nonce, progress, t.motion.duration.toast]);

  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: reduced ? 0 : (1 - progress.value) * RISE }],
  }));

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + ABOVE_TAB_BAR, alignItems: 'center', zIndex: t.zIndex.snackbar }}
      >
        {message ? (
          <Animated.View
            testID="toast"
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={[
              {
                maxWidth: '88%',
                paddingHorizontal: t.space[5],
                paddingVertical: t.space[3],
                borderRadius: t.radius.full,
                backgroundColor: t.colors.inverseSurface,
                shadowColor: t.colors.shadow,
                shadowOpacity: 0.14,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
                elevation: 6,
              },
              animated,
            ]}
          >
            <Text {...t.textProps.button} style={[t.type.label, { color: t.colors.inverseText, textAlign: 'center' }]}>
              {message}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}
