import { describe, expect, it } from 'vitest';
import { MemoryKV, kvStore } from '../src/lib/kv';
import { budget, readGlobalLedger, recordGlobal, summarise, UNIT_COSTS, wouldBreachFloor } from '../src/lib/ledger';
import { CapsLedger, issueInstallToken, verifyInstallToken } from '../src/lib/install';

const entry = (feature: 'skin_analysis_hd' | 'makeup_vto' | 'claude_resolve', units: number) => ({
  feature,
  units,
  latencyMs: 100,
  startedAt: '2026-11-01T18:00:00.000Z',
  status: 'ok' as const,
});

describe('unit ledger', () => {
  it('uses the live unit costs', () => {
    expect(UNIT_COSTS).toMatchObject({ skin_analysis_hd: 16, skin_tone: 20, makeup_vto: 1, task_delete: 0, file_upload: 0 });
  });

  it('summarises units and latency for "How this was made"', () => {
    const s = summarise(true, [entry('skin_analysis_hd', 16), entry('makeup_vto', 1)], []);
    expect(s).toMatchObject({ mock: true, totalUnits: 17, totalLatencyMs: 200 });
  });

  it('keeps mock and live totals apart and counts delete confirmations', async () => {
    const store = kvStore(new MemoryKV().asKV());
    await recordGlobal(store, false, { entry: entry('skin_analysis_hd', 16) });
    await recordGlobal(store, false, { deleteConfirmed: true });
    await recordGlobal(store, true, { entry: entry('makeup_vto', 1) });
    await recordGlobal(store, false, { entry: { ...entry('claude_resolve', 0), inputTokens: 900, outputTokens: 50 } });
    const live = await readGlobalLedger(store, false);
    expect(live).toMatchObject({ spentUnits: 16, successfulTasks: 1, deletesConfirmed: 1, claudeCalls: 1, claudeInputTokens: 900 });
    expect((await readGlobalLedger(store, true)).spentUnits).toBe(1);
  });

  it('alerts at 25% remaining and protects the floor', async () => {
    const g = { ...(await readGlobalLedger(kvStore(new MemoryKV().asKV()), false)), spentUnits: 780 };
    const b = budget(g, 1040, 50);
    expect(b).toMatchObject({ remaining: 260, alert: true });
    expect(wouldBreachFloor(b, 16)).toBe(false);
    expect(wouldBreachFloor({ ...b, remaining: 60 }, 16)).toBe(true);
  });
});

describe('install tokens and caps', () => {
  it('verifies its own HMAC and rejects tampering', async () => {
    const { installId, token } = await issueInstallToken('secret');
    expect(await verifyInstallToken('secret', token)).toBe(installId);
    expect(await verifyInstallToken('other', token)).toBeNull();
    expect(await verifyInstallToken('secret', token.replace(installId, 'someone-else'))).toBeNull();
    expect(await verifyInstallToken('secret', undefined)).toBeNull();
  });

  it('caps an install at 1 scan and 3 try-ons, with refunds', async () => {
    const caps = new CapsLedger(kvStore(new MemoryKV().asKV()), { scans: 1, tryons: 3 });
    expect(await caps.consume('i1', 'scan')).toEqual({ scansLeft: 0, tryonsLeft: 3 });
    expect(await caps.consume('i1', 'scan')).toBeNull();
    await caps.refund('i1', 'scan');
    expect(await caps.caps('i1')).toEqual({ scansLeft: 1, tryonsLeft: 3 });
    for (let i = 0; i < 3; i++) expect(await caps.consume('i1', 'tryon')).not.toBeNull();
    expect(await caps.consume('i1', 'tryon')).toBeNull();
    expect(await caps.caps('i2')).toEqual({ scansLeft: 1, tryonsLeft: 3 });
  });
});
