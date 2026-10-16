import { FormProvider } from 'react-hook-form';
import { Button } from '@skeleton/web-components';
import { ReadSsoConnection } from '@skeleton/core-api-models';
import { useSsoSamlConnectionForm } from '../hooks/use-sso-saml-connection-form';
import { SsoSamlFields } from './sso-saml-fields';
import { SsoServiceProviderValues } from './sso-service-provider-values';
import { useTranslation } from '@skeleton/core-translations';

export type SsoSamlConnectionFormProps = {
  organizationId: string;
  connection: ReadSsoConnection | undefined;
};

/**
 * What a SAML provider is described by, in the order the work happens: the values to register on the
 * provider's side (issued with the connection: shown once it exists, and obtainable with the
 * protocol alone), then the values it gives back — read from its metadata or entered by hand.
 */
export function SsoSamlConnectionForm({
  organizationId,
  connection,
}: SsoSamlConnectionFormProps) {
  const { t, tIfKey } = useTranslation();
  const { form, handleSubmit, isCreation, isSaving } = useSsoSamlConnectionForm(
    organizationId,
    connection,
  );
  const rootError = tIfKey(form.formState.errors.root?.message);

  return (
    <>
      <SsoServiceProviderValues
        organizationId={organizationId}
        connection={connection}
      />

      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6 border-t pt-6">
            <SsoSamlFields />

            {rootError && (
              <p className="text-sm text-destructive">{rootError}</p>
            )}

            <div className="flex justify-end">
              <Button type="submit" isLoading={isSaving}>
                {isCreation
                  ? t('security.idp.saveNew')
                  : t('security.idp.saveChanges')}
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </>
  );
}
