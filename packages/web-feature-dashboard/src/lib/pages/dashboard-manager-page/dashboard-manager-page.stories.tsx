import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ScreenParameters } from '@skeleton/storybook-support';
import { DashboardManagerPage } from './dashboard-manager-page';

/** The back office's home: shortcuts to the workspaces, the users and the product groups. */
const meta = {
  title: 'Screens/Back office/Dashboard/Dashboard',
  component: DashboardManagerPage,
  parameters: {
    // A back-office screen: mounted at its route, without the workspace shell.
    screen: { path: '/dashboard', layout: 'bare', workspace: false } satisfies ScreenParameters,
  },
} satisfies Meta<typeof DashboardManagerPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
