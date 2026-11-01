import { Pressable, Text, View } from 'react-native';
import type { KeyProfile } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { shortDate } from '@/features/check/format';
import { Tag } from '@/features/check/ui';

export function keyChipText(key: KeyProfile | null, isDemo: boolean): { title: string; sub: string } {
  if (!key) return { title: 'No Key yet', sub: 'Scan once to check products against your readings' };
  if (isDemo || key.source === 'demo') return { title: 'Demo Key', sub: 'Labelled sample readings, not a scan' };
  return { title: 'Your Key', sub: `Scan ${shortDate(key.scanDate)} · photo deleted` };
}

export function KeyChip({ keyProfile, isDemo, onPress }: { keyProfile: KeyProfile | null; isDemo: boolean; onPress: () => void }) {
  const t = useTheme();
  const { title, sub } = keyChipText(keyProfile, isDemo);
  const demo = isDemo || keyProfile?.source === 'demo';
  return (
    <Pressable
      testID="key-chip"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${sub}. ${keyProfile ? 'Open your Key' : 'Start scan'}`}
      android_ripple={{ color: t.colors.state.ripple }}
      style={({ pressed }) => ({
        minHeight: t.touch.min,
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[3],
        paddingHorizontal: t.space[4],
        paddingVertical: t.space[2],
        borderRadius: t.radius.lg,
        backgroundColor: pressed ? t.colors.state.pressed : t.components.bandChip.bg,
        alignSelf: 'flex-start',
      })}
    >
      <View style={{ gap: t.space[1] }}>
        <View style={{ flexDirection: 'row', gap: t.space[2], alignItems: 'center' }}>
          <Text style={[t.type.label, { color: t.colors.text }]}>{title}</Text>
          {demo ? <Tag label="Demo profile" variant="outline" /> : null}
        </View>
        <Text style={[t.type.caption, { color: t.colors.textMuted }]}>{sub}</Text>
      </View>
    </Pressable>
  );
}
