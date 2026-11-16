import { cn } from '@skeleton/core-utils';
import { DotStatus, type DotStatusVariant } from './dot-status';

/** `pending`: not started yet (waiting, queued), a hollow ring instead of a filled dot. */
export type BadgeStatusVariant = DotStatusVariant | 'pricing';

type BadgeStatusProps = {
  variant: BadgeStatusVariant;
  children: React.ReactNode;
  /** Hide the dot: a plain tag (keyword, count). Ignored by `pricing`, which has none. @default true */
  dot?: boolean;
  /** `plain`: the dot and the text only, no border, background or padding (statuses in dense rows). @default 'badge' */
  appearance?: 'badge' | 'plain';
  className?: string;
};

export const BadgeStatus = ({ variant, children, dot = true, appearance = 'badge', className }: BadgeStatusProps) => {
  const isPricing = variant === 'pricing';

  return (
    <span
      className={cn(
        'inline-flex items-center',
        appearance === 'plain'
          ? cn('body-sm-dense gap-1.5', isPricing ? 'text-teal-600 dark:text-teal-400' : 'text-muted-foreground')
          : cn(
              'label-sm-dense rounded-md border px-1.5 py-0.5',
              isPricing
                ? 'border-teal-100 bg-teal-50 text-teal-600 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-400'
                : 'gap-1.5 border-border-subtle bg-secondary text-secondary-foreground',
            ),
        className,
      )}
    >
      {!isPricing && dot && <DotStatus variant={variant} className="size-1.5" />}
      {children}
    </span>
  );
};
