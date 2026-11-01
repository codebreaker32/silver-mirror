import type { BetaMessage, MessageCreateParamsNonStreaming } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import type { ClaudeCaller } from './client';
import { X3_SYSTEM } from './resolve';

/** Offline stand-in for Claude (CLAUDE_MODE=mock, or no ANTHROPIC_API_KEY). Returns schema-valid JSON through the same parse path. */
export const MOCK_LABEL = [
  { raw: 'Aqua', cosing_name: 'Aqua', confidence: 0.98 },
  { raw: 'Glycerin', cosing_name: 'Glycerin', confidence: 0.97 },
  { raw: 'Isopropyl Myristate', cosing_name: 'Isopropyl Myristate', confidence: 0.9 },
  { raw: 'Niacinamide', cosing_name: 'Niacinamide', confidence: 0.95 },
  { raw: 'Cetearyl Alcohol', cosing_name: 'Cetearyl Alcohol', confidence: 0.93 },
  { raw: 'Parfum', cosing_name: 'Parfum', confidence: 0.88 },
  { raw: 'Phenoxyethanol', cosing_name: 'Phenoxyethanol', confidence: 0.6 },
];

const message = (text: string, model: string): BetaMessage =>
  ({
    id: 'msg_mock',
    type: 'message',
    role: 'assistant',
    model,
    content: [{ type: 'text', text, citations: null }],
    stop_reason: 'end_turn',
    stop_sequence: null,
    stop_details: null,
    usage: { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
  }) as unknown as BetaMessage;

export const mockClaude = (): ClaudeCaller => ({
  create: async (params: MessageCreateParamsNonStreaming) => {
    const system = Array.isArray(params.system) ? params.system.map((b) => b.text).join('') : (params.system ?? '');
    if (system.startsWith(X3_SYSTEM))
      return message(JSON.stringify({ candidates: [], extracted_title: null, is_skincare: true }), 'mock');
    return message(JSON.stringify({ tokens: MOCK_LABEL, unreadable_regions: 1 }), 'mock');
  },
});
