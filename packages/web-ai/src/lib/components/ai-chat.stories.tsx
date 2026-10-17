import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { ChatMessage } from '@skeleton/core-api-models';
import { STORYBOOK_NOW } from '@skeleton/storybook-support';
import { toolUsePlugin } from '../plugins';
import { AiChat } from './ai-chat';

const at = (minutes: number) => new Date(STORYBOOK_NOW.getTime() + minutes * 60_000);

const conversation: ChatMessage[] = [
  {
    id: 'm1',
    role: 'user',
    content: [{ type: 'text', text: 'Who joined the workspace this month?' }],
    createdAt: at(0),
  },
  {
    id: 'm2',
    role: 'assistant',
    content: [
      {
        type: 'tool_use',
        id: 'tu-1',
        name: 'list_members',
        input: { joinedAfter: '2026-10-01', status: 'ACTIVE' },
      },
      {
        type: 'text',
        text:
          'Three people joined **Acme** this month:\n\n' +
          '- Léa Bernard, Product\n- Hugo Dubois, Design\n- Tom Lefèvre, Engineering\n\n' +
          'What would you like to do next?\n' +
          '<assistant-instruction name="suggestions" data-question="What should we do next?">\n' +
          'Send them a welcome message\nShow pending invitations\nExport the member list\n</assistant-instruction>',
      },
    ],
    createdAt: at(1),
  },
];

/**
 * The conversational panel of the assistant. The default block plugins render text and web searches;
 * tool calls need the tool-use plugin, passed here as a custom plugin.
 */
const meta = {
  title: 'Patterns/AI/AiChat',
  component: AiChat,
  decorators: [
    (Story) => (
      <div className="h-[720px]">
        <Story />
      </div>
    ),
  ],
  args: {
    initialMessages: conversation,
    plugins: [toolUsePlugin],
    onSendMessage: fn(),
    placeholder: 'Reply...',
  },
  argTypes: { theme: { control: 'inline-radio', options: ['large', 'compact'] } },
} satisfies Meta<typeof AiChat>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A tool call and a markdown answer, then suggestion chips in the composer. */
export const Default: Story = {};

/** The narrow side-panel variant. */
export const Compact: Story = {
  args: { theme: 'compact' },
  decorators: [
    (Story) => (
      <div className="h-[720px] w-[400px] border-r">
        <Story />
      </div>
    ),
  ],
};

export const Empty: Story = {
  args: {
    initialMessages: [],
    emptyState: (
      <div className="mx-auto max-w-3xl px-4 pt-16 text-center">
        <h2 className="text-2xl font-semibold">What can I help you with today?</h2>
        <p className="mt-2 text-sm text-muted-foreground">Ask about your workspace, your team or your billing.</p>
      </div>
    ),
  },
};

/** The answer is streaming: thinking indicator, partial text. */
export const Thinking: Story = {
  args: {
    indicatorStatus: 'thinking',
    initialMessages: [
      conversation[0],
      {
        id: 'm2',
        role: 'assistant',
        content: [{ type: 'text', text: 'Let me look at the member list first' }],
        createdAt: at(1),
        isStreaming: true,
      },
    ],
  },
};

/** The assistant asks for a URL: the composer turns into a validated field. */
export const TextInputInstruction: Story = {
  args: {
    initialMessages: [
      {
        id: 'm1',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text:
              'Which page should I summarize?\n' +
              '<assistant-instruction name="text-input" label="Page" placeholder="www.acme.io/pricing" validators="url" prefix="https://"></assistant-instruction>',
          },
        ],
        createdAt: at(0),
      },
    ],
  },
};

/** A question scoped to a selection (chip), answered with a web search, then a tool call. */
export const RichBlocks: Story = {
  args: {
    indicatorStatus: 'success',
    initialMessages: [
      {
        id: 'm1',
        role: 'user',
        content: [
          { type: 'text', text: 'Suggest a few tools this team could use for design reviews.' },
          { type: 'context', id: 'team-design', label: 'Design team' },
        ],
        createdAt: at(0),
      },
      {
        id: 'm2',
        role: 'assistant',
        content: [
          {
            type: 'web_search_tool_result',
            toolUseId: 'ws-1',
            content: [
              { type: 'web_search_result', title: 'How to run async design reviews', url: 'https://example.com/blog/async-design-reviews', encryptedContent: '', pageAge: '3 days ago' },
              { type: 'web_search_result', title: 'Design review checklist', url: 'https://example.com/guides/design-review-checklist', encryptedContent: '', pageAge: null },
            ],
          },
          { type: 'text', text: 'Async reviews work best with a shared checklist, so I drafted one for the **Design team**:' },
          {
            type: 'tool_use',
            id: 'tu-1',
            name: 'create_document',
            input: { title: 'Design review checklist', team: 'Design team', sections: ['Goals', 'Accessibility', 'Copy', 'Hand-off'] },
          },
        ],
        createdAt: at(1),
      },
    ],
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const LoadingMore: Story = { args: { isLoadingMore: true, hasMore: true, onLoadMore: fn() } };
