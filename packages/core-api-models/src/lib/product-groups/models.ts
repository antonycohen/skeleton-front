import * as z from 'zod';
import { readProductSchema } from '../products';

// 1. Reference schema with label field (for dropdowns, selects, links)
export const readProductGroupRefSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type ReadProductGroupRef = z.infer<typeof readProductGroupRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const productGroupRefSchema = z.object({
  id: z.string(),
});
export type ProductGroupRef = z.infer<typeof productGroupRefSchema>;

// 3. Read schema - all properties nullable (API response)
export const readProductGroupSchema = z.object({
  id: z.string().nullable(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  active: z.boolean().nullable(),
  portalConfigurationId: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
  products: z.array(z.lazy(() => readProductSchema)).nullable(),
});
export type ReadProductGroup = z.infer<typeof readProductGroupSchema>;

// 4. Create schema - based on DTO serialization groups (View.Create)
export const createProductGroupSchema = z.object({
  name: z.string().min(1, 'validation.common.nameRequired'),
  description: z.string().optional(),
  active: z.boolean().optional(),
  portalConfigurationId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type CreateProductGroup = z.infer<typeof createProductGroupSchema>;

// 5. Update schema - based on DTO serialization groups (View.Update)
export const updateProductGroupSchema = createProductGroupSchema.partial();
export type UpdateProductGroup = z.infer<typeof updateProductGroupSchema>;

// Legacy export for backward compatibility
export const productGroupSchema = readProductGroupSchema;
export type ProductGroup = ReadProductGroup;
