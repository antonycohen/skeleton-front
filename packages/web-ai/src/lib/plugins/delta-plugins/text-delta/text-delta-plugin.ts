import type { ContentBlock, Delta, WithStreamingMetadata } from '@skeleton/core-api-models';
import type { AiChatDeltaPlugin } from '../types';

/**
 * Delta plugin for handling text_delta events.
 * Appends text to text content blocks.
 */
export const textDeltaPlugin: AiChatDeltaPlugin<'text_delta'> = {
  id: 'text-delta',
  deltaTypes: ['text_delta'],
  priority: 10,

  applyDelta(
    state: WithStreamingMetadata<ContentBlock>,
    delta: Delta
  ): WithStreamingMetadata<ContentBlock> {
    if (delta.type !== 'text_delta') return state;
    if (state.type !== 'text') return state;

    return {
      ...state,
      text: (state.text ?? '') + delta.text,
    };
  },
};
