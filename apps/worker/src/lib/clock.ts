export interface Clock {
  now(): number;
  sleep(ms: number): Promise<void>;
}

export const systemClock: Clock = {
  now: () => Date.now(),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

/** Deterministic clock for tests: sleep advances time instantly. */
export class FakeClock implements Clock {
  readonly sleeps: number[] = [];
  constructor(public t = Date.parse('2026-11-01T18:00:00.000Z')) {}
  now() {
    return this.t;
  }
  async sleep(ms: number) {
    this.sleeps.push(ms);
    this.t += ms;
  }
  advance(ms: number) {
    this.t += ms;
  }
}

export const iso = (ms: number) => new Date(ms).toISOString();
