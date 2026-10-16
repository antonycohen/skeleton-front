import { FormProvider } from 'react-hook-form';
import { CreatePrice } from '@skeleton/core-api-models';
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
import { useNewPriceForm } from '../hooks/use-new-price-form';
import { useTranslation } from '@skeleton/core-translations';

type NewPriceModalProps = {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const NewPriceModal = ({
  productId,
  open,
  onOpenChange,
}: NewPriceModalProps) => {
  const { t } = useTranslation();
  const { form, handleSubmit, isCreating } = useNewPriceForm({
    productId,
    onSuccess: () => onOpenChange(false),
  });

  const {
    ControlledTextInput,
    ControlledSelectInput,
    ControlledSwitchInput,
    ControlledNumberInput,
  } = createConnectedInputHelpers<CreatePrice>();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('adminPayment.price.new.title')}</DialogTitle>
          <DialogDescription>
            {t('adminPayment.price.new.description')}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <ControlledTextInput
              name="nickname"
              label={t('adminPayment.price.nickname')}
              placeholder={t('adminPayment.price.nicknamePlaceholder')}
            />
            <ControlledTextInput
              name="lookupKey"
              label={t('adminPayment.price.lookupKey')}
              placeholder={t('adminPayment.price.lookupKeyPlaceholder')}
            />
            <ControlledSelectInput
              name="currency"
              label={t('adminPayment.price.currency')}
              options={[
                { value: 'eur', label: 'EUR' },
                { value: 'usd', label: 'USD' },
              ]}
            />
            <ControlledNumberInput
              name="unitAmountInCents"
              label={t('adminPayment.price.unitAmount')}
              min={0}
              step={1}
              placeholder="0"
            />
            <ControlledSelectInput
              name="recurringInterval"
              label={t('adminPayment.price.recurringInterval')}
              options={[
                { value: 'day', label: t('common.day') },
                { value: 'week', label: t('common.week') },
                { value: 'month', label: t('common.month') },
                { value: 'year', label: t('common.year') },
              ]}
            />
            <ControlledSelectInput
              name="recurringUsageType"
              label={t('adminPayment.price.usageType')}
              options={[
                { value: 'licensed', label: t('adminPayment.price.usageType.licensed') },
                { value: 'metered', label: t('adminPayment.price.usageType.metered') },
              ]}
            />
            <ControlledSwitchInput
              name="active"
              label={t('adminPayment.price.active')}
              description={t('adminPayment.price.activeDescription')}
            />
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
