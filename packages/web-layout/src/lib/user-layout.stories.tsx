import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link, Route, Routes } from 'react-router-dom';
import {
  BookOpenIcon,
  CircleUserIcon,
  GalleryVerticalEnd,
  House,
  LifeBuoyIcon,
  LogOutIcon,
  PenSquareIcon,
  PlusIcon,
  SparklesIcon,
  UserPlusIcon,
  UsersIcon,
} from 'lucide-react';
import { Button, Card, CardDescription, CardHeader, CardTitle, type NavItem } from '@skeleton/web-components';
import { OTHER_WORKSPACE_ID, WORKSPACE_ID, connectedUser, workspaces } from '@skeleton/storybook-support';
import { UserLayout } from './user-layout';
import { LayoutTopbar } from './layout-top-bar';
import { LayoutContent } from './layout-content';
import { LayoutHeader } from './layout-header';
import { useBreadcrumb } from './use-breadcrumb';

const BASE = `/w/${WORKSPACE_ID}`;

const navUserItems: NavItem[] = [
  { type: 'link', title: 'Profile', to: `${BASE}/account/profile`, icon: <CircleUserIcon /> },
  { type: 'link', title: 'Invite member', to: `${BASE}/settings/teams`, icon: <UserPlusIcon /> },
  { type: 'separator' },
  { type: 'link', title: 'Sign out', to: '/logout', icon: <LogOutIcon /> },
];

/** Stands in for the payment package's plan card. */
function PlanCardPlaceholder() {
  return (
    <div className="rounded-lg border bg-background p-3 text-xs group-data-[collapsible=icon]:hidden">
      <div className="font-medium text-foreground">Pro plan</div>
      <div className="mt-1 text-muted-foreground">420 / 500 AI messages</div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-[84%] rounded-full bg-primary" />
      </div>
    </div>
  );
}

/** What the outlet shows: a teams page. */
function TeamsPage() {
  const breadcrumbs = useBreadcrumb([{ label: 'Teams', to: `${BASE}/teams` }], true);
  return (
    <div>
      <header className="sticky top-0 z-30">
        <LayoutTopbar
          breadcrumbs={breadcrumbs}
          buttons={[
            <Button key="new" size="sm">
              <PlusIcon /> New team
            </Button>,
          ]}
        />
      </header>
      <LayoutContent>
        <LayoutHeader pageTitle="Teams" pageDescription="Group members to share access and settings." />
        <div className="grid gap-4 md:grid-cols-3">
          {['Product', 'Design', 'Engineering'].map((name, index) => (
            <Card key={name}>
              <CardHeader>
                <CardTitle>{name}</CardTitle>
                <CardDescription>{[4, 3, 12][index]} members</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </LayoutContent>
    </div>
  );
}

/** The signed-in shell. It renders its page in an `<Outlet/>`, so the story mounts it as a route layout. */
const meta = {
  title: 'Layout/UserLayout',
  component: UserLayout,
  parameters: { router: { url: `${BASE}/teams` } },
  args: {
    connectedUser,
    navUserItems,
    cardPlan: <PlanCardPlaceholder />,
    headerAction: (
      <Button variant="outline" size="icon" asChild>
        <Link to={{ hash: 'new-conversation' }} aria-label="New conversation">
          <PenSquareIcon className="size-4" />
        </Link>
      </Button>
    ),
    workspaces: {
      selectedWorkspaceId: WORKSPACE_ID,
      settingsUrl: `${BASE}/settings`,
      workspaces: [
        { id: WORKSPACE_ID, name: workspaces.default.name as string, logo: GalleryVerticalEnd, urlPrefix: BASE },
        { id: OTHER_WORKSPACE_ID, name: workspaces.other.name as string, logo: GalleryVerticalEnd, urlPrefix: `/w/${OTHER_WORKSPACE_ID}` },
      ],
    },
    mainNavigationGroups: [
      {
        items: [
          { title: 'Dashboard', url: `${BASE}/dashboard`, icon: House },
          { title: 'Assistant', url: `${BASE}/assistant`, icon: SparklesIcon },
          { title: 'Teams', url: `${BASE}/teams`, icon: UsersIcon },
        ],
      },
    ],
    footerNavigationGroups: [
      {
        sectionName: 'Support',
        items: [
          { title: 'Documentation', icon: BookOpenIcon, url: import.meta.env['VITE_DOCUMENTATION_URL'], target: '_tab' },
          { title: 'Message support', icon: LifeBuoyIcon, url: `mailto:${import.meta.env['VITE_SUPPORT_EMAIL']}`, target: '_tab' },
        ],
      },
    ],
  },
  render: (args) => (
    <Routes>
      <Route element={<UserLayout {...args} />}>
        <Route path="*" element={<TeamsPage />} />
      </Route>
    </Routes>
  ),
} satisfies Meta<typeof UserLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A full-width banner above the page (e.g. the past-due invoice warning). */
export const WithBanner: Story = {
  args: {
    banner: (
      <div className="border-b border-amber-100 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700">
        Your last invoice is past due. Update your payment method to keep access to your workspace.
      </div>
    ),
  },
};

/** A back link above the switcher (back-office and settings shells). */
export const WithBackLink: Story = { args: { backLink: `${BASE}/dashboard`, version: '1.4.0' } };

/** No workspace switcher, no header action, no plan card. */
export const Minimal: Story = {
  args: { workspaces: undefined, headerAction: undefined, cardPlan: undefined, footerNavigationGroups: [] },
};
