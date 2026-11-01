import type {
  ConsentRecord,
  TryonMode,
  TryonStartRequest,
  TryonStartResponse,
  TryonStatusResponse,
} from '@skinkey/contracts';
import { DEFAULT_POLL, pollJob, type JobDeps, type PollOptions } from '../scan/runScan';
import { tryonDisplaySteps, type DisplayStep, type UploadPhase } from '../scan/steps';
import { TRYON_HEIGHT, TRYON_WIDTH } from './crop';

export interface TryonDeps extends JobDeps {
  start(req: TryonStartRequest): Promise<TryonStartResponse>;
  submit(tryonId: string): Promise<TryonStatusResponse>;
  status(tryonId: string): Promise<TryonStatusResponse>;
  cancel?(tryonId: string): Promise<void>;
}

/** Renders arrive once, possibly before the delete finishes: keep them across polls. */
export function mergeTryonStatus(prev: TryonStatusResponse | undefined, next: TryonStatusResponse): TryonStatusResponse {
  return { ...next, renders: next.renders.length > 0 ? next.renders : (prev?.renders ?? []) };
}

export interface TryonInput {
  productId: string;
  mode: TryonMode;
  shadeName?: string;
  selfie: { uri: string; fileSize: number };
  consent: ConsentRecord;
}

export type TryonProgress =
  | { phase: 'uploading' | 'processing'; steps: DisplayStep[]; status?: TryonStatusResponse }
  | { phase: 'done'; steps: DisplayStep[]; status: TryonStatusResponse }
  | { phase: 'failed'; steps: DisplayStep[]; status?: TryonStatusResponse; error: unknown };

export async function runTryon(
  deps: TryonDeps,
  input: TryonInput,
  onProgress: (p: TryonProgress) => void,
  opts: PollOptions = DEFAULT_POLL,
): Promise<TryonProgress> {
  let upload: UploadPhase = 'active';
  let last: TryonStatusResponse | undefined;
  const steps = () => tryonDisplaySteps(last?.steps, upload, input.mode, last?.deleteState);
  onProgress({ phase: 'uploading', steps: steps() });
  try {
    let started: TryonStartResponse | undefined;
    try {
      started = await deps.start({
        productId: input.productId,
        mode: input.mode,
        ...(input.shadeName ? { shadeName: input.shadeName } : {}),
        image: { contentType: 'image/jpeg', fileSize: input.selfie.fileSize, width: TRYON_WIDTH, height: TRYON_HEIGHT },
        consent: input.consent,
      });
      await deps.upload(input.selfie.uri, started.upload);
    } catch (err) {
      upload = 'failed';
      if (started) await deps.cancel?.(started.tryonId).catch(() => {});
      throw err;
    } finally {
      deps.deleteLocal(input.selfie.uri);
    }
    const tryonId = started.tryonId;
    upload = 'done';
    onProgress({ phase: 'processing', steps: steps() });
    const first = await deps.submit(tryonId);
    await pollJob(
      deps,
      first,
      () => deps.status(tryonId),
      (s) => {
        last = mergeTryonStatus(last, s);
        onProgress({ phase: 'processing', steps: steps(), status: last });
      },
      opts,
    );
    const final = last ?? first;
    const result: TryonProgress =
      final.renders.length > 0 && !final.error
        ? { phase: 'done', steps: steps(), status: final }
        : { phase: 'failed', steps: steps(), status: final, error: final.error ?? new Error('Try-on did not finish') };
    onProgress(result);
    return result;
  } catch (error) {
    const result: TryonProgress = { phase: 'failed', steps: steps(), status: last, error };
    onProgress(result);
    return result;
  }
}
