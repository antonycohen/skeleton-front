import { FormProvider } from 'react-hook-form';
import { ReadPrice, UpdatePrice } from '@skeleton/core-api-models';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@skeleton/web-components';
import { createConnectedInputHelpers } from '@skeleton/web-form';
import { useEditPriceForm } from '../hooks/use-edit-price-form';
import { useTranslation } from '@skeleton/core-translations';

type EditPriceModalProps = {
  price: ReadPrice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const EditPriceModal = ({
  price,
  open,
  onOpenChange,
}: EditPriceModalProps) => {
  const { t } = useTranslation();
  const { form, handleSubmit, isUpdating } = useEditPriceForm(price, () =>
    onOpenChange(false),
  );

  const { ControlledTextInput } = createConnectedInputHelpers<UpdatePrice>();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('adminPayment.price.edit.title')}</DialogTitle>
          <DialogDescription>
            {t('adminPayment.price.edit.description')}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="contents">
            <DialogBody className="flex flex-col gap-4">
              <ControlledTextInput
                name="nickname"
                label={t('adminPayment.price.nickname')}
                placeholder={t('adminPayment.price.nicknamePlaceholder')}
              />
            </DialogBody>
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
