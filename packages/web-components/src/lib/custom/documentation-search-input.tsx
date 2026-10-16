"use client";

import { useState, useEffect, useCallback } from "react";
import { SearchIcon, FileTextIcon } from "lucide-react";
import { cn } from "@skeleton/core-utils";
import { useTranslation } from "@skeleton/core-translations";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../ui/dialog";
import { VisuallyHidden } from "radix-ui";

export type DocumentationSearchOption = {
  value: string;
  label: string;
  url: string;
  description?: string;
  category?: string;
};

export type DocumentationSearchSource =
  | DocumentationSearchOption[]
  | ((query: string) => Promise<DocumentationSearchOption[]>);

export type DocumentationSearchInputProps = {
  source: DocumentationSearchSource;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  shortcut?: string;
  onNavigate?: (url: string) => void;
};

export function DocumentationSearchInput({
  source,
  placeholder: placeholderProp,
  searchPlaceholder: searchPlaceholderProp,
  emptyMessage: emptyMessageProp,
  disabled,
  className,
  shortcut,
  onNavigate,
}: DocumentationSearchInputProps) {
  const { t } = useTranslation();
  const placeholder = placeholderProp ?? t("components.documentationSearch.placeholder");
  const searchPlaceholder = searchPlaceholderProp ?? t("components.documentationSearch.searchPlaceholder");
  const emptyMessage = emptyMessageProp ?? t("components.documentationSearch.empty");
  const defaultCategory = t("components.documentationSearch.results");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<DocumentationSearchOption[]>([]);
  const [loading, setLoading] = useState(false);

  const isAsync = typeof source === "function";

  // Keyboard shortcut to open dialog
  useEffect(() => {
    if (!shortcut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcut]);

  // For static source, filter options based on query
  useEffect(() => {
    if (!isAsync) {
      const filtered = query
        ? source.filter(
            (option) =>
              option.label.toLowerCase().includes(query.toLowerCase()) ||
              option.description?.toLowerCase().includes(query.toLowerCase())
          )
        : source;
      setOptions(filtered);
    }
  }, [source, query, isAsync]);

  // For async source, fetch options when query changes
  useEffect(() => {
    if (!isAsync || !open) return;

    const fetchOptions = async () => {
      setLoading(true);
      try {
        const results = await source(query);
        setOptions(results);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchOptions, 300);
    return () => clearTimeout(debounceTimer);
  }, [source, query, isAsync, open]);

  const handleSelect = useCallback(
    (option: DocumentationSearchOption) => {
      setOpen(false);
      setQuery("");
      if (onNavigate) {
        onNavigate(option.url);
      } else {
        window.location.href = option.url;
      }
    },
    [onNavigate]
  );

  // Group options by category
  const groupedOptions = options.reduce(
    (acc, option) => {
      const category = option.category || defaultCategory;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(option);
      return acc;
    },
    {} as Record<string, DocumentationSearchOption[]>
  );

  return (
    <>
      {/* Trigger button styled as input */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className={cn(
          "border-input bg-input-background flex h-9 w-full items-center gap-2 rounded-md border px-3 text-sm shadow-xs transition-[color,box-shadow]",
          "hover:bg-accent/50",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-[3px]",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <SearchIcon className="text-foreground size-4 shrink-0" />
        <span className="text-muted-foreground flex-1 truncate text-left">
          {placeholder}
        </span>
        {shortcut && (
          <kbd className="bg-muted text-muted-foreground pointer-events-none flex h-5 min-w-5 items-center justify-center rounded px-1 text-xs font-medium">
            {shortcut}
          </kbd>
        )}
      </button>

      {/* Search dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl" showCloseButton={false}>
          <VisuallyHidden.Root>
            <DialogTitle>{t("components.documentationSearch.title")}</DialogTitle>
          </VisuallyHidden.Root>
          <Command shouldFilter={!isAsync} className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:size-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-3">
            <CommandInput
              placeholder={searchPlaceholder}
              value={query}
              onValueChange={setQuery}
            />
            <CommandList className="max-h-[400px]">
              {loading ? (
                <div className="text-muted-foreground py-6 text-center text-sm">
                  {t("components.documentationSearch.searching")}
                </div>
              ) : (
                <>
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                  {Object.entries(groupedOptions).map(([category, items]) => (
                    <CommandGroup key={category} heading={category}>
                      {items.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.label}
                          onSelect={() => handleSelect(option)}
                          className="flex items-start gap-3"
                        >
                          <FileTextIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{option.label}</span>
                            {option.description && (
                              <span className="text-muted-foreground text-xs">
                                {option.description}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
