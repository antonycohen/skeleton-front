'use client';

import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import {cn} from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import {ArrowUp} from 'lucide-react';
import type {AiChatInputPlugin, ChatMessage} from '../types/plugin';
import type {ParsedInstruction} from '../instructions/instruction-types';
import {InputPluginRenderer} from './input-plugin-renderer';

// ============================================================================
// Types
// ============================================================================

export interface SuggestionChip {
  id: string;
  label: string;
  value: string;
}

export interface AiChatInputProps {
  /** Additional CSS classes */
  className?: string;
  /** Visual style variant */
  style?: 'compact' | 'large';
  /** Current input value */
  value: string;
  /** Callback when value changes */
  onValueChange: (value: string) => void;
  /** Callback when user submits */
  onSubmit: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Whether chat is loading/streaming */
  isLoading?: boolean;
  /** Input plugins for rendering in input area */
  inputPlugins?: AiChatInputPlugin[];
  /** Current chat messages (for input plugins) */
  messages?: ChatMessage[];
  /** Send a specific message content directly (for input plugins) */
  sendMessageContent?: (content: string) => void;
  /** Instructions from the last assistant message */
  instructions?: ParsedInstruction[];
}

// ============================================================================
// Component
// ============================================================================

/**
 * Chat input component with auto-resizing textarea and suggestion chips.
 */
export function AiChatInput({
  className,
  style = 'large',
  value,
  onValueChange,
  onSubmit,
  placeholder,
  disabled,
  isLoading,
  inputPlugins = [],
  messages = [],
  sendMessageContent,
  instructions = [],
}: AiChatInputProps) {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [hideDefaultInput, setHideDefaultInput] = useState(false);

  // Auto-resize textarea based on content (its placeholder's too, while empty)
  useEffect(() => {
    resizeTextarea(textareaRef.current);
  }, [value]);

  // And again whenever its width changes: mounted in a column still opening, its text (or placeholder)
  // wraps over many lines, and the field would keep that height once the column is open.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || typeof ResizeObserver === 'undefined') return;
    let width = textarea.getBoundingClientRect().width;
    const observer = new ResizeObserver(() => {
      const next = textarea.getBoundingClientRect().width;
      if (Math.abs(next - width) < 1) return;
      width = next;
      resizeTextarea(textarea);
    });
    observer.observe(textarea);
    return () => observer.disconnect();
  }, [hideDefaultInput]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const canSubmit = value.trim().length > 0 && !disabled && !isLoading;
  const isCompact = style === 'compact';

  return (
    <div data-slot="ai-chat-composer" className="flex flex-col">
      <div
        data-slot="ai-chat-input"
        className={cn(
          'flex flex-col border shadow-sm',
          // Raised surface (card): an input stands one level above the chat it sits in.
          isCompact
            ? 'rounded-2xl border-input bg-card shadow-xs dark:bg-accent'
            : 'rounded-2xl border-border bg-card shadow-md',
          className
        )}
      >
        {/* Input plugin UI (e.g., suggestion chips from AI messages) */}
        {inputPlugins.length > 0 && sendMessageContent && (
          <InputPluginRenderer
            plugins={inputPlugins}
            messages={messages}
            isStreaming={isLoading ?? false}
            setInputValue={onValueChange}
            sendMessage={onSubmit}
            sendMessageContent={sendMessageContent}
            instructions={instructions}
            onActivePluginChange={setHideDefaultInput}
          />
        )}

        {/* Default input frame - hidden when active plugin replaces it */}
        {/* Disabled: the whole field fades (not just the caret/button) so the
            hold reads at a glance. */}
        {!hideDefaultInput && (
          <div className={cn(!isCompact && 'p-1', disabled && 'opacity-40')}>
            <div
              className={cn(
                'flex cursor-text flex-col overflow-hidden',
                // Concentric with the 16px frame, 4px inside it.
                !isCompact && 'rounded-[12px]'
              )}
              onClick={() => textareaRef.current?.focus()}
            >
              {/* Textarea */}
              <div
                className={cn(
                  // As tall as its text and top padding: no minimum of its own; the actions row spaces it below.
                  isCompact ? 'flex items-center px-3 pt-3' : 'p-4'
                )}
              >
                <textarea
                  ref={textareaRef}
                  className={cn(
                    'w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none',
                    isCompact ? 'max-h-[200px] min-h-[24px] body' : 'max-h-[200px] min-h-[24px] body-lg'
                  )}
                  placeholder={placeholder ?? t('ai.chat.replyPlaceholder')}
                  value={value}
                  onChange={(e) => onValueChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={disabled}
                  rows={1}
                />
              </div>

              {/* Actions row */}
              <div
                className={cn(
                  'flex items-center justify-end gap-3',
                  isCompact ? 'px-3 pb-3 pt-1.5' : 'px-4 py-4'
                )}
              >
                <SubmitButton canSubmit={canSubmit} onSubmit={onSubmit} compact={isCompact} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** As tall as its text, up to 200px (then it scrolls). */
function resizeTextarea(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return;
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
}

// ============================================================================
// Sub-components
// ============================================================================

interface SubmitButtonProps {
  canSubmit: boolean;
  onSubmit: () => void;
  compact?: boolean;
}

function SubmitButton({ canSubmit, onSubmit, compact }: SubmitButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        // 32px in both layouts: the send button stays an easy target, even beside the panel.
        'flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity',
        compact && 'shadow-xs',
        !canSubmit && 'opacity-50'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSubmit();
      }}
      disabled={!canSubmit}
    >
      {/* Bolder than the app's 1.25px icons, as the main action: 2.25 in Lucide's 24px grid, 1.5px at 16px. */}
      <ArrowUp className="size-4" strokeWidth={2.25} />
    </button>
  );
}
