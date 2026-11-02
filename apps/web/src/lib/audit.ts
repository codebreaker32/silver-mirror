import type { AuditSummary, ClaimMatrixRow, ReviewItem } from '../../../../packages/rules/src/audit';
import { parseCsv } from './csv';

export type { AuditSummary, ClaimMatrixRow, ReviewItem };
export type AuditRow = Record<string, string>;

export type AuditState =
  | { kind: 'not_run' }
  | { kind: 'invalid'; problem: string }
  | { kind: 'ready'; summary: AuditSummary; rows: AuditRow[]; csvAvailable: boolean };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

/** Shape check for the fields /audit reads. The schema itself belongs to packages/rules (audit.ts, method brand-claims-1). */
export function checkSummary(v: unknown): string | null {
  if (!isObj(v)) return 'summary.json is not an object';
  if (v.schema !== 2) return `unknown schema ${String(v.schema)} (this page reads schema 2, method brand-claims-1)`;
  for (const key of ['generated_at', 'ruleset_hash', 'method']) if (typeof v[key] !== 'string') return `${key} missing`;
  for (const key of ['frozen', 'population', 'label_check', 'claim_profile', 'review', 'text']) if (!isObj(v[key])) return `${key} missing`;
  for (const key of ['heatmap', 'claim_matrix']) if (!Array.isArray(v[key])) return `${key} missing`;
  if (!Array.isArray((v.review as Record<string, unknown>).list)) return 'review.list missing';
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

export const labelReviewItems = (s: AuditSummary): ReviewItem[] => s.review.list.filter((r) => r.kind === 'LABEL_CHECK');
export const claimReviewItems = (s: AuditSummary): ReviewItem[] => s.review.list.filter((r) => r.kind === 'CLAIM_PROFILE');

/** Free-from claims are the only ones the Label Check can test; their checked counts say how much a zero c rests on. */
export const FREE_FROM_CLAIMS = ['fragrance_free', 'alcohol_free', 'oil_free'] as const;
export const freeFromRows = (s: AuditSummary): ClaimMatrixRow[] =>
  s.claim_matrix.filter((m) => (FREE_FROM_CLAIMS as readonly string[]).includes(m.claim));
export const profileClaimRows = (s: AuditSummary): ClaimMatrixRow[] => s.claim_matrix.filter((m) => m.profiles_matched.length > 0);

/** One quote per distinct phrase (a phrase can carry two claim types, e.g. "combination to oily skin"). */
export const distinctQuotes = (quote: string): string => [...new Set(quote.split(' | ').map((q) => q.trim()).filter(Boolean))].join(' | ');

/** Cell shade step 0–4 for the heatmap, from the share of checked products flagged. Never shown as a number of its own. */
export const heatStep = (count: number, of: number) => (of <= 0 || count <= 0 ? 0 : Math.min(4, Math.ceil((count / of) * 4)));
