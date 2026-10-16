import { useMemo } from 'react';
import { IconCopy, IconEdit, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { toast } from 'sonner';
import { ReadPrice } from '@skeleton/core-api-models';
import { RowAction } from './use-product-row-actions';
import { useTranslation } from '@skeleton/core-translations';

type UsePriceRowActionsParams = {
  price: ReadPrice;
  onEdit: (price: ReadPrice) => void;
  onToggle: (price: ReadPrice) => void;
  isToggling?: boolean;
};

export const usePriceRowActions = ({
  price,
  onEdit,
  onToggle,
  isToggling,
}: UsePriceRowActionsParams): RowAction[] => {
  const { t } = useTranslation();
  return useMemo<RowAction[]>(() => {
    const isActive = price.active ?? false;
    return [
      {
        key: 'edit',
        label: t('common.edit'),
        icon: <IconEdit className="size-4" />,
        onClick: () => onEdit(price),
      },
      {
        key: 'toggle',
        label: isActive ? t('adminPayment.prices.disable') : t('adminPayment.prices.activate'),
        icon: isActive ? (
          <IconPlayerPause className="size-4" />
        ) : (
          <IconPlayerPlay className="size-4" />
        ),
        disabled: isToggling,
        onClick: () => onToggle(price),
      },
      {
        key: 'copy-id',
        label: t('adminPayment.copyId'),
        icon: <IconCopy className="size-4" />,
        disabled: !price.id,
        onClick: () => {
          if (!price.id) return;
          navigator.clipboard.writeText(price.id);
          toast.success(t('adminPayment.prices.idCopied'));
        },
      },
    ];
  }, [price, onEdit, onToggle, isToggling, t]);
};

export type { RowAction };
