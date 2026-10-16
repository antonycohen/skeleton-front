import * as z from 'zod';
import { readOrganizationRefSchema } from '../organizations';

// Customer schemas
// Read-only on the frontend: customers are created by the backend (Stripe mirror).

// 1. Reference schema with label field (for dropdowns, selects, links)
export const readCustomerRefSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
});
export type ReadCustomerRef = z.infer<typeof readCustomerRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const customerRefSchema = z.object({
  id: z.string(),
});
export type CustomerRef = z.infer<typeof customerRefSchema>;

// 3. Read schema - all properties nullable (API response)
export const readCustomerSchema = z.object({
  id: z.string().nullable(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  currency: z.string().nullable(),
  delinquent: z.boolean().nullable(),
  organization: z.lazy(() => readOrganizationRefSchema).nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
});
export type ReadCustomer = z.infer<typeof readCustomerSchema>;

// Legacy exports for backward compatibility
export const customerSchema = readCustomerSchema;
export type Customer = ReadCustomer;
