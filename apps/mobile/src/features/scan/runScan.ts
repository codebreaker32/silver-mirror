import type {
  ConsentRecord,
  ImageMeta,
  ScanStartRequest,
  ScanStartResponse,
  ScanStatusResponse,
  UploadSlot,
} from '@skinkey/contracts';
import { isFinalDeleteState } from './deleteCopy';
import { scanDisplaySteps, type DisplayStep, type UploadPhase } from './steps';

export interface Capture {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
}

export interface JobDeps {
  upload(uri: string, slot: UploadSlot): Promise<void>;
  deleteLocal(uri: string): void;
  sleep(ms: number): Promise<void>;
  now(): number;
}

export interface ScanDeps extends JobDeps {
  start(req: ScanStartRequest): Promise<ScanStartResponse>;
  submit(scanId: string): Promise<ScanStatusResponse>;
  status(scanId: string): Promise<ScanStatusResponse>;
  cancel?(scanId: string): Promise<void>;
}

export interface PollOptions {
  intervalMs: number;
  timeoutMs: number;
  deleteGraceMs: number;
}

export const DEFAULT_POLL: PollOptions = { intervalMs: 2000, timeoutMs: 120_000, deleteGraceMs: 20_000 };

export type ScanProgress =
  | { phase: 'uploading' | 'processing'; steps: DisplayStep[]; status?: ScanStatusResponse }
  | { phase: 'done'; steps: DisplayStep[]; status: ScanStatusResponse }
  | { phase: 'failed'; steps: DisplayStep[]; status?: ScanStatusResponse; error: unknown };

export class TimeoutError extends Error {
  constructor() {
    super('Timed out waiting for YouCam');
  }
}

export async function pollJob<T extends { status: string; deleteState: Parameters<typeof isFinalDeleteState>[0] }>(
  deps: Pick<JobDeps, 'sleep' | 'now'>,
  first: T,
  fetchStatus: () => Promise<T>,
  onUpdate: (s: T) => void,
  opts: PollOptions = DEFAULT_POLL,
): Promise<T> {
  const started = deps.now();
  let current = first;
  let terminalAt: number | null = null;
  onUpdate(current);
  for (;;) {
    const terminal = current.status === 'done' || current.status === 'failed';
    if (terminal) {
      if (isFinalDeleteState(current.deleteState)) return current;
      terminalAt ??= deps.now();
      if (deps.now() - terminalAt >= opts.deleteGraceMs) return current;
    }
    if (deps.now() - started >= opts.timeoutMs) {
      if (terminal) return current;
      throw new TimeoutError();
    }
    await deps.sleep(opts.intervalMs);
    current = await fetchStatus();
    onUpdate(current);
  }
}

export function imageMeta(c: Capture): ImageMeta {
  return { contentType: 'image/jpeg', fileSize: c.fileSize, width: c.width, height: c.height };
}

/** The Worker sends key/overlay as soon as they are read, and the overlay only once: keep the latest of each. */
export function mergeScanStatus(prev: ScanStatusResponse | undefined, next: ScanStatusResponse): ScanStatusResponse {
  return {
    ...next,
    key: next.key ?? prev?.key,
    overlayJpegBase64: next.overlayJpegBase64 ?? prev?.overlayJpegBase64,
  };
}

export async function runScan(
  deps: ScanDeps,
  capture: Capture,
  consent: ConsentRecord,
  onProgress: (p: ScanProgress) => void,
  opts: PollOptions = DEFAULT_POLL,
): Promise<ScanProgress> {
  let upload: UploadPhase = 'active';
  let last: ScanStatusResponse | undefined;
  const steps = () => scanDisplaySteps(last?.steps, upload, last?.deleteState);
  onProgress({ phase: 'uploading', steps: steps() });
  try {
    let started: ScanStartResponse | undefined;
    try {
      started = await deps.start({ image: imageMeta(capture), consent });
      await deps.upload(capture.uri, started.upload);
    } catch (err) {
      upload = 'failed';
      if (started) await deps.cancel?.(started.scanId).catch(() => {});
      throw err;
    } finally {
      deps.deleteLocal(capture.uri);
    }
    const scanId = started.scanId;
    upload = 'done';
    onProgress({ phase: 'processing', steps: steps() });
    const first = await deps.submit(scanId);
    await pollJob(
      deps,
      first,
      () => deps.status(scanId),
      (s) => {
        last = mergeScanStatus(last, s);
        onProgress({ phase: 'processing', steps: steps(), status: last });
      },
      opts,
    );
    const final = last ?? first;
    const result: ScanProgress =
      final.key && !final.error
        ? { phase: 'done', steps: steps(), status: final }
        : { phase: 'failed', steps: steps(), status: final, error: final.error ?? new Error('Scan did not finish') };
    onProgress(result);
    return result;
  } catch (error) {
    const result: ScanProgress = { phase: 'failed', steps: steps(), status: last, error };
    onProgress(result);
    return result;
  }
}
