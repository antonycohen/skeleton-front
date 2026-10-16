import * as z from 'zod';
import { readOrganizationRefSchema } from '../organizations';

// Enums
export const serviceAccountStatus = z.enum(['active', 'disabled', 'deleted']);
export type ServiceAccountStatus = z.infer<typeof serviceAccountStatus>;

// 1. Reference schema with label field (for dropdowns, selects, links)
export const readServiceAccountRefSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});
export type ReadServiceAccountRef = z.infer<typeof readServiceAccountRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const serviceAccountRefSchema = z.object({
  id: z.uuid(),
});
export type ServiceAccountRef = z.infer<typeof serviceAccountRefSchema>;

// 3. Read schema - all properties nullable (API response)
export const readServiceAccountSchema = z.object({
  id: z.uuid().nullable(),
  name: z.string().nullable(),
  clientId: z.string().nullable(),
  permissions: z.array(z.string()).nullable(),
  status: serviceAccountStatus.nullable(),
  organization: z.lazy(() => readOrganizationRefSchema).nullable(),
  createdBy: z.uuid().nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
});
export type ReadServiceAccount = z.infer<typeof readServiceAccountSchema>;

// 4. Create schema - based on DTO serialization groups (View.Create)
export const createServiceAccountSchema = z.object({
  name: z
    .string()
    .min(1, 'validation.serviceAccount.nameRequired')
    .max(255, 'validation.serviceAccount.nameTooLong'),
  permissions: z
    .array(z.string())
    .min(1, 'validation.serviceAccount.permissionsRequired'),
});
export type CreateServiceAccount = z.infer<typeof createServiceAccountSchema>;

// 5. Update schema - based on DTO serialization groups (View.Update).
// PATCH semantics: omitted fields are left untouched; when present,
// `permissions` replaces the whole granted set.
export const updateServiceAccountSchema = z.object({
  name: z
    .string()
    .min(1, 'validation.serviceAccount.nameRequired')
    .max(255, 'validation.serviceAccount.nameTooLong')
    .optional(),
  permissions: z
    .array(z.string())
    .min(1, 'validation.serviceAccount.permissionsRequired')
    .optional(),
});
export type UpdateServiceAccount = z.infer<typeof updateServiceAccountSchema>;

// 6. Permission catalog entry - one grantable resource pattern (short form,
// e.g. `buyer:*`) and the actions allowed on it; joined client-side into the
// short-form permissions sent on create (`buyer:*` + `read` -> `buyer:*:read`)
export const serviceAccountPermissionCatalogEntrySchema = z.object({
  resource: z.string(),
  actions: z.array(z.string()),
});
export type ServiceAccountPermissionCatalogEntry = z.infer<
  typeof serviceAccountPermissionCatalogEntrySchema
>;

// 6. Created envelope - create / rotate-secret responses, the only place the
// client secret ever appears (it is stored hashed and cannot be read again)
export const createdServiceAccountSchema = z.object({
  serviceAccount: readServiceAccountSchema.nullable(),
  clientId: z.string().nullable(),
  clientSecret: z.string().nullable(),
});
export type CreatedServiceAccount = z.infer<typeof createdServiceAccountSchema>;

// Legacy export for backward compatibility
export const serviceAccountSchema = readServiceAccountSchema;
export type ServiceAccount = ReadServiceAccount;
