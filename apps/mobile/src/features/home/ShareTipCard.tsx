import { ShareSteps } from '@/components/home/ShareSteps';

/** Home share tip (DESIGN.md §9.2 item 5): "Share from a store app" with the store switch and three thumb-tile steps. */
export function ShareTipCard({ onDismiss }: { onDismiss: () => void }) {
  return <ShareSteps testID="share-tip" dismissTestID="share-tip-dismiss" onDismiss={onDismiss} />;
}
