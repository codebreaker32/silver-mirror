import { describe, expect, it } from 'vitest';
import { COPY } from '@skinkey/contracts';
import {
  CONCERN_LABEL,
  NAME_ONLY_NOTE,
  NO_READINGS_SUBTITLE,
  READING_PROFILES,
  RULES,
  SOURCES,
  ZONE_LABEL,
  lintCopy,
  profileKey,
  verdict,
} from '../src';
import { runAudit } from '../src/audit';
import { PRODUCTS } from './fixtures/products';

const flatten = (v: unknown): string[] =>
  typeof v === 'string' ? [v] : typeof v === 'function' ? [String((v as (s: string) => string)('X'))] : v && typeof v === 'object' ? Object.values(v).flatMap(flatten) : [];

describe('lintCopy (brief §4.4, spec §9)', () => {
  it.each([
    'This is safe for you',
    'Unsafe ingredient',
    'treats acne',
    'helps prevent breakouts',
    'heals the barrier',
    'fixes oily skin',
    'skin whitening',
    'fairness cream',
    'Your skin is oily',
    'You have dry skin',
    'guaranteed match',
    'a perfect match',
    'no white cast',
    'precise reading',
    'accurate scan',
    'skin age 32',
    'score 72/100',
    'opens inside Flipkart',
    'deep-links into Flipkart',
    'works in any store',
    'works from any app',
    'may cause an allergic reaction',
    'dermatologist-approved',
    'a skin condition',
  ])('flags: %s', (text) => {
    expect(lintCopy(text).length).toBeGreaterThan(0);
  });

  it.each(['Not a guarantee.', 'Preview, not a shade guarantee.', 'conditioning agent', 'Oiliness reading: High (whole face, scan 1 Nov)'])('allows: %s', (text) => {
    expect(lintCopy(text)).toEqual([]);
  });

  it('allowlists the approved Accuracy note', () => {
    expect(lintCopy(COPY.accuracyNote)).toEqual([]);
    expect(lintCopy(`${COPY.accuracyNote} Very accurate.`)).toHaveLength(1);
  });

  it('bans "T-zone reading" only on copy set B', () => {
    expect(lintCopy('T-zone reading: Oily', { copySet: 'A' })).toEqual([]);
    expect(lintCopy('T-zone reading: Oily', { copySet: 'B' })).toHaveLength(1);
  });
});

describe('all rule text is clean', () => {
  it('rule templates, citations and labels', () => {
    const texts = [
      ...RULES.flatMap((r) => [r.template, ...r.sources.map((s) => s.citation), ...r.counterSources.map((s) => s.citation)]),
      ...Object.values(SOURCES).map((s) => s.citation),
      ...READING_PROFILES.map((p) => p.label),
      ...Object.values(CONCERN_LABEL),
      ...Object.values(ZONE_LABEL),
      NO_READINGS_SUBTITLE,
      NAME_ONLY_NOTE,
    ];
    for (const t of texts) expect(lintCopy(t), t).toEqual([]);
  });

  it('every rendered reason, subtitle and provenance line across SKUs × profiles × copy sets', () => {
    for (const copySet of ['A', 'B'] as const) {
      for (const profile of READING_PROFILES) {
        for (const p of PRODUCTS) {
          const v = verdict({ key: profileKey(profile, copySet), inci: p.inci, inciSource: 'catalog_verified', claims: p.claims, title: p.name });
          for (const t of [v.subtitle, v.provenance.line, v.note ?? '', ...v.reasons.map((r) => r.plain), ...v.labelChecks.map((r) => r.plain)]) {
            expect(lintCopy(t, { copySet }), t).toEqual([]);
          }
        }
      }
    }
  });

  it('the fixed COPY strings pass the linter', () => {
    for (const t of flatten(COPY)) expect(lintCopy(t), t).toEqual([]);
  });

  it('audit summary text passes the linter', () => {
    const csv = 'rank,name\n' + PRODUCTS.map((p, i) => `${i + 1},${p.name}`).join('\n');
    const { summary } = runAudit({ frames: [{ dir: 'data/frame/x_2026-11-01', namesCsv: csv, files: [] }], catalogRows: PRODUCTS, catalogSource: 'fixture', generatedAt: 'now' });
    for (const t of Object.values(summary.text)) if (t) expect(lintCopy(t), t).toEqual([]);
  });
});
