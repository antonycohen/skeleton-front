import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  buildSamlConnectionPayload,
  ReadSsoConnection,
  ssoSamlConnectionFormSchema,
  SsoSamlConnectionFormValues,
} from '@skeleton/core-api-models';
import {
  ApiError,
  usePatchSsoConnection,
  useSaveSsoConnection,
} from '@skeleton/core-api';
import { handleApiError } from '@skeleton/web-form';
import { toast } from 'sonner';
import { useTranslation } from '@skeleton/core-translations';
import { useSsoCertificateList } from './use-sso-certificate-list';

const EMPTY_VALUES: SsoSamlConnectionFormValues = {
  protocol: 'saml',
  source: 'metadata_url',
  idpMetadataUrl: '',
  idpMetadataXml: '',
  idpEntityId: '',
  idpSsoUrl: '',
  idpCertificate: '',
  idpSsoBinding: 'redirect',
  allowIdpInitiated: false,
  attributeEmail: '',
  attributeGivenName: '',
  attributeFamilyName: '',
  hasRegisteredCertificate: false,
};

/**
 * The SAML half of the identity-provider card. Creating the workspace's connection is a PUT; every
 * later save, a change of protocol included, is a PATCH — so the settings this form does not show
 * (default role, session length, just-in-time creation) keep their value instead of falling back to
 * the API's defaults, and the API still reads a metadata address that is new to the connection.
 *
 * A pasted metadata document is not kept by the API (it is read once), so the stored state only ever
 * says "a metadata address" or "by hand": that is what the source starts on.
 */
export function useSsoSamlConnectionForm(
  organizationId: string,
  connection: ReadSsoConnection | undefined,
) {
  const { t } = useTranslation();
  const hasConnection = !!connection?.id;
  const isSamlConnection = connection?.protocol === 'saml' && hasConnection;
  // Through the shared hook, so this costs no request of its own: the certificates card asks for the
  // same page. A connection that holds one is saved again without picking a certificate.
  const { data: certificates } = useSsoCertificateList(
    organizationId,
    isSamlConnection,
  );

  const form = useForm<SsoSamlConnectionFormValues>({
    resolver: zodResolver(ssoSamlConnectionFormSchema),
    defaultValues: EMPTY_VALUES,
    // `values`: the form follows the connection, so what a metadata import or another admin's save
    // changed is shown, and the certificate field is emptied once its content is registered.
    values: isSamlConnection
      ? {
          ...EMPTY_VALUES,
          source: connection.idpMetadataUrl ? 'metadata_url' : 'manual',
          idpMetadataUrl: connection.idpMetadataUrl ?? '',
          idpEntityId: connection.idpEntityId ?? '',
          idpSsoUrl: connection.idpSsoUrl ?? '',
          idpSsoBinding: connection.idpSsoBinding ?? 'redirect',
          allowIdpInitiated: connection.allowIdpInitiated ?? false,
          attributeEmail: connection.attributeEmail ?? '',
          attributeGivenName: connection.attributeGivenName ?? '',
          attributeFamilyName: connection.attributeFamilyName ?? '',
          hasRegisteredCertificate: (certificates?.data.length ?? 0) > 0,
        }
      : undefined,
  });

  const onSuccess = () => toast.success(t('security.idp.saved'));
  const onError = (error: ApiError) => handleApiError(error, form);

  const saveConnection = useSaveSsoConnection({ onSuccess, onError });
  const patchConnection = usePatchSsoConnection({ onSuccess, onError });

  const handleSubmit = form.handleSubmit((values) => {
    const data = buildSamlConnectionPayload(values);

    if (hasConnection) {
      patchConnection.mutate({ organizationId, data });
      return;
    }
    saveConnection.mutate({ organizationId, data });
  });

  return {
    form,
    handleSubmit,
    isCreation: !hasConnection,
    isSaving: saveConnection.isPending || patchConnection.isPending,
  };
}
