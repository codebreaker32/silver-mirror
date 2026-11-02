import { createContext, useContext, useId, useRef, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { IconButton } from './IconButton';
import { tabBarSpace } from './TabBar';
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

/**
 * The page (tokens 2.2, design/reference/colors-reference.png): a vertical gradient from color.page-top (blush) into
 * color.page-bottom (lavender), with one soft blush glow breathing in from the top-left corner. An absolute-fill layer
 * behind the content: decorative, untouchable, hidden from TalkBack. In dark every stop is the graphite page, so it
 * draws flat. Put it first inside any full-page root that used to paint colors.bg.
 */
export function PageBackdrop() {
  const t = useTheme();
  const c = t.colors;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={`page${uid}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset={0} stopColor={c.pageTop} />
            <Stop offset={0.45} stopColor={c.bg} />
            <Stop offset={1} stopColor={c.pageBottom} />
          </LinearGradient>
          <RadialGradient id={`glow${uid}`} cx="0.08" cy="0.04" rx="0.85" ry="0.42" fx="0.08" fy="0.04">
            <Stop offset={0} stopColor={c.pageGlow} stopOpacity={t.dark ? 0 : 0.7} />
            <Stop offset={0.55} stopColor={c.pageGlow} stopOpacity={t.dark ? 0 : 0.18} />
            <Stop offset={1} stopColor={c.pageGlow} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#page${uid})`} />
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#glow${uid})`} />
      </Svg>
    </View>
  );
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
  /** Sticky footer (the action dock / consent pair) floating on the page; a hairline only while content sits under it. */
  footer?: ReactNode;
  scroll?: boolean;
  testID?: string;
}

/**
 * Screen scaffold: the page gradient (PageBackdrop) over a solid colors.bg fallback, top safe area, app bar, scrolling body with the 20dp gutter, optional sticky footer
 * that owns the bottom inset. Inside a TabScene the bottom inset belongs to the tab bar.
 */
export function Screen({ title, appBar = true, onBack, actions, appBarCenter, children, footer, scroll = true, testID }: ScreenProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const inTab = useInTabScene();
  const bottom = inTab ? 0 : insets.bottom;
  // Tab scenes run under the floating tab bar (TabBar.tsx): the scroll leaves its height free so the last line clears it.
  const barSpace = inTab ? tabBarSpace(insets.bottom) : 0;
  // Tab scenes have no app bar, so scrolled content meets the status-bar strip directly. Like Home's status-bar scrim,
  // a hairline marks that edge once the body has scrolled, so no heading reads as sliding under the status icons.
  const edge = inTab && !appBar;
  const [scrolled, setScrolled] = useState(false);
  // The footer dock floats on the page (DESIGN.md §8.7, showcase 04_report): its top hairline shows only while the body
  // has content under it (offset + viewport < content height).
  const geo = useRef({ y: 0, viewport: 0, content: 0 });
  const [under, setUnder] = useState(false);
  const measure = () => {
    const { y, viewport, content } = geo.current;
    const next = viewport > 0 && y + viewport < content - 1;
    if (next !== under) setUnder(next);
  };
  // With a footer the last line clears the dock by the fade height plus 16dp, so it can always scroll into full view.
  const tail = (footer && scroll ? t.spacing.section + FADE + t.space[4] : t.spacing.section) + (scroll ? barSpace : 0);
  const body = <View style={{ paddingHorizontal: t.spacing.gutter, paddingBottom: tail, gap: t.spacing.stackLg }}>{children}</View>;
  return (
    <SafeAreaView testID={testID} edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <PageBackdrop />
      {appBar ? <AppBar title={title} onBack={onBack} trailing={actions} center={appBarCenter} /> : null}
      {scroll ? (
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={32}
            onScroll={(e) => {
              if (edge) {
                const past = e.nativeEvent.contentOffset.y > t.space[2];
                if (past !== scrolled) setScrolled(past);
              }
              geo.current.y = e.nativeEvent.contentOffset.y;
              measure();
            }}
            // Measured even without a footer: a screen that renders its loading state first (no footer) keeps this
            // instance when the footer arrives, and onLayout would not fire again.
            onLayout={(e) => {
              geo.current.viewport = e.nativeEvent.layout.height;
              measure();
            }}
            onContentSizeChange={(_w, h) => {
              geo.current.content = h;
              measure();
            }}
          >
            {body}
          </ScrollView>
          {footer && under ? <FooterFade /> : null}
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
            // Transparent: the dock floats on the page gradient (actionBar.bg).
            backgroundColor: t.components.actionBar.bg,
            borderTopWidth: scroll && under ? 1 : 0,
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
        <View style={{ height: scroll ? bottom : bottom + barSpace }} />
      )}
    </SafeAreaView>
  );
}

const FADE = 28;

/** A short page-to-transparent fade over the bottom of the scroll area, shown while content runs under the dock (in the page-bottom tone it meets). */
export function FooterFade() {
  const t = useTheme();
  const id = `fade${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: FADE }}
    >
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset={0} stopColor={t.colors.pageBottom} stopOpacity={0} />
            <Stop offset={1} stopColor={t.colors.pageBottom} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
