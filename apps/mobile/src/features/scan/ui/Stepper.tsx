import { StepChecklist } from '@/components/StepChecklist';
import { activeStepAnnouncement, type DisplayStep } from '../steps';

/** Scan / try-on steps as the shared checklist card. `detail` shows as the muted line under the label. */
export function Stepper({ steps }: { steps: readonly DisplayStep[] }) {
  return <StepChecklist steps={steps} announcement={activeStepAnnouncement(steps)} />;
}
