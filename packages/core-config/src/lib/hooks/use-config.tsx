import { useContext } from 'react';
import { ReadFeaturesConfigurations } from '@skeleton/core-api-models';
import { ConfigContext } from '../provider/config-provider';

export type FeatureName = keyof ReadFeaturesConfigurations;

export interface FeatureConfigurationValue {
  enabled: boolean;
  version: number;
}

// Defaults mirror the backend AbstractFeatureConfigurationDto
const defaultFeatureConfiguration: FeatureConfigurationValue = {
  enabled: false,
  version: 1,
};

export function useConfig() {
  const { config, isLoading } = useContext(ConfigContext);

  const getFeatureConfiguration = (
    feature: FeatureName,
  ): FeatureConfigurationValue => {
    const featureConfiguration = config?.featuresConfigurations?.[feature];
    return {
      enabled:
        featureConfiguration?.enabled ?? defaultFeatureConfiguration.enabled,
      version:
        featureConfiguration?.version ?? defaultFeatureConfiguration.version,
    };
  };

  const isFeatureEnabled = (feature: FeatureName): boolean => {
    return getFeatureConfiguration(feature).enabled;
  };

  return { config, isLoading, getFeatureConfiguration, isFeatureEnabled };
}
