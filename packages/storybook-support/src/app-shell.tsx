import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { addons } from 'storybook/preview-api';
import { UPDATE_GLOBALS } from 'storybook/internal/core-events';
import {
  BookOpenIcon,
  CircleUserIcon,
  ContrastIcon,
  CreditCardIcon,
  GalleryVerticalEnd,
  House,
  KeyRoundIcon,
  LifeBuoyIcon,
  LogOutIcon,
  ShieldCheckIcon,
  SparklesIcon,
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

const THEMES = [
  { value: 'light', title: 'Light' },
  { value: 'dark', title: 'Dark' },
  { value: 'system', title: 'System' },
] as const;
type ThemeChoice = (typeof THEMES)[number]['value'];

const isDark = () => document.documentElement.classList.contains('dark');

/**
 * The app's Appearance menu (next-themes there), here on Storybook's theme toolbar (addon-themes,
 * the `dark` class on <html>): a choice sets the toolbar, and a toolbar change shows in the menu.
 * "System" follows the computer's setting at the time it's picked; the toolbar knows light and dark only.
 */
function useStorybookTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(() => (isDark() ? 'dark' : 'light'));
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setChoice((current) => (current === 'system' ? current : isDark() ? 'dark' : 'light')),
    );
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  const setTheme = (value: ThemeChoice) => {
    const resolved = value === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : value;
    setChoice(value);
    addons.getChannel().emit(UPDATE_GLOBALS, { globals: { theme: resolved } });
  };
  return { theme: choice, setTheme };
}

/** As the app's useUserNavigation, less Invite member: it is the workspace's, in its menu. */
function useUserNavigation(base: string): NavItem[] {
  const { theme, setTheme } = useStorybookTheme();
  return [
    { type: 'link', title: 'Profile', to: `${base}/account/profile`, icon: <CircleUserIcon /> },
    {
      type: 'dropdown',
      title: 'Appearance',
      icon: <ContrastIcon />,
      items: THEMES.map(({ value, title }) => ({
        type: 'link',
        title,
        checked: theme === value,
        onClick: () => setTheme(value),
      })),
    },
    { type: 'separator' },
    { type: 'link', title: 'Sign out', to: '/logout', icon: <LogOutIcon /> },
  ];
}

function SettingsShell({ base }: { base: string }) {
  const settings = `${base}/settings`;
  const userNavItems = useUserNavigation(settings);
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
      navUserItems={userNavItems}
      mainNavigationGroups={[{ sectionName: 'Settings', items }]}
      version={__APP_VERSION__}
    />
  );
}

function WorkspaceShell({ base, navigation }: { base: string; navigation?: ShellNavigationItem[] }) {
  const organization = useCurrentOrganization();
  const userNavItems = useUserNavigation(base);

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
      navUserItems={userNavItems}
      connectedUser={connectedUser}
      workspaces={{
        selectedWorkspaceId: organization.id ?? undefined,
        // The plan's usage is the workspace's (its quotas), so in its menu rather than above the user;
        // flat in the menu, no card of its own.
        content: (
          <div className="[&>[data-slot=card-plan]]:rounded-none [&>[data-slot=card-plan]]:border-0 [&>[data-slot=card-plan]]:bg-transparent [&>[data-slot=card-plan]]:p-2">
            <SubscriptionPlanCard inMenu />
          </div>
        ),
        settingsUrl: `${base}/settings`,
        inviteUrl: `${base}/settings/teams`,
        workspaces: [workspaces.default, workspaces.other].map((w) => ({
          id: w.id as string,
          name: w.name as string,
          logo: GalleryVerticalEnd,
          urlPrefix: `/w/${w.id}/`,
        })),
      }}
      mainNavigationGroups={[{ items: mainNavigation }]}
      secondaryNavigationGroups={[{ sectionName: 'Support', items: supportNavigation }]}
    />
  );
}
