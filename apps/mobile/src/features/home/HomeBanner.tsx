import { Image, Pressable, Text, View } from 'react-native';
import { fonts } from '@skinkey/design';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/components/haptics';
import { Icon } from '@/components';
import { ProductArt } from '@/components/ProductArt';
import { PHOTOS } from '@/components/photos';
import { homeType } from '@/components/home/homeType';

const BACKDROP = PHOTOS.texture;

/**
 * Home hero (experience reference "Build a Routine", in our words): a licensed cream-texture photo (photos/texture.jpg) on a
 * 16-radius plate under a soft near-white scrim, the serif line "Check before you buy" at left, the serum photo at
 * right, and the one charcoal pill "Try a sample share" (same testID, label and hint as before; QA taps it). The pill
 * presses to the darker charcoal with a 0.98 scale; no shadow at rest.
 */
export function HomeBanner({ onSample, hint }: { onSample: () => void; hint: string }) {
  const t = useTheme();
  return (
    <View testID="home-banner" style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: t.colors.bgSunken, minHeight: 196 }}>
      <Image source={BACKDROP} accessibilityIgnoresInvertColors importantForAccessibility="no" resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} />
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(247,246,250,0.55)' }} />
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ position: 'absolute', right: t.space[3], bottom: t.space[3], top: t.space[3], justifyContent: 'center' }}
      >
        <ProductArt category="serum" size={150} style={{ borderRadius: 12 }} />
      </View>
      <View style={{ padding: t.space[5], paddingRight: 120, gap: t.space[4], flex: 1, justifyContent: 'space-between' }}>
        <Text accessibilityRole="header" style={{ fontFamily: fonts.serifDisplay, fontSize: 28, lineHeight: 34, letterSpacing: -0.3, color: t.colors.text }}>
          Check before you buy
        </Text>
        <Pressable
          testID="sample-share"
          onPress={() => {
            haptic('contextClick');
            onSample();
          }}
          accessibilityRole="button"
          accessibilityLabel="Try a sample share"
          accessibilityHint={hint}
          style={{ alignSelf: 'flex-start', minHeight: t.touch.min, justifyContent: 'center' }}
        >
          {({ pressed }) => (
            <View
              style={{
                minHeight: 44,
                paddingHorizontal: t.space[5],
                borderRadius: t.radius.full,
                backgroundColor: pressed ? t.colors.accentPressed : t.colors.accent,
                flexDirection: 'row',
                alignItems: 'center',
                gap: t.space[2],
                transform: [{ scale: pressed ? 0.98 : 1 }],
              }}
            >
              <Text style={[homeType.bodyStrong, { color: t.colors.onAccent }]}>Try a sample share</Text>
              <Icon name="arrow-right" size={18} color={t.colors.onAccent} />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

/** The four category circles; `category` is the Shop route param (agreed with Shop). */
export const HOME_CATEGORIES = [
  { category: 'cleanser', label: 'Cleansers' },
  { category: 'serum', label: 'Serums' },
  { category: 'moisturiser', label: 'Moisturisers' },
  { category: 'sunscreen', label: 'Sunscreen' },
] as const;

/**
 * Category row (experience reference): four 56dp near-white discs, each holding the drawn product silhouette, with the
 * category word under it. A tap opens Shop filtered to that category.
 */
export function CategoryRow({ onOpen }: { onOpen: (category: (typeof HOME_CATEGORIES)[number]['category']) => void }) {
  const t = useTheme();
  return (
    <View testID="home-categories" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {HOME_CATEGORIES.map((c) => (
        <Pressable
          key={c.category}
          testID={`home-category-${c.category}`}
          onPress={() => {
            haptic('contextClick');
            onOpen(c.category);
          }}
          accessibilityRole="button"
          accessibilityLabel={`${c.label}, open in Shop`}
          style={{ alignItems: 'center', gap: t.space[2], minWidth: 72, minHeight: t.touch.min }}
        >
          {({ pressed }) => (
            <>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: pressed ? t.colors.bgSunken : t.colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                }}
              >
                <ProductArt category={c.category} size={56} style={{ borderRadius: 28 }} />
              </View>
              <Text numberOfLines={1} style={[homeType.small, { color: t.colors.text }]}>
                {c.label}
              </Text>
            </>
          )}
        </Pressable>
      ))}
    </View>
  );
}
