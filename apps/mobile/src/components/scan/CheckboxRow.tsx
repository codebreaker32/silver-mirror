import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '../haptics';
import { Icon } from '../Icon';
import { Txt } from '../Text';

interface CheckboxRowProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  /** Muted line under the label (the 18+ helper while unticked). Read with the label. */
  supporting?: string;
  testID?: string;
}

/**
 * Consent checkbox row (consentSheet.checkbox): 24dp rounded box in a 48dp+ row, never pre-ticked.
 * Checked = slate fill + on-accent check, so the state never rests on colour alone.
 */
export function CheckboxRow({ label, checked, onChange, supporting, testID }: CheckboxRowProps) {
  const t = useTheme();
  const cb = t.components.consentSheet.checkbox;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={supporting ? `${label}. ${supporting}` : label}
      onPress={() => {
        haptic(checked ? 'toggleOff' : 'toggleOn');
        onChange(!checked);
      }}
      android_ripple={{ color: t.colors.state.ripple }}
      style={({ pressed }) => ({
        minHeight: cb.target,
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[3],
        paddingVertical: t.space[1],
        borderRadius: t.radius.md,
        backgroundColor: pressed ? t.colors.state.pressed : cb.rowBg,
      })}
    >
      <View
        style={{
          width: cb.size,
          height: cb.size,
          borderRadius: t.radius.sm,
          borderWidth: checked ? 0 : 1.5,
          borderColor: cb.border,
          backgroundColor: checked ? cb.checked : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked ? <Icon name="check" size={t.icon.sm} color={cb.check} strokeWidth={2} /> : null}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="bodyStrong">{label}</Txt>
        {supporting ? (
          <Txt variant="bodySm" tone="muted">
            {supporting}
          </Txt>
        ) : null}
      </View>
    </Pressable>
  );
}
