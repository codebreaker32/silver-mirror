import type { LedgerEntry, LedgerFeature, YouCamErrorCode } from '@skinkey/contracts';
import { iso, type Clock } from '../lib/clock';
import type { JsonStore } from '../lib/kv';
import { recordGlobal, summarise, UNIT_COSTS } from '../lib/ledger';
import type { TaskPoll, YouCamClient } from '../youcam/client';
import { YouCamHttpError } from '../youcam/client';
import type { TaskKind } from '../youcam/types';
import { fileRecord, isDeleteFinal, readyToDelete, setState, type TaskRecord } from './deleteState';

export const TIMING = {
  /** The phone polls every ~3 s; never GET the same task more often than this. */
  pollMinMs: 2500,
  /** G0: a GET right after delete still returned results; about 2 s later it returned 400. */
  confirmDelayMs: 2000,
  maxConfirmChecks: 3,
  maxDeleteAttempts: 2,
  /** An upload slot with no submit after this long is reported as an orphan upload. */
  orphanAfterMs: 15 * 60_000,
  jobTtlSeconds: 2 * 3600,
} as const;

export interface JobError {
  code: YouCamErrorCode;
  message: string;
  youcamError?: string;
}

export interface JobBase {
  id: string;
  mock: boolean;
  demo: boolean;
  installId: string;
  createdAt: number;
  submittedAt?: number;
  file: { fileId: string; state: 'uploaded' | 'orphan' };
  tasks: TaskRecord[];
  error?: JobError;
  capsConsumed: boolean;
}

export interface JobCtx {
  youcam: YouCamClient;
  clock: Clock;
  store: JsonStore;
}

export const FEATURE: Record<TaskKind, LedgerFeature> = {
  skin_analysis: 'skin_analysis_hd',
  skin_tone: 'skin_tone',
  makeup_vto: 'makeup_vto',
};

export const isDue = (t: TaskRecord, now: number) =>
  (t.state === 'task_created' || t.state === 'running') && (t.lastPollAt === undefined || now - t.lastPollAt >= TIMING.pollMinMs);

/** One GET for one task, applying the result to its delete state. Every task gets at least one GET (tone doc: unpolled tasks time out). */
export const pollTask = async <R>(job: JobBase, t: TaskRecord, ctx: JobCtx): Promise<TaskPoll<R>> => {
  const now = ctx.clock.now();
  const poll = await ctx.youcam.getTask<R>(t.kind, t.taskId);
  t.polls += 1;
  t.lastPollAt = now;
  if (poll.kind === 'running') setState(t, 'running');
  else if (poll.kind === 'success') {
    setState(t, 'terminal_success');
    t.terminalAt = now;
    t.units = UNIT_COSTS[FEATURE[t.kind]];
    await recordGlobal(ctx.store, job.mock, { entry: taskEntry(job, t, now) });
  } else if (poll.kind === 'error') {
    setState(t, 'terminal_error');
    t.terminalAt = now;
    t.error = poll.error;
  } else {
    t.error = 'task_expired';
    t.terminalAt = now;
    setState(t, 'deleted');
    t.deletedAt = now;
  }
  return poll;
};

/** Sends deletes once every task on the file is terminal and read, then confirms each with a later GET. */
export const advanceDeletes = async (job: JobBase, ctx: JobCtx): Promise<void> => {
  if (!readyToDelete(job.tasks)) return;
  for (const t of job.tasks) {
    const now = ctx.clock.now();
    if (t.state === 'result_read' || t.state === 'terminal_error') {
      t.deleteAttempts += 1;
      try {
        await ctx.youcam.deleteTask(t.taskId);
        setState(t, 'delete_requested');
        t.deleteRequestedAt = now;
      } catch (e) {
        t.error = e instanceof YouCamHttpError ? `delete:${e.errorCode}` : 'delete:network';
        if (t.deleteAttempts >= TIMING.maxDeleteAttempts) {
          setState(t, 'delete_failed');
          await recordGlobal(ctx.store, job.mock, { deleteFailed: true });
        }
      }
    } else if (
      t.state === 'delete_requested' &&
      now - (t.deleteRequestedAt ?? now) >= TIMING.confirmDelayMs &&
      (t.lastConfirmAt === undefined || now - t.lastConfirmAt >= TIMING.confirmDelayMs)
    ) {
      t.lastConfirmAt = now;
      t.confirmChecks += 1;
      const poll = await ctx.youcam.getTask(t.kind, t.taskId).catch(() => null);
      if (poll?.kind === 'gone') {
        setState(t, 'deleted');
        t.deletedAt = now;
        await recordGlobal(ctx.store, job.mock, { deleteConfirmed: true });
      } else if (t.confirmChecks >= TIMING.maxConfirmChecks) {
        setState(t, 'delete_failed');
        await recordGlobal(ctx.store, job.mock, { deleteFailed: true });
      }
    }
  }
};

export const deletesFinal = (job: JobBase) => job.file.state === 'orphan' || (job.tasks.length > 0 && job.tasks.every((t) => isDeleteFinal(t.state)));

export const markOrphan = (job: JobBase) => {
  if (job.tasks.length === 0) job.file.state = 'orphan';
};

const taskEntry = (job: JobBase, t: TaskRecord, now: number): LedgerEntry => ({
  feature: FEATURE[t.kind],
  taskId: t.taskId,
  fileId: job.file.fileId,
  units: t.units,
  latencyMs: Math.max(0, (t.terminalAt ?? now) - t.createdAt),
  startedAt: iso(t.createdAt),
  status: t.error && !t.error.startsWith('delete:') ? 'error' : 'ok',
  ...(t.error && !t.error.startsWith('delete:') ? { errorCode: t.error } : {}),
  deleteState: t.state,
});

export const ledgerFor = (job: JobBase, now: number) => {
  const fileState = fileRecord(job.file.fileId, job.file.state, job.tasks);
  const entries: LedgerEntry[] = [
    {
      feature: 'file_upload',
      fileId: job.file.fileId,
      units: 0,
      latencyMs: Math.max(0, (job.submittedAt ?? now) - job.createdAt),
      startedAt: iso(job.createdAt),
      status: job.file.state === 'orphan' ? 'error' : 'ok',
      ...(job.file.state === 'orphan' ? { errorCode: 'orphan_upload' } : {}),
      deleteState: fileState.state,
    },
  ];
  for (const t of job.tasks) {
    entries.push(taskEntry(job, t, now));
    if (t.deleteRequestedAt !== undefined || t.state === 'delete_failed') {
      entries.push({
        feature: 'task_delete',
        taskId: t.taskId,
        fileId: job.file.fileId,
        units: 0,
        latencyMs: Math.max(0, (t.deletedAt ?? now) - (t.deleteRequestedAt ?? t.terminalAt ?? now)),
        startedAt: iso(t.deleteRequestedAt ?? t.terminalAt ?? now),
        status: t.state === 'delete_failed' ? 'error' : 'ok',
        ...(t.state === 'delete_failed' && t.error ? { errorCode: t.error } : {}),
        deleteState: t.state,
      });
    }
  }
  return { ledger: summarise(job.mock, entries, [fileState]), deleteState: fileState.state };
};
