'use client';

import {useCallback, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {SparklesIcon, XIcon} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import {useCurrentOrganization, useGetCurrentQuotas, useGetCurrentWorkspaceId, useSubscriptionPlan} from '@skeleton/core-workspace';

import {useTranslation} from '@skeleton/core-translations';
import {ENTERPRISE_SALES_URL, usePaywallHash} from './hooks/use-paywall-hash';
import {usePaywallProducts} from './hooks/use-paywall-products';
import {usePaywallCheckout} from './hooks/use-paywall-checkout';
import {PaywallAlert} from './components/paywall-alert';
import {CompactPlanSummary} from './components/compact-plan-summary';
import {UpgradeSection} from './components/upgrade-section';
import {PaywallFooter} from './components/paywall-footer';

export type {PaywallReason, UseOpenPaywallOptions} from './hooks/use-paywall-hash';
export {useOpenPaywall} from './hooks/use-paywall-hash';

export type PaywallProRequiredModalProps = {
  hashKey?: string;
  onUpgrade?: (selectedPriceId: string) => void;
};

export function PaywallProRequiredModal({
  hashKey = 'paywall-pro',
  onUpgrade,
}: PaywallProRequiredModalProps) {
  const { t } = useTranslation();
  const currentOrganizationId = useGetCurrentWorkspaceId();
  const currentOrganization = useCurrentOrganization();
  const { planName, hasActiveSubscription, subscriptionBadgeStatusProp, subscriptionBadgeStatusLabel } = useSubscriptionPlan();

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const { hashParams, isOpen, isQuotaExceeded, showPlanSummary, isSalesOnly } = usePaywallHash(hashKey);
  const { planOptions, selectedProduct, selectedPrice, displayPrice, annualSavings, features } = usePaywallProducts(selectedProductId, isAnnual);
  const { createCheckoutSession, isCheckoutPending } = usePaywallCheckout();

  const { getQuota } = useGetCurrentQuotas();
  const exhaustedQuota = hashParams?.quota ? getQuota(hashParams.quota) : undefined;

  const handleClose = useCallback(() => {
    navigate({ hash: '' }, { replace: true });
  }, [navigate]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) handleClose();
    },
    [handleClose],
  );

  const handleUpgrade = () => {
    if (selectedPrice?.id && currentOrganizationId) {
      const baseUrl = window.location.origin;
      const currentPath = location.pathname;

      createCheckoutSession({
        organizationId: currentOrganizationId,
        priceId: selectedPrice.id,
        successUrl: `${baseUrl}${currentPath}#checkout-succeed`,
        cancelUrl: `${baseUrl}${currentPath}?checkout=canceled`,
      });

      onUpgrade?.(selectedPrice.id);
    }
  };

  const modalTitle = isSalesOnly
    ? t('billing.paywall.title.enterprise')
    : isQuotaExceeded
      ? t('billing.paywall.title.quotaExceeded')
      : t('billing.paywall.title.upgrade');

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl gap-6 rounded-3xl p-8" showCloseButton={false}>
        <DialogHeader className="flex-row items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <SparklesIcon className="size-5" />
          </div>
          <DialogTitle className="grow font-heading text-xl tracking-[-0.4px]">
            {modalTitle}
          </DialogTitle>
          <button
            onClick={handleClose}
            className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
          >
            <XIcon className="size-6" />
            <span className="sr-only">{t('common.close')}</span>
          </button>
        </DialogHeader>

        <div className="flex flex-col gap-6 -mx-4 no-scrollbar max-h-[75vh] overflow-y-auto px-4">
          <PaywallAlert
            hashParams={hashParams}
            isQuotaExceeded={isQuotaExceeded}
            quota={exhaustedQuota}
          />

          {showPlanSummary && (
            <CompactPlanSummary
              planName={planName}
              isPro={hasActiveSubscription}
              badgeStatusVariant={subscriptionBadgeStatusProp}
              badgeStatusLabel={subscriptionBadgeStatusLabel}
              quotas={currentOrganization.activeQuotas}
              subscription={currentOrganization.subscription}
            />
          )}

          {/* No self-serve price covers this reason: the alert above says what is missing. */}
          {!isSalesOnly && (
            <UpgradeSection
              displayPrice={displayPrice}
              isAnnual={isAnnual}
              onAnnualChange={setIsAnnual}
              annualSavings={annualSavings}
              planOptions={planOptions}
              selectedProductId={(selectedProduct?.id as string) ?? undefined}
              onProductChange={setSelectedProductId}
              features={features}
            />
          )}
        </div>

        <PaywallFooter
          salesUrl={isSalesOnly ? ENTERPRISE_SALES_URL : undefined}
          isCheckoutPending={isCheckoutPending}
          onClose={handleClose}
          onUpgrade={handleUpgrade}
        />
      </DialogContent>
    </Dialog>
  );
}
