import type { ContentBlock, Delta, WithStreamingMetadata } from '@skeleton/core-api-models';
import type { AiChatDeltaPlugin } from '../types';

/**
 * Delta plugin for handling signature_delta events.
 * Appends signature to content blocks (typically thinking blocks).
 */
export const signatureDeltaPlugin: AiChatDeltaPlugin<'signature_delta'> = {
  id: 'signature-delta',
  deltaTypes: ['signature_delta'],
  priority: 10,

  applyDelta(
    state: WithStreamingMetadata<ContentBlock>,
    delta: Delta
  ): WithStreamingMetadata<ContentBlock> {
    if (delta.type !== 'signature_delta') return state;

    return {
      ...state,
      signature: (state.signature ?? '') + delta.signature,
    };
  },
};
