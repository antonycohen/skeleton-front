import { useCurrentOrganization } from '../provider/workspace-provider';

type SubscriptionBadgeStatus = 'green' | 'red' | 'yellow';

export const useSubscriptionPlan = () => {
  const currentOrganization = useCurrentOrganization();
  const subscription = currentOrganization.subscription;

  const planName = subscription
    ? (subscription.productGroup?.name ?? 'Pro')
    : 'Free';

  const hasActiveSubscription = subscription !== null;

  let subscriptionBadgeStatusProp: SubscriptionBadgeStatus;
  let subscriptionBadgeStatusLabel: string;

  if (!subscription) {
    subscriptionBadgeStatusProp = 'red';
    subscriptionBadgeStatusLabel = 'Inactive';
  } else if (subscription.cancelAt) {
    subscriptionBadgeStatusProp = 'yellow';
    subscriptionBadgeStatusLabel = 'Cancellation scheduled';
  } else {
    subscriptionBadgeStatusProp = 'green';
    subscriptionBadgeStatusLabel = 'Active';
  }

  return {
    planName,
    hasActiveSubscription,
    subscriptionBadgeStatusProp,
    subscriptionBadgeStatusLabel,
  };
};
