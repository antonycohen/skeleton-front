import type { ContentBlock, Delta, WithStreamingMetadata } from '@skeleton/core-api-models';
import type { AiChatDeltaPlugin } from '../types';

/**
 * Delta plugin for handling input_json_delta events.
 * Appends partial JSON to tool_use and server_tool_use content blocks.
 */
export const inputJsonDeltaPlugin: AiChatDeltaPlugin<'input_json_delta'> = {
  id: 'input-json-delta',
  deltaTypes: ['input_json_delta'],
  priority: 10,

  applyDelta(
    state: WithStreamingMetadata<ContentBlock>,
    delta: Delta
  ): WithStreamingMetadata<ContentBlock> {
    if (delta.type !== 'input_json_delta') return state;
    if (state.type !== 'tool_use' && state.type !== 'server_tool_use') return state;

    return {
      ...state,
      partialJson: (state.partialJson ?? '') + delta.partialJson,
    };
  },
};
