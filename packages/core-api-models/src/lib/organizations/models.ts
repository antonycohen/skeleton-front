import * as z from 'zod';
import { readImageSchema, updateImageSchema } from '../images';
import { readSubscriptionSchema } from '../subscriptions';
import { readQuotaSchema } from '../quotas';

// Enums
export const organizationType = z.enum(['individual', 'business']);
export type OrganizationType = z.infer<typeof organizationType>;
export const organizationStatus = z.enum(['deleted', 'active']);

// 1. Reference schema with label field (for dropdowns, selects, links)
export const readOrganizationRefSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});
export type ReadOrganizationRef = z.infer<typeof readOrganizationRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const organizationRefSchema = z.object({
  id: z.uuid(),
});
export type OrganizationRef = z.infer<typeof organizationRefSchema>;

export const ssoWorkspaceStatusEnum = z.enum(['none', 'draft', 'tested', 'enabled', 'enforced']);
export type SsoWorkspaceStatus = z.infer<typeof ssoWorkspaceStatusEnum>;

// 3. Read schema - all properties nullable (API response)
export const readOrganizationSchema = z.object({
  id: z.uuid().nullable(),
  name: z.string().nullable(),
  domain: z.string().nullable(),
  type: organizationType.nullable(),
  status: organizationStatus.nullable(),
  // Every member must have two-factor authentication. Read-only here: it is switched through
  // `POST` / `DELETE /organizations/{id}/mfa-requirement`, never through PUT/PATCH.
  mfaRequired: z.boolean().nullable(),
  // The workspace may configure enterprise single sign-on. Read-only like `mfaRequired`: it is
  // switched from the back office through `/organizations/{id}/sso-availability`.
  ssoAvailable: z.boolean().nullable(),
  // Where the workspace stands with single sign-on, for every member to see: `none` without a
  // connection, else the connection's lifecycle. The connection itself is admin-only.
  ssoStatus: ssoWorkspaceStatusEnum.nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
  deleteAt: z.iso.datetime().nullable(),
  statistics: z
    .object({
      activeMembersCount: z.number().nullable(),
    })
    .nullable(),
  logo: z.object(readImageSchema).nullable(),
  subscription: z.lazy(() => readSubscriptionSchema).nullable(),
  quotas: z.lazy(() => z.array(readQuotaSchema)).nullable(),
  activeQuotas: z.lazy(() => z.array(readQuotaSchema)).nullable(),
});
export type ReadOrganization = z.infer<typeof readOrganizationSchema>;

// 4. Create schema - based on DTO serialization groups
export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'validation.common.nameRequired'),
  type: organizationType,
  logo: updateImageSchema.nullable().optional(),
});
export type CreateOrganization = z.infer<typeof createOrganizationSchema>;

// Domain validation regex: matches valid domain names like "example.com", "sub.example.co.uk"
const domainRegex =
  /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

// 5. Update schema - based on DTO serialization groups
export const updateOrganizationSchema = z.object({
  name: z.string().min(1, 'validation.common.nameRequired').nullish().optional(),
  domain: z
    .string()
    .min(1, 'validation.organization.domainRequired')
    .regex(domainRegex, 'validation.organization.domainInvalid')
    .nullish()
    .optional(),
});

export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>;

// Legacy export for backward compatibility
export const organizationSchema = readOrganizationSchema;
export type Organization = ReadOrganization;
