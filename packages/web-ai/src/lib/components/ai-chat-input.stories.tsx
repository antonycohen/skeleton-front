import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AiChatInput } from './ai-chat-input';

const meta = {
  title: 'Patterns/AI/AiChatInput',
  component: AiChatInput,
  parameters: { layout: 'padded' },
  args: { value: '', onValueChange: fn(), onSubmit: fn(), placeholder: 'Reply...' },
  argTypes: { style: { control: 'inline-radio', options: ['large', 'compact'] } },
  // Controlled: the story keeps the value so typing works.
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <div className="mx-auto max-w-3xl">
        <AiChatInput
          {...args}
          value={value}
          onValueChange={(next) => {
            setValue(next);
            args.onValueChange(next);
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof AiChatInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = { args: { value: 'Draft an onboarding checklist for new members.' } };

export const Compact: Story = { args: { style: 'compact' } };

/** While a reply streams, sending is blocked. */
export const Streaming: Story = { args: { value: 'And for the design team?', isLoading: true } };

export const Disabled: Story = { args: { disabled: true } };
