import { Field, FieldError, FieldLabel, Input } from '@skeleton/web-components';
import { FieldPath, FieldValues, get, useFormContext } from 'react-hook-form';

type ControlledNumberInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
};

export function ControlledNumberInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  min,
  max,
  step,
}: ControlledNumberInputProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();
  const error = (get(errors, name) as { message?: string } | undefined)?.message;

  return (
    <Field data-invalid={!!error}>
      <FieldLabel>{label}</FieldLabel>
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        {...register(name, { valueAsNumber: true })}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}
