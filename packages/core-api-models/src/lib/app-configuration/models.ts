import * as z from 'zod';

// Shared shape for feature configurations (AbstractFeatureConfigurationDto)
export const featureConfigurationSchema = z.object({
  enabled: z.boolean().nullable(),
  version: z.number().nullable(),
});
export type FeatureConfiguration = z.infer<typeof featureConfigurationSchema>;

// 3. Read schema - all properties nullable (API response)
export const readFeaturesConfigurationsSchema = z.object({
  // One entry per backend-controlled feature flag. Add new flags here.
  aiAssistant: featureConfigurationSchema.nullable(),
});
export type ReadFeaturesConfigurations = z.infer<
  typeof readFeaturesConfigurationsSchema
>;

export const readAppConfigurationSchema = z.object({
  featuresConfigurations: readFeaturesConfigurationsSchema.nullable(),
});
export type ReadAppConfiguration = z.infer<typeof readAppConfigurationSchema>;

// Legacy exports
export const appConfigurationSchema = readAppConfigurationSchema;
export type AppConfiguration = ReadAppConfiguration;
