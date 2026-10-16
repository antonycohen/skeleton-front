import { ReactNode, useMemo } from 'react';
import { IconCopy, IconEdit } from '@tabler/icons-react';
import { toast } from 'sonner';
import { ReadProduct } from '@skeleton/core-api-models';
import { useTranslation } from '@skeleton/core-translations';

export type RowAction = {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
};

type UseProductRowActionsParams = {
  product: ReadProduct;
  onEdit: (product: ReadProduct) => void;
};

export const useProductRowActions = ({
  product,
  onEdit,
}: UseProductRowActionsParams): RowAction[] => {
  const { t } = useTranslation();
  return useMemo<RowAction[]>(
    () => [
      {
        key: 'edit',
        label: t('common.edit'),
        icon: <IconEdit className="size-4" />,
        onClick: () => onEdit(product),
      },
      {
        key: 'copy-id',
        label: t('adminPayment.copyId'),
        icon: <IconCopy className="size-4" />,
        disabled: !product.id,
        onClick: () => {
          if (!product.id) return;
          navigator.clipboard.writeText(product.id);
          toast.success(t('adminPayment.products.idCopied'));
        },
      },
    ],
    [product, onEdit, t],
  );
};
