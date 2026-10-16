import * as z from 'zod';
import {readImageSchema, updateImageSchema} from '../images';

// Enums
// Mirrors the API's `UserStatusDto`, which serializes as an uppercase enum.
export const userStatus = z.enum(['PENDING', 'ACTIVE', 'INVITED', 'DELETED']);
export type UserStatus = z.infer<typeof userStatus>;

// 1. Reference schema with label field (for dropdowns, selects, links)
export const readUserRefSchema = z.object({
  id: z.uuid(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string(),
  profileImage: z.object(readImageSchema).optional().nullable(),
});
export type ReadUserRef = z.infer<typeof readUserRefSchema>;

// 2. Minimal reference schema (for foreign keys)
export const userRefSchema = z.object({
  id: z.uuid(),
});
export type UserRef = z.infer<typeof userRefSchema>;

// 3. Read schema - all properties nullable (API response)
export const readUserSchema = z.object({
  id: z.uuid().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string().nullable(),
  status: userStatus.nullable(),
  profileImage: z.object(readImageSchema).nullable(),
  socialIdentifiers: z.record(z.string(), z.string()).nullable(),
  // Populated only when the viewer is the user themself or a back-office super admin (null for
  // anyone else).
  mfaEnabled: z.boolean().nullable(),
  mfaEnabledAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime().nullable(),
  localizationPreferences: z.object({
    language: z.string().nullable(),
    timezone: z.string().nullable(),
    dateFormat: z.string().nullable(),
  }).nullable(),
  notificationsPreferences: z.object({
    channels: z.object({
      products: z.boolean(),
      news: z.boolean(),
    })
  }).nullable()
});
export type ReadUser = z.infer<typeof readUserSchema>;

// 4. Create schema - based on DTO serialization groups (View.Create)
export const createUserSchema = z.object({
  firstName: z.string()
    .min(2, 'validation.user.firstNameTooShort')
    .max(250, 'validation.user.firstNameTooLong'),
  lastName: z.string()
    .min(2, 'validation.user.lastNameTooShort')
    .max(250, 'validation.user.lastNameTooLong'),
  email: z.email('validation.common.invalidEmail')
    .min(5, 'validation.user.emailTooShort')
    .max(250, 'validation.user.emailTooLong'),
  password: z.string().optional(),
  profileImage: updateImageSchema.nullable().optional(),
});
export type CreateUser = z.infer<typeof createUserSchema>;

// 5. Update schema - based on DTO serialization groups (View.Update)
export const updateUserInfoSchema = z.object({
  firstName: z.string()
    .min(2, 'validation.user.firstNameTooShort')
    .max(250, 'validation.user.firstNameTooLong')
    .optional(),
  lastName: z.string()
    .min(2, 'validation.user.lastNameTooShort')
    .max(250, 'validation.user.lastNameTooLong')
    .optional(),
  profileImage: updateImageSchema.nullable().optional(),
});
export type UpdateUserInfo = z.infer<typeof updateUserInfoSchema>;

// Legacy export for backward compatibility
export const userSchema = readUserSchema;
export type User = ReadUser;


export const changeEmailRequestSchema = z.object({
  newEmail: z.email('validation.common.invalidEmail')
    .min(5, 'validation.user.emailTooShort')
    .max(250, 'validation.user.emailTooLong'),
});
export type ChangeEmailRequest = z.infer<typeof changeEmailRequestSchema>;


export const changePasswordRequestSchema = z.object({
  currentPassword: z.string()
    .min(0, 'validation.user.currentPasswordTooShort')
    .max(128, 'validation.user.currentPasswordTooLong'),
  newPassword: z.string()
    .min(8, 'validation.user.newPasswordTooShort')
    .max(128, 'validation.user.newPasswordTooLong'),
  repeatNewPassword: z.string()
    .min(8, 'validation.user.repeatPasswordTooShort')
    .max(128, 'validation.user.repeatPasswordTooLong'),
}).refine((data) => data.newPassword === data.repeatNewPassword, {
  message: 'validation.user.passwordsMismatch',
  path: ['repeatNewPassword'],
})

export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;


export const updateLocalizationPreferencesSchema = z.object({
  localizationPreferences: z.object({
    language: z.string().nullable(),
    timezone: z.string().nullable(),
    dateFormat: z.string().nullable(),
  })
});

export type UpdateLocalizationPreferences = z.infer<typeof updateLocalizationPreferencesSchema>;


export const updateNotificationsPreferencesSchema = z.object({
  notificationsPreferences: z.object({
    channels: z.object({
      products: z.boolean(),
      news: z.boolean(),
    })
  })
});

export type UpdateNotificationsPreferences = z.infer<typeof updateNotificationsPreferencesSchema>;


// --- Two-factor authentication (TOTP, B-253) — strictly self-service ---

/** A workspace requiring two-factor authentication from its members (B-260). */
export const mfaEnforcingOrganizationSchema = z.object({
  id: z.uuid(),
  name: z.string().nullable(),
});
export type MfaEnforcingOrganization = z.infer<typeof mfaEnforcingOrganizationSchema>;

/**
 * Why two-factor authentication is required from a user (B-260): the account is a super admin,
 * or an accepted member of at least one workspace requiring it.
 */
export const mfaRequirementSchema = z.object({
  required: z.boolean(),
  superAdmin: z.boolean(),
  organizations: z.array(mfaEnforcingOrganizationSchema),
});
export type MfaRequirement = z.infer<typeof mfaRequirementSchema>;

/** Read-only state of the user's second factor (`GET /users/{id}/mfa`). */
export const mfaStatusSchema = z.object({
  enabled: z.boolean(),
  enabledAt: z.iso.datetime().nullable(),
  recoveryCodesRemaining: z.number(),
  // While required, the API refuses to disable the second factor (409).
  required: z.boolean(),
  requiredBy: mfaRequirementSchema.nullable(),
});
export type MfaStatus = z.infer<typeof mfaStatusSchema>;

/** Returned once when enrolment starts; the secret is never returned again. */
export const mfaEnrolmentSchema = z.object({
  secret: z.string(),
  otpauthUri: z.string(),
  qrCodeDataUrl: z.string(),
});
export type MfaEnrolment = z.infer<typeof mfaEnrolmentSchema>;

/** Fresh single-use recovery codes, shown once at activation or regeneration. */
export const mfaRecoveryCodesSchema = z.object({
  recoveryCodes: z.array(z.string()),
});
export type MfaRecoveryCodes = z.infer<typeof mfaRecoveryCodesSchema>;

// The API keeps the digits only ("123 456" is fine), so the client only checks the count.
const SIX_DIGITS = /^(?:\D*\d){6}\D*$/;

/** One authenticator code, used to confirm enrolment. */
export const mfaCodeRequestSchema = z.object({
  code: z
    .string()
    .max(32, 'validation.user.codeTooLong')
    .regex(SIX_DIGITS, 'validation.user.totpCodeInvalid'),
});
export type MfaCodeRequest = z.infer<typeof mfaCodeRequestSchema>;

/**
 * Fresh proof of ownership required to disable MFA or regenerate recovery codes: the current
 * password for identities that have one, otherwise (social-only identities) a valid
 * authenticator or recovery code. The API reports which one is missing, field by field.
 */
export const mfaFreshProofRequestSchema = z
  .object({
    currentPassword: z.string().max(128, 'validation.user.currentPasswordTooLong').optional(),
    code: z.string().max(32, 'validation.user.codeTooLong').optional(),
  })
  .refine((data) => !!data.currentPassword?.trim() || !!data.code?.trim(), {
    message: 'validation.user.currentPasswordOrCodeRequired',
    path: ['currentPassword'],
  });
export type MfaFreshProofRequest = z.infer<typeof mfaFreshProofRequestSchema>;
