import {Button, DialogFooter} from '@skeleton/web-components';
import {useTranslation} from '@skeleton/core-translations';

export type PaywallFooterProps = {
  /** Set for a reason no self-serve plan covers: the only action is talking to sales. */
  salesUrl?: string;
  isCheckoutPending: boolean;
  onClose: () => void;
  onUpgrade: () => void;
};

export function PaywallFooter({
  salesUrl,
  isCheckoutPending,
  onClose,
  onUpgrade,
}: PaywallFooterProps) {
  const { t } = useTranslation();
  return (
    <DialogFooter className="flex-row items-center justify-between sm:justify-between">
      <Button variant="ghost" onClick={onClose}>
        {t('common.cancel')}
      </Button>
      <div className="flex items-center gap-2">
        {salesUrl ? (
          <Button asChild>
            <a href={salesUrl} target="_blank" rel="noreferrer">
              {t('billing.paywall.talkToSales')}
            </a>
          </Button>
        ) : (
          <>
            <Button onClick={onUpgrade} disabled={isCheckoutPending}>
              {isCheckoutPending ? t('billing.redirecting') : t('billing.paywall.upgrade')}
            </Button>
          </>
        )}
      </div>
    </DialogFooter>
  );
}
