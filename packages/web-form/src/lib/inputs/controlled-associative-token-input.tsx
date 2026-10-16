import {
  Badge,
  Button,
  Field,
  FieldError,
  FieldLabel,
  Input,
} from '@skeleton/web-components';
import { IconPlus, IconX } from '@tabler/icons-react';
import { useState, useId } from 'react';
import { useTranslation } from '@skeleton/core-translations';
import {
  FieldPath,
  FieldPathValue,
  FieldValues,
  useController,
  useFormContext,
} from 'react-hook-form';

type ControlledTokenInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  keyLabel?: string;
  valueLabel?: string;
  direction?: 'horizontal' | 'vertical';
  className?: string;
};

export function ControlledAssociativeTokenInput<T extends FieldValues>(
  props: ControlledTokenInputProps<T>,
) {
  const {
    name,
    label,
    keyPlaceholder,
    valuePlaceholder,
    keyLabel,
    valueLabel,
    direction = 'vertical',
    className,
  } = props;
  const { t } = useTranslation();

  const form = useFormContext();
  const { control } = form;
  const { field, fieldState } = useController({
    name,
    control,
  });

  const id = useId();
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const tokens = (field.value as Record<string, string> | null) ?? {};
  const entries = Object.entries(tokens);

  function handleAdd() {
    if (!newKey.trim() || !newValue.trim()) return;

    const updated = {
      ...tokens,
      [newKey.trim()]: newValue.trim(),
    };

    field.onChange(updated as FieldPathValue<T, FieldPath<T>>);
    setNewKey('');
    setNewValue('');
  }

  function handleRemove(key: string) {
    const { [key]: _, ...rest } = tokens;
    const updated = Object.keys(rest).length > 0 ? rest : null;
    field.onChange(updated as FieldPathValue<T, FieldPath<T>>);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <Field data-invalid={fieldState.invalid} orientation={direction} className={className}>
      <FieldLabel htmlFor={id} className={direction === 'horizontal' ? 'font-semibold basis-1/2' : ''}>
        {label}
      </FieldLabel>
      <div className={direction === 'horizontal' ? 'basis-1/2' : ''}>
        {/* Existing tokens */}
        {entries.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {entries.map(([key, value]) => (
              <Badge
                key={key}
                variant="secondary"
                className="gap-1 pr-1 text-sm"
              >
                <span className="font-medium">{key}:</span>
                <span>{value}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(key)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>


      {/* Add new token */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">
            {keyLabel ?? t('form.associativeToken.key')}
          </label>
          <Input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={keyPlaceholder ?? t('form.associativeToken.key')}
            className="h-9"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">
            {valueLabel ?? t('form.associativeToken.value')}
          </label>
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={valuePlaceholder ?? t('form.associativeToken.value')}
            className="h-9"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!newKey.trim() || !newValue.trim()}
          className="h-9"
        >
          <IconPlus className="h-4 w-4" />
        </Button>
      </div>

      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
