import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { PillButton } from './PillButton';
import { Txt } from './Text';

interface SectionHeaderProps {
  /** Sentence case ("Check a product", "Why · 2 reasons"). No eyebrow above it. */
  title: string;
  /** One muted line under the title. */
  supporting?: string;
  /** Optional trailing text action ("See all"), rendered as a tertiary pill. */
  action?: { label: string; onPress: () => void; accessibilityLabel?: string };
  testID?: string;
}

/** Section head in type.section (Geist 600 17/24), header role. More space above a heading than below: callers add the gap above. */
export function SectionHeader({ title, supporting, action, testID }: SectionHeaderProps) {
  const t = useTheme();
  return (
    <View testID={testID} style={{ gap: t.space[1] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[2], minHeight: action ? t.touch.min : undefined }}>
        <Txt accessibilityRole="header" variant="section" style={{ flex: 1 }}>
          {title}
        </Txt>
        {action ? (
          <PillButton
            variant="tertiary"
            label={action.label}
            trailingIcon="chevron-right"
            onPress={action.onPress}
            accessibilityLabel={action.accessibilityLabel}
            style={{ marginRight: -t.components.button.tertiary.paddingX }}
          />
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
