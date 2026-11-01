import type { FileRecord, HowThisWasMade, LedgerEntry, LedgerFeature } from '@skinkey/contracts';
import type { JsonStore } from './kv';

/**
 * Unit cost per successful task (research/youcam_live_facts.md, GET /s2s/v2.0/credit/feature-cost, 2026-11-01).
 * HD Skin Analysis with 5 concerns falls in the 5–8 bracket. Errors consume no units (sa21 docs).
 */
export const UNIT_COSTS: Record<LedgerFeature, number> = {
  file_upload: 0,
  skin_analysis_hd: 16,
  skin_tone: 20,
  makeup_vto: 1,
  task_delete: 0,
  claude_resolve: 0,
  claude_label_ocr: 0,
};

export const summarise = (mock: boolean, entries: LedgerEntry[], files: FileRecord[]): HowThisWasMade => ({
  mock,
  entries,
  files,
  totalUnits: entries.reduce((n, e) => n + (e.units ?? 0), 0),
  totalLatencyMs: entries.reduce((n, e) => n + e.latencyMs, 0),
});

export interface GlobalLedger {
  spentUnits: number;
  byFeature: Partial<Record<LedgerFeature, number>>;
  successfulTasks: number;
  deletesConfirmed: number;
  deletesFailed: number;
  claudeCalls: number;
  claudeInputTokens: number;
  claudeOutputTokens: number;
  updatedAt: string | null;
}

const EMPTY: GlobalLedger = {
  spentUnits: 0,
  byFeature: {},
  successfulTasks: 0,
  deletesConfirmed: 0,
  deletesFailed: 0,
  claudeCalls: 0,
  claudeInputTokens: 0,
  claudeOutputTokens: 0,
  updatedAt: null,
};

const key = (mock: boolean) => (mock ? 'ledger:mock' : 'ledger:live');

export const readGlobalLedger = async (store: JsonStore, mock: boolean): Promise<GlobalLedger> => ({
  ...EMPTY,
  ...((await store.get<GlobalLedger>(key(mock))) ?? {}),
});

/** Read-modify-write; concurrent isolates can drop an increment, so the credit endpoint stays the source of truth. */
export const recordGlobal = async (
  store: JsonStore,
  mock: boolean,
  update: { entry?: LedgerEntry; deleteConfirmed?: boolean; deleteFailed?: boolean },
): Promise<GlobalLedger> => {
  const g = await readGlobalLedger(store, mock);
  const e = update.entry;
  if (e) {
    if (e.units > 0) {
      g.spentUnits += e.units;
      g.byFeature[e.feature] = (g.byFeature[e.feature] ?? 0) + e.units;
      g.successfulTasks += 1;
    }
    if (e.feature.startsWith('claude_')) {
      g.claudeCalls += 1;
      g.claudeInputTokens += e.inputTokens ?? 0;
      g.claudeOutputTokens += e.outputTokens ?? 0;
    }
  }
  if (update.deleteConfirmed) g.deletesConfirmed += 1;
  if (update.deleteFailed) g.deletesFailed += 1;
  g.updatedAt = new Date().toISOString();
  await store.put(key(mock), g);
  return g;
};

export interface BudgetStatus {
  startBalance: number;
  spentUnits: number;
  remaining: number;
  floor: number;
  /** Spec §12: alert at 25% remaining. */
  alert: boolean;
}

export const budget = (g: GlobalLedger, startBalance: number, floor: number): BudgetStatus => {
  const remaining = startBalance - g.spentUnits;
  return { startBalance, spentUnits: g.spentUnits, remaining, floor, alert: remaining <= startBalance * 0.25 };
};

/** True when the next call of this cost would take the live balance under the floor. */
export const wouldBreachFloor = (status: BudgetStatus, cost: number) => status.remaining - cost < status.floor;
