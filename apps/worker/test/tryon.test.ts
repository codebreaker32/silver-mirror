import { TryonStartResponse, TryonStatusResponse } from '@skinkey/contracts';
import { describe, expect, it } from 'vitest';
import { consent, pollUntil, setup, tryonImage } from './helpers';

const settled = (j: { status: string }) => j.status === 'done' || j.status === 'failed';

const start = (s: ReturnType<typeof setup>, body: Record<string, unknown>, headers: Record<string, string> = {}) =>
  s.req('POST', '/v1/tryon', { image: tryonImage, consent, ...body }, headers);

describe('try-on chain (mock YouCam)', () => {
  it('multi-shade: tone → 2 renders on one file → read all → delete all, renders sent once', async () => {
    const s = setup();
    await s.install();
    const r = await start(s, { productId: 'plum-lip-tint-candy', mode: 'multi' });
    expect(r.status).toBe(200);
    const started = TryonStartResponse.parse(r.json);
    await s.put(started.upload);

    const submit = await s.req('POST', `/v1/tryon/${started.tryonId}/submit`);
    expect(TryonStatusResponse.parse(submit.json).steps.map((x) => x.state)).toEqual(['done', 'active', 'pending', 'pending']);

    const { history, last } = await pollUntil(s, `/v1/tryon/${started.tryonId}`, settled);
    for (const h of history) TryonStatusResponse.parse(h);
    expect(last).toMatchObject({ status: 'done', deleteState: 'deleted', mode: 'multi' });
    const delivered = history.filter((h) => h.renders.length > 0);
    expect(delivered).toHaveLength(1);
    expect(delivered[0].renders.map((x: { shadeName: string }) => x.shadeName)).toEqual(['Nude Note', 'Coral Crush']);
    expect(last.ledger.totalUnits).toBe(22);
    expect(last.ledger.files).toHaveLength(1);
    expect(last.ledger.files[0].taskIds).toHaveLength(3);

    const calls = s.mock.state.calls;
    const firstDelete = calls.findIndex((c) => c.path === '/s2s/v2.0/task/delete');
    const lastVtoCreate = calls.map((c) => c.method === 'POST' && c.path === '/s2s/v2.0/task/makeup-vto').lastIndexOf(true);
    expect(firstDelete).toBeGreaterThan(lastVtoCreate);
    expect(calls.filter((c) => c.path === '/s2s/v2.0/task/delete')).toHaveLength(3);
    const files = new Set([...s.mock.state.tasks.values()].map((t) => t.fileId));
    expect(files.size).toBe(1);
  });

  it('never returns or stores the tone hex', async () => {
    const s = setup();
    await s.install();
    const { json } = await start(s, { productId: 'plum-lip-tint-candy', mode: 'multi' });
    await s.put(json.upload);
    await s.req('POST', `/v1/tryon/${json.tryonId}/submit`);
    const { history } = await pollUntil(s, `/v1/tryon/${json.tryonId}`, settled);
    const everything = JSON.stringify(history) + JSON.stringify([...s.kv.data.values()]);
    expect(everything.toLowerCase()).not.toContain('#b9947c');
    expect(everything).not.toContain('skin_color');
  });

  it('single-shade: one render, no tone call', async () => {
    const s = setup();
    await s.install();
    const { json } = await start(s, { productId: 'foxtale-tinted-spf', mode: 'single' });
    await s.put(json.upload);
    await s.req('POST', `/v1/tryon/${json.tryonId}/submit`);
    const { history, last } = await pollUntil(s, `/v1/tryon/${json.tryonId}`, settled);
    expect(last.status).toBe('done');
    expect(last.steps[1]).toMatchObject({ id: 'tone', state: 'skipped' });
    expect(history.flatMap((h) => h.renders).map((x: { shadeName: string }) => x.shadeName)).toEqual(['Universal']);
    expect(last.ledger.totalUnits).toBe(1);
    expect(s.mock.state.calls.some((c) => c.path.includes('skin-tone'))).toBe(false);
  });

  it('a tone error stops before rendering and still deletes', async () => {
    const s = setup();
    await s.install();
    const { json } = await start(s, { productId: 'plum-lip-tint-candy', mode: 'multi' }, { 'x-mock-scenario': 'error_src_face_too_small' });
    await s.put(json.upload);
    await s.req('POST', `/v1/tryon/${json.tryonId}/submit`);
    const { last } = await pollUntil(s, `/v1/tryon/${json.tryonId}`, settled);
    expect(last).toMatchObject({ status: 'failed', deleteState: 'deleted' });
    expect(last.error.code).toBe('error_src_face_too_small');
    expect(last.steps.map((x: { state: string }) => x.state)).toEqual(['done', 'failed', 'failed', 'done']);
  });

  it('validates product, shades and the 768×1024 size before opening an upload', async () => {
    const s = setup();
    await s.install();
    expect((await start(s, { productId: 'cerave-moisturising-cream-50ml', mode: 'single' })).status).toBe(400);
    expect((await start(s, { productId: 'foxtale-tinted-spf', mode: 'multi' })).status).toBe(400);
    expect((await start(s, { productId: 'plum-lip-tint-candy', mode: 'single', shadeName: 'Nope' })).status).toBe(400);
    expect((await start(s, { productId: 'nope', mode: 'single' })).status).toBe(404);
    expect((await s.req('POST', '/v1/tryon', { image: { ...tryonImage, height: 1080 }, consent, productId: 'foxtale-tinted-spf', mode: 'single' })).status).toBe(400);
    expect(s.mock.state.files.size).toBe(0);
  });

  it('caps live try-ons at 3 per install', async () => {
    const s = setup({ mode: 'live' });
    await s.install();
    for (let i = 0; i < 3; i++) expect((await start(s, { productId: 'foxtale-tinted-spf', mode: 'single' })).status).toBe(200);
    const fourth = await start(s, { productId: 'foxtale-tinted-spf', mode: 'single' });
    expect(fourth.json.error.code).toBe('cap_reached');
  });
});
