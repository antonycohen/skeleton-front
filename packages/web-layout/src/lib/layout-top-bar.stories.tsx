import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlusIcon, SettingsIcon } from 'lucide-react';
import { Button, SidebarProvider } from '@skeleton/web-components';
import { LayoutTopbar } from './layout-top-bar';
import { useBreadcrumb, type BreadcrumbItemConfig } from './use-breadcrumb';

function Breadcrumb({ items, endWithSeparator }: { items: BreadcrumbItemConfig[]; endWithSeparator?: boolean }) {
  return useBreadcrumb(items, endWithSeparator);
}

const meta = {
  title: 'Layout/LayoutTopbar',
  component: LayoutTopbar,
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={false} className="min-h-0">
        <div className="w-full border-b">
          <Story />
        </div>
      </SidebarProvider>
    ),
  ],
  args: {
    breadcrumbs: (
      <Breadcrumb
        items={[
          { label: 'Teams', to: '/settings/teams' },
          { label: 'Design team', to: '/settings/teams/1' },
          { label: 'Members' },
        ]}
      />
    ),
  },
} satisfies Meta<typeof LayoutTopbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithButtons: Story = {
  args: {
    buttons: [
      <Button key="settings" variant="outline" size="icon" aria-label="Settings">
        <SettingsIcon />
      </Button>,
      <Button key="new" size="sm">
        <PlusIcon /> New team
      </Button>,
    ],
  },
};

/** A single root crumb, ending with a separator (list pages). */
export const SectionRoot: Story = {
  args: { breadcrumbs: <Breadcrumb items={[{ label: 'Teams', to: '/settings/teams' }]} endWithSeparator /> },
};
