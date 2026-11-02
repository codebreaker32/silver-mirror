import { createContext, useContext, useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { IconButton } from './IconButton';
import type { IconName } from './Icon';
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
  /** Leading content instead of the back button (wide content here un-centres the title). */
  leading?: ReactNode;
  /** A node in the centred title slot instead of `title` (the /check source chip "Shared from Nykaa"). */
  center?: ReactNode;
}

/**
 * App bar (component.appBar, showcase 03_analyze / 04_report): 56dp, a 48dp arrow-left icon button labelled "Back",
 * the title centred in type.appBarTitle (one line, ellipsised), trailing actions. A 48dp spacer mirrors the missing
 * side so the title stays optically centred, also in a tab scene with no back button. No hairline at rest.
 */
export function AppBar({ title, onBack, back, trailing, leading, center }: AppBarProps) {
  const t = useTheme();
  const a = t.components.appBar;
  const router = useRouter();
  const inTab = useInTabScene();
  const showBack = back ?? !inTab;
  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  const centred = a.titleAlign === 'center';
  const slot = { minWidth: a.iconButton, flexDirection: 'row' as const, alignItems: 'center' as const };
  const lead = leading ?? (showBack ? <IconButton icon={a.backIcon as IconName} accessibilityLabel="Back" onPress={goBack} color={a.fg} /> : null);
  return (
    <View style={{ minHeight: a.minHeight, flexDirection: 'row', alignItems: 'center', paddingHorizontal: a.paddingX, backgroundColor: a.bg, gap: t.space[1] }}>
      {lead || centred ? <View style={slot}>{lead}</View> : null}
      <View style={{ flex: 1, alignItems: centred ? 'center' : 'flex-start', justifyContent: 'center', marginLeft: lead || centred ? 0 : t.spacing.gutter - a.paddingX }}>
        {center ??
          (title ? (
            <Txt accessibilityRole="header" variant="appBarTitle" numberOfLines={1} style={[a.title, { color: a.fg, textAlign: centred ? 'center' : 'left' }]}>
              {title}
            </Txt>
          ) : null)}
      </View>
      {trailing || centred ? <View style={[slot, { justifyContent: 'flex-end' }]}>{trailing}</View> : null}
    </View>
  );
}

interface ScreenProps {
  title?: string;
  appBar?: boolean;
  onBack?: () => void;
  /** Trailing app-bar actions. */
  actions?: ReactNode;
  /** A node in the centred app-bar title slot instead of `title`. */
  appBarCenter?: ReactNode;
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
export function Screen({ title, appBar = true, onBack, actions, appBarCenter, children, footer, scroll = true, testID }: ScreenProps) {
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
      {appBar ? <AppBar title={title} onBack={onBack} trailing={actions} center={appBarCenter} /> : null}
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
