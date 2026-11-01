import type { BetaMessage, MessageCreateParamsNonStreaming } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import { LabelOcrResponse, ResolveResponse } from '@skinkey/contracts';
import { describe, expect, it, vi } from 'vitest';
import { loadCatalog } from '../src/catalog';
import { buildParams, ClaudeOutputError, ClaudeRefusalError, parseStructured, sdkCaller, type ClaudeCaller } from '../src/claude/client';
import { toOcrTokens, X4Output } from '../src/claude/labelOcr';
import { sanitiseCandidates, X3_SYSTEM, X3Output } from '../src/claude/resolve';
import { setup, TEST_PRODUCTS } from './helpers';

const createSpy = vi.fn();
vi.mock('@anthropic-ai/sdk', () => {
  class APIError extends Error {}
  class Anthropic {
    static APIError = APIError;
    beta = { messages: { create: createSpy } };
  }
  return { default: Anthropic, APIError };
});

const msg = (over: Partial<BetaMessage> & { text?: string }): BetaMessage =>
  ({
    id: 'm',
    type: 'message',
    role: 'assistant',
    model: 'claude-opus-5-5',
    content: over.text === undefined ? [] : [{ type: 'thinking', thinking: '', signature: 's' }, { type: 'text', text: over.text, citations: null }],
    stop_reason: 'end_turn',
    stop_sequence: null,
    stop_details: null,
    usage: { input_tokens: 1200, output_tokens: 80, cache_read_input_tokens: 3000, cache_creation_input_tokens: 0 },
    ...over,
  }) as unknown as BetaMessage;

const fakeCaller = (reply: (p: MessageCreateParamsNonStreaming) => BetaMessage) => {
  const calls: MessageCreateParamsNonStreaming[] = [];
  const caller: ClaudeCaller = { create: async (p) => (calls.push(p), reply(p)) };
  return { caller, calls };
};

const catalog = loadCatalog(TEST_PRODUCTS);

describe('Claude request settings (spec §4)', () => {
  it('uses adaptive thinking, explicit effort, json_schema output, fallbacks default, no temperature or tool_choice', () => {
    const p = buildParams({ model: 'claude-opus-5-5', effort: 'low', system: 'S', content: [{ type: 'text', text: 'x' }], jsonSchema: { type: 'object' }, schema: X3Output, maxTokens: 4000 });
    expect(p).toMatchObject({
      model: 'claude-opus-5-5',
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low', format: { type: 'json_schema', schema: { type: 'object' } } },
      system: [{ type: 'text', text: 'S', cache_control: { type: 'ephemeral' } }],
    });
    expect(p).not.toHaveProperty('temperature');
    expect(p).not.toHaveProperty('tool_choice');
  });

  it('sdkCaller goes through client.beta.messages.create', async () => {
    createSpy.mockResolvedValueOnce(msg({ text: '{}' }));
    const p = buildParams({ model: 'claude-opus-5-5', effort: 'medium', system: 'S', content: [], jsonSchema: {}, schema: X4Output, maxTokens: 10 });
    await sdkCaller('test-key').create(p);
    expect(createSpy).toHaveBeenCalledWith(p);
  });
});

describe('Claude response parsing', () => {
  it('checks refusal before reading content', () => {
    const refusal = msg({ stop_reason: 'refusal', stop_details: { type: 'refusal', category: 'cyber', explanation: null } as never, text: '{"tokens":[]}' });
    expect(() => parseStructured(refusal, X4Output)).toThrow(ClaudeRefusalError);
  });

  it('rejects truncated, non-JSON and off-schema output', () => {
    expect(() => parseStructured(msg({ stop_reason: 'max_tokens', text: '{"tok' }), X4Output)).toThrow(ClaudeOutputError);
    expect(() => parseStructured(msg({ text: 'sorry' }), X4Output)).toThrow(ClaudeOutputError);
    expect(() => parseStructured(msg({ text: '{"tokens": "x"}' }), X4Output)).toThrow(ClaudeOutputError);
  });

  it('reads the text block after a thinking block', () => {
    const out = parseStructured(msg({ text: '{"tokens":[],"unreadable_regions":0}' }), X4Output);
    expect(out).toEqual({ tokens: [], unreadable_regions: 0 });
  });

  it('X3: keeps only real catalogue ids, clamps confidence and replaces off-limits wording', () => {
    const picks = sanitiseCandidates(
      {
        candidates: [
          { catalog_id: 'made-up-id', confidence: 0.99, why: 'x' },
          { catalog_id: 'plum-lip-tint-candy', confidence: 1.4, why: 'Safe for all skin' },
          { catalog_id: 'foxtale-tinted-spf', confidence: 0.2, why: 'Weak' },
          { catalog_id: 'plum-lip-tint-candy', confidence: 0.5, why: 'dup' },
        ],
        extracted_title: 'Plum lip tint',
        is_skincare: true,
      },
      catalog,
    );
    expect(picks).toEqual([{ catalogId: 'plum-lip-tint-candy', confidence: 1, why: 'Title matches this catalogue product' }]);
  });

  it('X4: flags low-confidence and unnamed tokens as uncertain', () => {
    const { tokens, unreadableRegions } = toOcrTokens(
      {
        tokens: [
          { raw: ' Aqua ', cosing_name: 'Aqua', confidence: 0.98 },
          { raw: 'Isoprpyl Myristate', cosing_name: 'Isopropyl Myristate', confidence: 0.55 },
          { raw: 'Extrait X', cosing_name: null, confidence: 0.9 },
          { raw: '', cosing_name: null, confidence: 0.1 },
        ],
        unreadable_regions: 1.6,
      },
      [],
    );
    expect(tokens).toEqual([
      { raw: 'Aqua', cosingName: 'Aqua', confidence: 0.98, uncertain: false },
      { raw: 'Isoprpyl Myristate', cosingName: 'Isopropyl Myristate', confidence: 0.55, uncertain: true },
      { raw: 'Extrait X', cosingName: null, confidence: 0.9, uncertain: true },
    ]);
    expect(unreadableRegions).toBe(2);
  });
});

describe('/v1/resolve', () => {
  it('matches the catalogue first without calling Claude', async () => {
    const { caller, calls } = fakeCaller(() => msg({ text: '{}' }));
    const s = setup({ claude: caller });
    const r = await s.req('POST', '/v1/resolve', {
      source: 'share_text',
      text: 'Check out CeraVe Moisturising Cream for Dry to Very Dry Skin 50 ml on Flipkart! https://dl.flipkart.com/s/abc',
    });
    const body = ResolveResponse.parse(r.json);
    expect(body).toMatchObject({ outcome: 'match', resolver: 'catalog', store: 'flipkart', catalogCount: 2 });
    expect(body.candidates[0]!.catalogId).toBe('cerave-moisturising-cream-50ml');
    expect(calls).toHaveLength(0);
  });

  it('asks Claude (effort low) when the catalogue is not sure, and returns candidates for the user to confirm', async () => {
    const { caller, calls } = fakeCaller(() =>
      msg({ text: JSON.stringify({ candidates: [{ catalog_id: 'plum-lip-tint-candy', confidence: 0.82, why: 'Brand and line match' }], extracted_title: 'Plum Candy Melts', is_skincare: true }) }),
    );
    const s = setup({ claude: caller });
    const r = await s.req('POST', '/v1/resolve', { source: 'paste', text: 'Berry lip melts 4 gm' });
    const body = ResolveResponse.parse(r.json);
    expect(body).toMatchObject({ outcome: 'candidates', resolver: 'claude' });
    expect(body.candidates.map((c) => c.catalogId)).toEqual(['plum-lip-tint-candy']);
    expect(calls[0]!.output_config).toMatchObject({ effort: 'low' });
    expect(JSON.stringify(calls[0]!.system)).toContain('plum-lip-tint-candy | Plum');
    expect((calls[0]!.system as Array<{ text: string }>)[0]!.text.startsWith(X3_SYSTEM)).toBe(true);
    expect(body.ledger.entries[0]).toMatchObject({ feature: 'claude_resolve', model: 'claude-opus-5-5', inputTokens: 4200, outputTokens: 80 });
  });

  it('falls back to UNKNOWN when Claude refuses', async () => {
    const { caller } = fakeCaller(() => msg({ stop_reason: 'refusal', text: '' }));
    const s = setup({ claude: caller });
    const r = await s.req('POST', '/v1/resolve', { source: 'paste', text: 'something unrelated entirely' });
    expect(r.json).toMatchObject({ outcome: 'unknown', candidates: [] });
    expect(r.json.ledger.entries[0]).toMatchObject({ status: 'error', errorCode: 'claude_refusal' });
  });

  it('reports not_skincare from Claude', async () => {
    const { caller } = fakeCaller(() => msg({ text: JSON.stringify({ candidates: [], extracted_title: 'USB cable', is_skincare: false }) }));
    const s = setup({ claude: caller });
    const r = await s.req('POST', '/v1/resolve', { source: 'paste', text: 'USB-C cable 1m braided' });
    expect(r.json).toMatchObject({ outcome: 'not_skincare', isSkincare: false });
  });

  it('never calls Claude for the sample share', async () => {
    const { caller, calls } = fakeCaller(() => msg({ text: '{}' }));
    const s = setup({ claude: caller });
    await s.req('POST', '/v1/resolve', { source: 'sample', text: 'unmatched words here' });
    expect(calls).toHaveLength(0);
  });
});

describe('/v1/label-ocr', () => {
  it('returns chips with uncertain flags (effort medium, image passed as base64)', async () => {
    const { caller, calls } = fakeCaller(() =>
      msg({ text: JSON.stringify({ tokens: [{ raw: 'Aqua', cosing_name: 'Aqua', confidence: 0.99 }, { raw: 'Parfm', cosing_name: 'Parfum', confidence: 0.5 }], unreadable_regions: 0 }) }),
    );
    const s = setup({ claude: caller });
    const r = await s.req('POST', '/v1/label-ocr', { imageBase64: '/9j/4AAQ', mediaType: 'image/jpeg' });
    const body = LabelOcrResponse.parse(r.json);
    expect(body.tokens.map((t) => t.uncertain)).toEqual([false, true]);
    expect(calls[0]!.output_config).toMatchObject({ effort: 'medium' });
    expect(JSON.stringify(calls[0]!.messages)).toContain('"media_type":"image/jpeg"');
  });

  it('maps a refusal to claude_refusal', async () => {
    const { caller } = fakeCaller(() => msg({ stop_reason: 'refusal', text: '' }));
    const s = setup({ claude: caller });
    const r = await s.req('POST', '/v1/label-ocr', { imageBase64: '/9j/4AAQ', mediaType: 'image/jpeg' });
    expect(r.status).toBe(422);
    expect(r.json.error.code).toBe('claude_refusal');
  });

  it('works offline with the mock Claude when no key is configured', async () => {
    const s = setup();
    const r = await s.req('POST', '/v1/label-ocr', { imageBase64: '/9j/4AAQ', mediaType: 'image/jpeg' });
    expect(r.status).toBe(200);
    expect(r.json.tokens.length).toBeGreaterThan(3);
  });
});
