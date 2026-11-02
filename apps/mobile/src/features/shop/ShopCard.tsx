import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { KeyProfile, VerdictLabel } from '@skinkey/contracts';
import type { Verdict } from '@skinkey/design';
import { useTheme } from '@/theme/ThemeProvider';
import { VerdictIcon } from '@/components/Icon';
import { ProductArt } from '@/components/ProductArt';
import { SaveHeart } from '@/components/SaveHeart';
import { homeType } from '@/components/home/homeType';
import { useReduceMotion } from '@/components/useReduceMotion';
import { useCardVerdict, type ShopItem } from './useShop';

export const CARD_RADIUS = 16;
export const PLATE_RADIUS = 12;
export const CARD_PAD = 8;
/** The drawn product art sits on a lavender-grey plate one hair lighter than the wells (#E9E7F0). */
export const PLATE = '#E9E7F0';

const WORD: Record<VerdictLabel, string> = { FITS: 'Fits', CAUTION: 'Caution', UNKNOWN: 'Unknown', MEDICINE: 'Medicine' };
const SAY: Record<VerdictLabel, string> = {
  FITS: 'Fits your reading',
  CAUTION: 'Caution for your reading',
  UNKNOWN: 'Fit unknown',
  MEDICINE: 'Medicine: ask a pharmacist',
};

interface ShopCardProps {
  item: ShopItem;
  width: number;
  index: number;
  keyProfile: KeyProfile | null;
  onOpen: (item: ShopItem) => void;
}

/**
 * One Shop grid card (reference "Serums"): a flat near-white surface, a 4:5 lavender-grey plate with the drawn product
 * art and a save heart, then brand (13 muted), name (15 ink, two lines) and the verdict for this phone's reading
 * (glyph in its verdict ink + one word). No price, no rating. Press: scale 0.98 with a soft lift, 150ms ease-out.
 */
export const ShopCard = memo(function ShopCard({ item, width, index, keyProfile, onOpen }: ShopCardProps) {
  const t = useTheme();
  const reduced = useReduceMotion();
  const label = useCardVerdict(item.id, keyProfile);
  const press = useSharedValue(0);
  const lift = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * 0.02 }],
    shadowOpacity: press.value * 0.1,
    elevation: press.value * 3,
  }));
  const to = (v: number) => {
    press.value = reduced ? v : withTiming(v, { duration: 150, easing: Easing.out(Easing.cubic) });
  };
  const inner = width - CARD_PAD * 2;
  const title = `${item.brand} ${item.name}`;
  return (
    <Animated.View
      style={[
        { width, borderRadius: CARD_RADIUS, backgroundColor: t.colors.surface, shadowColor: '#1B1A22', shadowOffset: { width: 0, height: 4 }, shadowRadius: 12 },
        lift,
      ]}
    >
      <Pressable
        testID={`shop-card-${index}`}
        onPress={() => onOpen(item)}
        onPressIn={() => to(1)}
        onPressOut={() => to(0)}
        accessibilityRole="button"
        accessibilityLabel={`${title}.${label ? ` ${SAY[label]}.` : ''} Opens a check for this product.`}
        style={{ padding: CARD_PAD, gap: t.space[2] }}
      >
        <View style={{ width: inner, aspectRatio: 4 / 5, borderRadius: PLATE_RADIUS, backgroundColor: PLATE, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <ProductArt category={item.category} size={inner} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: PLATE_RADIUS }} />
        </View>
        <View style={{ paddingHorizontal: 4, paddingBottom: 6, gap: 2 }}>
          <Text numberOfLines={1} style={[homeType.small, { color: t.colors.textMuted }]}>
            {item.brand}
          </Text>
          <Text numberOfLines={2} style={[homeType.bodyStrong, { minHeight: 40, color: t.colors.text }]}>
            {item.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 20, marginTop: 4 }}>
            {label ? (
              <>
                <VerdictIcon tone={label.toLowerCase() as Verdict} size={14} />
                <Text style={[homeType.smallStrong, { color: t.colors.text }]}>{WORD[label]}</Text>
              </>
            ) : null}
          </View>
        </View>
      </Pressable>
      <SaveHeart productId={item.id} productName={title} size={20} style={{ position: 'absolute', top: CARD_PAD + 2, right: CARD_PAD + 2 }} />
    </Animated.View>
  );
});

/** Loading card at the final dimensions: the plate, a brand bar and two name bars in the well tone. Still, no shimmer. */
export function ShopCardSkeleton({ width }: { width: number }) {
  const t = useTheme();
  const inner = width - CARD_PAD * 2;
  const bar = (w: number | `${number}%`, h = 12) => <View style={{ width: w, height: h, borderRadius: 6, backgroundColor: t.colors.bgSunken }} />;
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants" style={{ width, borderRadius: CARD_RADIUS, backgroundColor: t.colors.surface, padding: CARD_PAD, gap: t.space[2] }}>
      <View style={{ width: inner, aspectRatio: 4 / 5, borderRadius: PLATE_RADIUS, backgroundColor: PLATE }} />
      <View style={{ paddingHorizontal: 4, paddingBottom: 6, gap: 8, paddingTop: 3 }}>
        {bar('45%')}
        {bar('90%', 14)}
        {bar('65%', 14)}
        <View style={{ height: 14 }} />
      </View>
    </View>
  );
}
