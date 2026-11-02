import { Image, type ImageSourcePropType, Pressable, View } from 'react-native';
import type { Verdict } from '@skinkey/design';
import { useTheme } from '@/theme/ThemeProvider';
import { Tag } from './Chip';
import { Icon, type IconName } from './Icon';
import { Txt } from './Text';

export interface ProductCardProps {
  /** Title-cased product name. */
  name: string;
  /** One reason line, where commerce would put stars ("Oil-free gel, no fragrance"). */
  reason?: string;
  /** Verdict tag (icon + label). */
  verdict?: { tone: Verdict; label: string };
  /** Muted destination caption ("Opens an Amazon.in search"). Lists with a shared destination line leave it out. */
  destination?: string;
  /** The card opens a store outside the app (arrow-up-right, link role) even without its own destination caption. */
  linkOut?: boolean;
  /** Real product image (40dp thumbnail, radius 12). Without one the row shows no thumbnail at all. */
  image?: ImageSourcePropType;
  /** Legacy: glyph tiles are retired (no pastel icon tiles); kept so callers compile. */
  glyph?: IconName;
  /** First result: sits on the sheen lavender (productMatchCard.heroBg). */
  hero?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

/**
 * Better-matches product row (component.productMatchCard, Silver & graphite): a row set on ONE shared surface card
 * (BetterMatches wraps the list in Card variant="raised"); rows are separated by spacing, never dividers, and carry no
 * surface of their own. A 40dp thumbnail (radius 12) shows only when a real product image exists; no glyph tiles. The
 * name runs to two lines in 15 medium, the verdict tag sits on its own line under it, then one full-width reason line.
 * No ratings, review counts, ribbons or logos. One target with one label in visual order.
 * `standalone` draws the surface tone behind a single row (the kit sample); lists leave it off.
 */
export function ProductCard({
  name,
  reason,
  verdict,
  destination,
  linkOut = !!destination,
  image,
  glyph: _glyph,
  hero = false,
  standalone = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ProductCardProps & { standalone?: boolean }) {
  const t = useTheme();
  const m = t.components.productMatchCard;
  const thumb = 40;
  const surface = hero
    ? { backgroundColor: m.heroBg, borderRadius: t.radius.lg, padding: m.padding }
    : standalone
      ? { backgroundColor: t.dark ? t.colors.surfaceRaised : t.colors.surface, borderRadius: t.radius.lg, padding: t.spacing.insetCard }
      : null;
  const label = accessibilityLabel ?? [name, verdict?.label, reason, destination].filter(Boolean).join('. ');
  const body = (
    <>
      {image ? (
        <View
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={{ width: thumb, height: thumb, borderRadius: 12, backgroundColor: t.colors.thumbTile, overflow: 'hidden' }}
        >
          <Image source={image} style={{ width: thumb, height: thumb }} resizeMode="cover" />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: t.space[1] }}>
        <Txt variant="bodyStrong" numberOfLines={2} style={[m.name, { fontFamily: 'Geist_500Medium', fontSize: 15, lineHeight: 20, color: t.colors.text }]}>
          {name}
        </Txt>
        {verdict ? (
          <View style={{ flexDirection: 'row' }}>
            <Tag label={verdict.label} variant={{ verdict: verdict.tone }} />
          </View>
        ) : null}
        {reason ? (
          <Txt variant="bodySm" numberOfLines={1} style={[m.fit, { fontFamily: 'Geist_400Regular', fontSize: 13, lineHeight: 18, color: t.colors.textMuted }]}>
            {reason}
          </Txt>
        ) : null}
        {destination ? (
          <Txt variant="caption" style={[m.meta, { color: m.metaColor }]}>
            {destination}
          </Txt>
        ) : null}
      </View>
      {onPress ? <Icon name={linkOut ? 'arrow-up-right' : 'chevron-right'} size={t.icon.md} color={t.colors.textMuted} /> : null}
    </>
  );
  const box = { ...surface, minHeight: t.touch.min, flexDirection: 'row' as const, alignItems: 'flex-start' as const, gap: t.space[3] };
  if (!onPress) {
    return (
      <View testID={testID} accessible accessibilityLabel={label} style={box}>
        {body}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole={linkOut ? 'link' : 'button'}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [box, { minHeight: t.touch.min, opacity: pressed ? 0.6 : 1 }]}
    >
      {body}
    </Pressable>
  );
}
