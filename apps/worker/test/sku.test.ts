import type { BetaMessage, MessageCreateParamsNonStreaming } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { amazonTitle, CatalogProduct, nykaaFixture, nykaaTitle, parseFlipkartLocation, ResolveResponse, SHARE_FIXTURES } from '@skinkey/contracts';
import { describe, expect, it } from 'vitest';
import { loadCatalog, matchSku, skuConflict } from '../src/catalog';
import type { ClaudeCaller } from '../src/claude/client';
import { setup } from './helpers';

// The real merged catalogue rows (data/catalog/catalog.json), so the look-alikes are the ones the phone saw (BUGS.md #4).
const ROWS = (JSON.parse(readFileSync(join(__dirname, '../../../data/catalog/catalog.json'), 'utf8')) as unknown[]).map((r) => CatalogProduct.parse(r));
const catalog = loadCatalog(ROWS);
const row = (id: string) => catalog.byId.get(id)!;

// Exact payloads from spikes/FINDINGS.md S1.
const AMAZON = amazonTitle(SHARE_FIXTURES.amazon)!;
const NYKAA = nykaaTitle(nykaaFixture())!;

const reply = (json: unknown): BetaMessage =>
  ({
    id: 'm',
    type: 'message',
    role: 'assistant',
    model: 'claude-opus-5-5',
    content: [{ type: 'text', text: JSON.stringify(json), citations: null }],
    stop_reason: 'end_turn',
    stop_sequence: null,
    stop_details: null,
    usage: { input_tokens: 10, output_tokens: 10, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
  }) as unknown as BetaMessage;
const fakeClaude = (json: unknown) => {
  const calls: MessageCreateParamsNonStreaming[] = [];
  const caller: ClaudeCaller = { create: async (p) => (calls.push(p), reply(json)) };
  return { caller, calls };
};

describe('skuConflict (deterministic SKU disqualifiers)', () => {
  it('the Amazon "Minimalist SPF 30 Body Sunscreen" share conflicts with every Minimalist SPF 50/60 face sunscreen', () => {
    expect(AMAZON).toBe(SHARE_FIXTURES.amazonTitle);
    for (const id of ['minimalist-spf-50-sunscreen', 'minimalist-light-fluid-spf-50-sunscreen', 'minimalist-spf-60-sunscreen']) {
      expect(skuConflict(AMAZON, row(id))).toMatch(/^SPF 30 vs SPF (50|60)/);
    }
    // Body vs face on its own, with no SPF on either side.
    expect(skuConflict('Minimalist Body Lotion', row('minimalist-vitamin-b5-10-moisturizer'))).toBe('body product vs face product');
  });

  it('product type disqualifies: a sunscreen listing is not a serum, cleanser or moisturiser without SPF', () => {
    expect(skuConflict(NYKAA, row('minimalist-niacinamide-10-face-serum'))).toMatch(/^sun vs serum/);
    expect(skuConflict('Minimalist Salicylic Acid 2% Face Serum', row('minimalist-salicylic-acid-lha-2-cleanser'))).toMatch(/^serum vs cleanser/);
  });

  it('keeps the true SKU and same-SPF siblings', () => {
    expect(skuConflict(NYKAA, row('minimalist-spf-50-sunscreen'))).toBeNull();
    expect(skuConflict(NYKAA, row('minimalist-light-fluid-spf-50-sunscreen'))).toBeNull();
    expect(skuConflict(NYKAA, row('minimalist-spf-60-sunscreen'))).toBe('SPF 50 vs SPF 60');
    expect(skuConflict('Minimalist SPF 50 Sunscreen 50 g', row('minimalist-spf-50-sunscreen'))).toBeNull();
  });
});

describe('matchSku', () => {
  it('Amazon SPF 30 Body: no Minimalist SPF 50/60 survives', () => {
    const m = matchSku(catalog, AMAZON);
    expect(m.hits.some((h) => h.product.brand === 'Minimalist' && /spf/i.test(h.product.name))).toBe(false);
  });

  it('a close name with a conflicting SPF is reported as ruled out, not offered', () => {
    const m = matchSku(catalog, 'Minimalist SPF 30 Sunscreen');
    expect(m.hits.map((h) => h.product.id)).not.toContain('minimalist-spf-50-sunscreen');
    expect(m.ruledOut.map((r) => r.product.id)).toContain('minimalist-spf-50-sunscreen');
  });

  it('Nykaa SPF 50: the SPF 50 sunscreen is top and SPF 60 is never offered', () => {
    const m = matchSku(catalog, NYKAA);
    expect(m.hits[0]?.product.id).toBe('minimalist-spf-50-sunscreen');
    expect(m.hits.map((h) => h.product.id)).not.toContain('minimalist-spf-60-sunscreen');
  });

  it('matches on Flipkart slug tokens (title-cased slug from the redirect header)', () => {
    const fk = parseFlipkartLocation('https://dl.flipkart.com/dl/minimalist-spf-50-sunscreen-with-multi-vitamins-50-g/p/itmPLACEHOLDER0002?pid=PLACEHOLDERPID02');
    expect(fk?.title).toBe('Minimalist SPF 50 Sunscreen with Multi Vitamins 50 g');
    expect(matchSku(catalog, fk!.title).hits[0]?.product.id).toBe('minimalist-spf-50-sunscreen');
  });
});

describe('/v1/resolve with the disqualifiers', () => {
  it('Amazon SPF 30 Body share: even when Claude proposes the SPF 50 and SPF 60 SKUs (as on the phone), none is offered → name-only (UNKNOWN)', async () => {
    const { caller, calls } = fakeClaude({
      candidates: [
        { catalog_id: 'minimalist-spf-50-sunscreen', confidence: 0.7, why: 'Brand and sunscreen line match' },
        { catalog_id: 'minimalist-spf-60-sunscreen', confidence: 0.6, why: 'Brand and sunscreen line match' },
      ],
      extracted_title: AMAZON,
      is_skincare: true,
    });
    const s = setup({ catalog: ROWS, claude: caller });
    const body = ResolveResponse.parse((await s.req('POST', '/v1/resolve', { source: 'share_text', text: SHARE_FIXTURES.amazon })).json);
    expect(calls).toHaveLength(1);
    expect(body).toMatchObject({ outcome: 'unknown', store: 'amazon_in', extractedTitle: SHARE_FIXTURES.amazonTitle, candidates: [] });
  });

  it('every close catalogue SKU conflicts → name-only without asking Claude', async () => {
    const { caller, calls } = fakeClaude({ candidates: [], extracted_title: null, is_skincare: true });
    const s = setup({ catalog: ROWS, claude: caller });
    const body = ResolveResponse.parse((await s.req('POST', '/v1/resolve', { source: 'paste', text: 'Minimalist SPF 30 Sunscreen' })).json);
    expect(body).toMatchObject({ outcome: 'unknown', resolver: 'catalog', candidates: [] });
    expect(calls).toHaveLength(0);
  });

  it("Claude's picks get the same disqualifiers", async () => {
    const { caller, calls } = fakeClaude({ candidates: [{ catalog_id: 'minimalist-spf-50-sunscreen', confidence: 0.9, why: 'Brand matches' }], extracted_title: 'MNMLST spf 30 body lotion', is_skincare: true });
    const s = setup({ catalog: ROWS, claude: caller });
    const body = ResolveResponse.parse((await s.req('POST', '/v1/resolve', { source: 'paste', text: 'MNMLST spf 30 body lotion 150 g' })).json);
    expect(calls).toHaveLength(1);
    expect(body).toMatchObject({ outcome: 'unknown', resolver: 'claude', candidates: [] });
  });

  it('Nykaa SPF 50 share still offers the SPF 50 sunscreen for the user to confirm', async () => {
    const s = setup({ catalog: ROWS });
    const body = ResolveResponse.parse((await s.req('POST', '/v1/resolve', { source: 'share_text', text: nykaaFixture() })).json);
    expect(body.candidates[0]?.catalogId).toBe('minimalist-spf-50-sunscreen');
    expect(body.candidates.map((c) => c.catalogId)).not.toContain('minimalist-spf-60-sunscreen');
  });

  it('Flipkart short link → title-cased slug title (BUGS.md #3)', async () => {
    const s = setup({ catalog: ROWS, shareFetch: async () => new Response(null, { status: 301, headers: { location: SHARE_FIXTURES.flipkartLocation } }) });
    const body = ResolveResponse.parse((await s.req('POST', '/v1/resolve', { source: 'share_text', text: SHARE_FIXTURES.flipkartShortLink })).json);
    expect(body.extractedTitle).toBe('Vaseline Gluta Hya Dewy Radiance');
    expect(body.store).toBe('flipkart');
  });
});
