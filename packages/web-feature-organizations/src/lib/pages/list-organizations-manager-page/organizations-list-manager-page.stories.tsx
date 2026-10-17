import type { Meta, StoryObj } from '@storybook/react-vite';
import { screen, userEvent } from 'storybook/test';
import { mock, type ScreenParameters } from '@skeleton/storybook-support';
import { OrganizationsListManagerPage } from './organizations-list-manager-page';

const meta = {
  title: 'Screens/Back office/Organizations/List',
  component: OrganizationsListManagerPage,
  parameters: {
    // A back-office screen: mounted at its route, without the workspace shell.
    screen: { path: '/workspaces', layout: 'bare', workspace: false } satisfies ScreenParameters,
  },
} satisfies Meta<typeof OrganizationsListManagerPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Businesses, an individual, a deleted workspace; SSO statuses. */
export const Default: Story = {};

/** The text filter, pre-filled from the URL (the Collection keeps it in `?search=`). */
export const Searched: Story = {
  parameters: { screen: { path: '/workspaces', url: '/workspaces?search=globex', layout: 'bare', workspace: false } },
};

export const Loading: Story = { parameters: { msw: [mock.loading('/organizations')] } };

export const Empty: Story = { parameters: { msw: [mock.empty('/organizations')] } };

export const Failed: Story = { name: 'Error', parameters: { msw: [mock.error('/organizations')] } };

/** "Create workspace". */
export const Create: Story = {
  play: async () => {
    await userEvent.click(await screen.findByRole('button', { name: /create workspace/i }));
  },
};
