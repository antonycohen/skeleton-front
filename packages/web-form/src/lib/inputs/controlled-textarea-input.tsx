import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@skeleton/web-components';
import {FieldPath, FieldValues, useController, useFormContext,} from 'react-hook-form';
import {useId} from 'react';
import {useTranslation} from '@skeleton/core-translations';

type ControlledTextInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  description?: string;
  direction?: 'horizontal' | 'vertical';
  className?: string;
  limit?: number;
};

export function ControlledTextareaInput<T extends FieldValues>(
  props: ControlledTextInputProps<T>,
) {
  const { name, label, placeholder, description, direction = 'vertical', className, limit } = props;
  const form = useFormContext();
  const { control } = form;
  const { field, fieldState } = useController({
    name,
    control: control,
  });
  const id = useId();
  const {t} = useTranslation();

  const textareaElement = (
    <InputGroup>
      <InputGroupTextarea
        {...field}
        id={id}
        placeholder={placeholder}
        rows={6}
        className="min-h-24 resize-none"
        aria-invalid={fieldState.invalid}
      />
      {limit !== undefined && (<InputGroupAddon align="block-end">
        <InputGroupText className="tabular-nums">
          {t('form.textarea.characterCount', {count: field.value?.length ?? 0, limit})}
        </InputGroupText>
      </InputGroupAddon>)}
    </InputGroup>
  );

  return (
    <Field data-invalid={fieldState.invalid} orientation={direction} className={className}>
      <FieldLabel htmlFor={id} className={direction === 'horizontal' ? 'font-semibold basis-1/2' : ''}>
        {label}
      </FieldLabel>
      {direction === 'horizontal' ? (
        <div className="flex flex-col basis-1/2">
          {textareaElement}
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </div>
      ) : (
        <>
          {textareaElement}
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </>
      )}
    </Field>
  );
}
