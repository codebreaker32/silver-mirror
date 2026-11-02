import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { IconButton } from './IconButton';
import { Txt } from './Text';
import { useReduceMotion } from './useReduceMotion';

export interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Pinned under the scrolling body: one primary pill + an optional tonal one. */
  actions?: ReactNode;
  /** One muted line under the title. */
  supporting?: string;
  testID?: string;
}

/**
 * Modal bottom sheet (component.bottomSheet): radius 28 top corners, 36×4 handle in a 48dp row, Close always,
 * scrim colors.overlay. Back, the scrim and Close all dismiss it.
 * Motion (tokens 2.4): rises from the bottom over motion.duration.sheetEnter (280ms, ease-out) while the scrim
 * dims in; leaves over sheetExit (220ms, ease-in-out). Reduced motion: both crossfade, no travel.
 */
export function Sheet({ visible, title, onClose, children, actions, supporting, testID }: SheetProps) {
  const t = useTheme();
  const s = t.components.bottomSheet;
  const insets = useSafeAreaInsets();
  const reduced = useReduceMotion();
  const { height: screenH } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const p = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      p.value = withTiming(1, { duration: t.motion.duration.sheetEnter, easing: Easing.out(Easing.cubic) });
    } else {
      p.value = withTiming(0, { duration: t.motion.duration.sheetExit, easing: Easing.inOut(Easing.cubic) }, (done) => {
        if (done) runOnJS(setMounted)(false);
      });
    }
  }, [visible, p, t.motion.duration.sheetEnter, t.motion.duration.sheetExit]);

  const scrimAnim = useAnimatedStyle(() => ({ opacity: p.value }));
  const sheetAnim = useAnimatedStyle(() => ({
    opacity: reduced ? p.value : 1,
    transform: [{ translateY: reduced ? 0 : (1 - p.value) * screenH * 0.6 }],
  }));

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, scrimAnim]}>
          <Pressable
            style={{ flex: 1, backgroundColor: s.scrim }}
            onPress={onClose}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        </Animated.View>
        <Animated.View
          testID={testID}
          accessibilityViewIsModal
          style={[
            {
            ...t.elevation['3'].style,
            borderWidth: t.dark ? 1 : 0,
            borderBottomWidth: 0,
            borderColor: s.border,
            borderTopColor: t.dark ? s.sheenEdge : s.border,
            maxHeight: `${s.maxHeightPct}%`,
            backgroundColor: s.bg,
            borderTopLeftRadius: s.radius,
            borderTopRightRadius: s.radius,
            paddingHorizontal: s.padding,
            paddingBottom: insets.bottom + t.space[4],
            },
            sheetAnim,
          ]}
        >
          <View style={{ alignItems: 'center', height: s.handle.target, justifyContent: 'center' }} importantForAccessibility="no-hide-descendants">
            <View style={{ width: s.handle.width, height: s.handle.height, borderRadius: t.radius.full, backgroundColor: s.handle.color }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: t.space[2] }}>
            <View style={{ flex: 1, gap: t.space[1], paddingTop: t.space[2] }}>
              <Txt accessibilityRole="header" variant="headline" style={s.title}>
                {title}
              </Txt>
              {supporting ? (
                <Txt variant="bodySm" tone="muted">
                  {supporting}
                </Txt>
              ) : null}
            </View>
            <IconButton icon="close" accessibilityLabel="Close" onPress={onClose} style={{ marginRight: -t.space[3] }} />
          </View>
          <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingVertical: t.space[4], gap: t.spacing.stackMd }}>
            {children}
          </ScrollView>
          {actions ? <View style={{ gap: t.space[3], paddingTop: t.space[2] }}>{actions}</View> : null}
        </Animated.View>
      </View>
    </Modal>
  );
}
