"use client";

import {ChevronsUpDown} from 'lucide-react';
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar} from '../ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
        <DropdownMenuItem key={index} onClick={item.onClick}>
          {item.icon && <span className="mr-2 size-4">{item.icon}</span>}
          {item.title}
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
  const { isMobile } = useSidebar();

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
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            {items && items.length > 0 && (
              <>
                <DropdownMenuSeparator />
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
