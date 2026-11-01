import type { Clock } from './clock';
import type { JsonStore } from './kv';

export interface PacerState {
  last: number;
  window: number[];
}

export interface PacerOptions {
  /** Spec §3: YouCam calls at least 1.2 s apart. */
  minIntervalMs: number;
  /** develop_rate_limit.md: 250 requests per 300 s per IP and per token. */
  windowMs: number;
  maxInWindow: number;
  /** Give up instead of holding a request open longer than this. */
  maxWaitMs: number;
}

export const YOUCAM_PACING: PacerOptions = {
  minIntervalMs: 1200,
  windowMs: 300_000,
  maxInWindow: 250,
  maxWaitMs: 20_000,
};

export class RateLimitedError extends Error {
  constructor(readonly waitMs: number) {
    super(`YouCam pacing would wait ${waitMs} ms`);
  }
}

export interface PacerStateStore {
  read(): Promise<PacerState>;
  write(state: PacerState): Promise<void>;
}

export const memoryPacerStore = (): PacerStateStore => {
  let state: PacerState = { last: 0, window: [] };
  return {
    read: async () => state,
    write: async (s) => {
      state = s;
    },
  };
};

const PACER_KEY = 'youcam:pacer';

/** Shared across isolates through KV. KV is eventually consistent, so the in-isolate queue plus 429 backoff cover the gaps. */
export const kvPacerStore = (store: JsonStore): PacerStateStore => ({
  read: async () => (await store.get<PacerState>(PACER_KEY)) ?? { last: 0, window: [] },
  write: (s) => store.put(PACER_KEY, s, 600),
});

export class Pacer {
  private queue: Promise<unknown> = Promise.resolve();
  private local: PacerState = { last: 0, window: [] };

  constructor(
    private readonly store: PacerStateStore,
    private readonly clock: Clock,
    private readonly options: PacerOptions = YOUCAM_PACING,
  ) {}

  /** Resolves when the caller may send one YouCam request. Calls are serialised within an isolate. */
  acquire(): Promise<void> {
    const next = this.queue.then(() => this.take());
    this.queue = next.catch(() => undefined);
    return next;
  }

  waitFor(state: PacerState, now: number): number {
    const { minIntervalMs, windowMs, maxInWindow } = this.options;
    const window = state.window.filter((t) => now - t < windowMs);
    const byInterval = state.last + minIntervalMs - now;
    const byWindow = window.length >= maxInWindow ? window[window.length - maxInWindow]! + windowMs - now : 0;
    return Math.max(0, byInterval, byWindow);
  }

  private async take(): Promise<void> {
    for (;;) {
      const remote = await this.store.read();
      const state: PacerState = {
        last: Math.max(remote.last, this.local.last),
        window: remote.window.length >= this.local.window.length ? remote.window : this.local.window,
      };
      const now = this.clock.now();
      const wait = this.waitFor(state, now);
      if (wait > this.options.maxWaitMs) throw new RateLimitedError(wait);
      if (wait > 0) {
        await this.clock.sleep(wait);
        continue;
      }
      const window = [...state.window.filter((t) => now - t < this.options.windowMs), now];
      this.local = { last: now, window };
      await this.store.write(this.local);
      return;
    }
  }
}

/** 429 backoff: 2 s, 4 s, 8 s plus up to 500 ms jitter. */
export const backoffMs = (attempt: number, random: () => number = Math.random) => 2000 * 2 ** attempt + Math.floor(random() * 500);
