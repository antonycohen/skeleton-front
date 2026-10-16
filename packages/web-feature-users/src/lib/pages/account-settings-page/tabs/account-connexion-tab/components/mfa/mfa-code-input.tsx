import { Field, FieldDescription, FieldError, FieldLabel, Input } from '@skeleton/web-components';
import { FieldPath, FieldValues, useController, useFormContext } from 'react-hook-form';
import { useId } from 'react';
import { useTranslation } from '@skeleton/core-translations';

type MfaCodeInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  description?: string;
  placeholder?: string;
  /** `totp`: 6 digits from the app. `any`: an authenticator or a recovery code (`xxxxx-xxxxx`). */
  kind?: 'totp' | 'any';
  autoFocus?: boolean;
  className?: string;
};

/**
 * A verification-code field. The generic text input has no `inputMode` / `autoComplete`
 * knobs, and browsers only offer to paste an SMS/app code when they see `one-time-code`.
 */
export function MfaCodeInput<T extends FieldValues>(props: MfaCodeInputProps<T>) {
  const { name, label, description, placeholder, kind = 'totp', autoFocus, className } = props;
  const { control } = useFormContext<T>();
  const { field, fieldState } = useController({ name, control });
  const id = useId();
  const { t } = useTranslation();

  return (
    <Field data-invalid={fieldState.invalid} className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        {...field}
        value={field.value ?? ''}
        id={id}
        type="text"
        maxLength={32}
        inputMode={kind === 'totp' ? 'numeric' : 'text'}
        autoComplete="one-time-code"
        autoCapitalize="off"
        spellCheck={false}
        autoFocus={autoFocus}
        placeholder={
          placeholder ??
          (kind === 'totp' ? '123 456' : t('account.mfa.codeInput.anyPlaceholder'))
        }
        aria-invalid={fieldState.invalid}
        className="font-mono tracking-widest"
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
