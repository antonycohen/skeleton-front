import { Checkbox, Field, FieldError, Label } from '@skeleton/web-components';
import { useId } from 'react';
import {
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from 'react-hook-form';

type ControlledCheckboxProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  description?: string;
  direction?: 'horizontal' | 'vertical';
  className?: string;
};

export function ControlledCheckbox<T extends FieldValues>(
  props: ControlledCheckboxProps<T>,
) {
  const { name, label, description, direction: _direction = 'vertical', className } = props;
  const form = useFormContext();
  const { control } = form;
  const { field, fieldState } = useController({
    name,
    control,
  });
  const id = useId();

  return (
    <Field orientation="horizontal" data-invalid={fieldState.invalid} className={className}>
      <Checkbox
        id={id}
        checked={field.value as boolean}
        onCheckedChange={(checked) => field.onChange(checked as boolean)}
        aria-invalid={fieldState.invalid}
      />
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id}>{label}</Label>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
