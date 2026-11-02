import { Hono, type Context } from 'hono';
import { base64ToBytes } from '../lib/b64';
import { MOCK_JPEG_BASE64, type MockAsset } from './assets';
import credit from './fixtures/credit.json';
import featureCost from './fixtures/feature-cost.json';
import spikeG5Foundation from './fixtures/spike-g5-foundation.json';
import skinHdOily from './fixtures/skin-analysis-hd-oily.synthetic.json';
import skinHd from './fixtures/skin-analysis-hd.json';
import skinTone from './fixtures/skin-tone.json';

/** Real G5 makeup-vto result (spikes/g5_foundation_deep.json, signed URL redacted). */
const makeupVto = spikeG5Foundation.result;

/**
 * Mock YouCam server. Mirrors the s2s paths (docs/youcam/md: file_post, sa21_post/sa21_get, makeup VTO, face tone, yce.html task/delete)
 * and replays fixtures recorded from the 2026-11-01 spikes. Tests and agents use this; it never touches the real API.
 *
 * Scenarios ride on the uploaded file name: `mock-<scenario>.jpg`.
 *   oily | slow | error_src_face_too_small | error_lighting_dark | error_no_face | error_face_position_too_small | create_400 | delete_fail | expired
 * `expired`: the task answers 400 InvalidTaskId ("doesn't exist, or the task has expired") once it would have finished, before any delete.
 */
export const MOCK_ORIGIN = 'https://mock.youcam.local';

export interface MockOptions {
  /** GETs that report `running` before a task succeeds. */
  pollsUntilDone?: number;
  /** GETs after a delete that still return the result (G0: deletes are eventually consistent). */
  deleteLagGets?: number;
}

type Kind = 'skin_analysis' | 'skin_tone' | 'makeup_vto';

interface MockFile {
  id: string;
  name: string;
  size: number;
  uploaded: boolean;
  deleted: boolean;
  scenario: string | null;
}

interface MockTask {
  id: string;
  kind: Kind;
  fileId: string | null;
  scenario: string | null;
  polls: number;
  deleted: boolean;
  deleteGets: number;
  inputMissing: boolean;
  asset: MockAsset;
  body: Record<string, unknown>;
}

export class MockYouCamState {
  files = new Map<string, MockFile>();
  tasks = new Map<string, MockTask>();
  calls: Array<{ method: string; path: string; status: number }> = [];
  seq = 0;
  reset() {
    this.files.clear();
    this.tasks.clear();
    this.calls = [];
  }
  nextId(prefix: string) {
    this.seq += 1;
    return `${prefix}_${this.seq.toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

const HD = new Set(['hd_skin_type', 'hd_oiliness', 'hd_moisture', 'hd_redness', 'hd_pore', 'hd_wrinkle', 'hd_texture', 'hd_acne', 'hd_age_spot', 'hd_radiance', 'hd_eye_bag', 'hd_dark_circle', 'hd_firmness', 'hd_droopy_upper_eyelid', 'hd_droopy_lower_eyelid', 'hd_tear_trough']);
const SD = new Set(['skin_type', 'oiliness', 'moisture', 'redness', 'pore', 'wrinkle', 'texture', 'acne', 'age_spot', 'radiance', 'eye_bag', 'dark_circle_v2', 'firmness', 'droopy_upper_eyelid', 'droopy_lower_eyelid', 'tear_trough']);
const LIP_TEXTURES = new Set(['matte', 'gloss', 'holographic', 'metallic', 'satin', 'sheer', 'shimmer']);
const NEEDS_GLOSS = new Set(['gloss', 'holographic', 'metallic', 'sheer', 'shimmer']);
const NEEDS_TRANSPARENCY = new Set(['gloss', 'sheer', 'shimmer']);
const LIP_SHAPES = new Set(['original', 'heart-shaped', 'full', 'thin', 'wide', 'round']);
const HEX = /^#[0-9a-fA-F]{6}$/;
const pct = (v: unknown) => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 100;

const scenarioOf = (name: string) => /^mock-([a-z0-9_]+)\.jpe?g$/i.exec(name)?.[1] ?? null;

const baseOf = (c: Context) => {
  const u = new URL(c.req.url);
  return u.origin + (u.pathname.startsWith('/mock-youcam') ? '/mock-youcam' : '');
};

const fill = (fixture: unknown, assets: string) => JSON.parse(JSON.stringify(fixture).replaceAll('{{assets}}', assets));

const strip = <T extends { _source?: string }>(f: T) => {
  const { _source, ...rest } = f;
  return rest;
};

const validateVto = (body: Record<string, unknown>): string | null => {
  if (body.version !== '1.0') return 'version must be "1.0"';
  const effects = body.effects;
  if (!Array.isArray(effects) || effects.length === 0) return 'effects required';
  for (const e of effects as Array<Record<string, unknown>>) {
    if (e.category === 'skin_smooth') {
      if (!pct(e.skinSmoothStrength) || !pct(e.skinSmoothColorIntensity)) return 'skin_smooth intensities must be 0..100';
      continue;
    }
    const palettes = e.palettes as Array<Record<string, unknown>> | undefined;
    if (!Array.isArray(palettes) || palettes.length === 0) return `${String(e.category)} palettes required`;
    for (const p of palettes) {
      if (typeof p.color !== 'string' || !HEX.test(p.color)) return 'palette color must be #RRGGBB';
      if (!pct(p.colorIntensity)) return 'colorIntensity must be 0..100';
    }
    if (e.category === 'foundation') {
      for (const p of palettes) if (!pct(p.glowIntensity) || !pct(p.coverageIntensity)) return 'foundation glow/coverage must be 0..100';
    } else if (e.category === 'lip_color') {
      const shape = e.shape as { name?: string } | undefined;
      if (!shape?.name || !LIP_SHAPES.has(shape.name)) return 'shape.name must be a label from lipshape.json';
      const style = e.style as { type?: string } | undefined;
      if (!style?.type || !['full', 'ombre', 'twoTone'].includes(style.type)) return 'style.type must be full|ombre|twoTone';
      for (const p of palettes) {
        const texture = String(p.texture);
        if (!LIP_TEXTURES.has(texture)) return 'invalid texture';
        if (NEEDS_GLOSS.has(texture) && !pct(p.gloss)) return `gloss required for ${texture}`;
        if (NEEDS_TRANSPARENCY.has(texture) && !pct(p.transparencyIntensity)) return `transparencyIntensity required for ${texture}`;
      }
    } else return `unsupported category ${String(e.category)}`;
  }
  return null;
};

export const createMockYouCam = (options: MockOptions = {}) => {
  const state = new MockYouCamState();
  const pollsUntilDone = options.pollsUntilDone ?? 1;
  const deleteLagGets = options.deleteLagGets ?? 1;
  const app = new Hono();

  app.use('*', async (c, next) => {
    await next();
    state.calls.push({ method: c.req.method, path: new URL(c.req.url).pathname.replace(/^\/mock-youcam/, ''), status: c.res.status });
    if (state.calls.length > 500) state.calls.splice(0, state.calls.length - 500);
  });

  app.use('/s2s/*', async (c, next) => {
    const auth = c.req.header('authorization') ?? '';
    if (!/^Bearer \S+/.test(auth)) return c.json({ status: 401, error: 'Invalid API key' }, 401);
    await next();
  });

  const invalid = (c: Context, error: string, error_code = 'InvalidParameters') => c.json({ status: 400, error, error_code }, 400);

  app.post('/s2s/v2.0/file', async (c) => {
    const body = await c.req.json<{ files?: Array<{ content_type?: string; file_name?: string; file_size?: number }> }>().catch(() => ({}) as never);
    const f = body?.files?.[0];
    if (!f?.content_type || !f.file_name || !Number.isInteger(f.file_size)) return invalid(c, 'Invalid parameter value');
    if (f.file_size! > 10_000_000) return invalid(c, 'exceed_max_filesize');
    const id = state.nextId('file');
    state.files.set(id, { id, name: f.file_name, size: f.file_size!, uploaded: false, deleted: false, scenario: scenarioOf(f.file_name) });
    return c.json({
      status: 200,
      data: {
        files: [
          {
            content_type: f.content_type,
            file_name: f.file_name,
            file_id: id,
            requests: [
              { method: 'PUT', url: `${baseOf(c)}/upload/${id}`, headers: { 'Content-Type': f.content_type, 'Content-Length': f.file_size } },
            ],
          },
        ],
      },
    });
  });

  app.put('/upload/:fileId', async (c) => {
    const file = state.files.get(c.req.param('fileId'));
    if (!file) return c.text('NoSuchUpload', 404);
    await c.req.arrayBuffer();
    file.uploaded = true;
    return c.body(null, 200);
  });

  const createTask = (kind: Kind) => async (c: Context) => {
    const body = await c.req.json<Record<string, unknown>>().catch(() => null);
    if (!body) return invalid(c, 'Unexpected request parameter', 'BadRequest');
    const fileId = typeof body.src_file_id === 'string' ? body.src_file_id : null;
    if (!fileId && typeof body.src_file_url !== 'string') return invalid(c, 'src_file_id or src_file_url required');
    const file = fileId ? state.files.get(fileId) : undefined;
    if (fileId && !file) return invalid(c, 'Invalid src_file_id');
    if (file?.scenario === 'create_400') return c.json({ status: 400, error: 'The operation could not be completed', error_code: 'CreditInsufficiency' }, 400);
    if (kind === 'skin_analysis') {
      const actions = body.dst_actions;
      if (!Array.isArray(actions) || actions.length === 0) return invalid(c, 'dst_actions required');
      const unknown = actions.find((a) => !HD.has(a) && !SD.has(a));
      if (unknown) return invalid(c, `Not available dst_action ${String(unknown)}`);
      if (actions.some((a) => HD.has(a)) && actions.some((a) => SD.has(a))) return invalid(c, 'cannot mix HD and SD dst_actions');
    }
    if (kind === 'makeup_vto') {
      const problem = validateVto(body);
      if (problem) return invalid(c, problem);
    }
    const id = state.nextId(kind);
    const renders = [...state.tasks.values()].filter((t) => t.kind === 'makeup_vto').length;
    state.tasks.set(id, {
      id,
      kind,
      fileId,
      scenario: file?.scenario ?? null,
      polls: 0,
      deleted: false,
      deleteGets: 0,
      inputMissing: Boolean(file && (!file.uploaded || file.deleted)),
      asset: kind === 'makeup_vto' ? (renders % 2 ? 'render_b' : 'render_a') : 'overlay',
      body,
    });
    return c.json({ status: 200, data: { task_id: id } });
  };

  const result = (task: MockTask, assets: string) => {
    if (task.kind === 'skin_analysis') {
      if (task.body.format !== 'json') return { status: 200, data: { error: null, task_status: 'success', results: { url: `${assets}/result.zip` } } };
      return fill(strip(task.scenario === 'oily' ? skinHdOily : skinHd), assets);
    }
    if (task.kind === 'skin_tone') return strip(skinTone);
    return fill(makeupVto, assets);
  };

  const getTask = (kind: Kind) => (c: Context) => {
    const task = state.tasks.get(c.req.param('taskId') ?? '');
    if (!task || task.kind !== kind) return c.json({ status: 400, error: 'Invalid task ID', error_code: 'InvalidTaskId' }, 400);
    if (task.deleted) {
      task.deleteGets += 1;
      if (task.deleteGets > deleteLagGets)
        return c.json({ status: 400, error: "This task ID doesn't exist, or the task has expired", error_code: 'InvalidTaskId' }, 400);
    }
    task.polls += 1;
    const needed = task.scenario === 'slow' ? 3 : pollsUntilDone;
    if (task.polls <= needed && !task.deleted) return c.json({ status: 200, data: { task_status: 'running' } });
    if (task.scenario === 'expired' && !task.deleted)
      return c.json({ status: 400, error: "This task ID doesn't exist, or the task has expired", error_code: 'InvalidTaskId' }, 400);
    if (task.inputMissing)
      return c.json({ status: 200, data: { task_status: 'error', error: 'error_download_image', error_message: 'Download source image error' } });
    const engineError = task.scenario?.startsWith('error_') ? task.scenario : null;
    if (engineError) {
      const code = task.kind === 'skin_analysis' ? engineError : engineError.replace('error_src_face_too_small', 'error_face_position_too_small');
      return c.json({ status: 200, data: { task_status: 'error', error: code, error_message: code } });
    }
    return c.json(result(task, `${baseOf(c)}/assets/${task.id}`));
  };

  app.post('/s2s/v2.1/task/skin-analysis', createTask('skin_analysis'));
  app.get('/s2s/v2.1/task/skin-analysis/:taskId', getTask('skin_analysis'));
  app.post('/s2s/v2.0/task/skin-tone-analysis', createTask('skin_tone'));
  app.get('/s2s/v2.0/task/skin-tone-analysis/:taskId', getTask('skin_tone'));
  app.post('/s2s/v2.0/task/makeup-vto', createTask('makeup_vto'));
  app.get('/s2s/v2.0/task/makeup-vto/:taskId', getTask('makeup_vto'));

  app.post('/s2s/v2.0/task/delete', async (c) => {
    const body = await c.req.json<{ task_id?: string }>().catch(() => ({}) as { task_id?: string });
    if (!body.task_id) return invalid(c, 'task_id is missing');
    const task = state.tasks.get(body.task_id);
    if (!task || task.scenario === 'expired' || (task.deleted && task.deleteGets > deleteLagGets)) return invalid(c, 'No matching task', 'InvalidTaskId');
    const needed = task.scenario === 'slow' ? 3 : pollsUntilDone;
    if (task.polls <= needed) return invalid(c, 'The task has not finished yet and cannot be deleted', 'OperationInvalid');
    if (task.scenario === 'delete_fail') return invalid(c, 'Operation not supported', 'OperationNotSupport');
    task.deleted = true;
    const file = task.fileId ? state.files.get(task.fileId) : undefined;
    if (file) file.deleted = true;
    return c.json({ status: 200 });
  });

  app.get('/s2s/v1.0/client/credit', (c) => c.json(strip(credit)));
  app.get('/s2s/v2.0/credit/feature-cost', (c) => c.json(strip(featureCost)));

  app.get('/assets/:taskId/:name', (c) => {
    const task = state.tasks.get(c.req.param('taskId'));
    if (!task || task.deleted) return c.text('NoSuchKey', 404);
    if (!c.req.param('name').endsWith('.jpg')) return c.text('NoSuchKey', 404);
    return c.body(base64ToBytes(MOCK_JPEG_BASE64[task.asset]), 200, { 'content-type': 'image/jpeg' });
  });

  app.post('/__reset', (c) => {
    state.reset();
    return c.json({ ok: true });
  });

  app.all('*', (c) => c.json({ status: 404, error: 'mock: no such endpoint' }, 404));

  const fetch = (input: string, init?: RequestInit) => {
    const u = new URL(input);
    return Promise.resolve(app.request(`${MOCK_ORIGIN}${u.pathname.replace(/^\/mock-youcam/, '')}${u.search}`, init));
  };

  return { app, state, fetch };
};

/** Shared instance: mounted at /mock-youcam for the phone's PUT and used in-process by the Worker in mock mode. */
export const sharedMock = createMockYouCam();
export const mockYouCam = sharedMock.app;
