import { COPY, type DeleteState, type StepState, type ScanStep, type TryonStep, type TryonMode } from '@skinkey/contracts';

export interface DisplayStep {
  id: string;
  /** The done wording once finished (COPY.scanStepsDone), shown with the drawn check-circle; never a "✓" in the text. */
  label: string;
  state: StepState;
  detail?: string;
  /** Small stamp after the label, e.g. "Photo deleted · 21:04" on the delete row (set by the screen). */
  stamp?: string;
}

function deleteDetail(deleteState: DeleteState | undefined): string | undefined {
  if (deleteState === 'delete_failed') return COPY.deleteFailed;
  if (deleteState === 'orphan') return COPY.orphanUpload;
  if (deleteState === 'delete_requested') return 'Asking YouCam to delete your photo';
  return undefined;
}

function deleteLabel(base: string, state: StepState, deleteState: DeleteState | undefined): string {
  if (state === 'done' && (deleteState === undefined || deleteState === 'deleted')) return COPY.scanStepsDone.delete;
  return base;
}

export type UploadPhase = 'pending' | 'active' | 'done' | 'failed';

export function scanDisplaySteps(
  serverSteps: readonly ScanStep[] | undefined,
  upload: UploadPhase,
  deleteState?: DeleteState,
): DisplayStep[] {
  const byId = new Map((serverSteps ?? []).map((s) => [s.id, s]));
  return (['upload', 'analyse', 'read', 'delete'] as const).map((id) => {
    const server = byId.get(id);
    let state: StepState = server?.state ?? 'pending';
    if (id === 'upload' && (!server || upload === 'failed' || state === 'pending')) state = upload;
    const base = COPY.scanSteps[id];
    if (id === 'delete') {
      return { id, state, label: deleteLabel(base, state, deleteState), detail: deleteDetail(deleteState) ?? server?.detail };
    }
    return { id, state, label: state === 'done' ? COPY.scanStepsDone[id] : base };
  });
}

export const SINGLE_RENDER_LABEL = 'Rendering the shade';

export function tryonDisplaySteps(
  serverSteps: readonly TryonStep[] | undefined,
  upload: UploadPhase,
  mode: TryonMode,
  deleteState?: DeleteState,
): DisplayStep[] {
  const byId = new Map((serverSteps ?? []).map((s) => [s.id, s]));
  const ids = mode === 'multi' ? (['upload', 'tone', 'render', 'delete'] as const) : (['upload', 'render', 'delete'] as const);
  return ids
    .map((id) => {
      const server = byId.get(id);
      let state: StepState = server?.state ?? 'pending';
      if (id === 'upload' && (!server || upload === 'failed' || state === 'pending')) state = upload;
      const base = id === 'render' && mode === 'single' ? SINGLE_RENDER_LABEL : COPY.tryonSteps[id];
      if (id === 'delete') {
        return { id, state, label: deleteLabel(base, state, deleteState), detail: deleteDetail(deleteState) ?? server?.detail };
      }
      return { id, state, label: id === 'upload' && state === 'done' ? COPY.scanStepsDone.upload : base };
    })
    .filter((s) => s.state !== 'skipped');
}

export function activeStepAnnouncement(steps: readonly DisplayStep[]): string | null {
  const i = steps.findIndex((s) => s.state === 'active');
  if (i >= 0) return `Step ${i + 1} of ${steps.length}, ${steps[i]!.label}.`;
  const last = steps[steps.length - 1];
  if (last && last.state === 'done') return last.label;
  return null;
}
