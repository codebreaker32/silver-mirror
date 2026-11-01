import type { AppCtx } from './context';
import { deletesFinal } from './jobs/engine';
import { advanceScan, keyBuilder, type ScanJob } from './jobs/scan';
import { JOB_PREFIX, saveJob, type AnyJob } from './jobs/store';
import { advanceTryon, type TryonJob } from './jobs/tryon';

/**
 * Cron safety net: a phone that stops polling would leave a task un-polled (it then times out with units spent) and undeleted.
 * Advances every unfinished job; the overlay or renders produced here are dropped, never stored.
 */
export const sweep = async (ctx: AppCtx, max = 25) => {
  const keys = (await ctx.store.list(JOB_PREFIX)).slice(0, 200);
  let advanced = 0;
  for (const k of keys) {
    if (advanced >= max) break;
    const job = await ctx.store.get<AnyJob>(k);
    if (!job || !job.submittedAt || deletesFinal(job)) continue;
    const jctx = { youcam: ctx.youcam(job.demo), clock: ctx.clock, store: ctx.store };
    try {
      if (job.kind === 'scan') await advanceScan(job as ScanJob, { ...jctx, buildKey: keyBuilder(ctx.rules) });
      else await advanceTryon(job as TryonJob, jctx);
      await saveJob(ctx.store, job);
      advanced += 1;
    } catch (e) {
      console.warn('sweep', k, e instanceof Error ? e.message : e);
    }
  }
  return advanced;
};
