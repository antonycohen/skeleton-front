import { FormProvider } from 'react-hook-form';
import {
  Alert,
  AlertDescription,
  Button,
  CopyButton,
  Label,
} from '@skeleton/web-components';
import { createConnectedInputHelpers } from '@skeleton/web-form';
import {
  ReadSsoConnection,
  SsoOidcConnectionFormValues,
} from '@skeleton/core-api-models';
import { InfoIcon } from 'lucide-react';
import { useSsoConnectionForm } from '../hooks/use-sso-connection-form';
import { useTranslation } from '@skeleton/core-translations';

const { ControlledTextInput, ControlledPasswordInput } =
  createConnectedInputHelpers<SsoOidcConnectionFormValues>();

export type SsoOidcConnectionFormProps = {
  organizationId: string;
  connection: ReadSsoConnection | undefined;
};

/** What an OpenID Connect provider is described by: its issuer, and the client it issued to this application. */
export function SsoOidcConnectionForm({
  organizationId,
  connection,
}: SsoOidcConnectionFormProps) {
  const { t, tIfKey } = useTranslation();
  const { form, handleSubmit, isCreation, isSaving } = useSsoConnectionForm(
    organizationId,
    connection,
  );
  const rootError = tIfKey(form.formState.errors.root?.message);

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          {connection?.redirectUri && (
            <div className="flex flex-col gap-1.5">
              <Label>{t('security.oidc.redirectUri')}</Label>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                <span className="break-all font-mono text-xs">
                  {connection.redirectUri}
                </span>
                <CopyButton value={connection.redirectUri} />
              </div>
              <span className="text-xs text-muted-foreground">
                {t('security.oidc.redirectUriHint')}
              </span>
            </div>
          )}

          <ControlledTextInput
            name="issuer"
            label={t('security.oidc.issuer')}
            placeholder="https://acme.okta.com"
            description={t('security.oidc.issuerHint')}
          />
          <ControlledTextInput
            name="clientId"
            label={t('security.oidc.clientId')}
            placeholder="0oa1b2c3d4e5f6g7h8i9"
          />
          <ControlledPasswordInput
            name="clientSecret"
            label={t('security.oidc.clientSecret')}
            placeholder={
              connection?.clientSecretSet
                ? t('security.oidc.clientSecretSaved')
                : t('security.oidc.clientSecretPlaceholder')
            }
          />

          <Alert>
            <InfoIcon />
            <AlertDescription>{t('security.oidc.trustNotice')}</AlertDescription>
          </Alert>

          {rootError && <p className="text-sm text-destructive">{rootError}</p>}

          <div className="flex justify-end">
            <Button type="submit" isLoading={isSaving}>
              {isCreation ? t('security.idp.saveNew') : t('security.idp.saveChanges')}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
