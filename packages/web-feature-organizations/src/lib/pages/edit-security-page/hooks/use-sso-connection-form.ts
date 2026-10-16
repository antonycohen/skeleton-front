import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ReadSsoConnection,
  SaveSsoConnection,
  ssoOidcConnectionFormSchema,
  SsoOidcConnectionFormValues,
} from '@skeleton/core-api-models';
import {
  ApiError,
  usePatchSsoConnection,
  useSaveSsoConnection,
} from '@skeleton/core-api';
import { handleApiError } from '@skeleton/web-form';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';

/**
 * The identity-provider form of the connection. Creation is a PUT, every later save a PATCH, so
 * that the settings this form does not show (default role, session length, just-in-time creation)
 * are not reset to their defaults by a save of the trust material.
 *
 * The client secret is never read back from the API: the field starts empty and is only sent when
 * the admin typed one, which is what keeps the stored secret on a save of the issuer alone.
 */
export function useSsoConnectionForm(
  organizationId: string,
  connection: ReadSsoConnection | undefined,
) {
  const { t } = useTranslation();
  const isCreation = !connection?.id;

  const form = useForm<SsoOidcConnectionFormValues>({
    resolver: zodResolver(ssoOidcConnectionFormSchema),
    defaultValues: {
      protocol: 'oidc',
      issuer: '',
      clientId: '',
      clientSecret: '',
      clientSecretSet: false,
    },
    // `values`, not `defaultValues`: the form resets when the connection arrives, and again after a
    // save, which clears the secret field the admin may have typed into.
    values: connection
      ? {
          protocol: 'oidc',
          issuer: connection.issuer ?? '',
          clientId: connection.clientId ?? '',
          clientSecret: '',
          clientSecretSet: connection.clientSecretSet ?? false,
        }
      : undefined,
  });

  const onSuccess = () => toast.success(t('security.idp.saved'));
  const onError = (error: ApiError) => handleApiError(error, form);

  const saveConnection = useSaveSsoConnection({ onSuccess, onError });
  const patchConnection = usePatchSsoConnection({ onSuccess, onError });

  const handleSubmit = form.handleSubmit((values) => {
    const data: SaveSsoConnection = {
      protocol: values.protocol,
      // Trimmed because the API validates the issuer against `https://\S+` on the body: a pasted
      // address with a stray space would come back a 422. The secret is left byte for byte.
      issuer: values.issuer.trim(),
      clientId: values.clientId.trim(),
      ...(values.clientSecret ? { clientSecret: values.clientSecret } : {}),
    };

    if (isCreation) {
      saveConnection.mutate({ organizationId, data });
      return;
    }
    patchConnection.mutate({ organizationId, data });
  });

  return {
    form,
    handleSubmit,
    isCreation,
    isSaving: saveConnection.isPending || patchConnection.isPending,
  };
}
