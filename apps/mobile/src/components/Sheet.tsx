import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
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
 * the 1dp sheen edge on top in dark, scrim colors.overlay. Back, the scrim and Close all dismiss it.
 */
export function Sheet({ visible, title, onClose, children, actions, supporting, testID }: SheetProps) {
  const t = useTheme();
  const s = t.components.bottomSheet;
  const insets = useSafeAreaInsets();
  const reduced = useReduceMotion();
  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduced ? 'fade' : 'slide'}
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: s.scrim }}
          onPress={onClose}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <View
          testID={testID}
          accessibilityViewIsModal
          style={{
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
          }}
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
        </View>
      </View>
    </Modal>
  );
}
