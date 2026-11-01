import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { Tone } from '../present';
import { VerdictIcon } from './Icon';

type TagVariant = 'neutral' | 'outline' | { verdict: Tone };

export function Tag({ label, variant = 'neutral' }: { label: string; variant?: TagVariant }) {
  const t = useTheme();
  const tag = t.components.tag;
  const tone = typeof variant === 'object' ? variant.verdict : null;
  const colors = tone ? t.colors.verdict[tone] : null;
  return (
    <View
      style={{
        minHeight: tag.visualMinHeight,
        paddingHorizontal: tag.paddingX,
        borderRadius: tag.radius,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[1],
        backgroundColor: colors ? colors.bg : variant === 'outline' ? 'transparent' : tag.bg,
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: tag.outlineBorder,
      }}
    >
      {tone && colors ? <VerdictIcon tone={tone} size={t.icon.sm} color={colors.fg} /> : null}
      <Text style={[tag.type, { color: colors ? colors.fg : tag.fg }]}>{label}</Text>
    </View>
  );
}
