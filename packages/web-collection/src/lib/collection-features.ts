import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_equals,
  globalFilteringFeature,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  type CellData,
  type Column,
  type ColumnDef,
  type ReactTable,
  type Row,
  type RowData,
} from '@tanstack/react-table';

/** What a column says about itself beyond its data, in `columnDef.meta`. */
export interface CollectionColumnMeta {
  className?: string;
  /** The column's name in the "View" menu (its id otherwise). */
  label?: string;
}

/**
 * The table features every collection registers (TanStack Table v9 bundles only what a table
 * names). Filtering, sorting and pagination are the API's: the table runs them in manual mode.
 */
export const collectionFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnFacetingFeature,
  columnVisibilityFeature,
  columnSizingFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  filterFns: { equals: filterFn_equals },
  columnMeta: metaHelper<CollectionColumnMeta>(),
});

export type CollectionFeatures = typeof collectionFeatures;

/** A column of a `Collection` listing `T`s. */
export type CollectionColumnDef<T extends RowData, TValue extends CellData = CellData> = ColumnDef<
  CollectionFeatures,
  T,
  TValue
>;
export type CollectionTable<T extends RowData> = ReactTable<CollectionFeatures, T>;
export type CollectionColumn<T extends RowData, TValue extends CellData = CellData> = Column<
  CollectionFeatures,
  T,
  TValue
>;
export type CollectionRow<T extends RowData> = Row<CollectionFeatures, T>;
