/**
 * APP-SCAN contract proposals. Not exported from @skinkey/contracts; owners can fold these in.
 *
 * 1. Mobile client (shared apps/mobile/src/lib/api.ts): add an optional `headers` option to `call()` so the phone can send
 *    `idempotency-key` on scanStart / tryonStart (spec §3: "idempotency keys on create"). Today the phone sends none.
 * 2. Install token (WORKER proposal `InstallResponse`): the phone now calls POST /v1/install itself, stores the token in
 *    SecureStore (`skinkey.install.v1`, survives Delete Key / Withdraw consent so caps stay per install) and calls
 *    `setInstallToken`. APP-CORE can reuse `ensureInstallToken()` from `@/features/scan`. Please fold
 *    `InstallResponse` and `routes.install` into api.ts so it goes through the typed client.
 * 3. Cancel (WORKER `CANCEL_PATHS`): the phone posts /v1/{scan|tryon}/:id/cancel when the presigned PUT fails, so the
 *    receipt shows "orphan upload". Please add `scanCancel` / `tryonCancel` to `routes`.
 * 4. KeySource: support WORKER's 'mock' value. The Key card would then label a mock-fixture Key the way it labels the Demo reading.
 * 5. "How this was made": APP-CORE can feed resolve / label-OCR ledgers into the same screen with
 *    `recordLedger('resolve' | 'labelOcr', ledger)` from `@/features/scan`. No schema change.
 */
import { z } from 'zod';

export const IDEMPOTENT_ROUTES = ['scanStart', 'tryonStart'] as const;

export const CallHeadersOption = z.record(z.string(), z.string());
export type CallHeadersOption = z.infer<typeof CallHeadersOption>;

export const PHONE_STORAGE_KEYS = {
  key: 'skinkey.key.v1',
  consent: 'skinkey.consent.scan.v1',
  demo: 'skinkey.demo.v1',
  coach: 'skinkey.coach.share.v1',
  scanLedger: 'skinkey.ledger.scan.v1',
  install: 'skinkey.install.v1',
} as const;
