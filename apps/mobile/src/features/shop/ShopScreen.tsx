import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { Chip, ChipRail } from '@/components/Chip';
import { Icon } from '@/components/Icon';
import { PillButton } from '@/components/PillButton';
import { tabScrollTail } from '@/components/TabBar';
import { haptic } from '@/components/haptics';
import { homeType } from '@/components/home/homeType';
import { useKey } from '@/features/key';
import { useSaved } from '@/features/saved';
import { productTitle } from '@/features/check/flow';
import { ShopCard, ShopCardSkeleton } from './ShopCard';
import { CATEGORIES, PAGE, useShop, type ShopCategory, type ShopItem } from './useShop';

const GAP = 12;
const SKELETONS: ShopItem[] = Array.from({ length: 6 }, (_, i) => ({ id: `skeleton-${i}`, brand: '', name: '', category: 'other' }));

/** "50 of 125 products" when the page is capped, else "12 products". */
function countLine(n: number, total: number | null, category: ShopCategory, q: string): string {
  if (category === 'saved') return n === 1 ? '1 saved product' : `${n} saved products`;
  const word = n === 1 ? 'product' : 'products';
  if (category === 'all' && !q.trim() && total && n >= PAGE && total > n) return `${n} of ${total} verified products`;
  return `${n} ${word}`;
}

/**
 * Shop tab (reference "Serums" phone): the serif title and one honest subtitle, a search field that stays at the top,
 * category chips, a muted count and a two-column grid of verified catalogue products, each with its verdict for the
 * reading on this phone. No prices, ratings, reviews or cart. A card opens the same check a Home pick opens.
 */
export function ShopScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { key } = useKey();
  const { saved } = useSaved();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ShopCategory>('all');
  const shop = useShop(query, category, saved);
  const gutter = t.spacing.gutter;
  const cardW = Math.floor((width - gutter * 2 - GAP) / 2);

  const open = useCallback(
    (it: ShopItem) => router.push({ pathname: '/check', params: { q: productTitle(it) } }),
    [router],
  );

  const firstLoad = shop.status === 'loading' && shop.items.length === 0;
  const data = firstLoad ? SKELETONS : shop.items;

  const empty = useMemo(() => {
    if (firstLoad) return null;
    if (shop.status === 'error') {
      return {
        title: 'Could not load the catalogue',
        body: 'Check the connection and try again.',
        action: { label: 'Try again', onPress: shop.retry, testID: 'shop-retry' },
      };
    }
    if (shop.status !== 'ready' || shop.items.length) return null;
    if (query.trim()) {
      return {
        title: `Nothing matches "${query.trim()}"`,
        body: 'Try a brand or a shorter name.',
        action: { label: 'Clear search', onPress: () => setQuery(''), testID: 'shop-clear-search' },
      };
    }
    if (category === 'saved') {
      return {
        title: 'Nothing saved yet',
        body: 'Tap the heart on any product to keep it here, on this phone.',
        action: { label: 'Browse all', onPress: () => setCategory('all'), testID: 'shop-browse-all' },
      };
    }
    return {
      title: 'No verified products here yet',
      body: 'The catalogue grows as ingredient lists are checked.',
      action: { label: 'Browse all', onPress: () => setCategory('all'), testID: 'shop-browse-all' },
    };
  }, [firstLoad, shop.status, shop.items.length, shop.retry, query, category]);

  const showError = shop.status === 'error' && shop.items.length > 0;

  return (
    <SafeAreaView testID="shop-screen" edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <View style={{ paddingHorizontal: gutter, paddingTop: t.space[4], gap: t.space[3] }}>
        <View style={{ gap: t.space[1] }}>
          <Text accessibilityRole="header" style={[homeType.greeting, { color: t.colors.text }]}>
            Shop
          </Text>
          <Text style={[homeType.body, { color: t.colors.textMuted }]}>Verified products, checked against your reading</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 48,
            borderRadius: 999,
            backgroundColor: t.colors.bgSunken,
            paddingLeft: t.space[4],
            gap: t.space[2],
          }}
        >
          <Icon name="search" size={18} color={t.colors.textMuted} />
          <TextInput
            testID="shop-search"
            value={query}
            onChangeText={setQuery}
            placeholder="Search brand or product"
            placeholderTextColor={t.colors.textSubtle}
            accessibilityLabel="Search products by brand or name"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            selectionColor={t.colors.text}
            style={[homeType.body, { flex: 1, color: t.colors.text, paddingVertical: 12 }]}
          />
          {query ? (
            <Pressable
              onPress={() => setQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={4}
              style={{ minWidth: t.touch.min, minHeight: t.touch.min, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="close" size={16} color={t.colors.textMuted} />
            </Pressable>
          ) : (
            <View style={{ width: t.space[2] }} />
          )}
        </View>
        <ChipRail accessibilityLabel="Product categories" testID="shop-categories">
          {CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              label={c.label}
              selected={category === c.id}
              testID={`shop-chip-${c.id}`}
              onPress={() => {
                if (c.id === category) return;
                haptic('contextClick');
                setCategory(c.id);
              }}
            />
          ))}
        </ChipRail>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 20 }}>
          <Text testID="shop-count" style={[homeType.small, { color: t.colors.textMuted }]}>
            {firstLoad ? ' ' : countLine(shop.items.length, shop.catalogCount, category, query)}
          </Text>
          {showError ? (
            <Pressable onPress={shop.retry} accessibilityRole="button" hitSlop={12} style={{ minHeight: t.touch.min, justifyContent: 'center' }}>
              <Text style={[homeType.smallStrong, { color: t.colors.text }]}>Could not refresh · Try again</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <FlatList
        data={data}
        keyExtractor={(it) => it.id}
        numColumns={2}
        testID="shop-grid"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1, marginTop: t.space[3] }}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom: tabScrollTail(insets.bottom), gap: GAP, flexGrow: 1 }}
        initialNumToRender={6}
        windowSize={7}
        removeClippedSubviews
        renderItem={({ item, index }) =>
          firstLoad ? <ShopCardSkeleton width={cardW} /> : <ShopCard item={item} index={index} width={cardW} keyProfile={key} onOpen={open} />
        }
        ListEmptyComponent={
          empty ? (
            <View testID="shop-empty" style={{ paddingTop: t.space[6], alignItems: 'center', gap: t.space[3], paddingHorizontal: t.space[4] }}>
              <Text style={[homeType.title, { color: t.colors.text, textAlign: 'center' }]}>{empty.title}</Text>
              <Text style={[homeType.body, { color: t.colors.textMuted, textAlign: 'center' }]}>{empty.body}</Text>
              <PillButton label={empty.action.label} onPress={empty.action.onPress} variant="secondary" testID={empty.action.testID} />
            </View>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}

export default ShopScreen;
