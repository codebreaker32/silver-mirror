import { describe, expect, it } from 'vitest';
import { checkSummary, heatStep, labelCheckRows, loadAudit } from './audit';

const summary = {
  schema: 1,
  generated_at: '2026-11-01T17:41:26.394Z',
  ruleset_hash: 'abc',
  ruleset_version: '2.0.0',
  mode: 'frame',
  headline: true,
  copy_set: 'B',
  catalog: { source: 'x', rows: 3, verified: 3, unverified: 0, unverifiable: 0 },
  frame: { status: 'complete', dirs: [], N: 3, matched: 3, a: 2, unverified: 0, unverifiable: 1, no_row: 0, pilot: true },
  population: { checked: 2, medicine: 0 },
  heatmap: [{ profile_id: 'oily', label: 'Oily', CAUTION: 1, FITS: 1, by_top_grade: { R: 0, L: 1, T: 0 }, rule_ids: { 'OCC-2': 1 } }],
  label_check: { c: 1, d: 0, by_rule: { 'LC-2': 1 } },
  text: { coverage: null, lead: null, label_check: null, caption: 'c' },
};

const csv = [
  'product_name,catalog_id,rule_id,counted,matched_token,profile_ids',
  'A,a,LC-2,true,Alcohol Denat.,oily',
  'A,a,LC-2,true,Alcohol Denat.,dry',
  'A,a,OCC-2,true,Isopropyl Myristate,oily',
  'B,b,LC-1b,false,Limonene,',
].join('\n');

describe('audit loader', () => {
  it('gives the honest empty state when summary.json is absent', () => {
    expect(loadAudit(null, null)).toEqual({ kind: 'not_run' });
  });

  it('refuses a summary of the wrong shape instead of guessing numbers', () => {
    expect(loadAudit({ schema: 2 }, null).kind).toBe('invalid');
    expect(checkSummary({ ...summary, heatmap: undefined })).toBe('heatmap missing');
  });

  it('reads a valid summary and its results.csv', () => {
    const s = loadAudit(summary, csv);
    expect(s.kind).toBe('ready');
    if (s.kind !== 'ready') return;
    expect(s.rows).toHaveLength(4);
    expect(s.summary.notes).toEqual([]);
  });

  it('lists each product × label rule × token once', () => {
    const s = loadAudit(summary, csv);
    if (s.kind !== 'ready') throw new Error('not ready');
    expect(labelCheckRows(s.rows).map((r) => `${r.catalog_id}:${r.rule_id}`)).toEqual(['a:LC-2', 'b:LC-1b']);
  });

  it('maps counts to five shade steps', () => {
    expect([heatStep(0, 10), heatStep(1, 10), heatStep(5, 10), heatStep(10, 10), heatStep(3, 0)]).toEqual([0, 1, 2, 4, 0]);
  });
});
