import * as z from 'zod';
import {readUserRefSchema, userRefSchema} from '../users';
import {organizationRefSchema, readOrganizationRefSchema} from '../organizations';

// Enums
export const memberStatus = z.enum(['invited', 'accepted', 'suspended']);
export type MemberStatus = z.infer<typeof memberStatus>;

export const memberRole = z.enum(['admin', 'editor', 'viewer']);
export type MemberRole = z.infer<typeof memberRole>;

// 1. Reference schema with label field (for dropdowns, selects, links)
export const readOrganizationMemberRefSchema = z.object({
  id: z.uuid(),
  email: z.string(),
  status: memberStatus,
});
export type ReadOrganizationMemberRef = z.infer<typeof readOrganizationMemberRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const organizationMemberRefSchema = z.object({
  id: z.uuid(),
});
export type OrganizationMemberRef = z.infer<typeof organizationMemberRefSchema>;

// 3. Read schema - all properties nullable (API response)
export const readOrganizationMemberSchema = z.object({
  id: z.uuid().nullable(),
  user: readUserRefSchema.nullable(),
  organization: readOrganizationRefSchema.nullable(),
  status: memberStatus.nullable(),
  role: memberRole.nullable(),
  email: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  inviterId: z.uuid().nullable(),
  // Security-posture attribute: populated only for active admins of the organization and for
  // back-office super admins, null otherwise.
  mfaEnabled: z.boolean().nullable(),
  // Whether the account is bound to the workspace's SSO connection (signed in through it at least
  // once). Same visibility as mfaEnabled: null for everyone but the workspace's admins.
  ssoLinked: z.boolean().nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
});
export type ReadOrganizationMember = z.infer<typeof readOrganizationMemberSchema>;

// 4. Create schema - based on DTO serialization groups (View.Create)
export const createOrganizationMemberSchema = z.object({
  user: userRefSchema,
  organization: organizationRefSchema,
  status: memberStatus,
  role: memberRole,
  email: z.email('validation.common.invalidEmail'),
});
export type CreateOrganizationMember = z.infer<typeof createOrganizationMemberSchema>;

// 5. Update schema - based on DTO serialization groups (View.Update)
export const updateOrganizationMemberRoleSchema = z.object({
  role: memberRole,
});
export type UpdateOrganizationMemberRole = z.infer<typeof updateOrganizationMemberRoleSchema>;

// 6. Invite schema - for inviting new members
export const inviteOrganizationMemberSchema = z.object({
  email: z.email('validation.common.invalidEmail'),
  role: memberRole,
});
export type InviteOrganizationMember = z.infer<typeof inviteOrganizationMemberSchema>;

// Legacy export for backward compatibility
export const organizationMemberSchema = readOrganizationMemberSchema;
export type OrganizationMember = ReadOrganizationMember;
