'use client';

import {useCallback, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {CheckCircle2Icon, XIcon} from 'lucide-react';
import {
  Alert,
  AlertTitle,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  PlanBadge,
} from '@skeleton/web-components';
import {useCurrentOrganization} from "@skeleton/core-workspace";
import {useTranslation} from "@skeleton/core-translations";
import {getQuotaLabel} from "../../utils/quota-usage";

export type CheckoutSucceedModalProps = {
  hashKey?: string;
  planName?: string;
  heroImageUrl?: string;
  showCelebration?: boolean;
  onClose?: () => void;
  onManageSubscription?: () => void;
};

function parseHash(hash: string, hashKey: string): boolean {
  return hash === `#${hashKey}`;
}

export function CheckoutSucceedModal({
  hashKey = 'checkout-succeed',
  planName = 'Pro',
  heroImageUrl = '/checkout.svg',
  showCelebration = true,
  onClose,
  onManageSubscription,
}: CheckoutSucceedModalProps) {
  const { t } = useTranslation();

  const currentOrganization = useCurrentOrganization();

  const quotas = (currentOrganization.activeQuotas ?? []).map((quota) => ({
    label: t('billing.quota.amount', { value: quota.quotaLimit ?? 0, label: getQuotaLabel(quota) }),
    period: t('billing.checkout.perMonth'),
  }));

  const location = useLocation();
  const navigate = useNavigate();

  const isOpen = useMemo(() => {
    return parseHash(location.hash, hashKey);
  }, [location.hash, hashKey]);

  const handleClose = useCallback(() => {
    navigate({ hash: '' }, { replace: true });
    onClose?.();
  }, [navigate, onClose]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        handleClose();
      }
    },
    [handleClose]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg gap-6 p-8" showCloseButton={false}>
        <DialogHeader className="flex-row items-center gap-4">
          <DialogTitle className="grow text-2xl">{t('billing.checkout.title')}</DialogTitle>
          <button
            onClick={handleClose}
            className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
          >
            <XIcon className="size-6" />
            <span className="sr-only">{t('common.close')}</span>
          </button>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="h-[108px] w-full overflow-hidden rounded-md">
            <img
              src={heroImageUrl}
              alt={t('billing.checkout.illustrationAlt')}
              className="h-full w-full object-cover"
            />
          </div>

          <Alert className="border-teal-600 bg-teal-50 text-teal-800">
            <CheckCircle2Icon className="size-4 text-teal-700" />
            <AlertTitle className="text-teal-800">
              {t('billing.checkout.planActive', { planName })}
            </AlertTitle>
          </Alert>

          <div className="flex flex-col gap-4 rounded-md border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{t('billing.checkout.currentPlan')}</p>
              <PlanBadge label={planName} />
            </div>

            <div className="flex flex-col gap-2">
              {quotas.map((quota, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Badge variant="outline" className="rounded-md">
                    {quota.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{quota.period}</span>
                </div>
              ))}
            </div>

            {onManageSubscription && (
              <div className="flex justify-end">
                <Button onClick={onManageSubscription}>{t('billing.manageSubscription')}</Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
