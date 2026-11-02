import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { VerdictIcon } from '@/components';
import { ProductArt } from '@/components/ProductArt';
import { SaveHeart } from '@/components/SaveHeart';
import { HomeHeading } from '@/components/home/HomeHeading';
import { homeType } from '@/components/home/homeType';
import type { HomePick } from './usePicks';

const RADIUS = 16;
const PLATE = 132;

/**
 * "Chosen for you" (experience reference): the heading with View all (opens Shop) over a two-column grid of up to four
 * flat surface-tone cards. Each card: a well-tone plate with the drawn product silhouette (never a photo), the brand
 * (13 muted), the name (15 semibold, two lines) and the verdict glyph + "Fits your reading" (never the bare FITS word: QA waits for ^FITS$ after a share). The rail only lists products the
 * published rules rank FITS for this reading, and the a11y label says so. A card opens /check by name. Pressed: the
 * card steps down to the well tone.
 */
export function Picks({ picks, onOpen, onViewAll }: { picks: readonly HomePick[]; onOpen: (query: string) => void; onViewAll: () => void }) {
  const t = useTheme();
  const shown = picks.slice(0, 4);
  return (
    <View testID="home-picks" style={{ gap: t.space[3] }}>
      <HomeHeading title="Chosen for you" serif action={{ label: 'View all', onPress: onViewAll, testID: 'home-picks-all', accessibilityLabel: 'View all in Shop' }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: t.space[3] }}>
        {shown.map((p, i) => (
          <Pressable
            key={p.productId}
            testID={`home-pick-${i}`}
            onPress={() => onOpen(p.query)}
            accessibilityRole="button"
            accessibilityLabel={p.a11y}
            style={({ pressed }) => ({
              width: '48.5%',
              minHeight: t.touch.min,
              borderRadius: RADIUS,
              overflow: 'hidden',
              backgroundColor: pressed ? t.colors.bgSunken : t.colors.surface,
            })}
          >
            <View style={{ height: PLATE, backgroundColor: t.colors.bgSunken, alignItems: 'center', justifyContent: 'center' }}>
              <ProductArt category={p.category ?? 'serum'} size={PLATE} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
              <SaveHeart productId={p.productId} productName={p.name} style={{ position: 'absolute', top: t.space[1], right: t.space[1] }} />
            </View>
            <View style={{ padding: t.space[3], gap: 2 }}>
              <Text numberOfLines={1} style={[homeType.small, { color: t.colors.textMuted }]}>
                {p.brand}
              </Text>
              <Text numberOfLines={2} style={[homeType.bodyStrong, { fontFamily: homeType.smallStrong.fontFamily, minHeight: 40, color: t.colors.text }]}>
                {p.name}
              </Text>
              <View style={{ marginTop: t.space[1], flexDirection: 'row', alignItems: 'center', gap: t.space[1] }}>
                <VerdictIcon tone="fits" size={16} />
                <Text style={[homeType.smallStrong, { color: t.colors.verdict.fits.fg }]}>Fits your reading</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
