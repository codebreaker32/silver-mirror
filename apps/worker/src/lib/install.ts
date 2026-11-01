import type { Caps } from '@skinkey/contracts';
import { base64Url, randomId } from './b64';
import type { JsonStore } from './kv';

const enc = new TextEncoder();

const hmac = async (secret: string, data: string) => {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data))));
};

const safeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

/** Anonymous install token: `v1.<installId>.<hmac>`. Carries no personal data. */
export const issueInstallToken = async (secret: string, installId = randomId(16)) => ({
  installId,
  token: `v1.${installId}.${await hmac(secret, installId)}`,
});

export const verifyInstallToken = async (secret: string, token: string | undefined | null): Promise<string | null> => {
  const [v, installId, sig] = (token ?? '').split('.');
  if (v !== 'v1' || !installId || !sig) return null;
  return safeEqual(sig, await hmac(secret, installId)) ? installId : null;
};

interface Usage {
  scans: number;
  tryons: number;
}

const usageKey = (installId: string) => `caps:${installId}`;

export class CapsLedger {
  constructor(
    private readonly store: JsonStore,
    private readonly limits: { scans: number; tryons: number },
  ) {}

  private async usage(installId: string): Promise<Usage> {
    return (await this.store.get<Usage>(usageKey(installId))) ?? { scans: 0, tryons: 0 };
  }

  async caps(installId: string): Promise<Caps> {
    const u = await this.usage(installId);
    return { scansLeft: Math.max(0, this.limits.scans - u.scans), tryonsLeft: Math.max(0, this.limits.tryons - u.tryons) };
  }

  /** Reserves one use. Returns null when the cap is reached. */
  async consume(installId: string, kind: 'scan' | 'tryon'): Promise<Caps | null> {
    const u = await this.usage(installId);
    const field = kind === 'scan' ? 'scans' : 'tryons';
    if (u[field] >= this.limits[field]) return null;
    u[field] += 1;
    await this.store.put(usageKey(installId), u);
    return this.caps(installId);
  }

  /** Gives a use back when YouCam consumed no units (task create failed or engine error). */
  async refund(installId: string, kind: 'scan' | 'tryon'): Promise<void> {
    const u = await this.usage(installId);
    const field = kind === 'scan' ? 'scans' : 'tryons';
    u[field] = Math.max(0, u[field] - 1);
    await this.store.put(usageKey(installId), u);
  }
}
