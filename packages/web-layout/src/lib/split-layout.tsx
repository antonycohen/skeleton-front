import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useTranslation } from '@skeleton/core-translations';
import { cn } from '@skeleton/core-utils';

export type SplitLayoutProps = {
  /** The main column (e.g. a chat): it takes the width the panel leaves. */
  children: ReactNode;
  /** The side panel, on the right. `null` closes it, animated. */
  panel: ReactNode | null;
  /** Names the panel for its open/close animation: a new key swaps one panel for another. */
  panelKey?: string;
  /**
   * Below lg, whether the panel covers the main column. A panel always beside it on desktop (the
   * editor's preview) can start closed on mobile and open over the main column when there's something to
   * show. @default true
   */
  openBelowLg?: boolean;
  /**
   * Below lg, a panel closed by `openBelowLg` stays mounted, slid out of view and out of reach, rather
   * than unmounted: an editor's page keeps its state (its document, its scroll, its selection) while
   * the main column is shown over it.
   */
  keepPanelMounted?: boolean;
  /** Focus mode (from lg): the panel grows over the main column, kept mounted, and takes the row. */
  mainHidden?: boolean;
  /**
   * The main column's width side by side, in px. From 1280px wide, it takes a quarter of the row
   * (the sidebar left out) when that's more, and follows the window; once dragged, it keeps the
   * dragged width. A double-click on the handle goes back to the default, and changing it resets
   * the split, even after a drag.
   * @default 320 (a chat column)
   */
  defaultMainWidth?: number;
  /** @default 320 */
  minMainWidth?: number;
  /**
   * The main column held at its minimum width, the panel taking the rest: while the panel needs the
   * room (an editor with an inspector open beside its page). Its own width (default or dragged) comes
   * back when it turns off; dragging the handle meanwhile sets the width and releases it.
   */
  mainCompact?: boolean;
  /** When both minimums can't fit, the panel's wins: the main column gives way. @default 480 */
  minPanelWidth?: number;
  /** Sizes the row, e.g. `h-viewport` for a full-height view. @default h-full */
  className?: string;
};

type SplitLayoutState = {
  /** The panel sits beside the main column (desktop, panel open). Below lg it covers it instead. */
  split: boolean;
};

const SplitLayoutContext = createContext<SplitLayoutState>({ split: false });

/** Whether the main column currently has the panel beside it. Outside a `SplitLayout`: never. */
export const useSplitLayout = () => useContext(SplitLayoutContext);

/**
 * A main column and a side panel that opens on its right. From lg they sit side by side: the panel
 * grows from the right edge and a handle shares the width between them. Below lg the panel slides
 * over the main column.
 */
export function SplitLayout({
  children,
  panel,
  panelKey = 'panel',
  openBelowLg = true,
  keepPanelMounted = false,
  mainHidden = false,
  defaultMainWidth = 320,
  minMainWidth = 320,
  minPanelWidth = 480,
  mainCompact = false,
  className,
}: SplitLayoutProps) {
  /** The width the user dragged to; null while the main column follows its default. */
  const [mainWidth, setMainWidth] = useState<number | null>(null);
  const [widthDefault, setWidthDefault] = useState(defaultMainWidth);
  if (widthDefault !== defaultMainWidth) {
    setWidthDefault(defaultMainWidth);
    setMainWidth(null);
  }
  const [resizing, setResizing] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const isWide = useMediaQuery(WIDE_QUERY);
  const rowWidth = useElementWidth(rowRef);
  // From 1280px, a quarter of the row when that's more than the default (320px stays the least).
  const autoWidth = isWide && rowWidth > 0 ? Math.max(defaultMainWidth, Math.round(rowWidth * WIDE_SHARE)) : defaultMainWidth;
  const reduceMotion = useReducedMotion();
  const transition = resizing || reduceMotion ? { duration: 0 } : PANEL_TRANSITION;
  // The panel waits for the row's first measure (before the first paint): open on arrival, it shows
  // at its share straight away rather than growing from a half-width guess. Latched, while rendering.
  const [measured, setMeasured] = useState(false);
  if (rowWidth > 0 && !measured) setMeasured(true);

  const open = panel != null && (isDesktop || openBelowLg);
  // Closed below lg, a panel kept mounted stays in the row, out of view.
  const mounted = open || (panel != null && keepPanelMounted && !isDesktop);
  const clamp = (width: number, row: number) => clampMainWidth(width, row, minMainWidth, minPanelWidth);
  // A drag while compact releases it, until it turns on again.
  const [compactReleased, setCompactReleased] = useState(false);
  const [compactWas, setCompactWas] = useState(mainCompact);
  if (compactWas !== mainCompact) {
    setCompactWas(mainCompact);
    setCompactReleased(false);
  }
  const compact = mainCompact && !compactReleased;
  /** Side by side, the panel's share of the row: the frame animates to it, the content holds it. */
  const shownWidth = clamp(compact ? minMainWidth : (mainWidth ?? autoWidth), rowWidth);
  const panelShare = mainHidden ? 100 : rowWidth > 0 ? ((rowWidth - shownWidth) / rowWidth) * 100 : 50;

  return (
    <SplitLayoutContext.Provider value={{ split: isDesktop && open && !mainHidden }}>
      <div
        ref={rowRef}
        className={cn(
          '@container relative flex h-full min-h-0 w-full bg-background text-foreground',
          resizing && 'cursor-col-resize select-none',
          className,
        )}
      >
        {/* Focus mode: the main column stays in the row, squeezed to nothing by the panel growing
            over it (no jump), kept mounted, and out of reach meanwhile. */}
        {/* Below lg, covered by the panel, it's out of reach too: no tab stop, no duplicate, under it. */}
        <div
          className={cn('flex min-h-0 min-w-0 flex-1 flex-col', mainHidden && 'overflow-hidden')}
          inert={mainHidden || (open && !isDesktop) || undefined}
        >
          {children}
        </div>

        {open && !mainHidden && (
          <ResizeHandle
            containerRef={rowRef}
            width={shownWidth}
            rowWidth={rowWidth}
            clamp={clamp}
            onWidthChange={(width) => {
              setMainWidth(width);
              if (mainCompact) setCompactReleased(true);
            }}
            onReset={() => setMainWidth(null)}
            onResizingChange={setResizing}
          />
        )}

        {/* Desktop: the panel grows from the right edge while the main column (flex-1) gives up the
            width; its content keeps its final width meanwhile, so only the main column reflows.
            Below lg: it slides over the main column. */}
        {measured && (
          <AnimatePresence initial={false}>
            {mounted && (
              <motion.div
                key={panelKey}
                className="absolute inset-0 z-20 flex justify-end overflow-hidden lg:relative lg:inset-auto lg:z-auto lg:shrink-0"
                inert={!open || undefined}
                initial={isDesktop ? { width: '0%', x: 0 } : { width: '100%', x: '100%' }}
                animate={isDesktop ? { width: `${panelShare}%`, x: 0 } : { width: '100%', x: open ? 0 : '100%' }}
                exit={isDesktop ? { width: '0%', x: 0 } : { width: '100%', x: '100%' }}
                transition={transition}
              >
                {/* cqw: a share of the row (the nearest container), whatever the frame's width is
                    mid-animation. Opening, it starts at its final width (only the frame grows); when
                    the share changes (focus mode), it follows the frame with the same easing. */}
                <motion.div
                  className="h-full shrink-0"
                  initial={false}
                  animate={{ width: isDesktop ? `${panelShare}cqw` : '100%' }}
                  transition={transition}
                >
                  {panel}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </SplitLayoutContext.Provider>
  );
}

/** The width where the two sit side by side (Tailwind's lg). */
const DESKTOP_QUERY = '(min-width: 1024px)';
/** From this width (Tailwind's xl), the main column takes a share of the row rather than its default. */
const WIDE_QUERY = '(min-width: 1280px)';
const WIDE_SHARE = 1 / 4;
const PANEL_TRANSITION = { duration: 0.35, ease: [0.22, 1, 0.36, 1] } as const;
const KEYBOARD_STEP = 16;

/**
 * Keeps each side at its minimum width, wherever the split comes from (default, drag, resize).
 * When both can't fit, the panel's minimum wins: the main column gives way.
 */
const clampMainWidth = (width: number, rowWidth: number, minMain: number, minPanel: number) =>
  rowWidth > 0 ? Math.max(Math.min(Math.max(width, minMain), rowWidth - minPanel), 0) : width;

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, [query]);
  return matches;
}

/**
 * The element's width, kept up to date. Safe on the row because it is a size container
 * (`@container`): its width never depends on its content, so the panel can't push it wider.
 */
function useElementWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    setWidth(element.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

/**
 * The line between the two (from lg): drag it to share the width, arrows to nudge it,
 * double-click to go back to the default split.
 */
function ResizeHandle(props: {
  containerRef: RefObject<HTMLDivElement | null>;
  /** The main column's width, in px. */
  width: number;
  /** The row's width, for the share announced to assistive tech. */
  rowWidth: number;
  clamp: (width: number, rowWidth: number) => number;
  onWidthChange: (width: number) => void;
  /** A double-click: back to the default split. */
  onReset: () => void;
  onResizingChange: (resizing: boolean) => void;
}) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);

  const rowWidth = () => props.containerRef.current?.getBoundingClientRect().width ?? 0;
  const clamp = (width: number) => props.clamp(width, rowWidth());

  const widthAt = (clientX: number) => {
    const rect = props.containerRef.current?.getBoundingClientRect();
    return rect ? clamp(clientX - rect.left) : props.width;
  };

  const setDrag = (on: boolean) => {
    setDragging(on);
    props.onResizingChange(on);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging) props.onWidthChange(widthAt(event.clientX));
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDrag(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === 'ArrowLeft' ? -KEYBOARD_STEP : event.key === 'ArrowRight' ? KEYBOARD_STEP : 0;
    if (event.key === 'Home') props.onWidthChange(clamp(0));
    else if (event.key === 'End') props.onWidthChange(clamp(rowWidth()));
    else if (step) props.onWidthChange(clamp(props.width + step));
    else return;
    event.preventDefault();
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={t('layout.splitLayout.resize')}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={props.rowWidth > 0 ? Math.round((props.width / props.rowWidth) * 100) : 50}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={props.onReset}
      onKeyDown={onKeyDown}
      className="group/handle relative z-10 hidden w-px shrink-0 cursor-col-resize touch-none bg-border outline-none lg:block"
    >
      {/* A wider hit area than the 1px line. A passing pointer changes nothing; a pointer that stays
          (400ms) widens the line and shows a grip. Focus and drag show it at once, in primary. */}
      <span aria-hidden className="absolute inset-y-0 -left-1.5 w-3" />
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-[width,background-color] delay-0 duration-150',
          dragging
            ? 'w-[3px] bg-primary'
            : 'group-hover/handle:w-[3px] group-hover/handle:bg-border group-hover/handle:delay-[400ms] group-focus-visible/handle:w-[3px] group-focus-visible/handle:bg-primary group-focus-visible/handle:delay-0',
        )}
      />
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-1/2 left-1/2 h-8 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity delay-0 duration-150',
          dragging
            ? 'bg-primary opacity-100'
            : 'bg-muted-foreground/60 group-hover/handle:opacity-100 group-hover/handle:delay-[400ms] group-focus-visible/handle:bg-primary group-focus-visible/handle:opacity-100 group-focus-visible/handle:delay-0',
        )}
      />
    </div>
  );
}
