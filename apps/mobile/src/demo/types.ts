import type { TryonMode, TryonStatusResponse } from '@skinkey/contracts';
import type { CheckApi } from '@/features/check/api';
import type { KVBackend } from '@/features/key/store';
import type { ScanProgress } from '@/features/scan/runScan';

/**
 * `?demo=` values (web only):
 *   reading      a labelled mock scan reading is on the phone (default for `?demo=1`)
 *   demo-reading the labelled Demo reading is switched on, nothing scanned
 *   none         nothing on the phone yet
 */
export type DemoScenario = 'reading' | 'demo-reading' | 'none';

/** Mock data for design screenshots. Nothing here calls the Worker, YouCam or Claude. */
export interface Demo {
  scenario: DemoScenario;
  /** In-memory storage seeded for the scenario. Replaces SecureStore. */
  kv: KVBackend;
  /** Answers from the bundled catalogue and the published rules, offline. */
  checkApi: CheckApi;
  /** A frozen mid-scan state for the processing screen. */
  scanProgress: ScanProgress;
  /** A finished try-on with labelled placeholder renders (no face data). */
  tryon(productId: string, mode: TryonMode, shadeName?: string): TryonStatusResponse;
}
