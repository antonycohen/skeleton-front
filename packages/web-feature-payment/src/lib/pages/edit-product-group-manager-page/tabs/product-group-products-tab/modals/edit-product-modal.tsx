import { FormProvider } from 'react-hook-form';
import { ReadProduct, UpdateProduct } from '@skeleton/core-api-models';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldLabel,
  Input,
} from '@skeleton/web-components';
import { createConnectedInputHelpers } from '@skeleton/web-form';
import { useEditProductForm } from '../hooks/use-edit-product-form';
import { QuotasEditor } from '../components/quotas-editor';
import { useTranslation } from '@skeleton/core-translations';

type EditProductModalProps = {
  product: ReadProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const EditProductModal = ({
  product,
  open,
  onOpenChange,
}: EditProductModalProps) => {
  const { t } = useTranslation();
  const { form, handleSubmit, isUpdating } = useEditProductForm(product, () =>
    onOpenChange(false),
  );

  const { ControlledTextInput, ControlledTextareaInput, ControlledSwitchInput } =
    createConnectedInputHelpers<UpdateProduct>();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('adminPayment.product.edit.title')}</DialogTitle>
          <DialogDescription>
            {t('adminPayment.product.edit.description')}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field>
              <FieldLabel>{t('adminPayment.product.id')}</FieldLabel>
              <Input value={product.id ?? ''} disabled readOnly />
            </Field>
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
            <QuotasEditor key={product.id ?? 'new'} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" isLoading={isUpdating}>
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
