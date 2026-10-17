import type { Meta, StoryObj } from '@storybook/react-vite';
import { AiChatIndicator } from './ai-chat-indicator';

const meta = {
  title: 'Patterns/AI/AiChatIndicator',
  component: AiChatIndicator,
  parameters: { layout: 'centered' },
  args: { status: 'idle' },
  argTypes: { status: { control: 'inline-radio', options: ['idle', 'thinking', 'success', 'error'] } },
} satisfies Meta<typeof AiChatIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const Thinking: Story = { args: { status: 'thinking' } };

/** The current thinking text shows next to the animation. */
export const ThinkingWithText: Story = {
  args: { status: 'thinking', thinking: 'Comparing this month’s active members with last month…' },
  decorators: [(Story) => <div className="w-[480px]"><Story /></div>],
};

export const Success: Story = { args: { status: 'success' } };

export const Failed: Story = { name: 'Error', args: { status: 'error' } };

export const Large: Story = { args: { status: 'thinking', size: 64 } };
