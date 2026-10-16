'use client';

import {NavLink} from 'react-router-dom';
import {cn} from '@skeleton/core-utils';

export type TabNavLinkItem = {
  title: string;
  url: string;
  disabled?: boolean;
  /** Stay active on nested routes (e.g. a tab that itself has sub-tabs). Defaults to exact matching. */
  matchNested?: boolean;
};

export type TabNavLinksProps = {
  items: TabNavLinkItem[];
  className?: string;
};

export function TabNavLinks({ items, className }: TabNavLinksProps) {
  return (
    <div
      className={cn(
        'flex items-start border-b border-border px-3',
        className
      )}
    >
      <div className="flex items-center">
        {items.map((item) => (
          <TabNavLink key={item.url} item={item} />
        ))}
      </div>
    </div>
  );
}

type TabNavLinkProps = {
  item: TabNavLinkItem;
};

function TabNavLink({ item }: TabNavLinkProps) {
  if (item.disabled) {
    return (
      <div
        className="flex items-center justify-center py-1.5 opacity-50 cursor-not-allowed"
      >
        <div className="flex items-center justify-center px-2.5 py-2 rounded-md">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {item.title}
          </span>
        </div>
      </div>
    );
  }

  return (
    <NavLink to={item.url} end={!item.matchNested}>
      {({ isActive }) => (
        <div
          className={cn(
            'flex items-center justify-center py-1.5',
            {
              'border-b-2 border-primary' : isActive,
              'border-b-2 border-transparent' : !isActive,
            }
          )}
        >
          <div className="flex items-center justify-center px-2.5 py-2 rounded-md">
            <span
              className={cn(
                'text-sm font-medium whitespace-nowrap transition-colors',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-accent-foreground'
              )}
            >
              {item.title}
            </span>
          </div>
        </div>
      )}
    </NavLink>
  );
}
