import { FormProvider } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetOrganizationById } from '@skeleton/core-api';
import { UpdateOrganization } from '@skeleton/core-api-models';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@skeleton/web-components';
import { createConnectedInputHelpers } from '@skeleton/web-form';
import { useTranslation } from '@skeleton/core-translations';
import { useEditOrganizationProfileForm } from './hooks/use-edit-organization-profile-form';
import { OrganizationMfaRequirementCard } from './components/organization-mfa-requirement-card';
import { OrganizationSsoCard } from './components/organization-sso-card';

const TYPE_LABEL_KEYS: Record<string, string> = {
  business: 'adminOrganizations.types.business',
  individual: 'adminOrganizations.types.individual',
};

export const EditOrganizationProfileTab = () => {
  const { t } = useTranslation();
  const { organizationId = '' } = useParams<{ organizationId: string }>();
  const { data: organization, isLoading } = useGetOrganizationById({
    id: organizationId,
    fields: {
      id: null,
      name: null,
      domain: null,
      type: null,
      mfaRequired: null,
      ssoAvailable: null,
    },
  });

  const { form, handleSubmit, isUpdating } =
    useEditOrganizationProfileForm(organization);

  const { ControlledTextInput } =
    createConnectedInputHelpers<UpdateOrganization>();

  if (isLoading) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <Card className="rounded-2xl gap-0">
          <CardHeader>
            <CardTitle className="text-xl">
              {t('adminOrganizations.profile.title')}
            </CardTitle>
            <CardDescription>
              {t('adminOrganizations.profile.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pt-2">
            <div className="flex flex-col divide-y">
              {/* Type is immutable after creation. */}
              <div className="flex items-center justify-between py-6">
                <span className="text-sm font-medium">
                  {t('adminOrganizations.profile.type')}
                </span>
                <Badge variant="outline" className="capitalize">
                  {organization?.type
                    ? (TYPE_LABEL_KEYS[organization.type]
                        ? t(TYPE_LABEL_KEYS[organization.type])
                        : organization.type)
                    : '-'}
                </Badge>
              </div>
              <ControlledTextInput
                name="name"
                label={t('adminOrganizations.profile.name')}
                direction="horizontal"
                className="py-6"
                placeholder={t('adminOrganizations.profile.namePlaceholder')}
              />
              <ControlledTextInput
                name="domain"
                label={t('adminOrganizations.profile.domain')}
                direction="horizontal"
                className="py-6"
                placeholder="example.com"
              />
            </div>
          </CardContent>
          <CardFooter className="border-t justify-end">
            <Button type="submit" isLoading={isUpdating}>
              {t('common.save')}
            </Button>
          </CardFooter>
        </Card>
      </form>
      {/* Outside the form: the switch applies at once through its own endpoint, "Save" ignores it */}
      <OrganizationMfaRequirementCard
        className="mt-8 max-w-4xl"
        organizationId={organizationId}
        mfaRequired={organization?.mfaRequired}
      />
      <OrganizationSsoCard
        className="mt-8 max-w-4xl"
        organizationId={organizationId}
        ssoAvailable={organization?.ssoAvailable}
      />
    </FormProvider>
  );
};
