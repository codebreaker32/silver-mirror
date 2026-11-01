import { SharedResult } from '@skinkey/contracts';

const toB64Url = (s: string) =>
  btoa(String.fromCodePoint(...new TextEncoder().encode(s)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const fromB64Url = (s: string) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.codePointAt(0)!));
};

export function encodeSharedResult(result: SharedResult): string {
  return toB64Url(JSON.stringify(SharedResult.parse(result)));
}

export function decodeSharedResult(token: string): SharedResult | null {
  try {
    const parsed = SharedResult.safeParse(JSON.parse(fromB64Url(token)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
