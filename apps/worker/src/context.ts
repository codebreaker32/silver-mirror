import { INSTALL_HEADER, isFlipkartShortLink, SHARE_FIXTURES } from '@skinkey/contracts';
import type { Context } from 'hono';
import { bundledCatalog, type Catalog } from './catalog';
import { sdkCaller, type ClaudeCaller } from './claude/client';
import { mockClaude } from './claude/mock';
import { intVar, youcamMode, type Env, type YouCamMode } from './env';
import { systemClock, type Clock } from './lib/clock';
import { HttpError } from './lib/errors';
import { verifyInstallToken, CapsLedger } from './lib/install';
import { kvStore, type JsonStore } from './lib/kv';
import { kvPacerStore, memoryPacerStore, Pacer, YOUCAM_PACING, type PacerStateStore } from './lib/limiter';
import { createMockYouCam, MOCK_ORIGIN, sharedMock } from './mock';
import { DEMO_HEADER } from './proposals';
import { realRules, type RulesPort } from './rulesPort';
import { YouCamClient, type FetchLike } from './youcam/client';

export interface AppDeps {
  clock?: Clock;
  /** Overrides the network for live mode (tests only; never the real API from tests). */
  liveFetch?: FetchLike;
  mock?: ReturnType<typeof createMockYouCam>;
  claude?: ClaudeCaller;
  rules?: RulesPort;
  catalog?: Catalog;
  pacerStore?: (mode: YouCamMode, store: JsonStore) => PacerStateStore;
  random?: () => number;
  /** Overrides the network for the Flipkart short-link redirect lookup (tests only). */
  shareFetch?: FetchLike;
}

export interface AppCtx {
  env: Env;
  mode: YouCamMode;
  store: JsonStore;
  clock: Clock;
  catalog: Catalog;
  rules: RulesPort;
  caps: CapsLedger;
  origin: string;
  mock: ReturnType<typeof createMockYouCam>;
  youcam(useMock: boolean): YouCamClient;
  claude(): { caller: ClaudeCaller; model: string; mocked: boolean };
  installSecret(): string;
  /** Location header of ONE manual-redirect GET to https://dl.flipkart.com/s/<code>. The page body is never read. */
  flipkartLocation(shortUrl: string): Promise<string | null>;
}

export type HonoEnv = { Bindings: Env; Variables: { ctx: AppCtx } };

export const makeContextFactory = (deps: AppDeps) => {
  const pacers = new Map<YouCamMode, Pacer>();
  const mock = deps.mock ?? sharedMock;
  const clock = deps.clock ?? systemClock;

  return (env: Env, url: string): AppCtx => {
    const mode = youcamMode(env);
    const store = kvStore(env.KV);
    const pacer = (m: YouCamMode) => {
      let p = pacers.get(m);
      if (!p) {
        const s = deps.pacerStore?.(m, store) ?? (m === 'live' ? kvPacerStore(store) : memoryPacerStore());
        p = new Pacer(s, clock, { ...YOUCAM_PACING, minIntervalMs: intVar(env.YOUCAM_MIN_INTERVAL_MS, YOUCAM_PACING.minIntervalMs) });
        pacers.set(m, p);
      }
      return p;
    };
    return {
      env,
      mode,
      store,
      clock,
      catalog: deps.catalog ?? bundledCatalog(),
      rules: deps.rules ?? realRules,
      caps: new CapsLedger(store, { scans: intVar(env.SCAN_CAP, 1), tryons: intVar(env.TRYON_CAP, 3) }),
      origin: new URL(url).origin,
      mock,
      youcam: (useMock) => {
        if (useMock || mode === 'mock')
          return new YouCamClient({ baseUrl: MOCK_ORIGIN, apiKey: 'mock-key', fetch: mock.fetch, pacer: pacer('mock'), clock, random: deps.random });
        if (!env.YOUCAM_API_KEY) throw new HttpError('internal', 'YouCam is not configured');
        return new YouCamClient({
          baseUrl: env.YOUCAM_BASE_URL,
          apiKey: env.YOUCAM_API_KEY,
          fetch: deps.liveFetch ?? ((input, init) => fetch(input, init)),
          pacer: pacer('live'),
          clock,
          random: deps.random,
        });
      },
      claude: () => {
        const model = env.CLAUDE_MODEL || 'claude-opus-5-5';
        if (deps.claude) return { caller: deps.claude, model, mocked: false };
        const useMock = env.CLAUDE_MODE === 'mock' || !env.ANTHROPIC_API_KEY;
        return useMock ? { caller: mockClaude(), model, mocked: true } : { caller: sdkCaller(env.ANTHROPIC_API_KEY!), model, mocked: false };
      },
      installSecret: () => {
        if (env.INSTALL_HMAC_SECRET) return env.INSTALL_HMAC_SECRET;
        if (mode === 'mock') return 'dev-only-mock-install-secret';
        throw new HttpError('internal', 'Install tokens are not configured');
      },
      flipkartLocation: async (shortUrl) => {
        if (!isFlipkartShortLink(shortUrl)) return null;
        if (!deps.shareFetch && mode === 'mock') return shortUrl === SHARE_FIXTURES.flipkartShortLink ? SHARE_FIXTURES.flipkartLocation : null;
        const doFetch = deps.shareFetch ?? ((input, init) => fetch(input, init));
        try {
          const res = await doFetch(shortUrl, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(4000) });
          await res.body?.cancel().catch(() => undefined);
          return res.status >= 300 && res.status < 400 ? res.headers.get('location') : null;
        } catch {
          return null;
        }
      },
    };
  };
};

export const ctxOf = (c: Context<HonoEnv>) => c.get('ctx');

export const requireInstall = async (c: Context<HonoEnv>) => {
  const id = await verifyInstallToken(ctxOf(c).installSecret(), c.req.header(INSTALL_HEADER));
  if (!id) throw new HttpError('unauthorized', 'Missing or invalid install token. POST /v1/install first.');
  return id;
};

export const isDemo = (c: Context<HonoEnv>) => c.req.header(DEMO_HEADER) === '1';

export const clientIp = (c: Context<HonoEnv>) => c.req.header('cf-connecting-ip') ?? 'local';
