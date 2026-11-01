import type { SharedResult } from '@skinkey/contracts';
import { describe, expect, it } from 'vitest';
import { decodeSharedResult, encodeSharedResult } from './share';

const sample: SharedResult = { v: 1, productId: 'foxtale-oil-balancing', label: 'CAUTION', ruleIds: ['OCC-2', 'LC-1a'], scanDate: '2026-11-01T00:00:00.000Z', rulesetHash: 'abc123' };

describe('shared result token', () => {
  it('round-trips through a URL-safe token', () => {
    const token = encodeSharedResult(sample);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeSharedResult(token)).toEqual(sample);
  });

  it('keeps non-ASCII product ids intact', () => {
    const r = { ...sample, productId: 'crème-ñ-₹' };
    expect(decodeSharedResult(encodeSharedResult(r))?.productId).toBe('crème-ñ-₹');
  });

  it('returns null for damaged or foreign tokens', () => {
    expect(decodeSharedResult('not-a-token')).toBeNull();
    expect(decodeSharedResult(encodeSharedResult(sample).slice(0, 12))).toBeNull();
    expect(decodeSharedResult(btoa(JSON.stringify({ v: 2 })))).toBeNull();
  });

  it('carries no readings or photo fields', () => {
    const decoded = decodeSharedResult(encodeSharedResult({ ...sample, bands: { oiliness: 'High' } } as never));
    expect(decoded && 'bands' in decoded).toBe(false);
  });
});
