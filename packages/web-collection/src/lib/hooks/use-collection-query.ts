import {keepPreviousData, type UseQueryOptions} from '@tanstack/react-query';
import {ApiCollectionResponse, ApiError, FieldQuery, QueryParams} from '@skeleton/core-api';
import {useMemo} from 'react';
import {ColumnFiltersState, PaginationState, SortingState} from '@tanstack/react-table';
import {CollectionToolbarProps} from '../collection-toolbar';
import {UseQueryTable} from '../collection';

interface UseCollectionQueryProps<T, S = undefined> {
  pagination: PaginationState;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  sorting?: SortingState;
  filtersConfiguration?: Omit<CollectionToolbarProps<T>, 'table' | 'showColumnSelector'>;
  useQueryFn: UseQueryTable<T, S>;
  queryFields?: FieldQuery<T>;
  staticParams?: S;
  refetchInterval?: UseQueryOptions<ApiCollectionResponse<T>, ApiError>['refetchInterval'];
}

export function useCollectionQuery<T, Q = undefined>({
  pagination,
  globalFilter,
  columnFilters,
  sorting,
  filtersConfiguration,
  useQueryFn,
  queryFields,
  staticParams,
  refetchInterval,
}: UseCollectionQueryProps<T, Q>) {
  const filters = useMemo(() => {
    const filters: QueryParams = {};
    const textFilter = filtersConfiguration?.textFilter;
    if (textFilter !== undefined) {
      filters[textFilter.queryParamName] = globalFilter;
    }
    filtersConfiguration?.facetedFilters?.forEach((facetedFilter) => {
      filters[facetedFilter.queryParamName] = columnFilters.find(
        (columnFilter) => columnFilter.id === facetedFilter.columnId,
      )?.value;
    });
    return filters;
  }, [
    columnFilters,
    filtersConfiguration?.facetedFilters,
    filtersConfiguration?.textFilter,
    globalFilter,
  ]);

  const sort = useMemo(() => {
    if (sorting && sorting.length > 0) {
      const sortItem = sorting[0];
      return {
        field: sortItem.id as keyof T,
        direction: (sortItem.desc ? 'desc' : 'asc') as 'desc' | 'asc',
      };
    }
    return undefined;
  }, [sorting]);



  const { data } = useQueryFn(
    {
      offset: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
      filters,
      fields: queryFields,
      staticParams,
      sort: sort ? {
        field: sort.field,
        direction: sort.direction,
      }: undefined,
    },
    {
      placeholderData: keepPreviousData,
      refetchInterval,
    },
  );

  return {
    items: data?.data || [],
    totalCount: data?.pagination?.count || 0,
  };
}
