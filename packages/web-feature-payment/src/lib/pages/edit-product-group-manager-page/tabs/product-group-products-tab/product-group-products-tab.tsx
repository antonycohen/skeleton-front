import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetAdminProductGroupById, useUpdatePrice } from '@skeleton/core-api';
import { ReadPrice, ReadProduct } from '@skeleton/core-api-models';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';
import { NewProductModal } from './modals/new-product-modal';
import { EditProductModal } from './modals/edit-product-modal';
import { NewPriceModal } from './modals/new-price-modal';
import { EditPriceModal } from './modals/edit-price-modal';
import { ProductsColumn } from './components/products-column';
import { PricesColumn } from './components/prices-column';
import { useProductsReorder } from './hooks/use-products-reorder';

export const ProductGroupProductsTab = () => {
  const { t } = useTranslation();
  const { productGroupId = '' } = useParams<{ productGroupId: string }>();
  const { data: productGroup, isLoading } = useGetAdminProductGroupById({
    id: productGroupId,
    fields: {
      id: null,
      products: {
        fields: {
          id: null,
          name: null,
          description: null,
          active: null,
          type: null,
          unitLabel: null,
          quotas: null,
          prices: {
            fields: {
              id: null,
              nickname: null,
              lookupKey: null,
              currency: null,
              unitAmountInCents: null,
              recurringInterval: null,
              recurringUsageType: null,
              active: null,
            },
          },
        },
      },
    },
  });

  const serverProducts = useMemo<ReadProduct[]>(
    () => productGroup?.products ?? [],
    [productGroup?.products],
  );

  const { products, productIds, sensors, handleDragEnd, isReordering } =
    useProductsReorder({
      productGroupId,
      serverProducts,
    });

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ReadProduct | null>(null);
  const [isNewPriceOpen, setIsNewPriceOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<ReadPrice | null>(null);

  const effectiveSelectedId = selectedProductId ?? products[0]?.id ?? null;
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === effectiveSelectedId) ?? null,
    [products, effectiveSelectedId],
  );

  const updatePrice = useUpdatePrice({
    onSuccess: () => toast.success(t('adminPayment.prices.updated')),
    onError: () => toast.error(t('adminPayment.prices.updateFailed')),
  });

  const handleTogglePrice = (price: ReadPrice) => {
    if (!price.id) return;
    updatePrice.mutate({
      id: price.id,
      data: { active: !(price.active ?? false) },
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProductsColumn
          products={products}
          productIds={productIds}
          isLoading={isLoading}
          isReordering={isReordering}
          selectedProductId={effectiveSelectedId}
          onSelectProduct={setSelectedProductId}
          onCreate={() => setIsNewProductOpen(true)}
          onEdit={setEditingProduct}
          sensors={sensors}
          onDragEnd={handleDragEnd}
        />
        <PricesColumn
          selectedProduct={selectedProduct}
          onCreate={() => setIsNewPriceOpen(true)}
          onEdit={setEditingPrice}
          onToggle={handleTogglePrice}
          isToggling={updatePrice.isPending}
        />
      </div>

      <NewProductModal
        productGroupId={productGroupId}
        open={isNewProductOpen}
        onOpenChange={setIsNewProductOpen}
      />
      {editingProduct ? (
        <EditProductModal
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
        />
      ) : null}
      {selectedProduct?.id ? (
        <NewPriceModal
          productId={selectedProduct.id}
          open={isNewPriceOpen}
          onOpenChange={setIsNewPriceOpen}
        />
      ) : null}
      {editingPrice ? (
        <EditPriceModal
          price={editingPrice}
          open={!!editingPrice}
          onOpenChange={(open) => !open && setEditingPrice(null)}
        />
      ) : null}
    </>
  );
};
