import { describe, expect, it } from 'vitest';
import { FakeClock } from '../src/lib/clock';
import { MemoryKV, kvStore } from '../src/lib/kv';
import { backoffMs, kvPacerStore, memoryPacerStore, Pacer, RateLimitedError, YOUCAM_PACING } from '../src/lib/limiter';
import { YouCamClient } from '../src/youcam/client';

const gaps = (ts: number[]) => ts.slice(1).map((t, i) => t - ts[i]!);

describe('Pacer', () => {
  it('keeps YouCam calls at least 1.2 s apart, even when acquired concurrently', async () => {
    const clock = new FakeClock();
    const pacer = new Pacer(memoryPacerStore(), clock);
    const times: number[] = [];
    await Promise.all(Array.from({ length: 5 }, () => pacer.acquire().then(() => times.push(clock.now()))));
    expect(times).toHaveLength(5);
    for (const g of gaps(times)) expect(g).toBeGreaterThanOrEqual(1200);
  });

  it('does not wait when calls are already spaced out', async () => {
    const clock = new FakeClock();
    const pacer = new Pacer(memoryPacerStore(), clock);
    await pacer.acquire();
    clock.advance(5000);
    await pacer.acquire();
    expect(clock.sleeps).toEqual([]);
  });

  it('enforces the 250 per 300 s window', async () => {
    const clock = new FakeClock();
    const pacer = new Pacer(memoryPacerStore(), clock, { ...YOUCAM_PACING, minIntervalMs: 0, maxInWindow: 3, maxWaitMs: 400_000 });
    const start = clock.now();
    for (let i = 0; i < 4; i++) await pacer.acquire();
    expect(clock.now() - start).toBeGreaterThanOrEqual(300_000);
  });

  it('refuses to hold a request open past maxWait', async () => {
    const clock = new FakeClock();
    const pacer = new Pacer(memoryPacerStore(), clock, { ...YOUCAM_PACING, minIntervalMs: 0, maxInWindow: 1, maxWaitMs: 1000 });
    await pacer.acquire();
    await expect(pacer.acquire()).rejects.toBeInstanceOf(RateLimitedError);
  });

  it('shares pacing state through KV across isolates', async () => {
    const clock = new FakeClock();
    const store = kvStore(new MemoryKV().asKV());
    const a = new Pacer(kvPacerStore(store), clock);
    const b = new Pacer(kvPacerStore(store), clock);
    await a.acquire();
    const t0 = clock.now();
    await b.acquire();
    expect(clock.now() - t0).toBeGreaterThanOrEqual(1200);
  });

  it('backs off 429s with 2/4/8 s plus jitter', () => {
    expect(backoffMs(0, () => 0)).toBe(2000);
    expect(backoffMs(2, () => 0.999)).toBe(8499);
  });

  it('retries a 429 from YouCam after backing off', async () => {
    const clock = new FakeClock();
    let n = 0;
    const client = new YouCamClient({
      baseUrl: 'https://yc.test',
      apiKey: 'k',
      pacer: new Pacer(memoryPacerStore(), clock),
      clock,
      random: () => 0,
      fetch: async () => (++n < 3 ? new Response('{"status":429}', { status: 429 }) : Response.json({ status: 200, data: { task_id: 't1' } })),
    });
    await expect(client.createTask('makeup_vto', {})).resolves.toBe('t1');
    expect(n).toBe(3);
    expect(clock.sleeps.filter((s) => s >= 2000)).toEqual([2000, 4000]);
  });
});
