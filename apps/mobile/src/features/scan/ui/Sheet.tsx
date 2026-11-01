import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';
import { useReduceMotion } from './useReduceMotion';

interface Props {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
}

export function Sheet({ visible, title, onClose, children, actions }: Props) {
  const theme = useTheme();
  const s = theme.components.bottomSheet;
  const insets = useSafeAreaInsets();
  const reduced = useReduceMotion();
  return (
    <Modal visible={visible} transparent animationType={reduced ? 'fade' : 'slide'} onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: s.scrim }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" importantForAccessibility="no" />
        <View
          accessibilityViewIsModal
          style={{
            ...theme.elevation['2'].style,
            borderWidth: 0,
            maxHeight: `${s.maxHeightPct}%`,
            borderTopLeftRadius: s.radius,
            borderTopRightRadius: s.radius,
            paddingHorizontal: s.padding,
            paddingBottom: insets.bottom + theme.space[4],
            backgroundColor: s.bg,
          }}
        >
          <View style={{ alignItems: 'center', paddingTop: theme.space[2] }}>
            <View style={{ width: s.handle.width, height: s.handle.height, borderRadius: theme.radius.full, backgroundColor: s.handle.color }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: theme.touch.min }}>
            <Text accessibilityRole="header" style={[theme.type.headline, { color: theme.colors.text, flex: 1 }]}>
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={{ width: theme.touch.min, height: theme.touch.min, alignItems: 'center', justifyContent: 'center', marginRight: -theme.space[3] }}
            >
              <Icon name="close" size={theme.icon.lg} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: theme.space[4], gap: theme.spacing.stackMd }}>{children}</ScrollView>
          {actions ? <View style={{ gap: theme.space[3] }}>{actions}</View> : null}
        </View>
      </View>
    </Modal>
  );
}
