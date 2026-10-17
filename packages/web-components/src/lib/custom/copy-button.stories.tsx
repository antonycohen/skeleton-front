import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyButton } from './copy-button';

const meta = {
  title: 'Components/Custom/CopyButton',
  component: CopyButton,
  parameters: { layout: 'centered' },
  args: { value: '..' },
} satisfies Meta<typeof CopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomToast: Story = { args: { toastMessage: 'API key copied' } };

/** Next to the value it copies. */
export const InContext: Story = {
  render: (args) => (
    <div className="flex max-w-lg items-center gap-2 rounded-md border bg-muted px-3 py-1">
      <code className="truncate text-xs">{args.value}</code>
      <CopyButton {...args} />
    </div>
  ),
};
