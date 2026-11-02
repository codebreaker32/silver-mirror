import { useEffect, useId, useState } from 'react';
import { Keyboard, Platform, Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from 'expo-router/tabs';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';
import { useGlass } from './glass';

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
 * Floating bar geometry (dashboard reference): a 68dp glass pill, the 56dp Scan disc raised 20dp above its top edge, and
 * a 48dp page fade (transparent -> page-bottom) that ends at the pill's top edge, so content scrolling under the bar
 * dissolves into the page instead of being cut by it.
 */
export const TAB_BAR = { height: 68, raise: 20, scan: 56, radius: 28, inset: 16, gapBelow: 12, fade: 48 } as const;

/**
 * Space a tab scene leaves at its bottom so the floating bar never covers its last line: the bar, the raised Scan disc
 * and the gap under the bar (at least the system inset).
 */
export function tabBarSpace(bottomInset: number): number {
  return TAB_BAR.height + TAB_BAR.raise + Math.max(bottomInset, TAB_BAR.gapBelow);
}

export function useTabBarSpace(): number {
  return tabBarSpace(useSafeAreaInsets().bottom);
}

/**
 * Bottom padding for a tab scene's scroll content: the bar's space plus enough to lift the last line out of the fade
 * above the pill (at least 24dp past the raised Scan disc), so the final card or caption rests in full view.
 */
export function tabScrollTail(bottomInset: number): number {
  return tabBarSpace(bottomInset) + Math.max(24, TAB_BAR.fade - TAB_BAR.raise + 8);
}

export function useTabScrollTail(): number {
  return tabScrollTail(useSafeAreaInsets().bottom);
}

/** The page fade behind the floating bar: transparent at the top, page-bottom from the pill's top edge down. */
function BarFade({ bottom }: { bottom: number }) {
  const t = useTheme();
  const id = `barFade${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const height = bottom + TAB_BAR.height + TAB_BAR.fade;
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height }}
    >
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset={0} stopColor={t.colors.pageBottom} stopOpacity={0} />
            <Stop offset={TAB_BAR.fade / height} stopColor={t.colors.pageBottom} stopOpacity={1} />
            <Stop offset={1} stopColor={t.colors.pageBottom} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/**
 * Custom bottom tab bar (dashboard reference, colors reference): a floating frosted glass pill inset from the screen
 * edges (radius 28, white hairline, soft plum shadow), drawn over the scene. Check at left and Reading at right: outline
 * glyph + 500 label when idle, the filled plum glyph + 600 plum label when selected (fill + weight + colour + the
 * selected state, never colour alone). Scan in the middle is a raised 56dp plum disc with the white scan glyph and
 * "Scan" under it. role tablist / tab; the labels and testIDs are what QA taps. Hidden while the Android keyboard is
 * open. A 48dp page fade sits behind the pill (BarFade), and scenes end their scroll with tabScrollTail() so the last
 * line rests above it.
 */
export function TabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const t = useTheme();
  const n = t.components.bottomNav;
  const router = useRouter();
  const keyboard = useKeyboardOpen();
  const glass = useGlass(TAB_BAR.radius, 'bar');
  if (keyboard) return null;
  const below = Math.max(insets.bottom, TAB_BAR.gapBelow);

  const focusedName = state.routes[state.index]?.name;
  const items = TAB_ITEMS.filter((it) => !it.route || state.routes.some((r) => r.name === it.route));
  // Side items centre a 24dp glyph + 4dp + 16dp label in the 68dp bar; Scan's label shares that baseline.
  const labelPad = (TAB_BAR.height - (t.icon.lg + t.space[1] + n.labelActive.lineHeight)) / 2;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: below,
        paddingLeft: insets.left + TAB_BAR.inset,
        paddingRight: insets.right + TAB_BAR.inset,
      }}
    >
      <BarFade bottom={below} />
      <View pointerEvents="box-none" style={{ height: TAB_BAR.height + TAB_BAR.raise }}>
        <View pointerEvents="none" style={[glass, { position: 'absolute', left: 0, right: 0, bottom: 0, height: TAB_BAR.height }]} />
        <View testID="tab-bar" accessibilityRole="tablist" pointerEvents="box-none" style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end' }}>
          {items.map((it, i) => {
            const route = it.route ? state.routes.find((r) => r.name === it.route) : undefined;
            const focused = Boolean(route && route.name === focusedName);
            const options = route ? descriptors[route.key]?.options : undefined;
            const label = it.label;
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
              <Text
                {...t.textProps[focused ? 'labelSm' : 'labelSmRegular']}
                numberOfLines={1}
                style={[focused ? n.labelActive : n.labelInactive, { color: focused ? n.labelActiveColor : n.labelInactiveColor }]}
              >
                {label}
              </Text>
            );
            return (
              <Pressable
                key={it.key}
                testID={options?.tabBarButtonTestID ?? `tab-${it.key}`}
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={options?.tabBarAccessibilityLabel ?? `${label}, tab ${i + 1} of ${items.length}`}
                accessibilityHint={it.accessibilityHint}
                android_ripple={raised ? undefined : { color: t.colors.state.ripple, borderless: true, radius: n.rippleRadius }}
                style={{
                  flex: raised ? undefined : 1,
                  width: raised ? TAB_BAR.scan + t.space[6] : undefined,
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
                          backgroundColor: pressed ? t.colors.plumPressed : t.colors.plum,
                          borderWidth: 3,
                          borderColor: t.colors.glass,
                          alignItems: 'center',
                          justifyContent: 'center',
                          shadowColor: t.colors.plum,
                          shadowOpacity: 0.3,
                          shadowRadius: 12,
                          shadowOffset: { width: 0, height: 6 },
                          elevation: 6,
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
                      knockout={t.colors.glass}
                      color={focused ? n.iconActive : n.iconInactive}
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
    </View>
  );
}
