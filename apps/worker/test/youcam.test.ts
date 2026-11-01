import { RawScoreReading } from '@skinkey/contracts';
import { describe, expect, it } from 'vitest';
import { deltaE2000, hexToLab, nearestShades } from '../src/lib/color';
import skinHd from '../src/mock/fixtures/skin-analysis-hd.json';
import { createMockYouCam } from '../src/mock';
import { makeupVtoBody, skinAnalysisBody } from '../src/youcam/bodies';
import { mapYouCamError, overlayUrl, rawScoreReadings, zoneLabels } from '../src/youcam/parse';
import type { YouCamSkinOutputRow } from '../src/youcam/types';

const rows = skinHd.data.results.output as YouCamSkinOutputRow[];

describe('HD output parsing', () => {
  it('drops ui_score, skin_age and the overall score at the Worker boundary', () => {
    const readings = rawScoreReadings(rows);
    expect(readings.length).toBe(7);
    for (const r of readings) {
      expect(Object.keys(r).sort()).toEqual(r.region ? ['raw_score', 'region', 'type'] : ['raw_score', 'type']);
      expect(() => RawScoreReading.parse(r)).not.toThrow();
    }
    expect(JSON.stringify(readings)).not.toMatch(/ui_score|skin_age|"all"/);
    expect(readings.find((r) => r.type === 'hd_oiliness')?.raw_score).toBeCloseTo(99.51, 2);
    expect(readings.filter((r) => r.type === 'hd_pore').map((r) => r.region)).toEqual(['forehead', 'nose', 'cheek', 'whole']);
  });

  it('the contract rejects any row that still carries ui_score', () => {
    expect(RawScoreReading.safeParse({ type: 'hd_oiliness', raw_score: 50, ui_score: 90 }).success).toBe(false);
  });

  it('reads zone labels from hd_skin_type (G1 pass)', () => {
    expect(zoneLabels(rows)).toEqual({ whole: 'Normal', t_zone: 'Normal', u_zone: 'Normal' });
  });

  it('picks one overlay mask', () => {
    expect(overlayUrl(rows)).toBe('{{assets}}/hd_skin_type_output.jpg');
  });

  it('maps capture errors to the fixed guide copy', () => {
    expect(mapYouCamError('error_src_face_too_small').message).toBe('Move closer so your face fills the oval');
    expect(mapYouCamError('error_lighting_dark').message).toBe('Face a window or a lamp');
    expect(mapYouCamError('error_face_position_too_small').code).toBe('error_src_face_too_small');
    expect(mapYouCamError('error_face_angle_leftward').code).toBe('error_pose');
    expect(mapYouCamError('something_new').code).toBe('unknown');
  });
});

describe('request bodies (spec §3)', () => {
  it('HD skin analysis: 5 HD concerns, mask overlay, format json', () => {
    expect(skinAnalysisBody('f1')).toEqual({
      src_file_id: 'f1',
      dst_actions: ['hd_skin_type', 'hd_oiliness', 'hd_moisture', 'hd_redness', 'hd_pore'],
      miniserver_args: { enable_mask_overlay: true },
      format: 'json',
    });
  });

  it('foundation VTO uses version 1.0, colorIntensity and a skin_smooth effect object', () => {
    expect(makeupVtoBody('f1', 'foundation', { name: 'A', hex: '#A8774F' })).toEqual({
      src_file_id: 'f1',
      version: '1.0',
      effects: [
        { category: 'foundation', palettes: [{ color: '#A8774F', colorIntensity: 60, glowIntensity: 30, coverageIntensity: 40 }] },
        { category: 'skin_smooth', skinSmoothStrength: 10, skinSmoothColorIntensity: 10 },
      ],
    });
  });

  it('lip VTO sends shape, style, gloss and transparencyIntensity for sheer', () => {
    const body = makeupVtoBody('f1', 'lip_color', { name: 'B', hex: '#B5535C' });
    expect(body.effects[0]).toEqual({
      category: 'lip_color',
      shape: { name: 'original' },
      style: { type: 'full' },
      palettes: [{ color: '#B5535C', texture: 'sheer', colorIntensity: 60, gloss: 40, transparencyIntensity: 40 }],
    });
  });
});

describe('mock YouCam', () => {
  const auth = { authorization: 'Bearer k', 'content-type': 'application/json' };
  const post = (m: ReturnType<typeof createMockYouCam>, path: string, body: unknown) =>
    m.fetch(`https://mock.youcam.local${path}`, { method: 'POST', headers: auth, body: JSON.stringify(body) });

  it('requires a bearer key', async () => {
    const m = createMockYouCam();
    expect((await m.fetch('https://mock.youcam.local/s2s/v1.0/client/credit')).status).toBe(401);
  });

  it('rejects mixed HD and SD concerns like the real API', async () => {
    const m = createMockYouCam();
    const res = await post(m, '/s2s/v2.1/task/skin-analysis', { src_file_url: 'https://x/y.jpg', dst_actions: ['hd_pore', 'pore'], format: 'json' });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: 'cannot mix HD and SD dst_actions', error_code: 'InvalidParameters' });
  });

  it('rejects a sheer lip body without transparencyIntensity', async () => {
    const m = createMockYouCam();
    const body = makeupVtoBody('x', 'lip_color', { name: 'B', hex: '#B5535C' });
    delete (body.effects[0]!.palettes![0] as Record<string, unknown>).transparencyIntensity;
    const res = await post(m, '/s2s/v2.0/task/makeup-vto', { ...body, src_file_id: undefined, src_file_url: 'https://x/y.jpg' });
    expect(res.status).toBe(400);
  });

  it('returns a zip url instead of JSON output when format is not json', async () => {
    const m = createMockYouCam({ pollsUntilDone: 0 });
    const created = (await (await post(m, '/s2s/v2.1/task/skin-analysis', { src_file_url: 'https://x/y.jpg', dst_actions: ['hd_pore'] })).json()) as {
      data: { task_id: string };
    };
    const res = await m.fetch(`https://mock.youcam.local/s2s/v2.1/task/skin-analysis/${created.data.task_id}`, { headers: auth });
    const json = (await res.json()) as { data: { results: Record<string, unknown> } };
    expect(json.data.results.output).toBeUndefined();
    expect(String(json.data.results.url)).toMatch(/result\.zip$/);
  });
});

describe('CIEDE2000 shade pick', () => {
  it('matches the Sharma et al. reference pair', () => {
    const d = deltaE2000({ L: 50, a: 2.6772, b: -79.7751 }, { L: 50, a: 0, b: -82.7485 });
    expect(d).toBeCloseTo(2.0425, 3);
  });

  it('is zero for identical colours and picks the two nearest shades', () => {
    expect(deltaE2000(hexToLab('#b9947c'), hexToLab('#B9947C'))).toBeCloseTo(0, 6);
    const picks = nearestShades('#b9947c', [
      { name: 'far', hex: '#202020' },
      { name: 'near', hex: '#B9887A' },
      { name: 'mid', hex: '#D9735B' },
      { name: 'none' },
    ]);
    expect(picks.map((p) => p.name)).toEqual(['near', 'mid']);
  });
});
