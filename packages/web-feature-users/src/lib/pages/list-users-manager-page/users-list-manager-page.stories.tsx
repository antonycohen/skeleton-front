import type { Meta, StoryObj } from '@storybook/react-vite';
import { mock, type ScreenParameters } from '@skeleton/storybook-support';
import { UsersListManagerPage } from './users-list-manager-page';

const meta = {
  title: 'Screens/Back office/Users/List',
  component: UsersListManagerPage,
  parameters: {
    // A back-office screen: mounted at its route, without the workspace shell.
    screen: { path: '/users', layout: 'bare', workspace: false } satisfies ScreenParameters,
  },
} satisfies Meta<typeof UsersListManagerPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every status, and the sign-in providers linked to each account. */
export const Default: Story = {};

/** The text filter, pre-filled from the URL (`?search=`, sent to the API as `term`). */
export const Searched: Story = {
  parameters: { screen: { path: '/users', url: '/users?search=acme', layout: 'bare', workspace: false } },
};

/** The collection has no loading placeholder: the table reads "No results" until the page arrives. */
export const Loading: Story = { parameters: { msw: [mock.loading('/users')] } };

export const Empty: Story = { parameters: { msw: [mock.empty('/users')] } };

/** Nor an error state: a failed request also reads "No results". */
export const Failed: Story = { name: 'Error', parameters: { msw: [mock.error('/users')] } };
