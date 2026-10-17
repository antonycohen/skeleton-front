import {
  readAiConversationSchema,
  type AiConversation,
  type ChatMessage,
  type ContentBlock,
  type StreamEvent,
} from '@skeleton/core-api-models';
import { daysAgo, make, STORYBOOK_NOW, uuid } from './make';
import { USER_ID, WORKSPACE_ID } from './session';

/** AI assistant fixtures: conversations of the workspace and their message history. */
const AI = 'a1000000';
export const aiId = (n: number) => uuid(n, AI);
const messageId = (n: number) => uuid(n, 'a2000000');

const minutesAgo = (minutes: number) => new Date(STORYBOOK_NOW.getTime() - minutes * 60_000);

/** The conversation with the full history (thinking, web search, markdown, suggestions). */
export const AI_CONVERSATION_ID = aiId(1);

const conversation = (
  n: number,
  title: string | null,
  messagesCount: number,
  lastActivity: string,
  createdAt = daysAgo(n * 5),
): AiConversation =>
  make(readAiConversationSchema, {
    id: aiId(n),
    title,
    organization: { id: WORKSPACE_ID, name: 'Acme' },
    createdBy: USER_ID,
    messagesCount,
    lastMessageAt: messagesCount > 0 ? lastActivity : null,
    createdAt,
    updatedAt: lastActivity,
  });

/** The workspace's conversations, most recent activity first (the list's default sort). */
export const aiConversations: AiConversation[] = [
  conversation(1, 'Quarterly churn review', 4, minutesAgo(12).toISOString()),
  conversation(2, 'Onboarding email sequence', 12, daysAgo(1)),
  conversation(3, 'Summarize the October roadmap', 6, daysAgo(2)),
  conversation(4, 'Pricing tiers comparison', 8, daysAgo(4)),
  // Created with "New conversation" and never used: no title yet.
  conversation(5, null, 0, daysAgo(6), daysAgo(6)),
  conversation(6, 'Support macros in French', 10, daysAgo(9)),
  conversation(7, 'Job description: senior backend engineer', 5, daysAgo(15)),
];

const message = (n: number, role: ChatMessage['role'], minutes: number, content: ContentBlock[]): ChatMessage => ({
  id: messageId(n),
  role,
  content,
  createdAt: minutesAgo(minutes),
});

const text = (value: string): ContentBlock => ({ type: 'text', text: value });

/**
 * The history of {@link AI_CONVERSATION_ID}, oldest first. The second turn is the Anthropic format
 * in full: thinking, a server tool use (web search) and its results, then the answer. The default
 * renderer shows the text and the search results; thinking is shown live by the chat indicator only.
 */
const churnReview: ChatMessage[] = [
  message(1, 'user', 20, [
    text('Our churn went up last quarter. Can you check what is happening in the market and suggest three things we could try?'),
  ]),
  message(2, 'assistant', 19, [
    {
      type: 'thinking',
      thinking:
        'The user wants market context on churn and three concrete actions. I should look up recent B2B SaaS churn benchmarks first, then tie the actions to the usual drivers: onboarding, adoption and pricing.',
    },
    { type: 'server_tool_use', id: 'srvtoolu_storybook_01', name: 'web_search', input: { query: 'B2B SaaS churn benchmarks 2026' } },
    {
      type: 'web_search_tool_result',
      toolUseId: 'srvtoolu_storybook_01',
      content: [
        { type: 'web_search_result', title: 'SaaS churn benchmarks: what good looks like in 2026', url: 'https://example.com/reports/saas-churn-benchmarks-2026', encryptedContent: 'storybook', pageAge: '2 weeks ago' },
        { type: 'web_search_result', title: 'Why customers leave in their first 90 days', url: 'https://blog.example.org/first-90-days', encryptedContent: 'storybook', pageAge: '1 month ago' },
        { type: 'web_search_result', title: 'Annual plans and retention: a data study', url: 'https://research.example.net/annual-plans-retention', encryptedContent: 'storybook', pageAge: '3 months ago' },
      ],
    },
    text(
      [
        'Churn rose across the market last quarter, so part of what you see is not specific to you: most benchmarks put monthly B2B churn **between 1% and 2%**, with the steepest losses in the first 90 days.',
        '',
        'Three things worth trying:',
        '',
        '1. **Tighten onboarding.** Customers who reach their first result in week one churn far less. Add a checklist and a nudge on day 3.',
        '2. **Watch adoption signals.** Flag workspaces whose weekly active members drop by half and have someone reach out before the renewal.',
        '3. **Offer annual plans.** Two months free on yearly billing moves the decision to once a year.',
        '',
        '| Lever | Effort | Expected impact |',
        '| --- | --- | --- |',
        '| Onboarding checklist | Low | High |',
        '| Adoption alerts | Medium | Medium |',
        '| Annual plans | Low | Medium |',
      ].join('\n'),
    ),
  ]),
  message(3, 'user', 14, [text("Great. Draft a short email for customers who haven't logged in for 30 days.")]),
  message(4, 'assistant', 12, [
    text(
      [
        "Here's a short, friendly draft:",
        '',
        '> **Subject:** We saved your spot',
        '>',
        "> Hi {first_name}, it's been a few weeks since your last visit. Your workspace is just as you left it, and we shipped a couple of things since: a faster dashboard and AI summaries.",
        '>',
        '> Need a hand getting back into it? Reply to this email and we will set up a 15-minute call.',
        '',
        'Want me to adapt it for a specific segment?',
        '',
        '<assistant-instruction name="suggestions" data-question="What next?">',
        'Make it more formal',
        'Write a French version',
        'Add a discount offer',
        '</assistant-instruction>',
      ].join('\n'),
    ),
  ]),
];

/** A short exchange for the other conversations. */
const exchange = (title: string | null, offset: number): ChatMessage[] =>
  title
    ? [
        message(offset + 1, 'user', 60 * 24 + 5, [text(`Help me with this: ${title.toLowerCase()}.`)]),
        message(offset + 2, 'assistant', 60 * 24 + 4, [
          text(`Sure. Here is a first outline for **${title}**:\n\n- Goal and audience\n- Key points to cover\n- Next steps\n\nTell me which part to expand.`),
        ]),
      ]
    : [];

/** Message history per conversation, oldest first (the API sends it newest first, see the handler). */
export const aiConversationMessages: Record<string, ChatMessage[]> = Object.fromEntries(
  aiConversations.map((c, i) => [c.id as string, c.id === AI_CONVERSATION_ID ? churnReview : exchange(c.title, (i + 1) * 100)]),
);

/**
 * The reply the mock API streams to any message (`POST …/messages`): a short thinking block, then
 * the text, as Anthropic-format events.
 */
export function aiReplyEvents(prompt: string): StreamEvent[] {
  const reply = `This is a mocked reply to “${prompt.trim()}”. In Storybook the assistant is not connected: the answer is **streamed by the mock API**, event by event, as the backend would.`;
  const words = reply.split(/(?<= )/);
  const chunks = Array.from({ length: Math.ceil(words.length / 4) }, (_, i) => words.slice(i * 4, i * 4 + 4).join(''));
  return [
    {
      type: 'message_start',
      message: {
        id: 'msg_storybook_reply',
        type: 'message',
        role: 'assistant',
        content: [],
        model: 'storybook-mock',
        stopReason: null,
        stopSequence: null,
        usage: { inputTokens: 1200, outputTokens: 1 },
      },
    },
    { type: 'content_block_start', index: 0, contentBlock: { type: 'thinking', thinking: '' } },
    { type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking: 'Reading the question… ' } },
    { type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking: 'drafting a short answer.' } },
    { type: 'content_block_stop', index: 0 },
    { type: 'content_block_start', index: 1, contentBlock: { type: 'text', text: '' } },
    ...chunks.map((chunk): StreamEvent => ({ type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: chunk } })),
    { type: 'content_block_stop', index: 1 },
    { type: 'message_delta', delta: { stopReason: 'end_turn', stopSequence: null }, usage: { outputTokens: 48 } },
    { type: 'message_stop' },
  ];
}
