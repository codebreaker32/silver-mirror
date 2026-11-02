import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';

/**
 * One item of the bottom bar. Tabs with `route` are real tab scenes in app/(tabs); a tab with `href` opens a
 * pushed flow above the tabs instead (Scan opens the consent → capture flow full screen, with no tab bar).
 */
export interface TabItem {
  key: string;
  label: string;
  icon: IconName;
  route?: string;
  href?: Href;
  accessibilityHint?: string;
}

/** Check · Scan · Reading (component.bottomNav.labels). Settings is the gear in the Home top bar, not a tab. */
export const TAB_ITEMS: readonly TabItem[] = [
  { key: 'check', label: 'Check', icon: 'tag-check', route: 'index' },
  { key: 'scan', label: 'Scan', icon: 'face-frame', href: '/scan', accessibilityHint: 'Opens the skin scan' },
  { key: 'reading', label: 'Reading', icon: 'droplet', route: 'reading' },
];

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
 * surface tone, drawn over the bottom of the scene and padded by the system navigation inset. Check at left and
 * Reading at right: outline glyph + 500 label in muted when idle; the filled ink glyph + 600 steel-blue label when
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
                      <Icon name={it.icon} size={t.icon.lg} color={t.colors.onAccent} strokeWidth={1.75} />
                    </View>
                    {text}
                  </>
                )
              ) : (
                <>
                  <Icon
                    name={it.icon}
                    size={t.icon.lg}
                    filled={focused && n.iconActiveFilled}
                    knockout={barBg}
                    color={focused ? t.colors.text : t.colors.textMuted}
                    strokeWidth={n.iconInactiveStrokeWidth}
                  />
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
