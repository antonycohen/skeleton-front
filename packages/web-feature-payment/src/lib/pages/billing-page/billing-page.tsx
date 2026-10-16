import {Alert, AlertTitle, Button} from '@skeleton/web-components';
import {useCurrentOrganization} from "@skeleton/core-workspace";
import {useManageSubscription} from "../../hooks/use-manage-subscription";
import {SubscriptionPlanSummary} from "../../components/plan-summary";
import {CircleXIcon} from "lucide-react";
import {useSubscriptionCancel} from "../../hooks/use-subscription-cancel";
import {LayoutContent, LayoutHeader, LayoutTopbar} from "@skeleton/web-layout";
import {useTranslation} from "@skeleton/core-translations";

export function BillingPage() {
  const { t } = useTranslation();
  const currentOrganization = useCurrentOrganization();

  const isSubscribed = currentOrganization.subscription !== null;

  const { handleManageSubscription, isPending } = useManageSubscription();
  const { handleSubscriptionCancel, isPending: isCancelPending } = useSubscriptionCancel();

  const cancelAt = currentOrganization.subscription?.cancelAt;
  const subscriptionStatus = currentOrganization.subscription?.status;

  const formatCancelDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const handleReactivate = () => {
    handleManageSubscription();
  };

  return (
    <div>
      <header className="sticky top-0 z-30">
        <LayoutTopbar />
      </header>

      <LayoutContent>
        <LayoutHeader
          pageTitle={t('billing.page.title')}
          pageDescription={t('billing.page.description')}
        />

        {/* Main Content */}
        <div className="flex flex-col gap-8 max-w-[1056px]">
          {/* Cancellation Alert */}
          {cancelAt && (
            <Alert className="flex items-center justify-between border-rose-200 bg-rose-50">
              <div className="flex items-center gap-3">
                <CircleXIcon className="size-4 text-destructive" />
                <AlertTitle className="text-destructive">
                  {t('billing.page.cancelsOn', { date: formatCancelDate(cancelAt) })}
                </AlertTitle>
              </div>
              <Button variant="outline" size="sm" onClick={handleReactivate} disabled={isPending}>
                {t('billing.page.reactivate')}
              </Button>
            </Alert>
          )}

          {subscriptionStatus === 'past_due' && (
            <Alert className="flex items-center justify-between border-rose-200 bg-rose-50">
              <div className="flex items-center gap-3">
                <CircleXIcon className="size-4 text-destructive" />
                <AlertTitle className="text-destructive">
                  {t('billing.page.pastDue')}
                </AlertTitle>
              </div>
              <Button variant="outline" size="sm" onClick={handleReactivate} disabled={isPending}>
                {t('billing.page.update')}
              </Button>
            </Alert>
          )}

          {/* Manage Subscription Button */}
          <div className="flex items-start">
            <Button variant="outline" disabled={!isSubscribed || isPending}  onClick={handleManageSubscription}>
              {isPending ? t('billing.redirecting') : t('billing.manageSubscription')}
            </Button>
          </div>

          {/* Plan Summary */}
          <SubscriptionPlanSummary />

          {/* Cancellation Section */}
          {!cancelAt && (
            <div className="flex items-center justify-between pt-9">
              <h2 className="text-xl font-semibold tracking-tight text-foreground font-heading">
                {t('billing.page.cancellation')}
              </h2>
              <Button variant="destructive" disabled={!isSubscribed || isCancelPending} onClick={handleSubscriptionCancel}>
                {t('billing.page.cancelPlan')}
              </Button>
            </div>
          )}
        </div>
      </LayoutContent>
    </div>
  );
}
