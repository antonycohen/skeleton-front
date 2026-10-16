import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MfaCodeRequest, mfaCodeRequestSchema, MfaRecoveryCodes, ReadUser } from '@skeleton/core-api-models';
import { useActivateMfa } from '@skeleton/core-api';
import { handleApiError } from '@skeleton/web-form';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

/**
 * Confirms a pending enrolment with the first code from the authenticator app. A wrong code
 * (400), a lock after too many attempts (429) and a lost enrolment (404) all come back as a
 * form-level message from the API; nothing else is worth distinguishing for the user.
 */
export const useActivateMfaForm = (user: ReadUser, onActivated: (codes: MfaRecoveryCodes) => void) => {
  const { t } = useTranslation();
  const form = useForm<MfaCodeRequest>({
    resolver: zodResolver(mfaCodeRequestSchema),
    defaultValues: { code: '' },
  });

  const activateMfa = useActivateMfa({
    onSuccess: (codes) => {
      toast.success(t('account.mfa.enabledToast'));
      onActivated(codes);
    },
    onError: (error) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((data) => {
    activateMfa.mutate({
      userId: user.id as string,
      data: { code: data.code.trim() },
    });
  });

  return { form, handleSubmit, isLoading: activateMfa.isPending };
};
