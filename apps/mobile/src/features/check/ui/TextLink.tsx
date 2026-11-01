import { Pressable, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';

interface TextLinkProps {
  label: string;
  onPress: () => void;
  external?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

export function TextLink({ label, onPress, external = false, accessibilityLabel, testID }: TextLinkProps) {
  const t = useTheme();
  const l = t.components.textLink;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? (external ? `${label}, opens in browser` : label)}
      hitSlop={{ top: t.space[2], bottom: t.space[2] }}
      style={{ minHeight: l.minTarget, flexDirection: 'row', alignItems: 'center', gap: t.space[1], alignSelf: 'flex-start' }}
    >
      {({ pressed }) => (
        <>
          <Text
            style={[
              t.type.label,
              {
                color: pressed ? l.fgPressed : l.fg,
                textDecorationLine: external ? 'none' : 'underline',
                textDecorationColor: l.fg,
              },
            ]}
          >
            {label}
          </Text>
          {external ? <Icon name="arrow-up-right" size={t.icon.sm} color={pressed ? l.fgPressed : l.fg} /> : null}
        </>
      )}
    </Pressable>
  );
}
