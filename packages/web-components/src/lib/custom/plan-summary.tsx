import {ArrowUpFromLine} from 'lucide-react';
import {cn} from '@skeleton/core-utils';
import {useTranslation} from '@skeleton/core-translations';
import {Badge} from '../ui/badge';
import {Button} from '../ui/button';
import {Progress} from '../ui/progress';
import {PlanBadge} from "./plan-badge";
import {ComponentProps} from "react";
import {BadgeStatus, BadgeStatusVariant} from "./badge-status";

function formatCompactNumber(value: string | number): string {
  const num = typeof value === 'string' ? Number(value) : value;
  if (isNaN(num)) return String(value);
  if (num >= 1_000_000) return `${+(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${+(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export type PlanUsageStat = {
  value: string | number;
  label: string;
  percent: number;
};

export type PlanSummaryProps = {
  planName: string;
  isPro?: boolean;
  compact?: boolean;
  badgeStatusVariant: BadgeStatusVariant;
  badgeStatusLabel: string;
  usageMetrics: PlanUsageStat[];
  price: string;
  priceLabel?: string;
  included: { value: string; label: string }[];
  subscriptionDate?: string;
  usagePeriod?: string;
  usagePeriodReset?: string;
  onUpgrade?: () => void;
  upgradeLabel?: string;
  upgradeButtonProps?: ComponentProps<typeof Button>;
  /** Hides the upgrade footer (e.g. plans that cannot be self-upgraded). */
  hideUpgrade?: boolean;
  className?: string;
};

export function PlanSummary({
  planName,
  isPro = false,
  compact = false,
  badgeStatusVariant,
  badgeStatusLabel,
  usageMetrics,
  price,
  priceLabel,
  included,
  subscriptionDate,
  usagePeriod,
  usagePeriodReset,
  onUpgrade,
  upgradeLabel,
  upgradeButtonProps,
  hideUpgrade = false,
  className,
}: PlanSummaryProps) {
  const {t} = useTranslation();

  return (
    <div className={cn('flex flex-col w-full', className)}>
      {/* Main Card Content */}
      <div className={cn("bg-card border border-border p-6", compact || hideUpgrade ? "rounded-2xl" : "rounded-t-2xl")}>
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-card-foreground font-heading">
              {t('components.planSummary.title')}
            </h2>
            {isPro ? (
              <PlanBadge label={planName} />
            ) : (<Badge variant="secondary" className="rounded-md">
              {planName}
            </Badge>)}
            <BadgeStatus variant={badgeStatusVariant}>{badgeStatusLabel}</BadgeStatus>
          </div>

          {/* Usage Metrics with Progress Bars */}
          <div className="flex gap-4">
            {usageMetrics.map((metric, index) => {
              const progressValue = metric.percent;
              return (
                <div key={index} className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-base font-bold text-card-foreground">
                      {formatCompactNumber(metric.value)}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {metric.label}
                    </span>
                  </div>
                  <Progress value={progressValue} />
                </div>
              );
            })}
          </div>

          {/* Stats Row */}
          <div className="flex items-start justify-between">
            {/* Price Column */}
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">{t('components.planSummary.price')}</p>
              <div className="flex flex-col gap-0.5">
                <p className="text-base font-semibold text-card-foreground">
                  {price}
                </p>
                {priceLabel && (
                  <p className="text-xs font-medium text-muted-foreground">
                    {priceLabel}
                  </p>
                )}
              </div>
            </div>

            {/* Included Column */}
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">{t('components.planSummary.included')}</p>
              <div className="flex flex-col gap-0">
                {included.map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <span className="text-base font-bold text-card-foreground">
                      {formatCompactNumber(item.value)}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription Date Column */}
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">{t('components.planSummary.subscriptionDate')}</p>
              <p className="text-base font-bold text-card-foreground">
                {subscriptionDate ?? '-'}
              </p>
            </div>

            {/* Usage Period Column */}
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">{t('components.planSummary.usagePeriod')}</p>
              <div className="flex flex-col gap-0.5">
                <p className="text-base font-bold text-card-foreground">
                  {usagePeriod ?? '-'}
                </p>
                {usagePeriodReset && (
                  <p className="text-xs font-medium text-muted-foreground">
                    {usagePeriodReset}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Upgrade Button */}
      {!compact && !hideUpgrade && (
        <div className="bg-muted border-x border-b border-border rounded-b-2xl p-6 flex items-center justify-end">
          <Button onClick={onUpgrade} {...upgradeButtonProps}>
            <ArrowUpFromLine className="size-4" />
            {upgradeLabel ?? t('components.planSummary.upgrade')}
          </Button>
        </div>
      )}
    </div>
  );
}
