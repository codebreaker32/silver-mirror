import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';
import { Txt } from './Text';

interface SectionHeaderProps {
  /** Sentence case ("Check a product", "Why · 2 reasons"). No eyebrow above it. */
  title: string;
  /** One muted line under the title. */
  supporting?: string;
  /** Optional trailing text action ("See all"), a compact link (type.label 14/20 600 in color.link, 16dp chevron) in a 48dp target. */
  action?: { label: string; onPress: () => void; accessibilityLabel?: string; /** Trailing chevron; false for a dismiss such as "Got it". */ chevron?: boolean; testID?: string };
  testID?: string;
}

/** Section head in type.section (Geist 600 18/24), header role. More space above a heading than below: callers add the gap above. */
export function SectionHeader({ title, supporting, action, testID }: SectionHeaderProps) {
  const t = useTheme();
  const l = t.components.textLink;
  return (
    <View testID={testID} style={{ gap: t.space[1] }}>
      {/* No row minHeight: the action keeps its 48dp target through a negative vertical margin, so a head with an
          action sits as close to its content as one without (DESIGN.md §9.2). */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[2] }}>
        <Txt accessibilityRole="header" variant="section" style={{ flex: 1 }}>
          {title}
        </Txt>
        {action ? (
          <Pressable
            testID={action.testID}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel ?? action.label}
            hitSlop={{ left: t.space[2], right: t.space[2] }}
            style={{ minHeight: t.touch.min, marginVertical: -(t.touch.min - t.typography.section.lineHeight) / 2, flexDirection: 'row', alignItems: 'center', gap: 2 }}
          >
            {({ pressed }) => {
              const fg = pressed ? l.fgPressed : l.fg;
              return (
                <>
                  <Text {...t.textProps.label} style={[l.type, { color: fg }]}>
                    {action.label}
                  </Text>
                  {action.chevron === false ? null : <Icon name="chevron-right" size={t.icon.sm} color={fg} />}
                </>
              );
            }}
          </Pressable>
        ) : null}
      </View>
      {supporting ? (
        <Txt variant="bodySm" tone="muted">
          {supporting}
        </Txt>
      ) : null}
    </View>
  );
}
