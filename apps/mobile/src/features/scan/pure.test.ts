import { describe, expect, it } from 'vitest';
import { COPY } from '@skinkey/contracts';
import { hintForError, LIGHT_HINT } from './captureHints';
import { makeConsent, SCAN_CONSENT_VERSION } from './consent';
import { deleteStateLabel } from './deleteCopy';
import { friendlyError } from './errors';
import { isImagePath } from './imageFiles';
import { meetsShortSide, needsDownscale, pickPictureSize } from './pictureSize';
import { activeStepAnnouncement, scanDisplaySteps, tryonDisplaySteps } from './steps';

describe('pickPictureSize', () => {
  it('picks the smallest 4:3 size with a short side of at least 1080', () => {
    expect(pickPictureSize(['640x480', '1280x720', '1920x1080', '1440x1080', '4032x3024', '2048x1536'])).toBe('1440x1080');
  });
  it('accepts 16:9 when no 4:3 qualifies', () => {
    expect(pickPictureSize(['640x480', '1920x1080', '3840x2160'])).toBe('1920x1080');
  });
  it('falls back to the largest when nothing reaches 1080', () => {
    expect(pickPictureSize(['640x480', '1280x720'])).toBe('1280x720');
  });
  it('ignores presets it cannot parse', () => {
    expect(pickPictureSize(['Photo', 'High'])).toBeUndefined();
  });
  it('checks size limits', () => {
    expect(needsDownscale(4032, 3024)).toBe(false);
    expect(needsDownscale(8000, 6000)).toBe(true);
    expect(meetsShortSide(1440, 1080)).toBe(true);
    expect(meetsShortSide(1280, 720)).toBe(false);
  });
});

describe('capture hints', () => {
  it('maps YouCam error codes to the spec copy', () => {
    expect(hintForError('error_src_face_too_small')).toBe('Move closer so your face fills the oval');
    expect(hintForError('error_lighting_dark')).toBe('Face a window or a lamp');
    expect(hintForError('error_something_new')).toMatch(/Take it again/);
    expect(hintForError(undefined)).toBeNull();
    expect(LIGHT_HINT).toBe(COPY.captureDark);
  });
});

describe('consent', () => {
  it('requires the 18+ box', () => {
    expect(() => makeConsent(SCAN_CONSENT_VERSION, false)).toThrow();
    expect(makeConsent(SCAN_CONSENT_VERSION, true, new Date('2026-11-01T00:00:00Z'))).toEqual({
      version: 'scan-v1',
      adult: true,
      acceptedAt: '2026-11-01T00:00:00.000Z',
    });
  });
});

describe('steps', () => {
  it('shows the four scan steps with spec labels before the server answers', () => {
    const steps = scanDisplaySteps(undefined, 'active');
    expect(steps.map((s) => s.label)).toEqual(['Uploading', 'Analysing (HD)', 'Reading results', 'Deleting from YouCam']);
    expect(steps.map((s) => s.state)).toEqual(['active', 'pending', 'pending', 'pending']);
  });

  it('ticks the delete step only when YouCam confirmed it', () => {
    const server = (['upload', 'analyse', 'read', 'delete'] as const).map((id) => ({ id, state: 'done' as const, label: id }));
    expect(scanDisplaySteps(server, 'done', 'deleted')[3]).toMatchObject({ label: 'Deleting from YouCam ✓', state: 'done' });
    const failed = scanDisplaySteps(server.map((s) => (s.id === 'delete' ? { ...s, state: 'failed' as const } : s)), 'done', 'delete_failed')[3];
    expect(failed).toMatchObject({ label: 'Deleting from YouCam', detail: COPY.deleteFailed });
    expect(scanDisplaySteps(server, 'done', 'orphan')[3]?.detail).toBe(COPY.orphanUpload);
  });

  it('hides the tone step for single-shade try-ons', () => {
    expect(tryonDisplaySteps(undefined, 'active', 'single', undefined).map((s) => s.id)).toEqual(['upload', 'render', 'delete']);
    expect(tryonDisplaySteps(undefined, 'active', 'multi', undefined).map((s) => s.label)).toEqual([
      'Uploading',
      'Reading skin tone (YouCam)',
      'Rendering 2 shades (YouCam)',
      'Deleting from YouCam',
    ]);
  });

  it('announces the active step', () => {
    expect(activeStepAnnouncement(scanDisplaySteps(undefined, 'active'))).toBe('Step 1 of 4, Uploading.');
  });
});

describe('delete copy and errors', () => {
  it('labels delete states', () => {
    expect(deleteStateLabel('deleted')).toBe('Deleted from YouCam ✓');
    expect(deleteStateLabel('delete_failed')).toBe(COPY.deleteFailed);
    expect(deleteStateLabel('orphan')).toContain(COPY.orphanUpload);
  });
  it('maps worker errors to calm copy', () => {
    expect(friendlyError({ status: 429, body: { error: { code: 'cap_reached', message: 'x' } } }, 'scan').retryable).toBe(false);
    expect(friendlyError(new TypeError('Network request failed'), 'scan').title).toBe('You need a connection to scan');
    expect(friendlyError({ status: 500, body: null }, 'tryon').title).toBe('Something went wrong');
  });
  it('detects image files for the cache check', () => {
    expect(isImagePath('file:///cache/Camera/abc.jpg')).toBe(true);
    expect(isImagePath('file:///cache/x.WEBP')).toBe(true);
    expect(isImagePath('file:///cache/http-cache/index.json')).toBe(false);
  });
});
