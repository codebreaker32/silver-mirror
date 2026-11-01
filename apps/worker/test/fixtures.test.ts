import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '../../..');
const fixturesDir = join(root, 'apps/worker/src/mock/fixtures');
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));

describe('mock fixtures are the real spike JSON, with signed URLs redacted', () => {
  it('no fixture carries a signed S3 URL, an AWS credential or an account path', () => {
    for (const f of readdirSync(fixturesDir)) {
      const text = readFileSync(join(fixturesDir, f), 'utf8');
      expect(text, f).not.toMatch(/X-Amz-|amazonaws\.com|AKIA[0-9A-Z]{12,}|ttl30\//);
    }
  });

  it('G1 HD skin analysis matches spikes/g1_result.json except for mask URLs', () => {
    const spike = read(join(root, 'spikes/g1_result.json')).body;
    const fixture = read(join(fixturesDir, 'skin-analysis-hd.json'));
    const scrub = (o: { output: Array<Record<string, unknown>> }) => o.output.map(({ mask_urls: _m, url: _u, ...rest }) => rest);
    expect(scrub(fixture.data.results)).toEqual(scrub(spike.data.results));
    expect(fixture.data.task_status).toBe(spike.data.task_status);
  });

  it.each([
    ['g5_foundation_deep.json', 'spike-g5-foundation.json'],
    ['g5_lip_sheer.json', 'spike-g5-lip.json'],
  ])('G5 %s matches its fixture except for the render URL', (src, dest) => {
    const spike = read(join(root, 'spikes', src));
    const fixture = read(join(fixturesDir, dest));
    expect(fixture.request).toEqual(spike.request);
    expect(fixture.create).toEqual(spike.create);
    expect(fixture.result.data.results).toEqual({ url: '{{assets}}/render.jpg' });
    expect(typeof spike.result.data.results.url).toBe('string');
    expect({ ...fixture.result.data, results: null }).toEqual({ ...spike.result.data, results: null });
  });
});
