import * as React from 'react';
import { Maximize, MousePointer, TabletSmartphone, Type } from 'lucide-react';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iP(hone|ad|od)/.test(navigator.platform || navigator.userAgent);

const isShortcutPressed = (event: KeyboardEvent) =>
  event.shiftKey && (isMac ? event.metaKey : event.ctrlKey);

const shortcutKeys = [isMac ? '⌘' : 'Ctrl', 'Shift'];

// TooltipTrigger (asChild) overwrites the tab's `data-state` with the
// tooltip's own, so the active look keys off `aria-selected` instead.
const viewModeTriggerClassName =
  'h-full rounded-[6px] aria-selected:border-input aria-selected:bg-input/30 aria-selected:text-foreground aria-selected:shadow-sm';

// The pressed tool keeps the foreground icon color (Figma), not the accent
// variant's primary-foreground — near-black on indigo in the dark pill.
const toolButtonClassName = 'size-8 rounded-md aria-pressed:text-foreground';

export type EditorToolbarTool = 'select' | 'text';
export type EditorToolbarViewMode = 'single' | 'canvas';

export type EditorToolbarProps = {
  className?: string;
  /** Active interaction tool. Omit to hide the select/text segment. */
  tool?: EditorToolbarTool;
  onToolChange?: (tool: EditorToolbarTool) => void;
  /**
   * "View original content" checkbox (controlled). Omit to hide the segment
   * — and its hold-to-peek shortcut — e.g. on the original page, where there
   * is no modified content to peek behind.
   */
  originalContent?: boolean;
  onOriginalContentChange?: (checked: boolean) => void;
  /** Single viewport vs all breakpoints. Omit to hide the view-mode segment. */
  viewMode?: EditorToolbarViewMode;
  onViewModeChange?: (mode: EditorToolbarViewMode) => void;
};

/**
 * The editor's floating bottom toolbar: interaction tools, the
 * "view original content" switch (also held via Cmd/Ctrl+Shift) and the
 * viewport mode. Segments without a value are not rendered.
 */
export function EditorToolbar({
  className,
  tool,
  onToolChange,
  originalContent,
  onOriginalContentChange,
  viewMode,
  onViewModeChange,
}: EditorToolbarProps) {
  const { t } = useTranslation();
  const showTools = tool !== undefined;
  const showOriginal = originalContent !== undefined;
  const showViewMode = viewMode !== undefined;

  const setOriginalContent = (next: boolean) => {
    if (!showOriginal || next === originalContent) return;
    onOriginalContentChange?.(next);
  };

  // No dependency array on purpose: re-binding every render is how newly
  // mounted (same-origin) iframes get picked up.
  React.useEffect(() => {
    if (!showOriginal) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isShortcutPressed(event)) return;
      setOriginalContent(true);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (isShortcutPressed(event)) return;
      setOriginalContent(false);
    };
    // Releasing keys while another app has focus (e.g. after Cmd+Tab) never
    // fires keyup here, so reset on blur to avoid a stuck state.
    const handleBlur = () => setOriginalContent(false);

    const targets: Array<Window> = [window];
    const iframes = Array.from(document.querySelectorAll('iframe'));
    for (const iframe of iframes) {
      try {
        const win = iframe.contentWindow;
        if (win && win.document) {
          targets.push(win);
        }
      } catch {
        // Cross-origin iframe — skip silently.
      }
    }

    for (const target of targets) {
      target.addEventListener('keydown', handleKeyDown);
      target.addEventListener('keyup', handleKeyUp);
      target.addEventListener('blur', handleBlur);
    }
    return () => {
      for (const target of targets) {
        target.removeEventListener('keydown', handleKeyDown);
        target.removeEventListener('keyup', handleKeyUp);
        target.removeEventListener('blur', handleBlur);
      }
    };
  });

  return (
    <div
      data-slot="editor-toolbar"
      className={cn(
        'flex items-center gap-2 rounded-2xl border border-border bg-background p-2 text-foreground shadow-sm',
        className
      )}
    >
      {showTools && (
        <>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === 'select' ? 'accent' : 'ghost'}
                  size="icon"
                  className={toolButtonClassName}
                  aria-label={t('components.editorToolbar.selectBlocks')}
                  aria-pressed={tool === 'select'}
                  onClick={() => onToolChange?.('select')}
                >
                  <MousePointer className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('components.editorToolbar.select')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === 'text' ? 'accent' : 'ghost'}
                  size="icon"
                  className={toolButtonClassName}
                  aria-label={t('components.editorToolbar.editText')}
                  aria-pressed={tool === 'text'}
                  onClick={() => onToolChange?.('text')}
                >
                  <Type className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('components.editorToolbar.text')}</TooltipContent>
            </Tooltip>
          </div>
          {(showOriginal || showViewMode) && (
            <Separator orientation="vertical" className="data-[orientation=vertical]:h-5" />
          )}
        </>
      )}

      {showOriginal && (
      <Tooltip>
        <TooltipTrigger asChild>
          <label className="flex h-8 cursor-pointer items-center gap-3 px-2">
            <span className="flex items-center gap-2">
              <Checkbox
                checked={originalContent}
                onCheckedChange={(checked) => setOriginalContent(checked === true)}
              />
              <span className="whitespace-nowrap text-sm font-medium leading-none text-foreground">
                {t('components.editorToolbar.viewOriginal')}
              </span>
            </span>
            <span className="flex items-center gap-1 text-xs font-medium leading-none text-muted-foreground">
              <span>{t('components.editorToolbar.hold')}</span>
              <span className="flex items-center gap-0.5">
                {shortcutKeys.map((key) => (
                  <kbd
                    key={key}
                    className="inline-flex h-5 min-w-5 items-center justify-center rounded-[6px] bg-muted px-1 font-sans text-xs font-medium leading-[18px] text-muted-foreground"
                  >
                    {key}
                  </kbd>
                ))}
              </span>
            </span>
          </label>
        </TooltipTrigger>
        <TooltipContent>{t('components.editorToolbar.viewOriginalHint')}</TooltipContent>
      </Tooltip>
      )}

      {showViewMode && (
        <>
          {showOriginal && (
            <Separator orientation="vertical" className="data-[orientation=vertical]:h-5" />
          )}
          <Tabs
            value={viewMode}
            onValueChange={(value) => onViewModeChange?.(value as EditorToolbarViewMode)}
          >
            <TabsList className="h-8 w-28 rounded-md p-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="single" aria-label={t('components.editorToolbar.desktop')} className={viewModeTriggerClassName}>
                    <Maximize className="size-4" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>{t('components.editorToolbar.desktop')}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="canvas" aria-label={t('components.editorToolbar.allBreakpoints')} className={viewModeTriggerClassName}>
                    <TabletSmartphone className="size-4" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>{t('components.editorToolbar.allBreakpoints')}</TooltipContent>
              </Tooltip>
            </TabsList>
          </Tabs>
        </>
      )}
    </div>
  );
}
