import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
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
 * Custom bottom tab bar (component.bottomNav): 72dp on surface-raised with a hairline (sheen edge in dark), three
 * items with custom 1.5-stroke icons; the active one sits on a 56×32 slate pill (pearl in dark) at 2.0 stroke with a
 * semibold label. role tablist / tab + selected state. Owns the bottom safe-area inset. Hidden while the Android
 * keyboard is open.
 */
export function TabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const t = useTheme();
  const n = t.components.bottomNav;
  const router = useRouter();
  const keyboard = useKeyboardOpen();
  if (keyboard) return null;

  const focusedName = state.routes[state.index]?.name;
  const items = TAB_ITEMS.filter((it) => !it.route || state.routes.some((r) => r.name === it.route));

  return (
    <View
      style={{
        ...(t.dark ? null : t.elevation['2'].style),
        borderWidth: 0,
        backgroundColor: n.bg,
        borderTopWidth: 1,
        borderTopColor: t.dark ? n.sheenEdge : n.border,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View testID="tab-bar" accessibilityRole="tablist" style={{ flexDirection: 'row', minHeight: n.minHeight, alignItems: 'stretch' }}>
        {items.map((it, i) => {
          const route = it.route ? state.routes.find((r) => r.name === it.route) : undefined;
          const focused = Boolean(route && route.name === focusedName);
          const options = route ? descriptors[route.key]?.options : undefined;
          const label = it.label;
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
              android_ripple={{ color: t.colors.state.ripple, borderless: true, radius: n.itemMinWidth / 2 }}
              style={{ flex: 1, minWidth: n.itemMinWidth, minHeight: Math.max(n.itemTarget, n.minHeight), alignItems: 'center', justifyContent: 'center', gap: t.space[1] }}
            >
              {/* Keyed on focus so the pill mounts with its fill: on Android (Fabric) a radius set while the view was
                  transparent was dropped when the fill arrived later, leaving a square indicator on the Reading tab. */}
              <View
                key={focused ? 'on' : 'off'}
                style={{
                  width: n.indicator.width,
                  height: n.indicator.height,
                  borderRadius: n.indicator.radius,
                  overflow: 'hidden',
                  backgroundColor: focused ? n.indicator.bg : undefined,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon
                  name={it.icon}
                  size={t.icon.lg}
                  color={focused ? n.iconActive : n.iconInactive}
                  strokeWidth={focused ? n.iconActiveStrokeWidth : n.iconInactiveStrokeWidth}
                />
              </View>
              <Text
                {...t.textProps[focused ? 'labelSm' : 'labelSmRegular']}
                numberOfLines={1}
                style={[focused ? n.labelActive : n.labelInactive, { color: focused ? n.labelActiveColor : n.labelInactiveColor }]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
