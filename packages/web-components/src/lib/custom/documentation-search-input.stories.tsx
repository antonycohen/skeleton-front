import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DocumentationSearchInput, type DocumentationSearchOption } from './documentation-search-input';

const articles: DocumentationSearchOption[] = [
  { value: 'create-workspace', label: 'Create a workspace', url: '/docs/workspaces', description: 'Set up a workspace for your company.', category: 'Getting started' },
  { value: 'invite-members', label: 'Invite your team', url: '/docs/members', description: 'Add members and organize them into teams.', category: 'Getting started' },
  { value: 'sso', label: 'Set up single sign-on', url: '/docs/security/sso', description: 'Let members sign in with your identity provider.', category: 'Security' },
  { value: 'service-accounts', label: 'Service accounts', url: '/docs/security/service-accounts', description: 'Call the API from your own scripts.', category: 'Security' },
  { value: 'quotas', label: 'How quotas work', url: '/docs/billing/quotas', description: 'What counts toward a quota and when it resets.', category: 'Billing' },
];

const meta = {
  title: 'Components/Custom/DocumentationSearchInput',
  component: DocumentationSearchInput,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="max-w-sm"><Story /></div>],
  args: { source: articles, onNavigate: fn(), shortcut: '⌘K' },
} satisfies Meta<typeof DocumentationSearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click the field (or press ⌘K) to open the search dialog. */
export const Default: Story = {};

/** Results come from an async search (300 ms debounce). */
export const AsyncSource: Story = {
  args: {
    source: async (query: string) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return articles.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));
    },
  },
};

export const WithoutShortcut: Story = { args: { shortcut: undefined } };

export const Disabled: Story = { args: { disabled: true } };
