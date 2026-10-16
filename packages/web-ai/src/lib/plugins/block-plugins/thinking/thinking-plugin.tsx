'use client';

import type { ContentBlock, WithStreamingMetadata } from '@skeleton/core-api-models';
import type { AiChatPlugin, AiChatPluginContext } from '../types';
import { ThinkingContent } from './thinking-content';

/**
 * Plugin for rendering thinking content blocks.
 *
 * Only renders when the thinking block is the last block of its message,
 * so it disappears as soon as the assistant produces any subsequent block.
 */
export const thinkingPlugin: AiChatPlugin<'thinking'> = {
  id: 'thinking',
  blockTypes: ['thinking'],
  priority: 20,

  render(state: WithStreamingMetadata<ContentBlock>, ctx: AiChatPluginContext) {
    if (state.type !== 'thinking') {
      return null;
    }

    const message = ctx.chatState.messages.find((m) => m.id === ctx.messageId);
    const lastIndex = message ? message.content.length - 1 : -1;
    if (ctx.blockIndex !== lastIndex) {
      return null;
    }

    return <ThinkingContent key={`thinking-${state.index}`} thinking={state.thinking} />;
  },
};
