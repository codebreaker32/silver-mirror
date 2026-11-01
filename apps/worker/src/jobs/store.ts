import type { JsonStore } from '../lib/kv';
import { TIMING } from './engine';
import type { ScanJob } from './scan';
import type { TryonJob } from './tryon';

export type AnyJob = ScanJob | TryonJob;

export const JOB_PREFIX = 'job:';
const jobKey = (kind: AnyJob['kind'], id: string) => `${JOB_PREFIX}${kind}:${id}`;

export const saveJob = (store: JsonStore, job: AnyJob) => store.put(jobKey(job.kind, job.id), job, TIMING.jobTtlSeconds);

export const loadJob = async <K extends AnyJob['kind']>(store: JsonStore, kind: K, id: string) =>
  (await store.get<Extract<AnyJob, { kind: K }>>(jobKey(kind, id))) ?? null;
