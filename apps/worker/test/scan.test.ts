import { DEMO_KEY, ScanStartResponse, ScanStatusResponse } from '@skinkey/contracts';
import { describe, expect, it } from 'vitest';
import { consent, pollUntil, scanImage, setup } from './helpers';

const startScan = async (s: ReturnType<typeof setup>, headers: Record<string, string> = {}) => {
  const r = await s.req('POST', '/v1/scan/start', { image: scanImage, consent }, headers);
  return r;
};

const settled = (j: { status: string }) => j.status === 'done' || j.status === 'failed';

describe('scan chain (mock YouCam)', () => {
  it('upload → task → poll → read → delete → confirm, with the overlay sent once', async () => {
    const s = setup();
    await s.install();
    const start = await startScan(s);
    expect(start.status).toBe(200);
    const started = ScanStartResponse.parse(start.json);
    expect(started.upload.url).toMatch(/^http:\/\/localhost\/mock-youcam\/upload\//);
    expect(await s.put(started.upload)).toBe(200);

    const submit = await s.req('POST', '/v1/scan/submit', { scanId: started.scanId });
    expect(ScanStatusResponse.parse(submit.json)).toMatchObject({ status: 'running', deleteState: 'task_created' });

    const { history, last } = await pollUntil(s, `/v1/scan/${started.scanId}`, settled);
    for (const h of history) ScanStatusResponse.parse(h);
    expect(last.status).toBe('done');
    expect(last.deleteState).toBe('deleted');
    expect(last.key.photoDeleted).toBe(true);
    expect(last.steps.map((x: { state: string }) => x.state)).toEqual(['done', 'done', 'done', 'done']);

    const overlays = history.filter((h) => h.overlayJpegBase64);
    expect(overlays).toHaveLength(1);
    expect(overlays[0].key.photoDeleted).toBe(false);
    expect(overlays[0].deleteState).toBe('delete_requested');

    const calls = s.mock.state.calls;
    const isGet = (c: { method: string; path: string }) => c.method === 'GET' && c.path.startsWith('/s2s/v2.1/task/skin-analysis/');
    expect(calls.filter(isGet).length).toBeGreaterThanOrEqual(3);
    const deleteAt = calls.findIndex((c) => c.path === '/s2s/v2.0/task/delete');
    const firstGet = calls.findIndex(isGet);
    expect(deleteAt).toBeGreaterThan(firstGet + 1);
    expect(calls.slice(deleteAt + 1).some(isGet)).toBe(true);

    const units = last.ledger.entries.filter((e: { feature: string }) => e.feature === 'skin_analysis_hd');
    expect(units[0]).toMatchObject({ units: 16, status: 'ok', deleteState: 'deleted' });
    expect(last.ledger).toMatchObject({ mock: true, totalUnits: 16 });
    expect(last.ledger.files).toEqual([{ fileId: expect.any(String), state: 'deleted', taskIds: [expect.any(String)] }]);
  });

  it('never lets ui_score reach the rules package', async () => {
    const s = setup();
    await s.install();
    const { json } = await startScan(s);
    await s.put(json.upload);
    await s.req('POST', '/v1/scan/submit', { scanId: json.scanId });
    await pollUntil(s, `/v1/scan/${json.scanId}`, (j) => Boolean(j.key));
    expect(s.keyInputs).toHaveLength(1);
    expect(JSON.stringify(s.keyInputs[0])).not.toContain('ui_score');
    expect(s.keyInputs[0]!.readings.every((r) => Object.keys(r).every((k) => ['type', 'region', 'raw_score'].includes(k)))).toBe(true);
    expect(s.keyInputs[0]!.zones).toEqual({ whole: 'Normal', t_zone: 'Normal', u_zone: 'Normal' });
  });

  it('confirms the delete with a later GET and retries while YouCam is still consistent-eventually (G0)', async () => {
    const s = setup({ mockOptions: { deleteLagGets: 2 } });
    await s.install();
    const { json } = await startScan(s);
    await s.put(json.upload);
    await s.req('POST', '/v1/scan/submit', { scanId: json.scanId });
    const { last } = await pollUntil(s, `/v1/scan/${json.scanId}`, settled);
    expect(last.deleteState).toBe('deleted');
    const del = last.ledger.entries.find((e: { feature: string }) => e.feature === 'task_delete');
    expect(del).toMatchObject({ status: 'ok', deleteState: 'deleted' });
  });

  it('retries the confirming GET exactly 3 times, at least 2 s apart, before giving up (FINDINGS G0)', async () => {
    const s = setup({ mockOptions: { deleteLagGets: 99 } });
    await s.install();
    const { json } = await startScan(s);
    await s.put(json.upload);
    await s.req('POST', '/v1/scan/submit', { scanId: json.scanId });
    const { last } = await pollUntil(s, `/v1/scan/${json.scanId}`, settled);
    expect(last.deleteState).toBe('delete_failed');
    const s2s = s.mock.state.calls.filter((c) => c.path.startsWith('/s2s/'));
    expect(s2s).toHaveLength(s.apiCallTimes.length);
    const deleteAt = s2s.findIndex((c) => c.path === '/s2s/v2.0/task/delete');
    const confirms = s2s.map((c, i) => ({ c, t: s.apiCallTimes[i]! })).slice(deleteAt + 1).filter(({ c }) => c.method === 'GET');
    expect(confirms).toHaveLength(3);
    const times = [s.apiCallTimes[deleteAt]!, ...confirms.map((x) => x.t)];
    for (let i = 1; i < times.length; i++) expect(times[i]! - times[i - 1]!).toBeGreaterThanOrEqual(2000);
  });

  it('reports delete_failed with the fixed copy when YouCam refuses the delete', async () => {
    const s = setup();
    await s.install();
    const { json } = await startScan(s, { 'x-mock-scenario': 'delete_fail' });
    await s.put(json.upload);
    await s.req('POST', '/v1/scan/submit', { scanId: json.scanId });
    const { last } = await pollUntil(s, `/v1/scan/${json.scanId}`, settled);
    expect(last.deleteState).toBe('delete_failed');
    expect(last.status).toBe('done');
    expect(last.steps[3]).toMatchObject({ state: 'failed', detail: 'Delete failed: auto-removed within 30 days.' });
    expect(last.key).toBeDefined();
  });

  it('maps a capture error to readable copy and still deletes the task', async () => {
    const s = setup();
    await s.install();
    const { json } = await startScan(s, { 'x-mock-scenario': 'error_src_face_too_small' });
    await s.put(json.upload);
    await s.req('POST', '/v1/scan/submit', { scanId: json.scanId });
    const { last } = await pollUntil(s, `/v1/scan/${json.scanId}`, settled);
    expect(last.error).toEqual({ code: 'error_src_face_too_small', message: 'Move closer so your face fills the oval' });
    expect(last.status).toBe('failed');
    expect(last.deleteState).toBe('deleted');
    expect(last.ledger.totalUnits).toBe(0);
  });

  it('records an orphan upload when the phone cancels before submit', async () => {
    const s = setup();
    await s.install();
    const { json } = await startScan(s);
    const r = await s.req('POST', `/v1/scan/${json.scanId}/cancel`);
    expect(r.json).toMatchObject({ status: 'failed', deleteState: 'orphan' });
    expect(r.json.steps[0].detail).toBe('Not processed; YouCam removes it automatically within 30 days.');
  });

  it('records an orphan upload when task creation fails', async () => {
    const s = setup();
    await s.install();
    const { json } = await startScan(s, { 'x-mock-scenario': 'create_400' });
    await s.put(json.upload);
    const r = await s.req('POST', '/v1/scan/submit', { scanId: json.scanId });
    expect(r.json).toMatchObject({ status: 'failed', deleteState: 'orphan' });
  });

  it('serves the labelled Demo Key in demo mode', async () => {
    const s = setup();
    await s.install();
    const { json } = await startScan(s, { 'x-skinkey-demo': '1' });
    await s.put(json.upload);
    await s.req('POST', '/v1/scan/submit', { scanId: json.scanId });
    const { last } = await pollUntil(s, `/v1/scan/${json.scanId}`, settled);
    expect(last.key).toMatchObject({ source: 'demo', bands: DEMO_KEY.bands });
  });

  it('paces every YouCam call at least 1.2 s apart', async () => {
    const s = setup();
    await s.install();
    const { json } = await startScan(s);
    await s.put(json.upload);
    await s.req('POST', '/v1/scan/submit', { scanId: json.scanId });
    await pollUntil(s, `/v1/scan/${json.scanId}`, settled);
    const t = s.apiCallTimes;
    expect(t.length).toBeGreaterThanOrEqual(5);
    for (let i = 1; i < t.length; i++) expect(t[i]! - t[i - 1]!).toBeGreaterThanOrEqual(1200);
  });

  it('rejects photos too small for HD and requests without an install token', async () => {
    const s = setup();
    expect((await startScan(s)).status).toBe(401);
    await s.install();
    const small = await s.req('POST', '/v1/scan/start', { image: { ...scanImage, width: 720, height: 960 }, consent });
    expect(small.status).toBe(400);
  });
});

describe('scan caps and budget (live mode against the mock transport)', () => {
  it('spends the single real scan, refunds it on an engine error, and replays idempotent creates', async () => {
    const s = setup({ mode: 'live' });
    const inst = await s.install();
    expect(inst.caps).toEqual({ scansLeft: 1, tryonsLeft: 3 });

    const a = await startScan(s, { 'idempotency-key': 'k1' });
    expect(a.json.caps).toEqual({ scansLeft: 0, tryonsLeft: 3 });
    const replay = await startScan(s, { 'idempotency-key': 'k1' });
    expect(replay.json.scanId).toBe(a.json.scanId);

    const b = await startScan(s);
    expect(b.status).toBe(429);
    expect(b.json.error.code).toBe('cap_reached');

    await s.put(a.json.upload);
    await s.req('POST', '/v1/scan/submit', { scanId: a.json.scanId });
    const { last } = await pollUntil(s, `/v1/scan/${a.json.scanId}`, settled);
    expect(last.ledger.mock).toBe(false);
    expect(last.ledger.totalUnits).toBe(16);
    const ledger = await s.req('GET', '/v1/ledger');
    expect(ledger.json).toMatchObject({ mode: 'live', spentUnits: 16, deletesConfirmed: 1 });
  });

  it('stops live calls before the unit floor', async () => {
    const s = setup({ mode: 'live', env: { UNIT_BALANCE_START: '60', UNIT_FLOOR: '50' } });
    await s.install();
    const r = await startScan(s);
    expect(r.status).toBe(429);
    expect(r.json.error.message).toMatch(/judging reserve/);
  });

  it('does not let another install read a scan', async () => {
    const s = setup();
    await s.install();
    const { json } = await startScan(s);
    await s.install();
    expect((await s.req('GET', `/v1/scan/${json.scanId}`)).status).toBe(404);
  });
});
