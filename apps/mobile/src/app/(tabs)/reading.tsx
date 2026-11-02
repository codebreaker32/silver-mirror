import { KeyScreen } from '@/features/key/KeyScreen';
import { TabScene } from '@/components/Screen';

/** Reading tab: Your reading (the same screen as the pushed /key detail, without the back button). */
export default function ReadingTab() {
  return (
    <TabScene>
      <KeyScreen />
    </TabScene>
  );
}
