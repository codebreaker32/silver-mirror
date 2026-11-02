import type { Band, Concern } from '@skinkey/contracts';
import { BandChip as KitBandChip } from '@/components/BandChip';
import { CONCERN_LABEL } from '../format';

/** Compact band chip for reasons: "Oiliness · High" + the three-segment meter. Wraps the shared kit BandChip. */
export function BandChip({ concern, level, selfReported }: { concern: Concern; level: Band; selfReported: boolean }) {
  return <KitBandChip name={CONCERN_LABEL[concern]} level={level} selfReported={selfReported} />;
}
