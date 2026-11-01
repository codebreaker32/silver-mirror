import type { ApiError } from '@skinkey/contracts';

export type ApiErrorCode = ApiError['error']['code'];

const STATUS: Record<ApiErrorCode, number> = {
  bad_request: 400,
  unauthorized: 401,
  cap_reached: 429,
  rate_limited: 429,
  not_found: 404,
  youcam_error: 502,
  claude_refusal: 422,
  claude_error: 502,
  internal: 500,
};

export class HttpError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly youcamError?: string,
  ) {
    super(message);
  }
  get status() {
    return STATUS[this.code];
  }
  toBody(): ApiError {
    return { error: { code: this.code, message: this.message, ...(this.youcamError ? { youcamError: this.youcamError } : {}) } };
  }
}
