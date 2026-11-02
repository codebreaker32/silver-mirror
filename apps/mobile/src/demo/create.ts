import {
  COPY,
  DEMO_KEY,
  TRYON_STEP_IDS,
  type CatalogProduct,
  type ConsentRecord,
  type HowThisWasMade,
  type KeyProfile,
  type LabelOcrResponse,
  type ResolveResponse,
  type TryonMode,
  type TryonStatusResponse,
} from '@skinkey/contracts';
// Pure catalogue helpers and the generated catalogue the Worker serves. Web demo bundle only (see index.web.ts).
import { bundledCatalog, detectStore, extractTitle, MATCH, searchCatalog, toSummary } from '../../../worker/src/catalog';
import type { CheckApi } from '@/features/check/api';
import { memoryBackend, STORAGE_KEYS } from '@/features/key/store';
import { scanDisplaySteps } from '@/features/scan/steps';
import type { Demo, DemoScenario } from './types';

const DAY = 86_400_000;
const iso = (ms: number) => new Date(ms).toISOString();

/** Mock ledger: `mock: true` makes How this was made say "Mock YouCam: recorded fixtures". */
function scanLedger(at: number): HowThisWasMade {
  return {
    mock: true,
    entries: [
      { feature: 'file_upload', fileId: 'demo-file-1', units: 0, latencyMs: 820, startedAt: iso(at), status: 'ok' },
      { feature: 'skin_analysis_hd', taskId: 'demo-task-sa-1', fileId: 'demo-file-1', units: 12, latencyMs: 9400, startedAt: iso(at + 900), status: 'ok' },
      { feature: 'task_delete', taskId: 'demo-task-sa-1', units: 0, latencyMs: 310, startedAt: iso(at + 10_400), status: 'ok', deleteState: 'deleted' },
    ],
    files: [{ fileId: 'demo-file-1', state: 'deleted', taskIds: ['demo-task-sa-1'] }],
    totalUnits: 12,
    totalLatencyMs: 10_530,
  };
}

function seed(scenario: DemoScenario, now: number): Record<string, string> {
  if (scenario === 'none') return {};
  if (scenario === 'demo-reading') return { [STORAGE_KEYS.demo]: '1' };
  const scanAt = now - DAY;
  const key: KeyProfile = { ...DEMO_KEY, source: 'youcam_hd', scanId: 'demo-scan-1', scanDate: iso(scanAt), expiresAt: iso(scanAt + 30 * DAY) };
  const consent: ConsentRecord = { version: 'scan-v1', adult: true, acceptedAt: iso(scanAt - 60_000) };
  return {
    [STORAGE_KEYS.key]: JSON.stringify(key),
    [STORAGE_KEYS.consent]: JSON.stringify(consent),
    [STORAGE_KEYS.scanLedger]: JSON.stringify(scanLedger(scanAt)),
  };
}

const EMPTY: HowThisWasMade = { mock: true, entries: [], files: [], totalUnits: 0, totalLatencyMs: 0 };

const notFound = () => Object.assign(new Error('Demo: no such product'), { status: 404, body: { error: { code: 'not_found', message: 'No such product' } } });

/** Same catalogue-first path as the Worker's resolver, minus Claude: the demo never leaves the page. */
function createCheckApi(): CheckApi {
  const catalog = bundledCatalog();
  const product = (id: string): CatalogProduct => {
    const p = catalog.byId.get(id);
    if (!p) throw notFound();
    return p;
  };
  const candidate = (p: CatalogProduct, score: number, why: string) => ({ catalogId: p.id, confidence: Math.round(score * 100) / 100, why, product: toSummary(p) });
  return {
    async resolve(req) {
      const store = detectStore(req.text, req.url);
      const title = extractTitle(req.text, req.url);
      const base = { store, catalogCount: catalog.verifiedCount, resolver: 'catalog' as const, extractedTitle: title, isSkincare: true, ledger: EMPTY };
      const hits = title ? searchCatalog(catalog, title, { limit: 5 }) : [];
      const top = hits[0];
      if (top && top.score >= MATCH.match && (hits[1]?.score ?? 0) <= top.score - MATCH.gap) {
        return { ...base, outcome: 'match', candidates: [candidate(top.product, top.score, 'Name match in our catalogue')] } satisfies ResolveResponse;
      }
      const close = hits.filter((h) => h.score >= MATCH.candidate).slice(0, 3);
      return {
        ...base,
        outcome: close.length ? 'candidates' : 'unknown',
        candidates: close.map((h) => candidate(h.product, h.score, 'Close name match in our catalogue')),
      } satisfies ResolveResponse;
    },
    async product(id) {
      return { product: product(id) };
    },
    async search({ q, category, limit }) {
      const results = searchCatalog(catalog, q ?? '', { limit, ...(category ? { category } : {}) });
      return { catalogCount: catalog.verifiedCount, results: results.map((r) => toSummary(r.product)) };
    },
    async labelOcr(): Promise<LabelOcrResponse> {
      throw Object.assign(new Error('Demo: label reading is off'), { status: 400, body: { error: { code: 'claude_refusal', message: 'Demo mode does not read labels' } } });
    },
  };
}

function createTryon(productId: string, mode: TryonMode, shadeName?: string): TryonStatusResponse {
  const p = bundledCatalog().byId.get(productId);
  const names = shadeName ? [shadeName] : (p?.shades.map((s) => s.name) ?? []);
  const shades = mode === 'single' ? names.slice(0, 1) : names.slice(0, 2);
  // The catalogue has no shade names for most tinted rows: label the placeholders honestly instead of "Shade A/B".
  const picked = shades.length ? shades : mode === 'single' ? ['Sample shade'] : ['Lighter sample', 'Deeper sample'];
  const now = Date.now();
  const steps = TRYON_STEP_IDS.filter((id) => mode === 'multi' || id !== 'tone').map((id) => ({
    id,
    state: 'done' as const,
    label: COPY.tryonSteps[id],
  }));
  return {
    tryonId: 'demo-tryon-1',
    status: 'done',
    mode,
    steps,
    deleteState: 'deleted',
    // Empty image = drawn placeholder (TryonResult renders a token-drawn face-frame plate, labelled "Sample preview").
    renders: picked.map((name) => ({ shadeName: name, imageBase64: '' })),
    ledger: {
      mock: true,
      entries: [
        { feature: 'file_upload', fileId: 'demo-file-2', units: 0, latencyMs: 640, startedAt: iso(now - 12_000), status: 'ok' },
        { feature: 'makeup_vto', taskId: 'demo-task-vto-1', fileId: 'demo-file-2', units: picked.length, latencyMs: 8200, startedAt: iso(now - 11_000), status: 'ok' },
        { feature: 'task_delete', taskId: 'demo-task-vto-1', units: 0, latencyMs: 290, startedAt: iso(now - 2_500), status: 'ok', deleteState: 'deleted' },
      ],
      files: [{ fileId: 'demo-file-2', state: 'deleted', taskIds: ['demo-task-vto-1'] }],
      totalUnits: picked.length,
      totalLatencyMs: 9130,
    },
  };
}

export function createDemo(scenario: DemoScenario): Demo {
  return {
    scenario,
    kv: memoryBackend(seed(scenario, Date.now())),
    checkApi: createCheckApi(),
    scanProgress: {
      phase: 'processing',
      steps: scanDisplaySteps(
        [
          { id: 'upload', state: 'done', label: COPY.scanSteps.upload },
          { id: 'analyse', state: 'active', label: COPY.scanSteps.analyse },
          { id: 'read', state: 'pending', label: COPY.scanSteps.read },
          { id: 'delete', state: 'pending', label: COPY.scanSteps.delete },
        ],
        'done',
      ),
    },
    tryon: createTryon,
  };
}

