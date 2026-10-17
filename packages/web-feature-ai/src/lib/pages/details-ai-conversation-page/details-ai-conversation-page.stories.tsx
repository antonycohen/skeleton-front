import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { AI_CONVERSATION_ID, aiConversations, mock, type ScreenParameters } from '@skeleton/storybook-support';
import { DetailsAiConversationPage } from './details-ai-conversation-page';

const CONVERSATION = '/organizations/:organizationId/ai-conversations/:conversationId';
const MESSAGES = `${CONVERSATION}/messages`;

/**
 * Assistant › a conversation. The history comes newest first from the API; the composer's
 * messages are answered by a mocked Anthropic-format stream (thinking, then text).
 */
const meta = {
  title: 'Screens/Assistant/Conversation',
  component: DetailsAiConversationPage,
  parameters: {
    screen: { path: 'assistant/:conversationId', url: `assistant/${AI_CONVERSATION_ID}` } satisfies ScreenParameters,
  },
} satisfies Meta<typeof DetailsAiConversationPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Two turns: a web search with its results and a markdown answer (list, table), then a drafted
 * email ending with suggestion chips above the composer.
 */
export const Default: Story = {};

/** The history has not loaded: the chat is not mounted yet. */
export const Loading: Story = { parameters: { msw: [mock.loading(MESSAGES)] } };

/** Just created with "New conversation": no title, no message. */
export const Empty: Story = {
  parameters: {
    msw: [mock.empty(MESSAGES), mock.body(CONVERSATION, { ...aiConversations[4] })],
  },
};

/** A suggestion picked: it is sent as the next message and the mocked reply streams in. */
export const Replying: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(await within(canvasElement).findByRole('button', { name: /write a french version/i }));
  },
};
