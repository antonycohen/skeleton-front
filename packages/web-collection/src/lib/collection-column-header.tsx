"use client"

import { CellData, RowData } from "@tanstack/react-table"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@skeleton/web-components';
import { cn } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import { CollectionColumn } from './collection-features';



interface DataTableColumnHeaderProps<TData extends RowData, TValue extends CellData>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: CollectionColumn<TData, TValue>
  title: string
  /** What the column holds, shown on hovering its title, instead of an info icon. */
  tooltip?: string
}

/**
 * A column title. Sortable, it sorts on one click and flips the order on the next (ClickUp, Linear):
 * no icon at rest, a faint arrow on hover for what the click will do, and on the sorted column its
 * arrow with the title in foreground. Hovering anywhere in the header cell highlights the cell.
 */
function ColumnTitle({ title, tooltip }: { title: string; tooltip?: string }) {
  if (!tooltip) return <span>{title}</span>
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* Above the sort button's stretched target, so the title keeps its own hover. */}
        <span className="relative z-10">
          {title}
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

export function CollectionColumnHeader<TData extends RowData, TValue extends CellData>({
  column,
  title,
  tooltip,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const { t } = useTranslation()

  if (!column.getCanSort()) {
    return (
      <div className={cn(className)}>
        <ColumnTitle title={title} tooltip={tooltip} />
      </div>
    )
  }

  const sorted = column.getIsSorted()
  // The order a click applies: the other one when sorted, the column's first otherwise (desc for
  // numbers and dates, asc for text).
  const next = sorted ? (sorted === "asc" ? "desc" : "asc") : column.getFirstSortDir()
  const Arrow = (sorted || next) === "desc" ? ArrowDown : ArrowUp

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* The whole header cell is the target: `after` stretches the button over the TableHead (relative),
          which takes the hover bg of the rows below. */}
      <Button
        variant="ghost"
        size="sm"
        data-sort-header=""
        className={cn(
          "group/sort h-auto gap-1 p-0 label-sm has-[>svg]:px-0 hover:bg-transparent dark:hover:bg-transparent after:absolute after:inset-0",
          sorted && "text-foreground"
        )}
        aria-label={t(next === "desc" ? 'collection.sort.byDesc' : 'collection.sort.byAsc', { title })}
        onClick={() => column.toggleSorting(next === "desc")}
      >
        <ColumnTitle title={title} tooltip={tooltip} />
        <Arrow
          className={cn(
            "size-3.5",
            !sorted && "opacity-0 transition-opacity group-hover/sort:opacity-60 group-focus-visible/sort:opacity-60"
          )}
        />
      </Button>
    </div>
  )
}
