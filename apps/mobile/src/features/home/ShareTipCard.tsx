import { ShareTeachingCard } from '@/components/home/ShareTeachingCard';

/** Home share tip (DESIGN.md §9.2 item 5): the compact teaching card. The paste field sits right above it. */
export function ShareTipCard({ onDismiss }: { onDismiss: () => void; onPaste?: () => void }) {
  return <ShareTeachingCard testID="share-tip" dismissTestID="share-tip-dismiss" onDismiss={onDismiss} />;
}
