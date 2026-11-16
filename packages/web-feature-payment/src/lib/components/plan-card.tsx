import {useCurrentOrganization, useSubscriptionPlan} from "@skeleton/core-workspace";
import {getQuotaUsageStats} from "../utils/quota-usage";
import {useManageSubscription} from "../hooks/use-manage-subscription";
import {CardPlan} from "@skeleton/web-components";
import {useOpenPaywall} from "../modal/paywall-pro-required-modal/paywall-pro-required-modal";

/**
 * `inMenu`: the workspace menu's version: the plan named above the usage ("Free plan"), where nothing
 * else names it, and the first quota alone.
 */
export const SubscriptionPlanCard = ({ inMenu = false }: { inMenu?: boolean }) => {

  const { openPaywall } = useOpenPaywall();

  const currentOrganization = useCurrentOrganization();
  const isSubscribed = currentOrganization.subscription !== null;

  const { handleManageSubscription, isPending } = useManageSubscription();
  const { planName } = useSubscriptionPlan();

  const usageStats = getQuotaUsageStats(currentOrganization.activeQuotas);

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
    planName={inMenu ? planName : undefined}
    usageStats={inMenu ? usageStats.slice(0, 1) : usageStats}
  />
}
