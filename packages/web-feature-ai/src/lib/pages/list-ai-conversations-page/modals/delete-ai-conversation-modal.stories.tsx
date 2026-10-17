import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { WORKSPACE_ID, aiConversations } from '@skeleton/storybook-support';
import { DeleteAiConversationModal } from './delete-ai-conversation-modal';

/** Opened from a conversation's row actions in the list. */
const meta = {
  title: 'Screens/Assistant/Modals/Delete conversation',
  component: DeleteAiConversationModal,
  args: { conversation: aiConversations[0], organizationId: WORKSPACE_ID, open: true, onOpenChange: fn() },
} satisfies Meta<typeof DeleteAiConversationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A conversation that never got a title. */
export const Untitled: Story = { args: { conversation: aiConversations[4] } };
