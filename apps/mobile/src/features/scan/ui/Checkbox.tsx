import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from './haptics';
import { Icon } from './Icon';

export function CheckboxRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  const theme = useTheme();
  const cb = theme.components.consentSheet.checkbox;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={() => {
        haptic(checked ? 'toggleOff' : 'toggleOn');
        onChange(!checked);
      }}
      style={{ minHeight: cb.target, flexDirection: 'row', alignItems: 'center', gap: theme.space[3] }}
    >
      <View
        style={{
          width: cb.size,
          height: cb.size,
          borderRadius: theme.radius.xs,
          borderWidth: 1.5,
          borderColor: checked ? cb.checked : cb.border,
          backgroundColor: checked ? cb.checked : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked ? <Icon name="check" size={theme.icon.sm} color={cb.check} /> : null}
      </View>
      <Text style={[theme.type.bodyStrong, { color: theme.colors.text, flex: 1 }]}>{label}</Text>
    </Pressable>
  );
}
