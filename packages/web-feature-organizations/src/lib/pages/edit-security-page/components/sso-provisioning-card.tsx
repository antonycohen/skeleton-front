import { FormProvider } from 'react-hook-form';
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@skeleton/web-components';
import { createConnectedInputHelpers } from '@skeleton/web-form';
import {
  ReadSsoConnection,
  SsoProvisioningFormValues,
} from '@skeleton/core-api-models';
import { useSsoProvisioningForm } from '../hooks/use-sso-provisioning-form';
import { useTranslation } from '@skeleton/core-translations';

const { ControlledSelectInput, ControlledSwitchInput } =
  createConnectedInputHelpers<SsoProvisioningFormValues>();

const ROLE_OPTIONS = [
  { value: 'editor', labelKey: 'teams.roles.editor' },
  { value: 'viewer', labelKey: 'teams.roles.viewer' },
];

const SESSION_LENGTH_OPTIONS = [
  { value: '28800', labelKey: 'security.provisioning.sessionLength.8h' },
  { value: '86400', labelKey: 'security.provisioning.sessionLength.24h' },
  { value: '259200', labelKey: 'security.provisioning.sessionLength.3d' },
  { value: '604800', labelKey: 'security.provisioning.sessionLength.7d' },
];

export type SsoProvisioningCardProps = {
  organizationId: string;
  connection: ReadSsoConnection;
};

/**
 * What a sign-in through the connection grants: the role people are created with, how long their
 * session lasts, and whether an unknown person is created at all.
 */
export function SsoProvisioningCard({
  organizationId,
  connection,
}: SsoProvisioningCardProps) {
  const { t, tIfKey } = useTranslation();
  const { form, handleSubmit, isSaving } = useSsoProvisioningForm(
    organizationId,
    connection,
  );
  const rootError = tIfKey(form.formState.errors.root?.message);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {t('security.provisioning.title')}
        </CardTitle>
        <CardDescription>
          {t('security.provisioning.description')}
        </CardDescription>
      </CardHeader>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6 px-6">
            <ControlledSelectInput
              name="defaultRole"
              label={t('security.provisioning.defaultRole')}
              options={ROLE_OPTIONS.map(({ value, labelKey }) => ({
                value,
                label: t(labelKey),
              }))}
              description={t('security.provisioning.defaultRoleHint')}
              direction="horizontal"
            />
            <ControlledSelectInput
              name="sessionMaxAgeSeconds"
              label={t('security.provisioning.sessionLengthLabel')}
              options={SESSION_LENGTH_OPTIONS.map(({ value, labelKey }) => ({
                value,
                label: t(labelKey),
              }))}
              description={t('security.provisioning.sessionLengthHint')}
              direction="horizontal"
            />
            <ControlledSwitchInput
              name="jitEnabled"
              label={t('security.provisioning.jit')}
              description={t('security.provisioning.jitHint')}
            />

            {rootError && (
              <p className="text-sm text-destructive">{rootError}</p>
            )}

            <div className="flex justify-end border-t pt-6">
              <Button
                type="submit"
                disabled={!form.formState.isDirty}
                isLoading={isSaving}
              >
                {t('common.save')}
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Card>
  );
}
