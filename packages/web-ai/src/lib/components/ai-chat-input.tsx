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

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const canSubmit = value.trim().length > 0 && !disabled && !isLoading;
  const isCompact = style === 'compact';

  return (
    <div
      data-slot="ai-chat-input"
      className={cn(
        'flex flex-col border shadow-sm',
        isCompact
          ? 'rounded-md border-input bg-background shadow-xs'
          : 'rounded-3xl border-border bg-background shadow-md',
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
      {!hideDefaultInput && <div className={cn(!isCompact && 'p-1', disabled && 'opacity-40')}>
        <div
          className={cn(
            'flex cursor-text flex-col overflow-hidden',
            !isCompact && 'rounded-2xl',
          )}
          onClick={() => textareaRef.current?.focus()}
        >
          {/* Textarea */}
          <div className={cn(
            isCompact ? 'flex min-h-[64px] items-center p-3' : 'p-4',
          )}>
            <textarea
              ref={textareaRef}
              className={cn(
                'w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none',
                isCompact
                  ? 'max-h-[200px] min-h-[24px] text-sm leading-5'
                  : 'max-h-[200px] min-h-[24px] text-base leading-6',
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
          <div className={cn(
            'flex items-center justify-end',
            isCompact ? 'px-3 pb-3 pt-1.5' : 'px-4 py-4',
          )}>
            <SubmitButton canSubmit={canSubmit} onSubmit={onSubmit} compact={isCompact} />
          </div>
        </div>
      </div>}
    </div>
  );
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
        'flex items-center justify-center rounded-md transition-opacity',
        compact
          ? 'size-7 bg-primary text-primary-foreground shadow-xs'
          : 'size-8 bg-primary text-primary-foreground',
        !canSubmit && 'opacity-50'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSubmit();
      }}
      disabled={!canSubmit}
    >
      <ArrowUp className="size-4" />
    </button>
  );
}
