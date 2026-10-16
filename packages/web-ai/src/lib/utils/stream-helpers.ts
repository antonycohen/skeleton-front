import type {ContentBlock, WithStreamingMetadata} from '@skeleton/core-api-models';

/**
 * Create block state from a content block start event.
 * Simply spreads the content block with streaming metadata.
 */
export function createBlockState(
  contentBlock: ContentBlock,
  index: number
): WithStreamingMetadata<ContentBlock> {
  return {
    ...contentBlock,
    index,
    isComplete: false,
    // Initialize partialJson for tool_use blocks
    partialJson:
      contentBlock.type === 'tool_use' || contentBlock.type === 'server_tool_use'
        ? ''
        : undefined,
  };
}

/**
 * Extract text content from content blocks.
 */
export function getTextContent(blocks: WithStreamingMetadata<ContentBlock>[]): string {
  return blocks
    .filter((block) => block?.type === 'text')
    .map((block) => ('text' in block ? block.text : '') ?? '')
    .join('');
}

/**
 * Finalize a content block when streaming stops.
 * For tool_use blocks, parses the accumulated partialJson into the input field.
 */
export function finalizeBlockState(
  state: WithStreamingMetadata<ContentBlock>
): WithStreamingMetadata<ContentBlock> {
  if (
    (state.type === 'tool_use' || state.type === 'server_tool_use') &&
    state.partialJson
  ) {
    try {
      const parsedInput = JSON.parse(state.partialJson);
      return { ...state, isComplete: true, input: parsedInput };
    } catch {
      // If parsing fails, just mark as complete
    }
  }
  return { ...state, isComplete: true };
}

/**
 * Extract text from an array of ContentBlock.
 */
export function getTextFromContentBlocks(blocks: ContentBlock[]): string {
  return blocks
    .filter((block): block is ContentBlock & { type: 'text' } => block.type === 'text')
    .map((block) => block.text ?? '')
    .join('');
}

/**
 * Generate a unique message ID.
 */
export function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
