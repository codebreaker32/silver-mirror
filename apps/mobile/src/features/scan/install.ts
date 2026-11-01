import { z } from 'zod';
import { INSTALL_HEADER } from '@skinkey/contracts';
import { WORKER_URL, setInstallToken } from '@/lib/api';
import { loadInstallToken, saveInstallToken } from '../key';

const InstallResponse = z.object({ installToken: z.string().min(1) });

let token: string | null = null;
let pending: Promise<string> | null = null;

/** Anonymous HMAC-signed install id from POST /v1/install, kept in SecureStore so caps stay per install. */
export function ensureInstallToken(): Promise<string> {
  if (token) return Promise.resolve(token);
  pending ??= (async () => {
    let t = await loadInstallToken();
    if (!t) {
      const res = await fetch(`${WORKER_URL}/v1/install`, { method: 'POST', headers: { 'content-type': 'application/json' } });
      if (!res.ok) throw Object.assign(new Error(`install ${res.status}`), { status: res.status, body: null });
      t = InstallResponse.parse(await res.json()).installToken;
      await saveInstallToken(t);
    }
    token = t;
    setInstallToken(t);
    return t;
  })().finally(() => {
    pending = null;
  });
  return pending;
}

/** Tells the Worker an upload never became a task, so the receipt can say "orphan upload". */
export async function cancelJob(kind: 'scan' | 'tryon', id: string): Promise<void> {
  const t = await ensureInstallToken();
  await fetch(`${WORKER_URL}/v1/${kind}/${encodeURIComponent(id)}/cancel`, { method: 'POST', headers: { [INSTALL_HEADER]: t } });
}
