import { useId } from 'react';
import {
  Field,
  FieldError,
  FieldLabel,
  LanguageInput,
  type LanguageOption,
} from '@skeleton/web-components';
import {
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from 'react-hook-form';

export type { LanguageOption };

type ControlledLanguageInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  languages: LanguageOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  direction?: 'horizontal' | 'vertical';
  className?: string;
};

export function ControlledLanguageInput<T extends FieldValues>(
  props: ControlledLanguageInputProps<T>,
) {
  const {
    name,
    label,
    languages,
    placeholder,
    searchPlaceholder,
    emptyMessage,
    direction = 'vertical',
    className,
  } = props;

  const form = useFormContext();
  const { control } = form;
  const { field, fieldState } = useController({
    name,
    control: control,
  });
  const id = useId();

  const languageInputElement = (
    <LanguageInput
      id={id}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      languages={languages}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
      aria-invalid={fieldState.invalid}
      className={direction === 'vertical' ? 'w-full' : ''}
    />
  );

  return (
    <Field data-invalid={fieldState.invalid} orientation={direction} className={className}>
      <FieldLabel htmlFor={id} className={direction === 'horizontal' ? 'font-semibold basis-1/2' : ''}>
        {label}
      </FieldLabel>
      {direction === 'horizontal' ? (
        <div className="flex flex-col basis-1/2">
          {languageInputElement}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </div>
      ) : (
        <>
          {languageInputElement}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </>
      )}
    </Field>
  );
}
