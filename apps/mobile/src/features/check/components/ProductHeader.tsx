import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, Txt, type IconName } from '@/components';
import { displayTitle } from '../display';

/**
 * Product header (component.productHeader): a 64dp soft thumb tile (listRow.thumbBg, radius.tile, the category glyph in
 * lavender; the showcase 06_discover product-tile language, same as the Better matches cards), then beside it the product
 * name in type.title (Geist 600 22/28, left), title-cased, and one muted meta line. Plain text, never a form field, and
 * no "Is this the product?" kicker (the SKU sheet already asked).
 */
export function ProductHeader({ title, meta, glyph }: { title: string | null; meta?: string | null; glyph?: IconName }) {
  const t = useTheme();
  const h = t.components.productHeader;
  const row = t.components.listRow;
  const thumb = 64;
  const text = (
    <View style={{ gap: t.space[2], flex: glyph ? 1 : undefined }}>
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
  if (!glyph) return text;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[4] }}>
      <View
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={{
          width: thumb,
          height: thumb,
          borderRadius: t.radius.tile,
          backgroundColor: row.thumbBg,
          alignItems: 'center',
          justifyContent: 'center',
          ...(t.dark ? { borderWidth: 1, borderColor: t.colors.border, borderTopColor: t.colors.sheenEdge } : null),
        }}
      >
        <Icon name={glyph} size={t.icon.lg + 4} color={row.thumbIcon} />
      </View>
      {text}
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
