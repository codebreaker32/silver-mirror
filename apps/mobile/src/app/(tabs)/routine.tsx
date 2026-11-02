import { TabScene } from '@/components/Screen';
import { RoutineScreen } from '@/features/routine';

/** Routine tab: Your Routine, AM / PM steps filled from the catalogue for the reading on this phone. */
export default function RoutineTab() {
  return (
    <TabScene>
      <RoutineScreen />
    </TabScene>
  );
}
