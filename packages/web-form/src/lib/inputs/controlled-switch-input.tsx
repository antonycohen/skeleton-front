import {Field, FieldError, Label, Switch} from '@skeleton/web-components';
import {useId} from 'react';
import {FieldPathByValue, FieldValues, useController, useFormContext} from 'react-hook-form';
import {cn} from '@skeleton/core-utils';

type ControlledSwitchInputProps<T extends FieldValues> = {
  name: FieldPathByValue<T, boolean | undefined | null>;
  label: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  inline?: boolean;
};

export function ControlledSwitchInput<T extends FieldValues>(
  props: ControlledSwitchInputProps<T>,
) {
  const {name, label, description, className, disabled, inline = false} = props;
  const form = useFormContext();
  const {control} = form;
  const {field, fieldState} = useController({
    name,
    control,
  });
  const id = useId();

  return (
    <Field
      orientation="horizontal"
      data-invalid={fieldState.invalid}
      className={cn(inline && 'w-fit', className)}
    >
      <Switch
        id={id}
        checked={field.value as boolean}
        onCheckedChange={(checked) => field.onChange(checked as boolean)}
        onBlur={field.onBlur}
        disabled={disabled}
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
