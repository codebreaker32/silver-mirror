import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CatalogProduct } from '@skinkey/contracts';
import { mergeCatalog, sourceKindOf } from '../src';

const row = (over: Record<string, unknown> = {}) => ({
  brand: 'Acme',
  name: 'Gel Cream',
  category: 'moisturizer',
  size: '50g',
  spf: null,
  marketed_for: ['Oily skin'],
  inci: ['Aqua', 'Glycerin', 'Niacinamide'],
  inci_complete: true,
  source_url: 'https://acme.in/products/gel-cream',
  gtin_barcode: '8900000000001',
  search_keywords: 'Acme Gel Cream',
  ...over,
});
const opts = { fetchedAt: '2026-11-01T00:00:00.000Z' };

describe('sourceKindOf', () => {
  it('classifies brand pages, retailers and decoders; rejects non-https', () => {
    expect(sourceKindOf('https://beminimalist.co/products/x')).toBe('brand_official');
    expect(sourceKindOf('https://www.apollopharmacy.in/otc/x')).toBe('retailer');
    expect(sourceKindOf('https://www.nykaa.com/x/p/1')).toBe('retailer');
    expect(sourceKindOf('https://cureskin.com/x')).toBe('third_party');
    expect(sourceKindOf('http://acme.in/x')).toBeNull();
    expect(sourceKindOf('')).toBeNull();
  });
});

describe('mergeCatalog', () => {
  it('keeps a complete brand-page row as unverified with claims and source_kind', () => {
    const { rows, dropped } = mergeCatalog([{ file: 'acme.json', rows: [row()] }], opts);
    expect(dropped).toEqual([]);
    expect(rows).toHaveLength(1);
    const r = rows[0]!;
    expect(CatalogProduct.safeParse(r).success).toBe(true);
    expect(r).toMatchObject({ id: 'acme-gel-cream', category: 'moisturiser', source_kind: 'brand_official', verified: false, status: 'unverified', fetched_at: opts.fetchedAt });
    expect(r.inci.map((t) => t.position)).toEqual([1, 2, 3]);
  });

  it('drops unverifiable rows with a reason', () => {
    const { rows, dropped } = mergeCatalog(
      [
        {
          file: 'x.json',
          rows: [
            row({ name: 'A', inci_complete: false }),
            row({ name: 'B', source_url: 'http://acme.in/b', gtin_barcode: '' }),
            row({ name: 'C', source_url: 'https://cureskin.com/c', gtin_barcode: '' }),
            row({ name: 'D', category: 'beard_care', gtin_barcode: '' }),
            row({ name: 'E', inci: [], gtin_barcode: '' }),
            'not a row',
          ],
        },
      ],
      opts,
    );
    expect(rows).toEqual([]);
    expect(dropped.map((d) => [d.name, d.reason])).toEqual([
      ['A', 'inci_incomplete'],
      ['B', 'no_https_source'],
      ['C', 'third_party_source'],
      ['D', 'out_of_scope_category'],
      ['E', 'inci_incomplete'],
      ['', 'not_a_product_row'],
    ]);
  });

  it('dedupes on id and GTIN, first row wins', () => {
    const { rows, dropped } = mergeCatalog(
      [
        { file: 'a.json', rows: [row()] },
        { file: 'b.json', rows: [row({ inci: ['Aqua'] }), row({ name: 'Gel Cream 2' })] },
      ],
      opts,
    );
    expect(rows.map((r) => r.id)).toEqual(['acme-gel-cream']);
    expect(rows[0]!.inci).toHaveLength(3);
    expect(dropped.map((d) => d.reason)).toEqual(['duplicate_id', 'duplicate_gtin']);
  });

  it('a human tick verifies only brand_official rows; self-declared verified on a retailer row is ignored', () => {
    const { rows, ignoredTicks } = mergeCatalog(
      [{ file: 'a.json', rows: [row(), row({ name: 'Shop', gtin_barcode: '', source_url: 'https://www.1mg.com/otc/x', verified: true })] }],
      { ...opts, verifiedIds: new Set(['acme-gel-cream']) },
    );
    expect(rows.map((r) => [r.id, r.verified, r.status])).toEqual([
      ['acme-gel-cream', true, 'verified'],
      ['acme-shop', false, 'unverified'],
    ]);
    expect(ignoredTicks).toEqual(['acme-shop']);
  });
});

describe('data/catalog/catalog.json', () => {
  const dir = join(__dirname, '../../../data/catalog');
  const present = existsSync(join(dir, 'catalog.json'));

  it.runIf(present)('is the deterministic merge of brands/*.json (re-run npm run catalog:merge if this fails)', () => {
    const files = readdirSync(join(dir, 'brands'))
      .filter((f) => f.endsWith('.json'))
      .sort()
      .map((file) => ({ file, rows: JSON.parse(readFileSync(join(dir, 'brands', file), 'utf8')) as unknown[] }));
    const ticks = existsSync(join(dir, 'verified.json')) ? (JSON.parse(readFileSync(join(dir, 'verified.json'), 'utf8')) as string[]) : [];
    const expected = mergeCatalog(files, { ...opts, verifiedIds: new Set(ticks) }).rows;
    const actual = JSON.parse(readFileSync(join(dir, 'catalog.json'), 'utf8')) as unknown[];
    expect(actual).toEqual(JSON.parse(JSON.stringify(expected)));
  });

  it.runIf(present)('every row is schema-valid, unique, has a complete INCI and an https source', () => {
    const rows = JSON.parse(readFileSync(join(dir, 'catalog.json'), 'utf8')) as unknown[];
    const parsed = rows.map((r) => CatalogProduct.parse(r));
    expect(new Set(parsed.map((p) => p.id)).size).toBe(parsed.length);
    for (const p of parsed) {
      expect(p.inci.length).toBeGreaterThan(0);
      expect(p.source_url).toMatch(/^https:\/\//);
      expect(p.source_kind).not.toBe('third_party');
      if (p.verified) expect(p.source_kind).toBe('brand_official');
    }
  });
});
