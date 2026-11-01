import { describe, expect, it } from 'vitest';
import { KeyProfile, type RawScoreReading } from '@skinkey/contracts';
import { BAND_CUTOFFS, applySelfReport, bandFor, buildKeyProfile, deriveSkinType, isKeyExpired } from '../src';

const readings: RawScoreReading[] = [
  { type: 'hd_oiliness', raw_score: 25 },
  { type: 'hd_moisture', raw_score: 30 },
  { type: 'hd_redness', raw_score: 72 },
  { type: 'hd_pore', region: 'forehead', raw_score: 79.6 },
  { type: 'hd_pore', region: 'nose', raw_score: 29.1 },
  { type: 'hd_pore', region: 'cheek', raw_score: 44.1 },
  { type: 'hd_pore', region: 'whole', raw_score: 49.2 },
  { type: 'hd_texture', region: 'whole', raw_score: 66 },
];

const build = (extra: Partial<Parameters<typeof buildKeyProfile>[0]> = {}) =>
  buildKeyProfile({ readings, scanDate: '2026-11-01T06:00:00.000Z', source: 'youcam_hd', scanId: 'scan_1', photoDeleted: true, ...extra });

describe('bandFor', () => {
  it('publishes the placeholder cutoffs and documented direction', () => {
    expect(BAND_CUTOFFS).toMatchObject({ lowBelow: 40, highFrom: 70 });
    expect(BAND_CUTOFFS.direction).toEqual({
      oiliness: 'higher_is_less_visible',
      moisture: 'higher_is_more_visible',
      redness: 'higher_is_less_visible',
      pore: 'higher_is_less_visible',
    });
  });

  it('applies the cutoffs at the boundaries', () => {
    expect(bandFor(39.99, 'moisture')).toBe('Low');
    expect(bandFor(40, 'moisture')).toBe('Medium');
    expect(bandFor(69.99, 'moisture')).toBe('Medium');
    expect(bandFor(70, 'moisture')).toBe('High');
  });

  it('inverts raw_score for concerns where higher raw means less visible', () => {
    expect(bandFor(20, 'oiliness')).toBe('High');
    expect(bandFor(85, 'oiliness')).toBe('Low');
    expect(bandFor(50, 'redness')).toBe('Medium');
  });

  it('honours an overridden direction (gate G1)', () => {
    const flipped = { ...BAND_CUTOFFS, direction: { ...BAND_CUTOFFS.direction, oiliness: 'higher_is_more_visible' as const } };
    expect(bandFor(20, 'oiliness', flipped)).toBe('Low');
  });

  it('rejects non-numbers', () => {
    expect(() => bandFor(Number.NaN, 'pore')).toThrow();
  });
});

describe('buildKeyProfile', () => {
  it('builds a valid KeyProfile with bands, pore regions and a 30-day expiry', () => {
    const key = build();
    expect(KeyProfile.parse(key)).toBeTruthy();
    expect(key.bands.oiliness.level).toBe('High');
    expect(key.bands.moisture.level).toBe('Low');
    expect(key.bands.redness.level).toBe('Low');
    expect(key.bands.pore.level).toBe('Medium');
    expect(key.pores).toEqual({ forehead: 'Low', nose: 'High', cheek: 'Medium', whole: 'Medium' });
    expect(key.expiresAt).toBe('2026-12-01T06:00:00.000Z');
    expect(key.copySet).toBe('B');
    expect(key.skinType).toEqual({ value: 'Combination', derived: true });
  });

  it('switches to copy set A only when zone labels arrive', () => {
    const key = build({ zones: { whole: 'Oily', t_zone: 'Oily', u_zone: 'Normal' } });
    expect(key.copySet).toBe('A');
    expect(key.skinType).toEqual({ value: 'Oily', derived: false });
  });

  it('keeps no numbers in the Key', () => {
    const { version, scanDate, expiresAt, ...rest } = build();
    expect(version).toBe(1);
    expect(JSON.stringify(rest)).not.toMatch(/raw_score|ui_score|:\s*-?\d/);
    expect(scanDate < expiresAt).toBe(true);
  });

  it('ui_score firewall: throws when a ui_score field reaches it', () => {
    const leaked = [...readings, { type: 'hd_oiliness', raw_score: 20, ui_score: 77 } as unknown as RawScoreReading];
    expect(() => build({ readings: leaked })).toThrow(/ui_score/);
  });

  it('throws on missing concerns', () => {
    expect(() => build({ readings: readings.filter((r) => r.type !== 'hd_redness') })).toThrow(/redness/);
  });

  it('falls back to the most visible pore region when no whole-face pore row exists', () => {
    const key = build({ readings: readings.filter((r) => !(r.type === 'hd_pore' && r.region === 'whole')) });
    expect(key.bands.pore.level).toBe('High');
  });

  it('expires after 30 days', () => {
    const key = build();
    expect(isKeyExpired(key, new Date('2026-11-30T00:00:00Z'))).toBe(false);
    expect(isKeyExpired(key, new Date('2026-12-02T00:00:00Z'))).toBe(true);
  });
});

describe('applySelfReport', () => {
  it('marks an edited band self-reported and keeps the measured level', () => {
    const key = applySelfReport(build(), 'oiliness', 'Medium');
    expect(key.bands.oiliness).toEqual({ level: 'Medium', region: 'whole', selfReported: true, measuredLevel: 'High' });
    expect(key.selfReported).toEqual(['oiliness']);
    expect(key.skinType).toEqual({ value: 'Dry', derived: true });
  });

  it('editing back to the measured level clears the flag', () => {
    const key = applySelfReport(applySelfReport(build(), 'oiliness', 'Low'), 'oiliness', 'High');
    expect(key.bands.oiliness).toEqual({ level: 'High', region: 'whole', selfReported: false });
    expect(key.selfReported).toEqual([]);
  });
});

describe('deriveSkinType (published rule for copy set B)', () => {
  it.each([
    [{ oiliness: 'High', moisture: 'Medium', redness: 'Low', pore: 'High' }, 'Oily'],
    [{ oiliness: 'High', moisture: 'Low', redness: 'Low', pore: 'High' }, 'Combination'],
    [{ oiliness: 'Low', moisture: 'Low', redness: 'High', pore: 'Low' }, 'Dry & Redness'],
    [{ oiliness: 'Medium', moisture: 'Medium', redness: 'High', pore: 'Low' }, 'Redness'],
    [{ oiliness: 'Medium', moisture: 'Medium', redness: 'Low', pore: 'Low' }, 'Normal'],
  ] as const)('%o → %s', (bands, expected) => {
    expect(deriveSkinType(bands)).toBe(expected);
  });
});

describe('bands vs the real G1 spike (spikes/g1_result.json, airbrushed sample face)', () => {
  it('maps high raw_score to LOW visible concern (higher raw = less visible concern)', () => {
    // FINDINGS G1: oiliness 99.5, pore 100, redness 96.2 on an airbrushed face → least visible concern.
    expect(bandFor(99.5, 'oiliness')).toBe('Low');
    expect(bandFor(100, 'pore')).toBe('Low');
    expect(bandFor(96.2, 'redness')).toBe('Low');
    // A low raw score means the concern is more visible.
    expect(bandFor(5, 'oiliness')).toBe('High');
    expect(bandFor(5, 'redness')).toBe('High');
  });
});
