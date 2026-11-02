import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { homeType } from './homeType';

interface HomeHeadingProps {
  /** Sentence case, no eyebrow above it. */
  title: string;
  /** Optional trailing text action ("Got it", "See all") in the link colour, 48dp target. */
  action?: { label: string; onPress: () => void; testID?: string; accessibilityLabel?: string };
}

/** Home section heading: Geist 600 17/22 in ink, header role, an optional text action at the right. */
export function HomeHeading({ title, action }: HomeHeadingProps) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[2] }}>
      <Text accessibilityRole="header" style={[homeType.title, { flex: 1, color: t.colors.text }]}>
        {title}
      </Text>
      {action ? (
        <Pressable
          testID={action.testID}
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.accessibilityLabel ?? action.label}
          hitSlop={{ left: t.space[2], right: t.space[2] }}
          style={{ minHeight: t.touch.min, marginVertical: -(t.touch.min - 22) / 2, justifyContent: 'center' }}
        >
          {({ pressed }) => <Text style={[homeType.bodyStrong, { color: pressed ? t.colors.linkPressed : t.colors.link }]}>{action.label}</Text>}
        </Pressable>
      ) : null}
    </View>
  );
}
