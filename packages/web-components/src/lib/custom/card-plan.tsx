import {cn} from '@skeleton/core-utils';
import {Zap} from 'lucide-react';
import {Button} from '../ui/button';
import {Progress} from '../ui/progress';
import {useTranslation} from '@skeleton/core-translations';
import {ComponentProps} from "react";

export type UsageStat = {
  /** The headline (first stat) reads "3 seats"; the other rows read "Projects   3/5". */
  label: string;
  remaining: number;
  /** The quota's size; unknown or unlimited (null, 0) shows the remaining count alone. */
  limit?: number | null;
};

export type CardPlanProps = {
  className?: string;
  variant?: 'free' | 'paid';
  /** The plan the usage is on ("Free", "Pro"), shown above it as "Free plan". */
  planName?: string;
  buttonProps?: ComponentProps<typeof Button>;
  buttonText?: string;
  /** The first stat is the headline, with its gauge; the others are rows below it. */
  usageStats?: UsageStat[];
  onAction?: () => void;
  hideAction?: boolean;
};

/** At or under this share left, the headline gauge turns amber. */
const LOW_REMAINING_SHARE = 0.3;

function formatStatValue(value: number): string {
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}

/** Share of the quota still available, in whole percents (only called with a known limit). */
function remainingPercent({remaining, limit}: UsageStat): number {
  if (!limit) return 0;
  return Math.max(0, Math.min(100, Math.floor((remaining / limit) * 100)));
}

export function CardPlan({
  className,
  variant = 'free',
  planName,
  buttonProps,
  buttonText,
  usageStats = [],
  onAction,
  hideAction = false,
}: CardPlanProps) {
  const {t} = useTranslation();
  const defaultButtonText = variant === 'paid' ? t('components.cardPlan.manage') : t('components.cardPlan.upgrade');
  const [headline, ...rows] = usageStats;
  const isLow = !!headline?.limit && headline.remaining / headline.limit <= LOW_REMAINING_SHARE;

  return (
    <div
      data-slot="card-plan"
      className={cn('flex w-full flex-col gap-3 rounded-2xl outline outline-1 outline-offset-[-1px] outline-border-subtle bg-card p-4', className)}
    >
      {planName && <span className="label-sm text-muted-foreground">{t('components.cardPlan.planName', { name: planName })}</span>}
      {headline && (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="title text-card-foreground">
              {formatStatValue(headline.remaining)} {headline.label}
            </span>
            {!!headline.limit && (
              <span className="body text-muted-foreground">/{formatStatValue(headline.limit)}</span>
            )}
          </div>
          {!!headline.limit && (
            <Progress
              value={remainingPercent(headline)}
              aria-label={t('components.cardPlan.left', { label: headline.label })}
              className={cn(
                'h-1.5',
                isLow && 'bg-amber-100 dark:bg-amber-500/20 [&>[data-slot=progress-indicator]]:bg-amber-500',
              )}
            />
          )}
        </div>
      )}

      {rows.map((stat) => (
        <div key={stat.label} className="flex items-baseline justify-between gap-2 body-sm">
          <span className="text-muted-foreground">{stat.label}</span>
          <span className="tabular-nums">
            <span className="text-card-foreground">{formatStatValue(stat.remaining)}</span>
            {!!stat.limit && <span className="text-muted-foreground">/{formatStatValue(stat.limit)}</span>}
          </span>
        </div>
      ))}

      {!hideAction && (
        <Button
          variant={variant === 'paid' ? 'outline' : 'default'}
          className="w-full"
          onClick={onAction}
          {...buttonProps}
        >
          {variant === 'free' && <Zap className="size-4" />}
          {buttonText ?? defaultButtonText}
        </Button>
      )}
    </div>
  );
}
