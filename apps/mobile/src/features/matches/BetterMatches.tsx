import { Pressable, Text, View } from 'react-native';
import { COPY, type FacetMapping, type KeyProfile, type ProductCategory } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Body, Button, Caption, Icon, Tag } from '@/features/check/ui';
import { storeLinks } from './links';
import { openStoreUrl } from './openStoreUrl';
import type { MatchView } from './select';
import type { MatchesState } from './useBetterMatches';

/** Affiliate tags are off in the app (spec §7); the disclosure only shows when one is live. */
const AFFILIATE_LIVE = false;

const open = (url: string) => void openStoreUrl(url).catch(() => undefined);

function MatchCard({ m }: { m: MatchView }) {
  const t = useTheme();
  const c = t.components.productMatchCard;
  return (
    <Pressable
      testID={`match-${m.index}`}
      onPress={() => open(m.url)}
      accessibilityRole="link"
      accessibilityLabel={m.a11y}
      android_ripple={{ color: t.colors.state.ripple }}
      style={({ pressed }) => ({
        backgroundColor: pressed ? t.colors.state.pressed : c.bg,
        borderColor: c.border,
        borderWidth: 1,
        borderRadius: c.radius,
        padding: c.padding,
        gap: t.space[2],
        minHeight: c.minHeight,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View style={{ flexDirection: 'row', gap: t.space[3], alignItems: 'flex-start' }}>
        <Text style={[t.type.reasonIndex, { color: t.colors.textMuted }]}>{m.index}</Text>
        <View style={{ flex: 1, gap: t.space[2] }}>
          <Text style={[c.name, { color: c.nameColor }]}>{m.name}</Text>
          {m.meta ? <Text style={[c.meta, { color: c.metaColor }]}>{m.meta}</Text> : null}
          <Tag label="FITS" variant={{ verdict: 'fits' }} />
          <Text style={[c.fit, { color: c.fitColor }]}>{m.reasonLine}</Text>
        </View>
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: t.colors.border, paddingTop: t.space[2], gap: t.space[1] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[1] }}>
          <Text style={[t.type.label, { color: t.colors.link }]}>See it in Flipkart search</Text>
          <Icon name="arrow-up-right" size={t.icon.sm} color={t.colors.link} />
        </View>
        <Caption>Opens a Flipkart search for this product</Caption>
      </View>
    </Pressable>
  );
}

interface Props {
  state: MatchesState;
  keyProfile: KeyProfile | null;
  category: ProductCategory | null;
  facetMap: readonly FacetMapping[];
}

export function BetterMatches({ state, keyProfile, category, facetMap }: Props) {
  const t = useTheme();
  const links = storeLinks({ category, key: keyProfile, facetMap, facetLabel: COPY.flipkartFacetLink });
  return (
    <View testID="better-matches" style={{ gap: t.space[3] }}>
      <Text accessibilityRole="header" style={[t.type.headline, { color: t.colors.text }]}>
        Better matches
      </Text>
      <View
        accessibilityLabel="How results are ranked"
        style={{ borderLeftWidth: 1, borderLeftColor: t.colors.borderStrong, paddingHorizontal: t.space[3], paddingVertical: t.space[1], gap: t.space[1] }}
      >
        <Text style={[t.type.bodySm, { color: t.colors.text }]}>{COPY.betterMatchesHeader}</Text>
        {AFFILIATE_LIVE ? <Text style={[t.type.bodySm, { color: t.colors.text }]}>{COPY.affiliateDisclosure}</Text> : null}
      </View>
      {!keyProfile ? <Body muted>Scan, or use the Demo Key, to rank catalogue products by fit to your readings.</Body> : null}
      {state.status === 'loading' ? <Body muted accessibilityLiveRegion="polite">Ranking catalogue products…</Body> : null}
      {state.status === 'error' ? <Body>We couldn't load catalogue matches. The store searches below still work.</Body> : null}
      {state.status === 'ready' && state.matches.length === 0 ? (
        <View style={{ gap: t.space[1] }}>
          <Text style={[t.type.label, { color: t.colors.text }]}>No better matches in our catalogue yet</Text>
          <Caption>{COPY.catalogCount(state.catalogCount)}</Caption>
        </View>
      ) : null}
      {state.status === 'ready' ? state.matches.map((m) => <MatchCard key={m.productId} m={m} />) : null}
      <View style={{ gap: t.space[4], marginTop: t.space[2] }}>
        {links.map((l) => (
          <Button
            key={l.id}
            testID={`store-${l.id}`}
            label={l.label}
            variant="secondary"
            trailingIcon="arrow-up-right"
            destination={l.destination}
            accessibilityLabel={`${l.label}. ${l.destination}. Leaves SkinKey.`}
            onPress={() => open(l.url)}
          />
        ))}
      </View>
    </View>
  );
}
