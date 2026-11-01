import { z } from 'zod';

export const DeleteState = z.enum([
  'uploaded',
  'task_created',
  'running',
  'terminal_success',
  'terminal_error',
  'result_read',
  'delete_requested',
  'deleted',
  'delete_failed',
  'orphan',
]);
export type DeleteState = z.infer<typeof DeleteState>;

export const LedgerFeature = z.enum([
  'file_upload',
  'skin_analysis_hd',
  'skin_tone',
  'makeup_vto',
  'task_delete',
  'claude_resolve',
  'claude_label_ocr',
]);
export type LedgerFeature = z.infer<typeof LedgerFeature>;

export const LedgerEntry = z.object({
  feature: LedgerFeature,
  taskId: z.string().optional(),
  fileId: z.string().optional(),
  units: z.number().default(0),
  latencyMs: z.number().int().nonnegative(),
  startedAt: z.iso.datetime(),
  status: z.enum(['ok', 'error']),
  errorCode: z.string().optional(),
  deleteState: DeleteState.optional(),
  model: z.string().optional(),
  inputTokens: z.number().int().optional(),
  outputTokens: z.number().int().optional(),
});
export type LedgerEntry = z.infer<typeof LedgerEntry>;

export const FileRecord = z.object({
  fileId: z.string(),
  state: DeleteState,
  taskIds: z.array(z.string()),
});
export type FileRecord = z.infer<typeof FileRecord>;

/** "How this was made": task ids, units, latency, delete states. */
export const HowThisWasMade = z.object({
  mock: z.boolean(),
  entries: z.array(LedgerEntry),
  files: z.array(FileRecord),
  totalUnits: z.number(),
  totalLatencyMs: z.number().int(),
});
export type HowThisWasMade = z.infer<typeof HowThisWasMade>;

export const Caps = z.object({
  scansLeft: z.number().int(),
  tryonsLeft: z.number().int(),
});
export type Caps = z.infer<typeof Caps>;

/** GET /v1/ledger: global unit ledger. `?verify=1` with `x-skinkey-admin` also reads YouCam's credit endpoint (0 units). */
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
