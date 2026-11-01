export interface JsonStore {
  get<T>(key: string): Promise<T | null>;
  put(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

const KV_MIN_TTL = 60;

export const kvStore = (kv: KVNamespace): JsonStore => ({
  get: <T>(key: string) => kv.get<T>(key, 'json'),
  put: (key, value, ttlSeconds) =>
    kv.put(key, JSON.stringify(value), ttlSeconds ? { expirationTtl: Math.max(KV_MIN_TTL, ttlSeconds) } : undefined),
  delete: (key) => kv.delete(key),
  list: async (prefix) => {
    const keys: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await kv.list({ prefix, cursor });
      keys.push(...page.keys.map((k) => k.name));
      cursor = page.list_complete ? undefined : page.cursor;
    } while (cursor);
    return keys;
  },
});

/** In-memory KVNamespace subset, for tests and the mock. */
export class MemoryKV {
  readonly data = new Map<string, string>();

  async get(key: string, type?: 'text' | 'json' | { type: 'text' | 'json' }) {
    const raw = this.data.get(key) ?? null;
    const t = typeof type === 'object' ? type.type : type;
    return raw !== null && t === 'json' ? JSON.parse(raw) : raw;
  }
  async put(key: string, value: string) {
    this.data.set(key, value);
  }
  async delete(key: string) {
    this.data.delete(key);
  }
  async list(opts: { prefix?: string } = {}) {
    const keys = [...this.data.keys()].filter((k) => k.startsWith(opts.prefix ?? '')).map((name) => ({ name }));
    return { keys, list_complete: true, cursor: '', cacheStatus: null };
  }
  asKV() {
    return this as unknown as KVNamespace;
  }
}
