import {useCurrentOrganization, useSubscriptionPlan} from "@skeleton/core-workspace";
import {PlanSummary} from "@skeleton/web-components";
import {useOpenPaywall} from "../modal/paywall-pro-required-modal/paywall-pro-required-modal";
import {useSubscriptionUpdate} from "../hooks/use-subscription-update";
import {getQuotaIncludedItems, getQuotaUsageMetrics} from "../utils/quota-usage";
import {useTranslation} from "@skeleton/core-translations";

export const SubscriptionPlanSummary = () => {

  const { t } = useTranslation();
  const { openPaywall } = useOpenPaywall();

  const currentOrganization = useCurrentOrganization();
  const { handleSubscriptionUpdate, isPending } = useSubscriptionUpdate();
  const { planName, hasActiveSubscription, subscriptionBadgeStatusProp, subscriptionBadgeStatusLabel } = useSubscriptionPlan();
  const subscription = currentOrganization.subscription;


  const unitAmountInCents = subscription?.items?.[0]?.price?.unitAmountInCents ?? 0;
  const currency = subscription?.items?.[0]?.price?.currency ?? 'usd';

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(unitAmountInCents / 100);

  const formatUsagePeriod = () => {
    if (!subscription?.currentPeriodStart || !subscription?.currentPeriodEnd) {
      return undefined;
    }

    const start = new Date(subscription.currentPeriodStart);
    const end = new Date(subscription.currentPeriodEnd);

    const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    const year = end.getFullYear();

    return `${formatDate(start)} - ${formatDate(end)}, ${year}`;
  }

  const recurringIntervalCount = subscription?.items?.[0]?.price?.recurringIntervalCount ?? 1;
  const recurringInterval = subscription?.items?.[0]?.price?.recurringInterval ?? 'year';

  const getRecurringLabel = () => {
    const count = recurringIntervalCount;
    switch (recurringInterval) {
      case 'day':
        return t('billing.plan.every.day', { count });
      case 'week':
        return t('billing.plan.every.week', { count });
      case 'month':
        return t('billing.plan.every.month', { count });
      default:
        return t('billing.plan.every.year', { count });
    }
  }

  return <PlanSummary
    planName={planName}
    isPro={hasActiveSubscription}
    upgradeLabel={(hasActiveSubscription ? t('billing.plan.upgradePlan') : t('billing.plan.upgradeToPro'))}
    upgradeButtonProps={{ disabled: isPending }}
    badgeStatusVariant={subscriptionBadgeStatusProp}
    badgeStatusLabel={subscriptionBadgeStatusLabel}
    usageMetrics={getQuotaUsageMetrics(t, currentOrganization.activeQuotas)}
    price={formattedPrice}
    priceLabel={getRecurringLabel()}
    included={getQuotaIncludedItems(currentOrganization.activeQuotas)}
    subscriptionDate={ subscription?.startDate ? new Date(subscription.startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }): '-'}
    usagePeriod={formatUsagePeriod()}
    onUpgrade={() => {
      if(!hasActiveSubscription) {
        openPaywall()
      }else {
        handleSubscriptionUpdate()
      }
    }}
  />
}
