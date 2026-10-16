import {ReadQuota} from '@skeleton/core-api-models';
import type {TFunction} from '@skeleton/core-translations';

export type QuotaUsageMetric = {
  label: string;
  value: number;
  percent: number;
};

export type QuotaIncludedItem = {
  label: string;
  value: string;
};

export const getQuotaLabel = (quota: ReadQuota | undefined | null): string =>
  quota?.feature?.displayName ?? quota?.featureKey ?? '';

export const getQuotaUsedPercent = (quota: ReadQuota | undefined | null): number =>
  quota?.quotaLimit
    ? Math.floor(((quota.quotaLimit - (quota.remainingQuota ?? 0)) / quota.quotaLimit) * 100)
    : 0;

/** One usage line per active quota of the workspace, whatever the features of the catalog. */
export const getQuotaUsageMetrics = (t: TFunction, quotas: ReadQuota[] | null | undefined): QuotaUsageMetric[] =>
  (quotas ?? []).map((quota) => ({
    label: t('billing.quota.left', { label: getQuotaLabel(quota) }),
    value: quota.remainingQuota ?? 0,
    percent: getQuotaUsedPercent(quota),
  }));

export const getQuotaIncludedItems = (quotas: ReadQuota[] | null | undefined): QuotaIncludedItem[] =>
  (quotas ?? []).map((quota) => ({
    label: getQuotaLabel(quota),
    value: String(quota.quotaLimit ?? 0),
  }));

/** `seatCount` -> "seat count", `api_calls` -> "api calls". */
export const humanizeQuotaKey = (key: string): string =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase();

/** "10 seat count" lines for each quota a product grants (`product.quotas`). */
export const getProductQuotaFeatures = (
  t: TFunction,
  quotas: Record<string, unknown> | null | undefined,
): { name: string }[] =>
  Object.entries(quotas ?? {})
    .filter(([, value]) => typeof value === 'number')
    .map(([key, value]) => ({ name: t('billing.quota.amount', { value: value as number, label: humanizeQuotaKey(key) }) }));
