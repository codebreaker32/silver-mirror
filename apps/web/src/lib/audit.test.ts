import { describe, expect, it } from 'vitest';
import { checkSummary, claimReviewItems, distinctQuotes, freeFromRows, heatStep, labelReviewItems, loadAudit, profileClaimRows } from './audit';

const item = (kind: 'LABEL_CHECK' | 'CLAIM_PROFILE', rule_id: string) => ({
  catalog_id: 'a',
  brand: 'B',
  product_name: 'A',
  kind,
  rule_id,
  grade: 'R',
  counted: kind === 'LABEL_CHECK',
  contested: false,
  claim_type: 'fragrance_free',
  claim_quote: 'fragrance-free',
  matched_token: 'Parfum',
  position: 3,
  profile_ids: kind === 'CLAIM_PROFILE' ? ['oily-redness'] : [],
  source_url: 'https://brand.test/a',
  review_status: 'pending',
});

const matrixRow = (claim: string, profiles: string[]) => ({ claim, label: claim, N: 1, checked: 1, profiles_matched: profiles, caution: {}, claim_matched_caution: profiles.length ? 0 : null });

const summary = {
  schema: 2,
  method: 'brand-claims-1',
  generated_at: '2026-11-02T04:45:03.871Z',
  ruleset_hash: 'abc',
  ruleset_version: '2.0.0',
  frozen: { status: 'match', ruleset_hash: 'abc', changed_files: [] },
  headline: true,
  pilot: true,
  population: { brand_rows: 3, N: 3, a: 2, unverifiable: 1, medicine: 0, checked: 2 },
  label_check: { c: 1, d: 0, by_rule: { 'LC-1a': 1 } },
  heatmap: [{ profile_id: 'oily', label: 'Oily', CAUTION: 1, FITS: 1, by_top_grade: { R: 0, L: 1, T: 0 }, rule_ids: { 'OCC-2': 1 } }],
  claim_matrix: [matrixRow('fragrance_free', []), matrixRow('for_oily_skin', ['oily']), matrixRow('oil_free', [])],
  claim_profile: { b: 1, e: 1 },
  review: { items: 2, products: 1, ticked: 0, pending: 2, list: [item('LABEL_CHECK', 'LC-1a'), item('CLAIM_PROFILE', 'FRG-1')] },
  text: { coverage: 'x', label_check: null, claim_profile: null, six_readings: null, caption: 'c' },
};

describe('audit loader', () => {
  it('gives the honest empty state when summary.json is absent', () => {
    expect(loadAudit(null, null)).toEqual({ kind: 'not_run' });
  });

  it('refuses a summary of the wrong shape instead of guessing numbers', () => {
    expect(loadAudit({ schema: 1 }, null).kind).toBe('invalid');
    expect(checkSummary({ ...summary, claim_matrix: undefined })).toBe('claim_matrix missing');
    expect(checkSummary({ ...summary, review: { items: 0 } })).toBe('review.list missing');
  });

  it('reads a valid summary and its results.csv', () => {
    const s = loadAudit(summary, 'catalog_id,rule_id\na,LC-1a\n');
    expect(s.kind).toBe('ready');
    if (s.kind !== 'ready') return;
    expect(s.rows).toHaveLength(1);
    expect(s.summary.notes).toEqual([]);
  });

  it('splits the review list and the claim matrix the way the page shows them', () => {
    const s = loadAudit(summary, null);
    if (s.kind !== 'ready') throw new Error('not ready');
    expect(labelReviewItems(s.summary).map((r) => r.rule_id)).toEqual(['LC-1a']);
    expect(claimReviewItems(s.summary).map((r) => r.rule_id)).toEqual(['FRG-1']);
    expect(freeFromRows(s.summary).map((m) => m.claim)).toEqual(['fragrance_free', 'oil_free']);
    expect(profileClaimRows(s.summary).map((m) => m.claim)).toEqual(['for_oily_skin']);
  });

  it('shows each claim phrase once', () => {
    expect(distinctQuotes('combination to oily skin | combination to oily skin | sensitive skin')).toBe('combination to oily skin | sensitive skin');
  });

  it('maps counts to five shade steps', () => {
    expect([heatStep(0, 10), heatStep(1, 10), heatStep(5, 10), heatStep(10, 10), heatStep(3, 0)]).toEqual([0, 1, 2, 4, 0]);
  });
});
