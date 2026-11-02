import { ScanStartRequest, ScanSubmitRequest, TryonStartRequest, type Caps, type CatalogProduct } from '@skinkey/contracts';
import { Hono, type Context } from 'hono';
import { ctxOf, isDemo, requireInstall, type AppCtx, type HonoEnv } from '../context';
import { intVar } from '../env';
import { randomId } from '../lib/b64';
import { HttpError } from '../lib/errors';
import { budget, readGlobalLedger, UNIT_COSTS, wouldBreachFloor } from '../lib/ledger';
import { issueInstallToken } from '../lib/install';
import { advanceScan, keyBuilder, scanResponse, submitScan, type ScanJob } from '../jobs/scan';
import { loadJob, saveJob, type AnyJob } from '../jobs/store';
import { advanceTryon, submitTryon, tryonResponse, type TryonJob } from '../jobs/tryon';
import { MOCK_ORIGIN } from '../mock';
import { MOCK_SCENARIO_HEADER } from '../proposals';
import { VTO_IMAGE, type VtoKind, type VtoShade } from '../youcam/bodies';
import { YouCamHttpError, type YouCamClient } from '../youcam/client';
import { idempotent, parseJson } from './util';

export const youcamRoutes = new Hono<HonoEnv>();

const HD_MIN_SHORT_SIDE = 1080;

const budgetFor = async (ctx: AppCtx) =>
  budget(await readGlobalLedger(ctx.store, false), intVar(ctx.env.UNIT_BALANCE_START, 1022), intVar(ctx.env.UNIT_FLOOR, 50));

/** Live, non-demo jobs spend units: check the floor, then reserve one use of the install's cap. */
const reserve = async (ctx: AppCtx, installId: string, kind: 'scan' | 'tryon', cost: number, simulated: boolean): Promise<{ caps: Caps; consumed: boolean }> => {
  if (simulated) return { caps: await ctx.caps.caps(installId), consumed: false };
  if (wouldBreachFloor(await budgetFor(ctx), cost))
    throw new HttpError('cap_reached', 'Live YouCam calls are paused to protect the judging reserve. Try the Demo reading.');
  const caps = await ctx.caps.consume(installId, kind);
  if (!caps) throw new HttpError('cap_reached', kind === 'scan' ? 'This install has used its real scan. Try the Demo reading.' : 'This install has used its try-ons.');
  return { caps, consumed: true };
};

const fileName = (c: Context<HonoEnv>, simulated: boolean, kind: string) => {
  const scenario = simulated ? c.req.header(MOCK_SCENARIO_HEADER)?.replace(/[^a-z0-9_]/gi, '') : undefined;
  return scenario ? `mock-${scenario}.jpg` : `skinkey-${kind}.jpg`;
};

const createUpload = async (ctx: AppCtx, yc: YouCamClient, simulated: boolean, name: string, size: number) => {
  try {
    const { fileId, upload } = await yc.createFile({ fileName: name, contentType: 'image/jpg', fileSize: size });
    return { fileId, upload: simulated || ctx.mode === 'mock' ? { ...upload, url: upload.url.replace(MOCK_ORIGIN, `${ctx.origin}/mock-youcam`) } : upload };
  } catch (e) {
    throw new HttpError('youcam_error', 'Could not open an upload slot. Try again.', e instanceof YouCamHttpError ? e.errorCode : undefined);
  }
};

const ownJob = async <K extends AnyJob['kind']>(c: Context<HonoEnv>, kind: K, id: string) => {
  const installId = await requireInstall(c);
  const job = await loadJob(ctxOf(c).store, kind, id);
  if (!job || job.installId !== installId) throw new HttpError('not_found', `No such ${kind}`);
  return job;
};

const settle = async (ctx: AppCtx, job: AnyJob, refund: boolean | undefined) => {
  if (refund && job.capsConsumed) {
    await ctx.caps.refund(job.installId, job.kind);
    job.capsConsumed = false;
  }
  await saveJob(ctx.store, job);
};

youcamRoutes.post('/install', async (c) => {
  const ctx = ctxOf(c);
  const { installId, token } = await issueInstallToken(ctx.installSecret());
  return c.json({ installToken: token, caps: await ctx.caps.caps(installId) });
});

// ---- Scan (P1–P4) ----

youcamRoutes.post('/scan/start', async (c) => {
  const installId = await requireInstall(c);
  const ctx = ctxOf(c);
  const req = await parseJson(c, ScanStartRequest);
  if (Math.min(req.image.width, req.image.height) < HD_MIN_SHORT_SIDE)
    throw new HttpError('bad_request', `HD Skin Analysis needs a photo whose short side is at least ${HD_MIN_SHORT_SIDE} px`);
  const demo = isDemo(c);
  const simulated = demo || ctx.mode === 'mock';
  return idempotent(c, `scan:${installId}`, async () => {
    const { caps, consumed } = await reserve(ctx, installId, 'scan', UNIT_COSTS.skin_analysis_hd, simulated);
    const yc = ctx.youcam(demo);
    let upload;
    try {
      upload = await createUpload(ctx, yc, simulated, fileName(c, simulated, 'scan'), req.image.fileSize);
    } catch (e) {
      if (consumed) await ctx.caps.refund(installId, 'scan');
      throw e;
    }
    const job: ScanJob = {
      kind: 'scan',
      id: `scan_${randomId(16)}`,
      mock: simulated,
      demo,
      installId,
      createdAt: ctx.clock.now(),
      file: { fileId: upload.fileId, state: 'uploaded' },
      tasks: [],
      capsConsumed: consumed,
      overlayDelivered: false,
    };
    await saveJob(ctx.store, job);
    return { scanId: job.id, upload: upload.upload, caps };
  });
});

const scanCtx = (ctx: AppCtx, job: ScanJob) => ({ youcam: ctx.youcam(job.demo), clock: ctx.clock, store: ctx.store, buildKey: keyBuilder(ctx.rules) });

youcamRoutes.post('/scan/submit', async (c) => {
  const ctx = ctxOf(c);
  const { scanId } = await parseJson(c, ScanSubmitRequest);
  const job = await ownJob(c, 'scan', scanId);
  const sctx = scanCtx(ctx, job);
  const submitted = await submitScan(job, sctx);
  await settle(ctx, job, submitted.refund);
  return c.json(scanResponse(job, ctx.clock.now()));
});

youcamRoutes.get('/scan/:id', async (c) => {
  const ctx = ctxOf(c);
  const job = await ownJob(c, 'scan', c.req.param('id'));
  const out = await advanceScan(job, scanCtx(ctx, job));
  await settle(ctx, job, out.refund);
  return c.json(scanResponse(job, ctx.clock.now(), out.overlayJpegBase64));
});

youcamRoutes.post('/scan/:id/cancel', async (c) => {
  const ctx = ctxOf(c);
  const job = await ownJob(c, 'scan', c.req.param('id'));
  if (!job.submittedAt && job.tasks.length === 0) job.file.state = 'orphan';
  await settle(ctx, job, true);
  return c.json(scanResponse(job, ctx.clock.now()));
});

// ---- Try-on (T1–T4) ----

const vtoKindFor = (p: CatalogProduct): VtoKind | null =>
  p.category === 'lip_tint' || p.category === 'tinted_lip_balm'
    ? 'lip_color'
    : p.category === 'tinted_spf' || p.category === 'tinted_moisturiser'
      ? 'foundation'
      : null;

youcamRoutes.post('/tryon', async (c) => {
  const installId = await requireInstall(c);
  const ctx = ctxOf(c);
  const req = await parseJson(c, TryonStartRequest);
  const product = ctx.catalog.byId.get(req.productId);
  if (!product) throw new HttpError('not_found', 'No such product');
  const vtoKind = vtoKindFor(product);
  if (!product.tinted || !vtoKind) throw new HttpError('bad_request', 'Try-on is only for tinted products');
  const shades: VtoShade[] = product.shades.flatMap((s) => (s.hex ? [{ name: s.name, hex: s.hex }] : []));
  let singleShade: VtoShade | undefined;
  if (req.mode === 'multi' && shades.length < 2) throw new HttpError('bad_request', 'This product has fewer than two shade colours on file');
  if (req.mode === 'single') {
    singleShade = req.shadeName ? shades.find((s) => s.name === req.shadeName) : shades.length === 1 ? shades[0] : undefined;
    if (!singleShade) throw new HttpError('bad_request', 'Pick a shade that has a colour on file');
  }
  if (req.image.width !== VTO_IMAGE.width || req.image.height !== VTO_IMAGE.height) throw new HttpError('bad_request', 'Resize the selfie to 768×1024');
  const demo = isDemo(c);
  const simulated = demo || ctx.mode === 'mock';
  const cost = req.mode === 'multi' ? UNIT_COSTS.skin_tone + 2 * UNIT_COSTS.makeup_vto : UNIT_COSTS.makeup_vto;
  return idempotent(c, `tryon:${installId}`, async () => {
    const { caps, consumed } = await reserve(ctx, installId, 'tryon', cost, simulated);
    let upload;
    try {
      upload = await createUpload(ctx, ctx.youcam(demo), simulated, fileName(c, simulated, 'tryon'), req.image.fileSize);
    } catch (e) {
      if (consumed) await ctx.caps.refund(installId, 'tryon');
      throw e;
    }
    const job: TryonJob = {
      kind: 'tryon',
      id: `tryon_${randomId(16)}`,
      mock: simulated,
      demo,
      installId,
      createdAt: ctx.clock.now(),
      file: { fileId: upload.fileId, state: 'uploaded' },
      tasks: [],
      capsConsumed: consumed,
      mode: req.mode,
      productId: product.id,
      vtoKind,
      shades,
      ...(singleShade ? { singleShade } : {}),
      rendersDelivered: false,
      renderCount: 0,
    };
    await saveJob(ctx.store, job);
    return { tryonId: job.id, upload: upload.upload, caps };
  });
});

const tryonCtx = (ctx: AppCtx, job: TryonJob) => ({ youcam: ctx.youcam(job.demo), clock: ctx.clock, store: ctx.store });

youcamRoutes.post('/tryon/:id/submit', async (c) => {
  const ctx = ctxOf(c);
  const job = await ownJob(c, 'tryon', c.req.param('id'));
  const out = await submitTryon(job, tryonCtx(ctx, job));
  await settle(ctx, job, out.refund);
  return c.json(tryonResponse(job, ctx.clock.now()));
});

youcamRoutes.get('/tryon/:id', async (c) => {
  const ctx = ctxOf(c);
  const job = await ownJob(c, 'tryon', c.req.param('id'));
  const out = await advanceTryon(job, tryonCtx(ctx, job));
  await settle(ctx, job, out.refund);
  return c.json(tryonResponse(job, ctx.clock.now(), out.renders));
});

youcamRoutes.post('/tryon/:id/cancel', async (c) => {
  const ctx = ctxOf(c);
  const job = await ownJob(c, 'tryon', c.req.param('id'));
  if (!job.submittedAt && job.tasks.length === 0) job.file.state = 'orphan';
  await settle(ctx, job, true);
  return c.json(tryonResponse(job, ctx.clock.now()));
});

// ---- Ledger ----

youcamRoutes.get('/ledger', async (c) => {
  const ctx = ctxOf(c);
  const live = ctx.mode === 'live';
  const g = await readGlobalLedger(ctx.store, !live);
  let youcamCredit: number | null | undefined;
  if (c.req.query('verify') === '1') {
    if (!ctx.env.ADMIN_TOKEN || c.req.header('x-skinkey-admin') !== ctx.env.ADMIN_TOKEN) throw new HttpError('unauthorized', 'Admin token required');
    const credit = await ctx.youcam(false).credit();
    youcamCredit = credit.results.reduce((n, r) => n + r.amount, 0);
  }
  const status = budget(g, intVar(ctx.env.UNIT_BALANCE_START, 1022), intVar(ctx.env.UNIT_FLOOR, 50));
  if (status.alert) console.warn(`ledger alert: ${status.remaining} of ${status.startBalance} units left`);
  return c.json({
    mode: ctx.mode,
    spentUnits: g.spentUnits,
    byFeature: g.byFeature,
    successfulTasks: g.successfulTasks,
    deletesConfirmed: g.deletesConfirmed,
    deletesFailed: g.deletesFailed,
    claudeCalls: g.claudeCalls,
    budget: status,
    ...(youcamCredit !== undefined ? { youcamCredit } : {}),
  });
});
