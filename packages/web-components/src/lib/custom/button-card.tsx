import * as React from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@skeleton/core-utils';

export type ButtonCardProps = Omit<React.ComponentProps<'button'>, 'title'> & {
  /** Icon or illustration rendered in the 40px tile on the left. */
  icon: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Swaps the icon for a spinner (the card's action is in flight). */
  isPending?: boolean;
};

/**
 * A full-width clickable row: icon tile, title + description, chevron. The
 * choice cards of creation dialogs.
 */
export function ButtonCard({
  icon,
  title,
  description,
  isPending = false,
  className,
  disabled,
  ...props
}: ButtonCardProps) {
  return (
    <button
      type="button"
      disabled={disabled || isPending}
      className={cn(
        'flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left shadow-xs transition-colors hover:bg-accent dark:border-input dark:bg-input/30 dark:hover:bg-input/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
        {isPending ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : (
          icon
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="title text-foreground">{title}</span>
        {description && (
          <span className="body text-muted-foreground">{description}</span>
        )}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}
