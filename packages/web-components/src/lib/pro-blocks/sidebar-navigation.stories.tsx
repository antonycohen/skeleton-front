import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { BarChart3Icon, Building2Icon, FolderIcon, LayoutDashboardIcon, SettingsIcon, ShieldIcon, UsersIcon } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarProvider } from '../ui/sidebar';
import { SidebarNavigation } from './sidebar-navigation';

/** Sidebar parts need the sidebar context: render inside a static sidebar. */
const inSidebar: Decorator = (Story) => (
  <SidebarProvider>
    <Sidebar collapsible="none" className="h-svh border-r">
      <SidebarContent>
        <Story />
      </SidebarContent>
    </Sidebar>
  </SidebarProvider>
);

const meta = {
  title: 'Components/Pro blocks/SidebarNavigation',
  component: SidebarNavigation,
  decorators: [inSidebar],
  parameters: { router: { url: '/projects' } },
  args: {
    sectionName: 'Workspace',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboardIcon },
      { title: 'Projects', url: '/projects', icon: FolderIcon },
      { title: 'Teams', url: '/teams', icon: UsersIcon },
      { title: 'Analytics', url: '/analytics', icon: BarChart3Icon },
      {
        title: 'Settings',
        url: '/settings',
        icon: SettingsIcon,
        items: [
          { title: 'General', url: '/settings/general' },
          { title: 'Members', url: '/settings/members' },
          { title: 'Billing', url: '/settings/billing' },
        ],
      },
    ],
  },
} satisfies Meta<typeof SidebarNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The active item follows the router address. */
export const Default: Story = {};

/** A collapsible group opened by `isActive`, its sub-item active from the route. */
export const OpenGroup: Story = {
  parameters: { router: { url: '/settings/members' } },
  args: {
    items: [
      { title: 'Projects', url: '/projects', icon: FolderIcon },
      {
        title: 'Settings',
        url: '/settings',
        icon: SettingsIcon,
        isActive: true,
        items: [
          { title: 'General', url: '/settings/general' },
          { title: 'Members', url: '/settings/members' },
          { title: 'Billing', url: '/settings/billing' },
        ],
      },
      { title: 'Security', url: '/security', icon: ShieldIcon },
    ],
  },
};

export const WithoutSectionName: Story = {
  args: {
    sectionName: undefined,
    items: [
      { title: 'Organizations', url: '/admin/organizations', icon: Building2Icon },
      { title: 'Users', url: '/admin/users', icon: UsersIcon },
    ],
  },
};

/** Collapsed to the icon rail (hover an icon for its tooltip). */
export const Collapsed: Story = {
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <SidebarContent>
            <Story />
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    ),
  ],
};

/** An icon-less list of recent items, then a "View more" link kept inactive by `isActive: false`. `hiddenWhenCollapsed` hides it on the icon rail. */
export const RecentItems: Story = {
  parameters: { router: { url: '/projects/2' } },
  args: {
    sectionName: 'Recent projects',
    hiddenWhenCollapsed: true,
    items: [
      { title: 'EMEA | Digital transformation', url: '/projects/1' },
      { title: 'NAM | Enterprise cloud migration', url: '/projects/2' },
      { title: 'EMEA | Omnichannel support', url: '/projects/3' },
      { title: 'NAM | Supply chain review', url: '/projects/4' },
      { title: 'View more', url: '/projects', isActive: false },
    ],
  },
};
