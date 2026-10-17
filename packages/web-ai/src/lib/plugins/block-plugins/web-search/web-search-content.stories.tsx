import type { Meta, StoryObj } from '@storybook/react-vite';
import { WebSearchContent } from './web-search-content';

const meta = {
  title: 'Patterns/AI/WebSearchContent',
  component: WebSearchContent,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
  args: {
    results: [
      { type: 'web_search_result', title: 'How to run async design reviews', url: 'https://example.com/blog/async-design-reviews', encryptedContent: '', pageAge: '3 days ago' },
      { type: 'web_search_result', title: 'Design review checklist', url: 'https://example.com/guides/design-review-checklist', encryptedContent: '', pageAge: null },
      { type: 'web_search_result', title: 'Onboarding new team members remotely', url: 'https://example.org/onboarding-remote-teams', encryptedContent: '', pageAge: '2 weeks ago' },
    ],
  },
} satisfies Meta<typeof WebSearchContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Streaming: Story = { args: { results: [], isStreaming: true } };
