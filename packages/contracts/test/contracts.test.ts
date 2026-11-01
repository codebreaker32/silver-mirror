import { describe, expect, it } from 'vitest';
import { DEMO_KEY, KeyProfile, RawScoreReading, routes } from '../src';

describe('contracts', () => {
  it('DEMO_KEY is a valid KeyProfile', () => {
    expect(KeyProfile.parse(DEMO_KEY).source).toBe('demo');
  });

  it('RawScoreReading rejects ui_score', () => {
    expect(RawScoreReading.safeParse({ type: 'hd_oiliness', raw_score: 50, ui_score: 60 }).success).toBe(false);
  });

  it('every route path is versioned', () => {
    for (const r of Object.values(routes)) expect(r.path.startsWith('/v1/')).toBe(true);
  });
});
