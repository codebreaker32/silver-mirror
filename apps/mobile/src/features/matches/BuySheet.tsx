import { COPY } from '@skinkey/contracts';
import { ListGroup, ListRow, Sheet } from '@/components';
import type { BuyLink } from './links';
import { openStoreUrl } from './openStoreUrl';

const open = (url: string) => void openStoreUrl(url).catch(() => undefined);

/** The dock's round More button on a catalogue product: the other stores (and the brand page when we have it). */
export function BuySheet({ visible, onClose, links, brandUrl }: { visible: boolean; onClose: () => void; links: readonly BuyLink[]; brandUrl?: string | null }) {
  const rows = [
    ...links.map((l) => ({ id: l.store.toLowerCase(), title: `Buy on ${l.store}`, url: l.url, supporting: `Opens a ${l.store} search for this product`, icon: 'search' as const })),
    ...(brandUrl ? [{ id: 'brand', title: 'Brand page', url: brandUrl, supporting: "Opens the brand's own page for this product", icon: 'document' as const }] : []),
  ];
  return (
    <Sheet visible={visible} title="Buy elsewhere" supporting={`Each opens outside ${COPY.appName}.`} onClose={onClose} testID="buy-sheet">
      <ListGroup>
        {rows.map((r) => (
          <ListRow
            key={r.id}
            testID={`buy-sheet-${r.id}`}
            title={r.title}
            supporting={r.supporting}
            leadingIcon={r.icon}
            trailing="external"
            accessibilityLabel={`${r.title}. ${r.supporting}. Leaves ${COPY.appName}.`}
            onPress={() => {
              onClose();
              open(r.url);
            }}
          />
        ))}
      </ListGroup>
    </Sheet>
  );
}
