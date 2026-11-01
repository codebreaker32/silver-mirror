import { describe, expect, it } from 'vitest';
import { DEMO_KEY, KeyProfile } from '@skinkey/contracts';
import { createKeyStore, memoryBackend, NoKeyError, STORAGE_KEYS } from './store';

const real = KeyProfile.parse({
  ...DEMO_KEY,
  source: 'youcam_hd',
  scanId: 'scan_1',
  scanDate: '2026-11-01T12:00:00.000Z',
  expiresAt: '2026-12-01T12:00:00.000Z',
});
const consent = { version: 'scan-v1', adult: true as const, acceptedAt: '2026-11-01T12:00:00.000Z' };
const ledger = { mock: true, entries: [], files: [], totalUnits: 16, totalLatencyMs: 1000 };

describe('key store', () => {
  it('saves, loads and deletes the Key', async () => {
    const kv = memoryBackend();
    const store = createKeyStore(kv, () => new Date('2026-11-02T00:00:00Z'));
    await store.setDemo(true);
    await store.saveKey(real);
    expect(await store.isDemo()).toBe(false);
    expect(await store.loadKey()).toEqual(real);
    await store.saveScanLedger(ledger);
    await store.deleteKey();
    expect(await store.loadKey()).toBeNull();
    expect(kv.data.has(STORAGE_KEYS.scanLedger)).toBe(false);
  });

  it('drops an expired Key on load', async () => {
    const kv = memoryBackend();
    await createKeyStore(kv).saveKey(real);
    const later = createKeyStore(kv, () => new Date('2027-01-01T00:00:00Z'));
    expect(await later.loadKey()).toBeNull();
    expect(kv.data.has(STORAGE_KEYS.key)).toBe(false);
  });

  it('stores nothing but the KeyProfile fields', async () => {
    const kv = memoryBackend();
    await createKeyStore(kv).saveKey({ ...real, overlayJpegBase64: 'abc' } as KeyProfile);
    expect(kv.data.get(STORAGE_KEYS.key)).not.toContain('abc');
  });

  it('persists band edits', async () => {
    const kv = memoryBackend();
    const store = createKeyStore(kv, () => new Date('2026-11-02T00:00:00Z'));
    await expect(store.editBand('redness', 'High')).rejects.toBeInstanceOf(NoKeyError);
    await store.saveKey(real);
    await store.editBand('redness', 'High');
    expect((await store.loadKey())?.bands.redness).toMatchObject({ level: 'High', selfReported: true });
  });

  it('withdraw consent removes Key, consent, ledger and demo flag', async () => {
    const kv = memoryBackend();
    const store = createKeyStore(kv, () => new Date('2026-11-02T00:00:00Z'));
    await store.saveKey(real);
    await store.saveConsent(consent);
    await store.saveScanLedger(ledger);
    await store.setDemo(true);
    expect(await store.loadConsent()).toEqual(consent);
    await store.withdrawConsent();
    expect(kv.data.size).toBe(0);
  });

  it('rejects consent without the 18+ confirmation', async () => {
    const store = createKeyStore(memoryBackend());
    await expect(store.saveConsent({ ...consent, adult: false } as never)).rejects.toThrow();
  });

  it('round-trips the coach mark and scan ledger', async () => {
    const store = createKeyStore(memoryBackend());
    expect(await store.coachSeen()).toBe(false);
    await store.markCoachSeen();
    expect(await store.coachSeen()).toBe(true);
    await store.saveScanLedger(ledger);
    expect(await store.loadScanLedger()).toEqual(ledger);
  });
});
