import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ReadSsoConnection,
  ssoProvisioningFormSchema,
  SsoProvisioningFormValues,
} from '@skeleton/core-api-models';
import { ApiError, usePatchSsoConnection } from '@skeleton/core-api';
import { handleApiError } from '@skeleton/web-form';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

/** The API's own defaults, applied when the connection was created without these settings. */
const DEFAULT_VALUES: SsoProvisioningFormValues = {
  defaultRole: 'viewer',
  sessionMaxAgeSeconds: '86400',
  jitEnabled: true,
};

/**
 * The provisioning settings of the connection. A PATCH of these leaves the status alone — unlike the
 * trust material — so they are saved on their own.
 */
export function useSsoProvisioningForm(
  organizationId: string,
  connection: ReadSsoConnection,
) {
  const { t } = useTranslation();
  const form = useForm<SsoProvisioningFormValues>({
    resolver: zodResolver(ssoProvisioningFormSchema),
    defaultValues: DEFAULT_VALUES,
    // `values`: the form follows the connection, so a refetch (a test sign-in, another admin's
    // change) is reflected instead of leaving a stale copy behind.
    values: {
      defaultRole: connection.defaultRole ?? DEFAULT_VALUES.defaultRole,
      sessionMaxAgeSeconds: toSessionLength(connection.sessionMaxAgeSeconds),
      jitEnabled: connection.jitEnabled ?? DEFAULT_VALUES.jitEnabled,
    },
  });

  const patchConnection = usePatchSsoConnection({
    onSuccess: () => toast.success(t('security.provisioning.saved')),
    onError: (error: ApiError) => handleApiError(error, form),
  });

  const handleSubmit = form.handleSubmit((values) => {
    patchConnection.mutate({
      organizationId,
      data: {
        defaultRole: values.defaultRole,
        sessionMaxAgeSeconds: Number(values.sessionMaxAgeSeconds),
        jitEnabled: values.jitEnabled,
      },
    });
  });

  return { form, handleSubmit, isSaving: patchConnection.isPending };
}

/**
 * A stored length the form does not offer (set through the API, or a default that changes later) is
 * shown as the nearest offered one that is not longer, so saving never silently extends a session.
 */
function toSessionLength(
  seconds: number | null,
): SsoProvisioningFormValues['sessionMaxAgeSeconds'] {
  const offered = ssoProvisioningFormSchema.shape.sessionMaxAgeSeconds.options;
  if (seconds == null) {
    return DEFAULT_VALUES.sessionMaxAgeSeconds;
  }
  const match = [...offered]
    .reverse()
    .find((option) => Number(option) <= seconds);
  return match ?? offered[0];
}
