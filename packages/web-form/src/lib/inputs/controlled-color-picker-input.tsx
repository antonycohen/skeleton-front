import { useState, useId, useRef, useCallback, KeyboardEvent } from 'react';
import {
  Field,
  FieldError,
  FieldLabel,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerEyeDropper,
  ColorPickerFormat,
} from '@skeleton/web-components';
import { X, Plus } from 'lucide-react';
import {
  FieldPath,
  FieldPathValue,
  FieldValues,
  useController,
  useFormContext,
} from 'react-hook-form';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import Color from 'color';

type ControlledColorPickerInputProps<TForm extends FieldValues> = {
  name: FieldPath<TForm>;
  label?: string;
  direction?: 'horizontal' | 'vertical';
  className?: string;
};

export function ControlledColorPickerInput<TForm extends FieldValues>(
  props: ControlledColorPickerInputProps<TForm>,
) {
  const { name, label, direction = 'vertical', className } = props;
  const { t } = useTranslation();

  const form = useFormContext();
  const { control } = form;
  const { field, fieldState } = useController({
    name,
    control,
  });

  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pendingColor, setPendingColor] = useState<string>('#000000');

  const currentColor = (field.value as string | null) ?? null;

  const handleSetColor = useCallback(
    (hexColor: string) => {
      const normalizedHex = hexColor.toUpperCase();
      field.onChange(normalizedHex as FieldPathValue<TForm, FieldPath<TForm>>);
      setIsPickerOpen(false);
    },
    [field],
  );

  const handleClear = useCallback(() => {
    field.onChange(null as FieldPathValue<TForm, FieldPath<TForm>>);
    setTimeout(() => triggerRef.current?.focus(), 0);
  }, [field]);

  const handleColorChange = useCallback(
    (rgba: Parameters<typeof Color.rgb>[0]) => {
      const color = Color.rgb(rgba);
      setPendingColor(color.hex());
    },
    [],
  );

  const handleConfirmColor = useCallback(() => {
    handleSetColor(pendingColor);
  }, [pendingColor, handleSetColor]);

  // Handle keyboard in color picker
  const handlePickerKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirmColor();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsPickerOpen(false);
        triggerRef.current?.focus();
      }
    },
    [handleConfirmColor],
  );

  // Handle keyboard on trigger/chip
  const handleTriggerKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (currentColor) {
          e.preventDefault();
          handleClear();
        }
      }
    },
    [currentColor, handleClear],
  );

  // Seed the picker's working colour from the committed one whenever the picker
  // opens. Adjusting state during render rather than in an effect is React's own
  // answer here — it re-renders before committing, instead of cascading a second
  // pass. `seeded` mirrors what the effect's dependency array used to watch, so
  // an external change to the field while the picker is open still re-seeds.
  const [seeded, setSeeded] = useState({
    isPickerOpen,
    currentColor,
  });
  if (seeded.isPickerOpen !== isPickerOpen || seeded.currentColor !== currentColor) {
    setSeeded({ isPickerOpen, currentColor });
    if (isPickerOpen) {
      setPendingColor(currentColor ?? '#000000');
    }
  }

  const colorPickerContent = (
    <>
      <div
        ref={containerRef}
        className="flex flex-wrap gap-1 items-center"
      >
        <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
          <PopoverTrigger asChild>
            {currentColor ? (
              <button
                ref={triggerRef}
                type="button"
                onKeyDown={handleTriggerKeyDown}
                className={cn(
                  'flex items-center gap-1 h-8 px-2 bg-background border rounded-full text-sm transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                  'border-border hover:bg-accent/50',
                )}
                aria-label={t('form.colorPicker.tokenLabel', { color: currentColor })}
              >
                <span
                  className="size-4 rounded-full shrink-0"
                  style={{ backgroundColor: currentColor }}
                />
                <span className="px-1 text-sm">{currentColor}</span>
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClear();
                    }
                  }}
                  className="flex items-center justify-center size-4 rounded-full bg-input hover:bg-muted-foreground/30"
                  aria-label={t('form.colorPicker.clear')}
                >
                  <X className="size-3 text-muted-foreground" />
                </span>
              </button>
            ) : (
              <Button
                ref={triggerRef}
                type="button"
                variant="secondary"
                size="sm"
                className="h-9 gap-2 rounded-md"
              >
                <Plus className="size-4" />
                {t('form.colorPicker.select')}
              </Button>
            )}
          </PopoverTrigger>
          <PopoverContent
            className="w-64 p-4"
            align="start"
            onKeyDown={handlePickerKeyDown}
          >
            <ColorPicker
              defaultValue={currentColor ?? '#000000'}
              onChange={handleColorChange}
              className="gap-3"
            >
              <ColorPickerSelection className="h-32 rounded-md" />
              <ColorPickerHue />
              <div className="flex gap-2 items-center">
                <ColorPickerEyeDropper />
                <ColorPickerFormat className="flex-1" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsPickerOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="flex-1"
                  onClick={handleConfirmColor}
                >
                  {currentColor ? t('form.colorPicker.update') : t('form.colorPicker.confirm')}
                </Button>
              </div>
            </ColorPicker>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );

  return (
    <Field data-invalid={fieldState.invalid} orientation={direction} className={className}>
      {label && (
        <FieldLabel
          htmlFor={id}
          className={direction === 'horizontal' ? 'font-medium basis-1/2' : ''}
        >
          {label}
        </FieldLabel>
      )}
      {direction === 'horizontal' ? (
        <div className="flex flex-col basis-1/2">
          {colorPickerContent}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </div>
      ) : (
        <>
          {colorPickerContent}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </>
      )}
    </Field>
  );
}
