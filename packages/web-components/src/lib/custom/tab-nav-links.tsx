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
  /**
   * A page's tabs: the rule under them crosses the whole content area, edge to edge, whatever the
   * page's max-width. Leave it off for tabs nested inside a tab.
   */
  fullWidth?: boolean;
  className?: string;
};

export function TabNavLinks({ items, fullWidth = false, className }: TabNavLinksProps) {
  return (
    <div
      data-slot="tab-nav-links"
      className={cn(
        'flex items-start',
        fullWidth
          ? // The rule is painted past both sides by a shadow cut to its 1px height: painted overflow
            // never makes the page scroll sideways. The layout's main area clips it at its edges.
            "relative pb-px after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border after:shadow-[0_0_0_100vmax_var(--color-border)] after:[clip-path:inset(0_-100vmax)] after:content-['']"
          : 'border-b border-border',
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
        <div className="flex items-center justify-center px-3 py-2 rounded-md">
          <span className="label text-muted-foreground whitespace-nowrap">
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
          <div className="flex items-center justify-center px-3 py-2 rounded-md">
            <span
              className={cn(
                'label whitespace-nowrap transition-colors',
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
