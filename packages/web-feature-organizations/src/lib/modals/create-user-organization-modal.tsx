import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@skeleton/web-components';
import {CreateOrganization, Organization} from '@skeleton/core-api-models';
import {useCreateUserOrganizationForm} from '../hooks/use-create-user-organization-form';
import {Info, X} from 'lucide-react';
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
      <DialogContent
        showCloseButton={false}
        className={
          isSuccessState
            ? 'overflow-clip rounded-3xl p-0 shadow-lg sm:max-w-md'
            : 'flex flex-col gap-6 rounded-3xl p-8 shadow-lg sm:max-w-md'
        }
      >
        {isSuccessState ? (
          <>
            {/* Close button */}
            <DialogClose className="absolute right-[15px] top-[15px] z-10 flex size-8 items-center justify-center rounded-md bg-secondary">
              <X className="size-4 opacity-70" />
              <span className="sr-only">{t('common.close')}</span>
            </DialogClose>

            {/* Cover illustration */}
            <div className="flex flex-col items-start px-2 pt-2">
              <div className="w-full overflow-clip rounded-2xl">
                <div className="relative aspect-[2/1] w-full bg-indigo-200">
                  <img
                    src={`${assetsUrl}/workspace-created.svg`}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="flex flex-col gap-3 p-8 text-center">
              <DialogTitle className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                {t('workspaces.create.successTitle')}
              </DialogTitle>
              <p className="text-base text-muted-foreground">
                {t('workspaces.create.successDescription', { name: createdOrganization.name })}
              </p>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8">
              <Button size="lg" className="w-full" onClick={handleDone}>
                {t('common.done')}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start gap-4">
              <DialogTitle className="flex-1 font-heading text-xl font-semibold tracking-tight text-foreground">
                {t('workspaces.create.title')}
              </DialogTitle>
              <DialogClose className="shrink-0 opacity-70 transition-opacity hover:opacity-100">
                <X className="size-6" />
                <span className="sr-only">{t('common.close')}</span>
              </DialogClose>
            </div>

            <FormProvider {...form}>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <ControlledTextInput
                    name="name"
                    label={t('workspaces.create.nameLabel')}
                    placeholder={t('workspaces.create.namePlaceholder')}
                    direction="vertical"
                  />
                  <p className="text-sm text-muted-foreground">
                    {t('workspaces.create.nameHint')}
                  </p>
                </div>

                <div className="flex gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-primary">
                  <Info className="mt-0.5 size-4 shrink-0" />
                  <div className="flex flex-col gap-2 text-sm leading-5">
                    <p className="font-medium">{t('workspaces.create.ownerTitle')}</p>
                    <p>{t('workspaces.create.ownerDescription')}</p>
                  </div>
                </div>

                {form.formState.errors.root && (
                  <p className="text-sm text-destructive">
                    {tIfKey(form.formState.errors.root.message)}
                  </p>
                )}

                <div className="flex items-center justify-between">
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
                </div>
              </form>
            </FormProvider>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
