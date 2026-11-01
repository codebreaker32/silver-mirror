import { COPY, type YouCamErrorCode } from '@skinkey/contracts';

export const CAPTURE_TIPS = ['Fill the oval with your face', 'Look straight ahead', 'Find even light'] as const;

export const LIGHT_HINT = COPY.captureDark;

const HINTS: Record<YouCamErrorCode, string> = {
  error_src_face_too_small: COPY.captureTooSmall,
  error_lighting_dark: COPY.captureDark,
  error_no_face: 'Fit your face inside the oval',
  error_pose: 'Look straight ahead',
  error_exceed_max_image_size: 'That photo was too large. Take it again.',
  unknown: 'That photo did not work. Take it again.',
};

export function isYouCamErrorCode(v: unknown): v is YouCamErrorCode {
  return typeof v === 'string' && v in HINTS;
}

export function hintForError(code: string | undefined | null): string | null {
  if (!code) return null;
  return isYouCamErrorCode(code) ? HINTS[code] : HINTS.unknown;
}

export function isRetakeError(code: YouCamErrorCode): boolean {
  return code !== 'unknown';
}
