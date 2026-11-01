import { Animated, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { VerdictView } from '../present';
import { VerdictIcon, textStyle } from '../ui';
import { useReveal } from './useReveal';

/** Only this block carries the verdict tint (components.md §6a). */
export function VerdictHead({ view }: { view: VerdictView }) {
  const t = useTheme();
  const head = t.components.verdictCard.head;
  const c = head[view.tone];
  const medicine = view.tone === 'medicine';
  const reveal = useReveal(`${view.label}|${view.subtitle}`);

  return (
    <Animated.View
      testID="verdict-head"
      accessible
      accessibilityRole="header"
      accessibilityLabel={view.headA11y}
      style={[
        {
          backgroundColor: c.bg,
          borderColor: c.border,
          borderWidth: c.borderWidth,
          borderStyle: c.borderStyle as 'solid' | 'dashed',
          borderLeftWidth: medicine ? c.borderWidth : 3,
          borderLeftColor: medicine ? c.border : c.fg,
          borderRadius: head.radius,
          padding: head.padding,
          gap: t.space[3],
        },
        reveal,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: head.iconGap }}>
        <VerdictIcon tone={view.tone} size={c.iconSize} color={c.icon} />
        {view.labelText && c.showLabel ? <Text style={[textStyle(head.label), { color: c.fg, flexShrink: 1 }]}>{view.labelText}</Text> : null}
      </View>
      <Text style={[c.subtitle, { color: medicine ? c.fg : head.subtitleColor }]}>
        {view.subtitle}
      </Text>
    </Animated.View>
  );
}
