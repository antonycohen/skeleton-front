import {Field, FieldError, FieldLabel, Input} from '@skeleton/web-components';
import {
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from 'react-hook-form';
import {useId} from 'react';

type ControlledPasswordInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  direction?: 'horizontal' | 'vertical';
  className?: string;
};

export function ControlledPasswordInput<T extends FieldValues>(
  props: ControlledPasswordInputProps<T>,
) {
  const {name, label, placeholder, direction = 'vertical', className} = props;
  const form = useFormContext();
  const {control} = form;
  const {field, fieldState} = useController({
    name,
    control: control,
  });
  const id = useId();

  const inputElement = (
    <Input
      {...field}
      type="password"
      aria-invalid={fieldState.invalid}
      autoComplete="off"
      placeholder={placeholder}
      id={id}
    />
  );

  return (
    <Field data-invalid={fieldState.invalid} orientation={direction} className={className}>
      <FieldLabel htmlFor={id} className={direction === 'horizontal' ? 'font-semibold basis-1/2' : ''}>
        {label}
      </FieldLabel>
      {direction === 'horizontal' ? (
        <div className="flex flex-col basis-1/2">
          {inputElement}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </div>
      ) : (
        <>
          {inputElement}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </>
      )}
    </Field>
  );
}
