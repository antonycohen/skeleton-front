import type { Meta, StoryObj } from '@storybook/react-vite';
import { screen, userEvent } from 'storybook/test';
import { mock, userOrganizations, type ScreenParameters } from '@skeleton/storybook-support';
import { WorkspacesRoutes } from '../../routes/workspaces-routes';

const USER_ORGANIZATIONS = '/users/:userId/organizations';

/** Every workspace the connected user belongs to, reached from the workspace switcher. */
const meta = {
  title: 'Screens/Settings/Workspaces',
  component: WorkspacesRoutes,
  parameters: {
    screen: { path: 'workspaces/*', url: 'workspaces' } satisfies ScreenParameters,
    msw: [mock.collection(USER_ORGANIZATIONS, userOrganizations)],
  },
} satisfies Meta<typeof WorkspacesRoutes>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Paid and free workspaces, a personal one and a sandbox scheduled for deletion. */
export const Default: Story = {};

export const Loading: Story = { parameters: { msw: [mock.loading(USER_ORGANIZATIONS)] } };

export const Failed: Story = { name: 'Error', parameters: { msw: [mock.error(USER_ORGANIZATIONS)] } };

/** "Create new workspace". */
export const Create: Story = {
  play: async () => {
    await userEvent.click(await screen.findByRole('button', { name: /create new workspace/i }));
  },
};
