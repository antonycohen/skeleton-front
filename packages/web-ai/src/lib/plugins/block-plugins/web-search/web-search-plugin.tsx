'use client';

import type { ContentBlock, WithStreamingMetadata } from '@skeleton/core-api-models';
import type { AiChatPlugin, AiChatPluginContext } from '../types';
import { WebSearchContent } from './web-search-content';

/**
 * Plugin for rendering web search tool results.
 *
 * Handles the 'web_search_tool_result' block type and renders search results
 * as clickable cards with titles, URLs, and page ages.
 */
export const webSearchPlugin: AiChatPlugin<'web_search_tool_result'> = {
  id: 'web-search',
  blockTypes: ['web_search_tool_result'],
  priority: 15,

  render(state: WithStreamingMetadata<ContentBlock>, _ctx: AiChatPluginContext) {
    if (state.type !== 'web_search_tool_result') {
      return null;
    }

    // With the new type, content is directly on the state
    return (
      <WebSearchContent
        key={`web-search-${state.index}`}
        results={state.content}
        isStreaming={!state.isComplete}
      />
    );
  },
};
