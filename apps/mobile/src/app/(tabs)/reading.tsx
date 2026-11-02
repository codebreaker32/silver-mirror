import { KeyScreen } from '@/features/key/KeyScreen';
import { TabScene } from '@/components/Screen';

/**
 * Reading tab: Your reading (the same screen as the pushed /key detail, without the back button). Inside the TabScene
 * the Screen scaffold leaves the floating tab bar's height free at the end of its scroll.
 */
export default function ReadingTab() {
  return (
    <TabScene>
      <KeyScreen />
    </TabScene>
  );
}
