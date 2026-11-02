import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, Txt, type IconName } from '@/components';
import { useReduceMotion } from '@/components/useReduceMotion';
import { haptic } from '@/components/haptics';

const TITLE_TYPE = { fontFamily: 'Geist_500Medium', fontSize: 15, lineHeight: 20, letterSpacing: -0.1 } as const;
const OUT = Easing.bezier(0.25, 0.1, 0.25, 1);

/**
 * Expandable row (reference product detail: "Key ingredients", "How this was checked"). A 52dp row with a leading
 * glyph, the title and a chevron that turns 180° in 180ms; the body's height follows (220ms, ease-in-out). Reduced
 * motion snaps open and closed. The body stays mounted so its content keeps its place for tests and scroll targets,
 * and is hidden from TalkBack while closed.
 */
export function Disclosure({
  title,
  icon,
  defaultOpen = false,
  testID,
  children,
}: {
  title: string;
  icon?: IconName;
  defaultOpen?: boolean;
  testID?: string;
  children: ReactNode;
}) {
  const t = useTheme();
  const reduced = useReduceMotion();
  const [open, setOpen] = useState(defaultOpen);
  const [measured, setMeasured] = useState<number | null>(null);
  const turn = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;
  const height = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  useEffect(() => {
    const to = open ? 1 : 0;
    if (reduced) {
      turn.setValue(to);
      height.setValue(to);
      return;
    }
    const ease = Easing.inOut(Easing.cubic);
    Animated.timing(turn, { toValue: to, duration: 180, easing: OUT, useNativeDriver: true }).start();
    Animated.timing(height, { toValue: to, duration: 220, easing: ease, useNativeDriver: false }).start();
  }, [open, reduced, turn, height]);

  const toggle = () => {
    haptic(open ? 'toggleOff' : 'toggleOn');
    setOpen((v) => !v);
  };

  return (
    <View testID={testID}>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: open }}
        testID={testID ? `${testID}-toggle` : undefined}
        style={({ pressed }) => ({
          minHeight: 52,
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.space[3],
          paddingHorizontal: t.space[1],
          borderRadius: 12,
          backgroundColor: pressed ? t.colors.bgSunken : 'transparent',
        })}
      >
        {icon ? <Icon name={icon} size={t.icon.md} color={t.colors.textMuted} /> : null}
        <Txt variant="label" style={[TITLE_TYPE, { flex: 1, color: t.colors.text }]}>
          {title}
        </Txt>
        <Animated.View style={{ transform: [{ rotate: turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}>
          <Icon name="chevron-down" size={t.icon.sm} color={t.colors.textMuted} />
        </Animated.View>
      </Pressable>
      <Animated.View
        importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
        accessibilityElementsHidden={!open}
        style={{
          overflow: 'hidden',
          // Until the body has been measured, an open row takes its natural height and a closed one none.
          height: measured == null ? (open ? undefined : 0) : height.interpolate({ inputRange: [0, 1], outputRange: [0, measured] }),
          opacity: height,
        }}
      >
        <View
          style={{ position: measured == null && open ? 'relative' : 'absolute', left: 0, right: 0, paddingTop: t.space[1], paddingBottom: t.space[4] }}
          onLayout={(e) => {
            const h = Math.ceil(e.nativeEvent.layout.height);
            if (h > 0 && h !== measured) setMeasured(h);
          }}
        >
          {children}
        </View>
      </Animated.View>
      <View style={{ height: 1, backgroundColor: t.colors.border }} />
    </View>
  );
}
