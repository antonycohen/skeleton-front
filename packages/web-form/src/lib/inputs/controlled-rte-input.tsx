import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  RichTextEditor,
} from '@skeleton/web-components';
import {
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from 'react-hook-form';
import { useId } from 'react';

type ControlledRTEInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  direction?: 'horizontal' | 'vertical';
  className?: string;
};

export function ControlledRTEInput<T extends FieldValues>(
  props: ControlledRTEInputProps<T>,
) {
  const { name, label, placeholder, description, disabled, direction = 'vertical', className } = props;
  const form = useFormContext();
  const { control } = form;
  const { field, fieldState } = useController({
    name,
    control: control,
  });
  const id = useId();

  const rteElement = (
    <RichTextEditor
      id={id}
      value={field.value}
      onChange={field.onChange}
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={fieldState.invalid}
    />
  );

  return (
    <Field data-invalid={fieldState.invalid} orientation={direction} className={className}>
      <FieldLabel htmlFor={id} className={direction === 'horizontal' ? 'font-semibold basis-1/2' : ''}>
        {label}
      </FieldLabel>
      {direction === 'horizontal' ? (
        <div className="flex flex-col basis-1/2">
          {rteElement}
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </div>
      ) : (
        <>
          {rteElement}
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </>
      )}
    </Field>
  );
}
