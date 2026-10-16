import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';

interface UseCollectionTableProps<T> {
  items: T[];
  columns: ColumnDef<T>[];
  totalCount: number;
  sorting: SortingState;
  setSorting: (sorting: SortingState | ((prev: SortingState) => SortingState)) => void;
  columnVisibility: VisibilityState;
  setColumnVisibility: (visibility: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => void;
  rowSelection: Record<string, boolean>;
  setRowSelection: (selection: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  columnFilters: ColumnFiltersState;
  setColumnFilters: (filters: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState)) => void;
  pagination: PaginationState;
  setPagination: (pagination: PaginationState | ((prev: PaginationState) => PaginationState)) => void;
  globalFilter: string;
  setGlobalFilter: (filter: string | ((prev: string) => string)) => void;
}

export function useCollectionTable<T>({
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
  const table = useReactTable({
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
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return table;
}
