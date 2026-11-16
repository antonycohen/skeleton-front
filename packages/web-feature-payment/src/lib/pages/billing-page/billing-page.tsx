import {Alert, AlertAction, AlertTitle, Button} from '@skeleton/web-components';
import {useCurrentOrganization} from "@skeleton/core-workspace";
import {useManageSubscription} from "../../hooks/use-manage-subscription";
import {SubscriptionPlanSummary} from "../../components/plan-summary";
import {CircleAlertIcon, TriangleAlertIcon} from "lucide-react";
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

      <LayoutContent width="narrow">
        <LayoutHeader
          pageTitle={t('billing.page.title')}
          pageDescription={t('billing.page.description')}
        />

        {/* Main Content */}
        <div className="flex flex-col gap-8">
          {/* Cancellation Alert */}
          {cancelAt && (
            <Alert variant="warning">
              <TriangleAlertIcon />
              <AlertTitle>{t('billing.page.cancelsOn', { date: formatCancelDate(cancelAt) })}</AlertTitle>
              <AlertAction>
                <Button variant="outline" size="sm" onClick={handleReactivate} disabled={isPending}>
                  {t('billing.page.reactivate')}
                </Button>
              </AlertAction>
            </Alert>
          )}

          {subscriptionStatus === 'past_due' && (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertTitle>
                {t('billing.page.pastDue')}
              </AlertTitle>
              <AlertAction>
                <Button variant="outline" size="sm" onClick={handleReactivate} disabled={isPending}>
                  {t('billing.page.update')}
                </Button>
              </AlertAction>
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
              <h2 className="heading-sm text-foreground">
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
