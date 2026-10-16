"use client";

import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@skeleton/core-utils";
import { useTranslation } from "@skeleton/core-translations";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export type LanguageOption = {
  iso2: string;
  label: string;
  flag: string;
};

export type LanguageInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  languages: LanguageOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
};

export function LanguageInput({
  value,
  onChange,
  onBlur,
  languages,
  placeholder: placeholderProp,
  searchPlaceholder: searchPlaceholderProp,
  emptyMessage: emptyMessageProp,
  disabled,
  className,
  id,
  "aria-invalid": ariaInvalid,
}: LanguageInputProps) {
  const { t } = useTranslation();
  const placeholder = placeholderProp ?? t("components.languageInput.placeholder");
  const searchPlaceholder = searchPlaceholderProp ?? t("components.languageInput.searchPlaceholder");
  const emptyMessage = emptyMessageProp ?? t("components.languageInput.empty");
  const [open, setOpen] = useState(false);

  const selectedLanguage = languages.find((lang) => lang.iso2 === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(
            "justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {selectedLanguage ? (
            <span className="flex items-center gap-2">
              <span>{selectedLanguage.flag}</span>
              <span>{selectedLanguage.label}</span>
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
                  key={language.iso2}
                  value={language.label}
                  onSelect={() => {
                    onChange?.(language.iso2 === value ? "" : language.iso2);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 size-4",
                      value === language.iso2 ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="mr-2">{language.flag}</span>
                  {language.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
