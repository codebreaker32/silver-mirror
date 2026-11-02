import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';

export interface SegmentedProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  /** Names the group for TalkBack, e.g. "Store app". */
  accessibilityLabel: string;
  testID?: string;
}

/**
 * Segmented control (component.segmented, showcase AM / PM switch): a lavender-grey 48dp pill track with a 4dp inset;
 * the selected segment is a white raised pill with its own soft violet shadow (graphite-700 with a sheen edge in dark),
 * a 16dp check and a 600 label; unselected labels are 500 in text-muted. Selection never rests on colour alone. Each
 * segment is a tab with selected state; testIDs are `${testID}-${option.toLowerCase()}`.
 */
export function Segmented<T extends string>({ options, value, onChange, accessibilityLabel, testID }: SegmentedProps<T>) {
  const t = useTheme();
  const s = t.components.segmented;
  const inset = t.space[1];
  // The thumb's own soft violet shadow (light only; dark uses a sheen edge).
  const thumbShadow = {
    shadowColor: s.thumbShadow.shadowColor,
    shadowOpacity: s.thumbShadow.shadowOpacity,
    shadowRadius: s.thumbShadow.shadowRadius,
    shadowOffset: { width: 0, height: s.thumbShadow.shadowOffsetY },
    elevation: s.thumbShadow.elevation,
  };
  return (
    <View
      testID={testID}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={{ flexDirection: 'row', backgroundColor: s.track, borderRadius: s.radius, padding: inset, gap: inset, minHeight: s.minHeight }}
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            testID={testID ? `${testID}-${option.toLowerCase()}` : undefined}
            onPress={() => onChange(option)}
            accessibilityRole="tab"
            accessibilityLabel={option}
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              {
                flex: 1,
                minHeight: s.minHeight - inset * 2,
                borderRadius: s.radius,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: t.space[1] + 2,
                paddingHorizontal: t.space[2],
                backgroundColor: selected ? s.selectedBg : pressed ? s.bgPressed : 'transparent',
              },
              selected && !t.dark ? thumbShadow : null,
              selected && t.dark ? { borderWidth: 1, borderColor: 'transparent', borderTopColor: t.colors.sheenEdge } : null,
            ]}
          >
            {selected ? <Icon name={s.selectedIcon as IconName} size={t.icon.sm} color={s.selectedFg} strokeWidth={2} /> : null}
            <Text
              {...t.textProps.label}
              numberOfLines={1}
              style={[s.type, selected ? null : { fontFamily: t.typography.labelSmRegular.fontFamily }, { color: selected ? s.selectedFg : s.fg }]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
