'use client';

import type {ComponentType, SVGProps} from 'react';
import {ChevronRight, type LucideIcon} from 'lucide-react';
import {NavLink} from 'react-router-dom';
import {cn} from '@skeleton/core-utils';

import {DotStatus, type DotStatusVariant} from '../custom/dot-status';
import {Collapsible, CollapsibleContent, CollapsibleTrigger,} from '../ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '../ui/sidebar';

export type SidebarNavigationProps = {
  sectionName?: string;
  /** Hide the whole group when the sidebar is collapsed to its icon rail (e.g. icon-less lists). */
  hiddenWhenCollapsed?: boolean;
  items: {
    title: string;
    url: string;
    /** A Lucide icon, or any other SVG icon component. */
    icon?: LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;
    /**
     * Explicit active state. When set it replaces the router's prefix match
     * (so a parent item can stay inactive while a deeper item is active); for
     * collapsible parents it also opens the group by default.
     */
    isActive?: boolean;
    /** A status dot in the icon's place (e.g. a recent item's status), for items without an icon. */
    status?: { variant: DotStatusVariant; label: string };
    target?: string;
    /**
     * With sub-items: `true` (default) folds them under the item, which then only opens and closes
     * them; `false` lists them under it for good, the item staying a link to its own page (a section
     * and what its pages are built from, e.g. Accounts › Segments). Listed, they are left out of the
     * icon rail.
     */
    collapsible?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
};

export function SidebarNavigation({
  sectionName,
  hiddenWhenCollapsed = false,
  items,
}: SidebarNavigationProps) {
  return (
    <SidebarGroup className={cn(hiddenWhenCollapsed && 'group-data-[collapsible=icon]:hidden')}>
      {sectionName && <SidebarGroupLabel>{sectionName}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item, index) =>
          item.items && item.items.length > 0 && item.collapsible !== false ? (
            <Collapsible
              key={index}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.url}>
                        {/* The button renders as the link itself (an <a> can't nest another <a>);
                            NavLink flags the active route with aria-current="page". */}
                        <SidebarMenuSubButton
                          asChild
                          className="aria-[current=page]:bg-sidebar-accent aria-[current=page]:text-sidebar-accent-foreground"
                        >
                          <NavLink to={subItem.url} target={item.target}>
                            <span>{subItem.title}</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.url}>
              <NavLink to={item.url} target={item.target}>
                {({ isActive: routeActive }) => (
                  <SidebarMenuButton tooltip={item.title} isActive={item.isActive ?? routeActive}>
                    {item.icon && <item.icon />}
                    {!item.icon && item.status && (
                      <span className="flex size-4 shrink-0 items-center justify-center">
                        <DotStatus variant={item.status.variant} label={item.status.label} />
                      </span>
                    )}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                )}
              </NavLink>
              {/* Listed sub-items (collapsible: false): buttons as the others, their label 10px further
                  in than the item's, an elbow from its icon to each. Folded away on the icon rail as the
                  sidebar folds (200ms, linear), the rows under them moving up with it rather than
                  jumping; hidden once folded, out of the tab order. */}
              {item.items && item.items.length > 0 && (
                <div className="pointer-events-none -mt-0.5 grid grid-rows-[1fr] transition-[grid-template-rows,margin,opacity,visibility] duration-200 ease-linear group-data-[collapsible=icon]:invisible group-data-[collapsible=icon]:-mt-1 group-data-[collapsible=icon]:grid-rows-[0fr] group-data-[collapsible=icon]:opacity-0">
                  {/* Clipped as it folds. It starts 2px up, in the item's row, so the first elbow's top
                      isn't clipped (4px above its sub-item, 2px apart as every row); folded, its 4px
                      of padding go back under the item (-mt-1), the rail's rows as close as ever. Only
                      the sub-items take the pointer. */}
                  <SidebarMenu className="min-h-0 overflow-hidden pt-1">
                    {item.items.map((subItem, subIndex, subItems) => (
                      <SidebarMenuItem key={subItem.url} className="pointer-events-auto">
                        <NavLink to={subItem.url} target={item.target}>
                          {({ isActive: routeActive }) => (
                            <SidebarMenuButton isActive={routeActive} className="pl-10.5">
                              <span>{subItem.title}</span>
                            </SidebarMenuButton>
                          )}
                        </NavLink>
                        {/* Under the item's icon (16px in), down to the row's middle, then right: as
                            wide as it is high (20px), 6px short of the label. Muted rather than the
                            sidebar's border, which is the active row's background. */}
                        <span
                          aria-hidden
                          className={cn(
                            'pointer-events-none absolute left-4 w-5 rounded-bl-md border-b border-l border-muted-foreground/40',
                            subIndex === 0 ? '-top-1 h-5' : 'top-0 h-4',
                          )}
                        />
                        {/* On to the next sub-item, from the elbow's bend (no stroke drawn twice). */}
                        {subIndex < subItems.length - 1 && (
                          <span aria-hidden className="pointer-events-none absolute top-2.5 -bottom-0.5 left-4 border-l border-muted-foreground/40" />
                        )}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </div>
              )}
            </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
