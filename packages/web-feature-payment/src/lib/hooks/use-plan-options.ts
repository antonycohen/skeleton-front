'use client';

import {useMemo, useState} from 'react';
import type {PlanFeature, PlanOption} from '@skeleton/web-components';
import type {PriceInterval, ReadPrice, ReadProduct, ReadProductGroup} from '@skeleton/core-api-models';
import {useTranslation} from '@skeleton/core-translations';
import {getProductQuotaFeatures} from '../utils/quota-usage';

export const PRODUCT_GROUP_FIELDS = {
  id: null,
  name: null,
  description: null,
  products: {
    fields: {
      id: null,
      name: null,
      quotas: null,
      prices: {
        fields: {
          id: null,
          active: null,
          nickname: null,
          currency: null,
          unitAmountInCents: null,
          recurringInterval: null,
          recurringIntervalCount: null,
        },
      },
    },
  },
} as const;

export function formatPrice(amountInCents: number | null | undefined, currency: string | null | undefined): string {
  if (amountInCents == null) return '—';
  const amount = amountInCents / 100;
  const currencyCode = currency?.toUpperCase() || 'EUR';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function usePlanOptions(productGroup: ReadProductGroup | undefined, planKey: string, staticFeatures: PlanFeature[]) {
  const { t } = useTranslation();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(true);

  const products = useMemo(
    () => ((productGroup?.products ?? []) as ReadProduct[]).filter(
      (p) => p.name?.toLowerCase().includes(planKey),
    ),
    [productGroup, planKey],
  );

  const currentInterval: PriceInterval = isAnnual ? 'year' : 'month';

  const planOptions = useMemo((): PlanOption[] => {
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

  const {annualSavings, annualSavingsPercent} = useMemo(() => {
    const monthlyPrice = prices.find((p) => p.recurringInterval === 'month');
    const yearlyPrice = prices.find((p) => p.recurringInterval === 'year');
    if (monthlyPrice?.unitAmountInCents == null || yearlyPrice?.unitAmountInCents == null) {
      return {annualSavings: undefined, annualSavingsPercent: undefined};
    }
    const fullYearInCents = monthlyPrice.unitAmountInCents * 12;
    const savingInCents = fullYearInCents - yearlyPrice.unitAmountInCents;
    if (savingInCents <= 0 || fullYearInCents <= 0) {
      return {annualSavings: undefined, annualSavingsPercent: undefined};
    }
    return {
      annualSavings: t('billing.plan.saveAmount', { amount: formatPrice(savingInCents, yearlyPrice.currency) }),
      annualSavingsPercent: t('billing.plan.savePercent', { percent: Math.round((savingInCents / fullYearInCents) * 100) }),
    };
  }, [prices, t]);

  // Static features first, then one line per quota the selected product grants.
  const features = useMemo(
    (): PlanFeature[] => [...getProductQuotaFeatures(t, selectedProduct?.quotas), ...staticFeatures],
    [selectedProduct, staticFeatures, t],
  );

  return {
    planOptions,
    selectedOption: (selectedProduct?.id as string) ?? undefined,
    onOptionChange: setSelectedProductId,
    isAnnual,
    onAnnualChange: setIsAnnual,
    price: displayPrice,
    selectedPrice,
    annualSavings,
    annualSavingsPercent,
    priceNote: isAnnual ? t('billing.plan.billedAnnually') : t('billing.plan.noCommitment'),
    features,
  };
}
