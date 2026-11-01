import { CatalogSearchResponse, COPY, LabelCheckResponse, RulesResponse } from '@skinkey/contracts';
import type { RulesPort } from '../src/rulesPort';
import { describe, expect, it } from 'vitest';
import { detectStore, extractTitle, loadCatalog, searchCatalog, titleFromUrl } from '../src/catalog';
import { makeContextFactory } from '../src/context';
import { sweep } from '../src/sweeper';
import { consent, fakeRules, pollUntil, scanImage, setup, TEST_PRODUCTS } from './helpers';

const stubRules = () => {
  const base = fakeRules().rules;
  const verdictCalls: unknown[] = [];
  const rules = {
    ...base,
    rulesetHash: () => 'abc123',
    RULES: [],
    READING_PROFILES: [
      { id: 'oily', label: 'Oily', zones: { whole: 'Oily' as const }, bands: { oiliness: 'High' as const, moisture: 'Medium' as const, redness: 'Low' as const, pore: 'High' as const } },
    ],
    FACET_MAP: [{ youcamClass: 'Oily' as const, flipkartFacet: 'Oily Skin' }],
    medicineGate: (inci: readonly { token: string }[] | null) => {
      const hit = inci?.find((t) => /adapalene/i.test(t.token));
      return hit ? { gated: true, token: hit.token } : { gated: false };
    },
    labelCheck: (claims: readonly { type: string }[], inci: readonly { token: string; position: number }[]) =>
      claims.some((c) => c.type === 'fragrance_free')
        ? inci
            .filter((t) => /parfum/i.test(t.token))
            .map((t) => ({ ruleId: 'LC-1a', claim: 'fragrance_free', matchedToken: t.token, position: t.position, grade: 'R' as const, counted: true, contested: false, plain: 'x' }))
        : [],
    verdict: (input: unknown) => {
      verdictCalls.push(input);
      return { label: 'CAUTION', reasons: [{ ruleId: 'OCC-1', kind: 'FIT_CAUTION' }] } as unknown as ReturnType<RulesPort['verdict']>;
    },
  };
  return { rules, verdictCalls };
};

describe('deterministic routes', () => {
  it('GET /v1/rules publishes the ruleset, cutoffs, profiles, facet map and banner', async () => {
    const { rules } = stubRules();
    const s = setup({ rules });
    const r = await s.req('GET', '/v1/rules');
    const body = RulesResponse.parse(r.json);
    expect(body).toMatchObject({ rulesetHash: 'abc123', banner: COPY.rulesBanner });
    expect(body.bandCutoffs.lowBelow).toBe(40);
  });

  it('POST /v1/label-check: string INCI lists get positions, medicine is gated, profiles run through verdict()', async () => {
    const { rules, verdictCalls } = stubRules();
    const s = setup({ rules });
    const r = await s.req('POST', '/v1/label-check', {
      includeProfiles: true,
      items: [
        { id: 'row-1', claims: [{ type: 'fragrance_free' }], inci: ['Aqua', 'Glycerin', 'Parfum'] },
        { id: 'row-2', claims: [], inci: [{ token: 'Adapalene', position: 1 }] },
      ],
    });
    expect(r.status).toBe(200);
    const body = LabelCheckResponse.parse(r.json);
    expect(body.rulesetHash).toBe('abc123');
    expect(body.results[0]!.hits[0]).toMatchObject({ ruleId: 'LC-1a', matchedToken: 'Parfum', position: 3 });
    expect(body.results[1]!.medicineToken).toBe('Adapalene');
    expect(body.results[0]!.profileFlags).toEqual([{ profileId: 'oily', label: 'CAUTION', ruleIds: ['OCC-1'] }]);
    expect(verdictCalls).toHaveLength(2);
  });

  it('POST /v1/label-check rejects bad bodies', async () => {
    const s = setup({ rules: stubRules().rules });
    expect((await s.req('POST', '/v1/label-check', { items: [] })).status).toBe(400);
  });

  it('GET /v1/catalog/search and /v1/catalog/:id', async () => {
    const s = setup();
    const r = await s.req('GET', '/v1/catalog/search?q=cerave%20cream&limit=5');
    const body = CatalogSearchResponse.parse(r.json);
    expect(body.catalogCount).toBe(2);
    expect(body.results[0]!.id).toBe('cerave-moisturising-cream-50ml');
    const tinted = CatalogSearchResponse.parse((await s.req('GET', '/v1/catalog/search?tinted=true')).json);
    expect(tinted.results.map((p) => p.id).sort()).toEqual(['foxtale-tinted-spf', 'plum-lip-tint-candy']);
    expect((await s.req('GET', '/v1/catalog/plum-lip-tint-candy')).json.product.shades).toHaveLength(3);
    expect((await s.req('GET', '/v1/catalog/nope')).status).toBe(404);
  });

  it('/health reports the mode; the mock server is closed in live mode except the upload path', async () => {
    const mock = setup();
    expect((await mock.req('GET', '/health')).json).toMatchObject({ ok: true, mock: true, mode: 'mock' });
    const live = setup({ mode: 'live' });
    expect((await live.req('GET', '/health')).json.mode).toBe('live');
    expect((await live.req('GET', '/mock-youcam/s2s/v1.0/client/credit')).status).toBe(404);
  });

  it('defaults to mock unless YOUCAM_MODE is exactly live', async () => {
    const s = setup({ env: { YOUCAM_MODE: 'LIVE' } });
    expect((await s.req('GET', '/health')).json.mode).toBe('mock');
  });
});

describe('catalogue matching', () => {
  const catalog = loadCatalog(TEST_PRODUCTS);

  it('extracts a title from share text and store URLs without fetching them', () => {
    expect(extractTitle('Check out Plum Candy Melts Lip Tint on Flipkart! https://dl.flipkart.com/s/x')).toBe('Plum Candy Melts Lip Tint');
    expect(titleFromUrl('https://www.flipkart.com/cerave-moisturising-cream-50-ml/p/itm123')).toBe('cerave moisturising cream 50 ml');
    expect(titleFromUrl('https://www.amazon.in/CeraVe-Moisturising-Cream/dp/B0ABC')).toBe('CeraVe Moisturising Cream');
    expect(extractTitle(undefined, 'https://amzn.in/d/abc')).toBeNull();
    expect(detectStore('', 'https://amzn.in/d/abc')).toBe('amazon_in');
  });

  it('ranks by name overlap with brand weighting and treats moisturizer/moisturiser alike', () => {
    const hits = searchCatalog(catalog, 'Cerave moisturizing cream 50ml');
    expect(hits[0]!.product.id).toBe('cerave-moisturising-cream-50ml');
    expect(hits[0]!.score).toBeGreaterThan(0.8);
  });

  it('drops rows that fail the CatalogProduct schema', () => {
    expect(loadCatalog([...TEST_PRODUCTS, { id: 'broken' }]).rejected).toBe(1);
  });
});

describe('sweeper', () => {
  it('finishes polling and deleting a job the phone stopped polling', async () => {
    const s = setup();
    await s.install();
    const { json } = await s.req('POST', '/v1/scan/start', { image: scanImage, consent });
    await s.put(json.upload);
    await s.req('POST', '/v1/scan/submit', { scanId: json.scanId });
    const makeCtx = makeContextFactory({ clock: s.clock, mock: s.mock, rules: fakeRules().rules, catalog: loadCatalog(TEST_PRODUCTS) });
    for (let i = 0; i < 5; i++) {
      s.clock.advance(3000);
      await sweep(makeCtx(s.env, 'https://worker.internal/'));
    }
    const { last } = await pollUntil(s, `/v1/scan/${json.scanId}`, () => true, 1);
    expect(last).toMatchObject({ status: 'done', deleteState: 'deleted' });
  });
});
