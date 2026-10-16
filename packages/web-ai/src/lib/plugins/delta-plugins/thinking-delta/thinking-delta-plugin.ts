import type { ContentBlock, Delta, WithStreamingMetadata } from '@skeleton/core-api-models';
import type { AiChatDeltaPlugin } from '../types';

/**
 * Delta plugin for handling thinking_delta events.
 * Appends thinking content to thinking content blocks.
 */
export const thinkingDeltaPlugin: AiChatDeltaPlugin<'thinking_delta'> = {
  id: 'thinking-delta',
  deltaTypes: ['thinking_delta'],
  priority: 10,

  applyDelta(
    state: WithStreamingMetadata<ContentBlock>,
    delta: Delta
  ): WithStreamingMetadata<ContentBlock> {
    if (delta.type !== 'thinking_delta') return state;
    if (state.type !== 'thinking') return state;

    return {
      ...state,
      thinking: (state.thinking ?? '') + delta.thinking,
    };
  },
};
