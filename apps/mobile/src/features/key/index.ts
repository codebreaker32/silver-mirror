import { useEffect, useSyncExternalStore } from 'react';
import * as SecureStore from 'expo-secure-store';
import { demo } from '@/demo';
import { DEMO_KEY, type Band, type ConsentRecord, type Concern, type HowThisWasMade, type KeyProfile } from '@skinkey/contracts';
import { applyBandEdit } from './model';
import { createKeyStore, type KVBackend } from './store';

/** Owned by APP-SCAN. APP-CORE consumes these signatures; keep them stable. */
export interface KeyState {
  key: KeyProfile | null;
  isDemo: boolean;
  loading: boolean;
}

const secureBackend: KVBackend = {
  get: (k) => SecureStore.getItemAsync(k),
  set: (k, v) => SecureStore.setItemAsync(k, v, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }),
  del: (k) => SecureStore.deleteItemAsync(k),
};

// Web `?demo=` only: seeded in-memory storage for screenshots. Native always uses SecureStore.
const store = createKeyStore(demo?.kv ?? secureBackend);

let state: KeyState = { key: null, isDemo: false, loading: true };
let demoOverride: KeyProfile | null = null;
let loadStarted = false;
const listeners = new Set<() => void>();

function setState(next: Partial<KeyState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

async function reload(): Promise<void> {
  loadStarted = true;
  const [key, demo] = await Promise.all([store.loadKey(), store.isDemo()]);
  if (key) setState({ key, isDemo: false, loading: false });
  else if (demo) setState({ key: demoOverride ?? DEMO_KEY, isDemo: true, loading: false });
  else setState({ key: null, isDemo: false, loading: false });
}

export async function loadKey(): Promise<KeyProfile | null> {
  return store.loadKey();
}

export async function saveKey(key: KeyProfile): Promise<void> {
  await store.saveKey(key);
  demoOverride = null;
  setState({ key, isDemo: false, loading: false });
}

export async function deleteKey(): Promise<void> {
  await store.deleteKey();
  await store.setDemo(false);
  demoOverride = null;
  setState({ key: null, isDemo: false, loading: false });
}

export async function editBand(concern: Concern, level: Band): Promise<KeyProfile> {
  if (!(await store.loadKey()) && state.isDemo) {
    demoOverride = applyBandEdit(demoOverride ?? DEMO_KEY, concern, level);
    setState({ key: demoOverride });
    return demoOverride;
  }
  const next = await store.editBand(concern, level);
  setState({ key: next, isDemo: false });
  return next;
}

export function useKey(): KeyState & { useDemo: () => void; refresh: () => Promise<void> } {
  const snapshot = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
  useEffect(() => {
    if (!loadStarted) void reload();
  }, []);
  return { ...snapshot, useDemo: enableDemoKey, refresh: reload };
}

export function enableDemoKey(): void {
  void store.setDemo(true);
  if (!state.key || state.isDemo) setState({ key: demoOverride ?? DEMO_KEY, isDemo: true, loading: false });
}

export async function saveScanConsent(record: ConsentRecord): Promise<void> {
  await store.saveConsent(record);
}

export const loadScanConsent = (): Promise<ConsentRecord | null> => store.loadConsent();

/** Deletes the on-phone Key, the consent record and the scan ledger. */
export async function withdrawConsent(): Promise<void> {
  await store.withdrawConsent();
  demoOverride = null;
  setState({ key: null, isDemo: false, loading: false });
}

export const coachSeen = () => store.coachSeen();
export const markCoachSeen = () => store.markCoachSeen();
export const loadInstallToken = () => store.loadInstallToken();
export const saveInstallToken = (t: string) => store.saveInstallToken(t);
export const saveScanLedger = (l: HowThisWasMade) => store.saveScanLedger(l);
export const loadScanLedger = () => store.loadScanLedger();

export { formatScanDate, glyphFromKey, CONCERNS, CONCERN_LABEL, SELF_REPORTED_TAG, type GlyphZone } from './model';
export { ZoneGlyph } from './ZoneGlyph';
export { KeyCard } from './KeyCard';
