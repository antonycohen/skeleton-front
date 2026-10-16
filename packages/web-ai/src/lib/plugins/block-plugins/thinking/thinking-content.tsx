'use client';

import { cn } from '@skeleton/core-utils';

interface ThinkingContentProps {
  thinking: string;
  className?: string;
}

export function ThinkingContent({ thinking, className }: ThinkingContentProps) {
  return (
    <p
      className={cn(
        'text-sm text-muted-foreground animate-pulse whitespace-pre-wrap',
        className
      )}
    >
      {thinking}
    </p>
  );
}
