import { useCallback, useEffect, useId, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { UpdateProduct } from '@skeleton/core-api-models';
import {
  Button,
  Field,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@skeleton/web-components';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@skeleton/core-translations';

const QUOTA_KEY_OPTIONS = [
  // Feature keys the backend meters. Add one entry per quota feature.
  { value: 'seats', label: 'seats' },
  { value: 'aiCredits', label: 'aiCredits' },
] as const;

type QuotaEntry = {
  rowId: string;
  key: string;
  value: string;
};

const buildEntries = (
  quotas: Record<string, number> | undefined | null,
): QuotaEntry[] =>
  Object.entries(quotas ?? {}).map(([key, value], index) => ({
    rowId: `${index}-${key}`,
    key,
    value: String(value),
  }));

const entriesToRecord = (entries: QuotaEntry[]): Record<string, number> => {
  const record: Record<string, number> = {};
  for (const entry of entries) {
    const trimmedKey = entry.key.trim();
    if (!trimmedKey) continue;
    const parsed = Number(entry.value);
    if (Number.isFinite(parsed)) {
      record[trimmedKey] = parsed;
    }
  }
  return record;
};

export const QuotasEditor = () => {
  const { t } = useTranslation();
  const labelId = useId();
  const { getValues, setValue } = useFormContext<UpdateProduct>();

  const [entries, setEntries] = useState<QuotaEntry[]>(() =>
    buildEntries(getValues('quotas') as Record<string, number> | undefined),
  );

  // Re-sync when the form's quotas change externally (e.g. async values: reset).
  useEffect(() => {
    const current = getValues('quotas') as Record<string, number> | undefined;
    setEntries(buildEntries(current));
    // We intentionally re-derive on every mount of a freshly-keyed editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = useCallback(
    (next: QuotaEntry[]) => {
      setEntries(next);
      setValue('quotas', entriesToRecord(next), {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const handleKeyChange = (rowId: string, key: string) => {
    commit(entries.map((e) => (e.rowId === rowId ? { ...e, key } : e)));
  };

  const handleValueChange = (rowId: string, value: string) => {
    commit(entries.map((e) => (e.rowId === rowId ? { ...e, value } : e)));
  };

  const handleAdd = () => {
    commit([
      ...entries,
      { rowId: `${Date.now()}-${entries.length}`, key: '', value: '' },
    ]);
  };

  const handleRemove = (rowId: string) => {
    commit(entries.filter((e) => e.rowId !== rowId));
  };

  return (
    <Field>
      <FieldLabel id={labelId}>{t('adminPayment.quotas.label')}</FieldLabel>
      <div className="flex flex-col gap-2" aria-labelledby={labelId}>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('adminPayment.quotas.empty')}</p>
        ) : (
          entries.map((entry) => {
            const usedKeys = new Set(
              entries
                .filter((e) => e.rowId !== entry.rowId && e.key)
                .map((e) => e.key),
            );
            return (
              <div key={entry.rowId} className="flex items-center gap-2">
                <Select
                  value={entry.key || undefined}
                  onValueChange={(value) => handleKeyChange(entry.rowId, value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={t('adminPayment.quotas.selectPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {QUOTA_KEY_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        disabled={
                          usedKeys.has(option.value) && entry.key !== option.value
                        }
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="0"
                  value={entry.value}
                  onChange={(e) => handleValueChange(entry.rowId, e.target.value)}
                  className="w-32"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemove(entry.rowId)}
                  aria-label={t('adminPayment.quotas.remove')}
                >
                  <IconTrash className="size-4" />
                </Button>
              </div>
            );
          })
        )}
        <div>
          <Button type="button" size="sm" variant="outline" onClick={handleAdd}>
            <IconPlus className="size-4" />
            {t('adminPayment.quotas.add')}
          </Button>
        </div>
      </div>
    </Field>
  );
};
