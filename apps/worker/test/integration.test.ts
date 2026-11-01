import { KeyProfile, LabelCheckResponse, RulesResponse } from '@skinkey/contracts';
import { describe, expect, it } from 'vitest';
import { realRules } from '../src/rulesPort';
import { consent, pollUntil, scanImage, setup } from './helpers';

describe('with the real @skinkey/rules', () => {
  it('a mock HD scan builds a valid Key with zone labels', async () => {
    const s = setup({ rules: realRules });
    await s.install();
    const { json } = await s.req('POST', '/v1/scan/start', { image: scanImage, consent }, { 'x-mock-scenario': 'oily' });
    await s.put(json.upload);
    await s.req('POST', '/v1/scan/submit', { scanId: json.scanId });
    const { last } = await pollUntil(s, `/v1/scan/${json.scanId}`, (j) => j.status === 'done' || j.status === 'failed');
    expect(last.status).toBe('done');
    const key = KeyProfile.parse(last.key);
    expect(key).toMatchObject({ source: 'youcam_hd', photoDeleted: true, zones: { t_zone: 'Oily' } });
    expect(JSON.stringify(key)).not.toMatch(/raw_score|ui_score/);
  });

  it('serves /v1/rules and /v1/label-check from the published ruleset', async () => {
    const s = setup({ rules: realRules });
    const rules = RulesResponse.parse((await s.req('GET', '/v1/rules')).json);
    expect(rules.rules.length).toBeGreaterThan(0);
    const r = await s.req('POST', '/v1/label-check', {
      includeProfiles: true,
      items: [{ id: 'feed-1', claims: [{ type: 'fragrance_free', quote: 'fragrance-free' }], inci: ['Aqua', 'Glycerin', 'Parfum'] }],
    });
    expect(r.status).toBe(200);
    const body = LabelCheckResponse.parse(r.json);
    expect(body.rulesetHash).toBe(rules.rulesetHash);
    expect(body.results[0]!.hits.map((h) => h.ruleId)).toContain('LC-1a');
    expect(body.results[0]!.profileFlags?.length).toBe(rules.profiles.length);
  });
});
