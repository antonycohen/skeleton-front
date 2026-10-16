import {cn} from '@skeleton/core-utils';
import {Zap} from 'lucide-react';
import {Button} from '../ui/button';
import {Progress} from '../ui/progress';
import {useTranslation} from '@skeleton/core-translations';
import {ComponentProps} from "react";

export type UsageStat = {
  value: string | number;
  label: string;
  percent: number;
};

export type CardPlanProps = {
  className?: string;
  variant?: 'free' | 'paid';
  buttonProps?: ComponentProps<typeof Button>;
  title?: string;
  buttonText?: string;
  usageStats?: UsageStat[];
  onAction?: () => void;
  hideAction?: boolean;
};

function formatStatValue(value: string | number): string {
  if (typeof value === 'string') return value;
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}

export function CardPlan({
  className,
  variant = 'free',
  buttonProps,
  title,
  buttonText,
  usageStats = [],
  onAction,
  hideAction = false,
}: CardPlanProps) {
  const {t} = useTranslation();
  const defaultTitle = variant === 'paid' ? t('components.cardPlan.paidTitle') : t('components.cardPlan.freeTitle');
  const defaultButtonText = variant === 'paid' ? t('components.cardPlan.manage') : t('components.cardPlan.upgrade');

  return (
    <div
      data-slot="card-plan"
      className={cn(
        'relative w-full rounded-2xl p-[3px]',
        variant === 'free'
          ? 'bg-[conic-gradient(from_90deg,var(--color-cyan-300),var(--color-indigo-500),var(--color-pink-300),var(--color-primary),var(--color-cyan-300))]'
          : 'bg-border',
        className
      )}
    >
      <div className="flex flex-col gap-4 rounded-[13px] bg-background p-5">
        <p className="text-sm font-semibold text-popover-foreground">
          {title ?? defaultTitle}
        </p>

        {usageStats.length > 0 && (
        <div className="flex flex-col gap-3">
          {usageStats.map((stat, index) => (
            <div key={index} className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-1">
                <span className="text-base font-semibold text-card-foreground">
                  {formatStatValue(stat.value)}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <Progress value={stat.percent} className="h-2" />
            </div>
          ))}
        </div>
        )}

        {!hideAction && (
          <Button
            variant={variant === 'paid' ? 'outline' : 'default'}
            className="w-full"
            onClick={onAction}
            {...buttonProps}
          >
            <Zap className="size-4" />
            {buttonText ?? defaultButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}
