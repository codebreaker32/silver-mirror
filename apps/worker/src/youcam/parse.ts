import {
  COPY,
  RawScoreReading,
  SkinTypeClass,
  SkinTypeZone,
  type YouCamErrorCode,
} from '@skinkey/contracts';
import type { YouCamSkinOutputRow } from './types';

const SCORED_TYPES = new Set(['hd_oiliness', 'hd_moisture', 'hd_redness', 'hd_pore']);

/**
 * The ui_score firewall (spec §3, §5): only type, region and raw_score cross the Worker boundary.
 * `all` and `skin_age` scores are discarded too (spec P2: no skin age).
 */
export const rawScoreReadings = (rows: readonly YouCamSkinOutputRow[]): RawScoreReading[] =>
  rows
    .filter((r) => SCORED_TYPES.has(r.type) && typeof r.raw_score === 'number' && Number.isFinite(r.raw_score))
    .map((r) => RawScoreReading.parse(r.region ? { type: r.type, region: r.region, raw_score: r.raw_score } : { type: r.type, raw_score: r.raw_score }));

/** G1 passed on 2026-11-01: hd_skin_type returns one class label per region (whole / t_zone / u_zone). */
export const zoneLabels = (rows: readonly YouCamSkinOutputRow[]): Partial<Record<SkinTypeZone, SkinTypeClass>> => {
  const zones: Partial<Record<SkinTypeZone, SkinTypeClass>> = {};
  for (const r of rows) {
    if (r.type !== 'hd_skin_type') continue;
    const zone = SkinTypeZone.safeParse(r.region ?? 'whole');
    const cls = SkinTypeClass.safeParse(r.skin_type);
    if (zone.success && cls.success) zones[zone.data] = cls.data;
  }
  return zones;
};

/**
 * With enable_mask_overlay:true the live API still returned one mask per concern (spikes/FINDINGS.md), so we pick one.
 * UNVERIFIED which row is the blended overlay: prefer an explicit overlay row, then the whole-face skin-type mask.
 */
export const overlayUrl = (rows: readonly YouCamSkinOutputRow[]): string | null => {
  const first = (pred: (r: YouCamSkinOutputRow) => boolean) => rows.find((r) => pred(r) && r.mask_urls?.[0])?.mask_urls?.[0];
  return (
    first((r) => r.type.includes('overlay')) ??
    first((r) => r.type === 'hd_skin_type' && (r.region ?? 'whole') === 'whole') ??
    first((r) => r.type === 'hd_oiliness') ??
    first((r) => r.type.startsWith('hd_')) ??
    null
  );
};

const POSE = /^error_(pose|face_angle|face_not_forward|face_position_invalid|face_position_out|src_face_out_of_bound|large_face_angle)/;

export const mapYouCamError = (raw: string | null | undefined): { code: YouCamErrorCode; message: string } => {
  const code = raw ?? 'unknown';
  if (code === 'error_src_face_too_small' || code === 'error_face_position_too_small')
    return { code: 'error_src_face_too_small', message: COPY.captureTooSmall };
  if (code === 'error_lighting_dark') return { code: 'error_lighting_dark', message: COPY.captureDark };
  if (code === 'error_no_face') return { code: 'error_no_face', message: 'No face found. Fill the oval and try again' };
  if (POSE.test(code)) return { code: 'error_pose', message: 'Look straight at the camera and try again' };
  if (code === 'error_exceed_max_image_size' || code === 'exceed_max_filesize' || code === 'error_below_min_image_size')
    return { code: 'error_exceed_max_image_size', message: 'This photo size did not work. Try again' };
  return { code: 'unknown', message: "YouCam couldn't read this photo. Try again" };
};
