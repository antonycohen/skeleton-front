import { ReadPrice } from '@skeleton/core-api-models';
import { BadgeStatus } from '@skeleton/web-components';
import { usePriceRowActions } from '../hooks/use-price-row-actions';
import { formatAmount } from '../../../../../utils/format-amount';
import { RowActionsMenu } from './row-actions-menu';
import { useTranslation } from '@skeleton/core-translations';

type PriceRowProps = {
  price: ReadPrice;
  onEdit: (price: ReadPrice) => void;
  onToggle: (price: ReadPrice) => void;
  isToggling: boolean;
};

export const PriceRow = ({
  price,
  onEdit,
  onToggle,
  isToggling,
}: PriceRowProps) => {
  const { t } = useTranslation();
  const actions = usePriceRowActions({ price, onEdit, onToggle, isToggling });
  const isActive = price.active ?? false;
  const intervalLabels: Record<string, string> = {
    day: t('adminPayment.prices.perDay'),
    week: t('adminPayment.prices.perWeek'),
    month: t('adminPayment.prices.perMonth'),
    year: t('adminPayment.prices.perYear'),
  };
  const usageTypeLabels: Record<string, string> = {
    licensed: t('adminPayment.price.usageType.licensed'),
    metered: t('adminPayment.price.usageType.metered'),
  };

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/50">
      <div className="flex flex-col min-w-0 flex-1 gap-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium truncate">
            {price.nickname || price.lookupKey || t('adminPayment.prices.untitled')}
          </span>
          {isActive ? (
            <BadgeStatus variant="green">{t('adminPayment.status.active')}</BadgeStatus>
          ) : (
            <BadgeStatus variant="red">{t('adminPayment.status.inactive')}</BadgeStatus>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
          {price.lookupKey ? (
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono truncate">
              {price.lookupKey}
            </code>
          ) : null}
          {price.recurringUsageType ? (
            <span className="capitalize">
              {usageTypeLabels[price.recurringUsageType] ?? price.recurringUsageType}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col items-end leading-tight">
          <span className="font-semibold tabular-nums">
            {formatAmount(price.unitAmountInCents, price.currency)}
          </span>
          {price.recurringInterval ? (
            <span className="text-xs text-muted-foreground">
              {intervalLabels[price.recurringInterval] ?? `/ ${price.recurringInterval}`}
            </span>
          ) : null}
        </div>
        <RowActionsMenu actions={actions} />
      </div>
    </li>
  );
};
