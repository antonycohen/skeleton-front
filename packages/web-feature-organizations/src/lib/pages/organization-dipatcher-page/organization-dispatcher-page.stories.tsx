import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ScreenParameters } from '@skeleton/storybook-support';
import { OrganizationDispatcherPage } from './organization-dispatcher-page';

/**
 * `/w/:id/dispatch`, where a workspace lands when no other route matches. It renders nothing worth
 * seeing and redirects at once: the story shows where it went.
 */
const meta = {
  title: 'Screens/Settings/Workspace dispatcher',
  component: OrganizationDispatcherPage,
  parameters: {
    screen: { path: 'dispatch', layout: 'bare' } satisfies ScreenParameters,
  },
} satisfies Meta<typeof OrganizationDispatcherPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Once the workspace is read → its dashboard. */
export const ToDashboard: Story = {};
