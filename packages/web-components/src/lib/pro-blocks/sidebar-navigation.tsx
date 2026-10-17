'use client';

import {ChevronRight, type LucideIcon} from 'lucide-react';
import {NavLink} from 'react-router-dom';
import {cn} from '@skeleton/core-utils';

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
    icon?: LucideIcon;
    /**
     * Explicit active state. When set it replaces the router's prefix match
     * (so a parent item can stay inactive while a deeper item is active); for
     * collapsible parents it also opens the group by default.
     */
    isActive?: boolean;
    target?: string;
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
          item.items && item.items.length > 0 ? (
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
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                )}
              </NavLink>
            </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
