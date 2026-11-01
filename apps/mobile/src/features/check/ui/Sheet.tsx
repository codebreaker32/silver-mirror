import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';

interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
  testID?: string;
}

/** M3 modal bottom sheet (components.md §25). Back and the Close button both dismiss it. */
export function Sheet({ visible, title, onClose, children, actions, testID }: SheetProps) {
  const t = useTheme();
  const s = t.components.bottomSheet;
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
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
            ...t.elevation['2'].style,
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[2] }}>
            <Text accessibilityRole="header" style={[t.type.headline, { color: t.colors.text, flex: 1 }]}>
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={{ width: t.touch.min, height: t.touch.min, alignItems: 'center', justifyContent: 'center', borderRadius: t.radius.full }}
            >
              <Icon name="close" size={t.icon.lg} color={t.colors.text} />
            </Pressable>
          </View>
          <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingVertical: t.space[3], gap: t.space[3] }}>
            {children}
          </ScrollView>
          {actions ? <View style={{ gap: t.space[3], paddingTop: t.space[2] }}>{actions}</View> : null}
        </View>
      </View>
    </Modal>
  );
}
