'use client';

import type { ContentBlock, WithStreamingMetadata } from '@skeleton/core-api-models';
import type { AiChatPlugin, AiChatPluginContext } from '../types';
import { TextContent } from './text-content';

/**
 * Plugin for rendering text content blocks.
 *
 * Handles the 'text' block type and renders markdown text with a streaming cursor
 * during streaming.
 */
export const textPlugin: AiChatPlugin<'text'> = {
  id: 'text',
  blockTypes: ['text'],
  priority: 10,

  render(state: WithStreamingMetadata<ContentBlock>, ctx: AiChatPluginContext) {
    if (state.type !== 'text') {
      return null;
    }

    return (
      <TextContent
        key={`text-${state.index}`}
        text={state.text}
        isStreaming={!state.isComplete}
      />
    );
  },
};
