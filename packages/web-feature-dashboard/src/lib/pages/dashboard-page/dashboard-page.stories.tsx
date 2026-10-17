import type { Meta, StoryObj } from '@storybook/react-vite';
import { http } from 'msw';
import type { ReadOrganization } from '@skeleton/core-api-models';
import { useSessionStore } from '@skeleton/core-store-session';
import { api, connectedUser, daysFromNow, json, workspace, type ScreenParameters } from '@skeleton/storybook-support';
import { DashboardRoutes } from '../../routes/dashboard-routes';

// The dashboard reads the open organization (`deleteAt`, `statistics`) and the connected user's
// first name, so each state is a workspace handed to `parameters.workspace` or a session tweak.

const meta = {
  title: 'Screens/Dashboard/Dashboard',
  component: DashboardRoutes,
  parameters: {
    screen: { path: 'dashboard/*', url: 'dashboard' } satisfies ScreenParameters,
  },
} satisfies Meta<typeof DashboardRoutes>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A live workspace: welcome banner and the members metric. */
export const Default: Story = {};

/** No statistics computed yet: the members metric shows its empty state. */
export const NoStatistics: Story = {
  parameters: { workspace: { ...workspace, statistics: null } satisfies ReadOrganization },
};

/** The connected user has not filled in a first name: the banner greets without it. */
export const WithoutFirstName: Story = {
  beforeEach: () => {
    useSessionStore.setState({ connectedUser: { ...connectedUser, firstName: null } });
  },
};

/** The owner asked to delete the workspace: an alert gives the date, with a way back. */
export const ScheduledForDeletion: Story = {
  parameters: {
    workspace: { ...workspace, deleteAt: daysFromNow(14) } satisfies ReadOrganization,
    msw: [http.post(api('/organizations/:organizationId/cancel-deletion'), () => json({}))],
  },
};
