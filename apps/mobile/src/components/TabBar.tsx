import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from 'expo-router/tabs';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';
import { haptic } from './haptics';
import { useReduceMotion } from './useReduceMotion';

/**
 * One item of the bottom bar. Tabs with `route` are real tab scenes in app/(tabs); a tab with `href` opens a
 * pushed flow above the tabs instead (Scan opens the consent → capture flow full screen, with no tab bar).
 */
export interface TabItem {
  key: string;
  label: string;
  icon: IconName | TabGlyphName;
  route?: string;
  href?: Href;
  accessibilityHint?: string;
}

/**
 * Home · Shop · Scan · Reading · You (experience reference). Scan is the raised centre disc. A tab whose route file is
 * not in app/(tabs) is left out, so the bar never shows a dead slot.
 */
export const TAB_ITEMS: readonly TabItem[] = [
  { key: 'home', label: 'Home', icon: 'house', route: 'index' },
  { key: 'shop', label: 'Shop', icon: 'bag', route: 'shop' },
  { key: 'scan', label: 'Scan', icon: 'face-frame', href: '/scan', accessibilityHint: 'Opens the skin scan' },
  { key: 'reading', label: 'Reading', icon: 'droplet', route: 'reading' },
  { key: 'you', label: 'You', icon: 'person', route: 'you' },
];

/** Tab-only line glyphs (24dp grid, round caps, the Icon set's stroke). Filled when selected. */
type TabGlyphName = 'house' | 'bag' | 'person';
const TAB_GLYPHS: Record<TabGlyphName, string> = {
  house: 'M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z',
  bag: 'M5.5 8h13l-1 11.2a1 1 0 0 1-1 .8H7.5a1 1 0 0 1-1-.8zM9 8V7a3 3 0 0 1 6 0v1',
  person: 'M12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5zM4.75 20c.6-3.6 3.6-5.75 7.25-5.75S18.65 16.4 19.25 20z',
};
const isTabGlyph = (n: string): n is TabGlyphName => n in TAB_GLYPHS;

function TabGlyph({ name, size, color, filled, strokeWidth }: { name: TabGlyphName; size: number; color: string; filled: boolean; strokeWidth: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Path
        d={TAB_GLYPHS[name]}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled && name !== 'bag' ? color : 'none'}
      />
    </Svg>
  );
}

/**
 * The selected tab's mark: a 20x3 ink rule on the bar's top edge that grows from the centre in 200ms (ease-out) and
 * fades out the same way. Reduced motion: it simply appears.
 */
function TabIndicator({ active, color }: { active: boolean; color: string }) {
  const reduced = useReduceMotion();
  const v = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    const to = active ? 1 : 0;
    v.value = reduced ? to : withTiming(to, { duration: 200, easing: Easing.out(Easing.cubic) });
  }, [active, reduced, v]);
  const style = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ scaleX: 0.3 + 0.7 * v.value }] }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', top: 0, alignSelf: 'center', width: 20, height: 3, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, backgroundColor: color }, style]}
    />
  );
}

function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const a = Keyboard.addListener('keyboardDidShow', () => setOpen(true));
    const b = Keyboard.addListener('keyboardDidHide', () => setOpen(false));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);
  return open;
}

/**
 * Docked bar geometry (Silver & graphite): a full-width 64dp surface-tone bar over the system navigation inset, flat (no
 * glass, no shadow, no line). The Scan disc is a plain 56dp graphite disc rising 26dp above the bar's top edge, with no
 * collar and no halo; "Scan" sits under it on the side labels' baseline.
 */
export const TAB_BAR = { height: 64, raise: 26, scan: 56 } as const;

/**
 * Space a tab scene leaves at its bottom so the docked bar never covers its last line: the bar, the raised Scan disc
 * and the system navigation inset.
 */
export function tabBarSpace(bottomInset: number): number {
  return TAB_BAR.height + TAB_BAR.raise + bottomInset;
}

export function useTabBarSpace(): number {
  return tabBarSpace(useSafeAreaInsets().bottom);
}

/** Bottom padding for a tab scene's scroll content: the bar's space plus 24dp, so the last line rests in full view. */
export function tabScrollTail(bottomInset: number): number {
  return tabBarSpace(bottomInset) + 24;
}

export function useTabScrollTail(): number {
  return tabScrollTail(useSafeAreaInsets().bottom);
}

/**
 * Custom bottom tab bar (dashboard reference idea, Silver & graphite surfaces): a flat docked full-width bar in the
 * surface tone, drawn over the bottom of the scene and padded by the system navigation inset. Home, Shop, Reading and You
 * around the centre: outline glyph + 500 label in muted when idle; the filled ink glyph + 600 steel-blue label when
 * selected (fill + weight + colour + the selected state, never colour alone). Scan in the middle is a raised 56dp
 * graphite disc with the white scan glyph and "Scan" under it. role tablist / tab; the labels and testIDs are what QA
 * taps. Hidden while the Android keyboard is open. Scenes end their scroll with tabScrollTail() so the last line clears it.
 */
export function TabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const t = useTheme();
  const n = t.components.bottomNav;
  const router = useRouter();
  const keyboard = useKeyboardOpen();
  if (keyboard) return null;
  const barBg = t.colors.surface;

  const focusedName = state.routes[state.index]?.name;
  const items = TAB_ITEMS.filter((it) => !it.route || state.routes.some((r) => r.name === it.route));
  const labelLine = 16;
  // Side items centre a 24dp glyph + 4dp + 16dp label in the 64dp bar; Scan's label shares that baseline.
  const labelPad = (TAB_BAR.height - (t.icon.lg + t.space[1] + labelLine)) / 2;
  const label = (focused: boolean) => ({
    fontFamily: focused ? t.fonts.sansSemibold : t.fonts.sansMedium,
    fontSize: 13,
    lineHeight: labelLine,
    letterSpacing: 0,
    includeFontPadding: false,
    color: focused ? t.colors.tabActive : t.colors.textMuted,
  });

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingLeft: insets.left, paddingRight: insets.right }}
    >
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: TAB_BAR.height + insets.bottom, backgroundColor: barBg }} />
      <View
        testID="tab-bar"
        accessibilityRole="tablist"
        pointerEvents="box-none"
        style={{ height: TAB_BAR.height + TAB_BAR.raise, marginBottom: insets.bottom, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: t.space[2] }}
      >
        {items.map((it, i) => {
          const route = it.route ? state.routes.find((r) => r.name === it.route) : undefined;
          const focused = Boolean(route && route.name === focusedName);
          const options = route ? descriptors[route.key]?.options : undefined;
          const raised = !it.route;
          const onPress = () => {
            haptic('contextClick');
            if (it.href) {
              router.push(it.href);
              return;
            }
            if (!route) return;
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };
          const onLongPress = () => {
            if (route) emitter.emit({ type: 'tabLongPress', target: route.key });
          };
          const text = (
            <Text {...t.textProps[focused ? 'labelSm' : 'labelSmRegular']} numberOfLines={1} style={label(focused)}>
              {it.label}
            </Text>
          );
          const disc = TAB_BAR.scan;
          return (
            <Pressable
              key={it.key}
              testID={options?.tabBarButtonTestID ?? `tab-${it.key}`}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options?.tabBarAccessibilityLabel ?? `${it.label}, tab ${i + 1} of ${items.length}`}
              accessibilityHint={it.accessibilityHint}
              android_ripple={raised ? undefined : { color: t.colors.state.ripple, borderless: true, radius: n.rippleRadius }}
              style={{
                flex: raised ? undefined : 1,
                width: raised ? disc + t.space[6] : undefined,
                minWidth: raised ? undefined : n.itemMinWidth,
                minHeight: n.itemTarget,
                height: raised ? TAB_BAR.height + TAB_BAR.raise : TAB_BAR.height,
                alignItems: 'center',
                justifyContent: raised ? 'flex-end' : 'center',
                paddingBottom: raised ? labelPad : 0,
                gap: t.space[1],
              }}
            >
              {raised ? (
                ({ pressed }) => (
                  <>
                    <View
                      style={{
                        width: TAB_BAR.scan,
                        height: TAB_BAR.scan,
                        borderRadius: TAB_BAR.scan / 2,
                        backgroundColor: pressed ? t.colors.accentPressed : t.colors.accent,
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: [{ scale: pressed ? 0.96 : 1 }],
                      }}
                    >
                      <Icon name={it.icon as IconName} size={t.icon.lg} color={t.colors.onAccent} strokeWidth={1.75} />
                    </View>
                    {text}
                  </>
                )
              ) : (
                <>
                  <TabIndicator active={focused} color={t.colors.text} />
                  {isTabGlyph(it.icon) ? (
                    <TabGlyph
                      name={it.icon}
                      size={t.icon.lg}
                      filled={focused && n.iconActiveFilled}
                      color={focused ? t.colors.text : t.colors.textMuted}
                      strokeWidth={n.iconInactiveStrokeWidth}
                    />
                  ) : (
                    <Icon
                      name={it.icon}
                      size={t.icon.lg}
                      filled={focused && n.iconActiveFilled}
                      knockout={barBg}
                      color={focused ? t.colors.text : t.colors.textMuted}
                      strokeWidth={n.iconInactiveStrokeWidth}
                    />
                  )}
                  {text}
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
