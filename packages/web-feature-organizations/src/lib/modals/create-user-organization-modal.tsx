import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMedia,
  DialogTitle,
  Alert,
  AlertDescription,
  AlertTitle,
} from '@skeleton/web-components';
import {CreateOrganization, Organization} from '@skeleton/core-api-models';
import {useCreateUserOrganizationForm} from '../hooks/use-create-user-organization-form';
import {Info} from 'lucide-react';
import {createConnectedInputHelpers} from '@skeleton/web-form';
import {FormProvider} from 'react-hook-form';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useStaticAssetsUrl} from '@skeleton/core-utils';
import {useTranslation} from '@skeleton/core-translations';

type CreateUserOrganizationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
};

export const CreateUserOrganizationModal = ({
  open,
  onOpenChange,
  userId,
}: CreateUserOrganizationModalProps) => {
  const { t, tIfKey } = useTranslation();
  const navigate = useNavigate();

  const [createdOrganization, setCreatedOrganization] = useState<Organization | null>(null);

  const { form, handleSubmit, isLoading, isSuccess, reset } =
    useCreateUserOrganizationForm({
      userId,
      onSuccess: (organization) => setCreatedOrganization(organization)
    });

  const { ControlledTextInput } = createConnectedInputHelpers<CreateOrganization>();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
    }
    onOpenChange(open);
  };

  const assetsUrl = useStaticAssetsUrl();

  const handleDone = () => {
    if (createdOrganization?.id) {
      navigate(`/w/${createdOrganization.id}`);
      setCreatedOrganization(null);
    }
    handleOpenChange(false);
  };

  const isSuccessState = isSuccess && createdOrganization;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* The form, then a success with its illustration on top. */}
      <DialogContent size={isSuccessState ? 'sm' : 'md'}>
        {isSuccessState ? (
          <>
            <DialogMedia>
              <img
                src={`${assetsUrl}/workspace-created.svg`}
                alt=""
                className="aspect-[2/1] bg-indigo-200 object-cover"
              />
            </DialogMedia>
            <DialogHeader className="items-center text-center sm:text-center">
              <DialogTitle className="heading-sm">{t('workspaces.create.successTitle')}</DialogTitle>
              <DialogDescription>
                {t('workspaces.create.successDescription', { name: createdOrganization.name })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button size="lg" className="w-full" onClick={handleDone}>
                {t('common.done')}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('workspaces.create.title')}</DialogTitle>
            </DialogHeader>

            <FormProvider {...form}>
              <form onSubmit={handleSubmit} className="contents">
                <DialogBody className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <ControlledTextInput
                      name="name"
                      label={t('workspaces.create.nameLabel')}
                      placeholder={t('workspaces.create.namePlaceholder')}
                      direction="vertical"
                    />
                    <p className="body text-muted-foreground">
                      {t('workspaces.create.nameHint')}
                    </p>
                  </div>

                  <Alert>
                    <Info />
                    <AlertTitle>{t('workspaces.create.ownerTitle')}</AlertTitle>
                    <AlertDescription>
                      {t('workspaces.create.ownerDescription')}
                    </AlertDescription>
                  </Alert>

                  {form.formState.errors.root && (
                    <p className="body text-destructive">
                      {tIfKey(form.formState.errors.root.message)}
                    </p>
                  )}
                </DialogBody>

                <DialogFooter className="flex-row justify-between sm:justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleOpenChange(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" isLoading={isLoading}>
                    {t('workspaces.create.submit')}
                  </Button>
                </DialogFooter>
              </form>
            </FormProvider>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
