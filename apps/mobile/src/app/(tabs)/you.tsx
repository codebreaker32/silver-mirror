import { SettingsScreen } from '@/features/key/SettingsScreen';
import { TabScene } from '@/components/Screen';

/** You tab: the settings content (privacy, delete, consent, about) as a tab scene, so it has no back arrow. */
export default function YouTab() {
  return (
    <TabScene>
      <SettingsScreen />
    </TabScene>
  );
}
