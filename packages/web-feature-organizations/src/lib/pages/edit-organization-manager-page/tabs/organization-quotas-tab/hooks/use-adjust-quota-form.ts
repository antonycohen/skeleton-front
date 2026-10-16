import { useMemo } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { ReadQuota } from '@skeleton/core-api-models';
import { ApiError, useAdjustQuota } from '@skeleton/core-api';
import { toast } from 'sonner';
import { TFunction, useTranslation } from '@skeleton/core-translations';

/**
 * An unlimited quota (`quotaLimit === null`) is worth 0 to the backend: it sums the
 * signed delta onto `quotaLimit == null ? 0`. Saving a new limit on such a quota
 * therefore turns it into a finite one — the modal warns about it.
 */
export const getCurrentLimit = (quota: ReadQuota) => quota.quotaLimit ?? 0;

/**
 * The backend refuses any limit below used + reserved. `currentUsage` already
 * carries both (the DTO provider sums them), so it is the floor as-is.
 */
export const getLimitFloor = (quota: ReadQuota) => quota.currentUsage ?? 0;

export const getCurrentPeriodEnd = (quota: ReadQuota) =>
  quota.periodEnd ? new Date(quota.periodEnd) : undefined;

/**
 * The period end is an instant, so the field is one too — a native
 * `datetime-local`, whose value is exactly this string.
 *
 * An earlier version used a day picker and mapped the chosen day to its end.
 * That could not represent a move within the current day (10:00 to 23:59), and
 * worse, the widget deselects when you click the day already selected, so
 * "re-pick the same day" was not expressible at all. Matching the field's
 * granularity to the data's removes that whole class of problem: the seed and
 * the value are the same string, so comparing them is exact.
 *
 * The seed drops any seconds the stored end carries, which is the one thing this
 * cannot express. A sub-minute move is not a thing an operator needs.
 */
const DATETIME_LOCAL_FORMAT = "yyyy-MM-dd'T'HH:mm";

const toDateTimeLocal = (instant: Date) =>
  format(instant, DATETIME_LOCAL_FORMAT);

export type AdjustQuotaFormValues = {
  newLimit: number;
  periodEnd?: string;
  reason?: string;
};

/**
 * The single answer to "is a period end being sent?", used by both the schema
 * and the submit. They previously asked it separately and disagreed about the
 * empty string: validation read a cleared field as a change, submit read it as
 * none, so clearing the field slipped past the guard and fired a request with
 * neither adjustment — the exact body the backend rejects.
 */
const isPeriodEndMoved = (periodEnd: string, seededPeriodEnd: string) =>
  periodEnd !== '' && periodEnd !== seededPeriodEnd;

/**
 * Built at module scope on purpose: the "must be in the future" rule reads
 * `Date.now()`, and the React Compiler rejects an impure call sitting in a
 * closure it sees as render code. Out here the rule only runs at validation time,
 * which is when "now" is meant to be sampled anyway.
 */
const buildSchema = (
  floor: number,
  currentLimit: number,
  seededPeriodEnd: string,
  t: TFunction,
) =>
  z
    .object({
      newLimit: z
        .number(t('adminOrganizations.quotas.adjust.errors.limitRequired'))
        .int(t('adminOrganizations.quotas.adjust.errors.limitInteger'))
        .min(
          floor,
          t('adminOrganizations.quotas.adjust.errors.limitBelowFloor', {
            floor,
          }),
        ),
      periodEnd: z.string().optional(),
      reason: z
        .string()
        .max(250, t('adminOrganizations.quotas.adjust.errors.reasonTooLong'))
        .optional(),
    })
    .superRefine((values, ctx) => {
      const periodEnd = values.periodEnd?.trim() ?? '';

      // The API can only move a period end, never remove one, so an emptied
      // field is a slip rather than an instruction — and saying so beats the
      // generic "change something" message it would otherwise fall through to.
      if (periodEnd === '' && seededPeriodEnd !== '') {
        ctx.addIssue({
          code: 'custom',
          path: ['periodEnd'],
          message: t('adminOrganizations.quotas.adjust.errors.periodEndRequired'),
        });
        return;
      }

      if (periodEnd) {
        const parsed = parseISO(periodEnd);
        if (Number.isNaN(parsed.getTime())) {
          ctx.addIssue({
            code: 'custom',
            path: ['periodEnd'],
            message: t('adminOrganizations.quotas.adjust.errors.periodEndInvalid'),
          });
          return;
        }
        if (parsed.getTime() <= Date.now()) {
          ctx.addIssue({
            code: 'custom',
            path: ['periodEnd'],
            message: t('adminOrganizations.quotas.adjust.errors.periodEndPast'),
          });
          return;
        }
      }

      // The backend rejects a body carrying neither adjustment, so an untouched
      // form is caught here rather than by a 400.
      if (
        values.newLimit === currentLimit &&
        !isPeriodEndMoved(periodEnd, seededPeriodEnd)
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['newLimit'],
          message: t('adminOrganizations.quotas.adjust.errors.nothingChanged'),
        });
      }
    });

/**
 * The API keys its validation errors on payload field names, which are not this
 * form's field names — `amount` is edited here as `newLimit`, and `featureKey` is
 * not editable at all. The shared `handleApiError` would call `setError` on those
 * unregistered names and, because it treats any `parametersErrors` as handled,
 * skip its root fallback too — leaving the modal open with nothing shown. So the
 * mapping is done here, and anything unmapped is surfaced on the root.
 */
const FORM_FIELD_BY_API_FIELD: Record<string, keyof AdjustQuotaFormValues> = {
  amount: 'newLimit',
  periodEnd: 'periodEnd',
  period_end: 'periodEnd',
  reason: 'reason',
};

const applyServerErrors = (
  error: ApiError,
  form: UseFormReturn<AdjustQuotaFormValues>,
  t: TFunction,
) => {
  const entries = Object.entries(error.parametersErrors ?? {});
  const unmapped: string[] = [];

  entries.forEach(([apiField, messages]) => {
    const message = messages.join(', ');
    const formField = FORM_FIELD_BY_API_FIELD[apiField];
    if (formField) {
      form.setError(formField, { type: 'server', message });
      return;
    }
    unmapped.push(`${apiField}: ${message}`);
  });

  // Either a field carries the message or the root does — never neither, which
  // is what a failure with no `error` string and no parametersErrors would
  // otherwise produce: the spinner stops and nothing explains why.
  const rootMessage = unmapped.length
    ? unmapped.join(' — ')
    : entries.length
      ? undefined
      : error.error || t('adminOrganizations.quotas.adjust.errors.failed');

  if (rootMessage) {
    form.setError('root', { type: 'server', message: rootMessage });
  }
};

export const useAdjustQuotaForm = (
  organizationId: string,
  quota: ReadQuota,
  onSuccess?: () => void,
) => {
  const { t } = useTranslation();
  const currentLimit = getCurrentLimit(quota);
  const floor = getLimitFloor(quota);
  const currentPeriodEnd = getCurrentPeriodEnd(quota);
  const seededPeriodEnd = currentPeriodEnd
    ? toDateTimeLocal(currentPeriodEnd)
    : '';

  const schema = useMemo(
    () => buildSchema(floor, currentLimit, seededPeriodEnd, t),
    [currentLimit, floor, seededPeriodEnd, t],
  );

  const form = useForm<AdjustQuotaFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      newLimit: currentLimit,
      periodEnd: seededPeriodEnd,
      reason: '',
    },
  });

  const adjustQuota = useAdjustQuota({
    onSuccess: () => {
      toast.success(t('adminOrganizations.quotas.adjust.updated'));
      onSuccess?.();
    },
    onError: (error) => applyServerErrors(error, form, t),
  });

  const handleSubmit = form.handleSubmit((values) => {
    if (!quota.featureKey) return;

    const amount = values.newLimit - currentLimit;
    const periodEnd = values.periodEnd?.trim() ?? '';
    const periodEndChanged = isPeriodEndMoved(periodEnd, seededPeriodEnd);

    adjustQuota.mutate({
      organizationId,
      data: {
        featureKey: quota.featureKey,
        // Both are omitted when unchanged: a zero amount is rejected outright,
        // and resending the same period end would be a pointless write.
        ...(amount !== 0 ? { amount } : {}),
        ...(periodEndChanged
          ? { periodEnd: parseISO(periodEnd).toISOString() }
          : {}),
        reason: values.reason?.trim() || undefined,
      },
    });
  });

  return {
    form,
    handleSubmit,
    currentLimit,
    floor,
    currentPeriodEnd,
    isAdjusting: adjustQuota.isPending,
  };
};
