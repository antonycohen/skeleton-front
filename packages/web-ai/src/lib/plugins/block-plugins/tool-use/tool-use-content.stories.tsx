import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToolUseContent } from './tool-use-content';

const meta = {
  title: 'Patterns/AI/ToolUseContent',
  component: ToolUseContent,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
  args: {
    name: 'invite_member',
    input: { email: 'ines@umbrella.co', role: 'member', team: 'Design' },
  },
} satisfies Meta<typeof ToolUseContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The input arrives as partial JSON while the call streams. */
export const Streaming: Story = {
  args: { input: undefined, partialJson: '{"email": "ines@umbrella.co", "role": "mem', isStreaming: true },
};
