'use client';

import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { HelpCircle } from 'lucide-react';
import type { ContentBlock, WithStreamingMetadata } from '@skeleton/core-api-models';
import type { AiChatPluginContext } from '../types';

interface UnknownBlockContentProps {
  blockType: string;
  isStreaming?: boolean;
  className?: string;
}

/**
 * Renders a placeholder for unknown content block types.
 */
function UnknownBlockContent({
  blockType,
  isStreaming,
  className,
}: UnknownBlockContentProps) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        'my-2 flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/50 p-3',
        className
      )}
    >
      <HelpCircle className="size-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        {t('ai.block.unknown')} <code className="font-mono">{blockType}</code>
        {isStreaming && (
          <span className="ml-2 inline-block size-1.5 animate-pulse rounded-full bg-current" />
        )}
      </span>
    </div>
  );
}

/**
 * Standalone component for rendering unknown blocks without using the plugin system.
 * Useful when no plugin is found for a block type.
 */
export function UnknownBlockFallback({
  block,
  className,
}: {
  block: ContentBlock | WithStreamingMetadata<ContentBlock>;
  className?: string;
}) {
  return (
    <UnknownBlockContent
      blockType={block.type}
      isStreaming={'isComplete' in block ? !block.isComplete : false}
      className={className}
    />
  );
}

/**
 * Render function for unknown blocks.
 * Can be used directly without the plugin system.
 */
export function renderUnknownBlock(
  state: WithStreamingMetadata<ContentBlock>,
  _ctx: AiChatPluginContext
) {
  return (
    <UnknownBlockContent
      key={`unknown-${state.index}`}
      blockType={state.type}
      isStreaming={!state.isComplete}
    />
  );
}
