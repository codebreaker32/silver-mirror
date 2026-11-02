/**
 * Tier 1 flows end to end: the phone's own flow logic (apps/mobile/src/features, all pure modules)
 * driving the real Worker app in-process, with mock YouCam and mock Claude. No network, no units.
 *
 *   share → SKU confirm → verdict → better matches
 *   scan (consent → upload → analyse → read → delete confirmed)
 *   designed UNKNOWN → label photo → chips → verdict
 *   try-on
 *   How this was made (ledgers)
 *   medicine gate
 */
import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import { COPY, routes, type CatalogProduct, type KeyProfile, type RouteName, type UploadSlot } from '@skinkey/contracts';
import { medicineGate, rank, verdict } from '@skinkey/rules';
import catalogRows from '../../../data/catalog/catalog.json';
import { chipsFromOcr, chipsToInci, editChip, uncertainCount } from '../../mobile/src/features/check/chips';
import { evaluateLabel, evaluateProduct, evaluateTitleOnly, stepFromResolve, tryonEntry, type Engine } from '../../mobile/src/features/check/flow';
import { presentVerdict } from '../../mobile/src/features/check/present';
import { selectMatches } from '../../mobile/src/features/matches/select';
import { runScan, type JobDeps } from '../../mobile/src/features/scan/runScan';
import { runTryon } from '../../mobile/src/features/tryon/runTryon';
import { parseShareText, toResolveRequest } from '../../mobile/src/features/share/parse';
import { sampleInput } from '../../mobile/src/features/share/sample';
import { realRules } from '../src/rulesPort';
import { TEST_PRODUCTS, setup } from './helpers';

const engine: Engine = { verdict, medicineGate };

/**
 * The real merged catalogue. It has 0 human ticks today (see PROGRESS "Needs Aman"), so this test simulates
 * ticks on brand-page sunscreen rows only. Plus the Plum lip tint test row, because no real row has shade colours yet.
 */
const plum = TEST_PRODUCTS.find((p) => p.id === 'plum-lip-tint-candy')!;
const CATALOG: CatalogProduct[] = [
  ...(catalogRows as CatalogProduct[]).map((p) =>
    p.source_kind === 'brand_official' && p.category === 'sunscreen' ? { ...p, verified: true, status: 'verified' as const } : p,
  ),
  plum,
];

const consent = { version: 'scan-v1', adult: true as const, acceptedAt: '2026-11-01T18:00:00.000Z' };

const world = async () => {
  const s = setup({ rules: realRules, catalog: CATALOG });
  await s.install();
  /** Same shape as the phone's typed client: route map path + response schema parse. */
  const call = async <N extends RouteName>(name: N, body?: unknown, params: Record<string, string> = {}, query?: Record<string, string>) => {
    const route = routes[name];
    let path = route.path.replace(/:(\w+)/g, (_, k: string) => encodeURIComponent(params[k] ?? ''));
    if (query) path += `?${new URLSearchParams(query)}`;
    const r = await s.req(route.method, path, body);
    if (r.status >= 400) throw new Error(`${name} ${r.status} ${JSON.stringify(r.json)}`);
    return route.res.parse(r.json) as z.infer<(typeof routes)[N]['res']>;
  };
  const deleted: string[] = [];
  const job: JobDeps = {
    upload: async (_uri: string, slot: UploadSlot) => {
      const status = await s.put(slot);
      if (status >= 300) throw new Error(`PUT ${status}`);
    },
    deleteLocal: (uri) => void deleted.push(uri),
    sleep: async (ms) => void s.clock.advance(ms),
    now: () => s.clock.now(),
  };
  const poll = { intervalMs: 2000, timeoutMs: 120_000, deleteGraceMs: 20_000 };

  const scan = async (): Promise<KeyProfile> => {
    const progress = await runScan(
      {
        ...job,
        start: (b) => call('scanStart', b),
        submit: (scanId) => call('scanSubmit', { scanId }),
        status: (id) => call('scanStatus', undefined, { id }),
      },
      { uri: 'mem://selfie.jpg', width: 1080, height: 1440, fileSize: 400_000 },
      consent,
      () => {},
      poll,
    );
    expect(progress.phase, JSON.stringify(progress).slice(0, 800)).toBe('done');
    if (progress.phase !== 'done') throw new Error('scan failed');
    return progress.status.key!;
  };
  return { s, call, job, poll, deleted, scan };
};

describe('Tier 1 flows against the mock Worker (phone logic + Worker in-process)', () => {
  it('scan: upload → analyse → read → delete confirmed; Key has bands, no numbers, photo deleted', async () => {
    const w = await world();
    const key = await w.scan();
    // Real G1 fixture (airbrushed sample face): high raw scores → Low bands after inversion.
    expect(key.bands.oiliness.level).toBe('Low');
    expect(key.bands.pore.level).toBe('Low');
    expect(key.photoDeleted).toBe(true);
    expect(key.source).toBe('youcam_hd');
    expect(JSON.stringify(key)).not.toMatch(/raw_score|ui_score|skin_age/);
    expect(w.deleted).toEqual(['mem://selfie.jpg']);
    const status = await w.call('scanStatus', undefined, { id: key.scanId! });
    expect(status.deleteState).toBe('deleted');
    expect(status.ledger.mock).toBe(true);
    expect(status.ledger.entries.length).toBeGreaterThan(0);
  });

  it('share → SKU confirm → verdict → better matches (sample share, never calls Claude)', async () => {
    const w = await world();
    const key = await w.scan();
    const input = sampleInput();
    if (input.kind !== 'text') throw new Error('sample is a text share');
    const res = await w.call('resolve', toResolveRequest(input));
    expect(res.ledger.entries.some((e) => e.feature.startsWith('claude'))).toBe(false);

    const step = stepFromResolve(res, engine, input.parsed.title);
    expect(step.next).toBe('confirm');
    if (step.next !== 'confirm') return;
    const picked = step.candidates[0]!;
    expect(picked.catalogId).toBe('minimalist-niacinamide-10-face-serum');

    const { product } = await w.call('catalogProduct', undefined, { id: picked.catalogId });
    const v = evaluateProduct(engine, key, product);
    expect(['FITS', 'CAUTION']).toContain(v.label);
    expect(v.provenance).toBeDefined();
    const view = presentVerdict(v, { key, product, catalogCount: res.catalogCount });
    expect(view.subtitle).toBe(COPY.subtitle[v.label as keyof typeof COPY.subtitle]);

    // Better matches: the phone searches the same category, fetches verified rows, ranks with the real engine.
    const search = await w.call('catalogSearch', undefined, {}, { category: product.category, limit: '20' });
    expect(search.catalogCount).toBeGreaterThan(0);
    const ids = search.results.filter((r) => r.verified && r.status === 'verified' && r.id !== product.id).slice(0, 12).map((r) => r.id);
    const products = await Promise.all(ids.map(async (id) => (await w.call('catalogProduct', undefined, { id })).product));
    const matches = selectMatches(rank, products, key, product.id);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.length).toBeLessThanOrEqual(3);
    for (const m of matches) {
      expect(m.productId).not.toBe(product.id);
      expect(m.a11y).toMatch(/Fits\./);
      expect(m.url).toMatch(/^https:\/\/(www\.)?flipkart\.com\//);
    }
  });

  it('designed UNKNOWN → label photo → chips (uncertain flagged, user fixes) → label verdict', async () => {
    const w = await world();
    const key = await w.scan();
    const parsed = parseShareText('Zyxwvut Moonlight Barrier Balm 50g https://www.flipkart.com/zyxwvut-moonlight-barrier-balm/p/itmzzz');
    const res = await w.call('resolve', toResolveRequest({ kind: 'text', source: 'share_text', parsed }));
    const step = stepFromResolve(res, engine, parsed.title);
    // Whatever the resolver says, a name with no verified INCI can only be UNKNOWN.
    const unknown = evaluateTitleOnly(engine, key, res.extractedTitle ?? parsed.title);
    expect(unknown.label).toBe('UNKNOWN');
    const uv = presentVerdict(unknown, { key, product: null, catalogCount: res.catalogCount });
    expect(uv.subtitle).toBe(COPY.subtitle.UNKNOWN);
    expect(uv.unknownKind).toBe('ingredients');
    expect(['unknown', 'confirm', 'not_skincare']).toContain(step.next);

    const ocr = await w.call('labelOcr', { imageBase64: Buffer.from('label-photo').toString('base64'), mediaType: 'image/jpeg' });
    expect(ocr.ledger.entries.some((e) => e.feature === 'claude_label_ocr')).toBe(true);
    let chips = chipsFromOcr(ocr.tokens);
    expect(chips.length).toBeGreaterThan(3);
    expect(uncertainCount(chips)).toBeGreaterThan(0);
    for (const c of chips.filter((x) => x.uncertain)) chips = editChip(chips, c.id, c.text);
    expect(uncertainCount(chips)).toBe(0);

    const inci = chipsToInci(chips);
    const lv = evaluateLabel(engine, key, inci, null, parsed.title);
    expect(lv.label).not.toBe('UNKNOWN');
    expect(lv.label).not.toBe('MEDICINE');
    // Claude only read the label; the verdict came from the deterministic engine on confirmed chips.
    expect(JSON.stringify(lv)).not.toMatch(/claude/i);
  });

  it('try-on: two shades rendered on the same photo, tone hex never returned, photo deleted', async () => {
    const w = await world();
    const { product } = await w.call('catalogProduct', undefined, { id: plum.id });
    const entry = tryonEntry(product);
    expect(entry).toEqual({ mode: 'multi', label: COPY.tryonMulti });
    const progress = await runTryon(
      {
        ...w.job,
        start: (b) => w.call('tryonStart', b),
        submit: (id) => w.call('tryonSubmit', undefined, { id }),
        status: (id) => w.call('tryonStatus', undefined, { id }),
      },
      { productId: product.id, mode: entry!.mode, selfie: { uri: 'mem://tryon.jpg', fileSize: 150_000 }, consent },
      () => {},
      w.poll,
    );
    expect(progress.phase, JSON.stringify(progress).slice(0, 800)).toBe('done');
    if (progress.phase !== 'done') return;
    expect(progress.status.renders.length).toBe(2);
    expect(new Set(progress.status.renders.map((r) => r.shadeName)).size).toBe(2);
    expect(JSON.stringify({ ...progress.status, renders: [] })).not.toMatch(/#[0-9a-f]{6}/i);
    expect(w.deleted).toContain('mem://tryon.jpg');
    expect(progress.status.deleteState).toBe('deleted');
  });

  it('try-on is not offered for real tinted catalogue rows that have no shade colours on file', () => {
    const tinted = (catalogRows as CatalogProduct[]).filter((p) => p.tinted);
    expect(tinted.length).toBeGreaterThan(0);
    for (const p of tinted.filter((x) => !x.shades.some((s) => s.hex))) expect(tryonEntry(p)).toBeNull();
  });

  it('How this was made: every ledger says mock, lists what ran, and spends 0 real units', async () => {
    const w = await world();
    const key = await w.scan();
    const scanLedger = (await w.call('scanStatus', undefined, { id: key.scanId! })).ledger;
    const ocrLedger = (await w.call('labelOcr', { imageBase64: Buffer.from('x').toString('base64'), mediaType: 'image/jpeg' })).ledger;
    for (const l of [scanLedger, ocrLedger]) {
      expect(l.mock).toBe(true);
      expect(l.totalLatencyMs).toBeGreaterThanOrEqual(0);
    }
    expect(scanLedger.entries.map((e) => e.feature)).toEqual(expect.arrayContaining([expect.stringMatching(/skin|scan/i)]));
    expect(scanLedger.files.length).toBeGreaterThan(0);
    const global = await w.s.req('GET', '/v1/ledger');
    expect(global.json.mode).toBe('mock');
  });

  it('medicine gate: a medicine title or INCI stops the check before any verdict', async () => {
    const w = await world();
    const parsed = parseShareText('Adapalene Gel 0.1% 15g https://www.flipkart.com/adapalene-gel/p/itmabc');
    const res = await w.call('resolve', toResolveRequest({ kind: 'text', source: 'share_text', parsed }));
    const step = stepFromResolve(res, engine, parsed.title);
    expect(step.next).toBe('medicine');

    const check = await w.call('labelCheck', { items: [{ id: 'x', claims: [], inci: ['Aqua', 'Adapalene', 'Carbomer'] }], includeProfiles: false });
    expect(check.results[0]!.medicineToken).toBe('adapalene');
    const v = evaluateLabel(engine, null, [{ token: 'Aqua', position: 1 }, { token: 'Tretinoin', position: 2 }], null, null);
    expect(v.label).toBe('MEDICINE');
    expect(presentVerdict(v, { key: null, product: null, catalogCount: 0 }).labelText).toBeNull();
  });
});
