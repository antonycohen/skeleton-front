import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MfaFreshProofRequest, mfaFreshProofRequestSchema, ReadUser } from '@skeleton/core-api-models';

/**
 * Disabling MFA and regenerating recovery codes both require fresh proof of ownership. The API
 * decides which proof applies (current password when the identity has one, otherwise a code)
 * and reports the missing one as a field error, so the form only makes sure something is sent.
 *
 * The user record does not say whether a password exists. An identity with no social sign-in
 * necessarily has one, so the code field is only offered to users who signed in through a
 * provider and may never have set a password.
 */
export const useMfaFreshProofForm = (user: ReadUser) => {
  const hasSocialIdentity = Object.keys(user.socialIdentifiers ?? {}).length > 0;

  const schema = hasSocialIdentity
    ? mfaFreshProofRequestSchema
    : mfaFreshProofRequestSchema.refine((data) => !!data.currentPassword?.trim(), {
        // A translation key: FieldError renders it in the current language
        message: 'account.mfa.currentPasswordRequired',
        path: ['currentPassword'],
      });

  const form = useForm<MfaFreshProofRequest>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', code: '' },
  });

  /** Blank fields are dropped so the API sees "not provided" rather than an empty string. */
  const toRequest = (data: MfaFreshProofRequest): MfaFreshProofRequest => ({
    currentPassword: data.currentPassword?.trim() || undefined,
    code: data.code?.trim() || undefined,
  });

  return { form, toRequest, allowCode: hasSocialIdentity };
};
