import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import {
  ApiError,
  INSTALL_HEADER,
  routes,
  type RouteName,
  type UploadSlot,
} from '@skinkey/contracts';
import { runTryon } from '../tryon/runTryon';
import { runScan, type JobDeps } from './runScan';

const BASE = process.env.SKINKEY_WORKER_URL;
const JPEG = Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDA==', 'base64');

async function worker<N extends RouteName>(
  name: N,
  token: string,
  body?: unknown,
  params: Record<string, string> = {},
): Promise<z.infer<(typeof routes)[N]['res']>> {
  const route = routes[name];
  const path = route.path.replace(/:(\w+)/g, (_, k: string) => params[k] ?? '');
  const res = await fetch(`${BASE}${path}`, {
    method: route.method,
    headers: { 'content-type': 'application/json', [INSTALL_HEADER]: token },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json: unknown = await res.json();
  if (!res.ok) throw Object.assign(new Error(JSON.stringify(ApiError.safeParse(json).data ?? json)), { status: res.status });
  return route.res.parse(json) as z.infer<(typeof routes)[N]['res']>;
}

const jobDeps: JobDeps = {
  upload: async (_uri: string, slot: UploadSlot) => {
    const res = await fetch(slot.url, { method: 'PUT', headers: slot.headers, body: JPEG });
    if (!res.ok) throw new Error(`PUT ${res.status}`);
  },
  deleteLocal: () => {},
  sleep: (ms) => new Promise((r) => setTimeout(r, Math.min(ms, 300))),
  now: () => Date.now(),
};

const consent = { version: 'scan-v1', adult: true as const, acceptedAt: new Date().toISOString() };

describe.skipIf(!BASE)('against a local mock Worker (SKINKEY_WORKER_URL)', () => {
  it('runs the scan and try-on chains end to end on the mock', async () => {
    const health = (await (await fetch(`${BASE}/health`)).json()) as { mock?: boolean };
    expect(health.mock, 'refusing to run against a live YouCam key').toBe(true);
    const install = (await (await fetch(`${BASE}/v1/install`, { method: 'POST' })).json()) as { installToken: string };
    const t = install.installToken;

    const scan = await runScan(
      {
        ...jobDeps,
        start: (b) => worker('scanStart', t, b),
        submit: (scanId) => worker('scanSubmit', t, { scanId }),
        status: (id) => worker('scanStatus', t, undefined, { id }),
      },
      { uri: 'mem://a.jpg', width: 1080, height: 1440, fileSize: JPEG.length },
      consent,
      () => {},
      { intervalMs: 500, timeoutMs: 60_000, deleteGraceMs: 10_000 },
    );
    expect(scan.phase, JSON.stringify(scan)).toBe('done');
    expect(scan.status?.key?.bands.oiliness.level).toBeDefined();
    expect(scan.steps.map((s) => s.state)).toEqual(['done', 'done', 'done', 'done']);

    const productId = process.env.SKINKEY_TRYON_PRODUCT;
    if (!productId) return;
    const tryon = await runTryon(
      {
        ...jobDeps,
        start: (b) => worker('tryonStart', t, b),
        submit: (id) => worker('tryonSubmit', t, undefined, { id }),
        status: (id) => worker('tryonStatus', t, undefined, { id }),
      },
      { productId, mode: (process.env.SKINKEY_TRYON_MODE as 'multi' | 'single' | undefined) ?? 'multi', selfie: { uri: 'mem://b.jpg', fileSize: JPEG.length }, consent },
      () => {},
      { intervalMs: 500, timeoutMs: 60_000, deleteGraceMs: 10_000 },
    );
    expect(tryon.phase, JSON.stringify(tryon).slice(0, 2000)).toBe('done');
    expect(tryon.status?.renders.length).toBeGreaterThan(0);
  }, 120_000);
});
