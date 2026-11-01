import { describe, expect, it } from 'vitest';
import { DEMO_KEY, type ScanStatusResponse, type ScanStep } from '@skinkey/contracts';
import { runScan, type ScanDeps, type ScanProgress } from './runScan';

const ledger = { mock: true, entries: [], files: [], totalUnits: 16, totalLatencyMs: 900 };
const consent = { version: 'scan-v1', adult: true as const, acceptedAt: '2026-11-01T00:00:00.000Z' };
const capture = { uri: 'file:///cache/Camera/a.jpg', width: 1080, height: 1440, fileSize: 400_000 };

function status(over: Partial<ScanStatusResponse>, states: ScanStep['state'][]): ScanStatusResponse {
  const ids = ['upload', 'analyse', 'read', 'delete'] as const;
  return {
    scanId: 's1',
    status: 'running',
    steps: ids.map((id, i) => ({ id, state: states[i]!, label: id })),
    deleteState: 'running',
    ledger,
    ...over,
  };
}

function fakeDeps(sequence: ScanStatusResponse[], over: Partial<ScanDeps> = {}) {
  const log: string[] = [];
  let t = 0;
  let i = 0;
  const deps: ScanDeps = {
    start: async (req) => {
      log.push(`start ${req.image.width}x${req.image.height}`);
      return { scanId: 's1', upload: { url: 'https://upload', method: 'PUT', headers: {} }, caps: { scansLeft: 0, tryonsLeft: 3 } };
    },
    upload: async (uri) => void log.push(`put ${uri}`),
    deleteLocal: (uri) => void log.push(`rm ${uri}`),
    submit: async () => {
      log.push('submit');
      return sequence[i++]!;
    },
    status: async () => {
      log.push('get');
      return sequence[Math.min(i++, sequence.length - 1)]!;
    },
    sleep: async (ms) => void (t += ms),
    now: () => t,
    ...over,
  };
  return { deps, log };
}

describe('runScan', () => {
  it('uploads, deletes the capture, then polls until YouCam confirms the delete', async () => {
    const { deps, log } = fakeDeps([
      status({}, ['done', 'active', 'pending', 'pending']),
      status({ deleteState: 'result_read' }, ['done', 'done', 'active', 'pending']),
      status({ status: 'done', deleteState: 'delete_requested', key: DEMO_KEY, overlayJpegBase64: 'AAAA' }, ['done', 'done', 'done', 'active']),
      status({ status: 'done', deleteState: 'deleted', key: DEMO_KEY }, ['done', 'done', 'done', 'done']),
    ]);
    const updates: ScanProgress[] = [];
    const result = await runScan(deps, capture, consent, (p) => updates.push(p));
    expect(log.slice(0, 4)).toEqual(['start 1080x1440', `put ${capture.uri}`, `rm ${capture.uri}`, 'submit']);
    expect(result.phase).toBe('done');
    expect(result.steps[3]?.label).toBe('Deleting from YouCam ✓');
    expect(updates.some((u) => u.status?.overlayJpegBase64 === 'AAAA')).toBe(true);
    expect(updates[0]?.steps[0]?.state).toBe('active');
  });

  it('deletes the local capture even when the upload fails', async () => {
    const { deps, log } = fakeDeps([], {
      upload: async () => {
        throw new Error('PUT 403');
      },
    });
    const result = await runScan(deps, capture, consent, () => {});
    expect(result.phase).toBe('failed');
    expect(log).toContain(`rm ${capture.uri}`);
    expect(log).not.toContain('submit');
    expect(result.steps[0]?.state).toBe('failed');
  });

  it('deletes the local capture when the Worker refuses to start', async () => {
    const { deps, log } = fakeDeps([], {
      start: async () => {
        throw Object.assign(new Error('cap'), { status: 429 });
      },
    });
    expect((await runScan(deps, capture, consent, () => {})).phase).toBe('failed');
    expect(log).toEqual([`rm ${capture.uri}`]);
  });

  it('reports a YouCam quality error as failed with its code', async () => {
    const { deps } = fakeDeps([
      status(
        { status: 'failed', deleteState: 'deleted', error: { code: 'error_src_face_too_small', message: 'small' } },
        ['done', 'failed', 'skipped', 'done'],
      ),
    ]);
    const result = await runScan(deps, capture, consent, () => {});
    expect(result.phase).toBe('failed');
    expect(result.status?.error?.code).toBe('error_src_face_too_small');
  });

  it('times out instead of polling forever', async () => {
    const { deps } = fakeDeps([status({}, ['done', 'active', 'pending', 'pending'])]);
    const result = await runScan(deps, capture, consent, () => {}, { intervalMs: 1000, timeoutMs: 5000, deleteGraceMs: 1000 });
    expect(result.phase).toBe('failed');
  });

  it('stops waiting for the delete after the grace period', async () => {
    const { deps } = fakeDeps([status({ status: 'done', deleteState: 'delete_requested', key: DEMO_KEY }, ['done', 'done', 'done', 'active'])]);
    const result = await runScan(deps, capture, consent, () => {}, { intervalMs: 1000, timeoutMs: 60_000, deleteGraceMs: 3000 });
    expect(result.phase).toBe('done');
    expect(result.steps[3]?.label).toBe('Deleting from YouCam');
  });

  it('keeps the overlay and Key that arrive before the delete is confirmed', async () => {
    const { deps } = fakeDeps([
      status({ key: DEMO_KEY, overlayJpegBase64: 'ONCE', deleteState: 'delete_requested' }, ['done', 'done', 'done', 'active']),
      status({ status: 'done', deleteState: 'deleted' }, ['done', 'done', 'done', 'done']),
    ]);
    const result = await runScan(deps, capture, consent, () => {});
    expect(result.phase).toBe('done');
    expect(result.status?.overlayJpegBase64).toBe('ONCE');
    expect(result.status?.key).toEqual(DEMO_KEY);
  });

  it('still delivers the Key when the YouCam delete fails, with the 30-day note', async () => {
    const { deps } = fakeDeps([
      status({ status: 'failed', deleteState: 'delete_failed', key: DEMO_KEY }, ['done', 'done', 'done', 'failed']),
    ]);
    const result = await runScan(deps, capture, consent, () => {});
    expect(result.phase).toBe('done');
    expect(result.steps[3]?.detail).toBe('Delete failed: auto-removed within 30 days.');
  });

  it('cancels the job so the receipt can say orphan upload when the PUT fails', async () => {
    const cancelled: string[] = [];
    const { deps } = fakeDeps([], {
      upload: async () => {
        throw new Error('PUT 500');
      },
      cancel: async (id) => void cancelled.push(id),
    });
    await runScan(deps, capture, consent, () => {});
    expect(cancelled).toEqual(['s1']);
  });
});
