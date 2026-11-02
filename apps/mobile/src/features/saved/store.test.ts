import { describe, expect, it, vi } from 'vitest';

const disk = new Map<string, string>();
vi.mock('expo-secure-store', () => ({
  getItemAsync: async (k: string) => disk.get(k) ?? null,
  setItemAsync: async (k: string, v: string) => {
    disk.set(k, v);
  },
}));

describe('saved products store', () => {
  it('toggles ids newest first and persists them on the phone', async () => {
    const store = await import('./store');
    await store.loadSaved();
    expect(store.getSaved()).toEqual([]);
    expect(store.toggleSaved('a')).toBe(true);
    expect(store.toggleSaved('b')).toBe(true);
    expect(store.getSaved()).toEqual(['b', 'a']);
    expect(store.toggleSaved('a')).toBe(false);
    expect(store.getSaved()).toEqual(['b']);
    await Promise.resolve();
    expect(JSON.parse(disk.get('skinkey.savedProducts') ?? '[]')).toEqual(['b']);
  });

  it('notifies subscribers', async () => {
    const store = await import('./store');
    const seen: string[][] = [];
    const off = store.subscribeSaved((ids) => seen.push(ids));
    store.toggleSaved('c');
    off();
    store.toggleSaved('d');
    expect(seen).toEqual([['c', 'b']]);
  });
});
