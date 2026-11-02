import Anthropic from '@anthropic-ai/sdk';
import { LabelOcrRequest, parseFlipkartLocation, parseSharePayload, ResolveRequest, type LedgerEntry, type ResolveCandidate, type ResolveResponse } from '@skinkey/contracts';
import { Hono } from 'hono';
import { detectStore, extractTitle, inciVocabulary, MATCH, matchSku, skuConflict, toSummary, type Catalog } from '../catalog';
import { ClaudeOutputError, ClaudeRefusalError, type StructuredResult } from '../claude/client';
import { runX4, toOcrTokens } from '../claude/labelOcr';
import { runX3, sanitiseCandidates } from '../claude/resolve';
import { clientIp, ctxOf, type AppCtx, type HonoEnv } from '../context';
import { base64DecodedLength } from '../lib/b64';
import { iso } from '../lib/clock';
import { HttpError } from '../lib/errors';
import { recordGlobal, summarise } from '../lib/ledger';
import { dailyLimit, parseJson } from './util';

export const claudeRoutes = new Hono<HonoEnv>();

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const claudeEntry = (feature: LedgerEntry['feature'], r: StructuredResult<unknown> | null, started: number, latency: number, error?: string): LedgerEntry => ({
  feature,
  units: 0,
  latencyMs: r?.latencyMs ?? latency,
  startedAt: iso(started),
  status: error ? 'error' : 'ok',
  ...(error ? { errorCode: error } : {}),
  ...(r ? { model: r.model, inputTokens: r.inputTokens, outputTokens: r.outputTokens } : {}),
});

const asHttp = (e: unknown): HttpError => {
  if (e instanceof HttpError) return e;
  if (e instanceof ClaudeRefusalError) return new HttpError('claude_refusal', 'Claude could not read this. Try the paste field or a label photo.');
  if (e instanceof ClaudeOutputError || e instanceof Anthropic.APIError) return new HttpError('claude_error', 'Reading failed. Try again.');
  return new HttpError('claude_error', 'Reading failed. Try again.');
};

const candidate = (catalog: Catalog, catalogId: string, confidence: number, why: string): ResolveCandidate => ({
  catalogId,
  confidence: Math.round(confidence * 100) / 100,
  why,
  product: toSummary(catalog.byId.get(catalogId)!),
});

/** X3 share resolver: catalogue fuzzy match first; Claude only when the catalogue is not sure. The user confirms the SKU either way. */
export const resolve = async (ctx: AppCtx, req: ResolveRequest, ip: string, limit: (ip: string) => Promise<void>): Promise<ResolveResponse> => {
  const { catalog } = ctx;
  const parsed = parseSharePayload(req.text ?? '', req.url);
  const store = parsed.store !== 'other' ? parsed.store : detectStore(req.text, req.url);
  // Flipkart shares carry only dl.flipkart.com/s/<code>: one redirect header gives slug + pid (spikes/FINDINGS.md S1).
  const redirected = parsed.needsRedirect && parsed.url ? parseFlipkartLocation(await ctx.flipkartLocation(parsed.url)) : null;
  const title = parsed.title ?? redirected?.title ?? extractTitle(req.text, req.url);
  const base = { store, catalogCount: catalog.verifiedCount };
  const entries: LedgerEntry[] = [];
  const ledger = () => summarise(ctx.mode === 'mock', entries, []);

  // SKU disqualifiers (conflicting SPF, body vs face, product type) remove look-alikes before anything is offered.
  const { hits, ruledOut } = title ? matchSku(catalog, title) : { hits: [], ruledOut: [] };
  const top = hits[0];
  if (top && top.score >= MATCH.match && (hits[1]?.score ?? 0) <= top.score - MATCH.gap)
    return { ...base, outcome: 'match', resolver: 'catalog', extractedTitle: title, isSkincare: true, candidates: [candidate(catalog, top.product.id, top.score, 'Name match in our catalogue')], ledger: ledger() };
  const catalogCandidates = hits.filter((h) => h.score >= MATCH.candidate).slice(0, 3).map((h) => candidate(catalog, h.product.id, h.score, 'Close name match in our catalogue'));
  // The catalogue knows this line and every close SKU conflicts with the listing: check on the name only (no Claude).
  const allRuledOut = !req.imageBase64 && catalogCandidates.length === 0 && ruledOut.length > 0;
  if (req.source === 'sample' || allRuledOut || (!req.imageBase64 && catalogCandidates.length > 0))
    return { ...base, outcome: catalogCandidates.length ? 'candidates' : 'unknown', resolver: 'catalog', extractedTitle: title, isSkincare: true, candidates: catalogCandidates, ledger: ledger() };
  if (!title && !req.imageBase64)
    return { ...base, outcome: 'unknown', resolver: 'catalog', extractedTitle: null, isSkincare: true, candidates: [], ledger: ledger() };
  if (req.imageBase64 && base64DecodedLength(req.imageBase64) > MAX_IMAGE_BYTES) throw new HttpError('bad_request', 'Screenshot is larger than 5 MB');

  await limit(ip);
  const claude = ctx.claude();
  const started = ctx.clock.now();
  try {
    const r = await runX3(claude.caller, claude.model, catalog, {
      ...(title ? { text: title } : req.text ? { text: req.text } : {}),
      ...(req.url ? { url: req.url } : {}),
      ...(req.imageBase64 ? { imageBase64: req.imageBase64 } : {}),
    });
    entries.push(claudeEntry('claude_resolve', r, started, 0));
    if (!claude.mocked) await recordGlobal(ctx.store, ctx.mode === 'mock', { entry: entries[0] });
    const extractedTitle = title ?? r.data.extracted_title;
    // Claude proposes ids only; the same deterministic disqualifiers apply to its picks.
    const picks = sanitiseCandidates(r.data, catalog)
      .filter((p) => !extractedTitle || !skuConflict(extractedTitle, catalog.byId.get(p.catalogId)!))
      .map((p) => candidate(catalog, p.catalogId, p.confidence, p.why));
    if (!r.data.is_skincare) return { ...base, outcome: 'not_skincare', resolver: 'claude', extractedTitle, isSkincare: false, candidates: [], ledger: ledger() };
    return { ...base, outcome: picks.length ? 'candidates' : 'unknown', resolver: 'claude', extractedTitle, isSkincare: true, candidates: picks, ledger: ledger() };
  } catch (e) {
    const err = asHttp(e);
    entries.push(claudeEntry('claude_resolve', null, started, ctx.clock.now() - started, err.code));
    if (err.code === 'claude_refusal' || err.code === 'claude_error')
      return { ...base, outcome: catalogCandidates.length ? 'candidates' : 'unknown', resolver: 'catalog', extractedTitle: title, isSkincare: true, candidates: catalogCandidates, ledger: ledger() };
    throw err;
  }
};

claudeRoutes.post('/resolve', async (c) => {
  const ctx = ctxOf(c);
  const req = await parseJson(c, ResolveRequest);
  return c.json(await resolve(ctx, req, clientIp(c), (ip) => dailyLimit(c, 'resolve', ip, 200)));
});

/** X4 label OCR: Claude reads the label; the phone shows editable chips and the user confirms before any rule runs. */
claudeRoutes.post('/label-ocr', async (c) => {
  const ctx = ctxOf(c);
  const req = await parseJson(c, LabelOcrRequest);
  if (base64DecodedLength(req.imageBase64) > MAX_IMAGE_BYTES) throw new HttpError('bad_request', 'Label photo is larger than 5 MB');
  await dailyLimit(c, 'label-ocr', clientIp(c), 40);
  const claude = ctx.claude();
  const vocabulary = inciVocabulary(ctx.catalog);
  const started = ctx.clock.now();
  try {
    const r = await runX4(claude.caller, claude.model, vocabulary, { base64: req.imageBase64, mediaType: req.mediaType });
    const entry = claudeEntry('claude_label_ocr', r, started, 0);
    if (!claude.mocked) await recordGlobal(ctx.store, ctx.mode === 'mock', { entry });
    return c.json({ ...toOcrTokens(r.data, vocabulary), ledger: summarise(ctx.mode === 'mock', [entry], []) });
  } catch (e) {
    throw asHttp(e);
  }
});
