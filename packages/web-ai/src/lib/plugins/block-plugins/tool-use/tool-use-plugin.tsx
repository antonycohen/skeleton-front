'use client';

import type { ContentBlock, WithStreamingMetadata } from '@skeleton/core-api-models';
import type { AiChatPlugin, AiChatPluginContext } from '../types';
import { ToolUseContent } from './tool-use-content';

/**
 * Plugin for rendering tool use content blocks.
 *
 * Handles 'tool_use' and 'server_tool_use' block types and renders them as
 * cards showing the tool name, execution status, and input parameters.
 */
export const toolUsePlugin: AiChatPlugin<'tool_use' | 'server_tool_use'> = {
  id: 'tool-use',
  blockTypes: ['tool_use', 'server_tool_use'],
  priority: 15,

  render(state: WithStreamingMetadata<ContentBlock>, _ctx: AiChatPluginContext) {
    if (state.type !== 'tool_use' && state.type !== 'server_tool_use') {
      return null;
    }

    // With the new type, properties are directly on the state
    return (
      <ToolUseContent
        key={`tool-${state.index}`}
        name={state.name}
        input={state.input}
        partialJson={state.partialJson}
        isStreaming={!state.isComplete}
      />
    );
  },
};
