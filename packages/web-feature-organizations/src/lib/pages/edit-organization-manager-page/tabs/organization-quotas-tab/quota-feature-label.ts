import { ReadQuota } from '@skeleton/core-api-models';

/**
 * A quota is identified to operators by its feature. Prefer the human-readable
 * display name, fall back to the raw key the API keys the quota on.
 */
export const getFeatureLabel = (quota: ReadQuota) => {
  const displayName = quota.feature?.displayName?.trim();
  if (displayName) return displayName;
  return quota.featureKey ?? quota.feature?.lookupKey ?? '-';
};
