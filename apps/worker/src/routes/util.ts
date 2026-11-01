import { IDEMPOTENCY_HEADER } from '@skinkey/contracts';
import type { Context } from 'hono';
import type { z } from 'zod';
import { ctxOf, type HonoEnv } from '../context';
import { HttpError } from '../lib/errors';

export const parseJson = async <S extends z.ZodType>(c: Context<HonoEnv>, schema: S): Promise<z.infer<S>> => {
  const body = await c.req.json().catch(() => {
    throw new HttpError('bad_request', 'Body must be JSON');
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new HttpError('bad_request', parsed.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; '));
  return parsed.data;
};

/** Replays the first 200 response for a repeated `idempotency-key` on creates (24 h). */
export const idempotent = async (c: Context<HonoEnv>, scope: string, run: () => Promise<unknown>) => {
  const key = c.req.header(IDEMPOTENCY_HEADER);
  const { store } = ctxOf(c);
  const k = key ? `idem:${scope}:${key.slice(0, 128)}` : null;
  if (k) {
    const hit = await store.get<unknown>(k);
    if (hit) return c.json(hit);
  }
  const body = await run();
  if (k) await store.put(k, body, 24 * 3600);
  return c.json(body);
};

/** Per-IP daily budget for the Claude routes. */
export const dailyLimit = async (c: Context<HonoEnv>, name: string, ip: string, limit: number) => {
  const { store, clock } = ctxOf(c);
  const day = new Date(clock.now()).toISOString().slice(0, 10);
  const k = `rl:${name}:${ip}:${day}`;
  const n = (await store.get<number>(k)) ?? 0;
  if (n >= limit) throw new HttpError('rate_limited', 'Daily limit reached for this feature. Try again tomorrow.');
  await store.put(k, n + 1, 26 * 3600);
};
