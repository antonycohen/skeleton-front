import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { InputGroupPrompt } from './input-group-prompt';

const meta = {
  title: 'Components/Custom/InputGroupPrompt',
  component: InputGroupPrompt,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="max-w-3xl"><Story /></div>],
  args: {
    questionText:
      'I can see your project "Q4 Roadmap". Which teams should I include in the weekly summary? Be as specific as you want.',
    placeholder: 'Describe what the summary should cover…',
    options: [
      { id: 'product', label: 'Product', checked: true },
      { id: 'engineering', label: 'Engineering', checked: false },
      { id: 'sales', label: 'Sales', checked: false },
      { id: 'success', label: 'Customer Success', checked: true },
    ],
    onValueChange: fn(),
    onOptionChange: fn(),
    onSkip: fn(),
    onSubmit: fn(),
    onAddClick: fn(),
    onSettingsClick: fn(),
    onChatClick: fn(),
    onMicClick: fn(),
    onAudioClick: fn(),
  },
  argTypes: { variant: { control: 'select', options: ['simple', 'validation', 'multi'] } },
} satisfies Meta<typeof InputGroupPrompt>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Multiple-choice question. */
export const Multi: Story = {};

export const Simple: Story = { args: { variant: 'simple' } };

export const WithoutRequest: Story = { args: { variant: 'simple', showRequest: false } };
