import {useCurrentOrganization} from "@skeleton/core-workspace";
import {getQuotaUsageMetrics} from "../utils/quota-usage";
import {useManageSubscription} from "../hooks/use-manage-subscription";
import {CardPlan} from "@skeleton/web-components";
import {useOpenPaywall} from "../modal/paywall-pro-required-modal/paywall-pro-required-modal";
import {useTranslation} from "@skeleton/core-translations";

export const SubscriptionPlanCard = () => {

  const { t } = useTranslation();
  const { openPaywall } = useOpenPaywall();

  const currentOrganization = useCurrentOrganization();
  const isSubscribed = currentOrganization.subscription !== null;

  const { handleManageSubscription, isPending } = useManageSubscription();

  return <CardPlan
    className="group-data-[collapsible=icon]:hidden"
    onAction={() => {
      if(!isSubscribed) {
        openPaywall()
      }else {
        handleManageSubscription()
      }
    }}
    buttonProps={{
      disabled: isPending
    }}
    variant={isSubscribed ? 'paid' : 'free'}
    usageStats={getQuotaUsageMetrics(t, currentOrganization.activeQuotas)}
  />
}
