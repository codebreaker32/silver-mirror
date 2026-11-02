import { useState } from 'react';
import { View } from 'react-native';
import { COPY, type FacetMapping, type KeyProfile, type ProductCategory } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Body, Caption, Card, Chip, ChipRail, Icon, ProductCard, SectionHeader, Txt } from '@/components';
import { applyReadingFilter, readingFilters } from './filters';
import { keyClass, storeKeywords, storeLinks } from './links';
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

/** Ranking and commission disclosure lines (spec §7): always shown, never inside a product card. */
function honestyLines(): string[] {
  return [COPY.betterMatchesHeader, ...(AFFILIATE_LIVE ? [COPY.affiliateDisclosure] : [])];
}

/**
 * The list heading (Silver & graphite): plain text on the page, never a card and never a disc. COPY.matchesBanner(skin
 * type) as a 17 semibold heading, the honesty line under it in 15 muted. Read as one node.
 */
function MatchesBanner({ skinType }: { skinType: string }) {
  const t = useTheme();
  const lines = honestyLines();
  const headline = COPY.matchesBanner(skinType);
  return (
    <View testID="matches-banner" accessible accessibilityLabel={`${headline}. ${lines.join(' ')}`} style={{ gap: t.space[1] }}>
      <Txt variant="section" style={{ fontFamily: 'Geist_600SemiBold', fontSize: 17, lineHeight: 22, letterSpacing: 0, color: t.colors.text }}>
        {headline}
      </Txt>
      {lines.map((l) => (
        <Txt key={l} variant="body" tone="muted" style={{ fontSize: 15, lineHeight: 22 }}>
          {l}
        </Txt>
      ))}
    </View>
  );
}

/** Without a reading there is no skin type to name: the honesty line stays, as a plain muted caption (no rule). */
function Honesty() {
  const t = useTheme();
  const lines = honestyLines();
  return (
    <View
      accessible
      accessibilityLabel={`How results are ranked. ${lines.join(' ')}`}
      style={{ gap: t.space[1] }}
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
 * Better matches (DESIGN.md §9.5, showcase 06_discover order): section head, one scrolling rail of reading filter chips
 * (selected = graphite + check), the plain heading with the honesty line, one shared destination line, the products as
 * rows on one surface card (all alike, so none reads as featured or paid; no stars, hearts or ratings), then the store searches as one chip row
 * with a shared destination line.
 */
export function BetterMatches({ state, keyProfile, category, facetMap }: Props) {
  const t = useTheme();
  const [reading, setReading] = useState<string | null>(null);
  const links = storeLinks({ category, key: keyProfile, facetMap, facetLabel: COPY.flipkartFacetLink });
  const ready = state.status === 'ready' ? state.matches : [];
  const filters = readingFilters(ready);
  const active = reading && filters.some((f) => f.reading === reading) ? reading : null;
  const shown = applyReadingFilter(ready, active);
  const skinType = keyClass(keyProfile);

  return (
    <View testID="better-matches" style={{ gap: t.space[4] }}>
      <View style={{ gap: t.space[3] }}>
        <SectionHeader title="Better matches" />
        {filters.length && ready.length > 1 ? (
          <ChipRail accessibilityLabel="Filter matches by reading">
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
          </ChipRail>
        ) : null}
        {skinType ? <MatchesBanner skinType={skinType} /> : <Honesty />}
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
      {shown.length ? (
        <View style={{ gap: t.space[3] }}>
          <MatchDestination destination={shown[0]!.destination} />
          {/* One surface for the whole list: rows separated by space, no dividers, no card per product. */}
          <Card variant="raised" gap={t.space[5]} testID="match-list">
          {shown.map((m, i) => (
            <ProductCard
              key={m.productId}
              testID={`match-${i}`}
              name={m.name}
              reason={m.shortReason}
              verdict={{ tone: 'fits', label: 'FITS' }}
              linkOut
              accessibilityLabel={m.a11y}
              onPress={() => open(m.url)}
            />
          ))}
          </Card>
        </View>
      ) : null}
      <StoreSearchChips links={links} keywords={storeKeywords(category, keyProfile)} />
    </View>
  );
}
