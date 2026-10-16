import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@skeleton/web-components';
import {
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from 'react-hook-form';
import { type ClipboardEvent, useCallback, useId } from 'react';
import { cn } from '@skeleton/core-utils';

type ControlledTextInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  description?: string;
  direction?: 'horizontal' | 'vertical';
  className?: string;
  inputPrefix?: string;
  trimEnd?: string;
  /** Custom element rendered before the input (e.g., icon badge) */
  leftElement?: React.ReactNode;
  /** Custom element rendered after the input (e.g., submit button) */
  rightElement?: React.ReactNode;
  /** Visually hide the label (still accessible via sr-only) */
  hideLabel?: boolean;
  disabled?: boolean;
  /** Additional CSS classes for the input element */
  inputClassName?: string;
  /** Additional CSS classes for the InputGroup container */
  inputGroupClassName?: string;
  /** Optional callback to normalize the field value when the input loses focus */
  normalizeOnBlur?: (value: string) => string;
};

export function ControlledTextInput<T extends FieldValues>(
  props: ControlledTextInputProps<T>,
) {
  const { name, label, placeholder, description, direction = 'vertical', className, inputPrefix, trimEnd, leftElement, rightElement, hideLabel, disabled, inputClassName, inputGroupClassName, normalizeOnBlur } = props;
  const form = useFormContext();
  const { control } = form;
  const { field, fieldState } = useController({
    name,
    control: control,
  });
  const id = useId();

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      if (!inputPrefix && !trimEnd) return;
      const pasted = e.clipboardData.getData('text');
      let value = pasted;
      if (inputPrefix && value.startsWith(inputPrefix)) {
        value = value.slice(inputPrefix.length);
      }
      if (trimEnd) {
        while (value.endsWith(trimEnd)) {
          value = value.slice(0, -trimEnd.length);
        }
      }
      if (value !== pasted) {
        e.preventDefault();
        field.onChange(value);
      }
    },
    [inputPrefix, trimEnd, field]
  );

  const handleBlur = useCallback(() => {
    if (normalizeOnBlur) {
      const current = field.value as string;
      const normalized = normalizeOnBlur(current);
      if (normalized !== current) {
        field.onChange(normalized);
      }
    }
    field.onBlur();
  }, [normalizeOnBlur, field]);

  const inputElement = inputPrefix ? (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <InputGroupText>{inputPrefix}</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        {...field}
        onBlur={normalizeOnBlur ? handleBlur : field.onBlur}
        onPaste={handlePaste}
        aria-invalid={fieldState.invalid}
        autoComplete="off"
        placeholder={placeholder}
        id={id}
        disabled={disabled}
        className={inputClassName}
      />
    </InputGroup>
  ) : (leftElement || rightElement) ? (
    <InputGroup className={cn(inputGroupClassName)}>
      {leftElement && (
        <InputGroupAddon align="inline-start">{leftElement}</InputGroupAddon>
      )}
      <InputGroupInput
        {...field}
        onBlur={normalizeOnBlur ? handleBlur : field.onBlur}
        onPaste={trimEnd ? handlePaste : undefined}
        aria-invalid={fieldState.invalid}
        autoComplete="off"
        placeholder={placeholder}
        id={id}
        disabled={disabled}
        className={inputClassName}
      />
      {rightElement && (
        <InputGroupAddon align="inline-end">{rightElement}</InputGroupAddon>
      )}
    </InputGroup>
  ) : (
    <Input
      {...field}
      onBlur={normalizeOnBlur ? handleBlur : field.onBlur}
      onPaste={trimEnd ? handlePaste : undefined}
      aria-invalid={fieldState.invalid}
      autoComplete="off"
      placeholder={placeholder}
      id={id}
      disabled={disabled}
      className={inputClassName}
    />
  );

  return (
    <Field data-invalid={fieldState.invalid} orientation={direction} className={className}>
      <FieldLabel htmlFor={id} className={cn(direction === 'horizontal' ? 'font-semibold basis-1/2' : '', hideLabel && 'sr-only')}>
        {label}
      </FieldLabel>
      {direction === 'horizontal' ? (
        <div className="flex flex-col basis-1/2">
          {inputElement}
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </div>
      ) : (
        <>
          {inputElement}
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </>
      )}
    </Field>
  );
}
