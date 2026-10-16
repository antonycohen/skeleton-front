'use client';

import { useState, useCallback } from 'react';
import * as z from 'zod';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { ArrowUp } from 'lucide-react';
import { withUrlPrefix } from '@skeleton/core-api-models';
import type { AiChatInputPluginContext } from '../types';
import type { TextInputPayload } from '../../instruction-plugins/instruction-text-input-plugin/types';

interface TextInputFieldProps {
  payload: TextInputPayload;
  ctx: AiChatInputPluginContext;
}

/**
 * Build a Zod schema from a list of validator names.
 * Currently supports: 'url'
 */
function buildSchema(validators?: string[]): z.ZodType<string> {
  let schema: z.ZodType<string> = z.string();

  if (!validators || validators.length === 0) return schema;

  for (const validator of validators) {
    switch (validator) {
      case 'url':
        schema = z
          .url({ message: 'ai.textInput.invalidUrl' })
          .refine(
            (val) => {
              try {
                return new URL(val).hostname.includes('.');
              } catch {
                return false;
              }
            },
            { message: 'ai.textInput.invalidUrlDomain' }
          );
        break;
    }
  }

  return schema;
}

/**
 * Validate a value using Zod. Returns the first error message (a translation key) or null.
 */
function validate(value: string, validators?: string[]): string | null {
  const schema = buildSchema(validators);
  const result = schema.safeParse(value);
  if (!result.success) {
    return result.error.issues[0]?.message ?? 'ai.textInput.invalidValue';
  }
  return null;
}

export function TextInputField({ payload, ctx }: TextInputFieldProps) {
  const { tIfKey } = useTranslation();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;

    // A bare host gets the prefix (`https://` for a page address); on a dev server that allows
    // insecure URLs, an explicit `http://` the user typed is kept (see ALLOWS_INSECURE_URLS).
    const fullValue = payload.prefix ? withUrlPrefix(payload.prefix, trimmed) : trimmed;
    const validationError = validate(fullValue, payload.validators);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    const message = payload.format
      ? payload.format.replace('%s', fullValue)
      : fullValue;
    ctx.sendMessageContent(message);
    setValue('');
  }, [value, payload, ctx]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (!payload.prefix) return;

      const pasted = e.clipboardData.getData('text');
      if (pasted.startsWith(payload.prefix)) {
        e.preventDefault();
        const stripped = pasted.slice(payload.prefix.length);
        setValue(stripped);
        if (error) setError(null);
      }
    },
    [payload.prefix, error]
  );

  const canSubmit = value.trim().length > 0 && !ctx.isStreaming;

  return (
    <div className="p-2">
      <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
        <div className="p-4">
          {/* Label */}
          {payload.label && (
            <label className="mb-2 block text-sm font-medium text-foreground">
              {payload.label}
            </label>
          )}

          {/* Input with optional prefix and submit button */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex flex-1 items-center overflow-hidden rounded-xl border bg-background',
                error ? 'border-destructive' : 'border-border'
              )}
            >
              {payload.prefix && (
                <span className="select-none border-r border-border px-3 py-2.5 text-sm text-muted-foreground">
                  {payload.prefix}
                </span>
              )}
              <input
                type="text"
                className="flex-1 bg-transparent px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                placeholder={payload.placeholder}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                disabled={ctx.isStreaming}
                autoFocus
              />
            </div>

            {/* Submit button */}
            <button
              type="button"
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-md bg-foreground text-background transition-opacity',
                !canSubmit && 'opacity-50'
              )}
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              <ArrowUp className="size-4" />
            </button>
          </div>

          {/* Validation error */}
          {error && (
            <p className="mt-1.5 text-sm text-destructive">{tIfKey(error)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
