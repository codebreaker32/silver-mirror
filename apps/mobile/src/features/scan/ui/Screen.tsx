import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';

export function AppBar({ title, onBack }: { title?: string; onBack?: () => void }) {
  const theme = useTheme();
  const a = theme.components.appBar;
  const router = useRouter();
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  return (
    <View style={{ minHeight: a.height, flexDirection: 'row', alignItems: 'center', paddingHorizontal: a.paddingX, backgroundColor: a.bg }}>
      <Pressable
        onPress={back}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={{ width: a.iconButton, height: a.iconButton, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.full }}
      >
        <Icon name="back" size={a.iconSize} color={a.fg} />
      </Pressable>
      {title ? (
        <Text accessibilityRole="header" style={[theme.type.label, { color: a.fg, flex: 1, marginLeft: theme.space[1] }]}>
          {title}
        </Text>
      ) : null}
    </View>
  );
}

interface ScreenProps {
  title?: string;
  appBar?: boolean;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
}

export function Screen({ title, appBar = true, onBack, children, footer, scroll = true }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const body = (
    <View style={{ paddingHorizontal: theme.spacing.gutter, paddingBottom: theme.spacing.section, gap: theme.spacing.stackLg }}>{children}</View>
  );
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {appBar ? <AppBar title={title} onBack={onBack} /> : null}
      {scroll ? <ScrollView contentContainerStyle={{ flexGrow: 1 }}>{body}</ScrollView> : <View style={{ flex: 1 }}>{body}</View>}
      {footer ? (
        <View
          style={{
            backgroundColor: theme.colors.surfaceRaised,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            paddingTop: theme.space[4],
            paddingHorizontal: theme.space[5],
            paddingBottom: insets.bottom + theme.space[4],
            gap: theme.space[3],
          }}
        >
          {footer}
        </View>
      ) : (
        <View style={{ height: insets.bottom }} />
      )}
    </SafeAreaView>
  );
}

/** Button pair that sits side by side at normal text size and stacks at 1.3× and up. */
export function ButtonPair({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const { fontScale } = useWindowDimensions();
  const stack = fontScale >= theme.components.button.stackAtFontScale;
  return <View style={{ flexDirection: stack ? 'column' : 'row', gap: theme.space[3] }}>{children}</View>;
}

export function Heading({ children, level = 'title' }: { children: ReactNode; level?: 'display' | 'title' | 'headline' }) {
  const theme = useTheme();
  return (
    <Text accessibilityRole="header" style={[theme.type[level], { color: theme.colors.text }]}>
      {children}
    </Text>
  );
}

export function Body({ children, muted, small }: { children: ReactNode; muted?: boolean; small?: boolean }) {
  const theme = useTheme();
  return <Text style={[small ? theme.type.bodySm : theme.type.body, { color: muted ? theme.colors.textMuted : theme.colors.text }]}>{children}</Text>;
}

export function Overline({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return <Text style={[theme.type.overline, { color: theme.colors.textMuted }]}>{children}</Text>;
}

export function Note({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: theme.space[2], alignItems: 'flex-start' }}>
      <View style={{ paddingTop: 2 }}>
        <Icon name="info" size={theme.icon.sm} color={theme.colors.textMuted} />
      </View>
      <Text style={[theme.type.bodySm, { color: theme.colors.textMuted, flex: 1 }]}>{children}</Text>
    </View>
  );
}

export function StateView({ title, body, children }: { title: string; body?: string; children?: ReactNode }) {
  const theme = useTheme();
  const s = theme.components.stateView;
  return (
    <View style={{ alignItems: 'center', alignSelf: 'center', maxWidth: 320, gap: theme.space[4], paddingVertical: theme.space[10] }}>
      <View style={{ width: 64, height: 64, borderRadius: theme.radius.full, backgroundColor: theme.colors.bgSunken, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="scanFace" size={theme.icon.xl} />
      </View>
      <Text accessibilityRole="header" style={[s.title, { color: s.titleColor, textAlign: 'center' }]}>
        {title}
      </Text>
      {body ? <Text style={[s.body, { color: s.bodyColor, textAlign: 'center' }]}>{body}</Text> : null}
      {children ? <View style={{ alignSelf: 'stretch', gap: theme.space[3] }}>{children}</View> : null}
    </View>
  );
}
