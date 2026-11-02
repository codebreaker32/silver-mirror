import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/components';
import { HomeHeading } from '@/components/home/HomeHeading';
import { homeType } from '@/components/home/homeType';
import { categoryGlyph } from '@/features/check/display';
import type { HomePick } from './usePicks';

const TILE = 120;

/**
 * "Picks for you" (dashboard reference "Recommended for you", Silver & graphite): a plain 17 heading over a horizontal
 * rail of product tiles. A tile is not a card: a 1:1 well-tone thumbnail (radius 12) with one ink line glyph for the
 * category (never a product photo), then the brand (13 muted), the name (15 ink, two lines) and the sage seal with
 * "Fits", all set straight on the page. No See all: there is no standalone list to open. A tile opens /check by name.
 */
export function Picks({ picks, onOpen }: { picks: readonly HomePick[]; onOpen: (query: string) => void }) {
  const t = useTheme();
  const gutter = t.spacing.gutter;
  const fits = t.colors.verdict.fits;
  return (
    <View testID="home-picks" style={{ gap: t.space[3] }}>
      <HomeHeading title="Picks for you" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityLabel="Products that fit your reading"
        style={{ marginHorizontal: -gutter }}
        contentContainerStyle={{ paddingHorizontal: gutter, gap: t.space[4] }}
      >
        {picks.map((p, i) => (
          <Pressable
            key={p.productId}
            testID={`home-pick-${i}`}
            onPress={() => onOpen(p.query)}
            accessibilityRole="button"
            accessibilityLabel={p.a11y}
            style={({ pressed }) => ({ width: TILE, minHeight: t.touch.min, opacity: pressed ? 0.7 : 1 })}
          >
            <View style={{ width: TILE, height: TILE, borderRadius: 12, backgroundColor: t.colors.bgSunken, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={categoryGlyph(p.category)} size={36} color={t.colors.text} strokeWidth={1.25} />
            </View>
            <View style={{ paddingTop: t.space[2], gap: 2 }}>
              <Text numberOfLines={1} style={[homeType.small, { color: t.colors.textMuted }]}>
                {p.brand}
              </Text>
              <Text numberOfLines={2} style={[homeType.bodyStrong, { minHeight: 40, color: t.colors.text }]}>
                {p.name}
              </Text>
              <View style={{ marginTop: t.space[1], flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="seal-check" size={16} color={fits.icon} />
                <Text style={[homeType.smallStrong, { color: fits.fg }]}>Fits</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
