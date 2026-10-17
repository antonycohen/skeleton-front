import type { Meta, StoryObj } from '@storybook/react-vite';
import { screen, userEvent } from 'storybook/test';
import { mock, type ScreenParameters } from '@skeleton/storybook-support';
import { ServiceAccountsRoutes } from '../../routes/service-accounts-routes';

const SERVICE_ACCOUNTS = '/organizations/:organizationId/service-accounts';

const meta = {
  title: 'Screens/Settings/Service accounts',
  component: ServiceAccountsRoutes,
  parameters: {
    screen: { path: 'settings/service-accounts/*', url: 'settings/service-accounts' } satisfies ScreenParameters,
  },
} satisfies Meta<typeof ServiceAccountsRoutes>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two active accounts and a disabled one, with their permissions. */
export const Default: Story = {};

export const Loading: Story = { parameters: { msw: [mock.loading(SERVICE_ACCOUNTS)] } };

export const Empty: Story = { parameters: { msw: [mock.empty(SERVICE_ACCOUNTS)] } };

export const Failed: Story = { name: 'Error', parameters: { msw: [mock.error(SERVICE_ACCOUNTS)] } };

/** The creation dialog, with the permission catalog to pick from. */
export const Create: Story = {
  play: async () => {
    await userEvent.click(await screen.findByRole('button', { name: /create service account/i }));
  },
};
