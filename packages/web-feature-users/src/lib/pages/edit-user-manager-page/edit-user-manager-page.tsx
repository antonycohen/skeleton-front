import { useParams } from 'react-router-dom';
import {
  LayoutContent,
  LayoutHeader,
  LayoutTopbar,
  useBreadcrumb,
} from '@skeleton/web-layout';

import {
  ControlledTextareaInput,
  createConnectedInputHelpers,
} from '@skeleton/web-form';
import { Button, Field, FieldGroup } from '@skeleton/web-components';
import { useGetUserById } from '@skeleton/core-api';
import { FormProvider, useForm } from 'react-hook-form';
import { User, userSchema } from '@skeleton/core-api-models';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@skeleton/core-translations';

export function EditUserManagerPage() {
  const { userId = '' } = useParams<{ userId: string }>();
  const { t } = useTranslation();
  const { data: user } = useGetUserById({
    id: userId,
    fields: {
      firstName: null,
      lastName: null,
      email: null,
    },
  });

  const form = useForm<User>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    values: user,
  });

  function onSubmit(data: User) {
    console.log(data);
  }

  const breadcrumbs = useBreadcrumb([
    { label: t('adminUsers.breadcrumb.home'), to: '/' },
    { label: t('adminUsers.breadcrumb.users'), to: '/users' },
    { label: `${userId}` },
  ]);

  if (!user) {
    return <div>{t('common.loading')}</div>;
  }

  const { ControlledTextInput } = createConnectedInputHelpers<User>();

  return (
    <div>
      <header className="sticky top-0 z-30">
        <LayoutTopbar breadcrumbs={breadcrumbs} />
      </header>
      <LayoutHeader pageTitle={t('adminUsers.edit.title')} />
      <LayoutContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormProvider {...form}>
            <FieldGroup>
              <ControlledTextInput name={'firstName'} label={t('adminUsers.edit.firstName')} />
              <ControlledTextareaInput name={'lastName'} label={t('adminUsers.edit.lastName')} />
              <Field orientation="horizontal">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  {t('adminUsers.edit.reset')}
                </Button>
                <Button type="submit">{t('adminUsers.edit.submit')}</Button>
              </Field>
            </FieldGroup>
          </FormProvider>
        </form>
      </LayoutContent>
    </div>
  );
}
