import type { AuditSummary } from '../../../../packages/rules/src/audit';
import { parseCsv } from './csv';

export type { AuditSummary };
export type AuditRow = Record<string, string>;

export type AuditState =
  | { kind: 'not_run' }
  | { kind: 'invalid'; problem: string }
  | { kind: 'ready'; summary: AuditSummary; rows: AuditRow[]; csvAvailable: boolean };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

/** Shape check for the fields /audit reads. The schema itself belongs to packages/rules (audit.ts). */
export function checkSummary(v: unknown): string | null {
  if (!isObj(v)) return 'summary.json is not an object';
  if (v.schema !== 1) return `unknown schema ${String(v.schema)}`;
  for (const key of ['generated_at', 'ruleset_hash', 'mode']) if (typeof v[key] !== 'string') return `${key} missing`;
  for (const key of ['catalog', 'frame', 'population', 'label_check', 'text']) if (!isObj(v[key])) return `${key} missing`;
  if (!Array.isArray(v.heatmap)) return 'heatmap missing';
  return null;
}

export function loadAudit(summaryJson: unknown, resultsCsv: string | null): AuditState {
  if (summaryJson == null) return { kind: 'not_run' };
  const problem = checkSummary(summaryJson);
  if (problem) return { kind: 'invalid', problem };
  const summary = summaryJson as AuditSummary;
  return {
    kind: 'ready',
    summary: { ...summary, notes: summary.notes ?? [], products: summary.products ?? [] },
    rows: resultsCsv ? parseCsv(resultsCsv) : [],
    csvAvailable: resultsCsv != null,
  };
}

export const isLabelCheckRow = (r: AuditRow) => (r.rule_id ?? '').startsWith('LC-');
export const isCounted = (r: AuditRow) => !/^(false|0|no)$/i.test((r.counted ?? '').trim());

/** One row per product × LC rule × token (results.csv may repeat a label hit). */
export function labelCheckRows(rows: readonly AuditRow[]): AuditRow[] {
  const seen = new Set<string>();
  return rows.filter(isLabelCheckRow).filter((r) => {
    const k = `${r.catalog_id ?? r.product_name}|${r.rule_id}|${r.matched_token}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Cell shade step 0–4 for the heatmap, from the share of checked products flagged. Never shown as a number of its own. */
export const heatStep = (count: number, of: number) => (of <= 0 || count <= 0 ? 0 : Math.min(4, Math.ceil((count / of) * 4)));
