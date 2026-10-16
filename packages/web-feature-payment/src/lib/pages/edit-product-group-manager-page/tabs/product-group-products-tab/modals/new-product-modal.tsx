import { FormProvider } from 'react-hook-form';
import { CreateProduct } from '@skeleton/core-api-models';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { createConnectedInputHelpers } from '@skeleton/web-form';
import { useNewProductForm } from '../hooks/use-new-product-form';
import { QuotasEditor } from '../components/quotas-editor';
import { useTranslation } from '@skeleton/core-translations';

type NewProductModalProps = {
  productGroupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const NewProductModal = ({
  productGroupId,
  open,
  onOpenChange,
}: NewProductModalProps) => {
  const { t } = useTranslation();
  const { form, handleSubmit, isCreating } = useNewProductForm({
    productGroupId,
    onSuccess: () => onOpenChange(false),
  });

  const { ControlledTextInput, ControlledTextareaInput, ControlledSwitchInput } =
    createConnectedInputHelpers<CreateProduct>();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('adminPayment.product.new.title')}</DialogTitle>
          <DialogDescription>
            {t('adminPayment.product.new.description')}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <ControlledTextInput
              name="id"
              label={t('adminPayment.product.id')}
              placeholder={t('adminPayment.product.idPlaceholder')}
            />
            <ControlledTextInput
              name="name"
              label={t('adminPayment.product.name')}
              placeholder={t('adminPayment.product.namePlaceholder')}
            />
            <ControlledTextareaInput
              name="description"
              label={t('adminPayment.product.description')}
              placeholder={t('adminPayment.product.descriptionPlaceholder')}
            />
            <ControlledSwitchInput
              name="active"
              label={t('adminPayment.product.active')}
              description={t('adminPayment.product.activeDescription')}
            />
            <QuotasEditor />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" isLoading={isCreating}>
                {t('common.create')}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
