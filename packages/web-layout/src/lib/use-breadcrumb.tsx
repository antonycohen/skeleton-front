import {Fragment} from 'react';
import {
  Breadcrumb,
  BreadcrumbItem as BreadcrumbItemComponent,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@skeleton/web-components';
import {cn} from '@skeleton/core-utils';
import { Link } from 'react-router-dom';

export type BreadcrumbItemConfig = {
  label: string;
  to?: string;
};

/**
 * The navbar breadcrumb: the root is the current section, the last item is
 * the page. On mobile only the last item shows.
 */
export function useBreadcrumb(items: BreadcrumbItemConfig[], endWithSeparator = false) {
  if (items.length === 0) return null;

  return (
    <Breadcrumb className="min-w-0 px-2">
      <BreadcrumbList className="flex-nowrap gap-1.5 font-medium sm:gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={index}>
              <BreadcrumbItemComponent className={cn('min-w-0', !isLast && 'hidden md:inline-flex')}>
                {isLast && !item.to ? (
                  <BreadcrumbPage className="truncate font-medium">{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link className="truncate" to={item.to || '#'}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItemComponent>
              {(!isLast || endWithSeparator) && (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
