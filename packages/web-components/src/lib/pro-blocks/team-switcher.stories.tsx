import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Building2Icon, FactoryIcon, LandmarkIcon, RocketIcon } from 'lucide-react';
import { uuid } from '@skeleton/storybook-support';
import { CommandInput } from '../ui/command';
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from '../ui/sidebar';
import { TeamSwitcher, type TeamSwitcherProps } from './team-switcher';

/** Sidebar parts need the sidebar context: render in the header of a static sidebar. */
const inSidebarHeader: Decorator = (Story) => (
  <SidebarProvider>
    <Sidebar collapsible="none" className="h-svh border-r">
      <SidebarHeader>
        <Story />
      </SidebarHeader>
      <SidebarContent />
    </Sidebar>
  </SidebarProvider>
);

const workspace = (n: number, name: string, logo: TeamSwitcherProps['workspaces'][number]['logo']) => ({
  id: uuid(n, 'b5000000'),
  name,
  logo,
  urlPrefix: `/w/${uuid(n, 'b5000000')}/dashboard`,
});

const workspaces = [
  workspace(1, 'Acme Corp', RocketIcon),
  workspace(2, 'Globex', Building2Icon),
  workspace(3, 'Initech', FactoryIcon),
  workspace(4, 'Umbrella Bank', LandmarkIcon),
];

const meta = {
  title: 'Components/Pro blocks/TeamSwitcher',
  component: TeamSwitcher,
  decorators: [inSidebarHeader],
  args: {
    workspaces,
    selectedWorkspaceId: workspaces[0].id,
    settingsUrl: `/w/${workspaces[0].id}/settings`,
    onAddWorkspace: fn(),
  },
} satisfies Meta<typeof TeamSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click to open the menu, then "Switch workspace". */
export const Default: Story = {};

export const WithoutSettings: Story = { args: { settingsUrl: undefined } };

/** A user in many workspaces: searchable list, filtered by the parent, with a truncation hint. */
export const WithSearch: Story = {
  render: function Render(args) {
    const [query, setQuery] = useState('');
    const matches = args.workspaces.filter((w) => w.name.toLowerCase().includes(query.toLowerCase()));
    return (
      <TeamSwitcher
        {...args}
        workspaces={matches}
        totalCount={42}
        activeWorkspace={args.workspaces[0]}
        searchInput={<CommandInput placeholder="Search workspaces…" value={query} onValueChange={setQuery} />}
      />
    );
  },
};

/** The selected workspace is not in the (filtered) list: the trigger uses `activeWorkspace`. */
export const ActiveOutsideList: Story = {
  args: {
    selectedWorkspaceId: uuid(99, 'b5000000'),
    activeWorkspace: { name: 'Hooli', logo: RocketIcon },
    workspaces: workspaces.slice(1),
  },
};
