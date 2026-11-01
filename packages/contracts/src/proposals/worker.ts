/**
 * WORKER contract proposals. Not exported from @skinkey/contracts yet: the owner of api.ts can fold these in.
 * The Worker already serves every route below.
 */
import { z } from 'zod';
import { Caps } from '../ledger';

/** `POST /v1/install` → anonymous HMAC-signed install token for `x-skinkey-install`. Required by /v1/scan/* and /v1/tryon/*. */
export const InstallResponse = z.object({ installToken: z.string(), caps: Caps });
export type InstallResponse = z.infer<typeof InstallResponse>;

/** Send `x-skinkey-demo: 1` on scan/try-on routes to run the chain against the mock and get the labelled DEMO_KEY. No units, no caps. */
export const DEMO_HEADER = 'x-skinkey-demo';

/** Mock mode only: `x-mock-scenario: oily | slow | error_src_face_too_small | error_lighting_dark | error_no_face | create_400 | delete_fail`. */
export const MOCK_SCENARIO_HEADER = 'x-mock-scenario';

/**
 * `POST /v1/scan/:id/cancel` and `POST /v1/tryon/:id/cancel` (no body) → the usual status response with deleteState `orphan`
 * when no task was created yet. Lets the phone report an orphan upload honestly after a cancel or a quality fail.
 */
export const CANCEL_PATHS = { scan: '/v1/scan/:id/cancel', tryon: '/v1/tryon/:id/cancel' } as const;

/** `GET /v1/ledger` → global unit ledger. `?verify=1` with `x-skinkey-admin` also reads YouCam's credit endpoint (0 units). */
export const LedgerResponse = z.object({
  mode: z.enum(['mock', 'live']),
  spentUnits: z.number(),
  byFeature: z.record(z.string(), z.number()),
  successfulTasks: z.number().int(),
  deletesConfirmed: z.number().int(),
  deletesFailed: z.number().int(),
  claudeCalls: z.number().int(),
  budget: z.object({ startBalance: z.number(), spentUnits: z.number(), remaining: z.number(), floor: z.number(), alert: z.boolean() }),
  youcamCredit: z.number().nullable().optional(),
});
export type LedgerResponse = z.infer<typeof LedgerResponse>;

export const workerRoutes = {
  install: { method: 'POST', path: '/v1/install', res: InstallResponse },
  ledger: { method: 'GET', path: '/v1/ledger', res: LedgerResponse },
} as const;

/**
 * Semantics the phone should know (no schema change needed):
 * - ScanStatusResponse.key and overlayJpegBase64 can arrive while status is still `running`; status turns `done`
 *   only once the YouCam delete is confirmed (or `failed` if it is not). Keep the latest `key`: photoDeleted flips to true then.
 * - overlayJpegBase64 and TryonStatusResponse.renders are sent exactly once, in the response that read them, then the Worker deletes the task.
 *
 * Other proposals:
 * - KeySource: add 'mock' so a Key built from mock fixtures is never shown as a real YouCam reading (today mock mode uses 'youcam_hd').
 * - @skinkey/rules BuildKeyInput: add optional `zones` (hd_skin_type labels per region). The Worker passes it already and merges
 *   zones into the Key itself when buildKeyProfile leaves them empty.
 */
