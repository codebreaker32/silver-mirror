import { createContext, useContext, useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { IconButton } from './IconButton';
import { Txt } from './Text';

/** True inside a bottom-tab scene: screens drop the back button and leave the bottom inset to the tab bar. */
const TabSceneContext = createContext(false);

export function TabScene({ children }: { children: ReactNode }) {
  return <TabSceneContext.Provider value>{children}</TabSceneContext.Provider>;
}

export function useInTabScene(): boolean {
  return useContext(TabSceneContext);
}

interface AppBarProps {
  title?: string;
  /** Defaults to router.back(), or Home when there is nothing to go back to. Hidden inside a tab scene. */
  onBack?: () => void;
  /** Force the back button off (or on, inside a tab scene). */
  back?: boolean;
  /** Trailing 48dp icon buttons (gear, More). */
  trailing?: ReactNode;
  /** Leading content instead of the back button (the Home BrandLockup). */
  leading?: ReactNode;
}

/** App bar (component.appBar): one chevron-left 48dp icon button labelled "Back", optional title, trailing actions. */
export function AppBar({ title, onBack, back, trailing, leading }: AppBarProps) {
  const t = useTheme();
  const a = t.components.appBar;
  const router = useRouter();
  const inTab = useInTabScene();
  const showBack = back ?? !inTab;
  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  return (
    <View style={{ minHeight: a.minHeight, flexDirection: 'row', alignItems: 'center', paddingHorizontal: a.paddingX, backgroundColor: a.bg, gap: t.space[1] }}>
      {leading ?? (showBack ? <IconButton icon="chevron-left" accessibilityLabel="Back" onPress={goBack} color={a.fg} /> : null)}
      {title ? (
        <Txt
          accessibilityRole="header"
          variant="label"
          numberOfLines={1}
          style={[a.title, { color: a.fg, flex: 1, marginLeft: showBack || leading ? 0 : t.spacing.gutter - a.paddingX, textAlign: a.titleAlign === 'center' ? 'center' : 'left' }]}
        >
          {title}
        </Txt>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      {trailing ? <View style={{ flexDirection: 'row', alignItems: 'center' }}>{trailing}</View> : null}
    </View>
  );
}

interface ScreenProps {
  title?: string;
  appBar?: boolean;
  onBack?: () => void;
  /** Trailing app-bar actions. */
  actions?: ReactNode;
  children: ReactNode;
  /** Sticky footer (the action dock / consent pair) on surface-raised with a hairline. */
  footer?: ReactNode;
  scroll?: boolean;
  testID?: string;
}

/**
 * Screen scaffold: themed bg, top safe area, app bar, scrolling body with the 20dp gutter, optional sticky footer
 * that owns the bottom inset. Inside a TabScene the bottom inset belongs to the tab bar.
 */
export function Screen({ title, appBar = true, onBack, actions, children, footer, scroll = true, testID }: ScreenProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const inTab = useInTabScene();
  const bottom = inTab ? 0 : insets.bottom;
  // Tab scenes have no app bar, so scrolled content meets the status-bar strip directly. Like Home's status-bar scrim,
  // a hairline marks that edge once the body has scrolled, so no heading reads as sliding under the status icons.
  const edge = inTab && !appBar;
  const [scrolled, setScrolled] = useState(false);
  const body = <View style={{ paddingHorizontal: t.spacing.gutter, paddingBottom: t.spacing.section, gap: t.spacing.stackLg }}>{children}</View>;
  return (
    <SafeAreaView testID={testID} edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: t.colors.bg }}>
      {appBar ? <AppBar title={title} onBack={onBack} trailing={actions} /> : null}
      {scroll ? (
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={32}
            onScroll={
              edge
                ? (e) => {
                    const past = e.nativeEvent.contentOffset.y > t.space[2];
                    if (past !== scrolled) setScrolled(past);
                  }
                : undefined
            }
          >
            {body}
          </ScrollView>
          {edge && scrolled ? (
            <View
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: t.dark ? t.colors.sheenEdge : t.colors.border }}
            />
          ) : null}
        </View>
      ) : (
        <View style={{ flex: 1 }}>{body}</View>
      )}
      {footer ? (
        <View
          style={{
            ...t.components.actionBar.shadow,
            borderWidth: 0,
            borderTopWidth: 1,
            borderTopColor: t.dark ? t.colors.sheenEdge : t.components.actionBar.border,
            paddingTop: t.components.actionBar.paddingTop,
            paddingHorizontal: t.components.actionBar.paddingX,
            paddingBottom: bottom + t.components.actionBar.paddingBottom,
            gap: t.components.actionBar.gap,
          }}
        >
          {footer}
        </View>
      ) : (
        <View style={{ height: bottom }} />
      )}
    </SafeAreaView>
  );
}
