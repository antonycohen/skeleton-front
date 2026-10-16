import {useMemo} from 'react';
import {ColumnDef, flexRender, Row, RowData, SortingState} from '@tanstack/react-table';
import {UseQueryOptions, UseQueryResult} from '@tanstack/react-query';
import {CircleIcon} from 'lucide-react';

import {Checkbox, Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@skeleton/web-components';
import {cn} from '@skeleton/core-utils';
import {useTranslation} from '@skeleton/core-translations';
import {CollectionToolbar, CollectionToolbarProps,} from './collection-toolbar';
import {CollectionPagination} from './collection-pagination';
import {ApiCollectionResponse, ApiError, FieldQuery, GetCollectionQueryParams,} from '@skeleton/core-api';
import {useCollectionState} from './hooks/use-collection-state';
import {useCollectionQuery} from './hooks/use-collection-query';
import {useCollectionTable} from './hooks/use-collection-table';
import {useCollectionSelection} from './hooks/use-collection-selection';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className: string;
  }
}

export type UseQueryTable<T, Q> = (
  params: GetCollectionQueryParams<T, Q>,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<T>, ApiError>,
    'queryKey'
  >,
) => UseQueryResult<ApiCollectionResponse<T>, ApiError>;

interface BaseCollectionProps<T, S> {
  columns: ColumnDef<T>[];
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
}

type SingleSelectionCollectionProps<T,S> = BaseCollectionProps<T, S> & {
  singleSelection: true;
  selection?: T | null;
  onSelectionChange?: (selected: T) => void;
}

type MultiSelectionCollectionProps<T,S> = BaseCollectionProps<T, S> & {
  singleSelection?: false;
  selection?: T[];
  onSelectionChange?: (selected: T[]) => void;
}

type Props<T, S> = SingleSelectionCollectionProps<T, S> | MultiSelectionCollectionProps<T, S>;

export function Collection<T, Q = undefined>({
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
}: Props<T, Q>) {
  const { t } = useTranslation();
  const selectAllLabel = t('collection.selection.selectAll');
  const selectRowLabel = t('collection.selection.selectRow');
  const state = useCollectionState({ useLocationAsState, defaultSorting });

  const { items, totalCount } = useCollectionQuery({
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

  const selectionColumn: ColumnDef<T> = useMemo(() => ({
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

  const handleRowClick = (row: Row<T>) => {
    if (canBeSelected) {
      handleRowSelect(row);
    }
    onRowClick?.(row.original);
  };

  return (
    <div className="space-y-4">
      <CollectionToolbar table={table} showColumnSelector={showColumnSelector} {...filtersConfiguration} actions={toolbarActions} />
      <div className="rounded-md border border-border-subtle">
        <Table>
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
                  onClick={() => handleRowClick(row)}
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
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-24 text-center"
                >
                  {emptyState ?? t('collection.empty')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <CollectionPagination table={table} canBeSelected={canBeSelected} />
    </div>
  );
}
