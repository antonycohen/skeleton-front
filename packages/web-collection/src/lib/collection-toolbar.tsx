'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { Button, InputGroup, InputGroupAddon, InputGroupInput } from '@skeleton/web-components';
import { SearchIcon } from 'lucide-react';
import { ObjectDotNotation } from '@skeleton/core-utils';
import { useTranslation } from '@skeleton/core-translations';
import {
  CollectionFacetedFilter,
  CollectionFacetedFilterProps,
} from './collection-faceted-filter';
import { CollectionViewOptions } from './collection-view-options';

interface FacetedFilterConfiguration<TData>
  extends Omit<CollectionFacetedFilterProps<TData, unknown>, 'column'> {
  columnId: ObjectDotNotation<TData>;
  queryParamName: string;
}

interface TextFilterConfiguration {
  placeholder: string;
  queryParamName: string;
}

export interface CollectionToolbarProps<TData> {
  table: Table<TData>;
  showColumnSelector: boolean;
  textFilter?: TextFilterConfiguration;
  facetedFilters?: FacetedFilterConfiguration<TData>[];
  actions?: React.ReactNode;
}

export function CollectionToolbar<TData>({
  table,
  showColumnSelector,
  textFilter,
  facetedFilters,
  actions,
}: CollectionToolbarProps<TData>) {
  const { t } = useTranslation();
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        {textFilter && (
          <InputGroup className="w-[280px]">
            <InputGroupAddon align="inline-start">
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder={textFilter.placeholder}
              value={
                (table.getState().globalFilter as string) ?? ''
              }
              onChange={(event) =>
                table.setGlobalFilter(event.target.value)
              }
            />
          </InputGroup>
        )}
        {facetedFilters && facetedFilters.length > 0 && (
          <div className="flex gap-x-2">
            {facetedFilters.map((filterConfig) => {
              const column = table.getColumn(filterConfig.columnId);
              return column ? (
                <CollectionFacetedFilter
                  key={filterConfig.columnId}
                  column={column}
                  title={filterConfig.title}
                  options={filterConfig.options}
                />
              ) : null;
            })}
          </div>
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            {t('collection.toolbar.reset')}
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
        <div className="text-muted-foreground text-sm font-normal leading-5 line-clamp-1">
          {t('collection.toolbar.results', { count: table.getRowCount() })}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {showColumnSelector && <CollectionViewOptions table={table} />}
        {actions}
      </div>
    </div>
  );
}
