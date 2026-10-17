import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { BellIcon, CreditCardIcon, LanguagesIcon, LogOutIcon, UserIcon } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarProvider } from '../ui/sidebar';
import { NavUser, type NavItem } from './nav-user';

/** Sidebar parts need the sidebar context: render in the footer of a static sidebar. */
const inSidebarFooter: Decorator = (Story) => (
  <SidebarProvider>
    <Sidebar collapsible="none" className="h-svh border-r">
      <SidebarContent />
      <SidebarFooter>
        <Story />
      </SidebarFooter>
    </Sidebar>
  </SidebarProvider>
);

const PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#6366f1"/><circle cx="32" cy="26" r="12" fill="#e0e7ff"/><rect x="12" y="42" width="40" height="22" rx="11" fill="#e0e7ff"/></svg>',
  );

const items: NavItem[] = [
  { type: 'link', title: 'Account', to: '/account', icon: <UserIcon className="size-4" /> },
  { type: 'link', title: 'Billing', to: '/settings/billing', icon: <CreditCardIcon className="size-4" /> },
  { type: 'link', title: 'Notifications', onClick: fn(), icon: <BellIcon className="size-4" /> },
  {
    type: 'dropdown',
    title: 'Language',
    icon: <LanguagesIcon className="size-4" />,
    items: [
      { type: 'link', title: 'English', onClick: fn() },
      { type: 'link', title: 'Français', onClick: fn() },
    ],
  },
  { type: 'separator' },
  { type: 'link', title: 'Log out', onClick: fn(), icon: <LogOutIcon className="size-4" /> },
];

const meta = {
  title: 'Components/Pro blocks/NavUser',
  component: NavUser,
  decorators: [inSidebarFooter],
  args: {
    user: { name: 'Claire Martin', email: 'claire.martin@acme.com' },
    items,
  },
} satisfies Meta<typeof NavUser>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Initials when there is no avatar. Click to open the menu. */
export const Default: Story = {};

export const WithAvatar: Story = {
  args: {
    user: {
      name: 'Claire Martin',
      email: 'claire.martin@acme.com',
      avatar: PHOTO,
    },
  },
};

export const WithoutMenuItems: Story = { args: { items: [] } };
