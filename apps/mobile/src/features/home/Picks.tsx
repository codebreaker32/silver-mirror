import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { HomeHeading } from '@/components/home/HomeHeading';
import { homeType } from '@/components/home/homeType';
import { categoryWord } from '@/features/matches/links';
import type { HomePick } from './usePicks';

const TILE = 200;
const RADIUS = 16;

/** Sentence-case category word for the lead line: "Sunscreen", "Face wash", "Tinted moisturiser". */
const lead = (c: HomePick['category']) => {
  const w = categoryWord(c);
  return w.charAt(0).toUpperCase() + w.slice(1);
};

/**
 * "Picks for you" (dashboard reference "Recommended for you", Silver & graphite): a plain 17 heading over a horizontal
 * rail. Each pick is one flat surface-tone block (radius 16, padding 16, no border, no shadow, no thumbnail, no icon)
 * reading top to bottom: the category word (15 semibold ink), the product name (17 semibold ink, two lines) and the
 * brand (13 muted). No per-item seal: the rail only ever lists products that fit, and the a11y label says so. No See
 * all: there is no standalone list to open. A block opens /check by name.
 */
export function Picks({ picks, onOpen }: { picks: readonly HomePick[]; onOpen: (query: string) => void }) {
  const t = useTheme();
  const gutter = t.spacing.gutter;
  return (
    <View testID="home-picks" style={{ gap: t.space[3] }}>
      <HomeHeading title="Picks for you" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityLabel="Products that fit your reading"
        style={{ marginHorizontal: -gutter }}
        contentContainerStyle={{ paddingHorizontal: gutter, gap: t.space[3] }}
      >
        {picks.map((p, i) => (
          <Pressable
            key={p.productId}
            testID={`home-pick-${i}`}
            onPress={() => onOpen(p.query)}
            accessibilityRole="button"
            accessibilityLabel={p.a11y}
            style={({ pressed }) => ({
              width: TILE,
              minHeight: t.touch.min,
              padding: t.space[4],
              gap: t.space[1],
              borderRadius: RADIUS,
              backgroundColor: pressed ? t.colors.bgSunken : t.colors.surface,
            })}
          >
            <Text numberOfLines={1} style={[homeType.bodyStrong, { fontFamily: homeType.smallStrong.fontFamily, color: t.colors.text }]}>
              {lead(p.category)}
            </Text>
            <Text numberOfLines={2} style={[homeType.title, { minHeight: 44, color: t.colors.text }]}>
              {p.name}
            </Text>
            <Text numberOfLines={1} style={[homeType.small, { color: t.colors.textMuted }]}>
              {p.brand}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
