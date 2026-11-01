import { z } from 'zod';
import { ProductSummary, CatalogProduct } from './catalog';
import { Claim, InciToken, KeyProfile, BandCutoffs } from './domain';
import { Caps, DeleteState, HowThisWasMade } from './ledger';
import { FacetMapping, ReadingProfile, Rule } from './rules';
import { LabelCheckHit, VerdictLabel } from './verdict';

export const API_VERSION = 'v1';
export const INSTALL_HEADER = 'x-skinkey-install';
export const IDEMPOTENCY_HEADER = 'idempotency-key';

export const ApiError = z.object({
  error: z.object({
    code: z.enum([
      'bad_request',
      'unauthorized',
      'cap_reached',
      'rate_limited',
      'not_found',
      'youcam_error',
      'claude_refusal',
      'claude_error',
      'internal',
    ]),
    message: z.string(),
    youcamError: z.string().optional(),
  }),
});
export type ApiError = z.infer<typeof ApiError>;

export const ImageMeta = z.object({
  contentType: z.literal('image/jpeg'),
  fileSize: z.number().int().positive().max(10_000_000),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
export type ImageMeta = z.infer<typeof ImageMeta>;

export const ConsentRecord = z.object({
  version: z.string(),
  adult: z.literal(true),
  acceptedAt: z.iso.datetime(),
});
export type ConsentRecord = z.infer<typeof ConsentRecord>;

export const UploadSlot = z.object({
  url: z.string(),
  method: z.literal('PUT'),
  headers: z.record(z.string(), z.string()),
});
export type UploadSlot = z.infer<typeof UploadSlot>;

export const StepState = z.enum(['pending', 'active', 'done', 'failed', 'skipped']);
export type StepState = z.infer<typeof StepState>;

export const Step = <T extends readonly [string, ...string[]]>(ids: T) =>
  z.object({ id: z.enum(ids), state: StepState, label: z.string(), detail: z.string().optional() });

export const SCAN_STEP_IDS = ['upload', 'analyse', 'read', 'delete'] as const;
export const ScanStep = Step(SCAN_STEP_IDS);
export type ScanStep = z.infer<typeof ScanStep>;

export const TRYON_STEP_IDS = ['upload', 'tone', 'render', 'delete'] as const;
export const TryonStep = Step(TRYON_STEP_IDS);
export type TryonStep = z.infer<typeof TryonStep>;

export const JobStatus = z.enum(['awaiting_upload', 'running', 'done', 'failed']);
export type JobStatus = z.infer<typeof JobStatus>;

export const YouCamErrorCode = z.enum([
  'error_src_face_too_small',
  'error_lighting_dark',
  'error_no_face',
  'error_pose',
  'error_exceed_max_image_size',
  'unknown',
]);
export type YouCamErrorCode = z.infer<typeof YouCamErrorCode>;

// POST /v1/scan/start
export const ScanStartRequest = z.object({ image: ImageMeta, consent: ConsentRecord });
export type ScanStartRequest = z.infer<typeof ScanStartRequest>;
export const ScanStartResponse = z.object({ scanId: z.string(), upload: UploadSlot, caps: Caps });
export type ScanStartResponse = z.infer<typeof ScanStartResponse>;

// POST /v1/scan/submit
export const ScanSubmitRequest = z.object({ scanId: z.string() });
export type ScanSubmitRequest = z.infer<typeof ScanSubmitRequest>;

// GET /v1/scan/:id  (also the response of /v1/scan/submit)
export const ScanStatusResponse = z.object({
  scanId: z.string(),
  status: JobStatus,
  steps: z.array(ScanStep),
  deleteState: DeleteState,
  key: KeyProfile.optional(),
  /** Blended mask overlay JPG (base64, no data: prefix). Returned once, held in memory only. */
  overlayJpegBase64: z.string().optional(),
  error: z.object({ code: YouCamErrorCode, message: z.string() }).optional(),
  ledger: HowThisWasMade,
});
export type ScanStatusResponse = z.infer<typeof ScanStatusResponse>;

// POST /v1/tryon  (creates the job and its upload slot)
export const TryonMode = z.enum(['multi', 'single']);
export type TryonMode = z.infer<typeof TryonMode>;
export const TryonStartRequest = z.object({
  productId: z.string(),
  mode: TryonMode,
  shadeName: z.string().optional(),
  image: ImageMeta.extend({ width: z.literal(768), height: z.literal(1024) }),
  consent: ConsentRecord,
});
export type TryonStartRequest = z.infer<typeof TryonStartRequest>;
export const TryonStartResponse = z.object({ tryonId: z.string(), upload: UploadSlot, caps: Caps });
export type TryonStartResponse = z.infer<typeof TryonStartResponse>;

// POST /v1/tryon/:id/submit, then GET /v1/tryon/:id
export const TryonRender = z.object({
  shadeName: z.string(),
  /** Rendered JPG (base64). Held in memory only and dropped when the sheet closes. */
  imageBase64: z.string(),
});
export type TryonRender = z.infer<typeof TryonRender>;
export const TryonStatusResponse = z.object({
  tryonId: z.string(),
  status: JobStatus,
  mode: TryonMode,
  steps: z.array(TryonStep),
  deleteState: DeleteState,
  renders: z.array(TryonRender).max(2).default([]),
  error: z.object({ code: YouCamErrorCode, message: z.string() }).optional(),
  ledger: HowThisWasMade,
});
export type TryonStatusResponse = z.infer<typeof TryonStatusResponse>;

// POST /v1/resolve
export const Store = z.enum(['flipkart', 'amazon_in', 'nykaa', 'other']);
export type Store = z.infer<typeof Store>;
export const ResolveRequest = z
  .object({
    source: z.enum(['share_text', 'paste', 'screenshot', 'sample']),
    text: z.string().max(4000).optional(),
    url: z.string().optional(),
    /** Cropped screenshot (base64 JPEG). Only after the crop step. Never sent with face data. */
    imageBase64: z.string().optional(),
  })
  .refine((r) => r.text || r.url || r.imageBase64, 'text, url or imageBase64 required');
export type ResolveRequest = z.infer<typeof ResolveRequest>;
export const ResolveCandidate = z.object({
  catalogId: z.string(),
  confidence: z.number().min(0).max(1),
  why: z.string(),
  product: ProductSummary,
});
export type ResolveCandidate = z.infer<typeof ResolveCandidate>;
export const ResolveResponse = z.object({
  outcome: z.enum(['match', 'candidates', 'unknown', 'not_skincare']),
  resolver: z.enum(['catalog', 'claude']),
  store: Store,
  extractedTitle: z.string().nullable(),
  isSkincare: z.boolean(),
  candidates: z.array(ResolveCandidate).max(3),
  catalogCount: z.number().int(),
  ledger: HowThisWasMade,
});
export type ResolveResponse = z.infer<typeof ResolveResponse>;

// POST /v1/label-ocr
export const LabelOcrRequest = z.object({
  imageBase64: z.string(),
  mediaType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});
export type LabelOcrRequest = z.infer<typeof LabelOcrRequest>;
export const OcrToken = z.object({
  raw: z.string(),
  cosingName: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  uncertain: z.boolean(),
});
export type OcrToken = z.infer<typeof OcrToken>;
export const LabelOcrResponse = z.object({
  tokens: z.array(OcrToken),
  unreadableRegions: z.number().int().nonnegative(),
  ledger: HowThisWasMade,
});
export type LabelOcrResponse = z.infer<typeof LabelOcrResponse>;

// POST /v1/label-check  (deterministic, no Claude on the path)
export const LabelCheckItem = z.object({
  id: z.string(),
  title: z.string().optional(),
  claims: z.array(Claim),
  inci: z.union([z.array(InciToken), z.array(z.string())]),
});
export type LabelCheckItem = z.infer<typeof LabelCheckItem>;
export const LabelCheckRequest = z.object({
  items: z.array(LabelCheckItem).min(1).max(500),
  includeProfiles: z.boolean().default(false),
});
export type LabelCheckRequest = z.infer<typeof LabelCheckRequest>;
export const LabelCheckResult = z.object({
  id: z.string(),
  hits: z.array(LabelCheckHit),
  medicineToken: z.string().optional(),
  profileFlags: z.array(z.object({ profileId: z.string(), label: VerdictLabel, ruleIds: z.array(z.string()) })).optional(),
});
export type LabelCheckResult = z.infer<typeof LabelCheckResult>;
export const LabelCheckResponse = z.object({ rulesetHash: z.string(), results: z.array(LabelCheckResult) });
export type LabelCheckResponse = z.infer<typeof LabelCheckResponse>;

// GET /v1/rules
export const RulesResponse = z.object({
  rulesetHash: z.string(),
  rules: z.array(Rule),
  bandCutoffs: BandCutoffs,
  profiles: z.array(ReadingProfile),
  facetMap: z.array(FacetMapping),
  banner: z.string(),
});
export type RulesResponse = z.infer<typeof RulesResponse>;

// GET /v1/catalog/search?q=&category=&tinted=&limit=
export const CatalogSearchQuery = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  tinted: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type CatalogSearchQuery = z.infer<typeof CatalogSearchQuery>;
export const CatalogSearchResponse = z.object({
  catalogCount: z.number().int(),
  results: z.array(ProductSummary),
});
export type CatalogSearchResponse = z.infer<typeof CatalogSearchResponse>;

// GET /v1/catalog/:id
export const CatalogProductResponse = z.object({ product: CatalogProduct });
export type CatalogProductResponse = z.infer<typeof CatalogProductResponse>;

/** Payload carried by the web /r/:token page (base64url JSON). No face data. */
export const SharedResult = z.object({
  v: z.literal(1),
  productId: z.string(),
  label: VerdictLabel,
  ruleIds: z.array(z.string()),
  scanDate: z.string().nullable(),
  rulesetHash: z.string(),
});
export type SharedResult = z.infer<typeof SharedResult>;

export const routes = {
  scanStart: { method: 'POST', path: '/v1/scan/start', req: ScanStartRequest, res: ScanStartResponse },
  scanSubmit: { method: 'POST', path: '/v1/scan/submit', req: ScanSubmitRequest, res: ScanStatusResponse },
  scanStatus: { method: 'GET', path: '/v1/scan/:id', res: ScanStatusResponse },
  tryonStart: { method: 'POST', path: '/v1/tryon', req: TryonStartRequest, res: TryonStartResponse },
  tryonSubmit: { method: 'POST', path: '/v1/tryon/:id/submit', res: TryonStatusResponse },
  tryonStatus: { method: 'GET', path: '/v1/tryon/:id', res: TryonStatusResponse },
  resolve: { method: 'POST', path: '/v1/resolve', req: ResolveRequest, res: ResolveResponse },
  labelOcr: { method: 'POST', path: '/v1/label-ocr', req: LabelOcrRequest, res: LabelOcrResponse },
  labelCheck: { method: 'POST', path: '/v1/label-check', req: LabelCheckRequest, res: LabelCheckResponse },
  rules: { method: 'GET', path: '/v1/rules', res: RulesResponse },
  catalogSearch: { method: 'GET', path: '/v1/catalog/search', query: CatalogSearchQuery, res: CatalogSearchResponse },
  catalogProduct: { method: 'GET', path: '/v1/catalog/:id', res: CatalogProductResponse },
} as const;
export type RouteName = keyof typeof routes;
