import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronsUpDownIcon } from 'lucide-react';
import { Button } from './button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';

const meta = {
  title: 'Components/UI/Collapsible',
  component: Collapsible,
  parameters: { layout: 'centered' },
  render: (args) => (
    <Collapsible {...args} className="flex w-80 flex-col gap-2">
      <div className="flex items-center justify-between gap-4 px-2">
        <span className="text-sm font-semibold">Workspaces (3)</span>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Toggle"><ChevronsUpDownIcon /></Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-2 text-sm">Acme Corporation</div>
      <CollapsibleContent className="flex flex-col gap-2">
        <div className="rounded-md border px-4 py-2 text-sm">Globex</div>
        <div className="rounded-md border px-4 py-2 text-sm">Initech</div>
      </CollapsibleContent>
    </Collapsible>
  ),
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = { args: { defaultOpen: true } };
