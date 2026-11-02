import { ShareTeachingCard } from '@/components/home/ShareTeachingCard';

/** Home share tip (DESIGN.md §9.2 item 5): the compact teaching card, plus a way back to the paste field. */
export function ShareTipCard({ onDismiss, onPaste }: { onDismiss: () => void; onPaste: () => void }) {
  return (
    <ShareTeachingCard
      testID="share-tip"
      dismissTestID="share-tip-dismiss"
      onDismiss={onDismiss}
      secondary={{ label: 'Paste a link instead', onPress: onPaste, testID: 'share-tip-paste' }}
    />
  );
}
