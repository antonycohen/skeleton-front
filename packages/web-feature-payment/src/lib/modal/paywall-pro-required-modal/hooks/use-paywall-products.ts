import {useMemo} from 'react';
import {useGetProductGroupById} from '@skeleton/core-api';
import {PriceInterval, ReadPrice, ReadProduct} from '@skeleton/core-api-models';
import {type PlanFeature} from '@skeleton/web-components';
import {formatPrice, PRODUCT_GROUP_FIELDS} from '../../../hooks/use-plan-options';
import {useTranslation} from '@skeleton/core-translations';
import {getProductQuotaFeatures} from '../../../utils/quota-usage';

/** The product group the paywall sells; every product in it is offered. */
const PAYWALL_PRODUCT_GROUP_ID: string = import.meta.env['VITE_PAYWALL_PRODUCT_GROUP_ID'] || 'pg_pro';

export function usePaywallProducts(
  selectedProductId: string | null,
  isAnnual: boolean,
) {
  const { t } = useTranslation();
  const { data: productGroup } = useGetProductGroupById({
    id: PAYWALL_PRODUCT_GROUP_ID,
    fields: PRODUCT_GROUP_FIELDS,
  });

  const products = useMemo(
    () => (productGroup?.products ?? []) as ReadProduct[],
    [productGroup],
  );

  const currentInterval: PriceInterval = isAnnual ? 'year' : 'month';

  const planOptions = useMemo(() => {
    return products
      .filter((p) => p.id != null)
      .map((product) => ({
        label: product.name ?? product.id ?? '',
        value: product.id as string,
      }));
  }, [products]);

  const selectedProduct = useMemo(() => {
    if (selectedProductId) {
      const found = products.find((p) => p.id === selectedProductId);
      if (found) return found;
    }
    return products[0] ?? null;
  }, [products, selectedProductId]);

  const prices = useMemo((): ReadPrice[] => {
    return ((selectedProduct?.prices ?? []) as ReadPrice[]).filter(
      (p) => p.active,
    );
  }, [selectedProduct]);

  const selectedPrice = useMemo((): ReadPrice | null => {
    return prices.find((p) => p.recurringInterval === currentInterval) ?? prices[0] ?? null;
  }, [prices, currentInterval]);

  const monthlyAmountInCents = selectedPrice?.unitAmountInCents != null && selectedPrice.recurringInterval === 'year'
    ? Math.round(selectedPrice.unitAmountInCents / 12)
    : selectedPrice?.unitAmountInCents;

  const displayPrice = selectedPrice
    ? formatPrice(monthlyAmountInCents, selectedPrice.currency)
    : undefined;

  const annualSavings = useMemo((): string | undefined => {
    const monthlyPrice = prices.find((p) => p.recurringInterval === 'month');
    const yearlyPrice = prices.find((p) => p.recurringInterval === 'year');
    if (monthlyPrice?.unitAmountInCents == null || yearlyPrice?.unitAmountInCents == null) return undefined;
    const savingInCents = (monthlyPrice.unitAmountInCents * 12) - yearlyPrice.unitAmountInCents;
    if (savingInCents <= 0) return undefined;
    return t('billing.plan.saveAmount', { amount: formatPrice(savingInCents, yearlyPrice.currency) });
  }, [prices, t]);

  const features = useMemo(
    (): PlanFeature[] => getProductQuotaFeatures(t, selectedProduct?.quotas),
    [selectedProduct, t],
  );

  return {
    planOptions,
    selectedProduct,
    selectedPrice,
    displayPrice,
    annualSavings,
    features,
  };
}
