import {
  COPY,
  DEMO_KEY,
  type JobStatus,
  type KeyProfile,
  type RawScoreReading,
  type ScanStatusResponse,
  type ScanStep,
  type SkinTypeClass,
  type SkinTypeZone,
} from '@skinkey/contracts';
import { bytesToBase64 } from '../lib/b64';
import { iso } from '../lib/clock';
import type { RulesPort } from '../rulesPort';
import { skinAnalysisBody } from '../youcam/bodies';
import { YouCamHttpError } from '../youcam/client';
import { mapYouCamError, overlayUrl, rawScoreReadings, zoneLabels } from '../youcam/parse';
import type { SkinAnalysisResults } from '../youcam/types';
import { newTask, setState } from './deleteState';
import { advanceDeletes, deletesFinal, isDue, ledgerFor, markOrphan, pollTask, TIMING, type JobBase, type JobCtx } from './engine';

export interface ScanJob extends JobBase {
  kind: 'scan';
  key?: KeyProfile;
  overlayDelivered: boolean;
}

export interface KeyInput {
  readings: RawScoreReading[];
  zones: Partial<Record<SkinTypeZone, SkinTypeClass>>;
  scanDate: string;
  scanId: string;
  demo: boolean;
}

export type KeyBuilder = (input: KeyInput) => KeyProfile;

/** Bands come from raw_score only (the readings carry no ui_score). Demo jobs get the labelled sample Key. */
export const keyBuilder =
  (rules: Pick<RulesPort, 'buildKeyProfile'>): KeyBuilder =>
  (input) =>
    input.demo
      ? { ...DEMO_KEY }
      : rules.buildKeyProfile({
          readings: input.readings,
          zones: input.zones,
          scanDate: input.scanDate,
          scanId: input.scanId,
          source: 'youcam_hd',
          photoDeleted: false,
        });

export interface ScanCtx extends JobCtx {
  buildKey: KeyBuilder;
}

export interface AdvanceOutcome {
  overlayJpegBase64?: string;
  /** True when YouCam consumed no units, so the install's cap use can be returned. */
  refund?: boolean;
}

export const submitScan = async (job: ScanJob, ctx: ScanCtx): Promise<AdvanceOutcome> => {
  if (job.submittedAt || job.file.state === 'orphan') return {};
  const now = ctx.clock.now();
  job.submittedAt = now;
  try {
    const taskId = await ctx.youcam.createTask('skin_analysis', skinAnalysisBody(job.file.fileId));
    job.tasks.push(newTask(taskId, 'skin_analysis', now));
    return {};
  } catch (e) {
    markOrphan(job);
    const code = e instanceof YouCamHttpError ? e.errorCode : 'network';
    job.error = { code: 'unknown', message: COPY.orphanUpload, youcamError: code };
    return { refund: true };
  }
};

export const advanceScan = async (job: ScanJob, ctx: ScanCtx): Promise<AdvanceOutcome> => {
  const now = ctx.clock.now();
  const out: AdvanceOutcome = {};
  if (!job.submittedAt) {
    if (job.file.state === 'uploaded' && now - job.createdAt > TIMING.orphanAfterMs) markOrphan(job);
    return out;
  }
  const t = job.tasks[0];
  if (t && isDue(t, now)) {
    const poll = await pollTask<SkinAnalysisResults>(job, t, ctx);
    if (poll.kind === 'success') {
      const rows = Array.isArray(poll.results?.output) ? poll.results.output : null;
      if (!rows) job.error = { code: 'unknown', message: "YouCam couldn't read this photo. Try again", youcamError: 'no_json_output' };
      else {
        try {
          job.key = ctx.buildKey({ readings: rawScoreReadings(rows), zones: zoneLabels(rows), scanDate: iso(now), scanId: job.id, demo: job.demo });
        } catch (e) {
          job.error = { code: 'unknown', message: "We couldn't build your reading from this scan. Try again", youcamError: `key:${(e as Error).message}` };
        }
        const url = job.key && !job.overlayDelivered ? overlayUrl(rows) : null;
        if (url) {
          const bytes = await ctx.youcam.fetchAsset(url).catch(() => null);
          if (bytes) {
            out.overlayJpegBase64 = bytesToBase64(bytes);
            job.overlayDelivered = true;
          }
        }
      }
      setState(t, 'result_read');
    } else if (poll.kind === 'error') {
      job.error = { ...mapYouCamError(poll.error), youcamError: poll.error };
      out.refund = true;
    }
  }
  await advanceDeletes(job, ctx);
  if (job.key && t) job.key = { ...job.key, photoDeleted: t.state === 'deleted' };
  return out;
};

export const scanStatus = (job: ScanJob): JobStatus => {
  if (job.file.state === 'orphan') return 'failed';
  if (!job.submittedAt) return 'awaiting_upload';
  if (!deletesFinal(job)) return 'running';
  return job.error || !job.key ? 'failed' : 'done';
};

const step = (id: ScanStep['id'], state: ScanStep['state'], detail?: string): ScanStep => ({
  id,
  state,
  label: COPY.scanSteps[id],
  ...(detail ? { detail } : {}),
});

export const scanSteps = (job: ScanJob): ScanStep[] => {
  const t = job.tasks[0];
  if (job.file.state === 'orphan')
    return [
      step('upload', job.submittedAt ? 'done' : 'failed', COPY.orphanUpload),
      step('analyse', job.submittedAt ? 'failed' : 'skipped', job.error?.message),
      step('read', 'skipped'),
      step('delete', 'skipped', COPY.orphanUpload),
    ];
  if (!t) return [step('upload', 'active'), step('analyse', 'pending'), step('read', 'pending'), step('delete', 'pending')];
  const s = t.state;
  const taskFailed = Boolean(t.error && !t.error.startsWith('delete:'));
  const analyse = s === 'task_created' || s === 'running' ? 'active' : taskFailed ? 'failed' : 'done';
  const read = job.key ? 'done' : taskFailed || job.error ? 'failed' : analyse === 'active' ? 'pending' : 'active';
  const del =
    s === 'deleted' ? 'done' : s === 'delete_failed' ? 'failed' : s === 'delete_requested' || s === 'result_read' || s === 'terminal_error' ? 'active' : 'pending';
  return [
    step('upload', 'done'),
    step('analyse', analyse, taskFailed ? job.error?.message : undefined),
    step('read', read),
    step('delete', del, del === 'failed' ? COPY.deleteFailed : undefined),
  ];
};

export const scanResponse = (job: ScanJob, now: number, overlay?: string): ScanStatusResponse => {
  const { ledger, deleteState } = ledgerFor(job, now);
  return {
    scanId: job.id,
    status: scanStatus(job),
    steps: scanSteps(job),
    deleteState,
    ...(job.key ? { key: job.key } : {}),
    ...(overlay ? { overlayJpegBase64: overlay } : {}),
    ...(job.error ? { error: { code: job.error.code, message: job.error.message } } : {}),
    ledger,
  };
};
