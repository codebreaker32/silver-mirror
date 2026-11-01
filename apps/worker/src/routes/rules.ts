import {
  CatalogSearchQuery,
  COPY,
  LabelCheckRequest,
  type InciToken,
  type LabelCheckResult,
} from '@skinkey/contracts';
import { Hono } from 'hono';
import { searchCatalog, toSummary } from '../catalog';
import { ctxOf, type HonoEnv } from '../context';
import { HttpError } from '../lib/errors';
import { parseJson } from './util';

export const rulesRoutes = new Hono<HonoEnv>();

const toTokens = (inci: InciToken[] | string[]): InciToken[] =>
  inci.map((t, i) => (typeof t === 'string' ? { token: t.trim(), position: i + 1 } : t)).filter((t) => t.token.length > 0);

/** Retailer catalogue QA (spec §7): claims + INCI → Label Check hits. Deterministic; no Claude on this path. */
rulesRoutes.post('/label-check', async (c) => {
  const { rules } = ctxOf(c);
  const req = await parseJson(c, LabelCheckRequest);
  const results: LabelCheckResult[] = req.items.map((item) => {
    const inci = toTokens(item.inci);
    const med = rules.medicineGate(inci, item.title);
    const hits = rules.labelCheck(item.claims, inci);
    const profileFlags = req.includeProfiles
      ? rules.READING_PROFILES.map((p) => {
          const v = rules.verdict({ key: rules.profileKey(p, Object.keys(p.zones).length ? 'A' : 'B'), inci, inciSource: 'catalog_verified', claims: item.claims, ...(item.title ? { title: item.title } : {}) });
          return { profileId: p.id, label: v.label, ruleIds: v.reasons.filter((r) => r.kind === 'FIT_CAUTION').map((r) => r.ruleId) };
        })
      : undefined;
    return { id: item.id, hits, ...(med.gated && med.token ? { medicineToken: med.token } : {}), ...(profileFlags ? { profileFlags } : {}) };
  });
  return c.json({ rulesetHash: rules.rulesetHash(), results });
});

rulesRoutes.get('/rules', (c) => {
  const { rules } = ctxOf(c);
  return c.json({
    rulesetHash: rules.rulesetHash(),
    rules: rules.RULES,
    bandCutoffs: rules.BAND_CUTOFFS,
    profiles: rules.READING_PROFILES,
    facetMap: rules.FACET_MAP,
    banner: COPY.rulesBanner,
  });
});

rulesRoutes.get('/catalog/search', (c) => {
  const { catalog } = ctxOf(c);
  const parsed = CatalogSearchQuery.safeParse(c.req.query());
  if (!parsed.success) throw new HttpError('bad_request', parsed.error.issues[0]?.message ?? 'bad query');
  const q = parsed.data;
  const tinted = q.tinted === undefined ? undefined : q.tinted === 'true';
  const results = searchCatalog(catalog, q.q ?? '', { limit: q.limit, ...(q.category ? { category: q.category } : {}), ...(tinted === undefined ? {} : { tinted }) });
  return c.json({ catalogCount: catalog.verifiedCount, results: results.map((r) => toSummary(r.product)) });
});

rulesRoutes.get('/catalog/:id', (c) => {
  const product = ctxOf(c).catalog.byId.get(c.req.param('id'));
  if (!product) throw new HttpError('not_found', 'No such product');
  return c.json({ product });
});
