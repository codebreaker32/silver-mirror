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
  /** Product image; otherwise a category glyph on the sunken tile. */
  image?: ImageSourcePropType;
  glyph?: IconName;
  /** First result: sits on the sheen lavender (productMatchCard.heroBg). */
  hero?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

/**
 * Better-matches product row (component.productMatchCard, showcase 02_home / 06_discover): white, radius 18, hairline +
 * the very soft shadow (graphite-850 + sheen edge in dark), a 44dp grey thumb tile (radius 12), the name on
 * one line in 15 medium, then one reason line with the grey verdict chip inline after it, destination caption. No ratings, review counts, ribbons or logos.
 * One target with one label in visual order.
 */
export function ProductCard({ name, reason, verdict, destination, linkOut = !!destination, image, glyph = 'bottle', hero = false, onPress, accessibilityLabel, accessibilityHint, testID }: ProductCardProps) {
  const t = useTheme();
  const m = t.components.productMatchCard;
  // Showcase 02_home product rows: radius 18, a 44dp grey tile (radius 12), a 15 medium name.
  const radius = 18;
  const thumb = 44;
  const surface = hero
    ? { backgroundColor: m.heroBg, borderRadius: radius }
    : t.dark
      ? { backgroundColor: t.colors.surfaceRaised, borderRadius: radius, borderWidth: 1, borderColor: m.border, borderTopColor: t.colors.sheenEdge }
      : { ...t.elevation['1'].style, borderRadius: radius, borderWidth: 1, borderColor: t.colors.border };
  const label = accessibilityLabel ?? [name, verdict?.label, reason, destination].filter(Boolean).join('. ');
  const body = (
    <>
      <View
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={{ width: thumb, height: thumb, borderRadius: 12, backgroundColor: t.dark ? m.thumbBg : t.colors.secondaryBg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
      >
        {image ? <Image source={image} style={{ width: thumb, height: thumb }} resizeMode="cover" /> : <Icon name={glyph} size={t.icon.md} color={t.colors.textMuted} />}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="bodyStrong" numberOfLines={1} style={[m.name, { fontFamily: 'Geist_500Medium', fontSize: 15, lineHeight: 20, color: m.nameColor }]}>
          {name}
        </Txt>
        {reason || verdict ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[2] }}>
            {reason ? (
              <Txt variant="bodySm" numberOfLines={1} style={[m.fit, { fontFamily: 'Geist_400Regular', fontSize: 13, lineHeight: 18, color: t.colors.textMuted, flexShrink: 1 }]}>
                {reason}
              </Txt>
            ) : null}
            {verdict ? <Tag label={verdict.label} variant={{ verdict: verdict.tone }} /> : null}
          </View>
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
  const box = { ...surface, minHeight: m.minHeight, padding: m.padding, flexDirection: 'row' as const, alignItems: 'center' as const, gap: t.space[3] };
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
      android_ripple={{ color: t.colors.state.ripple }}
      style={({ pressed }) => [box, { minHeight: m.minHeight, overflow: 'hidden', transform: [{ scale: pressed ? 0.99 : 1 }] }]}
    >
      {body}
    </Pressable>
  );
}
