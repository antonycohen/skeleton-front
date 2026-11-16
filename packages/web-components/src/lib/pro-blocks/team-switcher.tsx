'use client';

import * as React from 'react';
import {useMemo, useState} from 'react';
import {CheckIcon, ChevronsUpDown, GalleryVerticalEnd, MonitorCheckIcon, MonitorIcon, Plus, Settings, UserPlusIcon} from 'lucide-react';
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem} from '../ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {Command, CommandEmpty, CommandItem, CommandList} from '../ui/command';
import {Link, NavLink, useNavigate} from 'react-router-dom';
import {useTranslation} from '@skeleton/core-translations';

export type TeamSwitcherProps = {
  selectedWorkspaceId?: string;
  onAddWorkspace?: () => void;
  settingsUrl?: string;
  /** Under Settings: inviting someone opens this workspace to them, so it belongs to its menu. */
  inviteUrl?: string;
  /**
   * Rendered above the workspace list in the switch submenu, which then becomes
   * a cmdk `Command` (keyboard: arrows + Enter) — pass a `CommandInput`. The
   * switcher stays presentation-only: the parent owns the input and narrows
   * `workspaces` to the matching entries (e.g. via a remote search).
   */
  searchInput?: React.ReactNode;
  /**
   * The workspace shown on the trigger when `selectedWorkspaceId` is not in
   * `workspaces` — the list may be a filtered subset (remote search) or still
   * loading.
   */
  activeWorkspace?: {
    name: string;
    logo: React.ElementType;
  };
  /**
   * Total number of workspaces the list was drawn from. When it exceeds
   * `workspaces.length`, a "Showing X of Y" hint tells the user the list is
   * truncated.
   */
  totalCount?: number;
  /** After Settings and Invite, before the other workspaces: what belongs to the workspace shown, as its plan's usage. */
  content?: React.ReactNode;
  workspaces: {
    name: string;
    logo: React.ElementType;
    id: string;
    urlPrefix: string;
  }[];
};

export function TeamSwitcher({
  selectedWorkspaceId,
  onAddWorkspace,
  settingsUrl,
  inviteUrl,
  searchInput,
  activeWorkspace,
  totalCount,
  content,
  workspaces,
}: TeamSwitcherProps) {
  const navigate = useNavigate();
  const {t} = useTranslation();
  // Controlled so a keyboard selection in the cmdk list (Enter on a
  // CommandItem, which is not a Radix menu item) can close the menu.
  const [open, setOpen] = useState(false);

  const activeTeam = useMemo(() => {
    return (
      workspaces.find((team) => team.id === selectedWorkspaceId) ||
      activeWorkspace ||
      workspaces[0]
    );
  }, [selectedWorkspaceId, activeWorkspace, workspaces]);

  const ActiveLogo = activeTeam?.logo ?? GalleryVerticalEnd;

  const workspaceRow = (team: TeamSwitcherProps['workspaces'][number]) => (
    <>
      <div className="flex size-6 items-center justify-center rounded-sm border">
        <team.logo className="w-6 h-6 relative rounded-lg" />
      </div>
      <span className="flex-1">{team.name}</span>
      {selectedWorkspaceId === team.id && (<CheckIcon className="text-foreground" />)}
    </>
  );

  const truncationHint = totalCount !== undefined && totalCount > workspaces.length && (
    <div className="px-2 py-1.5 body-sm text-muted-foreground">
      {t('components.teamSwitcher.truncated', {count: workspaces.length, total: totalCount})}
    </div>
  );

  return (
    // 8px off the screen's edge, as the navigation's groups (mx-2); the icon rail centres it itself.
    <SidebarMenu className="pl-2 group-data-[collapsible=icon]:pl-0">
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <ActiveLogo className="size-4" />
              </div>
              <div className="grid flex-1 text-left body-dense">
                <span className="truncate label-dense">
                  {activeTeam?.name ?? t('components.teamSwitcher.workspace')}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-60"
            // From the trigger's left, 8px off the screen's edge; as wide as the sidebar (16rem) less 8px
            // each side (portalled, it can't read --sidebar-width). Aligned on its end, it ran off the screen.
            align="start"
            side={'bottom'}
            sideOffset={4}
          >
            {/* As Lovable's and Toggl's: the workspace's own actions, then its usage, then the other
                workspaces (switch, manage, create) as one group. */}
            {settingsUrl && (
              <DropdownMenuItem asChild>
                <Link to={settingsUrl}>
                  <Settings className="size-4" />
                  {t('components.teamSwitcher.settings')}
                </Link>
              </DropdownMenuItem>
            )}
            {inviteUrl && (
              <DropdownMenuItem asChild>
                <Link to={inviteUrl}>
                  <UserPlusIcon className="size-4" />
                  {t('components.teamSwitcher.invite')}
                </Link>
              </DropdownMenuItem>
            )}
            {(settingsUrl || inviteUrl) && <DropdownMenuSeparator />}
            {content && (
              <>
                {content}
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <MonitorIcon />
                {t('components.teamSwitcher.switch')}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className={'min-w-[224px]'}>
                  {searchInput ? (
                    // Keydown must not bubble to the menu (Radix's typeahead
                    // and arrow handling would fight cmdk's), except Escape so
                    // the menu still closes.
                    <div
                      onKeyDown={(e) => {
                        if (e.key !== 'Escape') e.stopPropagation();
                      }}
                    >
                      {/* Filtering is the parent's job (remote search). */}
                      <Command shouldFilter={false}>
                        {searchInput}
                        <CommandList>
                          <CommandEmpty>{t('components.teamSwitcher.empty')}</CommandEmpty>
                          {workspaces.map((team) => (
                            <CommandItem
                              key={team.id}
                              value={team.id}
                              className="gap-2 p-2"
                              onSelect={() => {
                                setOpen(false);
                                navigate(team.urlPrefix);
                              }}
                            >
                              {workspaceRow(team)}
                            </CommandItem>
                          ))}
                        </CommandList>
                        {truncationHint}
                      </Command>
                    </div>
                  ) : (
                    <>
                      {workspaces.map((team) => (
                        <DropdownMenuItem
                          key={team.id}
                          className="gap-2 p-2 min-w-"
                          asChild
                        >
                          <Link
                            to={team.urlPrefix}
                            className="flex items-center gap-2 w-full"
                          >
                            {workspaceRow(team)}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      {truncationHint}
                    </>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
              <DropdownMenuItem className="gap-2">
                <MonitorCheckIcon className="size-4" />
                <NavLink to={`/w/${selectedWorkspaceId}/workspaces`} className="text-foreground">
                  {t('components.teamSwitcher.manage')}
                </NavLink>
              </DropdownMenuItem>
            </DropdownMenuSub>
            <DropdownMenuItem className="gap-2">
              <Plus className="size-4" />
              <div className="text-foreground" onClick={onAddWorkspace}>
                {t('components.teamSwitcher.create')}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
