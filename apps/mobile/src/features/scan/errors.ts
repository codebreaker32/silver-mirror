import type { ApiError } from '@skinkey/contracts';

export interface FriendlyError {
  title: string;
  body: string;
  retryable: boolean;
}

export function friendlyError(
  err: { status?: number; body?: ApiError | null; message?: string } | unknown,
  flow: 'scan' | 'tryon',
): FriendlyError {
  const e = (err ?? {}) as { status?: number; body?: ApiError | null };
  const code = e.body?.error.code;
  if (code === 'cap_reached') {
    return flow === 'scan'
      ? { title: 'Scan limit reached', body: 'This install has used its free scan. Your Key and the Demo Key still work.', retryable: false }
      : { title: 'Try-on limit reached', body: 'This install has used its 3 try-ons.', retryable: false };
  }
  if (code === 'rate_limited') {
    return { title: 'YouCam is busy', body: 'Try again in a minute.', retryable: true };
  }
  if (e.status === undefined && err instanceof TypeError) {
    return {
      title: flow === 'scan' ? 'You need a connection to scan' : 'You need a connection for a try-on',
      body: 'SkinKey kept no photo.',
      retryable: true,
    };
  }
  return { title: 'Something went wrong', body: 'Try again in a moment.', retryable: true };
}
