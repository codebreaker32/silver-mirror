import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';

export function Tag({ label, variant = 'neutral', icon }: { label: string; variant?: 'neutral' | 'outline'; icon?: IconName }) {
  const theme = useTheme();
  const t = theme.components.tag;
  return (
    <View
      style={{
        minHeight: t.height,
        paddingHorizontal: t.paddingX,
        borderRadius: t.radius,
        backgroundColor: variant === 'neutral' ? t.bg : 'transparent',
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: theme.colors.borderStrong,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space[1],
      }}
    >
      {icon ? <Icon name={icon} size={theme.icon.sm} color={t.fg} /> : null}
      <Text style={[t.type, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

export function KeepChip({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        minHeight: 32,
        paddingHorizontal: theme.space[3],
        borderRadius: theme.radius.sm,
        backgroundColor: theme.components.bandChip.bg,
        justifyContent: 'center',
      }}
    >
      <Text style={[theme.type.label, { color: theme.components.bandChip.fg }]}>{label}</Text>
    </View>
  );
}
