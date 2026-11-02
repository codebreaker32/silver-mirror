import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, Txt, type IconName } from '@/components';
import { ProductArt } from '@/components/ProductArt';
import { displayTitle } from '../display';

const TITLE_TYPE = { fontFamily: 'Geist_600SemiBold', fontSize: 18, lineHeight: 24, letterSpacing: -0.2 } as const;
const META_TYPE = { fontFamily: 'Geist_400Regular', fontSize: 13, lineHeight: 18, letterSpacing: 0 } as const;

const BRAND_TYPE = { fontFamily: 'Geist_500Medium', fontSize: 14, lineHeight: 20, letterSpacing: 0 } as const;
const NAME_TYPE = { fontFamily: 'NotoSerifDisplay_400Regular', fontSize: 28, lineHeight: 34, letterSpacing: -0.3 } as const;
/** The product-art plate (reference product detail): one lavender-grey step under the page, radius 16. */
const PLATE = '#E9E7F0';
const PLATE_HEIGHT = 248;
const CAPTION_TYPE = { fontFamily: 'Geist_400Regular', fontSize: 11, lineHeight: 14, letterSpacing: 0.1 } as const;

/**
 * Product hero (reference product detail): a full-width image plate filled edge to edge by the category's licensed
 * photo (ProductArt), a tiny muted "Illustrative photo" caption under it so it never reads as the exact product, then
 * the brand (14 muted), the name in the serif display face on at most two lines, and one muted meta line (size · source). `trailing` sits in the plate's top-right corner (the SaveHeart).
 */
export function ProductHero({
  brand,
  name,
  meta,
  category,
  trailing,
}: {
  brand: string | null;
  name: string;
  meta?: string | null;
  category: string;
  trailing?: ReactNode;
}) {
  const t = useTheme();
  return (
    <View style={{ gap: t.space[4] }}>
      <View style={{ gap: 6 }}>
        <View
          style={{ height: PLATE_HEIGHT, borderRadius: 16, backgroundColor: PLATE, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
          testID="product-plate"
        >
          <ProductArt category={category} size={PLATE_HEIGHT} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 16 }} />
          {trailing ? <View style={{ position: 'absolute', top: t.space[2], right: t.space[2] }}>{trailing}</View> : null}
        </View>
        <Txt variant="caption" testID="product-photo-caption" style={[CAPTION_TYPE, { color: t.colors.textMuted }]}>
          Illustrative photo
        </Txt>
      </View>
      <View style={{ gap: t.space[1] }}>
        {brand ? (
          <Txt variant="caption" style={[BRAND_TYPE, { color: t.colors.textMuted }]}>
            {brand}
          </Txt>
        ) : null}
        <Txt accessibilityRole="header" variant="title" numberOfLines={2} style={[NAME_TYPE, { color: t.colors.text }]}>
          {displayTitle(name)}
        </Txt>
        {meta ? (
          <Txt variant="caption" style={[META_TYPE, { color: t.colors.textMuted }]}>
            {meta}
          </Txt>
        ) : null}
      </View>
    </View>
  );
}

/** Hero placeholder in the final layout (plate, brand, two name lines, meta), shown while the link is read. */
export function HeroSkeleton() {
  const t = useTheme();
  const bar = (w: `${number}%`, h: number) => <View style={{ height: h, width: w, borderRadius: 8, backgroundColor: t.colors.bgSunken }} />;
  return (
    <View style={{ gap: t.space[4] }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <View style={{ height: PLATE_HEIGHT, borderRadius: 16, backgroundColor: PLATE }} />
      <View style={{ gap: t.space[2] }}>
        {bar('30%', 14)}
        {bar('85%', 26)}
        {bar('55%', 26)}
        {bar('25%', 13)}
      </View>
    </View>
  );
}

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
          borderRadius: 16,
          backgroundColor: t.colors.bgSunken,
        }}
      />
      <Txt variant="body" tone="muted" accessibilityLiveRegion="polite">
        {label}
      </Txt>
    </View>
  );
}
