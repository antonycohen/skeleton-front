import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CopyIcon, MoreHorizontalIcon, PencilIcon, SendIcon, Trash2Icon } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { ActionMenuItem } from './action-menu-item';

const meta = {
  title: 'Components/Custom/ActionMenuItem',
  component: ActionMenuItem,
  parameters: { layout: 'centered' },
  args: { children: 'Rename', onSelect: fn() },
  render: (args) => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Project actions">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <ActionMenuItem onSelect={fn()}><PencilIcon /> Rename</ActionMenuItem>
        <ActionMenuItem onSelect={fn()}><CopyIcon /> Duplicate</ActionMenuItem>
        <ActionMenuItem {...args} />
        <DropdownMenuSeparator />
        <ActionMenuItem onSelect={fn()} className="text-destructive"><Trash2Icon /> Delete</ActionMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
} satisfies Meta<typeof ActionMenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: <><SendIcon /> Publish</> },
};

/** Disabled with a tooltip explaining why (hover the item). */
export const Blocked: Story = {
  args: {
    children: <><SendIcon /> Publish</>,
    blockedReason: 'Verify the acme.com domain before publishing.',
  },
};
