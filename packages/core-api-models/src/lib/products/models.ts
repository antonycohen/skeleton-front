import * as z from 'zod';
import { readFeatureSchema } from '../features';
import {readPriceSchema} from "../prices";
import { productGroupRefSchema, readProductGroupRefSchema } from '../product-groups';

// Enums
export const productType = z.enum(['service', 'good']);
export type ProductType = z.infer<typeof productType>;

// 1. Reference schema with label field (for dropdowns, selects, links)
export const readProductRefSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type ReadProductRef = z.infer<typeof readProductRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const productRefSchema = z.object({
  id: z.string(),
});
export type ProductRef = z.infer<typeof productRefSchema>;

// 3. Read schema - all properties nullable (API response)
// Note: prices are defined separately to avoid circular dependency
export const readProductSchema = z.object({
  id: z.string().nullable(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  active: z.boolean().nullable(),
  unitLabel: z.string().nullable(),
  type: productType.nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
  features: z.array(readFeatureSchema).nullable(),
  prices: z.array(z.lazy(() => readPriceSchema)).nullable(),
  quotas: z.record(z.string(), z.unknown()).nullable(),
  productGroup: readProductGroupRefSchema.nullable(),
});
export type ReadProduct = z.infer<typeof readProductSchema>;

// 4. Create schema - based on DTO serialization groups (View.Create)
export const createProductSchema = z.object({
  id: z.string().min(1, 'validation.product.idRequired'),
  name: z.string().min(1, 'validation.common.nameRequired'),
  description: z.string().optional(),
  active: z.boolean().optional(),
  unitLabel: z.string().optional(),
  type: productType.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  quotas: z.record(z.string(), z.number()).optional(),
  productGroup: productGroupRefSchema,
});
export type CreateProduct = z.infer<typeof createProductSchema>;

// 5. Update schema - based on DTO serialization groups (View.Update)
export const updateProductSchema = createProductSchema.partial();
export type UpdateProduct = z.infer<typeof updateProductSchema>;

// Reposition products operation (POST /product-groups/{id}/reposition-products)
export const moveBeforeOperationSchema = z.object({
  operation: z.literal('moveBefore'),
  subject: z.string().min(1, 'validation.product.subjectRequired'),
  target: z.string().min(1).nullable(),
});
export type MoveBeforeOperation = z.infer<typeof moveBeforeOperationSchema>;

export const reorderAllOperationSchema = z.object({
  operation: z.literal('reorderAll'),
  productIds: z
    .array(z.string().min(1))
    .min(1, 'validation.product.productIdsRequired'),
});
export type ReorderAllOperation = z.infer<typeof reorderAllOperationSchema>;

export const moveProductsOperationSchema = z.discriminatedUnion('operation', [
  moveBeforeOperationSchema,
  reorderAllOperationSchema,
]);
export type MoveProductsOperation = z.infer<typeof moveProductsOperationSchema>;

// Legacy export for backward compatibility
export const productSchema = readProductSchema;
export type Product = ReadProduct;
