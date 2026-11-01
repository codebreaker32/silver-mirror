import Anthropic from '@anthropic-ai/sdk';
import type {
  BetaContentBlockParam,
  BetaMessage,
  MessageCreateParamsNonStreaming,
} from '@anthropic-ai/sdk/resources/beta/messages/messages';
import type { z } from 'zod';

export const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

export interface ClaudeCaller {
  create(params: MessageCreateParamsNonStreaming): Promise<BetaMessage>;
}

export const sdkCaller = (apiKey: string): ClaudeCaller => {
  const client = new Anthropic({ apiKey, maxRetries: 2, timeout: 60_000 });
  return { create: (params) => client.beta.messages.create(params) };
};

export class ClaudeRefusalError extends Error {
  constructor(readonly category: string | null) {
    super(`Claude declined this request${category ? ` (${category})` : ''}`);
  }
}

export class ClaudeOutputError extends Error {}

export interface StructuredCall<T> {
  model: string;
  effort: 'low' | 'medium';
  system: string;
  content: BetaContentBlockParam[];
  jsonSchema: Record<string, unknown>;
  schema: z.ZodType<T>;
  maxTokens: number;
}

export interface StructuredResult<T> {
  data: T;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

/**
 * Spec §4 request settings: adaptive thinking (always on for this model), explicit effort, structured output through
 * output_config.format, no temperature, no forced tool_choice, server-side fallbacks "default", refusal checked first.
 */
export const buildParams = <T>(call: StructuredCall<T>): MessageCreateParamsNonStreaming => ({
  model: call.model,
  max_tokens: call.maxTokens,
  betas: [FALLBACK_BETA],
  fallbacks: 'default',
  thinking: { type: 'adaptive' },
  output_config: { effort: call.effort, format: { type: 'json_schema', schema: call.jsonSchema } },
  system: [{ type: 'text', text: call.system, cache_control: { type: 'ephemeral' } }],
  messages: [{ role: 'user', content: call.content }],
});

export const parseStructured = <T>(message: BetaMessage, schema: z.ZodType<T>): T => {
  if (message.stop_reason === 'refusal') throw new ClaudeRefusalError(message.stop_details?.category ?? null);
  if (message.stop_reason === 'max_tokens') throw new ClaudeOutputError('Claude ran out of output tokens');
  const text = message.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('');
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ClaudeOutputError('Claude returned no JSON');
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) throw new ClaudeOutputError(`Claude JSON failed validation: ${parsed.error.issues[0]?.message ?? ''}`);
  return parsed.data;
};

export const callStructured = async <T>(caller: ClaudeCaller, call: StructuredCall<T>, now: () => number = Date.now): Promise<StructuredResult<T>> => {
  const started = now();
  const message = await caller.create(buildParams(call));
  const data = parseStructured(message, call.schema);
  return {
    data,
    model: message.model,
    inputTokens: (message.usage.input_tokens ?? 0) + (message.usage.cache_read_input_tokens ?? 0) + (message.usage.cache_creation_input_tokens ?? 0),
    outputTokens: message.usage.output_tokens ?? 0,
    latencyMs: Math.max(0, now() - started),
  };
};
