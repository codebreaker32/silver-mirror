import { ShareTeachingCard } from '@/components/home/ShareTeachingCard';

/** Coach mark after a scan: the same share-strip teaching card as Home, with the chrome-S tile and the pin tip. */
export function ShareCoachMark({ onDismiss }: { onDismiss: () => void }) {
  return <ShareTeachingCard testID="share-coach-mark" dismissTestID="share-coach-dismiss" onDismiss={onDismiss} />;
}
