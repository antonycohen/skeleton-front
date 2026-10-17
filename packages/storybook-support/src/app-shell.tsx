import { useLocation } from 'react-router-dom';
import {
  BookOpenIcon,
  CircleUserIcon,
  CreditCardIcon,
  GalleryVerticalEnd,
  House,
  KeyRoundIcon,
  LifeBuoyIcon,
  LogOutIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserPlusIcon,
  UserRoundIcon,
  type LucideIcon,
} from 'lucide-react';
import { UserLayout } from '@skeleton/web-layout';
import type { NavItem } from '@skeleton/web-components';
import { useCurrentOrganization } from '@skeleton/core-workspace';
import {
  CheckoutSucceedModal,
  PastDueInvoiceBanner,
  PaywallProRequiredModal,
  SubscriptionPlanCard,
} from '@skeleton/web-feature-payment';
import { connectedUser, workspaces } from './fixtures/session';

/** A story's own main menu (`parameters.screen.navigation`), in place of the default one. */
export type ShellNavigationItem = { title: string; path: string; icon: LucideIcon };

/**
 * The signed-in shell (sidebar, workspace switcher, plan card), built like
 * `apps/skeleton-app/src/app/routes/workspace-routes.tsx` but with static navigation: the app's own
 * navigation hooks live in the app and cannot be imported. The story renders in its `<Outlet/>`.
 * Under `settings/` it becomes the settings shell, as in `workspace-settings-routes.tsx`. Both mount the
 * paywall and checkout modals (opened by the address hash), as the app does.
 */
export function AppShell({ navigation }: { navigation?: ShellNavigationItem[] }) {
  const organization = useCurrentOrganization();
  const base = `/w/${organization.id}`;
  const { pathname } = useLocation();
  return (
    <>
      {pathname.startsWith(`${base}/settings`) ? (
        <SettingsShell base={base} />
      ) : (
        <WorkspaceShell base={base} navigation={navigation} />
      )}
      <PaywallProRequiredModal />
      <CheckoutSucceedModal />
    </>
  );
}

const userNavigation = (base: string, suffix = ''): NavItem[] => [
  { type: 'link', title: 'Profile', to: `${base}${suffix}/account/profile`, icon: <CircleUserIcon /> },
  { type: 'link', title: 'Invite member', to: `${base}/settings/teams`, icon: <UserPlusIcon /> },
  { type: 'separator' },
  { type: 'link', title: 'Sign out', to: '/logout', icon: <LogOutIcon /> },
];

function SettingsShell({ base }: { base: string }) {
  const settings = `${base}/settings`;
  const items = [
    { title: 'Teams', url: `${settings}/teams`, icon: UserRoundIcon },
    { title: 'Security', url: `${settings}/security`, icon: ShieldCheckIcon },
    { title: 'Service accounts', url: `${settings}/service-accounts`, icon: KeyRoundIcon },
    { title: 'Billing', url: `${settings}/billing`, icon: CreditCardIcon },
  ];
  return (
    <UserLayout
      banner={<PastDueInvoiceBanner />}
      backLink={`${base}/dashboard`}
      connectedUser={connectedUser}
      navUserItems={userNavigation(base, '/settings')}
      mainNavigationGroups={[{ sectionName: 'Settings', items }]}
      version={__APP_VERSION__}
    />
  );
}

function WorkspaceShell({ base, navigation }: { base: string; navigation?: ShellNavigationItem[] }) {
  const organization = useCurrentOrganization();

  const mainNavigation = navigation
    ? navigation.map((item) => ({ title: item.title, url: `${base}/${item.path}`, icon: item.icon }))
    : [
        { title: 'Dashboard', url: `${base}/dashboard`, icon: House },
        { title: 'Assistant', url: `${base}/assistant`, icon: SparklesIcon },
      ];

  const supportNavigation = [
    { title: 'Documentation', icon: BookOpenIcon, url: import.meta.env['VITE_DOCUMENTATION_URL'], target: '_tab' },
    { title: 'Message support', icon: LifeBuoyIcon, url: `mailto:${import.meta.env['VITE_SUPPORT_EMAIL']}`, target: '_tab' },
  ];

  return (
    <UserLayout
      banner={<PastDueInvoiceBanner />}
      cardPlan={<SubscriptionPlanCard />}
      navUserItems={userNavigation(base)}
      connectedUser={connectedUser}
      workspaces={{
        selectedWorkspaceId: organization.id ?? undefined,
        settingsUrl: `${base}/settings`,
        workspaces: [workspaces.default, workspaces.other].map((w) => ({
          id: w.id as string,
          name: w.name as string,
          logo: GalleryVerticalEnd,
          urlPrefix: `/w/${w.id}/`,
        })),
      }}
      mainNavigationGroups={[{ items: mainNavigation }]}
      footerNavigationGroups={[{ sectionName: 'Support', items: supportNavigation }]}
    />
  );
}
