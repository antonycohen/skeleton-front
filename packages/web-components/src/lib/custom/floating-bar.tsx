import type { ComponentProps } from 'react';
import { cn } from '@skeleton/core-utils';

/**
 * The dark pill that floats over a canvas or a panel: the editor's toolbar, a selection's summary and
 * next step. Always dark, whatever the theme (`dark` makes its tokens, and its buttons', resolve
 * dark); the content is the host's.
 */
export function FloatingBar({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="floating-bar"
      className={cn(
        'dark flex items-center gap-2 rounded-2xl border border-border bg-background p-2 text-foreground shadow-lg',
        className,
      )}
      {...props}
    />
  );
}
