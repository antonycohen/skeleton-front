import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThinkingContent } from './thinking-content';

const meta = {
  title: 'Patterns/AI/ThinkingContent',
  component: ThinkingContent,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
  args: {
    thinking:
      'Three members joined this month and two invitations are still pending. The answer should list the new members first, then suggest resending the pending invitations.',
  },
} satisfies Meta<typeof ThinkingContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
