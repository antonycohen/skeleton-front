import {KeyboardEvent, useRef, useState} from 'react';
import {cn} from '@skeleton/core-utils';
import {Input} from '../ui/input';

export type NavbarTitleInputProps = {
  value: string;
  /**
   * Called with the trimmed new name on blur / Enter when it differs from
   * `value`. Omit (or pass `readOnly`) for a non-editable title.
   */
  onCommit?: (next: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
};

/**
 * The navbar's page title as a ghost input (Figma "Input / Ghost"): reads as
 * plain text at rest, becomes a field on hover/focus. Enter commits, Escape
 * reverts, an empty or unchanged draft is dropped.
 */
export function NavbarTitleInput({
  value,
  onCommit,
  readOnly = false,
  placeholder,
  className,
  'aria-label': ariaLabel,
}: NavbarTitleInputProps) {
  const isEditable = !readOnly && !!onCommit;
  const [draft, setDraft] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  const cancelledRef = useRef(false);

  // Follow the source of truth while the field is not being edited (a rename
  // from elsewhere, the query landing after a commit).
  if (value !== prevValue) {
    setPrevValue(value);
    if (!isEditing) setDraft(value);
  }

  const handleBlur = () => {
    setIsEditing(false);
    if (cancelledRef.current) {
      cancelledRef.current = false;
      setDraft(value);
      return;
    }
    const next = draft.trim();
    if (next && next !== value) {
      onCommit?.(next);
    } else {
      setDraft(value);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    } else if (event.key === 'Escape') {
      cancelledRef.current = true;
      setDraft(value);
      event.currentTarget.blur();
    }
  };

  return (
    <Input
      data-slot="navbar-title-input"
      aria-label={ariaLabel}
      value={draft}
      placeholder={placeholder}
      readOnly={!isEditable}
      tabIndex={isEditable ? undefined : -1}
      title={isEditable ? undefined : value}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={() => isEditable && setIsEditing(true)}
      onBlur={isEditable ? handleBlur : undefined}
      onKeyDown={isEditable ? handleKeyDown : undefined}
      className={cn(
        'h-9 w-40 min-w-0 truncate rounded-md border-0 bg-transparent px-3 py-1 text-sm text-foreground shadow-none',
        isEditable
          ? 'hover:bg-muted focus-visible:border-0 focus-visible:bg-background focus-visible:ring-[3px] focus-visible:ring-ring/50'
          : 'cursor-default focus-visible:ring-0',
        className,
      )}
    />
  );
}
