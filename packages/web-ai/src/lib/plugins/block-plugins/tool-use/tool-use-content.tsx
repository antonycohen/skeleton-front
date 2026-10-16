'use client';

import { useState } from 'react';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { ChevronRight, Wrench, Loader2, CheckCircle2 } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@skeleton/web-components';

/**
 * Try to parse partial JSON, returning null if invalid.
 */
function tryParseJson(json: string): Record<string, unknown> | null {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

interface ToolUseContentProps {
  name: string;
  input?: Record<string, unknown>;
  partialJson?: string;
  isStreaming?: boolean;
  className?: string;
}

/**
 * Renders tool use content as a card showing the tool name, status, and input.
 */
export function ToolUseContent({
  name,
  input,
  partialJson,
  isStreaming,
  className,
}: ToolUseContentProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Try to parse partial JSON for display during streaming
  const displayInput = input ?? (partialJson ? tryParseJson(partialJson) : null);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn('my-2', className)}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50">
        {isStreaming ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <CheckCircle2 className="size-4 text-green-600" />
        )}
        <Wrench className="size-4 text-muted-foreground" />
        <span className="flex-1 text-left font-mono text-xs">{name}</span>
        <ChevronRight
          className={cn(
            'size-4 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-90'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="mt-2 overflow-hidden rounded-lg border border-border">
          <div className="border-b border-border bg-muted/50 px-3 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">{t('ai.toolUse.input')}</span>
          </div>
          <div className="bg-muted/20 p-3">
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-foreground">
              {displayInput
                ? JSON.stringify(displayInput, null, 2)
                : partialJson ?? '{}'}
              {isStreaming && (
                <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-current" />
              )}
            </pre>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
