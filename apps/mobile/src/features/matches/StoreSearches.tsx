import { View } from 'react-native';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Chip, ChipRow, Icon, ListGroup, ListRow, Sheet, Txt } from '@/components';
import type { StoreLink } from './links';
import { openStoreUrl } from './openStoreUrl';

const open = (url: string) => void openStoreUrl(url).catch(() => undefined);

const SHORT: Record<StoreLink['id'], string> = { flipkart_facet: 'Flipkart', flipkart: 'Flipkart', amazon: 'Amazon.in', nykaa: 'Nykaa' };

const a11yOf = (l: StoreLink) => `${l.label}. ${l.destination}. Leaves ${COPY.appName}.`;

/**
 * One shared destination line for the three store chips (component.storeLinkOut):
 * 'Opens a keyword search for "sunscreen" in the store app (Nykaa: browser)'. A Flipkart facet adds its own
 * seller-tagged disclosure.
 */
export function storeDestinationLine(links: readonly StoreLink[], keywords: string): string {
  const facet = links.find((l) => l.id === 'flipkart_facet');
  const base = `Opens a keyword search for "${keywords}" in the store app (Nykaa: browser).`;
  return facet ? `${base} On Flipkart: ${facet.label.charAt(0).toLowerCase()}${facet.label.slice(1)}.` : base;
}

/**
 * Store searches as one row of three chips plus the shared destination line. Each chip label names its destination. The
 * chips are glass (card fill + white hairline) so they stand off the page gradient, which the tonal pill nearly matched.
 */
export function StoreSearchChips({ links, keywords }: { links: readonly StoreLink[]; keywords: string }) {
  const t = useTheme();
  const s = t.components.storeLinkOut;
  return (
    <View style={{ gap: t.space[2] }}>
      <Txt variant="label">Or search a store</Txt>
      <ChipRow>
        {links.map((l) => (
          <Chip key={l.id} testID={`store-${l.id}`} label={SHORT[l.id]} icon="arrow-up-right" fill="glass" accessibilityLabel={a11yOf(l)} onPress={() => open(l.url)} />
        ))}
      </ChipRow>
      <View style={{ flexDirection: 'row', gap: s.destinationGap + 2, alignItems: 'flex-start' }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <View style={{ paddingTop: 1 }}>
          <Icon name="search" size={t.icon.sm} color={s.destinationColor} />
        </View>
        <Txt variant="caption" style={[s.destination, { color: s.destinationColor, flex: 1 }]}>
          {storeDestinationLine(links, keywords)}
        </Txt>
      </View>
    </View>
  );
}

/** The dock's round More button opens this: the same store searches as rows, each naming where it goes. */
export function StoreSearchSheet({ visible, onClose, links }: { visible: boolean; onClose: () => void; links: readonly StoreLink[] }) {
  return (
    <Sheet visible={visible} title="Search the stores" supporting={`Each opens outside ${COPY.appName}. We don't check those results.`} onClose={onClose} testID="store-sheet">
      <ListGroup>
        {links.map((l) => (
          <ListRow
            key={l.id}
            testID={`store-sheet-${l.id}`}
            title={l.label}
            supporting={l.destination}
            leadingIcon="search"
            trailing="external"
            accessibilityLabel={a11yOf(l)}
            onPress={() => {
              onClose();
              open(l.url);
            }}
          />
        ))}
      </ListGroup>
    </Sheet>
  );
}
