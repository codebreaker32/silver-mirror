import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, Txt, type IconName } from '@/components';
import { displayTitle } from '../display';

const TITLE_TYPE = { fontFamily: 'Geist_600SemiBold', fontSize: 18, lineHeight: 24, letterSpacing: -0.2 } as const;
const META_TYPE = { fontFamily: 'Geist_400Regular', fontSize: 13, lineHeight: 18, letterSpacing: 0 } as const;

/**
 * Product header (component.productHeader, showcase 02_home product rows): a 44dp grey rounded thumb tile (radius 12,
 * the category glyph in muted ink), then beside it the product name in Geist 600 18/24 on at most two lines,
 * title-cased, and one muted 13 meta line. Plain text, never a form field, and
 * no "Is this the product?" kicker (the SKU sheet already asked).
 */
export function ProductHeader({ title, meta, glyph }: { title: string | null; meta?: string | null; glyph?: IconName }) {
  const t = useTheme();
  const h = t.components.productHeader;
  const row = t.components.listRow;
  const thumb = 44;
  const text = (
    <View style={{ gap: 2, flex: glyph ? 1 : undefined }}>
      {title ? (
        <Txt accessibilityRole="header" variant="title" numberOfLines={2} style={[h.title, TITLE_TYPE, { color: h.titleColor }]}>
          {displayTitle(title)}
        </Txt>
      ) : (
        <View style={{ gap: t.space[2] }} accessible accessibilityLabel="Reading the shared link">
          <View style={{ height: t.space[4], width: '80%', borderRadius: t.radius.sm, backgroundColor: t.colors.bgSunken }} />
          <View style={{ height: t.space[4], width: '55%', borderRadius: t.radius.sm, backgroundColor: t.colors.bgSunken }} />
        </View>
      )}
      {meta ? (
        <Txt variant="caption" style={[h.meta, META_TYPE, { color: t.colors.textMuted }]}>
          {meta}
        </Txt>
      ) : null}
    </View>
  );
  if (!glyph) return text;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[3] }}>
      <View
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={{
          width: thumb,
          height: thumb,
          borderRadius: 12,
          backgroundColor: t.dark ? row.thumbBg : t.colors.secondaryBg,
          alignItems: 'center',
          justifyContent: 'center',
          ...(t.dark ? { borderWidth: 1, borderColor: t.colors.border, borderTopColor: t.colors.sheenEdge } : null),
        }}
      >
        <Icon name={glyph} size={t.icon.md} color={t.dark ? row.thumbIcon : t.colors.textMuted} />
      </View>
      {text}
    </View>
  );
}

/** Placeholder where the verdict head will land: same radius as the head (18), a busy node and a polite status line. */
export function HeadSkeleton({ label }: { label: string }) {
  const t = useTheme();
  return (
    <View accessible accessibilityLabel={label} accessibilityState={{ busy: true }} style={{ gap: t.space[3] }}>
      <View
        style={{
          height: t.space[20] + t.space[4],
          borderRadius: 18,
          backgroundColor: t.colors.bgSunken,
        }}
      />
      <Txt variant="body" tone="muted" accessibilityLiveRegion="polite">
        {label}
      </Txt>
    </View>
  );
}
