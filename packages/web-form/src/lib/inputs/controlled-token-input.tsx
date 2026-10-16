import { useState, useId, useRef, useCallback, ReactNode, KeyboardEvent, useEffect } from 'react';
import {
  Field,
  FieldError,
  FieldLabel,
  Input,
  Popover,
  PopoverContent,
  PopoverAnchor,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@skeleton/web-components';
import { X } from 'lucide-react';
import {
  FieldPath,
  FieldPathValue,
  FieldValues,
  useController,
  useFormContext,
} from 'react-hook-form';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';

export type TokenOption<T = string> = {
  value: T;
  label: string;
};

type TokenSourceStatic<T = string> = {
  type: 'static';
  options: TokenOption<T>[];
};

type TokenSourceQuery<T = string> = {
  type: 'query';
  options: TokenOption<T>[];
  isLoading?: boolean;
  onSearch?: (query: string) => void;
};

export type TokenSource<T = string> = TokenSourceStatic<T> | TokenSourceQuery<T>;

type ControlledTokenInputProps<TForm extends FieldValues, TValue = string> = {
  name: FieldPath<TForm>;
  label?: string;
  placeholder?: string;
  source?: TokenSource<TValue>;
  renderToken?: (value: TValue) => ReactNode;
  forceSelection?: boolean;
  direction?: 'horizontal' | 'vertical';
  className?: string;
  emptyMessage?: string;
};

export function ControlledTokenInput<TForm extends FieldValues, TValue = string>(
  props: ControlledTokenInputProps<TForm, TValue>,
) {
  const {
    name,
    label,
    placeholder: placeholderProp,
    source,
    renderToken,
    forceSelection = false,
    direction = 'vertical',
    className,
    emptyMessage: emptyMessageProp,
  } = props;
  const { t } = useTranslation();
  const placeholder = placeholderProp ?? t('form.token.placeholder');
  const emptyMessage = emptyMessageProp ?? t('form.token.empty');

  const form = useFormContext();
  const { control } = form;
  const { field, fieldState } = useController({
    name,
    control,
  });

  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tokenRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  const [highlightedOptionIndex, setHighlightedOptionIndex] = useState(0);

  // Cleanup blur timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const tokens = (field.value as TValue[] | null) ?? [];

  const getDisplayValue = useCallback(
    (value: TValue): ReactNode => {
      if (renderToken) {
        return renderToken(value);
      }
      if (source) {
        const option = source.options.find((opt) => opt.value === value);
        return option?.label ?? String(value);
      }
      return String(value);
    },
    [renderToken, source],
  );

  const handleAdd = useCallback(
    (value: TValue) => {
      if (!tokens.includes(value)) {
        const updated = [...tokens, value];
        field.onChange(updated as FieldPathValue<TForm, FieldPath<TForm>>);
      }

      setInputValue('');
      setIsOpen(false);
      setSelectedTokenIndex(null);
    },
    [tokens, field],
  );

  const handleAddFromInput = useCallback(() => {
    if (!inputValue.trim()) return;
    if (forceSelection && source) {
      const matchingOption = source.options.find(
        (opt) => opt.label.toLowerCase() === inputValue.trim().toLowerCase(),
      );
      if (matchingOption) {
        handleAdd(matchingOption.value);
      }
      return;
    }
    handleAdd(inputValue.trim() as TValue);
  }, [inputValue, forceSelection, source, handleAdd]);

  const handleRemove = useCallback(
    (index: number) => {
      const updated = tokens.filter((_, i) => i !== index);
      field.onChange(
        (updated.length > 0 ? updated : null) as FieldPathValue<TForm, FieldPath<TForm>>,
      );
      setSelectedTokenIndex(null);
      // Focus input after removal
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [tokens, field],
  );

  const handleRemoveByValue = useCallback(
    (value: TValue) => {
      const index = tokens.indexOf(value);
      if (index !== -1) {
        handleRemove(index);
      }
    },
    [tokens, handleRemove],
  );

  const focusToken = useCallback((index: number) => {
    setSelectedTokenIndex(index);
    const tokenEl = tokenRefs.current.get(index);
    tokenEl?.focus();
  }, []);

  const focusInput = useCallback(() => {
    setSelectedTokenIndex(null);
    inputRef.current?.focus();
  }, []);

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const input = inputRef.current;
      const cursorAtStart = input?.selectionStart === 0 && input?.selectionEnd === 0;

      // Get current filtered options for keyboard navigation
      const currentFilteredOptions =
        source?.options.filter((opt) => {
          if (tokens.includes(opt.value)) return false;
          if (!inputValue.trim()) return true;
          return opt.label.toLowerCase().includes(inputValue.toLowerCase());
        }) ?? [];

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (source && isOpen && currentFilteredOptions.length > 0) {
            // Select the highlighted option
            const selectedOption = currentFilteredOptions[highlightedOptionIndex];
            if (selectedOption) {
              handleAdd(selectedOption.value);
              setHighlightedOptionIndex(0);
            }
            return;
          }
          handleAddFromInput();
          break;

        case 'Escape':
          setIsOpen(false);
          setSelectedTokenIndex(null);
          setHighlightedOptionIndex(0);
          break;

        case 'Backspace':
          if (cursorAtStart && tokens.length > 0 && !inputValue) {
            e.preventDefault();
            // Focus the last token
            focusToken(tokens.length - 1);
          }
          break;

        case 'ArrowLeft':
          if (cursorAtStart && tokens.length > 0) {
            e.preventDefault();
            focusToken(tokens.length - 1);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (source && isOpen && currentFilteredOptions.length > 0) {
            // Navigate down in the list
            setHighlightedOptionIndex((prev) =>
              prev < currentFilteredOptions.length - 1 ? prev + 1 : 0,
            );
          } else if (source && !isOpen) {
            setIsOpen(true);
            setHighlightedOptionIndex(0);
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (source && isOpen && currentFilteredOptions.length > 0) {
            // Navigate up in the list
            setHighlightedOptionIndex((prev) =>
              prev > 0 ? prev - 1 : currentFilteredOptions.length - 1,
            );
          }
          break;

        case 'Tab':
          // Add token before tabbing away (if not forceSelection or if there's a match)
          if (inputValue.trim() && !forceSelection) {
            handleAddFromInput();
          }
          break;
      }
    },
    [tokens, inputValue, source, isOpen, handleAddFromInput, handleAdd, focusToken, forceSelection, highlightedOptionIndex],
  );

  const handleTokenKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      switch (e.key) {
        case 'Backspace':
        case 'Delete':
          e.preventDefault();
          handleRemove(index);
          // Focus appropriate element after deletion
          if (tokens.length > 1) {
            if (index > 0) {
              setTimeout(() => focusToken(index - 1), 0);
            } else {
              setTimeout(() => focusToken(0), 0);
            }
          } else {
            setTimeout(() => focusInput(), 0);
          }
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
            focusInput();
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
          focusInput();
          break;

        case 'Escape':
          e.preventDefault();
          focusInput();
          break;

        case 'Enter':
        case ' ':
          // Space/Enter on token = remove it (like clicking X)
          e.preventDefault();
          handleRemove(index);
          break;
      }
    },
    [tokens, handleRemove, focusToken, focusInput],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      setSelectedTokenIndex(null);
      setHighlightedOptionIndex(0); // Reset to first option when typing
      if (source) {
        setIsOpen(true);
        if (source.type === 'query' && source.onSearch) {
          source.onSearch(value);
        }
      }
    },
    [source],
  );

  const handleInputFocus = useCallback(() => {
    // Cancel any pending blur timeout to prevent flash
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setSelectedTokenIndex(null);
    if (source) {
      setIsOpen(true);
    }
  }, [source]);

  const handleInputBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      // Clear any existing timeout
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }

      // Check if focus is moving to an element inside the container or popover
      const relatedTarget = e.relatedTarget as HTMLElement | null;
      const container = containerRef.current;
      const isInsideContainer = container?.contains(relatedTarget);
      // Check if focus is moving to popover content (data-radix-popper-content-wrapper)
      const isInsidePopover = relatedTarget?.closest('[data-radix-popper-content-wrapper]');

      if (isInsideContainer || isInsidePopover) {
        // Focus is staying within the component, don't close
        return;
      }

      blurTimeoutRef.current = setTimeout(() => {
        blurTimeoutRef.current = null;
        setIsOpen(false);
        if (!forceSelection && inputValue.trim()) {
          handleAddFromInput();
        } else if (forceSelection) {
          setInputValue('');
        }
      }, 100);
    },
    [forceSelection, inputValue, handleAddFromInput],
  );

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    // Only focus input if clicking on the container itself, not on tokens
    if (e.target === e.currentTarget) {
      inputRef.current?.focus();
    }
  }, []);

  const filteredOptions =
    source?.options.filter((opt) => {
      if (tokens.includes(opt.value)) return false;
      if (!inputValue.trim()) return true;
      return opt.label.toLowerCase().includes(inputValue.toLowerCase());
    }) ?? [];

  const containerContent = (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-wrap gap-1 items-center p-3 border rounded-md min-h-[44px] bg-background cursor-text',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        fieldState.invalid && 'border-destructive',
      )}
      onClick={handleContainerClick}
    >
      {tokens.map((token, index) => (
        <button
          key={index}
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
            'flex items-center gap-1 h-8 px-2 pr-1 bg-background border rounded-full text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            selectedTokenIndex === index
              ? 'border-ring bg-accent'
              : 'border-border hover:bg-accent/50',
          )}
          aria-label={t('form.token.tokenLabel', { value: getDisplayValue(token) })}
        >
          <span className="px-1">{getDisplayValue(token)}</span>
          <span
            role="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveByValue(token);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                handleRemoveByValue(token);
              }
            }}
            className="flex items-center justify-center size-4 rounded-full bg-input hover:bg-muted-foreground/30"
            aria-label={t('form.token.remove')}
          >
            <X className="size-3 text-muted-foreground" />
          </span>
        </button>
      ))}
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={tokens.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] border-0 shadow-none focus-visible:ring-0 p-0 px-1 h-8"
        aria-describedby={tokens.length > 0 ? `${id}-tokens-hint` : undefined}
      />
      {tokens.length > 0 && (
        <span id={`${id}-tokens-hint`} className="sr-only">
          {t('form.token.hint', { count: tokens.length })}
        </span>
      )}
    </div>
  );

  const handlePopoverOpenChange = useCallback(
    (open: boolean) => {
      // Only allow closing via our controlled handlers, not via Popover's internal logic
      if (!open) {
        // Popover wants to close - check if focus is still in our component
        const activeElement = document.activeElement as HTMLElement | null;
        const container = containerRef.current;
        const isInsideContainer = container?.contains(activeElement);
        const isInsidePopover = activeElement?.closest('[data-radix-popper-content-wrapper]');

        if (isInsideContainer || isInsidePopover) {
          // Focus is still inside, don't close
          return;
        }
      }
      setIsOpen(open);
    },
    [],
  );

  const fieldContent = source ? (
    <Popover open={isOpen} onOpenChange={handlePopoverOpenChange}>
      <PopoverAnchor asChild>{containerContent}</PopoverAnchor>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)]"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            <CommandEmpty>
              {source.type === 'query' && source.isLoading ? t('common.loading') : emptyMessage}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option, index) => (
                <CommandItem
                  key={String(option.value)}
                  value={option.label}
                  onSelect={() => handleAdd(option.value)}
                  data-highlighted={index === highlightedOptionIndex}
                  className={cn(
                    index === highlightedOptionIndex && 'bg-accent text-accent-foreground',
                  )}
                  onMouseEnter={() => setHighlightedOptionIndex(index)}
                >
                  {renderToken ? renderToken(option.value) : option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  ) : (
    containerContent
  );

  return (
    <Field data-invalid={fieldState.invalid} orientation={direction} className={className}>
      {label && (
        <FieldLabel
          htmlFor={id}
          className={direction === 'horizontal' ? 'font-semibold basis-1/2' : ''}
        >
          {label}
        </FieldLabel>
      )}
      {direction === 'horizontal' ? (
        <div className="flex flex-col basis-1/2">
          {fieldContent}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </div>
      ) : (
        <>
          {fieldContent}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </>
      )}
    </Field>
  );
}
