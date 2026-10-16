import { ReadProduct } from '@skeleton/core-api-models';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@skeleton/web-components';
import { cn } from '@skeleton/core-utils';
import { IconLoader2, IconPlus } from '@tabler/icons-react';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  SensorDescriptor,
  SensorOptions,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ProductRow } from './product-row';
import { useTranslation } from '@skeleton/core-translations';

type ProductsColumnProps = {
  products: ReadProduct[];
  productIds: string[];
  isLoading: boolean;
  isReordering: boolean;
  selectedProductId: string | null;
  onSelectProduct: (id: string) => void;
  onCreate: () => void;
  onEdit: (product: ReadProduct) => void;
  sensors: SensorDescriptor<SensorOptions>[];
  onDragEnd: (event: DragEndEvent) => void;
};

export const ProductsColumn = ({
  products,
  productIds,
  isLoading,
  isReordering,
  selectedProductId,
  onSelectProduct,
  onCreate,
  onEdit,
  sensors,
  onDragEnd,
}: ProductsColumnProps) => {
  const { t } = useTranslation();
  return (
    <Card className="rounded-2xl gap-0">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-xl flex items-center gap-2">
          {t('adminPayment.products.title')}
          {isReordering ? (
            <IconLoader2
              className="size-4 animate-spin text-muted-foreground"
              aria-label={t('adminPayment.products.savingOrder')}
            />
          ) : null}
        </CardTitle>
        <Button size="sm" variant="outline" onClick={onCreate}>
          <IconPlus className="size-4" />
          {t('adminPayment.products.add')}
        </Button>
      </CardHeader>
      <CardContent className="px-2 py-2">
        {isLoading ? (
          <div className="px-4 py-6 text-muted-foreground">{t('common.loading')}</div>
        ) : products.length === 0 ? (
          <div className="px-4 py-6 text-muted-foreground">
            {t('adminPayment.products.empty')}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={productIds}
              strategy={verticalListSortingStrategy}
            >
              <ul
                aria-busy={isReordering}
                className={cn(
                  'flex flex-col transition-opacity',
                  isReordering && 'pointer-events-none opacity-70',
                )}
              >
                {products.map((product) => (
                  <ProductRow
                    key={product.id ?? product.name}
                    product={product}
                    isSelected={product.id === selectedProductId}
                    onSelect={() => product.id && onSelectProduct(product.id)}
                    onEdit={onEdit}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
};
