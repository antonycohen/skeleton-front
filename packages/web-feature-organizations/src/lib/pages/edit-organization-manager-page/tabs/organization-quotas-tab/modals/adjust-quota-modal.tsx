import { useId } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ReadQuota } from '@skeleton/core-api-models';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
} from '@skeleton/web-components';
import { useAdjustQuotaForm } from '../hooks/use-adjust-quota-form';
import { getFeatureLabel } from '../quota-feature-label';
import { useTranslation } from '@skeleton/core-translations';

type AdjustQuotaModalProps = {
  row: ReadQuota;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type AdjustQuotaFormProps = {
  quota: ReadQuota;
  onDone: () => void;
};

const AdjustQuotaForm = ({ quota, onDone }: AdjustQuotaFormProps) => {
  const { t } = useTranslation();
  const { organizationId = '' } = useParams<{ organizationId: string }>();
  const newLimitId = useId();
  const periodEndId = useId();
  const reasonId = useId();

  const {
    form,
    handleSubmit,
    currentLimit,
    floor,
    currentPeriodEnd,
    isAdjusting,
  } = useAdjustQuotaForm(organizationId, quota, onDone);

  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const newLimit = watch('newLimit');
  const delta = Number.isFinite(newLimit) ? newLimit - currentLimit : 0;
  const wasUnlimited = quota.quotaLimit === null;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('adminOrganizations.quotas.adjust.title')}</DialogTitle>
        <DialogDescription>
          {t('adminOrganizations.quotas.adjust.description', {
            feature: getFeatureLabel(quota),
          })}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <dl className="grid grid-cols-2 gap-y-1 rounded-lg bg-muted/50 p-3 text-sm">
          <dt className="text-muted-foreground">
            {t('adminOrganizations.quotas.adjust.currentLimit')}
          </dt>
          <dd className="text-right tabular-nums">
            {wasUnlimited
              ? t('adminOrganizations.quotas.adjust.unlimited')
              : currentLimit}
          </dd>
          <dt className="text-muted-foreground">
            {t('adminOrganizations.quotas.adjust.used')}
          </dt>
          <dd className="text-right tabular-nums">{floor}</dd>
          <dt className="text-muted-foreground">
            {t('adminOrganizations.quotas.adjust.periodEnds')}
          </dt>
          {/* Down to the minute, matching the field below: a period end is an
              instant, and a date alone would hide what is actually changing. */}
          <dd className="text-right tabular-nums">
            {currentPeriodEnd
              ? format(currentPeriodEnd, 'dd/MM/yyyy HH:mm')
              : '-'}
          </dd>
        </dl>

        <Field data-invalid={!!errors.newLimit}>
          <FieldLabel htmlFor={newLimitId}>
            {t('adminOrganizations.quotas.adjust.newLimit')}
          </FieldLabel>
          <Input
            id={newLimitId}
            type="number"
            step={1}
            min={floor}
            autoComplete="off"
            aria-invalid={!!errors.newLimit}
            {...register('newLimit', { valueAsNumber: true })}
          />
          <FieldDescription>
            {wasUnlimited
              ? t('adminOrganizations.quotas.adjust.unlimitedHint')
              : delta === 0
                ? t('adminOrganizations.quotas.adjust.floorHint', { floor })
                : delta > 0
                  ? t('adminOrganizations.quotas.adjust.increaseHint', { delta })
                  : t('adminOrganizations.quotas.adjust.decreaseHint', {
                      delta: -delta,
                    })}
          </FieldDescription>
          {errors.newLimit && <FieldError errors={[errors.newLimit]} />}
        </Field>

        <Field data-invalid={!!errors.periodEnd}>
          <FieldLabel htmlFor={periodEndId}>
            {t('adminOrganizations.quotas.adjust.periodEnd')}
          </FieldLabel>
          <Input
            id={periodEndId}
            type="datetime-local"
            aria-invalid={!!errors.periodEnd}
            {...register('periodEnd')}
          />
          <FieldDescription>
            {t('adminOrganizations.quotas.adjust.periodEndHint')}
          </FieldDescription>
          {errors.periodEnd && <FieldError errors={[errors.periodEnd]} />}
        </Field>

        <Field data-invalid={!!errors.reason}>
          <FieldLabel htmlFor={reasonId}>
            {t('adminOrganizations.quotas.adjust.reason')}
          </FieldLabel>
          <Input
            id={reasonId}
            placeholder={t('adminOrganizations.quotas.adjust.reasonPlaceholder')}
            autoComplete="off"
            aria-invalid={!!errors.reason}
            {...register('reason')}
          />
          <FieldDescription>
            {t('adminOrganizations.quotas.adjust.reasonHint')}
          </FieldDescription>
          {errors.reason && <FieldError errors={[errors.reason]} />}
        </Field>

        {errors.root && (
          <p className="text-sm text-destructive">{errors.root.message}</p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isAdjusting}>
            {t('common.save')}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export const AdjustQuotaModal = ({
  row: quota,
  open,
  onOpenChange,
}: AdjustQuotaModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      {/*
        The form lives in a child of DialogContent, which Radix unmounts on
        close. CollectionRowActions keeps this modal mounted for every row, so a
        form hoisted up here would survive Cancel and reopen holding whatever was
        typed — and submit a delta the admin never intended.
      */}
      <AdjustQuotaForm quota={quota} onDone={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
);
