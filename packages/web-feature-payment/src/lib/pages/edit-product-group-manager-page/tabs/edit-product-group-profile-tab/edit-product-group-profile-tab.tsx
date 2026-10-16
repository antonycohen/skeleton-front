import { FormProvider } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetAdminProductGroupById } from '@skeleton/core-api';
import { UpdateProductGroup } from '@skeleton/core-api-models';
import {
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
import { useEditProductGroupProfileForm } from './hooks/use-edit-product-group-profile-form';

export const EditProductGroupProfileTab = () => {
  const { t } = useTranslation();
  const { productGroupId = '' } = useParams<{ productGroupId: string }>();
  const { data: productGroup, isLoading } = useGetAdminProductGroupById({
    id: productGroupId,
    fields: {
      id: null,
      name: null,
      description: null,
      active: null,
    },
  });

  const { form, handleSubmit, isUpdating } =
    useEditProductGroupProfileForm(productGroup);

  const { ControlledTextInput, ControlledTextareaInput, ControlledSwitchInput } =
    createConnectedInputHelpers<UpdateProductGroup>();

  if (isLoading) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit}>
        <Card className="rounded-2xl gap-0">
          <CardHeader>
            <CardTitle className="text-xl">{t('adminPayment.productGroup.profile.title')}</CardTitle>
            <CardDescription>
              {t('adminPayment.productGroup.profile.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pt-2">
            <div className="flex flex-col divide-y">
              <ControlledTextInput
                name="name"
                label={t('adminPayment.productGroup.profile.name')}
                direction="horizontal"
                className="py-6"
                placeholder={t('adminPayment.productGroup.profile.namePlaceholder')}
              />
              <ControlledTextareaInput
                name="description"
                label={t('adminPayment.productGroup.profile.descriptionLabel')}
                direction="horizontal"
                className="py-6"
                placeholder={t('adminPayment.productGroup.profile.descriptionPlaceholder')}
              />
              <ControlledSwitchInput
                name="active"
                label={t('adminPayment.productGroup.profile.active')}
                description={t('adminPayment.productGroup.profile.activeDescription')}
                className="py-6"
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
    </FormProvider>
  );
};
