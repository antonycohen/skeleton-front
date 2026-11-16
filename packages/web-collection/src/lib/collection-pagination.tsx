"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons"
import { RowData } from "@tanstack/react-table"
import { CollectionTable } from "./collection-features"
import { DEFAULT_PAGE_SIZE_OPTIONS } from "./hooks/use-collection-state"
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@skeleton/web-components';
import { useTranslation } from '@skeleton/core-translations';


interface Props<TData extends RowData> {
  table: CollectionTable<TData>
  canBeSelected: boolean
  /** The sizes offered under "Rows per page". */
  pageSizeOptions?: number[]
}

export function CollectionPagination<TData extends RowData>({ table, canBeSelected, pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS }: Props<TData>) {
  const { t } = useTranslation()
  // The size in use is always one of the items, a default outside the options included.
  const pageSizes = [...new Set([...pageSizeOptions, table.state.pagination.pageSize])].sort((a, b) => a - b)
  // Everything fits on the smallest page: nothing to page through or resize, so no controls (the
  // selection count stays, when rows can be selected).
  const fitsOnOnePage = table.getRowCount() <= pageSizes[0]
  if (fitsOnOnePage && !canBeSelected) return null

  return (
    <div className="flex items-center justify-between overflow-auto px-2">
        <div className="text-muted-foreground hidden flex-1 body sm:block">
        {canBeSelected && (
          <div>
            {t('collection.pagination.selectedRows', {
              count: table.getFilteredSelectedRowModel().rows.length,
              total: table.getRowCount(),
            })}
          </div>
        )}
        </div>
      {!fitsOnOnePage && (
        <div className="flex items-center sm:space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="hidden label sm:block">{t('collection.pagination.rowsPerPage')}</p>
            <Select
              value={`${table.state.pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.state.pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizes.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center label">
            {t('collection.pagination.pageOf', {
              page: table.state.pagination.pageIndex + 1,
              total: table.getPageCount(),
            })}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">{t('collection.pagination.firstPage')}</span>
              <DoubleArrowLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">{t('collection.pagination.previousPage')}</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">{t('collection.pagination.nextPage')}</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">{t('collection.pagination.lastPage')}</span>
              <DoubleArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
