import { useId, useState } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { PHOTOS, PHOTO_SUBJECT } from './photos';
import { PRODUCT_PHOTOS, PRODUCT_PHOTO_TITLES } from './productPhotos';

/**
 * Product art. When `productId` names a catalogue product with a real pack photo from Open Beauty Facts
 * (apps/mobile/assets/images/products, CC BY-SA 3.0, see productPhotos.ts), that photo is shown whole ("contain") on the
 * #E9E7F0 plate and labelled "Photo of <brand name>". Otherwise: a licensed, illustrative photo per category (apps/mobile/assets/images/photos, credits in
 * docs/CREDITS.md), cover-cropped to fill the box with the box's own corner radius. Unknown categories get the serum
 * photo. The photo stands for the category, never the exact product: its label says "(illustrative)".
 *
 *   serum        dropper bottle         sunscreen    blank tubes
 *   moisturiser  cream jar              tinted_spf   skin-tone swatches
 *   cleanser     pump bottle            anything else  the serum photo
 *
 * If the image fails to load, the drawn silhouette below (silver-lavender shading, charcoal caps) stands in, hidden
 * from screen readers like before.
 */
export type ProductArtCategory = 'serum' | 'moisturiser' | 'cleanser' | 'sunscreen' | 'tinted_spf';

export interface ProductArtProps {
  category: ProductArtCategory | string;
  /** Edge of the square box, in dp. */
  size: number;
  style?: StyleProp<ViewStyle>;
  /** Catalogue id: shows the product's own pack photo when one is bundled. */
  productId?: string | null;
}

/** The plate behind a pack photo, so a contained photo never shows a hole at its edges. */
export const PRODUCT_PHOTO_PLATE = '#E9E7F0';

/** True when `productId` has a bundled pack photo (the hero uses it to pick its caption). */
export function hasProductPhoto(productId: string | null | undefined): boolean {
  return !!productId && PRODUCT_PHOTOS[productId] !== undefined;
}

/** Normalises a catalogue category ("Moisturizer", "tinted-spf", "SPF") to one of the five shapes. */
export function artShape(category: string): ProductArtCategory | 'bottle' {
  const c = category.toLowerCase().replace(/[\s-]+/g, '_');
  if (c.includes('tint')) return 'tinted_spf';
  if (c.includes('serum') || c.includes('essence') || c.includes('oil')) return 'serum';
  if (c.includes('moistur') || c.includes('cream') || c.includes('gel') || c.includes('balm')) return 'moisturiser';
  if (c.includes('cleans') || c.includes('wash') || c.includes('toner')) return 'cleanser';
  if (c.includes('sun') || c.includes('spf')) return 'sunscreen';
  return 'bottle';
}

// Sand tint for the tinted-SPF swatch only: a muted neutral, never pink.
const TINT = '#CDBFB1';

export function ProductArt({ category, size, style, productId }: ProductArtProps) {
  const t = useTheme();
  const [failed, setFailed] = useState(false);
  const [packFailed, setPackFailed] = useState(false);
  const radius = StyleSheet.flatten(style)?.borderRadius;
  const pack = productId && !packFailed ? PRODUCT_PHOTOS[productId] : undefined;
  if (pack !== undefined && productId) {
    return (
      <View
        style={[{ width: size, height: size, overflow: 'hidden', backgroundColor: PRODUCT_PHOTO_PLATE }, style]}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Photo of ${PRODUCT_PHOTO_TITLES[productId] ?? 'the product'}`}
        pointerEvents="none"
        testID="product-photo"
      >
        <Image
          source={pack}
          resizeMode="contain"
          onError={() => setPackFailed(true)}
          style={{ width: '100%', height: '100%', borderRadius: typeof radius === 'number' ? radius : 0 }}
        />
      </View>
    );
  }
  if (failed) return <ProductArtDrawing category={category} size={size} style={style} />;
  const shape = artShape(category);
  const key = shape === 'bottle' ? 'serum' : shape;
  return (
    <View
      style={[{ width: size, height: size, overflow: 'hidden', backgroundColor: t.colors.bgSunken }, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Photo of ${PHOTO_SUBJECT[key]} (illustrative)`}
      pointerEvents="none"
    >
      <Image
        source={PHOTOS[key]}
        resizeMode="cover"
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%', borderRadius: typeof radius === 'number' ? radius : 0 }}
      />
    </View>
  );
}

/** The drawn silhouette: only shown when the category photo fails to load. Decorative. */
function ProductArtDrawing({ category, size, style }: ProductArtProps) {
  const t = useTheme();
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '');
  const body = `pa-body-${raw}`;
  const cap = `pa-cap-${raw}`;
  const shape = artShape(category);

  // Silver body: near-white at the top settling into lavender-grey at the base.
  const bodyTop = t.colors.surface;
  const bodyMid = t.colors.sheen.silver;
  const bodyBase = t.colors.mark.chrome3;
  const ink = t.colors.accent;
  const inkDeep = t.colors.accentPressed;
  const label = t.colors.surface;
  const rule = t.colors.mark.chrome1;
  const gloss = t.colors.mark.glint;

  const B = `url(#${body})`;
  const C = `url(#${cap})`;

  return (
    <View
      style={[{ width: size, height: size }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id={body} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={bodyTop} />
            <Stop offset="0.55" stopColor={bodyMid} />
            <Stop offset="1" stopColor={bodyBase} />
          </LinearGradient>
          <LinearGradient id={cap} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={ink} />
            <Stop offset="1" stopColor={inkDeep} />
          </LinearGradient>
        </Defs>

        {shape === 'serum' ? (
          <G>
            {/* dropper bulb, collar, then a square-shouldered bottle */}
            <Path d="M44 22 C44 14 56 14 56 22 L56 33 L44 33 Z" fill={C} />
            <Rect x={40} y={32} width={20} height={11} rx={2.5} fill={C} />
            <Path d="M36 49 Q36 44 41 44 L59 44 Q64 44 64 49 L64 86 Q64 90 60 90 L40 90 Q36 90 36 86 Z" fill={B} />
            <Rect x={36} y={60} width={28} height={15} fill={label} opacity={0.9} />
            <Rect x={41} y={65} width={14} height={1.6} rx={0.8} fill={rule} />
            <Rect x={41} y={69} width={9} height={1.4} rx={0.7} fill={rule} opacity={0.7} />
            <Rect x={39} y={47} width={2.4} height={37} rx={1.2} fill={gloss} opacity={0.55} />
          </G>
        ) : shape === 'moisturiser' ? (
          <G>
            {/* squat jar under a wide charcoal lid */}
            <Rect x={21} y={42} width={58} height={14} rx={4} fill={C} />
            <Rect x={23} y={55} width={54} height={2} fill={inkDeep} opacity={0.35} />
            <Path d="M24 57 L76 57 L76 80 Q76 87 69 87 L31 87 Q24 87 24 80 Z" fill={B} />
            <Rect x={24} y={64} width={52} height={12} fill={label} opacity={0.9} />
            <Rect x={40} y={68.5} width={20} height={1.6} rx={0.8} fill={rule} />
            <Rect x={45} y={72} width={10} height={1.4} rx={0.7} fill={rule} opacity={0.7} />
            <Rect x={28} y={59} width={2.4} height={24} rx={1.2} fill={gloss} opacity={0.55} />
          </G>
        ) : shape === 'cleanser' ? (
          <G>
            {/* pump head with a spout, stem, collar, tall rounded bottle */}
            <Path d="M40 15 L63 15 Q66 15 66 18 L66 19 Q66 21 63 21 L40 21 Q38 21 38 19 L38 17 Q38 15 40 15 Z" fill={C} />
            <Rect x={47.5} y={21} width={5} height={9} fill={C} />
            <Rect x={42} y={29} width={16} height={8} rx={2} fill={C} />
            <Path d="M33 45 Q33 37 41 37 L59 37 Q67 37 67 45 L67 85 Q67 90 62 90 L38 90 Q33 90 33 85 Z" fill={B} />
            <Rect x={33} y={56} width={34} height={18} fill={label} opacity={0.9} />
            <Rect x={39} y={62} width={16} height={1.6} rx={0.8} fill={rule} />
            <Rect x={39} y={66} width={11} height={1.4} rx={0.7} fill={rule} opacity={0.7} />
            <Rect x={36.5} y={42} width={2.4} height={43} rx={1.2} fill={gloss} opacity={0.55} />
          </G>
        ) : shape === 'sunscreen' || shape === 'tinted_spf' ? (
          <G>
            {/* crimped tube standing on its cap */}
            <Rect x={28} y={11} width={44} height={7} rx={1.5} fill={bodyMid} />
            <Rect x={28} y={13.5} width={44} height={0.8} fill={rule} opacity={0.5} />
            <Rect x={28} y={15.5} width={44} height={0.8} fill={rule} opacity={0.5} />
            <Path d="M29 18 L71 18 Q70 50 62 74 L38 74 Q30 50 29 18 Z" fill={B} />
            <Path d="M33 34 L67 34 Q66 44 64 52 L36 52 Q34 44 33 34 Z" fill={label} opacity={0.9} />
            <Rect x={41} y={40} width={18} height={1.6} rx={0.8} fill={rule} />
            <Rect x={44} y={44.5} width={12} height={1.4} rx={0.7} fill={rule} opacity={0.7} />
            {shape === 'tinted_spf' ? <Rect x={46} y={57} width={8} height={8} rx={4} fill={TINT} /> : null}
            <Rect x={37} y={74} width={26} height={15} rx={3} fill={C} />
            <Path d="M33 21 Q34 44 39 66" stroke={gloss} strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.55} />
          </G>
        ) : (
          <G>
            <Rect x={42} y={22} width={16} height={12} rx={2.5} fill={C} />
            <Path d="M35 42 Q35 34 43 34 L57 34 Q65 34 65 42 L65 85 Q65 90 60 90 L40 90 Q35 90 35 85 Z" fill={B} />
            <Rect x={35} y={56} width={30} height={16} fill={label} opacity={0.9} />
            <Rect x={40} y={62} width={14} height={1.6} rx={0.8} fill={rule} />
            <Rect x={38.5} y={40} width={2.4} height={44} rx={1.2} fill={gloss} opacity={0.55} />
          </G>
        )}
      </Svg>
    </View>
  );
}
