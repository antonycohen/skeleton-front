import type { Meta, StoryObj } from '@storybook/react-vite';
import { screen, userEvent } from 'storybook/test';
import { mock, type ScreenParameters } from '@skeleton/storybook-support';
import { ListAiConversationsPage } from './list-ai-conversations-page';

const CONVERSATIONS = '/organizations/:organizationId/ai-conversations';

/** Assistant: the workspace's conversations, most recent activity first. */
const meta = {
  title: 'Screens/Assistant/Conversations',
  component: ListAiConversationsPage,
  parameters: {
    screen: { path: 'assistant', url: 'assistant' } satisfies ScreenParameters,
  },
} satisfies Meta<typeof ListAiConversationsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Seven conversations, one never used (no title yet). */
export const Default: Story = {};

export const Loading: Story = { parameters: { msw: [mock.loading(CONVERSATIONS)] } };

export const Empty: Story = { parameters: { msw: [mock.empty(CONVERSATIONS)] } };

export const Failed: Story = { name: 'Error', parameters: { msw: [mock.error(CONVERSATIONS)] } };

/** "New conversation" could not start one: the error toast. */
export const CreateFailed: Story = {
  parameters: { msw: [mock.error(CONVERSATIONS, 500, 'post')] },
  play: async () => {
    await userEvent.click(await screen.findByRole('button', { name: /new conversation/i }));
  },
};
