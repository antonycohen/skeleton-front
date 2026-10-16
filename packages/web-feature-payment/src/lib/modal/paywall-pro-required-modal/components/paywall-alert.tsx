import {CircleAlertIcon, SparklesIcon} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@skeleton/web-components';
import {ReadQuota} from '@skeleton/core-api-models';
import type {HashParams} from '../hooks/use-paywall-hash';
import {type TFunction, useTranslation} from '@skeleton/core-translations';
import {getQuotaLabel} from '../../../utils/quota-usage';

/**
 * Features of a higher plan. Offering one is not an error: the alert reads as the product's own
 * upsell (the brand's indigo `important` variant, as the Enterprise badge of the security page), not
 * in the red of a limit that was hit.
 */
const getFeatureUpsellContent = (t: TFunction) => ({
  'role': {
    title: t('billing.paywall.role.title'),
    description: t('billing.paywall.role.description'),
  },
  'sso': {
    title: t('billing.paywall.sso.title'),
    description: t('billing.paywall.sso.description'),
  },
});

/**
 * - `upsell`: a feature of another plan, offered;
 * - `limit`: a quota the workspace ran out of, which blocks what it was doing.
 */
type AlertTone = 'upsell' | 'limit';

type AlertContent = { title: string; description: string; tone: AlertTone };

function getAlertContent(
  t: TFunction,
  reason: string | undefined,
  isQuotaExceeded: boolean,
  quota: ReadQuota | undefined,
): AlertContent | null {
  if (!reason) return null;

  if (isQuotaExceeded) {
    const label = getQuotaLabel(quota) || t('billing.paywall.quotaExceeded.usage');
    return {
      title: t('billing.paywall.quotaExceeded.title', { label }),
      description: t('billing.paywall.quotaExceeded.description', { count: quota?.remainingQuota ?? 0, label }),
      tone: 'limit',
    };
  }

  const featureUpsellContent = getFeatureUpsellContent(t);
  if (reason in featureUpsellContent) {
    return {
      ...featureUpsellContent[reason as keyof typeof featureUpsellContent],
      tone: 'upsell',
    };
  }

  return null;
}

export type PaywallAlertProps = {
  hashParams: HashParams | null;
  /** From `usePaywallHash`, which owns the classification of the reason: not re-derived here. */
  isQuotaExceeded: boolean;
  /** The exhausted quota, for `quota_exceeded`. */
  quota: ReadQuota | undefined;
};

export function PaywallAlert({
  hashParams,
  isQuotaExceeded,
  quota,
}: PaywallAlertProps) {
  const { t } = useTranslation();
  const alertContent = getAlertContent(t, hashParams?.reason, isQuotaExceeded, quota);

  if (!alertContent) return null;

  if (alertContent.tone === 'upsell') {
    return (
      <Alert variant="important" className="py-4">
        <SparklesIcon className="size-4" />
        <AlertTitle>{alertContent.title}</AlertTitle>
        <AlertDescription>{alertContent.description}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="rounded-2xl border-rose-100 bg-rose-50 py-4">
      <CircleAlertIcon className="size-4" />
      <AlertTitle>{alertContent.title}</AlertTitle>
      <AlertDescription className="text-destructive/90">{alertContent.description}</AlertDescription>
    </Alert>
  );
}
