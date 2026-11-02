import { ConsentRecord, KeyProfile, HowThisWasMade, type Band, type Concern } from '@skinkey/contracts';
import { applyBandEdit, isExpired, parseStoredKey } from './model';

export interface KVBackend {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  del(key: string): Promise<void>;
}

export const STORAGE_KEYS = {
  key: 'skinkey.key.v1',
  consent: 'skinkey.consent.scan.v1',
  demo: 'skinkey.demo.v1',
  coach: 'skinkey.coach.share.v1',
  scanLedger: 'skinkey.ledger.scan.v1',
  install: 'skinkey.install.v1',
} as const;

export class NoKeyError extends Error {
  constructor() {
    super('No reading on this phone');
  }
}

export function createKeyStore(kv: KVBackend, now: () => Date = () => new Date()) {
  async function loadKey(): Promise<KeyProfile | null> {
    const key = parseStoredKey(await kv.get(STORAGE_KEYS.key));
    if (!key) return null;
    if (isExpired(key, now())) {
      await deleteKey();
      return null;
    }
    return key;
  }

  async function saveKey(key: KeyProfile): Promise<void> {
    const valid = KeyProfile.parse(key);
    await kv.set(STORAGE_KEYS.key, JSON.stringify(valid));
    await kv.del(STORAGE_KEYS.demo);
  }

  async function deleteKey(): Promise<void> {
    await kv.del(STORAGE_KEYS.key);
    await kv.del(STORAGE_KEYS.scanLedger);
  }

  async function editBand(concern: Concern, level: Band): Promise<KeyProfile> {
    const key = await loadKey();
    if (!key) throw new NoKeyError();
    const next = applyBandEdit(key, concern, level);
    await kv.set(STORAGE_KEYS.key, JSON.stringify(next));
    return next;
  }

  async function saveConsent(record: ConsentRecord): Promise<void> {
    await kv.set(STORAGE_KEYS.consent, JSON.stringify(ConsentRecord.parse(record)));
  }

  async function loadConsent(): Promise<ConsentRecord | null> {
    const raw = await kv.get(STORAGE_KEYS.consent);
    if (!raw) return null;
    try {
      const parsed = ConsentRecord.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }

  async function withdrawConsent(): Promise<void> {
    await deleteKey();
    await kv.del(STORAGE_KEYS.consent);
    await kv.del(STORAGE_KEYS.demo);
  }

  return {
    loadKey,
    saveKey,
    deleteKey,
    editBand,
    saveConsent,
    loadConsent,
    withdrawConsent,
    isDemo: async () => (await kv.get(STORAGE_KEYS.demo)) === '1',
    setDemo: (on: boolean) => (on ? kv.set(STORAGE_KEYS.demo, '1') : kv.del(STORAGE_KEYS.demo)),
    coachSeen: async () => (await kv.get(STORAGE_KEYS.coach)) === '1',
    markCoachSeen: () => kv.set(STORAGE_KEYS.coach, '1'),
    loadInstallToken: () => kv.get(STORAGE_KEYS.install),
    saveInstallToken: (token: string) => kv.set(STORAGE_KEYS.install, token),
    saveScanLedger: (ledger: HowThisWasMade) => kv.set(STORAGE_KEYS.scanLedger, JSON.stringify(ledger)),
    loadScanLedger: async (): Promise<HowThisWasMade | null> => {
      const raw = await kv.get(STORAGE_KEYS.scanLedger);
      if (!raw) return null;
      try {
        const parsed = HowThisWasMade.safeParse(JSON.parse(raw));
        return parsed.success ? parsed.data : null;
      } catch {
        return null;
      }
    },
  };
}

export type KeyStore = ReturnType<typeof createKeyStore>;

export function memoryBackend(seed: Record<string, string> = {}): KVBackend & { data: Map<string, string> } {
  const data = new Map(Object.entries(seed));
  return {
    data,
    get: async (k) => data.get(k) ?? null,
    set: async (k, v) => void data.set(k, v),
    del: async (k) => void data.delete(k),
  };
}
