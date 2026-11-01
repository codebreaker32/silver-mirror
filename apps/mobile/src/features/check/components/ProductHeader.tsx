import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { textStyle } from '../ui';

/** "Is this the product?" header: the title is plain serif text, never a form field (components.md §5). */
export function ProductHeader({ title, meta, kicker = 'Is this the product?' }: { title: string | null; meta?: string | null; kicker?: string }) {
  const t = useTheme();
  const h = t.components.productHeader;
  return (
    <View style={{ gap: h.gap }}>
      <Text style={[textStyle(h.kicker), { color: h.kickerColor }]}>{kicker}</Text>
      {title ? (
        <Text accessibilityRole="header" style={[h.title, { color: h.titleColor }]}>
          {title}
        </Text>
      ) : (
        <View style={{ gap: t.space[2] }} accessibilityLabel="Reading the shared link">
          <View style={{ height: t.space[6], width: '80%', borderRadius: t.radius.xs, backgroundColor: t.colors.bgSunken }} />
          <View style={{ height: t.space[6], width: '55%', borderRadius: t.radius.xs, backgroundColor: t.colors.bgSunken }} />
        </View>
      )}
      {meta ? <Text style={[textStyle(h.meta), { color: h.metaColor }]}>{meta}</Text> : null}
    </View>
  );
}

export function HeadSkeleton({ label }: { label: string }) {
  const t = useTheme();
  return (
    <View accessible accessibilityLabel={label} accessibilityState={{ busy: true }} style={{ gap: t.space[3] }}>
      <View style={{ height: t.space[20], borderRadius: t.components.verdictCard.head.radius, backgroundColor: t.colors.bgSunken }} />
      <Text accessibilityLiveRegion="polite" style={[t.type.body, { color: t.colors.textMuted }]}>
        {label}
      </Text>
    </View>
  );
}
