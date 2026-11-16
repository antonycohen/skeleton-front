import { cn } from '@skeleton/core-utils';

/** `pending`: not started yet (waiting, queued), a hollow ring instead of a filled dot. */
export type DotStatusVariant = 'green' | 'red' | 'yellow' | 'blue' | 'primary' | 'neutral' | 'pending';

type DotStatusProps = {
  variant: DotStatusVariant;
  /** What the dot stands for, read by screen readers. Leave it out when a text next to the dot already says it. */
  label?: string;
  className?: string;
};

const dotColors: Record<DotStatusVariant, string> = {
  blue: 'bg-blue-500',
  green: 'bg-teal-500',
  red: 'bg-rose-500',
  yellow: 'bg-amber-400',
  primary: 'bg-primary',
  neutral: 'bg-muted-foreground/50',
  pending: 'border border-ring bg-background',
};

/** A status as a coloured dot (8px by default; size it with `className`). */
export const DotStatus = ({ variant, label, className }: DotStatusProps) => (
  <span
    data-slot="dot-status"
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    title={label}
    className={cn('inline-block size-2 shrink-0 rounded-full', dotColors[variant], className)}
  />
);
