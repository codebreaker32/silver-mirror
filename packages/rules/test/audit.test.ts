import { describe, expect, it } from 'vitest';
import { COPY } from '@skinkey/contracts';
import { RESULTS_HEADER, adaptRow, claimsFromMarketedFor, matchFrameRow, parseCsv, runAudit, toCsv } from '../src/audit';
import { PRODUCTS } from './fixtures/products';

const frameCsv = (names: string[]) => 'rank,name,screenshot\n' + names.map((n, i) => `${i + 1},"${n}",shots/p${i + 1}.png`).join('\n') + '\n';

const base = { catalogRows: PRODUCTS, catalogSource: 'fixture', generatedAt: '2026-11-01T12:00:00.000Z' };

describe('runAudit with no frame', () => {
  it('says so and does not produce headline text', () => {
    const { summary, resultsCsv } = runAudit({ ...base, frames: [] });
    expect(summary.mode).toBe('catalog_preview');
    expect(summary.headline).toBe(false);
    expect(summary.frame.status).toBe('missing');
    expect(summary.text.coverage).toBeNull();
    expect(summary.text.lead).toBeNull();
    expect(summary.notes.join(' ')).toMatch(/No frame found/);
    expect(resultsCsv.split('\n')[0]).toBe(RESULTS_HEADER.join(','));
  });

  it('empty names.csv → status empty', () => {
    const { summary } = runAudit({ ...base, frames: [{ dir: 'data/frame/flipkart_oily_2026-11-01', namesCsv: 'rank,name\n', files: [] }] });
    expect(summary.frame.status).toBe('empty');
    expect(summary.mode).toBe('catalog_preview');
  });

  it('works with an empty catalogue too', () => {
    const { summary } = runAudit({ ...base, catalogRows: [], frames: [] });
    expect(summary.catalog.rows).toBe(0);
    expect(summary.heatmap.every((h) => h.CAUTION === 0)).toBe(true);
  });
});

describe('runAudit with a partial frame', () => {
  const frames = [
    {
      dir: 'data/frame/flipkart_oily_2026-11-01',
      namesCsv: frameCsv(['Fixture Rich Cream', 'Fixture Mattifying Toner', 'Fixture Calm Lotion', 'Fixture Unverified Cream', 'A Product We Never Found', 'Fixture BPO Wash']),
      files: ['shots/p1.png', 'shots/p2.png', 'SHA256SUMS'],
    },
  ];
  const { summary, resultsCsv } = runAudit({ ...base, frames });
  const rows = parseCsv(resultsCsv);

  it('counts N, a, no_row and flags a pilot', () => {
    expect(summary.mode).toBe('frame');
    expect(summary.headline).toBe(true);
    expect(summary.frame).toMatchObject({ status: 'partial', N: 6, matched: 5, a: 4, unverified: 1, no_row: 1, pilot: true });
    expect(summary.frame.dirs[0]).toMatchObject({ rows: 6, screenshots: 2, sha256_manifest: true });
  });

  it('fills the pre-registered templates from the counts', () => {
    expect(summary.text.coverage).toBe(
      "Flipkart's 'Oily Skin' filter showed us 6 moisturisers and sunscreens on 1 Nov. We could verify full ingredient lists from brand pages for 4 of them. (pilot: 4 of 6 verified)",
    );
    expect(summary.text.lead).toMatch(/^Flipkart shows the same 4 products to everyone who picks 'Oily Skin'\. Under our published rules, the number flagged CAUTION is 1 for a YouCam 'Oily' reading profile, /);
    expect(summary.text.label_check).toBe(
      "2 of 4 make a claim their own ingredient list doesn't match (strict rules LC-1a / LC-2 / LC-3), plus 0 more have a listed allergen under a 'fragrance-free' claim (LC-1b, informational).",
    );
    expect(summary.text.caption).toBe(COPY.auditCaption);
  });

  it('heatmap: medicine rows are excluded from fit counts', () => {
    expect(summary.population.medicine).toBe(1);
    const oily = summary.heatmap.find((h) => h.profile_id === 'oily')!;
    expect(oily.CAUTION + oily.FITS).toBe(3);
    const oilyRed = summary.heatmap.find((h) => h.profile_id === 'oily-redness')!;
    expect(oilyRed.CAUTION).toBe(2);
    expect(oilyRed.by_top_grade.R).toBe(2);
  });

  it('writes one results row per product × rule hit with the evidence columns', () => {
    const lc = rows.filter((r) => r.kind === 'LABEL_CHECK');
    expect(lc.map((r) => `${r.product_name}:${r.rule_id}:${r.matched_token}`).sort()).toEqual([
      'Fixture Calm Lotion:LC-1a:Fragrance (Parfum)',
      'Fixture Calm Lotion:LC-1b:Limonene',
      'Fixture Mattifying Toner:LC-2:Alcohol Denat.',
    ]);
    const occ = rows.find((r) => r.rule_id === 'OCC-2')!;
    expect(occ).toMatchObject({ frame_rank: '1', matched_token: 'Isopropyl Myristate', position: '3', screenshot_path: 'shots/p1.png', profile_ids: 'oily;oily-redness' });
    expect(rows.find((r) => r.rule_id === 'MED-1')?.matched_token).toBe('benzoyl peroxide');
    expect(rows.every((r) => r.ruleset_hash === summary.ruleset_hash)).toBe(true);
  });

  it('include_unverified marks the run as not the headline', () => {
    const r = runAudit({ ...base, frames, includeUnverified: true });
    expect(r.summary.frame.a).toBe(5);
    expect(r.summary.headline).toBe(false);
    expect(r.summary.text.coverage).toBeNull();
  });

  it('is deterministic for a fixed timestamp', () => {
    expect(JSON.stringify(runAudit({ ...base, frames }))).toBe(JSON.stringify(runAudit({ ...base, frames })));
  });
});

describe('frame matching', () => {
  const rows = PRODUCTS.map((p) => adaptRow(p)!);
  it('prefers catalog_id, then exact name, then word overlap', () => {
    expect(matchFrameRow({ name: 'whatever', catalog_id: 'fx-heavy-cream' }, rows)).toMatchObject({ method: 'catalog_id' });
    expect(matchFrameRow({ name: 'FIXTURE rich cream' }, rows)).toMatchObject({ method: 'exact_name', row: { id: 'fx-heavy-cream' } });
    expect(matchFrameRow({ name: 'Fixture Niacinamide Gel Moisturiser 50 g' }, rows)).toMatchObject({ method: 'word_overlap', row: { id: 'fx-gel-niacinamide' } });
    expect(matchFrameRow({ name: 'Totally different thing' }, rows)).toMatchObject({ method: 'none', row: null });
  });
});

describe('row adapter', () => {
  it('adapts raw brand rows and marks them unverified until a human ticks them', () => {
    const row = adaptRow({
      brand: 'Plum',
      name: 'Green Tea Face Wash',
      category: 'cleanser',
      inci: ['Aqua (Water)', 'Glycerin', 'Fragrance'],
      inci_complete: true,
      marketed_for: ['oily skin', 'acne-prone skin', 'dry touch finish', 'not suitable for sensitive skin'],
      source_url: 'https://example.test',
    })!;
    expect(row).toMatchObject({ id: 'plum-green-tea-face-wash', status: 'unverified', verified: false, claims_source: 'marketed_for_phrase_match' });
    expect(row.inci.map((t) => t.position)).toEqual([1, 2, 3]);
    expect(row.claims.map((c) => c.type)).toEqual(['for_oily_skin']);
  });

  it('incomplete INCI is unverifiable', () => {
    expect(adaptRow({ brand: 'B', name: 'N', inci: ['Aqua'], inci_complete: false })!.status).toBe('unverifiable');
    expect(adaptRow({ brand: 'B', name: 'N', inci: [] })!.status).toBe('unverifiable');
    expect(adaptRow({ nonsense: true })).toBeNull();
  });

  it('reads free-from claims from phrases and the product name', () => {
    expect(claimsFromMarketedFor(['hypoallergenic & fragrance-free', 'alcohol free'], 'Rice Oil-Free Moisturizer').map((c) => c.type)).toEqual([
      'fragrance_free',
      'alcohol_free',
      'oil_free',
    ]);
    expect(claimsFromMarketedFor(['all skin types', 'Oily / Combination Skin']).map((c) => c.type)).toEqual(['for_all_skin_types', 'for_oily_skin', 'for_combination_skin']);
  });
});

describe('csv helpers', () => {
  it('round-trips quotes, commas and newlines', () => {
    const csv = toCsv(['a', 'b'], [{ a: 'x, "y"', b: 'line\nbreak' }, { a: 1, b: null }]);
    expect(parseCsv(csv)).toEqual([
      { a: 'x, "y"', b: 'line\nbreak' },
      { a: '1', b: '' },
    ]);
  });

  it('normalises headers and strips a BOM', () => {
    expect(parseCsv('﻿Product Name,Rank\r\nFoo,1\r\n')).toEqual([{ product_name: 'Foo', rank: '1' }]);
  });
});
