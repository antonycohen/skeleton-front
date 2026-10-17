import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CopyIcon, EllipsisIcon, ExternalLinkIcon, PauseIcon, PencilIcon, Trash2Icon, UsersIcon } from 'lucide-react';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';

const OPEN_DOCS = { docs: { story: { inline: false, iframeHeight: 380 } } };

const meta = {
  title: 'Components/UI/DropdownMenu',
  component: DropdownMenu,
  parameters: { layout: 'centered' },
  args: { onOpenChange: fn() },
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Project actions"><EllipsisIcon /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Q4 Roadmap</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem><PencilIcon /> Edit<DropdownMenuShortcut>⌘E</DropdownMenuShortcut></DropdownMenuItem>
          <DropdownMenuItem><CopyIcon /> Duplicate<DropdownMenuShortcut>⌘D</DropdownMenuShortcut></DropdownMenuItem>
          <DropdownMenuItem><ExternalLinkIcon /> Open in a new tab</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger><UsersIcon /> Share with</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sales team</DropdownMenuItem>
              <DropdownMenuItem>Marketing team</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem disabled><PauseIcon /> Archive</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive"><Trash2Icon /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = { args: { defaultOpen: true, modal: false }, parameters: OPEN_DOCS };

function SelectionMenu(args: Story['args']) {
  const [columns, setColumns] = useState({ status: true, visits: true, owner: false });
  const [sort, setSort] = useState('updated');
  return (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">View</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52">
        <DropdownMenuLabel>Columns</DropdownMenuLabel>
        {(Object.keys(columns) as (keyof typeof columns)[]).map((key) => (
          <DropdownMenuCheckboxItem
            key={key}
            checked={columns[key]}
            onCheckedChange={(checked) => setColumns((c) => ({ ...c, [key]: checked === true }))}
          >
            {key[0].toUpperCase() + key.slice(1)}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
          <DropdownMenuRadioItem value="updated">Last updated</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="visits">Visits</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Checkbox and radio items. */
export const Selection: Story = {
  args: { defaultOpen: true, modal: false },
  parameters: OPEN_DOCS,
  render: (args) => <SelectionMenu {...args} />,
};
