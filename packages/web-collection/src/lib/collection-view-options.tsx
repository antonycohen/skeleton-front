"use client"

import { RowData } from "@tanstack/react-table"
import { Eye, EyeOff, SlidersHorizontal } from "lucide-react"
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@skeleton/web-components';
import { useTranslation } from '@skeleton/core-translations';
import { cn } from '@skeleton/core-utils';
import { CollectionTable } from './collection-features';

interface Props<TData extends RowData> {
  table: CollectionTable<TData>
}

/**
 * The columns a person can show or hide (Braintrust, Zoom): each one with an eye when shown and a
 * crossed-out eye, its name muted, when hidden. The menu stays open while toggling several.
 */
export function CollectionViewOptions<TData extends RowData>({ table }: Props<TData>) {
  const { t } = useTranslation()

  return (
    <DropdownMenu modal={false}>
      {/* An icon beside the search (Linear, Vanta, Hex), its name in the tooltip. */}
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label={t('collection.viewOptions.columns')}>
              <SlidersHorizontal />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('collection.viewOptions.columns')}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="w-[200px]">
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            const visible = column.getIsVisible()
            const Icon = visible ? Eye : EyeOff
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                hideIndicator
                className={cn("justify-between", !visible && "text-muted-foreground")}
                checked={visible}
                onCheckedChange={(value) => column.toggleVisibility(value)}
                onSelect={(event) => event.preventDefault()}
              >
                {column.columnDef.meta?.label ?? column.id}
                <Icon className="text-muted-foreground" />
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
