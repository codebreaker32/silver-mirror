import Constants from 'expo-constants';
import { ApiError, INSTALL_HEADER, routes, type RouteName } from '@skinkey/contracts';
import type { z } from 'zod';

type Route<N extends RouteName> = (typeof routes)[N];
type Req<N extends RouteName> = Route<N> extends { req: z.ZodType } ? z.input<Route<N>['req']> : undefined;
type Res<N extends RouteName> = z.infer<Route<N>['res']>;

export const WORKER_URL: string = (Constants.expoConfig?.extra?.workerUrl as string | undefined) ?? 'http://localhost:8787';

export class WorkerError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiError | null,
  ) {
    super(body?.error.message ?? `Worker ${status}`);
  }
}

let installToken: string | null = null;
export const setInstallToken = (token: string | null) => {
  installToken = token;
};

export async function call<N extends RouteName>(
  name: N,
  options: { body?: Req<N>; params?: Record<string, string>; query?: Record<string, string>; signal?: AbortSignal } = {},
): Promise<Res<N>> {
  const route = routes[name];
  const path = route.path.replace(/:(\w+)/g, (_, k: string) => encodeURIComponent(options.params?.[k] ?? ''));
  const qs = options.query ? `?${new URLSearchParams(options.query)}` : '';
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (installToken) headers[INSTALL_HEADER] = installToken;
  const res = await fetch(`${WORKER_URL}${path}${qs}`, {
    method: route.method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });
  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const parsed = ApiError.safeParse(json);
    throw new WorkerError(res.status, parsed.success ? parsed.data : null);
  }
  return route.res.parse(json) as Res<N>;
}
