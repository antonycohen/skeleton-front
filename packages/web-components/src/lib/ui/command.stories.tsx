import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { BuildingIcon, CreditCardIcon, FileTextIcon, FolderIcon, SettingsIcon, UsersIcon } from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './command';

function Palette({ onSelect }: { onSelect?: (value: string) => void }) {
  return (
    <>
      <CommandInput placeholder="Search projects, workspaces, settings…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Projects">
          <CommandItem onSelect={onSelect}><FolderIcon /> Q4 Roadmap</CommandItem>
          <CommandItem onSelect={onSelect}><FolderIcon /> Website redesign</CommandItem>
          <CommandItem onSelect={onSelect}><FileTextIcon /> Pricing — Globex</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Workspaces">
          <CommandItem onSelect={onSelect}><BuildingIcon /> Acme Corporation</CommandItem>
          <CommandItem onSelect={onSelect}><BuildingIcon /> Initech</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem onSelect={onSelect}><UsersIcon /> Members<CommandShortcut>⌘M</CommandShortcut></CommandItem>
          <CommandItem onSelect={onSelect}><CreditCardIcon /> Billing<CommandShortcut>⌘B</CommandShortcut></CommandItem>
          <CommandItem onSelect={onSelect}><SettingsIcon /> Workspace<CommandShortcut>⌘,</CommandShortcut></CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  );
}

const meta = {
  title: 'Components/UI/Command',
  component: Command,
  parameters: { layout: 'centered' },
  render: (args) => (
    <Command {...args} className="w-96 rounded-lg border shadow-md">
      <Palette onSelect={fn()} />
    </Command>
  ),
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Typed query with no match. */
export const Empty: Story = {
  render: (args) => (
    <Command {...args} className="w-96 rounded-lg border shadow-md">
      <CommandInput placeholder="Search…" value="umbrella" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Workspaces">
          <CommandItem>Acme Corporation</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

/** The ⌘K palette, in a dialog. */
export const Dialog: Story = {
  parameters: { docs: { story: { inline: false, iframeHeight: 480 } } },
  render: () => (
    <CommandDialog defaultOpen onOpenChange={fn()}>
      <Palette onSelect={fn()} />
    </CommandDialog>
  ),
};
