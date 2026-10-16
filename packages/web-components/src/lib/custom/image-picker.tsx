"use client";

import { useCallback, useRef } from "react";
import { Image as ImageIcon, Trash2 } from "lucide-react";
import { cn } from "@skeleton/core-utils";
import { Button } from "../ui/button";
import { useTranslation } from "@skeleton/core-translations";
import type { Image } from "@skeleton/core-api-models";

export type ImagePickerProps = {
  value?: Image | null;
  onChange?: (value: Image | null) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
  accept?: string;
};

function getDisplayUrl(image: Image | null | undefined): string | null {
  if (!image) return null;
  return image.base64 || image.url || null;
}

export function ImagePicker({
  value,
  onChange,
  disabled,
  className,
  id,
  "aria-invalid": ariaInvalid,
  accept = "image/*",
}: ImagePickerProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const displayUrl = getDisplayUrl(value);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const newImage: Image = {
          id: null,
          base64,
          url: null,
          originalFilename: file.name,
          resizedImages: null,
        };
        onChange?.(newImage);
      };
      reader.readAsDataURL(file);

      // Reset input so same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [onChange]
  );

  const handleRemove = useCallback(() => {
    onChange?.(null);
  }, [onChange]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  return (
    <div
      id={id}
      aria-invalid={ariaInvalid}
      className={cn(
        "flex flex-col gap-2",
        disabled && "pointer-events-none cursor-not-allowed opacity-50",
        className
      )}
    >
      {/* Image preview area */}
      <div
        className={cn(
          "bg-muted relative flex size-24 items-center justify-center overflow-hidden rounded-md border",
          ariaInvalid && "border-destructive"
        )}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={value?.originalFilename || t('components.imagePicker.selectedImage')}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageIcon className="text-muted-foreground size-6" />
        )}
      </div>

      {/* File input row */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
        />
        <div
          className={cn(
            "border-input bg-background flex h-9 flex-1 items-center overflow-hidden rounded-md border text-sm shadow-xs",
            "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
            ariaInvalid && "border-destructive ring-destructive/20"
          )}
        >
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className="bg-muted text-foreground h-full shrink-0 border-r px-3 text-sm font-medium hover:bg-muted/80"
          >
            {t('components.imagePicker.chooseFile')}
          </button>
          <span className="text-muted-foreground truncate px-3 text-sm">
            {value?.originalFilename || t('components.imagePicker.noFile')}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleRemove}
          disabled={disabled || !value}
          className="size-9 shrink-0"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
