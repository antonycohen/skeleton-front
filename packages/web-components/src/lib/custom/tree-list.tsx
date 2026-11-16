import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { Checkbox } from '../ui/checkbox';

/**
 * A bordered tree of rows to pick from: a parent, its children, their own children, any nested
 * selection. On the card surface (`bg-subtle`, like the metric cards) rather than a muted grey.
 *
 * Rows are split by a hairline; a checked row is tinted. With `columns`, the list is a grid: every
 * row's status, tags and meta sit in shared columns, under a `TreeListHeader`'s titles, like a
 * table's — each as wide as its widest content, unless given a width.
 *
 * With `onSweep`, several rows check at once. Shift + click checks or unchecks every row of the
 * clicked row's level (its `depth`) between the last row clicked and this one, never mixing levels.
 * A mouse drag from a row's selection zone tints every row it passes over, whatever its level, then
 * gives them the first row's new state on release (the list's scroll container follows the pointer
 * near its edges). Rows take part with a `value`.
 */

export type TreeListColumns = {
  /** Width of the status column (`9rem`); unset, as wide as the widest status. */
  status?: string;
  /** Width of the meta column, right-aligned; unset, as wide as the widest meta. */
  meta?: string;
};

/** The list is laid out in columns: its rows place their parts in the shared grid tracks. */
const TreeListGridContext = createContext(false);
/** The rows a drag is sweeping over, by `value`: tinted until the release applies their new state. */
const TreeListSweptContext = createContext<{
  active: boolean;
  values: ReadonlySet<string>;
}>({
  active: false,
  values: new Set(),
});

/** A sweep's row: a `TreeListItem` with a `value`, read from the DOM at the time of the gesture. */
type SweepRow = {
  element: HTMLElement;
  value: string;
  level: string;
  checked: boolean;
};

const rowOf = (
  target: EventTarget | null,
  root: HTMLElement | null,
): SweepRow | null => {
  if (!(target instanceof Element) || !root) return null;
  const element = target.closest<HTMLElement>(
    '[data-slot=tree-list-item][data-value]',
  );
  if (!element || !root.contains(element)) return null;
  return {
    element,
    value: element.dataset.value ?? '',
    level: element.getAttribute('aria-level') ?? '',
    checked: element.getAttribute('aria-selected') === 'true',
  };
};

/** A row's selection zone: its checkbox and the rest of the row — not the fold toggle on its left. */
const inSelectionZone = (target: EventTarget | null) =>
  target instanceof Element &&
  target.closest('[data-slot=tree-list-item] label') !== null &&
  target.closest('[data-slot=tree-list-toggle]') === null;

/** The nearest ancestor that scrolls vertically: a drag scrolls it when the pointer nears its edges. */
const scrollParentOf = (element: HTMLElement | null) => {
  for (
    let node = element?.parentElement ?? null;
    node;
    node = node.parentElement
  ) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      node.scrollHeight > node.clientHeight
    )
      return node;
  }
  return null;
};

export function TreeList({
  summary,
  columns,
  onSweep,
  children,
  className,
}: {
  summary?: ReactNode;
  /**
   * Shift + click (one level at a time) and mouse drag (any level) over the rows with a `value`:
   * receives the rows' values and the state they all take.
   */
  onSweep?: (values: string[], checked: boolean) => void;
  /**
   * Lines the rows' status, tags and meta up in columns (a CSS grid the rows share): `true` fits
   * each column to its content, an object sets widths. Its direct children must be rows or headers;
   * anything else spans the whole width with `col-span-full`.
   */
  columns?: boolean | TreeListColumns;
  children: ReactNode;
  className?: string;
}) {
  const grid = columns !== undefined && columns !== false;
  const widths = typeof columns === 'object' ? columns : {};
  const style: CSSProperties | undefined = grid
    ? {
        gridTemplateColumns: `minmax(0, 1fr) ${widths.status ?? 'max-content'} max-content ${widths.meta ?? 'max-content'}`,
      }
    : undefined;

  // The sweep: the last row clicked (Shift's anchor), the drag in progress, the rows it swept.
  const rootRef = useRef<HTMLDivElement>(null);
  const anchor = useRef<string | null>(null);
  const drag = useRef<{
    start: string;
    checked: boolean;
    moved: boolean;
  } | null>(null);
  const sweptRef = useRef<Set<string>>(new Set());
  const suppressClick = useRef(false);
  const [swept, setSwept] = useState<ReadonlySet<string>>(() => new Set());
  // A press in a row's selection zone starts the gesture: from then on the list speaks in the
  // selection's tint (no grey hover), until the release.
  const [sweeping, setSweeping] = useState(false);

  useEffect(() => {
    if (!onSweep) return;
    const onMove = (event: PointerEvent) => {
      if (!drag.current?.moved) return;
      const scroller = scrollParentOf(rootRef.current);
      if (!scroller) return;
      const box = scroller.getBoundingClientRect();
      if (event.clientY > box.bottom - 48) scroller.scrollBy(0, 16);
      else if (event.clientY < box.top + 48) scroller.scrollBy(0, -16);
    };
    const onUp = () => {
      const sweep = drag.current;
      drag.current = null;
      if (!sweep) return;
      if (sweep.moved) {
        onSweep([...sweptRef.current], sweep.checked);
        anchor.current = sweep.start;
        // The release ends the gesture: the click that follows must not toggle a row again.
        suppressClick.current = true;
        window.setTimeout(() => (suppressClick.current = false), 0);
      }
      sweptRef.current = new Set();
      setSwept(new Set());
      setSweeping(false);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [onSweep]);

  const sweepHandlers = onSweep
    ? {
        onPointerDown: (event: ReactPointerEvent) => {
          if (
            event.button !== 0 ||
            event.pointerType !== 'mouse' ||
            event.shiftKey ||
            !inSelectionZone(event.target)
          )
            return;
          const row = rowOf(event.target, rootRef.current);
          if (!row) return;
          drag.current = {
            start: row.value,
            checked: !row.checked,
            moved: false,
          };
          // The pressed row turns to the selection's tint at once, before the pointer moves.
          sweptRef.current = new Set([row.value]);
          setSwept(sweptRef.current);
          setSweeping(true);
        },
        onPointerOver: (event: ReactPointerEvent) => {
          const sweep = drag.current;
          const row = rowOf(event.target, rootRef.current);
          // A drag takes every row it passes over, whatever its level.
          if (!sweep || !row || (event.buttons & 1) === 0) return;
          if (row.value === sweep.start && !sweep.moved) return;
          sweep.moved = true;
          sweptRef.current = new Set([
            ...sweptRef.current,
            sweep.start,
            row.value,
          ]);
          setSwept(sweptRef.current);
        },
        onClickCapture: (event: ReactMouseEvent) => {
          if (suppressClick.current) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          if (!inSelectionZone(event.target)) return;
          const row = rowOf(event.target, rootRef.current);
          if (!row) return;
          const rows = [
            ...(rootRef.current?.querySelectorAll<HTMLElement>(
              '[data-slot=tree-list-item][data-value]',
            ) ?? []),
          ];
          const from = rows.findIndex(
            (element) => element.dataset.value === anchor.current,
          );
          const to = rows.indexOf(row.element);
          if (event.shiftKey && from >= 0 && from !== to) {
            event.preventDefault();
            event.stopPropagation();
            const values = rows
              .slice(Math.min(from, to), Math.max(from, to) + 1)
              .filter(
                (element) => element.getAttribute('aria-level') === row.level,
              )
              .map((element) => element.dataset.value ?? '');
            onSweep(values, !row.checked);
          }
          anchor.current = row.value;
        },
      }
    : {};

  return (
    <div
      ref={rootRef}
      data-slot="tree-list"
      role="tree"
      // A border, not the cards' inner outline: its rows (positioned, each with its background)
      // would paint over an outline.
      className={cn(
        '@container overflow-hidden rounded-2xl border border-border-subtle bg-card',
        onSweep && 'select-none',
        className,
      )}
      {...sweepHandlers}
    >
      {summary && (
        <p className="border-b border-border-subtle bg-subtle p-4 body-sm text-muted-foreground">
          {summary}
        </p>
      )}
      {/* Every row draws its bottom hairline; the last one slips under the frame's own border. */}
      <div className={cn('-mb-px', grid && 'grid')} style={style}>
        <TreeListGridContext.Provider value={grid}>
          <TreeListSweptContext.Provider
            value={{ active: sweeping, values: swept }}
          >
            {children}
          </TreeListSweptContext.Provider>
        </TreeListGridContext.Provider>
      </div>
    </div>
  );
}

/**
 * The column titles, first in the list: the label's (a legend of the levels, for instance:
 * "Parent › Child › Item"), then the status's and the meta's, over the `columns`.
 */
export function TreeListHeader({
  label,
  status,
  meta,
  className,
}: {
  label: ReactNode;
  status?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  const grid = useContext(TreeListGridContext);
  return (
    <div
      data-slot="tree-list-header"
      role="presentation"
      className={cn(
        'items-center border-b border-border-subtle bg-card py-3 pr-4 pl-4 label-sm text-muted-foreground',
        grid ? 'col-span-full grid grid-cols-subgrid' : 'flex gap-2',
        className,
      )}
    >
      <span className="col-start-1 flex min-w-0 flex-1 items-center gap-1.5 truncate [&_svg]:size-3.5">
        {label}
      </span>
      {status && (
        <span
          className={cn(
            'col-start-2 hidden shrink-0 @md:block',
            grid && 'pl-6',
          )}
        >
          {status}
        </span>
      )}
      {meta && (
        <span className={cn('col-start-4 shrink-0 text-right', grid && 'pl-6')}>
          {meta}
        </span>
      )}
    </div>
  );
}

export type TreeListItemVariant = 'default' | 'subtle';

export type TreeListItemProps = {
  /** `subtle` for a top-level row (a parent), on `bg-subtle`; `default` rows sit on `bg-card` (same colour today). */
  variant?: TreeListItemVariant;
  label: ReactNode;
  /** The row's kind, a 16px muted glyph after the checkbox: one per level of the tree. */
  icon?: ReactNode;
  /** A muted second line under the label (a count, a detail); the row grows to fit it. */
  description?: ReactNode;
  /** Nesting level: each level indents by 48px; a nested row draws one guide, under its parent's checkbox. */
  depth?: number;
  /** Shows the chevron ("Item Expandable"); leave undefined for a leaf ("Item"). */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  checked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean) => void;
  /** Replaces the checkbox (e.g. a drag handle). */
  leading?: ReactNode;
  /** Tags after the status (keywords, labels…); shown when the list is at least 42rem wide. */
  tags?: ReactNode;
  /** Variant status, a `BadgeStatus` or plain text; shown from a 28rem-wide list (the checkbox says it below). */
  status?: ReactNode;
  /** Right-aligned count: tasks, "4 items", "4 of 4 selected". */
  meta?: ReactNode;
  /** The row's id for the list's `onSweep` (Shift + click, drag): rows without one stay out of it. */
  value?: string;
  className?: string;
};

const INDENT = 48;

export function TreeListItem({
  variant = 'default',
  label,
  icon,
  description,
  depth = 0,
  expanded,
  onExpandedChange,
  checked,
  onCheckedChange,
  leading,
  tags,
  status,
  meta,
  value,
  className,
}: TreeListItemProps) {
  const { t } = useTranslation();
  const grid = useContext(TreeListGridContext);
  const sweep = useContext(TreeListSweptContext);
  const swept = value !== undefined && sweep.values.has(value);
  const expandable = expanded !== undefined;
  const Chevron = expanded ? ChevronDown : ChevronRight;

  return (
    <div
      data-slot="tree-list-item"
      data-value={value}
      role="treeitem"
      aria-level={depth + 1}
      aria-expanded={expandable ? expanded : undefined}
      aria-selected={checked === true}
      className={cn(
        // Hover like a table row (TableRow: bg-muted/50, colours eased); a checked row already wears that tint.
        'group/row relative items-center border-b border-border-subtle pr-4 transition-colors',
        // While a drag sweeps, no grey hover: only the rows it takes wear the selection's tint.
        !sweep.active && 'hover:bg-muted/50',
        // In columns, the row is a slice of the list's grid; the gaps are each column's own padding.
        grid ? 'col-span-full grid grid-cols-subgrid' : 'flex gap-2',
        description ? 'min-h-13 py-2' : 'h-9',
        checked === true
          ? 'bg-muted/50'
          : variant === 'subtle'
            ? 'bg-subtle'
            : 'bg-card',
        // Swept by a drag, before the release applies: the selection's tint.
        swept && 'bg-primary/10 hover:bg-primary/10',
        className,
      )}
      // The toggle's click area ends where the checkbox starts (chevron 16 + gap 8); the label's begins there.
      style={
        {
          paddingLeft: 16 + depth * INDENT,
          '--tree-list-toggle-hit': `${16 + depth * INDENT + 24}px`,
        } as CSSProperties
      }
    >
      {/* One guide per row: its parent's, under the parent's checkbox (chevron 16 + gap 8 + half the box 8). */}
      {depth > 0 && (
        <span
          aria-hidden
          className="absolute inset-y-0 w-px bg-border-subtle"
          style={{ left: 16 + (depth - 1) * INDENT + 31.5 }}
        />
      )}

      <div className="col-start-1 flex min-w-0 flex-1 items-center gap-2">
        {expandable ? (
          <button
            type="button"
            data-slot="tree-list-toggle"
            aria-label={expanded ? t('components.treeList.collapse') : t('components.treeList.expand')}
            onClick={() => onExpandedChange?.(!expanded)}
            className="flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground outline-none hover:text-foreground after:absolute after:inset-y-0 after:left-0 after:w-(--tree-list-toggle-hit) after:content-[''] focus-visible:ring-[3px] focus-visible:ring-ring/50"
            // The click area: the whole row height, from the row's edge (its indent included) up to the
            // checkbox — the glyph stays 16px. The button isn't positioned, so its ::after spans the row.
          >
            <Chevron className="size-4" />
          </button>
        ) : (
          <span className="size-4 shrink-0" aria-hidden />
        )}

        {/* The selection's click area: the rest of the row, up to its right edge (status and meta included),
            the whole row on a leaf. The label isn't positioned, so its ::after spans the row. */}
        <label
          className={cn(
            "flex min-w-0 flex-1 cursor-pointer items-center gap-3 after:absolute after:inset-y-0 after:right-0 after:content-['']",
            expandable ? 'after:left-(--tree-list-toggle-hit)' : 'after:left-0',
          )}
        >
          {leading ?? (
            <Checkbox
              checked={checked ?? false}
              onCheckedChange={(next) => onCheckedChange?.(next === true)}
              disabled={!onCheckedChange && checked === undefined}
            />
          )}
          {icon && (
            <span className="flex shrink-0 text-muted-foreground [&_svg]:size-4">
              {icon}
            </span>
          )}
          {description ? (
            <span className="flex min-w-0 flex-col">
              <span className="truncate body text-foreground">{label}</span>
              <span className="truncate body-sm text-muted-foreground">
                {description}
              </span>
            </span>
          ) : (
            <span className="min-w-0 truncate body text-foreground">
              {label}
            </span>
          )}
        </label>
      </div>

      {status && (
        <span
          className={cn(
            'col-start-2 hidden min-w-0 shrink-0 items-center body-sm text-muted-foreground @md:flex',
            grid && 'pl-6',
          )}
        >
          {status}
        </span>
      )}
      {tags && (
        <span
          className={cn(
            'col-start-3 hidden min-w-0 shrink items-center gap-1 overflow-hidden @2xl:flex',
            grid && 'pl-2',
          )}
        >
          {tags}
        </span>
      )}
      {meta !== undefined && (
        <span
          className={cn(
            'col-start-4 shrink-0 text-right body-sm text-muted-foreground tabular-nums',
            grid && 'pl-6',
          )}
        >
          {meta}
        </span>
      )}
    </div>
  );
}
