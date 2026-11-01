import { COPY, type JobStatus, type TryonMode, type TryonRender, type TryonStatusResponse, type TryonStep } from '@skinkey/contracts';
import { bytesToBase64 } from '../lib/b64';
import { nearestShades } from '../lib/color';
import { makeupVtoBody, skinToneBody, type VtoKind, type VtoShade } from '../youcam/bodies';
import { YouCamHttpError } from '../youcam/client';
import { mapYouCamError } from '../youcam/parse';
import type { MakeupVtoResults, SkinToneResults } from '../youcam/types';
import { isTerminalTask, newTask, setState, type TaskRecord } from './deleteState';
import { advanceDeletes, deletesFinal, isDue, ledgerFor, markOrphan, pollTask, TIMING, type JobBase, type JobCtx } from './engine';

export interface TryonJob extends JobBase {
  kind: 'tryon';
  mode: TryonMode;
  productId: string;
  vtoKind: VtoKind;
  /** Product shade swatches (catalogue data, not face data). */
  shades: VtoShade[];
  singleShade?: VtoShade;
  rendersDelivered: boolean;
  renderCount: number;
}

export interface TryonOutcome {
  renders?: TryonRender[];
  refund?: boolean;
}

const fail = (job: TryonJob, e: unknown) => {
  const code = e instanceof YouCamHttpError ? e.errorCode : 'network';
  job.error ??= { code: 'unknown', message: "YouCam couldn't render this shade. Try again", youcamError: code };
};

const createVto = async (job: TryonJob, ctx: JobCtx, shade: VtoShade): Promise<TaskRecord | null> => {
  try {
    const id = await ctx.youcam.createTask('makeup_vto', makeupVtoBody(job.file.fileId, job.vtoKind, shade));
    const t = newTask(id, 'makeup_vto', ctx.clock.now(), shade.name);
    job.tasks.push(t);
    return t;
  } catch (e) {
    fail(job, e);
    return null;
  }
};

export const submitTryon = async (job: TryonJob, ctx: JobCtx): Promise<TryonOutcome> => {
  if (job.submittedAt || job.file.state === 'orphan') return {};
  job.submittedAt = ctx.clock.now();
  if (job.mode === 'multi') {
    try {
      const id = await ctx.youcam.createTask('skin_tone', skinToneBody(job.file.fileId));
      job.tasks.push(newTask(id, 'skin_tone', ctx.clock.now()));
    } catch (e) {
      fail(job, e);
    }
  } else if (job.singleShade) await createVto(job, ctx, job.singleShade);
  if (job.tasks.length === 0) {
    markOrphan(job);
    return { refund: true };
  }
  return {};
};

export const advanceTryon = async (job: TryonJob, ctx: JobCtx): Promise<TryonOutcome> => {
  const out: TryonOutcome = {};
  const now = ctx.clock.now();
  if (!job.submittedAt) {
    if (job.file.state === 'uploaded' && now - job.createdAt > TIMING.orphanAfterMs) markOrphan(job);
    return out;
  }
  const tone = job.tasks.find((t) => t.kind === 'skin_tone');
  if (tone && isDue(tone, now)) {
    const poll = await pollTask<SkinToneResults>(job, tone, ctx);
    if (poll.kind === 'success') {
      // The tone hex lives only in this request: it picks two shades by CIEDE2000 and is never stored or returned.
      const hex = poll.results?.color?.skin_color;
      setState(tone, 'result_read');
      const picks = hex && /^#?[0-9a-f]{6}$/i.test(hex) ? nearestShades(hex.startsWith('#') ? hex : `#${hex}`, job.shades, 2) : [];
      if (picks.length === 0) job.error = { code: 'unknown', message: "We couldn't pick shades from this photo. Try again", youcamError: 'no_skin_color' };
      for (const shade of picks) await createVto(job, ctx, shade);
    } else if (poll.kind === 'error') job.error = { ...mapYouCamError(poll.error), youcamError: poll.error };
  }

  const vtos = job.tasks.filter((t) => t.kind === 'makeup_vto');
  for (const v of vtos) {
    if (!isDue(v, ctx.clock.now())) continue;
    const poll = await pollTask<MakeupVtoResults>(job, v, ctx);
    if (poll.kind === 'success') v.resultUrl = poll.results?.url;
    else if (poll.kind === 'error' && !job.error) job.error = { ...mapYouCamError(poll.error), youcamError: poll.error };
  }

  const toneSettled = !tone || tone.state !== 'task_created' && tone.state !== 'running';
  if (!job.rendersDelivered && toneSettled && vtos.length > 0 && vtos.every((v) => isTerminalTask(v.state) || v.state === 'deleted')) {
    // Read every render before any delete: deleting a task removes its output and the shared input file.
    const renders: TryonRender[] = [];
    for (const v of vtos) {
      if (v.state !== 'terminal_success') continue;
      const bytes = v.resultUrl ? await ctx.youcam.fetchAsset(v.resultUrl).catch(() => null) : null;
      delete v.resultUrl;
      setState(v, 'result_read');
      if (bytes) renders.push({ shadeName: v.shadeName ?? '', imageBase64: bytesToBase64(bytes) });
    }
    job.rendersDelivered = true;
    job.renderCount = renders.length;
    if (renders.length === 0) job.error ??= { code: 'unknown', message: "YouCam couldn't render this shade. Try again" };
    out.renders = renders;
  }
  if (job.tasks.every((t) => t.units === 0) && job.error && job.tasks.every((t) => t.state !== 'task_created' && t.state !== 'running'))
    out.refund = true;

  await advanceDeletes(job, ctx);
  return out;
};

export const tryonStatus = (job: TryonJob): JobStatus => {
  if (job.file.state === 'orphan') return 'failed';
  if (!job.submittedAt) return 'awaiting_upload';
  if (!deletesFinal(job)) return 'running';
  return job.renderCount > 0 ? 'done' : 'failed';
};

const step = (id: TryonStep['id'], state: TryonStep['state'], label: string, detail?: string): TryonStep => ({
  id,
  state,
  label,
  ...(detail ? { detail } : {}),
});

const taskStep = (ts: TaskRecord[]): TryonStep['state'] => {
  if (ts.length === 0) return 'pending';
  if (ts.some((t) => t.state === 'task_created' || t.state === 'running')) return 'active';
  if (ts.every((t) => t.error && !t.error.startsWith('delete:'))) return 'failed';
  return 'done';
};

export const tryonSteps = (job: TryonJob): TryonStep[] => {
  const L = COPY.tryonSteps;
  const renderLabel = job.mode === 'multi' ? L.render : 'Rendering your shade (YouCam)';
  if (job.file.state === 'orphan')
    return [
      step('upload', job.submittedAt ? 'done' : 'failed', L.upload, COPY.orphanUpload),
      step('tone', 'skipped', L.tone),
      step('render', job.submittedAt ? 'failed' : 'skipped', renderLabel, job.error?.message),
      step('delete', 'skipped', L.delete, COPY.orphanUpload),
    ];
  const tone = job.tasks.filter((t) => t.kind === 'skin_tone');
  const vtos = job.tasks.filter((t) => t.kind === 'makeup_vto');
  const toneState = job.mode === 'single' ? 'skipped' : taskStep(tone);
  let renderState = vtos.length ? taskStep(vtos) : toneState === 'failed' || (toneState === 'done' && job.error) ? 'failed' : 'pending';
  if (renderState === 'done' && !job.rendersDelivered) renderState = 'active';
  const finals = job.tasks.map((t) => t.state);
  const deleteState: TryonStep['state'] = !job.submittedAt
    ? 'pending'
    : finals.some((s) => s === 'delete_failed')
      ? 'failed'
      : deletesFinal(job)
        ? 'done'
        : finals.some((s) => s === 'delete_requested' || s === 'result_read' || s === 'terminal_error')
          ? 'active'
          : 'pending';
  return [
    step('upload', job.submittedAt ? 'done' : 'active', L.upload),
    step('tone', toneState, L.tone, toneState === 'failed' ? job.error?.message : undefined),
    step('render', renderState, renderLabel, renderState === 'failed' ? job.error?.message : undefined),
    step('delete', deleteState, L.delete, deleteState === 'failed' ? COPY.deleteFailed : undefined),
  ];
};

export const tryonResponse = (job: TryonJob, now: number, renders: TryonRender[] = []): TryonStatusResponse => {
  const { ledger, deleteState } = ledgerFor(job, now);
  return {
    tryonId: job.id,
    status: tryonStatus(job),
    mode: job.mode,
    steps: tryonSteps(job),
    deleteState,
    renders,
    ...(job.error ? { error: { code: job.error.code, message: job.error.message } } : {}),
    ledger,
  };
};
