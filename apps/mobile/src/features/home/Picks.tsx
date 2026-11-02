import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, SectionHeader } from '@/components';
import { useGlass } from '@/components/glass';
import { categoryGlyph } from '@/features/check/display';
import type { HomePick } from './usePicks';

const CARD_W = 152;
const TILE_H = 128;

/**
 * "Picks for you" (dashboard reference "Recommended for you"): a section head over a horizontal rail of tall glass
 * cards. Each card: a pastel tile (pink, lilac, lavender in turn) with the category glyph, never a product photo; the
 * brand in muted caption, the product name on two lines, and a small FITS tag where the reference shows a price.
 * No See all: there is no standalone matches list to open. A card opens /check for that product by name.
 */
export function Picks({ picks, onOpen }: { picks: readonly HomePick[]; onOpen: (query: string) => void }) {
  const t = useTheme();
  const glass = useGlass(22);
  const tiles = [t.colors.tilePink, t.colors.tileLilac, t.colors.tileLavender];
  const gutter = t.spacing.gutter;
  // Room above and below the cards so the soft shadow is not clipped by the rail.
  const shadowRoom = t.space[3];
  const fits = t.colors.verdict.fits;
  return (
    <View testID="home-picks" style={{ gap: t.space[3] - shadowRoom }}>
      <SectionHeader title="Picks for you" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityLabel="Products that fit your reading"
        style={{ marginHorizontal: -gutter }}
        contentContainerStyle={{ paddingHorizontal: gutter, paddingVertical: shadowRoom, gap: t.space[3] }}
      >
        {picks.map((p, i) => (
          <Pressable
            key={p.productId}
            testID={`home-pick-${i}`}
            onPress={() => onOpen(p.query)}
            accessibilityRole="button"
            accessibilityLabel={p.a11y}
            android_ripple={{ color: t.colors.state.ripple }}
            style={({ pressed }) => [glass, { width: CARD_W, minHeight: t.touch.min, padding: t.space[2], overflow: 'hidden', transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          >
            <View style={{ height: TILE_H, borderRadius: 16, backgroundColor: tiles[i % tiles.length], alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={categoryGlyph(p.category)} size={48} color={t.colors.plum} strokeWidth={1.25} />
            </View>
            <View style={{ paddingHorizontal: t.space[1], paddingTop: t.space[3], paddingBottom: t.space[1], gap: 2 }}>
              <Text {...t.textProps.caption} numberOfLines={1} style={[t.typography.caption, { color: t.colors.textMuted }]}>
                {p.brand}
              </Text>
              <Text {...t.textProps.bodyStrong} numberOfLines={2} style={{ fontFamily: t.fonts.sansMedium, fontSize: 14, lineHeight: 19, minHeight: 38, color: t.colors.text }}>
                {p.name}
              </Text>
              <View
                style={{
                  marginTop: t.space[2],
                  alignSelf: 'flex-start',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: t.space[2],
                  paddingVertical: 3,
                  borderRadius: t.radius.full,
                  backgroundColor: fits.bg,
                }}
              >
                <Icon name="seal-check" size={14} color={fits.icon} />
                <Text {...t.textProps.labelSm} style={{ fontFamily: t.fonts.sansSemibold, fontSize: 11, lineHeight: 14, letterSpacing: 0.4, color: fits.fg }}>
                  FITS
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
