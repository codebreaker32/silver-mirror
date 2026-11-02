import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Txt } from '@/components';
import { displayTitle } from '../display';

/**
 * Product header (component.productHeader): the product name in the serif title, title-cased, then one muted meta
 * line. Plain text, never a form field, and no "Is this the product?" kicker (the SKU sheet already asked).
 */
export function ProductHeader({ title, meta }: { title: string | null; meta?: string | null }) {
  const t = useTheme();
  const h = t.components.productHeader;
  return (
    <View style={{ gap: t.space[2] }}>
      {title ? (
        <Txt accessibilityRole="header" variant="title" numberOfLines={3} style={[h.title, { color: h.titleColor }]}>
          {displayTitle(title)}
        </Txt>
      ) : (
        <View style={{ gap: t.space[2] }} accessible accessibilityLabel="Reading the shared link">
          <View style={{ height: t.space[6], width: '80%', borderRadius: t.radius.sm, backgroundColor: t.colors.bgSunken }} />
          <View style={{ height: t.space[6], width: '55%', borderRadius: t.radius.sm, backgroundColor: t.colors.bgSunken }} />
        </View>
      )}
      {meta ? (
        <Txt variant="caption" style={[h.meta, { color: h.metaColor }]}>
          {meta}
        </Txt>
      ) : null}
    </View>
  );
}

/** Placeholder where the verdict head will land: same radius as the head, a busy node and a polite status line. */
export function HeadSkeleton({ label }: { label: string }) {
  const t = useTheme();
  return (
    <View accessible accessibilityLabel={label} accessibilityState={{ busy: true }} style={{ gap: t.space[3] }}>
      <View
        style={{
          height: t.space[20] + t.space[4],
          borderRadius: t.components.verdictCard.head.radius,
          backgroundColor: t.colors.bgSunken,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: t.colors.border,
        }}
      />
      <Txt variant="body" tone="muted" accessibilityLiveRegion="polite">
        {label}
      </Txt>
    </View>
  );
}
