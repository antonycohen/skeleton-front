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

type ControlledColorTokenInputProps<TForm extends FieldValues> = {
  name: FieldPath<TForm>;
  label?: string;
  direction?: 'horizontal' | 'vertical';
  className?: string;
};

export function ControlledColorTokenInput<TForm extends FieldValues>(
  props: ControlledColorTokenInputProps<TForm>,
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
  const tokenRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pendingColor, setPendingColor] = useState<string>('#000000');

  const tokens = (field.value as string[] | null) ?? [];

  const handleAdd = useCallback(
    (hexColor: string) => {
      const normalizedHex = hexColor.toUpperCase();
      if (!tokens.includes(normalizedHex)) {
        const updated = [...tokens, normalizedHex];
        field.onChange(updated as FieldPathValue<TForm, FieldPath<TForm>>);
      }
      setIsPickerOpen(false);
      setSelectedTokenIndex(null);
    },
    [tokens, field],
  );

  const focusToken = useCallback((index: number) => {
    setSelectedTokenIndex(index);
    const tokenEl = tokenRefs.current.get(index);
    tokenEl?.focus();
  }, []);

  const handleRemove = useCallback(
    (index: number) => {
      const updated = tokens.filter((_, i) => i !== index);
      field.onChange(
        (updated.length > 0 ? updated : null) as FieldPathValue<TForm, FieldPath<TForm>>,
      );
      setSelectedTokenIndex(null);
      // Focus appropriate element after deletion
      if (tokens.length > 1 && index > 0) {
        setTimeout(() => focusToken(index - 1), 0);
      } else if (tokens.length > 1) {
        setTimeout(() => focusToken(0), 0);
      } else {
        setTimeout(() => addButtonRef.current?.focus(), 0);
      }
    },
    [tokens, field, focusToken],
  );

  const focusAddButton = useCallback(() => {
    setSelectedTokenIndex(null);
    addButtonRef.current?.focus();
  }, []);

  const handleTokenKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      switch (e.key) {
        case 'Backspace':
        case 'Delete':
          e.preventDefault();
          handleRemove(index);
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (index > 0) {
            focusToken(index - 1);
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (index < tokens.length - 1) {
            focusToken(index + 1);
          } else {
            focusAddButton();
          }
          break;

        case 'Home':
          e.preventDefault();
          if (tokens.length > 0) {
            focusToken(0);
          }
          break;

        case 'End':
          e.preventDefault();
          focusAddButton();
          break;

        case 'Escape':
          e.preventDefault();
          focusAddButton();
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          handleRemove(index);
          break;
      }
    },
    [tokens, handleRemove, focusToken, focusAddButton],
  );

  const handleAddButtonKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (tokens.length > 0) {
            focusToken(tokens.length - 1);
          }
          break;

        case 'Home':
          e.preventDefault();
          if (tokens.length > 0) {
            focusToken(0);
          }
          break;
      }
    },
    [tokens, focusToken],
  );

  const handleColorChange = useCallback(
    (rgba: Parameters<typeof Color.rgb>[0]) => {
      const color = Color.rgb(rgba);
      setPendingColor(color.hex());
    },
    [],
  );

  const handleConfirmColor = useCallback(() => {
    handleAdd(pendingColor);
  }, [pendingColor, handleAdd]);

  // Handle keyboard in color picker
  const handlePickerKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirmColor();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsPickerOpen(false);
        addButtonRef.current?.focus();
      }
    },
    [handleConfirmColor],
  );

  // Reset the picker's working colour each time it opens. Adjusting state during
  // render rather than in an effect is React's own answer here — it re-renders
  // before committing, instead of cascading a second pass.
  const [wasPickerOpen, setWasPickerOpen] = useState(isPickerOpen);
  if (wasPickerOpen !== isPickerOpen) {
    setWasPickerOpen(isPickerOpen);
    if (isPickerOpen) {
      setPendingColor('#000000');
    }
  }

  const colorTokenContent = (
    <>
      <div
        ref={containerRef}
        className="flex flex-wrap gap-1 items-center"
      >
        {tokens.map((hexColor, index) => (
          <button
            key={`${hexColor}-${index}`}
            ref={(el) => {
              if (el) {
                tokenRefs.current.set(index, el);
              } else {
                tokenRefs.current.delete(index);
              }
            }}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              focusToken(index);
            }}
            onKeyDown={(e) => handleTokenKeyDown(e, index)}
            onFocus={() => setSelectedTokenIndex(index)}
            className={cn(
              'flex items-center gap-1 h-8 px-2 bg-background border rounded-full text-sm transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
              selectedTokenIndex === index
                ? 'border-ring bg-accent'
                : 'border-border hover:bg-accent/50',
            )}
            aria-label={t('form.colorToken.tokenLabel', { color: hexColor })}
          >
            <span
              className="size-4 rounded-full shrink-0"
              style={{ backgroundColor: hexColor }}
            />
            <span className="px-1 text-sm">{hexColor}</span>
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(index);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove(index);
                }
              }}
              className="flex items-center justify-center size-4 rounded-full bg-input hover:bg-muted-foreground/30"
              aria-label={t('form.token.remove')}
            >
              <X className="size-3 text-muted-foreground" />
            </span>
          </button>
        ))}

        <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={addButtonRef}
              type="button"
              variant="secondary"
              size="sm"
              className="h-9 gap-2 rounded-md"
              onKeyDown={handleAddButtonKeyDown}
            >
              <Plus className="size-4" />
              {t('form.colorToken.add')}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-64 p-4"
            align="start"
            onKeyDown={handlePickerKeyDown}
          >
            <ColorPicker
              defaultValue="#000000"
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
                  {t('form.colorToken.addColor')}
                </Button>
              </div>
            </ColorPicker>
          </PopoverContent>
        </Popover>

        {tokens.length > 0 && (
          <span id={`${id}-tokens-hint`} className="sr-only">
            {t('form.colorToken.hint', { count: tokens.length })}
          </span>
        )}
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
          {colorTokenContent}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </div>
      ) : (
        <>
          {colorTokenContent}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </>
      )}
    </Field>
  );
}
