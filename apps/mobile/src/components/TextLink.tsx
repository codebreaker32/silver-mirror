import { Pressable, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';

interface TextLinkProps {
  label: string;
  onPress: () => void;
  /** Leaves the app: adds the arrow-up-right icon and ", opens in browser" to the label unless one is given. */
  external?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

/** Inline underlined link (component.textLink) in a 48dp target. External links drop the underline for the arrow. */
export function TextLink({ label, onPress, external = false, accessibilityLabel, testID }: TextLinkProps) {
  const t = useTheme();
  const l = t.components.textLink;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? (external ? `${label}, opens in browser` : label)}
      style={{ minHeight: l.minTarget, flexDirection: 'row', alignItems: 'center', gap: t.space[1], alignSelf: 'flex-start' }}
    >
      {({ pressed }) => (
        <>
          <Text
            {...t.textProps.label}
            style={[
              l.type,
              {
                color: pressed ? l.fgPressed : l.fg,
                textDecorationLine: external ? 'none' : 'underline',
                textDecorationColor: pressed ? l.fgPressed : l.fg,
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
