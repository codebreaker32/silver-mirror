import { describe, expect, it } from 'vitest';
import { DEMO_KEY, KeyProfile } from '@skinkey/contracts';
import { applyBandEdit, bandA11yLabel, formatScanDate, glyphFromKey, isExpired, parseStoredKey, zoneCaption } from './model';

const key = (over: Partial<KeyProfile> = {}): KeyProfile =>
  KeyProfile.parse({ ...DEMO_KEY, source: 'youcam_hd', scanDate: '2026-11-01T12:00:00.000Z', expiresAt: '2026-12-01T12:00:00.000Z', ...over });

describe('key model', () => {
  it('formats scan dates as "1 Nov"', () => {
    expect(formatScanDate('2026-11-01T12:00:00.000Z')).toBe('1 Nov');
  });

  it('expires after expiresAt', () => {
    expect(isExpired(key(), new Date('2026-11-15T00:00:00Z'))).toBe(false);
    expect(isExpired(key(), new Date('2026-12-02T00:00:00Z'))).toBe(true);
  });

  it('rejects malformed or tampered stored keys', () => {
    expect(parseStoredKey(null)).toBeNull();
    expect(parseStoredKey('{nope')).toBeNull();
    expect(parseStoredKey(JSON.stringify({ ...key(), version: 2 }))).toBeNull();
    expect(parseStoredKey(JSON.stringify(key()))?.scanDate).toBe('2026-11-01T12:00:00.000Z');
  });

  it('marks an edited band self-reported and keeps the measured level', () => {
    const edited = applyBandEdit(key(), 'oiliness', 'Low');
    expect(edited.bands.oiliness).toMatchObject({ level: 'Low', selfReported: true, measuredLevel: 'High' });
    expect(edited.selfReported).toEqual(['oiliness']);
    const twice = applyBandEdit(edited, 'oiliness', 'Medium');
    expect(twice.bands.oiliness.measuredLevel).toBe('High');
    expect(twice.selfReported).toEqual(['oiliness']);
  });

  it('clears self-reported when the edit returns to the measured band', () => {
    const back = applyBandEdit(applyBandEdit(key(), 'moisture', 'Low'), 'moisture', 'Medium');
    expect(back.bands.moisture).toMatchObject({ level: 'Medium', selfReported: false });
    expect(back.selfReported).toEqual([]);
  });

  it('builds a photo-free glyph from pore sub-regions (copy set B)', () => {
    const g = glyphFromKey(key());
    expect(g.zones).toEqual({ forehead: 'Medium', nose: 'High', leftCheek: 'Medium', rightCheek: 'Medium', chin: null });
    expect(g.lines[0]).toBe('Oiliness reading: High (whole face, scan 1 Nov)');
    expect(g.lines).toContain('Nose pore reading: High');
    expect(g.lines.join(' ')).not.toMatch(/T-zone/);
    expect(g.accessibilityLabel).toMatch(/nose high/);
  });

  it('never calls the Demo reading a scan', () => {
    const g = glyphFromKey(key({ source: 'demo' }));
    expect(g.lines[0]).toBe('Oiliness reading: High (whole face, sample reading)');
    expect(zoneCaption(key({ source: 'demo' }))).toBe('Sample zones · Demo reading · no photo taken');
    expect(zoneCaption(key())).toBe('Zones from your 1 Nov scan · no photo kept');
  });

  it('uses zone labels only for copy set A', () => {
    const a = glyphFromKey(key({ copySet: 'A', zones: { t_zone: 'Oily', u_zone: 'Normal' } }));
    expect(a.lines.slice(0, 2)).toEqual(['T-zone reading: Oily (scan 1 Nov)', 'U-zone reading: Normal (scan 1 Nov)']);
    const b = glyphFromKey(key({ copySet: 'B', zones: { t_zone: 'Oily' } }));
    expect(b.lines.join(' ')).not.toMatch(/T-zone/);
  });

  it('falls back to whole-face oiliness when no pore regions exist', () => {
    const g = glyphFromKey(key({ pores: {} }));
    expect(Object.values(g.zones).every((z) => z === 'High')).toBe(true);
  });

  it('labels bands in text, never numbers', () => {
    const label = bandA11yLabel('oiliness', applyBandEdit(key(), 'oiliness', 'Low'));
    expect(label).toBe('Oiliness reading: low, self-reported, not measured.');
    expect(label).not.toMatch(/\d/);
  });
});
