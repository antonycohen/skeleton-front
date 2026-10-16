import {useMemo, useState} from 'react';
import {PlanSummary} from '@skeleton/web-components';
import {ReadQuota, ReadSubscription} from '@skeleton/core-api-models';
import {formatPrice} from '../../../hooks/use-plan-options';
import {useTranslation} from '@skeleton/core-translations';
import {getQuotaIncludedItems, getQuotaUsageMetrics} from '../../../utils/quota-usage';

export type CompactPlanSummaryProps = {
  planName: string;
  isPro: boolean;
  badgeStatusVariant: 'green' | 'red' | 'yellow';
  badgeStatusLabel: string;
  quotas: ReadQuota[] | null | undefined;
  subscription: ReadSubscription | null | undefined;
};

export function CompactPlanSummary({
  planName,
  isPro,
  badgeStatusVariant,
  badgeStatusLabel,
  quotas,
  subscription,
}: CompactPlanSummaryProps) {
  const { t } = useTranslation();
  const unitAmountInCents = subscription?.items?.[0]?.price?.unitAmountInCents ?? 0;
  const currency = subscription?.items?.[0]?.price?.currency ?? 'usd';

  const recurringInterval = subscription?.items?.[0]?.price?.recurringInterval ?? 'year';
  const priceLabel = {
    day: t('billing.plan.interval.day'),
    week: t('billing.plan.interval.week'),
    month: t('billing.plan.interval.month'),
    year: t('billing.plan.interval.year'),
  }[recurringInterval] ?? recurringInterval;

  // Read the two dates once so each memo below reads exactly what it lists as a
  // dependency. Reaching through `subscription` inside the body while depending
  // only on its fields leaves the two out of step, which the compiler refuses.
  const currentPeriodStart = subscription?.currentPeriodStart;
  const currentPeriodEnd = subscription?.currentPeriodEnd;

  const usagePeriod = useMemo(() => {
    if (!currentPeriodStart || !currentPeriodEnd) return undefined;
    const start = new Date(currentPeriodStart);
    const end = new Date(currentPeriodEnd);
    const fmt = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(start)} - ${fmt(end)}`;
  }, [currentPeriodStart, currentPeriodEnd]);

  // Reading the clock during render is impure — the countdown would drift with
  // whatever unrelated re-render happened to come next. Sampling it once when the
  // modal mounts is both pure and what the display already assumed, since nothing
  // here re-renders on a timer.
  const [now] = useState(() => Date.now());

  const usagePeriodReset = useMemo(() => {
    if (!currentPeriodEnd) return undefined;
    const end = new Date(currentPeriodEnd);
    const diffDays = Math.ceil((end.getTime() - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return undefined;
    return t('billing.plan.resetIn', { count: diffDays });
  }, [currentPeriodEnd, now, t]);

  return (
    <PlanSummary
      compact
      planName={planName}
      isPro={isPro}
      badgeStatusVariant={badgeStatusVariant}
      badgeStatusLabel={badgeStatusLabel}
      usageMetrics={getQuotaUsageMetrics(t, quotas)}
      price={formatPrice(unitAmountInCents, currency)}
      priceLabel={priceLabel}
      included={getQuotaIncludedItems(quotas)}
      subscriptionDate={subscription?.startDate ? new Date(subscription.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
      usagePeriod={usagePeriod}
      usagePeriodReset={usagePeriodReset}
    />
  );
}
