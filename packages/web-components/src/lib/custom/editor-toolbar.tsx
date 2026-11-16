import * as React from 'react';
import { Maximize, MousePointer, TabletSmartphone, Type } from 'lucide-react';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { FloatingBar } from './floating-bar';

const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iP(hone|ad|od)/.test(navigator.platform || navigator.userAgent);

const isShortcutPressed = (event: KeyboardEvent) =>
  event.shiftKey && (isMac ? event.metaKey : event.ctrlKey);

const shortcutKeys = [isMac ? '⌘' : 'Ctrl', 'Shift'];
const applyKeys = [isMac ? '⌘' : 'Ctrl', '↵'];

/** A shortcut's keys, each in its chip. `className` restyles the chips (on a filled button). */
function Keys({ keys, className }: { keys: string[]; className?: string }) {
  return (
    <span className="flex items-center gap-0.5">
      {keys.map((key) => (
        <kbd
          key={key}
          className={cn(
            'inline-flex h-5 min-w-5 items-center justify-center rounded-[6px] bg-muted px-1 label-sm text-muted-foreground',
            className,
          )}
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}

// TooltipTrigger (asChild) overwrites the tab's `data-state` with the
// tooltip's own, so the active look keys off `aria-selected` instead.
const viewModeTriggerClassName =
  'h-full rounded-[6px] aria-selected:border-input aria-selected:bg-input/30 aria-selected:text-foreground aria-selected:shadow-sm';

// The pressed tool looks like a selected item elsewhere in the editor (an item
// in a side rail, an open card): indigo-950 in the dark pill, a 1px
// primary ring inside, the icon in foreground.
const toolButtonClassName =
  'size-8 rounded-md aria-pressed:bg-indigo-100 aria-pressed:text-foreground aria-pressed:ring-1 aria-pressed:ring-inset aria-pressed:ring-primary aria-pressed:hover:bg-indigo-100 dark:aria-pressed:bg-indigo-950 dark:aria-pressed:hover:bg-indigo-950';
// The same pressed tool, shown rather than pressed: the Text tool at the head of an edit's bar.
const shownToolClassName =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-foreground ring-1 ring-inset ring-primary dark:bg-indigo-950';

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
  /**
   * "Interact with the page" checkbox (controlled), after the tools: checked, the page takes clicks
   * and hovers as a visitor's (its tabs, accordions, carousels) and nothing on it is selected. Omit
   * to hide the segment.
   */
  interact?: boolean;
  onInteractChange?: (checked: boolean) => void;
  /** Single viewport vs all breakpoints. Omit to hide the view-mode segment. */
  viewMode?: EditorToolbarViewMode;
  onViewModeChange?: (mode: EditorToolbarViewMode) => void;
  /**
   * Text changed in place, not applied yet: the bar is the edit's until it ends — the Text tool,
   * "Unsaved text changes", Cancel (Esc) and Apply (⌘/Ctrl ↵) — in place of the other segments.
   */
  editing?: { onCancel: () => void; onApply: () => void };
};

/** The bar's morph between the tools and an edit's: quick out, a soft landing. */
const MORPH = 'cubic-bezier(0.32, 0.72, 0, 1)';

/** Whether the bar may animate: the Web Animations API is there, and motion isn't to be reduced. */
const motionAllowed = () =>
  typeof HTMLElement !== 'undefined' &&
  typeof HTMLElement.prototype.animate === 'function' &&
  !(typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/** What the bar shows: its tools, an edit's, or an edit's shrinking back into the tools. */
type Face = 'tools' | 'editing' | 'leaving';

/**
 * The editor's floating bottom toolbar: interaction tools, the
 * "view original content" switch (also held via Cmd/Ctrl+Shift) and the
 * viewport mode. Segments without a value are not rendered. While a text is
 * edited in place, the edit's own: Cancel and Apply.
 *
 * The two morph into each other, one pill: in, its width from the tools' to
 * the edit's (320ms), its content centered and clipped meanwhile, fading in
 * from 120ms; out, the edit's content fading (120ms), the width back (240ms
 * from 80ms), then the tools fading in (160ms). The Text tool never fades: its
 * icon slides from the tool's place to the head of the edit's bar (and back).
 * None with reduced motion.
 */
export function EditorToolbar({
  className,
  tool,
  onToolChange,
  originalContent,
  onOriginalContentChange,
  interact,
  onInteractChange,
  viewMode,
  onViewModeChange,
  editing,
}: EditorToolbarProps) {
  const { t } = useTranslation();
  const showTools = tool !== undefined;
  const showInteract = interact !== undefined;
  const showOriginal = originalContent !== undefined;
  const showViewMode = viewMode !== undefined;

  const setOriginalContent = (next: boolean) => {
    if (!showOriginal || next === originalContent) return;
    onOriginalContentChange?.(next);
  };

  // What the shortcut holds while pressed, chosen once: the original content where the bar has it to
  // peek at, the page's interaction otherwise. Of the interaction, only a hold lets go on release: a
  // box checked by hand stays checked through the keys typed in the page.
  const interactHeldRef = React.useRef(false);
  const holdsInteract = showInteract && !showOriginal;
  const hold = showOriginal
    ? { press: () => setOriginalContent(true), release: () => setOriginalContent(false) }
    : holdsInteract
      ? {
          press: () => {
            if (interact || interactHeldRef.current) return;
            interactHeldRef.current = true;
            onInteractChange?.(true);
          },
          release: () => {
            if (!interactHeldRef.current) return;
            interactHeldRef.current = false;
            onInteractChange?.(false);
          },
        }
      : null;

  // No dependency array on purpose: re-binding every render is how newly
  // mounted (same-origin) iframes get picked up.
  React.useEffect(() => {
    if (!hold) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isShortcutPressed(event)) hold.press();
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (!isShortcutPressed(event)) hold.release();
    };
    // Releasing keys while another app has focus (e.g. after Cmd+Tab) never
    // fires keyup here, so reset on blur to avoid a stuck state. The focus going
    // from the app into a preview (a click in the page, the keys still held) is
    // no leaving: the preview's own window listens too.
    const handleBlur = () => {
      window.setTimeout(() => {
        if (!document.hasFocus()) hold.release();
      }, 0);
    };

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

  // The edit shown: while `editing`, and kept while its bar shrinks back into the tools.
  const [face, setFace] = React.useState<Face>(editing ? 'editing' : 'tools');
  const [shownEdit, setShownEdit] = React.useState(editing);
  if (editing && (face !== 'editing' || shownEdit !== editing)) {
    setFace('editing');
    setShownEdit(editing);
  }
  // Without motion, straight back to the tools.
  if (!editing && face === 'editing') setFace(motionAllowed() ? 'leaving' : 'tools');

  const barRef = React.useRef<HTMLDivElement>(null);
  const textToolRef = React.useRef<HTMLButtonElement>(null);
  // The tools' pill as last drawn: its width, and its Text tool's left from the pill's center.
  const toolsGeometry = React.useRef<{ width: number; textTool: number | null } | null>(null);
  React.useLayoutEffect(() => {
    if (face !== 'tools' || !barRef.current) return;
    const box = barRef.current.getBoundingClientRect();
    const text = textToolRef.current?.getBoundingClientRect();
    toolsGeometry.current = { width: box.width, textTool: text ? text.left - (box.left + box.width / 2) : null };
  });

  // The morph, once per change of face. Centered on the same point, the content keeps its place
  // while the pill's width changes: only the Text icon moves.
  const previousFace = React.useRef(face);
  React.useLayoutEffect(() => {
    const from = previousFace.current;
    previousFace.current = face;
    if (from === face) return;
    const bar = barRef.current;
    const tools = toolsGeometry.current;
    if (!bar || !tools || !motionAllowed()) {
      // Nothing to shrink back to (the bar opened on an edit): the tools on the next frame.
      if (face !== 'leaving') return;
      const frame = requestAnimationFrame(() => setFace('tools'));
      return () => cancelAnimationFrame(frame);
    }

    if (face === 'tools') {
      // Back: the tools fade in, all but the Text tool, the edit's icon having just slid onto it.
      const textTool = textToolRef.current;
      Array.from(bar.children)
        .flatMap((child) =>
          textTool && child.contains(textTool)
            ? Array.from(child.children).filter((item) => !item.contains(textTool))
            : [child],
        )
        .forEach((child) => child.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' }));
      return;
    }

    const box = bar.getBoundingClientRect();
    const [icon, ...rest] = Array.from(bar.children) as HTMLElement[];
    const iconBox = icon?.getBoundingClientRect();
    const dx = tools.textTool !== null && iconBox ? tools.textTool - (iconBox.left - (box.left + box.width / 2)) : 0;
    const away = `translateX(${dx}px)`;

    if (face === 'editing') {
      const grow = bar.animate([{ width: `${tools.width}px` }, { width: `${box.width}px` }], { duration: 320, easing: MORPH });
      const slide = icon?.animate([{ transform: away }, { transform: 'none' }], { duration: 320, easing: MORPH });
      const fades = rest.map((child) =>
        child.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, delay: 120, easing: 'ease-out', fill: 'backwards' }),
      );
      return () => [grow, slide, ...fades].forEach((animation) => animation?.cancel());
    }

    // Leaving: the edit's content out, then the pill back to the tools' width, the icon onto the Text tool.
    const fades = rest.map((child) => child.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' }));
    const timing = { duration: 240, delay: 80, easing: MORPH, fill: 'forwards' } as const;
    const shrink = bar.animate([{ width: `${box.width}px` }, { width: `${tools.width}px` }], timing);
    const slide = icon?.animate([{ transform: 'none' }, { transform: away }], timing);
    shrink.finished.then(() => setFace('tools')).catch(() => undefined);
    return () => [shrink, slide, ...fades].forEach((animation) => animation?.cancel());
  }, [face]);

  if (face !== 'tools' && shownEdit) {
    return (
      <FloatingBar
        ref={barRef}
        data-slot="editor-toolbar"
        // Centered and clipped while the pill is narrower than its content; a press on it keeps the
        // focus on the text being edited (the edit would apply as it's left).
        className={cn('justify-center overflow-hidden [&>*]:shrink-0', face === 'leaving' && 'pointer-events-none', className)}
        onMouseDown={(event) => event.preventDefault()}
      >
        <span className={shownToolClassName} aria-hidden>
          <Type className="size-4" />
        </span>
        {/* 24px before the buttons: what changed, apart from what to do with it. */}
        <span className="whitespace-nowrap pl-1 pr-4 label-dense text-foreground">{t('components.editorToolbar.unsavedText')}</span>
        <Button variant="outline" size="sm" className="h-8" onClick={shownEdit.onCancel}>
          {t('common.cancel')}
          <Keys keys={['Esc']} />
        </Button>
        <Button variant="accent" size="sm" className="h-8" onClick={shownEdit.onApply}>
          {t('common.apply')}
          <Keys keys={applyKeys} className="bg-primary-foreground/15 text-primary-foreground/80" />
        </Button>
      </FloatingBar>
    );
  }

  return (
    <FloatingBar ref={barRef} data-slot="editor-toolbar" className={className}>
      {showTools && (
        <>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
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
                  ref={textToolRef}
                  variant="ghost"
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
          {(showInteract || showOriginal || showViewMode) && (
            <Separator orientation="vertical" className="data-[orientation=vertical]:h-5" />
          )}
        </>
      )}

      {showInteract && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <label className="flex h-8 cursor-pointer items-center gap-3 px-2">
                <span className="flex items-center gap-2">
                  <Checkbox
                    checked={interact}
                    onCheckedChange={(checked) => {
                      interactHeldRef.current = false;
                      onInteractChange?.(checked === true);
                    }}
                  />
                  <span className="whitespace-nowrap label-dense text-foreground">{t('components.editorToolbar.interact')}</span>
                </span>
                {holdsInteract && (
                  <span className="flex items-center gap-1 label-sm-dense text-muted-foreground">
                    <span>{t('components.editorToolbar.hold')}</span>
                    <Keys keys={shortcutKeys} />
                  </span>
                )}
              </label>
            </TooltipTrigger>
            <TooltipContent>{t('components.editorToolbar.interactHint')}</TooltipContent>
          </Tooltip>
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
              <span className="whitespace-nowrap label-dense text-foreground">
                {t('components.editorToolbar.viewOriginal')}
              </span>
            </span>
            <span className="flex items-center gap-1 label-sm-dense text-muted-foreground">
              <span>{t('components.editorToolbar.hold')}</span>
              <Keys keys={shortcutKeys} />
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
    </FloatingBar>
  );
}
