import type { Meta, StoryObj } from '@storybook/react-vite';
import { DownloadIcon, PlusIcon } from 'lucide-react';
import { Button } from '@skeleton/web-components';
import { LayoutHeader } from './layout-header';

const meta = {
  title: 'Layout/LayoutHeader',
  component: LayoutHeader,
  parameters: { layout: 'padded' },
  args: {
    pageTitle: 'Members',
    pageDescription: 'Everyone who has access to this workspace.',
  },
} satisfies Meta<typeof LayoutHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TitleOnly: Story = { args: { pageDescription: undefined } };

export const WithActions: Story = {
  args: {
    actions: (
      <>
        <Button variant="outline">
          <DownloadIcon /> Export
        </Button>
        <Button>
          <PlusIcon /> Invite member
        </Button>
      </>
    ),
  },
};
