import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from '../Icon';

interface SegmentedProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  /** Names the group for TalkBack, e.g. "Store app". */
  accessibilityLabel: string;
  testID?: string;
}

/**
 * Segmented control (component.segmented): sunken pill track; the selected segment is a raised pill with a check
 * and heavier label, so selection never rests on colour alone. Each segment is a 48dp tab with selected state.
 */
export function Segmented<T extends string>({ options, value, onChange, accessibilityLabel, testID }: SegmentedProps<T>) {
  const t = useTheme();
  const s = t.components.segmented;
  return (
    <View
      testID={testID}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={{ flexDirection: 'row', backgroundColor: s.track, borderRadius: s.radius, padding: t.space[1], gap: t.space[1] }}
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
                minHeight: s.minHeight - t.space[2],
                borderRadius: s.radius,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: t.space[1],
                paddingHorizontal: t.space[2],
                backgroundColor: selected ? s.selectedBg : pressed ? s.bgPressed : 'transparent',
              },
              selected && !t.dark ? { ...t.elevation['1'].style, backgroundColor: s.selectedBg, borderWidth: 0 } : null,
              selected && t.dark ? { borderWidth: 1, borderColor: t.colors.border, borderTopColor: t.colors.sheenEdge } : null,
            ]}
          >
            {selected ? <Icon name={s.selectedIcon as IconName} size={t.icon.sm} color={s.selectedFg} strokeWidth={2} /> : null}
            <Text {...t.textProps.label} numberOfLines={1} style={[s.type, selected ? null : { fontFamily: t.typography.labelSmRegular.fontFamily }, { color: selected ? s.selectedFg : s.fg }]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
