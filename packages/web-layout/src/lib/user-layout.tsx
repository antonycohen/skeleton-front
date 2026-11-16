import {Link, Outlet} from 'react-router-dom';
import {
  Button,
  NavItem,
  NavUser,
  readSidebarCookie,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarNavigation,
  SidebarNavigationProps,
  SidebarProvider,
  TeamSwitcher,
  TeamSwitcherProps,
} from '@skeleton/web-components';
import {User} from '@skeleton/core-api-models';
import {useTranslation} from '@skeleton/core-translations';
import {ArrowLeftIcon} from "lucide-react";
import {ReactNode} from "react";
import {SidebarVisibilityProvider, useSidebarVisibility} from './sidebar-visibility';

type LayoutProps = {
  connectedUser: User;
  mainNavigationGroups?: SidebarNavigationProps[];
  workspaces?: TeamSwitcherProps;
  settingsUrl?: string;
  /**
   * Groups listed after the main ones (Support): they scroll with them, so a small screen keeps
   * the plan card and the user menu in view; on the icon rail too, they follow the main ones.
   */
  secondaryNavigationGroups?: SidebarNavigationProps[];
  cardPlan?: ReactNode;
  navUserItems?: NavItem[]
  backLink?: string;
  headerAction?: ReactNode;
  version?: string;
  /** Rendered full-width above the page content (e.g. past-due invoice warning). */
  banner?: ReactNode;
};

/**
 * While one of the sidebar's menus is open (the workspace switcher, the user menu), the rest of the
 * sidebar steps back: the menu is modal, a click there only closes it. The part holding the open
 * trigger stays as it is, so the menu still shows where it came from. Parts marked `data-sidebar-dim`.
 */
const DIM_WHILE_MENU_OPEN =
  '[&_[data-sidebar-dim]]:transition-opacity [&_[data-sidebar-dim]]:duration-150 ' +
  '[&:has([data-slot=dropdown-menu-trigger][data-state=open])_[data-sidebar-dim]:not(:has([data-slot=dropdown-menu-trigger][data-state=open]))]:opacity-40';

export function UserLayout(props: LayoutProps) {
  return (
    <SidebarVisibilityProvider>
      <UserLayoutShell {...props} />
    </SidebarVisibilityProvider>
  );
}

function UserLayoutShell(props: LayoutProps) {
  const {
    connectedUser,
    mainNavigationGroups,
    workspaces,
    secondaryNavigationGroups = [],
    cardPlan,
    navUserItems = [],
    backLink,
    headerAction,
    version,
    banner,
  } = props;
  // A view can take the whole screen (useHiddenSidebar): the sidebar is then
  // not rendered at all, so its spacer column goes too.
  const {hidden: sidebarHidden} = useSidebarVisibility();
  const {t} = useTranslation();

  return (
    <div>
      <SidebarProvider defaultOpen={readSidebarCookie()}>
        {!sidebarHidden && (
        <Sidebar collapsible="icon" className={`sidebar-height ${DIM_WHILE_MENU_OPEN}`}>
          {/* 52px like the navbar, so the switcher and the pen sit on the
              same line as the sidebar toggle and the breadcrumb. */}
          <SidebarHeader className="min-h-13 justify-center gap-0 p-0 group-data-[collapsible=icon]:px-2">
            {backLink && (
              <div data-sidebar-dim className={'m-2 group-data-[collapsible=icon]:mx-0'}>
                <Link to={backLink}>
                  <Button variant={'outline'} size={'icon'} className="group-data-[collapsible=icon]:size-8 size-auto px-2 py-1">
                    <ArrowLeftIcon />
                    <span className="group-data-[collapsible=icon]:hidden">{t('common.back')}</span>
                  </Button>
                </Link>
              </div>
            )}
            <div className="flex h-13 items-center">
              <div data-sidebar-dim className="flex min-w-0 flex-1 items-center">
                {workspaces && <TeamSwitcher {...workspaces} />}
              </div>
              {headerAction && (
                <div data-sidebar-dim className="flex size-13 shrink-0 items-center justify-center group-data-[collapsible=icon]:hidden">
                  {headerAction}
                </div>
              )}
            </div>
          </SidebarHeader>
          <SidebarContent data-sidebar-dim>
            {mainNavigationGroups &&
              mainNavigationGroups.map((navGroup, index) => (
                <div className='mx-2 group-data-[collapsible=icon]:mx-0'  key={index}>
                  <SidebarNavigation {...navGroup} />
                </div>
              ))}
            {secondaryNavigationGroups.map((navGroup, index) => (
              <div className='mx-2 group-data-[collapsible=icon]:mx-0' key={index}>
                <SidebarNavigation {...navGroup} />
              </div>
            ))}
          </SidebarContent>
          <SidebarFooter className={'p-0'}>
            <div data-sidebar-dim className={'p-2 pt-0 gap-2 flex flex-col'}>
              {cardPlan}
              {version && (
                <span className="body-sm text-muted-foreground text-center group-data-[collapsible=icon]:hidden">
                  {t('layout.version', {version})}
                </span>
              )}
              <NavUser
                user={{
                  name:
                    `${connectedUser?.firstName || ''} ${connectedUser?.lastName || ''}`.trim() ||
                    t('layout.guestUser'),
                  avatar: connectedUser?.profileImage?.url ?? undefined,
                  email: connectedUser?.email || '',
                }}
                items={navUserItems}
              />

            </div>
          </SidebarFooter>
        </Sidebar>
        )}
        <SidebarInset>
          {banner}
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
