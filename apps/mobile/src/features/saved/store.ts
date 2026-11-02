import * as SecureStore from 'expo-secure-store';

/**
 * Saved products: a list of catalogue ids kept on this phone only (SecureStore, like the tip and welcome flags). No
 * account, no sync. One module-level list shared by every useSaved() so a heart on Shop and on a detail stay in step.
 */
const KEY = 'skinkey.savedProducts';

let saved: string[] = [];
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<(ids: string[]) => void>();

const emit = () => {
  for (const l of listeners) l(saved);
};

export function loadSaved(): Promise<void> {
  if (loaded) return Promise.resolve();
  loading ??= (async () => {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) saved = parsed.filter((x): x is string => typeof x === 'string');
    } catch {
      // A platform without SecureStore (web) keeps the list in memory for the session.
    }
    loaded = true;
    emit();
  })();
  return loading;
}

const persist = () => {
  SecureStore.setItemAsync(KEY, JSON.stringify(saved)).catch(() => {});
};

export const getSaved = (): string[] => saved;

/** Adds or removes one id. Returns true when the product is now saved. Newest first. */
export function toggleSaved(id: string): boolean {
  const has = saved.includes(id);
  saved = has ? saved.filter((x) => x !== id) : [id, ...saved];
  emit();
  persist();
  return !has;
}

export function subscribeSaved(fn: (ids: string[]) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
