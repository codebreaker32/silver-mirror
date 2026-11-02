import { describe, expect, it } from 'vitest';
import { COPY } from '@skinkey/contracts';
import { RESULTS_HEADER, auditClaims, claimsFromMarketedFor, parseCsv, reviewMarkdown, runAudit, toCsv, type FrozenRecord } from '../src/audit';
import { RULES, rulesetHash } from '../src';

/** Synthetic brand rows in the data/catalog/brands/*.json shape (not real products). */
const row = (name: string, marketed_for: string[], inci: string[], extra: Record<string, unknown> = {}) => ({
  brand: 'Acme',
  category: 'moisturiser',
  name,
  marketed_for,
  inci,
  inci_complete: true,
  source_url: `https://acme.test/${name.toLowerCase().replace(/\W+/g, '-')}`,
  gtin_barcode: '',
  ...extra,
});

const brandFiles = [
  {
    file: 'a.json',
    rows: [
      row('Matte Gel', ['oily skin'], ['Aqua', 'Glycerin', 'Isopropyl Myristate', 'Niacinamide']),
      row('Calm Lotion', ['fragrance-free', 'sensitive skin'], ['Aqua', 'Glycerin', 'Parfum'], { gtin_barcode: '890' }),
      row('Soft Cream', ['Fragrance free'], ['Aqua', 'Glycerin', 'Limonene']),
      row('Fresh Toner', ['alcohol-free'], ['Aqua', 'Alcohol Denat.', 'Glycerin'], { category: 'toner' }),
      row('Oil-Free Light Fluid', ['Oily/Combination'], ['Aqua', 'Simmondsia Chinensis Seed Oil', 'Glycerin'], { category: 'sunscreen' }),
      row('Rich Balm', ['non-comedogenic'], ['Petrolatum', 'Aqua', 'Glycerin']),
      row('BPO Wash', ['oily skin'], ['Aqua', 'Benzoyl Peroxide'], { category: 'cleanser' }),
      row('Plain Wash', ['daily use'], ['Aqua', 'Glycerin'], { category: 'cleanser' }),
      row('Herbal Cream', ['dry skin'], ['Herbs Q.S.'], { inci_complete: false }),
      row('Matte Gel', ['oily skin'], ['Aqua']),
    ],
  },
  {
    file: 'b.json',
    rows: [
      row('Retail Gel', ['oily skin'], ['Aqua'], { source_url: 'https://www.nykaa.com/retail-gel/p/1' }),
      row('Decoded Gel', ['oily skin'], ['Aqua'], { source_url: 'https://cureskin.com/decoded' }),
      row('Beard Oil', ['all skin types'], ['Argania Spinosa Kernel Oil'], { category: 'beard_oil' }),
      row('All Day Cream', ['suitable for all skin types'], ['Aqua', 'Glycerin', 'Linalool']),
      row('Plain Http', ['oily skin'], ['Aqua'], { source_url: 'http://acme.test/plain' }),
      row('Calm Lotion Twin', ['oily skin'], ['Aqua'], { gtin_barcode: '890' }),
    ],
  },
];

const frozen: FrozenRecord = { method: 'brand-claims-1', ruleset_hash: rulesetHash(RULES), ruleset_version: '2.0.0', files: { 'x.ts': 'aa' } };
const base = { brandFiles, generatedAt: '2026-11-02T00:00:00.000Z', frozen, currentFiles: { 'x.ts': 'aa' }, verifiedIds: ['acme-calm-lotion'] };

describe('runAudit (method brand-claims-1)', () => {
  const { summary, resultsCsv } = runAudit(base);
  const rows = parseCsv(resultsCsv);

  it('applies the exclusions in order and counts N, a, medicine and checked', () => {
    expect(summary.input).toEqual({ files: 2, rows: 16 });
    expect(summary.excluded).toEqual({
      duplicate_id: 1,
      retailer_source: 1,
      third_party_source: 1,
      out_of_scope_category: 1,
      no_https_source: 1,
      duplicate_gtin: 1,
    });
    expect(summary.population).toEqual({ brand_rows: 10, N: 9, a: 8, unverifiable: 1, medicine: 1, checked: 7 });
    expect(summary.pilot).toBe(true);
    expect(summary.frozen).toEqual({ status: 'match', ruleset_hash: rulesetHash(RULES), changed_files: [] });
    expect(summary.headline).toBe(true);
  });

  it('Label Check: strict c and informational d', () => {
    expect(summary.label_check).toEqual({ c: 3, d: 1, by_rule: { 'LC-1a': 1, 'LC-1b': 1, 'LC-2': 1, 'LC-3': 1 } });
    const lc = rows.filter((r) => r.kind === 'LABEL_CHECK').map((r) => `${r.product_name}:${r.rule_id}:${r.matched_token}:${r.claim_quote}`);
    expect(lc.sort()).toEqual([
      'Calm Lotion:LC-1a:Parfum:fragrance-free',
      'Fresh Toner:LC-2:Alcohol Denat.:alcohol-free',
      'Oil-Free Light Fluid:LC-3:Simmondsia Chinensis Seed Oil:Oil-Free Light Fluid',
      'Soft Cream:LC-1b:Limonene:Fragrance free',
    ]);
  });

  it('six readings: CAUTION per reading profile over the checked rows', () => {
    expect(Object.fromEntries(summary.heatmap.map((h) => [h.profile_id, h.CAUTION]))).toEqual({
      oily: 2,
      combination: 1,
      'oily-redness': 5,
      'combination-redness': 4,
      normal: 0,
      dry: 1,
    });
    expect(summary.heatmap.every((h) => h.CAUTION + h.FITS === 7)).toBe(true);
  });

  it('claim vs reading profile: e of b, and the claim × profile matrix', () => {
    expect(summary.claim_profile).toEqual({ b: 5, e: 4 });
    const oily = summary.claim_matrix.find((m) => m.claim === 'for_oily_skin')!;
    expect(oily).toMatchObject({ N: 3, checked: 2, claim_matched_caution: 1, profiles_matched: ['oily', 'oily-redness'] });
    const nc = summary.claim_matrix.find((m) => m.claim === 'non_comedogenic')!;
    expect(nc).toMatchObject({ label: 'non-comedogenic', N: 1, checked: 1, claim_matched_caution: 1 });
    expect(summary.claim_matrix.find((m) => m.claim === 'fragrance_free')!.claim_matched_caution).toBeNull();
    const occ = rows.find((r) => r.rule_id === 'OCC-2')!;
    expect(occ).toMatchObject({ product_name: 'Matte Gel', matched_token: 'Isopropyl Myristate', position: '3', profile_ids: 'oily;oily-redness', claim_matched_profiles: 'oily;oily-redness', claim_quote: 'oily skin' });
    const alc = rows.find((r) => r.rule_id === 'ALC-1')!;
    expect(alc).toMatchObject({ product_name: 'Fresh Toner', claim_matched_profiles: '' });
  });

  it('review list: every flagged row, with human ticks from verified.json', () => {
    expect(summary.review).toMatchObject({ items: 8, products: 7, ticked: 2, pending: 6 });
    expect(summary.review.list.filter((r) => r.kind === 'CLAIM_PROFILE').map((r) => `${r.product_name}:${r.rule_id}`)).toEqual([
      'Matte Gel:OCC-2',
      'Calm Lotion:FRG-1',
      'Rich Balm:OCC-1',
      'All Day Cream:FRG-1',
    ]);
    for (const r of summary.review.list) expect(r.source_url).toMatch(/^https:\/\/acme\.test\//);
    const md = reviewMarkdown(summary);
    expect(md).toMatch(/8 flagged rows on 7 products\. Reviewed by a person: 2\. Pending: 6\./);
    expect(md).toMatch(/\| \[x\] ticked \| Acme: Calm Lotion \(`acme-calm-lotion`\) \| Label Check, strict \| LC-1a \(R\) \| "fragrance-free" \| Parfum \(3\) \|/);
  });

  it('medicine rows stop at the gate', () => {
    expect(rows.find((r) => r.rule_id === 'MED-1')).toMatchObject({ product_name: 'BPO Wash', matched_token: 'benzoyl peroxide' });
    expect(summary.products.find((p) => p.name === 'BPO Wash')).toMatchObject({ in_a: true, checked: false, medicine_token: 'benzoyl peroxide' });
  });

  it('fills the pre-registered sentences from the counts', () => {
    expect(summary.text.coverage).toBe(
      '9 products in our brand-page catalogue make a skin-type or free-from claim on their own brand page. 8 of them have a complete ingredient list there.',
    );
    expect(summary.text.label_check).toBe(
      "3 of 7 make a claim their own ingredient list doesn't match (strict rules LC-1a / LC-2 / LC-3), plus 1 more list a fragrance substance or essential oil under a 'fragrance-free' claim (LC-1b, informational).",
    );
    expect(summary.text.claim_profile).toBe(
      "4 of 5 products that name a skin type or 'non-comedogenic' on their brand page are flagged CAUTION by our published rules for a reading profile their own claim points to.",
    );
    expect(summary.text.six_readings).toMatch(/^Across the 7 checked products, the number flagged CAUTION is 2 for a YouCam 'Oily' reading profile, 1 for a YouCam 'Combination' reading profile, /);
    expect(summary.text.caption).toBe(COPY.auditCaption);
    expect(rows.every((r) => r.ruleset_hash === summary.ruleset_hash)).toBe(true);
    expect(resultsCsv.split('\n')[0]).toBe(RESULTS_HEADER.join(','));
  });

  it('is deterministic for a fixed timestamp', () => {
    expect(JSON.stringify(runAudit(base))).toBe(JSON.stringify(runAudit(base)));
  });
});

describe('freeze check', () => {
  it('no frozen record, or a different ruleset hash, is not the headline', () => {
    expect(runAudit({ ...base, frozen: null }).summary).toMatchObject({ headline: false, frozen: { status: 'missing' } });
    const r = runAudit({ ...base, frozen: { ...frozen, ruleset_hash: '000000000000' } }).summary;
    expect(r).toMatchObject({ headline: false, frozen: { status: 'mismatch' } });
  });

  it('names files that changed since the freeze', () => {
    const r = runAudit({ ...base, currentFiles: { 'x.ts': 'bb', 'y.ts': 'cc' } }).summary;
    expect(r.frozen.changed_files).toEqual(['x.ts', 'y.ts']);
    expect(r.headline).toBe(true);
    expect(r.notes.join(' ')).toMatch(/x\.ts, y\.ts/);
  });

  it('works with no brand files at all', () => {
    const { summary } = runAudit({ ...base, brandFiles: [] });
    expect(summary.population).toEqual({ brand_rows: 0, N: 0, a: 0, unverifiable: 0, medicine: 0, checked: 0 });
    expect(summary.text.label_check).toBeNull();
    expect(summary.text.six_readings).toBeNull();
    expect(reviewMarkdown(summary)).toMatch(/Nothing was flagged/);
  });
});

describe('brand-page claim matcher', () => {
  it('reads skin types, free-from claims and non-comedogenic, skipping negated phrases', () => {
    expect(auditClaims(['Oily/Combination', 'non comedogenic'], 'Oil-Free Gel').map((c) => c.type)).toEqual([
      'oil_free',
      'non_comedogenic',
      'for_oily_skin',
      'for_combination_skin',
    ]);
    expect(auditClaims(['not suitable for oily skin, non-comedogenic', 'dry touch finish'])).toEqual([]);
    expect(auditClaims(['Noncomedogenic formula'])[0]).toEqual({ type: 'non_comedogenic', quote: 'Noncomedogenic formula' });
  });

  it('keeps the shared matcher behaviour', () => {
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
