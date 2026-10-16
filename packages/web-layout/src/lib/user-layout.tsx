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
  SidebarRail,
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
  footerNavigationGroups?: SidebarNavigationProps[];
  cardPlan?: ReactNode;
  navUserItems?: NavItem[]
  backLink?: string;
  headerAction?: ReactNode;
  version?: string;
  /** Rendered full-width above the page content (e.g. past-due invoice warning). */
  banner?: ReactNode;
};

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
    footerNavigationGroups = [],
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
        <Sidebar collapsible="icon" className="sidebar-height">
          {/* 52px like the navbar, so the switcher and the pen sit on the
              same line as the sidebar toggle and the breadcrumb. */}
          <SidebarHeader className="min-h-13 justify-center gap-0 p-0 group-data-[collapsible=icon]:px-2">
            {backLink && (
              <div className={'m-2 group-data-[collapsible=icon]:mx-0'}>
                <Link to={backLink}>
                  <Button variant={'outline'} size={'icon'} className="group-data-[collapsible=icon]:size-8 size-auto px-2 py-1">
                    <ArrowLeftIcon />
                    <span className="group-data-[collapsible=icon]:hidden">{t('common.back')}</span>
                  </Button>
                </Link>
              </div>
            )}
            <div className="flex h-13 items-center">
              <div className="flex min-w-0 flex-1 items-center">
                {workspaces && <TeamSwitcher {...workspaces} />}
              </div>
              {headerAction && (
                <div className="flex size-13 shrink-0 items-center justify-center group-data-[collapsible=icon]:hidden">
                  {headerAction}
                </div>
              )}
            </div>
          </SidebarHeader>
          <SidebarContent>
            {mainNavigationGroups &&
              mainNavigationGroups.map((navGroup, index) => (
                <div className='mx-2 group-data-[collapsible=icon]:mx-0'  key={index}>
                  <SidebarNavigation {...navGroup} />
                </div>
              ))}
          </SidebarContent>
          <SidebarFooter className={'p-0'}>
            {footerNavigationGroups &&
              footerNavigationGroups.map((navGroup, index) => (
                <div className='mx-2 group-data-[collapsible=icon]:mx-0'  key={index}>
                  <SidebarNavigation
                    sectionName={navGroup.sectionName}
                    items={navGroup.items}
                  />
                </div>
              ))}
            <div className={'p-2 pt-0 gap-2 flex flex-col'}>
              {cardPlan}
              {version && (
                <span className="text-xs text-muted-foreground text-center group-data-[collapsible=icon]:hidden">
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
          <SidebarRail />
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
