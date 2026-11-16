import {
  ColumnFiltersState,
  ColumnVisibilityState,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
  useTable,
} from '@tanstack/react-table';
import { CollectionColumnDef, collectionFeatures } from '../collection-features';

interface UseCollectionTableProps<T extends RowData> {
  items: T[];
  columns: CollectionColumnDef<T>[];
  totalCount: number;
  sorting: SortingState;
  setSorting: (sorting: SortingState | ((prev: SortingState) => SortingState)) => void;
  columnVisibility: ColumnVisibilityState;
  setColumnVisibility: (visibility: ColumnVisibilityState | ((prev: ColumnVisibilityState) => ColumnVisibilityState)) => void;
  rowSelection: RowSelectionState;
  setRowSelection: (selection: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void;
  columnFilters: ColumnFiltersState;
  setColumnFilters: (filters: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState)) => void;
  pagination: PaginationState;
  setPagination: (pagination: PaginationState | ((prev: PaginationState) => PaginationState)) => void;
  globalFilter: string;
  setGlobalFilter: (filter: string | ((prev: string) => string)) => void;
}

export function useCollectionTable<T extends RowData>({
  items,
  columns,
  totalCount,
  sorting,
  setSorting,
  columnVisibility,
  setColumnVisibility,
  rowSelection,
  setRowSelection,
  columnFilters,
  setColumnFilters,
  pagination,
  setPagination,
  globalFilter,
  setGlobalFilter,
}: UseCollectionTableProps<T>) {
  const table = useTable({
    features: collectionFeatures,
    data: items,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter,
    },
    getRowId: (row) => (row as { id?: string }).id ?? String(items.indexOf(row)),
    rowCount: Math.max(items.length, totalCount),
    enableRowSelection: true,
    manualFiltering: true,
    manualSorting: true,
    manualPagination: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
  });

  return table;
}
