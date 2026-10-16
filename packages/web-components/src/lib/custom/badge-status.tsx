import { cn } from '@skeleton/core-utils';

export type BadgeStatusVariant = 'green' | 'red' | 'yellow' | 'pricing' | 'blue';

type BadgeStatusProps = {
  variant: BadgeStatusVariant;
  children: React.ReactNode;
  className?: string;
};

const dotColors: Record<Exclude<BadgeStatusVariant, 'pricing'>, string> = {
  blue: 'bg-blue-500',
  green: 'bg-emerald-400',
  red: 'bg-rose-500',
  yellow: 'bg-amber-400',
};

export const BadgeStatus = ({ variant, children, className }: BadgeStatusProps) => {
  const isPricing = variant === 'pricing';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium',
        isPricing
          ? 'border-teal-100 bg-teal-50 text-teal-600 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-400'
          : 'gap-1 border-border-subtle bg-secondary text-secondary-foreground',
        className,
      )}
    >
      {!isPricing && (
        <span className={cn('size-2 shrink-0 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  );
};
