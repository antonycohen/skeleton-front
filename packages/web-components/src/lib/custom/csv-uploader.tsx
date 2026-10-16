import { useCallback, useState } from 'react';
import { UploadIcon, LoaderCircleIcon } from 'lucide-react';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { Button } from '../ui/button';

export type CsvUploaderProps = {
  onFileSelect?: (file: File) => void;
  accept?: string;
  maxSizeBytes?: number;
  helperText?: string;
  className?: string;
  disabled?: boolean;
  isAnalyzing?: boolean;
  analyzingTitle?: string;
  analyzingDescription?: string;
};

export function CsvUploader({
  onFileSelect,
  accept = '.csv,.xlsx',
  maxSizeBytes = 10 * 1024 * 1024, // 10MB default
  helperText: helperTextProp,
  className,
  isAnalyzing = false,
  analyzingTitle: analyzingTitleProp,
  analyzingDescription: analyzingDescriptionProp,
  disabled = false,
}: CsvUploaderProps) {
  const { t } = useTranslation();
  const helperText = helperTextProp ?? t('components.csvUploader.helper');
  const analyzingTitle = analyzingTitleProp ?? t('components.csvUploader.analyzingTitle');
  const analyzingDescription = analyzingDescriptionProp ?? t('components.csvUploader.analyzingDescription');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      // Validate file type
      const validTypes = accept.split(',').map((ext) => ext.trim());
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (!validTypes.some((type) => fileExtension === type || file.type.includes(type.replace('.', '')))) {
        setError(t('components.csvUploader.invalidType', { helper: helperText }));
        return;
      }

      // Validate file size
      if (file.size > maxSizeBytes) {
        setError(t('components.csvUploader.tooLarge', { size: Math.round(maxSizeBytes / 1024 / 1024) }));
        return;
      }

      setSelectedFile(file);
      onFileSelect?.(file);
    },
    [accept, maxSizeBytes, helperText, onFileSelect, t],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      document.getElementById('csv-file-input')?.click();
    }
  }, [disabled]);

  // Analyzing state
  if (isAnalyzing) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-6 p-6 rounded-lg transition-colors',
          className,
        )}
      >
        <div className="bg-muted rounded-lg p-2 flex items-center justify-center size-10">
          <LoaderCircleIcon className="size-6 text-foreground animate-spin" />
        </div>

        <div className="flex flex-col gap-2 items-center text-center w-full">
          <p className="text-lg font-medium text-foreground tracking-tight">
            {analyzingTitle}
          </p>
          <p className="text-sm text-muted-foreground">
            {analyzingDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-6 p-6 border border-dashed rounded-lg transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-border',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        id="csv-file-input"
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div className="flex items-center justify-center size-12 bg-card rounded-md shadow-xs">
        <UploadIcon className="size-6 text-foreground" />
      </div>

      <div className="flex flex-col gap-2 items-center text-center">
        <p className="text-xl font-semibold text-foreground">
          {selectedFile ? selectedFile.name : t('components.csvUploader.dropTitle')}
        </p>
        {selectedFile ? (
          <p className="text-sm text-muted-foreground">
            {`${(selectedFile.size / 1024).toFixed(1)} KB`}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t('components.csvUploader.dropDescription')}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-1 items-center">
        <Button type="button" variant="outline" onClick={handleClick} disabled={disabled}>
          {selectedFile ? t('components.csvUploader.changeFile') : t('components.csvUploader.selectFile')}
        </Button>
        <p className="text-sm text-muted-foreground text-center">{helperText}</p>
      </div>
    </div>
  );
}
