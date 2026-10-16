import { ReadPrice, ReadProduct } from '@skeleton/core-api-models';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@skeleton/web-components';
import { IconPlus } from '@tabler/icons-react';
import { PriceRow } from './price-row';
import { useTranslation } from '@skeleton/core-translations';

type PricesColumnProps = {
  selectedProduct: ReadProduct | null;
  onCreate: () => void;
  onEdit: (price: ReadPrice) => void;
  onToggle: (price: ReadPrice) => void;
  isToggling: boolean;
};

export const PricesColumn = ({
  selectedProduct,
  onCreate,
  onEdit,
  onToggle,
  isToggling,
}: PricesColumnProps) => {
  const { t } = useTranslation();
  const prices = selectedProduct?.prices ?? [];

  return (
    <Card className="rounded-2xl gap-0">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-xl">
          {selectedProduct
            ? t('adminPayment.prices.titleWithProduct', { product: selectedProduct.name ?? '' })
            : t('adminPayment.prices.title')}
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          disabled={!selectedProduct?.id}
          onClick={onCreate}
        >
          <IconPlus className="size-4" />
          {t('adminPayment.prices.add')}
        </Button>
      </CardHeader>
      <CardContent className="px-2 py-2">
        {!selectedProduct ? (
          <div className="px-4 py-6 text-muted-foreground">
            {t('adminPayment.prices.selectProduct')}
          </div>
        ) : prices.length === 0 ? (
          <div className="px-4 py-6 text-muted-foreground">
            {t('adminPayment.prices.empty')}
          </div>
        ) : (
          <ul className="flex flex-col">
            {prices.map((price) => (
              <PriceRow
                key={price.id ?? price.lookupKey}
                price={price}
                onEdit={onEdit}
                onToggle={onToggle}
                isToggling={isToggling}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
