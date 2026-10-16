import * as z from 'zod';
import { aggregationType } from '../meters';

// 1. Reference schema with label field (for dropdowns, selects, links)
export const readFeatureRefSchema = z.object({
  id: z.string(),
  lookupKey: z.string(),
  displayName: z.string().nullable(),
});
export type ReadFeatureRef = z.infer<typeof readFeatureRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const featureRefSchema = z.object({
  id: z.string(),
});
export type FeatureRef = z.infer<typeof featureRefSchema>;

// 3. Read schema - all properties nullable (API response)
export const readFeatureSchema = z.object({
  id: z.string().nullable(),
  lookupKey: z.string().nullable(),
  displayName: z.string().nullable(),
  withQuota: z.boolean().nullable(),
  quotaAggregationFormula: aggregationType.nullable(),
  product: z.lazy(() => z.object({ id: z.string(), name: z.string() })).nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
});
export type ReadFeature = z.infer<typeof readFeatureSchema>;

// 4. Create schema - based on DTO serialization groups (View.Create)
export const createFeatureSchema = z.object({
  lookupKey: z.string().min(1, 'validation.feature.keyRequired').max(100, 'validation.feature.keyTooLong'),
  displayName: z.string().max(250, 'validation.feature.displayNameTooLong').optional(),
  withQuota: z.boolean(),
  quotaAggregationFormula: aggregationType.optional(),
});
export type CreateFeature = z.infer<typeof createFeatureSchema>;

// 5. Update schema - based on DTO serialization groups (View.Update)
export const updateFeatureSchema = createFeatureSchema.partial();
export type UpdateFeature = z.infer<typeof updateFeatureSchema>;

// Legacy export for backward compatibility
export const featureSchema = readFeatureSchema;
export type Feature = ReadFeature;
