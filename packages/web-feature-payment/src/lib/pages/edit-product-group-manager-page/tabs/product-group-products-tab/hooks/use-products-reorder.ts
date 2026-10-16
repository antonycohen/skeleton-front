import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRepositionProducts } from '@skeleton/core-api';
import { ReadProduct } from '@skeleton/core-api-models';
import {
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

type UseProductsReorderParams = {
  productGroupId: string;
  serverProducts: ReadProduct[];
};

export const useProductsReorder = ({
  productGroupId,
  serverProducts,
}: UseProductsReorderParams) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [products, setProducts] = useState<ReadProduct[]>(serverProducts);
  const [isReordering, setIsReordering] = useState(false);

  const repositionProducts = useRepositionProducts({
    onSuccess: async () => {
      // useRepositionProducts already invalidates ['product-groups'].
      // Await the refetch so the optimistic order stays visible until the
      // server-confirmed order is in the cache (prevents flicker).
      await queryClient.invalidateQueries({ queryKey: ['product-groups'] });
      setIsReordering(false);
    },
    onError: () => {
      toast.error(t('adminPayment.products.reorderFailed'));
      setProducts(serverProducts);
      setIsReordering(false);
    },
  });

  // Mirror the server order into local state, except while a reorder is in
  // flight — there the optimistic order has to survive until the server-confirmed
  // one lands. Adjusting state during render rather than in an effect is React's
  // own answer here: it re-renders before committing, instead of cascading a
  // second pass. `synced` tracks both values the effect's dependency array
  // watched, so a reorder finishing still re-syncs even if the list is unchanged.
  const [synced, setSynced] = useState({ serverProducts, isReordering });
  if (synced.serverProducts !== serverProducts || synced.isReordering !== isReordering) {
    setSynced({ serverProducts, isReordering });
    if (!isReordering) {
      setProducts(serverProducts);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(products, oldIndex, newIndex);
    setProducts(reordered);
    setIsReordering(true);

    const subject = String(active.id);
    const target =
      newIndex === reordered.length - 1
        ? null
        : reordered[newIndex + 1]?.id ?? null;

    repositionProducts.mutate({
      productGroupId,
      operation: { operation: 'moveBefore', subject, target },
    });
  };

  const productIds = useMemo(
    () => products.map((p) => p.id).filter((id): id is string => !!id),
    [products],
  );

  return {
    products,
    productIds,
    sensors,
    handleDragEnd,
    isReordering,
  };
};
