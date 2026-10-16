'use client';

import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import {
  CirclePlus,
  Settings2,
  MessagesSquare,
  Mic,
  AudioLines,
  ArrowUp,
  SkipForward,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';

// Background image URL - replace with actual asset in production
const inputGroupPromptBg =
  'http://localhost:3845/assets/51f4753e35d7c43b32f9c3525e7ad90d3b559b3a.png';

export type CheckboxOption = {
  id: string;
  label: string;
  checked?: boolean;
};

export type InputGroupPromptProps = {
  className?: string;
  questionText?: string;
  showRequest?: boolean;
  variant?: 'simple' | 'validation' | 'multi';
  options?: CheckboxOption[];
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onOptionChange?: (id: string, checked: boolean) => void;
  onSkip?: () => void;
  onSubmit?: () => void;
  onAddClick?: () => void;
  onSettingsClick?: () => void;
  onChatClick?: () => void;
  onMicClick?: () => void;
  onAudioClick?: () => void;
};

function InputGroupActionsBlock({
  className,
  onAddClick,
  onSettingsClick,
  onChatClick,
  onMicClick,
  onAudioClick,
  onSubmit,
}: {
  className?: string;
  onAddClick?: () => void;
  onSettingsClick?: () => void;
  onChatClick?: () => void;
  onMicClick?: () => void;
  onAudioClick?: () => void;
  onSubmit?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={onAddClick}
        >
          <CirclePlus className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={onSettingsClick}
        >
          <Settings2 className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2"
          onClick={onChatClick}
        >
          <MessagesSquare className="size-4" />
          <span className="text-xs font-medium">{t('components.prompt.chat')}</span>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={onMicClick}
        >
          <Mic className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={onAudioClick}
        >
          <AudioLines className="size-4" />
        </Button>
        <Button size="icon" className="size-8" onClick={onSubmit}>
          <ArrowUp className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function InputGroupInstructionBlock({
  className,
  questionText,
  showRequest = true,
  variant = 'simple',
  options = [],
  onOptionChange,
  onSkip,
}: {
  className?: string;
  questionText?: string;
  showRequest?: boolean;
  variant?: 'simple' | 'validation' | 'multi';
  options?: CheckboxOption[];
  onOptionChange?: (id: string, checked: boolean) => void;
  onSkip?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={cn('relative flex flex-col gap-6', className)}>
      {showRequest && (
        <div className="pr-40">
          <p className="text-base leading-normal text-foreground">
            {questionText ?? t('components.prompt.question')}
          </p>
        </div>
      )}
      {variant === 'multi' && options.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-primary-foreground p-2"
            >
              <Checkbox
                checked={option.checked}
                onCheckedChange={(checked) =>
                  onOptionChange?.(option.id, checked as boolean)
                }
              />
              <span className="text-sm font-medium text-foreground">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      )}
      <Button
        variant="outline"
        size="icon"
        className="absolute right-6 top-6 size-8"
        onClick={onSkip}
      >
        <SkipForward className="size-4" />
      </Button>
    </div>
  );
}

export function InputGroupPrompt({
  className,
  questionText,
  showRequest = true,
  variant = 'multi',
  options = [],
  placeholder,
  value,
  onValueChange,
  onOptionChange,
  onSkip,
  onSubmit,
  onAddClick,
  onSettingsClick,
  onChatClick,
  onMicClick,
  onAudioClick,
}: InputGroupPromptProps) {
  const { t } = useTranslation();

  return (
    <div
      data-slot="input-group-prompt"
      className={cn(
        'relative flex size-full flex-col items-start overflow-hidden rounded-2xl border border-border',
        className
      )}
    >
      {/* Background layers */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
      >
        <div className="absolute inset-0 rounded-2xl bg-background" />
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <img
            alt=""
            className="absolute -top-[14%] left-[56%] h-[144%] w-[58%] max-w-none"
            src={inputGroupPromptBg}
          />
        </div>
      </div>

      {/* Instruction Block */}
      <InputGroupInstructionBlock
        className="relative w-full px-6 pb-4 pt-6"
        questionText={questionText}
        showRequest={showRequest}
        variant={variant}
        options={options}
        onOptionChange={onOptionChange}
        onSkip={onSkip}
      />

      {/* Input Block */}
      <div className="relative w-full p-2">
        <div className="w-full rounded-md border border-border bg-primary-foreground">
          <div className="flex w-full flex-col overflow-hidden rounded-[inherit]">
            {/* Textarea */}
            <div className="flex w-full items-center justify-center p-4">
              <textarea
                className="h-12 min-h-[48px] w-full resize-none bg-transparent text-base text-muted-foreground placeholder:text-muted-foreground focus:outline-none"
                placeholder={placeholder ?? t('components.prompt.placeholder')}
                value={value}
                onChange={(e) => onValueChange?.(e.target.value)}
              />
            </div>
            {/* Actions */}
            <InputGroupActionsBlock
              className="w-full px-4 pb-4"
              onAddClick={onAddClick}
              onSettingsClick={onSettingsClick}
              onChatClick={onChatClick}
              onMicClick={onMicClick}
              onAudioClick={onAudioClick}
              onSubmit={onSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
