import {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  SortingState,
  ColumnVisibilityState,
} from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

interface UseCollectionStateProps {
  useLocationAsState?: boolean;
  defaultSorting?: SortingState;
  defaultColumnVisibility?: ColumnVisibilityState;
  /** Rows per page until the user picks another size (10 when unset). */
  defaultPageSize?: number;
  /** The sizes the user can pick: a `pageSize` from the address bar that is not one of them is ignored. */
  pageSizeOptions?: number[];
}

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

export function useCollectionState({
  useLocationAsState = false,
  defaultSorting,
  defaultColumnVisibility,
  defaultPageSize = 10,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: UseCollectionStateProps = {}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {pathname, hash} = useLocation();

  const [globalFilter, setGlobalFilterState] = useState(() =>
    useLocationAsState ? searchParams.get('search') || '' : '',
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(
    () => {
      if (!useLocationAsState) return defaultColumnVisibility ?? {};
      const visibility = searchParams.get('visibility');
      return visibility ? JSON.parse(visibility) : defaultColumnVisibility ?? {};
    },
  );

  const [columnFilters, setColumnFiltersState] = useState<ColumnFiltersState>(
    () => {
      if (!useLocationAsState) return [];
      const filters = searchParams.get('filters');
      return filters ? JSON.parse(filters) : [];
    },
  );

  const [sorting, setSorting] = useState<SortingState>(() => {
    if (!useLocationAsState) return defaultSorting ?? [];
    const sort = searchParams.get('sort');
    if (sort) return JSON.parse(sort);
    return defaultSorting ?? [];
  });

  const [pagination, setPagination] = useState<PaginationState>(() => {
    if (!useLocationAsState) return { pageIndex: 0, pageSize: defaultPageSize };
    const fromAddress = Number(searchParams.get('pageSize'));
    return {
      pageIndex: Number(searchParams.get('page')) || 0,
      pageSize: pageSizeOptions.includes(fromAddress) ? fromAddress : defaultPageSize,
    };
  });

  // Changing a filter resizes the result set, so a page index carried over from
  // the previous one can sit past its end: the request goes out with a stale
  // `offset`, the API correctly returns nothing, and the table reads "no results"
  // while the header still reports a non-zero count. Pagination is manual here,
  // so react-table's own `autoResetPageIndex` never fires — reset it ourselves.
  const resetToFirstPage = useCallback(() => {
    setPagination((current) =>
      current.pageIndex === 0 ? current : { ...current, pageIndex: 0 },
    );
  }, []);

  const setGlobalFilter: OnChangeFn<string> = useCallback(
    (updater) => {
      setGlobalFilterState(updater);
      resetToFirstPage();
    },
    [resetToFirstPage],
  );

  const setColumnFilters: OnChangeFn<ColumnFiltersState> = useCallback(
    (updater) => {
      setColumnFiltersState(updater);
      resetToFirstPage();
    },
    [resetToFirstPage],
  );

  // Sync state to URL
  useEffect(() => {
    if (!useLocationAsState) return;

    const params = new URLSearchParams();

    if (globalFilter) params.set('search', globalFilter);
    if (pagination.pageIndex > 0)
      params.set('page', String(pagination.pageIndex));
    if (pagination.pageSize !== defaultPageSize)
      params.set('pageSize', String(pagination.pageSize));
    if (columnFilters.length > 0)
      params.set('filters', JSON.stringify(columnFilters));
    if (sorting.length > 0) params.set('sort', JSON.stringify(sorting));
    if (Object.keys(columnVisibility).length > 0)
      params.set('visibility', JSON.stringify(columnVisibility));

    // Use `navigate` (not `setSearchParams`) so we can preserve the URL hash —
    // `setSearchParams` rebuilds the URL from pathname + search only and drops
    // the hash, which would break deep-links like `#audience-import=<id>`.
    const search = params.toString();
    navigate(
      {pathname, search: search ? `?${search}` : '', hash},
      {replace: true},
    );
  }, [
    useLocationAsState,
    globalFilter,
    pagination,
    columnFilters,
    sorting,
    columnVisibility,
    navigate,
    pathname,
    hash,
  ]);

  return {
    globalFilter,
    setGlobalFilter,
    rowSelection,
    setRowSelection,
    columnVisibility,
    setColumnVisibility,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
    pagination,
    setPagination,
  };
}