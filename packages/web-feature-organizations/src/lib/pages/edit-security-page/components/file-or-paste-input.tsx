import { ChangeEvent, useRef, useState } from 'react';
import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Textarea,
} from '@skeleton/web-components';
import { UploadIcon } from 'lucide-react';
import { useTranslation } from '@skeleton/core-translations';

export type FileOrPasteInputProps = {
  id: string;
  label: string;
  description?: string;
  placeholder?: string;
  /** What the file picker offers, e.g. `.pem,.cer,.crt`. */
  accept: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** The API's own cap on the field: a longer file is refused here rather than by a 413. */
  maxLength: number;
  /** How a picked file's bytes become the text that is sent (PEM wrapping, plain decoding…). */
  readBytes: (bytes: Uint8Array) => string;
  error?: string;
  disabled?: boolean;
};

/**
 * A document the admin either pastes or picks a file for. The workspace has no generic file input
 * (only the image picker and the CSV uploader), and both of these documents are small text the API
 * takes as a string — so the file is read here and its text put in the textarea, where the admin
 * sees what will be sent.
 */
export function FileOrPasteInput({
  id,
  label,
  description,
  placeholder,
  accept,
  value,
  onChange,
  onBlur,
  maxLength,
  readBytes,
  error,
  disabled,
}: FileOrPasteInputProps) {
  const { t } = useTranslation();
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // The picker keeps its value, so picking the same file twice must fire again.
    event.target.value = '';
    if (!file) return;

    setFileError(null);
    try {
      const text = readBytes(new Uint8Array(await file.arrayBuffer()));
      if (text.length > maxLength) {
        setFileError(t('security.fileInput.tooLarge', { name: file.name }));
        return;
      }
      setFileName(file.name);
      onChange(text);
    } catch {
      setFileError(t('security.fileInput.unreadable', { name: file.name }));
    }
  };

  return (
    <Field data-invalid={!!error || !!fileError}>
      <div className="flex items-center justify-between gap-4">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInput.current?.click()}
          disabled={disabled}
        >
          <UploadIcon className="size-4" />
          {t('security.fileInput.choose')}
        </Button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFile}
        disabled={disabled}
      />
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        spellCheck={false}
        rows={6}
        className="font-mono text-xs"
        aria-invalid={!!error}
        disabled={disabled}
      />
      {fileName && !fileError && (
        <FieldDescription>
          {t('security.fileInput.readFrom', { name: fileName })}
        </FieldDescription>
      )}
      {description && <FieldDescription>{description}</FieldDescription>}
      {(error || fileError) && (
        <FieldError errors={[{ message: fileError ?? error }]} />
      )}
    </Field>
  );
}
