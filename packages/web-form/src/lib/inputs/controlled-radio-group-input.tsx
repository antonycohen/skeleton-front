import { useId } from 'react';
import {
  Field,
  FieldError,
  FieldLabel,
  Label,
  RadioGroup,
  RadioGroupItem,
} from '@skeleton/web-components';
import {
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from 'react-hook-form';

export type RadioGroupOption = {
  value: string;
  label: string;
};

type ControlledRadioGroupInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  options: RadioGroupOption[];
  direction?: 'horizontal' | 'vertical';
  className?: string;
};

export function ControlledRadioGroupInput<T extends FieldValues>(
  props: ControlledRadioGroupInputProps<T>,
) {
  const { name, label, options, direction = 'vertical', className } = props;
  const form = useFormContext();
  const { control } = form;
  const { field, fieldState } = useController({
    name,
    control: control,
  });
  const id = useId();

  const radioGroupElement = (
    <RadioGroup
      value={field.value}
      onValueChange={field.onChange}
      className="gap-3"
    >
      {options.map((option) => {
        const optionId = `${id}-${option.value}`;
        return (
          <div key={option.value} className="flex items-center gap-3">
            <RadioGroupItem value={option.value} id={optionId} />
            <Label htmlFor={optionId} className="text-sm font-medium cursor-pointer">
              {option.label}
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );

  return (
    <Field data-invalid={fieldState.invalid} orientation={direction} className={className}>
      <FieldLabel className={direction === 'horizontal' ? 'font-medium' : ''}>
        {label}
      </FieldLabel>
      {direction === 'horizontal' ? (
        <div className="flex flex-col flex-1">
          {radioGroupElement}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </div>
      ) : (
        <>
          {radioGroupElement}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </>
      )}
    </Field>
  );
}
