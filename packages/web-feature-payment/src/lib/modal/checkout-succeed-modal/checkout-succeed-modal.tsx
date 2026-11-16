'use client';

import {useCallback, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {CheckCircle2Icon} from 'lucide-react';
import {
  Alert,
  AlertTitle,
  Badge,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogMedia,
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
      {/* A success: its illustration on top, a centered title, the plan in the body. */}
      <DialogContent>
        <DialogMedia>
          <img
            src={heroImageUrl}
            alt={t('billing.checkout.illustrationAlt')}
            className="h-[108px] object-cover"
          />
        </DialogMedia>
        <DialogHeader className="items-center text-center sm:text-center">
          <DialogTitle className="heading-sm">{t('billing.checkout.title')}</DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <Alert variant="success">
            <CheckCircle2Icon />
            <AlertTitle>
              {t('billing.checkout.planActive', { planName })}
            </AlertTitle>
          </Alert>

          <div className="flex flex-col gap-4 rounded-md border p-4">
            <div className="flex items-center justify-between">
              <p className="label">{t('billing.checkout.currentPlan')}</p>
              <PlanBadge label={planName} />
            </div>

            <div className="flex flex-col gap-2">
              {quotas.map((quota, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Badge variant="outline">
                    {quota.label}
                  </Badge>
                  <span className="body text-muted-foreground">{quota.period}</span>
                </div>
              ))}
            </div>

            {onManageSubscription && (
              <div className="flex justify-end">
                <Button onClick={onManageSubscription}>{t('billing.manageSubscription')}</Button>
              </div>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
