import type { UploadSlot } from '@skinkey/contracts';
import type { Clock } from '../lib/clock';
import { backoffMs, type Pacer } from '../lib/limiter';
import {
  CREDIT_PATH,
  DELETE_PATH,
  FEATURE_COST_PATH,
  FILE_PATH,
  TASK_PATHS,
  type TaskKind,
  type YouCamCreditResponse,
  type YouCamErrorBody,
  type YouCamFeatureCostResponse,
  type YouCamFileResponse,
  type YouCamTaskCreated,
  type YouCamTaskStatusResponse,
} from './types';

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface YouCamClientOptions {
  baseUrl: string;
  apiKey: string;
  fetch: FetchLike;
  pacer: Pacer;
  clock: Clock;
  maxRetries?: number;
  random?: () => number;
}

export class YouCamHttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: YouCamErrorBody | null,
  ) {
    super(`YouCam ${status}: ${body?.error_code ?? body?.error ?? 'error'}`);
  }
  get errorCode() {
    return this.body?.error_code ?? this.body?.error ?? `http_${this.status}`;
  }
}

export type TaskPoll<R> =
  | { kind: 'running' }
  | { kind: 'success'; results: R }
  | { kind: 'error'; error: string; message?: string }
  /**
   * 400/404 InvalidTaskId: the task no longer exists (deleted or expired). The caller decides what it means:
   * after a delete was sent it confirms the delete (G0); before that it is an expired task, not a delete.
   */
  | { kind: 'gone'; status: number };

export class YouCamClient {
  readonly calls: Array<{ method: string; path: string; status: number }> = [];

  constructor(private readonly o: YouCamClientOptions) {}

  private async request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<{ status: number; json: T }> {
    const maxRetries = this.o.maxRetries ?? 3;
    for (let attempt = 0; ; attempt++) {
      await this.o.pacer.acquire();
      const res = await this.o.fetch(`${this.o.baseUrl}${path}`, {
        method,
        headers: {
          authorization: `Bearer ${this.o.apiKey}`,
          ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      this.calls.push({ method, path, status: res.status });
      if (res.status === 429 && attempt < maxRetries) {
        await this.o.clock.sleep(backoffMs(attempt, this.o.random));
        continue;
      }
      const json = (await res.json().catch(() => null)) as T;
      return { status: res.status, json };
    }
  }

  private async ok<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    const { status, json } = await this.request<T & YouCamErrorBody>(method, path, body);
    if (status !== 200) throw new YouCamHttpError(status, json);
    return json;
  }

  async createFile(file: { fileName: string; contentType: string; fileSize: number }): Promise<{ fileId: string; upload: UploadSlot }> {
    const json = await this.ok<YouCamFileResponse>('POST', FILE_PATH, {
      files: [{ content_type: file.contentType, file_name: file.fileName, file_size: file.fileSize }],
    });
    const f = (json.data?.files ?? json.files)?.[0];
    const req = f?.requests?.[0];
    if (!f || !req) throw new YouCamHttpError(502, { status: 502, error: 'file response missing upload request' });
    const headers = Object.fromEntries(Object.entries(req.headers ?? {}).map(([k, v]) => [k, String(v)]));
    return { fileId: f.file_id, upload: { url: req.url, method: 'PUT', headers } };
  }

  async createTask(kind: TaskKind, body: unknown): Promise<string> {
    const json = await this.ok<YouCamTaskCreated>('POST', TASK_PATHS[kind], body);
    const id = json.data?.task_id;
    if (!id) throw new YouCamHttpError(502, { status: 502, error: 'task response missing task_id' });
    return id;
  }

  async getTask<R>(kind: TaskKind, taskId: string): Promise<TaskPoll<R>> {
    const { status, json } = await this.request<YouCamTaskStatusResponse<R> & YouCamErrorBody>(
      'GET',
      `${TASK_PATHS[kind]}/${encodeURIComponent(taskId)}`,
    );
    if (status === 400 || status === 404) return { kind: 'gone', status };
    if (status !== 200) throw new YouCamHttpError(status, json);
    const d = json.data;
    if (d?.task_status === 'success' && d.results !== undefined) return { kind: 'success', results: d.results };
    if (d?.task_status === 'error') return { kind: 'error', error: d.error ?? 'unknown_internal_error', message: d.error_message };
    return { kind: 'running' };
  }

  /** Removes the task, its outputs and the input file it ran on (yce.html). There is no per-file delete. */
  async deleteTask(taskId: string): Promise<void> {
    await this.ok('POST', DELETE_PATH, { task_id: taskId });
  }

  credit() {
    return this.ok<YouCamCreditResponse>('GET', CREDIT_PATH);
  }

  featureCost(startingToken?: string) {
    const qs = new URLSearchParams({ page_size: '20', ...(startingToken ? { starting_token: startingToken } : {}) });
    return this.ok<YouCamFeatureCostResponse>('GET', `${FEATURE_COST_PATH}?${qs}`);
  }

  /** Signed S3 result URLs are not YouCam API calls, so they skip the pacer. */
  async fetchAsset(url: string): Promise<Uint8Array> {
    const res = await this.o.fetch(url, { method: 'GET' });
    if (!res.ok) throw new YouCamHttpError(res.status, { status: res.status, error: 'asset fetch failed' });
    return new Uint8Array(await res.arrayBuffer());
  }
}
