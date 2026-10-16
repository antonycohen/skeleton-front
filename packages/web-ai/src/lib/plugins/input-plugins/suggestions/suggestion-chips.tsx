'use client';

import {useEffect, useRef, useState} from 'react';
import {cn} from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import {ArrowRight, ArrowUp, Pencil, X} from 'lucide-react';
import type {AiChatInputPluginContext} from '../types';

interface SuggestionChipsProps {
  suggestions: string[];
  question?: string;
  ctx: AiChatInputPluginContext;
}

/**
 * Renders a suggestion group with numbered items and a free text input.
 * Matches the InputGroup/Suggestion design from Figma.
 */
export function SuggestionChips({suggestions, question, ctx}: SuggestionChipsProps) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);
  const [customText, setCustomText] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [customText]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitCustom();
    }
  };

  const handleSubmitCustom = () => {
    if (customText.trim() && !ctx.isStreaming) {
      ctx.sendMessageContent(customText.trim());
    }
  };

  const canSubmit = customText.trim().length > 0 && !ctx.isStreaming;

  // When dismissed, show a regular text input (matches large AiChatInput style)
  if (dismissed) {
    return (
      <div className="p-1">
        <div
          className="flex cursor-text flex-col rounded-2xl overflow-hidden"
          onClick={() => textareaRef.current?.focus()}
        >
          <div className="p-4">
            <textarea
              ref={textareaRef}
              className="w-full resize-none bg-transparent text-base leading-6 text-foreground placeholder:text-muted-foreground focus:outline-none max-h-[200px] min-h-[24px]"
              placeholder={t('ai.chat.replyPlaceholder')}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={ctx.isStreaming}
              rows={1}
            />
          </div>
          <div className="flex items-center justify-end px-4 py-4">
            <button
              type="button"
              className={cn(
                'flex items-center justify-center size-8 rounded-md bg-primary text-primary-foreground transition-opacity',
                !canSubmit && 'opacity-50'
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleSubmitCustom();
              }}
              disabled={!canSubmit}
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      {/* Header with question */}
      {question && (
        <div className="p-3">
          <div className="flex gap-6 items-start w-full">
            <div className="flex-1 min-w-0 py-1">
              <p className="text-base font-medium leading-[23px] text-foreground">
                {question}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="flex items-center justify-center size-8 shrink-0 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Suggestion items + input field */}
      <div className="flex flex-col overflow-hidden rounded-2xl">
        {suggestions.map((suggestion, idx) => {
          const isHovered = hoveredIndex === idx;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => ctx.sendMessageContent(suggestion)}
              disabled={ctx.isStreaming}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={cn(
                'relative flex items-center gap-3 px-3 text-left cursor-pointer transition-colors',
                isHovered && 'bg-muted',
                ctx.isStreaming && 'pointer-events-none opacity-50'
              )}
            >
              <div className="flex w-full gap-3 items-center py-3">
                {/* Number badge */}
                <div
                  className={cn(
                    'flex items-center justify-center size-8 shrink-0 rounded-full transition-colors',
                    isHovered ? 'bg-input' : 'bg-muted'
                  )}
                >
                  <span className="text-sm font-semibold leading-5 text-muted-foreground">
                    {idx + 1}
                  </span>
                </div>
                {/* Text */}
                <span className="flex-1 min-w-0 truncate text-sm leading-5 text-foreground">
                  {suggestion}
                </span>
                {/* Arrow right (visible on hover) */}
                <div
                  className={cn(
                    'shrink-0 transition-opacity',
                    isHovered ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
              </div>
              {/* Divider */}
              <div
                className={cn(
                  'absolute bottom-0 left-3 right-3 h-px bg-border transition-opacity',
                  isHovered ? 'opacity-0' : 'opacity-100'
                )}
              />
            </button>
          );
        })}

        {/* "Something else..." input field */}
        <div
          className="relative px-3 cursor-text"
          onClick={() => textareaRef.current?.focus()}
        >
          <div className="flex gap-3 items-center py-3">
            {/* Pencil icon badge */}
            <div className="flex items-center justify-center size-8 shrink-0 rounded-full">
              <Pencil className="size-4 text-muted-foreground" />
            </div>
            {/* Text input */}
            <textarea
              ref={textareaRef}
              className="flex-1 min-w-0 resize-none bg-transparent text-sm leading-5 text-foreground placeholder:text-muted-foreground focus:outline-none max-h-[200px] min-h-[20px]"
              placeholder={t('ai.suggestions.somethingElse')}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={ctx.isStreaming}
              rows={1}
            />
            {/* Submit button */}
            <button
              type="button"
              className={cn(
                'flex items-center justify-center size-8 shrink-0 rounded-md bg-primary text-primary-foreground transition-opacity',
                !canSubmit && 'opacity-50'
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleSubmitCustom();
              }}
              disabled={!canSubmit}
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
