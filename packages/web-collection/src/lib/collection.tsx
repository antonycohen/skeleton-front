import {useEffect, useMemo, useRef, type MouseEvent} from 'react';
import {ColumnVisibilityState, flexRender, RowData, SortingState} from '@tanstack/react-table';
import {UseQueryOptions, UseQueryResult} from '@tanstack/react-query';
import {CircleIcon} from 'lucide-react';

import {Button, Checkbox, Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@skeleton/web-components';
import {cn} from '@skeleton/core-utils';
import {useTranslation} from '@skeleton/core-translations';
import {CollectionToolbar, CollectionToolbarProps,} from './collection-toolbar';
import {CollectionPagination} from './collection-pagination';
import {ApiCollectionResponse, ApiError, FieldQuery, GetCollectionQueryParams,} from '@skeleton/core-api';
import {useCollectionState} from './hooks/use-collection-state';
import {useCollectionQuery} from './hooks/use-collection-query';
import {useCollectionTable} from './hooks/use-collection-table';
import {useCollectionSelection} from './hooks/use-collection-selection';
import {CollectionColumnDef, CollectionRow} from './collection-features';

export type UseQueryTable<T, Q> = (
  params: GetCollectionQueryParams<T, Q>,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<T>, ApiError>,
    'queryKey'
  >,
) => UseQueryResult<ApiCollectionResponse<T>, ApiError>;

interface BaseCollectionProps<T extends RowData, S> {
  columns: CollectionColumnDef<T>[];
  filtersConfiguration?: Omit<CollectionToolbarProps<T>, 'table' | 'showColumnSelector' | 'actions'>;
  toolbarActions?: React.ReactNode;
  useLocationAsState?: boolean;
  useQueryFn: UseQueryTable<T, S>;
  queryFields?: FieldQuery<T>;
  staticParams?: S;
  showColumnSelector?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  canBeSelected?: boolean;
  refetchInterval?: UseQueryOptions<ApiCollectionResponse<T>, ApiError>['refetchInterval'];
  defaultSorting?: SortingState;
  /** Columns hidden until the "View" menu (`showColumnSelector`) shows them, e.g. `{ createdAt: false }`. */
  defaultColumnVisibility?: ColumnVisibilityState;
  /** The sizes offered under "Rows per page" (10 to 50 when unset). */
  pageSizeOptions?: number[];
  /** Rows per page until the user picks another size (10 when unset). */
  defaultPageSize?: number;
  /** Told the size the user picks: a page that remounts its collection can hand it back as `defaultPageSize`. */
  onPageSizeChange?: (pageSize: number) => void;
}

type SingleSelectionCollectionProps<T extends RowData, S> = BaseCollectionProps<T, S> & {
  singleSelection: true;
  selection?: T | null;
  onSelectionChange?: (selected: T) => void;
}

type MultiSelectionCollectionProps<T extends RowData, S> = BaseCollectionProps<T, S> & {
  singleSelection?: false;
  selection?: T[];
  onSelectionChange?: (selected: T[]) => void;
}

type Props<T extends RowData, S> = SingleSelectionCollectionProps<T, S> | MultiSelectionCollectionProps<T, S>;

export function Collection<T extends RowData, Q = undefined>({
  columns,
  filtersConfiguration,
  useLocationAsState = false,
  useQueryFn,
  queryFields,
  staticParams = undefined as Q,
  showColumnSelector = false,
  emptyState,
  onRowClick,
  canBeSelected = false,
  singleSelection = false,
  selection,
  onSelectionChange,
  toolbarActions,
  refetchInterval,
  defaultSorting,
  defaultColumnVisibility,
  pageSizeOptions,
  defaultPageSize,
  onPageSizeChange,
}: Props<T, Q>) {
  const { t } = useTranslation();
  const selectAllLabel = t('collection.selection.selectAll');
  const selectRowLabel = t('collection.selection.selectRow');
  const unknownErrorLabel = t('collection.error.unknown');
  const state = useCollectionState({ useLocationAsState, defaultSorting, defaultColumnVisibility, defaultPageSize, pageSizeOptions });
  const pageSize = state.pagination.pageSize;
  // Told when the page size changes, not when the caller hands a new callback (an inline one would
  // otherwise be called on every render).
  const onPageSizeChangeRef = useRef(onPageSizeChange);
  useEffect(() => {
    onPageSizeChangeRef.current = onPageSizeChange;
  }, [onPageSizeChange]);
  // Only on a change: the size the page opens with is not one the user picked.
  const lastPageSize = useRef(pageSize);
  useEffect(() => {
    if (lastPageSize.current === pageSize) return;
    lastPageSize.current = pageSize;
    onPageSizeChangeRef.current?.(pageSize);
  }, [pageSize]);

  const { items, totalCount, error, isPending } = useCollectionQuery({
    pagination: state.pagination,
    globalFilter: state.globalFilter,
    columnFilters: state.columnFilters,
    sorting: state.sorting,
    filtersConfiguration,
    useQueryFn,
    queryFields,
    staticParams,
    refetchInterval,
  });

  const selectionColumn: CollectionColumnDef<T> = useMemo(() => ({
    id: '_select',
    header: ({ table }) => singleSelection ? null : (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label={selectAllLabel}
      />
    ),
    cell: ({ row }) => singleSelection ? (
      <div
        className={cn(
          'border-input text-primary flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border',
          row.getIsSelected() && 'border-primary'
        )}
      >
        {row.getIsSelected() && (
          <CircleIcon className="size-2 fill-current" />
        )}
      </div>
    ) : (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        onClick={(e) => e.stopPropagation()}
        aria-label={selectRowLabel}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  }), [singleSelection, selectAllLabel, selectRowLabel]);

  const allColumns = useMemo(() => {
    if (!canBeSelected) return columns;
    return [selectionColumn, ...columns];
  }, [canBeSelected, columns, selectionColumn]);

  const table = useCollectionTable({
    items,
    columns: allColumns,
    totalCount: totalCount,
    ...state,
  });

  const { handleRowSelect } = useCollectionSelection({
    table,
    mode: singleSelection ? 'single' : 'multiple',
    selection,
    onSelectionChange,
    setRowSelection: state.setRowSelection,
    rowSelection: state.rowSelection,
  });

  const isClickable = onRowClick || canBeSelected;

  // Empty, two ways: nothing in the list yet — only its empty state, no columns, no search or filters
  // (nothing to look through), as Linear's lists; or nothing matching the search or filters — the
  // columns and the toolbar stay, to see and undo what narrowed it.
  const isFiltered = !!state.globalFilter || state.columnFilters.length > 0;
  // A failed read is neither: it says so in the table.
  const isEmpty = !isPending && !error && items.length === 0;
  const isFirstUse = isEmpty && !isFiltered;
  const clearFilters = () => {
    table.setGlobalFilter('');
    table.resetColumnFilters();
  };

  const handleRowClick = (row: CollectionRow<T>, event: MouseEvent<HTMLTableRowElement>) => {
    if (canBeSelected) {
      handleRowSelect(row);
    }
    // A link or control inside the row (the name's link, an actions menu) handles its own click, and
    // so does anything portaled out of it (a menu, a dialog): React bubbles those up to the row too.
    const target = event.target as HTMLElement;
    if (!event.currentTarget.contains(target) || target.closest('a, button, input, [role="menuitem"]')) {
      return;
    }
    onRowClick?.(row.original);
  };

  const hasToolbar =
    !!filtersConfiguration?.textFilter ||
    !!filtersConfiguration?.facetedFilters?.length ||
    showColumnSelector ||
    !!toolbarActions;

  return (
    <div className="space-y-4">
      {/* Nothing in it yet: its empty state stands for the whole list, toolbar and its actions included
          (it carries its own); without one, only the actions stay. A list with nothing to search,
          filter, choose or act on has no toolbar: its count alone says nothing the table doesn't. */}
      {hasToolbar && !(isFirstUse && (emptyState || !toolbarActions)) && (
        <CollectionToolbar<T>
          table={table}
          showColumnSelector={showColumnSelector}
          {...filtersConfiguration}
          actions={toolbarActions}
          controls={!isFirstUse}
        />
      )}
      {error && items.length > 0 && (
        // A failed refresh keeps the previous rows on screen: say they are stale.
        <p role="alert" className="body text-destructive">
          {t('collection.error.refresh', { message: collectionErrorMessage(error, unknownErrorLabel) })}
        </p>
      )}
      {/* A raised surface (card), like the dashboard's data cards. */}
      <div className="overflow-hidden rounded-2xl bg-card outline outline-1 outline-offset-[-1px] outline-border-subtle">
        {isFirstUse
          ? (emptyState ?? <p className="py-16 text-center body text-muted-foreground">{t('collection.firstUse')}</p>)
          : <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={header.column.columnDef.meta?.className ?? ''}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={(event) => handleRowClick(row, event)}
                  className={isClickable ? 'cursor-pointer' : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className ?? ''}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              // A failed read is not an empty list: say so, or the failure passes for "nothing here".
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={allColumns.length} className="h-24 text-center">
                  <div role="alert" className="flex flex-col items-center justify-center gap-1 py-8">
                    <p className="title-md text-destructive">{t('collection.error.load')}</p>
                    <p className="body text-muted-foreground">{collectionErrorMessage(error, unknownErrorLabel)}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : isEmpty ? (
              // Nothing to point at: no hover on the empty state.
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={allColumns.length} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="body text-muted-foreground">{t('collection.noMatch')}</p>
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      {t('collection.filter.clear')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>}
      </div>
      {!isFirstUse && <CollectionPagination table={table} canBeSelected={canBeSelected} pageSizeOptions={pageSizeOptions} />}
    </div>
  );
}

/** The API's own message when it gave one, with its HTTP status. */
function collectionErrorMessage(error: unknown, unknownLabel: string): string {
  if (error && typeof error === 'object') {
    // ApiError carries the API's own message in `error`; `message` is the fallback.
    const { httpCode, error: apiMessage, message: thrown } = error as { httpCode?: number; error?: string; message?: string };
    const message = apiMessage || thrown;
    if (httpCode) {
      return message ? `${message} (HTTP ${httpCode})` : `HTTP ${httpCode}`;
    }
    if (message) {
      return message;
    }
  }
  return unknownLabel;
}
