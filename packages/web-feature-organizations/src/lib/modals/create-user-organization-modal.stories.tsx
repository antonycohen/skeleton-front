import type { Meta, StoryObj } from '@storybook/react-vite';
import { http } from 'msw';
import { expect, fn, screen, userEvent } from 'storybook/test';
import { api, daysAgo, json, USER_ID, uuid, type ScreenParameters } from '@skeleton/storybook-support';
import { CreateUserOrganizationModal } from './create-user-organization-modal';

/** Opened from the workspace switcher's "Add workspace" (and the Workspaces list). */
const meta = {
  title: 'Screens/Settings/Modals/Create workspace',
  component: CreateUserOrganizationModal,
  args: { open: true, onOpenChange: fn(), userId: USER_ID },
  parameters: {
    screen: { path: 'workspaces' } satisfies ScreenParameters,
  },
} satisfies Meta<typeof CreateUserOrganizationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

/** Submitted: the confirmation, before "Done" opens the new workspace. */
export const Created: Story = {
  parameters: {
    msw: [
      http.post(api('/users/:userId/organizations'), async ({ request }) => {
        const body = (await request.json()) as { name?: string };
        return json({ id: uuid(99, '4a000000'), name: body.name, type: 'business', status: 'active', createdAt: daysAgo(0) });
      }),
    ],
  },
  play: async () => {
    await userEvent.type(await screen.findByRole('textbox'), 'Acme Europe');
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await expect(await screen.findByRole('button', { name: /done/i })).toBeVisible();
  },
};
