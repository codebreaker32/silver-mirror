import { describe, expect, it } from 'vitest';
import type { TryonStatusResponse } from '@skinkey/contracts';
import { centerCrop3x4 } from './crop';
import { runTryon, type TryonDeps } from './runTryon';

const ledger = { mock: true, entries: [], files: [], totalUnits: 22, totalLatencyMs: 900 };
const consent = { version: 'tryon-v1', adult: true as const, acceptedAt: '2026-11-01T00:00:00.000Z' };

describe('centerCrop3x4', () => {
  it('crops a 4:3 landscape frame to a centred 3:4 portrait', () => {
    expect(centerCrop3x4(4032, 3024)).toEqual({ originX: 882, originY: 0, width: 2268, height: 3024 });
  });
  it('crops a tall 9:16 frame vertically', () => {
    expect(centerCrop3x4(1080, 1920)).toEqual({ originX: 0, originY: 240, width: 1080, height: 1440 });
  });
  it('leaves an exact 3:4 frame alone', () => {
    expect(centerCrop3x4(768, 1024)).toEqual({ originX: 0, originY: 0, width: 768, height: 1024 });
  });
});

describe('runTryon', () => {
  it('sends a 768×1024 image, deletes the selfie, and returns two renders', async () => {
    const log: string[] = [];
    const done: TryonStatusResponse = {
      tryonId: 't1',
      status: 'done',
      mode: 'multi',
      steps: (['upload', 'tone', 'render', 'delete'] as const).map((id) => ({ id, state: 'done' as const, label: id })),
      deleteState: 'deleted',
      renders: [
        { shadeName: 'Rose', imageBase64: 'AAA' },
        { shadeName: 'Berry', imageBase64: 'BBB' },
      ],
      ledger,
    };
    let t = 0;
    const deps: TryonDeps = {
      start: async (req) => {
        log.push(`start ${req.image.width}x${req.image.height} ${req.mode}`);
        return { tryonId: 't1', upload: { url: 'u', method: 'PUT', headers: {} }, caps: { scansLeft: 0, tryonsLeft: 2 } };
      },
      upload: async () => void log.push('put'),
      deleteLocal: () => void log.push('rm'),
      submit: async () => done,
      status: async () => done,
      sleep: async (ms) => void (t += ms),
      now: () => t,
    };
    const result = await runTryon(deps, { productId: 'p1', mode: 'multi', selfie: { uri: 'file:///a.jpg', fileSize: 9 }, consent }, () => {});
    expect(log).toEqual(['start 768x1024 multi', 'put', 'rm']);
    expect(result.phase).toBe('done');
    expect(result.status?.renders.map((r) => r.shadeName)).toEqual(['Rose', 'Berry']);
    expect(result.steps.at(-1)?.label).toBe('Deleting from YouCam ✓');
  });

  it('keeps renders that arrive before the delete finishes', async () => {
    const base = { tryonId: 't1', mode: 'single' as const, ledger, steps: [] };
    const seq: TryonStatusResponse[] = [
      { ...base, status: 'running', deleteState: 'delete_requested', renders: [{ shadeName: 'Rose', imageBase64: 'AAA' }] },
      { ...base, status: 'done', deleteState: 'deleted', renders: [] },
    ];
    let i = 0;
    let t = 0;
    const deps: TryonDeps = {
      start: async () => ({ tryonId: 't1', upload: { url: 'u', method: 'PUT', headers: {} }, caps: { scansLeft: 0, tryonsLeft: 2 } }),
      upload: async () => {},
      deleteLocal: () => {},
      submit: async () => seq[i++]!,
      status: async () => seq[Math.min(i++, seq.length - 1)]!,
      sleep: async (ms) => void (t += ms),
      now: () => t,
    };
    const result = await runTryon(deps, { productId: 'p1', mode: 'single', selfie: { uri: 'file:///a.jpg', fileSize: 9 }, consent }, () => {});
    expect(result.phase).toBe('done');
    expect(result.status?.renders).toHaveLength(1);
  });
});
