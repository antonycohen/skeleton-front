import { ReadProduct } from '@skeleton/core-api-models';
import { BadgeStatus } from '@skeleton/web-components';
import { cn } from '@skeleton/core-utils';
import { IconGripVertical } from '@tabler/icons-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useProductRowActions } from '../hooks/use-product-row-actions';
import { RowActionsMenu } from './row-actions-menu';
import { useTranslation } from '@skeleton/core-translations';

type ProductRowProps = {
  product: ReadProduct;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (product: ReadProduct) => void;
};

export const ProductRow = ({
  product,
  isSelected,
  onSelect,
  onEdit,
}: ProductRowProps) => {
  const { t } = useTranslation();
  const actions = useProductRowActions({ product, onEdit });
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id ?? '', disabled: !product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 rounded-lg px-2 py-3 cursor-pointer transition-colors',
        isSelected ? 'bg-accent' : 'hover:bg-muted',
        isDragging && 'z-10 shadow-sm bg-background',
      )}
      onClick={onSelect}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={t('adminPayment.products.reorder')}
        className="shrink-0 flex h-7 w-5 items-center justify-center text-muted-foreground cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        onClick={(e) => e.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        <IconGripVertical className="size-4" />
      </button>
      <div className="flex flex-col min-w-0 flex-1 gap-1">
        <span className="font-medium truncate">{product.name ?? '-'}</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
          {product.id ? (
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono truncate">
              {product.id}
            </code>
          ) : null}
          {product.type ? (
            <span className="capitalize">
              {product.type}
              {product.unitLabel ? t('adminPayment.products.perUnit', { unit: product.unitLabel }) : ''}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {product.active ? (
          <BadgeStatus variant="green">{t('adminPayment.status.active')}</BadgeStatus>
        ) : (
          <BadgeStatus variant="red">{t('adminPayment.status.inactive')}</BadgeStatus>
        )}
        <RowActionsMenu actions={actions} />
      </div>
    </li>
  );
};
