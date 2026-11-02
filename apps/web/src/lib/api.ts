import { ApiError, routes, type RouteName } from '@skinkey/contracts';
import type { z } from 'zod';
import { config } from '../config';

type Route<N extends RouteName> = (typeof routes)[N];
type Req<N extends RouteName> = Route<N> extends { req: z.ZodType } ? z.input<Route<N>['req']> : undefined;
type Res<N extends RouteName> = z.infer<Route<N>['res']>;

export const WORKER_URL = config.workerUrl;

export class WorkerError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiError | null,
  ) {
    super(body?.error.message ?? (status === 0 ? 'The Silver Mirror Worker could not be reached.' : `Worker returned ${status}`));
  }
}

export async function call<N extends RouteName>(
  name: N,
  options: { body?: Req<N>; params?: Record<string, string>; query?: Record<string, string>; signal?: AbortSignal } = {},
): Promise<Res<N>> {
  const route = routes[name];
  const path = route.path.replace(/:(\w+)/g, (_, k: string) => encodeURIComponent(options.params?.[k] ?? ''));
  const qs = options.query ? `?${new URLSearchParams(options.query)}` : '';
  let res: Response;
  try {
    res = await fetch(`${WORKER_URL}${path}${qs}`, {
      method: route.method,
      headers: options.body === undefined ? undefined : { 'content-type': 'application/json' },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new WorkerError(0, null);
  }
  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const parsed = ApiError.safeParse(json);
    throw new WorkerError(res.status, parsed.success ? parsed.data : null);
  }
  return route.res.parse(json) as Res<N>;
}
