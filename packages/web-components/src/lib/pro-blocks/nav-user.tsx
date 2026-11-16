"use client";

import {CheckIcon, ChevronsUpDown} from 'lucide-react';
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem} from '../ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import {Avatar, AvatarFallback, AvatarImage} from '../ui/avatar';
import {ReactNode} from "react";
import {Link} from 'react-router-dom';

type NavItemLink = {
  type: 'link';
  title: string;
  to?: string;
  onClick?: () => void;
  icon?: ReactNode;
  /**
   * Makes the item one choice among its siblings (e.g. the theme in use): `true` draws a check on
   * the right and is announced as selected. Only for items with an `onClick`.
   */
  checked?: boolean;
}

type NavItemDropdown = {
  type: 'dropdown';
  title: string;
  icon?: ReactNode;
  items: NavItem[];
}

type NavItemSeparator = {
  type: 'separator';
}

export type NavItem = NavItemLink | NavItemDropdown | NavItemSeparator;

const NavItemRenderer = ({ item, index }: { item: NavItem; index: number }) => {
  if (item.type === 'separator') {
    return <DropdownMenuSeparator key={index} />;
  }

  if (item.type === 'link') {
    if(item.onClick) {
      return (
        <DropdownMenuItem
          key={index}
          onClick={item.onClick}
          {...(item.checked !== undefined && { role: 'menuitemradio', 'aria-checked': item.checked })}
        >
          {item.icon && <span className="mr-2 size-4">{item.icon}</span>}
          {item.title}
          {item.checked && <CheckIcon className="ml-auto size-4 text-foreground" aria-hidden />}
        </DropdownMenuItem>
      );
    }

    if(item.to) {
      return (
        <DropdownMenuItem key={index} asChild>
          <Link to={item.to} >
            {item.icon && <span className="mr-2 size-4">{item.icon}</span>}
            {item.title}
          </Link>
        </DropdownMenuItem>
      );
    }

    return (
      <DropdownMenuItem key={index}>
        {item.icon && <span className="mr-2 size-4">{item.icon}</span>}
        {item.title}
      </DropdownMenuItem>
    );
  }

  if (item.type === 'dropdown') {
    return (
      <DropdownMenuSub key={index}>
        <DropdownMenuSubTrigger>
          {item.icon && <span className="mr-2 size-4">{item.icon}</span>}
          {item.title}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          {item.items.map((subItem, subIndex) => (
            <NavItemRenderer key={subIndex} item={subItem} index={subIndex} />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  return null;
};

export function NavUser({
  user,
  items,
}: {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  items?: NavItem[];
}) {

  const getInitials = () => {
    const names = user.name.split(" ");

    return names.map((n) => n.charAt(0).toUpperCase()).join("");
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : (
                    <AvatarFallback className="rounded-lg">{getInitials()}</AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left body-dense">
                <span className="truncate label-dense">{user.name}</span>
                <span className="truncate body-sm text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          {/* Above the trigger, from its left and 4px off it: the workspace switcher's menu, mirrored. As wide
              as the sidebar (16rem) less 8px each side; it is portalled, out of reach of --sidebar-width. */}
          <DropdownMenuContent
            className="w-60"
            side="top"
            align="start"
            sideOffset={4}
          >
            {/* No user header: the trigger, right under the menu, already shows who it is. */}
            {items && items.length > 0 && (
              <>
                {items.map((item, index) => (
                  <NavItemRenderer key={index} item={item} index={index} />
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
