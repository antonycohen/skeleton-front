import type { Meta, StoryObj } from '@storybook/react-vite';
import { mock, organizationMembersAsEditor, type ScreenParameters } from '@skeleton/storybook-support';
import { TeamsRoutes } from '../../routes/teams-routes';

const MEMBERS = '/organizations/:organizationId/members';

const meta = {
  title: 'Screens/Settings/Team',
  component: TeamsRoutes,
  parameters: {
    screen: { path: 'settings/teams/*', url: 'settings/teams' } satisfies ScreenParameters,
  },
} satisfies Meta<typeof TeamsRoutes>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Seen by an admin: roles, statuses, 2FA coverage and the member actions. */
export const Default: Story = {};

/** The status facet, pre-filled from the URL (the Collection keeps its filters in `?filters=`). */
export const PendingInvitations: Story = {
  parameters: {
    screen: {
      path: 'settings/teams/*',
      url: `settings/teams?filters=${encodeURIComponent(JSON.stringify([{ id: 'status', value: ['INVITED'] }]))}`,
    },
  },
};

/** Seen by an editor: the API leaves the security attributes out. */
export const AsEditor: Story = {
  parameters: { msw: [mock.collection(MEMBERS, organizationMembersAsEditor)] },
};

export const Loading: Story = { parameters: { msw: [mock.loading(MEMBERS)] } };

export const Failed: Story = { name: 'Error', parameters: { msw: [mock.error(MEMBERS)] } };
