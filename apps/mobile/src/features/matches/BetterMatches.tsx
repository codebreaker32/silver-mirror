import { useState } from 'react';
import { View } from 'react-native';
import { COPY, type FacetMapping, type KeyProfile, type ProductCategory } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Body, Caption, Card, Chip, ChipRow, Icon, ProductCard, SectionHeader, Txt } from '@/components';
import { categoryGlyph } from '@/features/check/display';
import { applyReadingFilter, readingFilters } from './filters';
import { storeKeywords, storeLinks } from './links';
import { openStoreUrl } from './openStoreUrl';
import { StoreSearchChips } from './StoreSearches';
import type { MatchesState } from './useBetterMatches';

/** Affiliate tags are off in the app (spec §7); the disclosure only shows when one is live. */
const AFFILIATE_LIVE = false;

const open = (url: string) => void openStoreUrl(url).catch(() => undefined);

interface Props {
  state: MatchesState;
  keyProfile: KeyProfile | null;
  category: ProductCategory | null;
  facetMap: readonly FacetMapping[];
}

/** Ranking and commission disclosure: caption-size muted lines under a 1dp rule, read as one node. */
function Honesty() {
  const t = useTheme();
  const lines = [COPY.betterMatchesHeader, ...(AFFILIATE_LIVE ? [COPY.affiliateDisclosure] : [])];
  return (
    <View
      accessible
      accessibilityLabel={`How results are ranked. ${lines.join(' ')}`}
      style={{ borderTopWidth: 1, borderTopColor: t.colors.border, paddingTop: t.space[2], gap: t.space[1] }}
    >
      {lines.map((l) => (
        <Txt key={l} variant="caption" tone="muted">
          {l}
        </Txt>
      ))}
    </View>
  );
}

/**
 * Every match card opens the same store (the one the product was shared from), so the destination is said once above
 * the list ("Each card opens a Nykaa search for that product."), not repeated on each card. TalkBack still hears it on
 * every card through the card label.
 */
export function matchDestinationLine(destination: string): string {
  const rest = destination.charAt(0).toLowerCase() + destination.slice(1);
  return `Each card ${rest.replace(/this product$/, 'that product')}.`;
}

function MatchDestination({ destination }: { destination: string }) {
  const t = useTheme();
  const s = t.components.storeLinkOut;
  return (
    <View
      testID="match-destination"
      style={{ flexDirection: 'row', gap: s.destinationGap + 2, alignItems: 'flex-start' }}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <View style={{ paddingTop: 1 }}>
        <Icon name="arrow-up-right" size={t.icon.sm} color={s.destinationColor} />
      </View>
      <Txt variant="caption" style={[s.destination, { color: s.destinationColor, flex: 1 }]}>
        {matchDestinationLine(destination)}
      </Txt>
    </View>
  );
}

/**
 * Better matches (DESIGN.md §9.5): section head, honesty line, reading filter chips, one shared destination line,
 * product cards (all on the same surface, so none reads as featured or paid), then the store searches as one chip row with a shared destination line.
 */
export function BetterMatches({ state, keyProfile, category, facetMap }: Props) {
  const t = useTheme();
  const [reading, setReading] = useState<string | null>(null);
  const links = storeLinks({ category, key: keyProfile, facetMap, facetLabel: COPY.flipkartFacetLink });
  const ready = state.status === 'ready' ? state.matches : [];
  const filters = readingFilters(ready);
  const active = reading && filters.some((f) => f.reading === reading) ? reading : null;
  const shown = applyReadingFilter(ready, active);

  return (
    <View testID="better-matches" style={{ gap: t.space[4] }}>
      <View style={{ gap: t.space[2] }}>
        <SectionHeader title="Better matches" />
        <Honesty />
      </View>
      {!keyProfile ? <Body muted>Scan, or use the Demo reading, to rank catalogue products by fit to your readings.</Body> : null}
      {state.status === 'loading' ? (
        <Body muted accessibilityLiveRegion="polite">
          Ranking catalogue products…
        </Body>
      ) : null}
      {state.status === 'error' ? <Body>We couldn't load catalogue matches. The store searches below still work.</Body> : null}
      {state.status === 'ready' && ready.length === 0 ? (
        <Card variant="sunken" gap={t.space[1]} testID="no-matches">
          <Txt variant="bodyStrong">{COPY.noMatches}</Txt>
          <Caption>{COPY.catalogCount(state.catalogCount)}</Caption>
        </Card>
      ) : null}
      {filters.length && ready.length > 1 ? (
        <ChipRow>
          <Chip label="All" selected={!active} onPress={() => setReading(null)} testID="match-filter-all" />
          {filters.map((f) => (
            <Chip
              key={f.reading}
              label={f.label}
              selected={active === f.reading}
              onPress={() => setReading(active === f.reading ? null : f.reading)}
              accessibilityLabel={`${f.label}: ${f.count} of ${ready.length} matches`}
              testID={`match-filter-${f.reading.toLowerCase().replace(/\s+/g, '-')}`}
            />
          ))}
        </ChipRow>
      ) : null}
      {shown.length ? (
        <View style={{ gap: t.components.productMatchCard.listGap }}>
          <MatchDestination destination={shown[0]!.destination} />
          {shown.map((m, i) => (
            <ProductCard
              key={m.productId}
              testID={`match-${i}`}
              name={m.name}
              reason={m.shortReason}
              verdict={{ tone: 'fits', label: 'FITS' }}
              linkOut
              glyph={categoryGlyph(m.category ?? category)}
              accessibilityLabel={m.a11y}
              onPress={() => open(m.url)}
            />
          ))}
        </View>
      ) : null}
      <StoreSearchChips links={links} keywords={storeKeywords(category, keyProfile)} />
    </View>
  );
}
