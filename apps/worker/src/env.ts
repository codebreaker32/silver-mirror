export interface Env {
  KV: KVNamespace;
  YOUCAM_MODE?: string;
  /** Legacy flag from the scaffold; YOUCAM_MODE wins when set. */
  MOCK_YOUCAM?: string;
  YOUCAM_BASE_URL: string;
  YOUCAM_MIN_INTERVAL_MS?: string;
  CLAUDE_MODEL: string;
  /** live | mock. Defaults to mock when ANTHROPIC_API_KEY is absent. */
  CLAUDE_MODE?: string;
  SCAN_CAP: string;
  TRYON_CAP: string;
  UNIT_BALANCE_START?: string;
  UNIT_FLOOR?: string;
  AFFILIATE_NYKAA: string;
  YOUCAM_API_KEY?: string;
  YOUCAM_SECRET_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  INSTALL_HMAC_SECRET?: string;
  ADMIN_TOKEN?: string;
}

export type YouCamMode = 'mock' | 'live';

/** Live only when explicitly requested. Anything else is mock, so CI and agents never spend units. */
export const youcamMode = (env: Pick<Env, 'YOUCAM_MODE' | 'MOCK_YOUCAM'>): YouCamMode => {
  if (env.YOUCAM_MODE) return env.YOUCAM_MODE === 'live' ? 'live' : 'mock';
  return env.MOCK_YOUCAM === '0' ? 'live' : 'mock';
};

export const isMock = (env: Pick<Env, 'YOUCAM_MODE' | 'MOCK_YOUCAM'>) => youcamMode(env) === 'mock';

export const intVar = (value: string | undefined, fallback: number) => {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) ? n : fallback;
};
