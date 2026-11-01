import { DEMO_KEY, INSTALL_HEADER, type CatalogProduct, type KeyProfile, type RawScoreReading } from '@skinkey/contracts';
import type { BuildKeyInput } from '@skinkey/rules';
import { createApp } from '../src/app';
import { loadCatalog } from '../src/catalog';
import type { ClaudeCaller } from '../src/claude/client';
import type { Env } from '../src/env';
import { FakeClock } from '../src/lib/clock';
import { MemoryKV } from '../src/lib/kv';
import { createMockYouCam, MOCK_ORIGIN, type MockOptions } from '../src/mock';
import { realRules, type RulesPort } from '../src/rulesPort';

const shade = (name: string, hex: string) => ({ name, hex });

export const TEST_PRODUCTS: CatalogProduct[] = [
  {
    id: 'cerave-moisturising-cream-50ml',
    brand: 'CeraVe',
    name: 'Moisturising Cream for Dry to Very Dry Skin',
    size: '50 ml',
    category: 'moisturiser',
    tinted: false,
    inci: [
      { token: 'Aqua', position: 1 },
      { token: 'Glycerin', position: 2 },
      { token: 'Petrolatum', position: 3 },
    ],
    claims: [{ type: 'fragrance_free', quote: 'fragrance-free' }],
    shades: [],
    source_url: 'https://example.test/cerave',
    fetched_at: '2026-11-01T00:00:00.000Z',
    verified: true,
    status: 'verified',
  },
  {
    id: 'plum-lip-tint-candy',
    brand: 'Plum',
    name: 'Candy Melts Vegan Lip Tint',
    size: '4 g',
    category: 'lip_tint',
    tinted: true,
    inci: [{ token: 'Ricinus Communis Seed Oil', position: 1 }],
    claims: [],
    shades: [shade('Berry Bloom', '#B5535C'), shade('Coral Crush', '#D9735B'), shade('Nude Note', '#B9887A')],
    source_url: 'https://example.test/plum',
    fetched_at: '2026-11-01T00:00:00.000Z',
    verified: true,
    status: 'verified',
  },
  {
    id: 'foxtale-tinted-spf',
    brand: 'Foxtale',
    name: 'Tinted Sunscreen SPF 50',
    category: 'tinted_spf',
    tinted: true,
    inci: [{ token: 'Aqua', position: 1 }],
    claims: [{ type: 'universal_tint' }],
    shades: [shade('Universal', '#C8A27E')],
    source_url: 'https://example.test/foxtale',
    fetched_at: '2026-11-01T00:00:00.000Z',
    verified: false,
    status: 'unverified',
  },
];

/** Stand-in for buildKeyProfile while RULES writes the real one. Records every input so tests can inspect the ui_score firewall. */
export const fakeRules = () => {
  const keyInputs: BuildKeyInput[] = [];
  const band = (r: RawScoreReading | undefined) => (!r ? 'Medium' : r.raw_score < 40 ? 'High' : r.raw_score < 70 ? 'Medium' : 'Low');
  const rules: RulesPort = {
    ...realRules,
    buildKeyProfile: (input) => {
      keyInputs.push(input);
      const find = (type: string) => input.readings.find((r) => r.type === type && (r.region ?? 'whole') === 'whole') ?? input.readings.find((r) => r.type === type);
      const key: KeyProfile = {
        ...DEMO_KEY,
        source: input.source,
        scanId: input.scanId,
        scanDate: input.scanDate,
        copySet: 'B',
        bands: {
          oiliness: { level: band(find('hd_oiliness')), region: 'whole', selfReported: false },
          moisture: { level: band(find('hd_moisture')), region: 'whole', selfReported: false },
          redness: { level: band(find('hd_redness')), region: 'whole', selfReported: false },
          pore: { level: band(find('hd_pore')), region: 'whole', selfReported: false },
        },
        zones: {},
        photoDeleted: input.photoDeleted,
      };
      return key;
    },
  };
  return { rules, keyInputs };
};

export interface SetupOptions {
  mode?: 'mock' | 'live';
  rules?: RulesPort;
  claude?: ClaudeCaller;
  mockOptions?: MockOptions;
  env?: Partial<Env>;
  shareFetch?: (input: string, init?: RequestInit) => Promise<Response>;
  /** Catalogue rows to serve (default TEST_PRODUCTS). */
  catalog?: CatalogProduct[];
}

export const setup = (opts: SetupOptions = {}) => {
  const clock = new FakeClock();
  const kv = new MemoryKV();
  const mock = createMockYouCam(opts.mockOptions);
  const fr = fakeRules();
  const apiCallTimes: number[] = [];
  const recording = {
    ...mock,
    fetch: (input: string, init?: RequestInit) => {
      if (new URL(input).pathname.includes('/s2s/')) apiCallTimes.push(clock.now());
      return mock.fetch(input, init);
    },
  };
  const app = createApp({
    clock,
    mock: recording,
    liveFetch: recording.fetch,
    rules: opts.rules ?? fr.rules,
    catalog: loadCatalog(opts.catalog ?? TEST_PRODUCTS),
    ...(opts.claude ? { claude: opts.claude } : {}),
    random: () => 0,
    ...(opts.shareFetch ? { shareFetch: opts.shareFetch } : {}),
  });
  const env: Env = {
    KV: kv.asKV(),
    YOUCAM_MODE: opts.mode ?? 'mock',
    YOUCAM_BASE_URL: MOCK_ORIGIN,
    CLAUDE_MODEL: 'claude-opus-5-5',
    SCAN_CAP: '1',
    TRYON_CAP: '3',
    AFFILIATE_NYKAA: 'off',
    YOUCAM_API_KEY: 'test-key-not-real',
    INSTALL_HMAC_SECRET: 'test-secret',
    CLAUDE_MODE: 'mock',
    ...opts.env,
  };
  let token: string | null = null;
  const req = async (method: string, path: string, body?: unknown, headers: Record<string, string> = {}) => {
    const res = await app.request(
      path,
      {
        method,
        headers: { 'content-type': 'application/json', ...(token ? { [INSTALL_HEADER]: token } : {}), ...headers },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      },
      env,
    );
    return { status: res.status, json: (await res.json()) as any };
  };
  const install = async () => {
    const r = await req('POST', '/v1/install');
    token = r.json.installToken;
    return r.json;
  };
  /** The phone's PUT to the upload slot. In live-mode tests the slot points at the mock too. */
  const put = async (upload: { url: string; headers: Record<string, string> }) => {
    const res = await mock.fetch(upload.url, { method: 'PUT', headers: upload.headers, body: new Uint8Array([0xff, 0xd8, 0xff, 0xd9]) });
    return res.status;
  };
  return { app, env, clock, kv, mock, req, install, put, apiCallTimes, keyInputs: fr.keyInputs, setToken: (t: string | null) => (token = t) };
};

export const consent = { version: 'v1', adult: true as const, acceptedAt: '2026-11-01T18:00:00.000Z' };
export const scanImage = { contentType: 'image/jpeg' as const, fileSize: 400_000, width: 1080, height: 1440 };
export const tryonImage = { contentType: 'image/jpeg' as const, fileSize: 150_000, width: 768, height: 1024 };

/** Polls a status route like the phone does (3 s apart) until it stops changing or settles. */
export const pollUntil = async (
  s: ReturnType<typeof setup>,
  path: string,
  done: (json: any) => boolean,
  max = 12,
): Promise<{ history: any[]; last: any }> => {
  const history: any[] = [];
  for (let i = 0; i < max; i++) {
    s.clock.advance(3000);
    const r = await s.req('GET', path);
    history.push(r.json);
    if (done(r.json)) return { history, last: r.json };
  }
  return { history, last: history.at(-1) };
};
