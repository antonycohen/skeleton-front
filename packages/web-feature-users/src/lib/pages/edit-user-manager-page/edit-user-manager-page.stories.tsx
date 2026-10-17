import type { Meta, StoryObj } from '@storybook/react-vite';
import { mock, users, type ScreenParameters } from '@skeleton/storybook-support';
import { EditUserManagerPage } from './edit-user-manager-page';

const [, user] = users;

/** Not routed yet (the back office only links to the details page): mounted at its likely address. */
const meta = {
  title: 'Screens/Back office/Users/Edit',
  component: EditUserManagerPage,
  parameters: {
    screen: { path: '/users/:userId/edit', url: `/users/${user.id}/edit`, layout: 'bare', workspace: false } satisfies ScreenParameters,
  },
} satisfies Meta<typeof EditUserManagerPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = { parameters: { msw: [mock.loading('/users/:userId')] } };
