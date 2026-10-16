'use client';

import {useMemo} from 'react';
import {Streamdown} from 'streamdown';
import {cn} from '@skeleton/core-utils';

// ============================================================================
// Types
// ============================================================================

interface TextContentProps {
  text: string;
  isStreaming?: boolean;
  className?: string;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Regex that matches assistant-instruction tags (with any attributes and content).
 */
const INSTRUCTION_TAG_PATTERN =
  /<assistant-instruction\s+[^>]*>[\s\S]*?<\/assistant-instruction>/g;

/**
 * Strip all assistant-instruction tags from text before markdown rendering.
 * More reliable than relying on the markdown parser to recognize
 * custom elements with non-standard attribute syntax.
 */
function stripInstructionTags(text: string): string {
  if (!text.includes('<assistant-instruction')) return text;
  return text.replace(INSTRUCTION_TAG_PATTERN, '');
}

// ============================================================================
// Component
// ============================================================================

/**
 * Renders markdown text content using Streamdown.
 *
 * Strips any `<assistant-instruction>` tags before rendering.
 * Instruction extraction is handled separately by the useInstructions hook.
 */
export function TextContent({
  text,
  isStreaming = false,
  className,
}: TextContentProps) {
  const cleanText = useMemo(() => stripInstructionTags(text), [text]);

  return (
    <div className={cn(className)}>
      <Streamdown parseIncompleteMarkdown={true}>
        {cleanText}
      </Streamdown>
    </div>
  );
}
